import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { addToCart } from '../services/cart';
import { useCart } from '../context/CartContext';
import { getUserRole } from '../services/authutils';

const ProductUserCard = ({ product }) => {
    const navigate = useNavigate();
    const [selectedSize, setSelectedSize] = useState(product.sizes_available?.[0] || 'ONE');
    const imageSize = 400;
    const bgColor = (product.color || '').toUpperCase().includes('BLACK') ? '000' : 'EBEBEB';
    const textColor = (product.color || '').toUpperCase().includes('BLACK') ? 'FFF' : '000';
    const placeholderText = (product.name || 'PRODUCT').split(' ').slice(0, 2).join(' ');
    const imageUrl = `https://placehold.co/${imageSize}x${imageSize}/${bgColor}/${textColor}?text=${placeholderText}`;

    const { refreshCount, addCount } = useCart();
    const [added, setAdded] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [sizeInventory, setSizeInventory] = useState({});

    // Check if user is admin
    React.useEffect(() => {
        const userRole = getUserRole();
        setIsAdmin(userRole === 'admin');
    }, []);

    // Process inventory data from product
    React.useEffect(() => {
        if (product) {
            let inventoryMap = {};
            const sizes = product.sizes || product.total_stock_by_sizes;
            
            
            if (Array.isArray(sizes)) {
                if (sizes.length > 0 && typeof sizes[0] === 'object') {
                    // Array of objects like [{size: 'S', quantity: 10}]
                    inventoryMap = sizes.reduce((acc, item) => {
                        acc[String(item.size || item.label || 'ONE')] = parseInt(item.quantity || 0);
                        return acc;
                    }, {});
                } else {
                    // Array of strings - assume all available
                    sizes.forEach(size => {
                        inventoryMap[size] = 999;
                    });
                }
            } else if (sizes && typeof sizes === 'object') {
                // Object map like {S: 10, M: 5}
                Object.entries(sizes).forEach(([size, quantity]) => {
                    inventoryMap[size] = parseInt(quantity || 0);
                });
            }
            
            setSizeInventory(inventoryMap);
        }
    }, [product]);

    const handleImageClick = () => {
        navigate(`/product/${product.id}`);
    };

    // Helper function to check if a size is available
    const isSizeAvailable = (size) => {
        const quantity = sizeInventory[size] || 0;
        const isAvailable = quantity > 0;
        return isAvailable;
    };

    // Set default size to first available size for all users
    React.useEffect(() => {
        if (product.sizes_available && product.sizes_available.length > 0 && Object.keys(sizeInventory).length > 0) {
            const firstAvailableSize = product.sizes_available.find(size => isSizeAvailable(size));
            if (firstAvailableSize && firstAvailableSize !== selectedSize) {
                setSelectedSize(firstAvailableSize);
            } else if (!firstAvailableSize) {
                // If no sizes are available, don't select any
                setSelectedSize('');
            }
        }
    }, [product.sizes_available, sizeInventory]);

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
        }
    };

    const buttonLabel = useMemo(() => (added ? 'ADDED!' : 'QUICK ADD'), [added]);

    return (
        <div className="product-card group cursor-pointer">
            <div className="relative w-full aspect-square bg-gray-50 mb-3 overflow-hidden shadow-sm cursor-pointer" onClick={handleImageClick}>
                <img 
                    src={imageUrl} 
                    alt={product.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    onError={(e) => e.target.src = `https://placehold.co/${imageSize}x${imageSize}/FFF/000?text=NO+IMAGE`}
                />
                <div className="absolute inset-x-0 bottom-0 py-1.5 text-center bg-white/80 backdrop-blur-sm text-xs font-medium tracking-wider uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    View Details
                </div>
            </div>
            <div className="text-left py-1">
                <p className="text-sm uppercase font-normal tracking-wide">{product.name}</p>
                <p className="text-sm font-bold mt-0.5 mb-2">${Number(product.price).toFixed(2)}</p>

                {Array.isArray(product.sizes_available) && product.sizes_available.length > 0 && (
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
                            {product.sizes_available.map(size => {
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


