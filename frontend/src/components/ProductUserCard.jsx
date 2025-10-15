import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { addToCart } from '../services/cart';
import { useCart } from '../context/CartContext';
import { useProductRefresh } from '../context/ProductContext';
import { getUserRole } from '../services/authutils';

const ProductUserCard = ({ product }) => {
    const navigate = useNavigate();
    const [selectedSize, setSelectedSize] = useState('');
    const imageSize = 400;
    const bgColor = (product.color || '').toUpperCase().includes('BLACK') ? '000' : 'EBEBEB';
    const textColor = (product.color || '').toUpperCase().includes('BLACK') ? 'FFF' : '000';
    const placeholderText = (product.name || 'PRODUCT').split(' ').slice(0, 2).join(' ');
    const placeholderImageUrl = `https://placehold.co/${imageSize}x${imageSize}/${bgColor}/${textColor}?text=${placeholderText}`;
    
    // Get primary image or first image from the images array
    const getDisplayImage = () => {
        if (product.images && Array.isArray(product.images) && product.images.length > 0) {
            // Find primary image or return first image
            const primaryImg = product.images.find(img => img.is_primary);
            return primaryImg ? primaryImg.url : product.images[0].url;
        }
        // Fallback to primary_image field for backward compatibility
        if (product.primary_image) {
            return product.primary_image;
        }
        // Fallback to placeholder
        return placeholderImageUrl;
    };
    
    const displayImageUrl = getDisplayImage();

    const { refreshCount, addCount } = useCart();
    const { refreshTrigger } = useProductRefresh();
    const [added, setAdded] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [sizeInventory, setSizeInventory] = useState({});

    // Check if user is admin
    React.useEffect(() => {
        const userRole = getUserRole();
        setIsAdmin(userRole === 'admin');
    }, []);

    // Process inventory data from product - same logic as Productpage.jsx
    React.useEffect(() => {
        if (product) {
            let sizesArray = ['ONE SIZE'];
            let inventoryMap = {};
            const sizes = product.sizes || product.total_stock_by_sizes;
            
            if (Array.isArray(sizes)) {
                if (sizes.length > 0 && typeof sizes[0] === 'object') {
                    // Array of objects like [{size: 'S', quantity: 10}]
                    sizesArray = sizes.map(s => String(s.size || s.label || 'ONE'));
                    inventoryMap = sizes.reduce((acc, item) => {
                        acc[String(item.size || item.label || 'ONE')] = parseInt(item.quantity || 0);
                        return acc;
                    }, {});
                } else {
                    // Array of strings
                    sizesArray = sizes.map(s => String(s));
                    // If no quantity info, assume all sizes are available
                    sizesArray.forEach(size => {
                        inventoryMap[size] = 999; // Default high number for sizes without quantity
                    });
                }
            } else if (sizes && typeof sizes === 'object') {
                // Object map like {S: 10, M: 5}
                sizesArray = Object.keys(sizes);
                Object.entries(sizes).forEach(([size, quantity]) => {
                    inventoryMap[size] = parseInt(quantity || 0);
                });
            }
            
            console.log('Processed inventory for product:', product.name, {
                originalSizes: sizes,
                sizesArray: sizesArray,
                processedInventoryMap: inventoryMap,
                refreshTrigger
            });
            setSizeInventory(inventoryMap);
            
            // Set default size to first in-stock size
            if (sizesArray.length > 0) {
                const inStockSize = sizesArray.find(size => inventoryMap[size] > 0);
                setSelectedSize(inStockSize || '');
            }
        }
    }, [product, refreshTrigger]);

    const handleImageClick = () => {
        navigate(`/product/${product.id}`);
    };

    // Helper function to check if a size is available
    const isSizeAvailable = (size) => {
        const quantity = sizeInventory[size] || 0;
        const isAvailable = quantity > 0;
        
        // Debug logging
        console.log(`Checking size availability for "${size}":`, {
            sizeInventory,
            quantity,
            isAvailable,
            productName: product.name
        });
        
        return isAvailable;
    };


    const handleAdd = async () => {
        // STRICT CHECK: Prevent adding out-of-stock items at all costs (for all users)
        if (!isSizeAvailable(selectedSize)) {
            console.error('Attempted to add out-of-stock item to cart from product card - BLOCKED');
            return; // Don't even show alert, just silently prevent
        }
        
        try {
            await addToCart({ product: product.id, size: selectedSize, quantity: 1 });
            setAdded(true);
            addCount(1);
            setTimeout(() => setAdded(false), 800);
        } catch (e) {
            console.error('Failed to add to cart', e);
            // Check if it's an authentication error
            if (e.message && e.message.includes('No authentication token found')) {
                // Redirect to login with current page as return URL
                const currentUrl = window.location.pathname + window.location.search;
                navigate(`/login?returnTo=${encodeURIComponent(currentUrl)}`);
                return;
            }
            
            // Check if it's a 401 Unauthorized error
            if (e.response && e.response.status === 401) {
                // Redirect to login with current page as return URL
                const currentUrl = window.location.pathname + window.location.search;
                navigate(`/login?returnTo=${encodeURIComponent(currentUrl)}`);
                return;
            }
        }
    };

    const buttonLabel = useMemo(() => (added ? 'ADDED!' : 'QUICK ADD'), [added]);

    return (
        <div className="product-card group cursor-pointer">
            <div className="relative w-full aspect-square bg-gray-50 mb-3 overflow-hidden shadow-sm cursor-pointer" onClick={handleImageClick}>
                <img 
                    src={displayImageUrl} 
                    alt={product.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    onError={(e) => e.target.src = placeholderImageUrl}
                />
                <div className="absolute inset-x-0 bottom-0 py-1.5 text-center bg-white/80 backdrop-blur-sm text-xs font-medium tracking-wider uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    View Details
                </div>
            </div>
            <div className="text-left py-1">
                <p className="text-sm uppercase font-normal tracking-wide">{product.name}</p>
                <p className="text-sm font-bold mt-0.5 mb-2">${Number(product.price).toFixed(2)}</p>

                {Object.keys(sizeInventory).length > 0 && (
                    <div className="mb-3">
                        <select 
                            value={selectedSize}
                            onChange={(e) => setSelectedSize(e.target.value)}
                            className="w-full border border-black text-black text-xs py-2 px-2 uppercase appearance-none bg-white focus:ring-1 focus:ring-black focus:border-black transition duration-200"
                            style={{
                                backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3E%3Cpath d='M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z'/%3E%3C/svg%3E")`,
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'right 0.7rem center',
                                backgroundSize: '0.8em',
                            }}
                        >
                            {Object.keys(sizeInventory).map(size => {
                                const isAvailable = isSizeAvailable(size);
                                return (
                                    <option 
                                        key={size} 
                                        value={size}
                                        disabled={!isAvailable}
                                        style={{
                                            color: isAvailable ? 'black' : 'gray',
                                            backgroundColor: isAvailable ? 'white' : '#f5f5f5'
                                        }}
                                    >
                                        {size} {!isAvailable ? '(Out of Stock)' : ''}
                                    </option>
                                );
                            })}
                        </select>
                    </div>
                )}

                <button 
                    onClick={(!isSizeAvailable(selectedSize)) ? undefined : handleAdd}
                    disabled={!isSizeAvailable(selectedSize)}
                    className={`w-full border text-xs py-2 tracking-widest uppercase transition duration-200 rounded-none ${
                        !isSizeAvailable(selectedSize)
                            ? 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed pointer-events-none'
                            : 'bg-white text-black border-black hover:bg-black hover:text-white'
                    }`}
                    style={{
                        pointerEvents: !isSizeAvailable(selectedSize) ? 'none' : 'auto'
                    }}
                >
                    {!isSizeAvailable(selectedSize) ? 'OUT OF STOCK' : buttonLabel}
                </button>
                
            </div>
        </div>
    );
};

export default ProductUserCard;


