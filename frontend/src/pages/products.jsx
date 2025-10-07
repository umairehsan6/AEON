import React, { useState, useEffect, useMemo } from 'react';

// --- MOCK DATA (Simulating Django Backend Output) ---
// Note: MOCK_CATEGORIES are kept for data consistency but are not used for filtering 
// in this simplified view, as per the user's latest request.
const MOCK_PRODUCTS = [
    { id: 101, name: 'KNIT MAXI DRESS', price: 69.90, category_slug: 'tops', subcategory_slug: 'sweaters', color: 'BEIGE', stock: 15, date: '2025-10-01', sizes_available: ['XS', 'S', 'M', 'L'] },
    { id: 102, name: 'OVERSIZE LINEN SHIRT', price: 45.90, category_slug: 'tops', subcategory_slug: 't-shirts', color: 'WHITE', stock: 22, date: '2025-10-03', sizes_available: ['S', 'M', 'L', 'XL'] },
    { id: 103, name: 'HIGH-WAISTED SLIM JEANS', price: 59.90, category_slug: 'bottoms', subcategory_slug: 'jeans', color: 'DARK WASH', stock: 18, date: '2025-09-28', sizes_available: ['28', '30', '32', '34'] },
    { id: 104, name: 'WOOL BLEND SWEATER', price: 89.90, category_slug: 'tops', subcategory_slug: 'sweaters', color: 'BLACK', stock: 10, date: '2025-10-04', sizes_available: ['M', 'L', 'XL'] },
    { id: 105, name: 'FAUX LEATHER SKIRT', price: 39.90, category_slug: 'bottoms', subcategory_slug: 'skirts', color: 'BLACK', stock: 30, date: '2025-10-02', sizes_available: ['XS', 'S', 'M'] },
    { id: 106, name: 'BASIC COTTON TEE', price: 15.90, category_slug: 'tops', subcategory_slug: 't-shirts', color: 'GRAY', stock: 45, date: '2025-09-25', sizes_available: ['S', 'M', 'L', 'XL'] },
    { id: 107, name: 'MINIMALIST CROSSBODY BAG', price: 79.90, category_slug: 'accessories', subcategory_slug: 'bags', color: 'WHITE', stock: 12, date: '2025-10-05', sizes_available: ['ONE SIZE'] },
    { id: 108, name: 'DELICATE CHAIN NECKLACE', price: 22.90, category_slug: 'accessories', subcategory_slug: 'jewelry', color: 'GOLD', stock: 50, date: '2025-09-30', sizes_available: ['ADJUSTABLE'] },
];

/**
 * Custom hook to manage the state and logic for the Add to Cart button feedback.
 */
const useCartFeedback = (productId) => {
    const [feedback, setFeedback] = useState('QUICK ADD');
    const [isAdding, setIsAdding] = useState(false);

    const handleAction = (size) => {
        if (isAdding) return;

        setIsAdding(true);
        setFeedback('ADDED!');
        
        console.log(`Product added to cart: ID ${productId}, Size: ${size}`);

        // Revert button text and style after a short delay
        setTimeout(() => {
            setFeedback('QUICK ADD');
            setIsAdding(false);
        }, 800);
    };

    return { feedback, isAdding, handleAction };
};


/**
 * Renders a single product card with image, price, size selector, and add-to-cart button.
 */
const ProductCard = ({ product }) => {
    const [selectedSize, setSelectedSize] = useState(product.sizes_available[0]);
    const { feedback, isAdding, handleAction } = useCartFeedback(product.id);
    
    // Placeholder Image URL logic (moved to component scope)
    const imageSize = 400;
    const bgColor = product.color.includes('BLACK') ? '000' : 'EBEBEB';
    const textColor = product.color.includes('BLACK') ? 'FFF' : '000';
    const placeholderText = product.name.split(' ').slice(0, 2).join(' ');
    const imageUrl = `https://placehold.co/${imageSize}x${imageSize}/${bgColor}/${textColor}?text=${placeholderText}`;

    const buttonClass = isAdding
        ? 'bg-green-600 text-white border-green-600 pointer-events-none'
        : 'bg-white text-black border-black hover:bg-black hover:text-white';

    const handleSelectChange = (e) => {
        setSelectedSize(e.target.value);
    };

    return (
        <div className="product-card group cursor-pointer">
            <div className="relative w-full aspect-square bg-gray-50 mb-3 overflow-hidden shadow-sm">
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
                <p className="text-sm font-bold mt-0.5 mb-2">${product.price.toFixed(2)}</p>
                
                {/* Size Selector */}
                <div className="mb-3">
                    <select 
                        value={selectedSize}
                        onChange={handleSelectChange}
                        className="w-full border border-black text-black text-xs py-2 px-2 uppercase appearance-none bg-white focus:ring-1 focus:ring-black focus:border-black transition duration-200"
                        style={{
                            backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3E%3Cpath d='M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z'/%3E%3C/svg%3E")`,
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'right 0.7rem center',
                            backgroundSize: '0.8em',
                        }}
                    >
                        {product.sizes_available.map(size => (
                            <option key={size} value={size}>{size}</option>
                        ))}
                    </select>
                </div>
                
                {/* Add to Cart Button */}
                <button 
                    onClick={() => handleAction(selectedSize)}
                    disabled={isAdding}
                    className={`add-to-cart-btn w-full border text-xs py-2 tracking-widest uppercase transition duration-200 rounded-none ${buttonClass}`}
                >
                    {feedback}
                </button>
            </div>
        </div>
    );
};


/**
 * Main component for the product list page.
 */
const ProductListPage = () => {
    // State for the currently selected sort option
    const [sortOption, setSortOption] = useState('recent');
    // State for the products currently displayed in the grid
    const [displayedProducts, setDisplayedProducts] = useState([]);
    
    // Memoized sorting function to optimize performance
    const handleSort = useMemo(() => {
        return (products) => {
            const sortedProducts = [...products];
            sortedProducts.sort((a, b) => {
                switch (sortOption) {
                    case 'low-high':
                        return a.price - b.price;
                    case 'high-low':
                        return b.price - a.price;
                    case 'recent':
                    default:
                        // Sort by date (newest first)
                        return new Date(b.date) - new Date(a.date);
                }
            });
            return sortedProducts;
        };
    }, [sortOption]);

    // Effect to re-sort and update the displayed products whenever the sort option changes
    useEffect(() => {
        const sorted = handleSort(MOCK_PRODUCTS);
        setDisplayedProducts(sorted);
    }, [sortOption, handleSort]);

    const handleSortChange = (e) => {
        setSortOption(e.target.value);
    };

    return (
        <div className="font-sans bg-white text-gray-800">
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
                
                {/* Filter Bar (Minimalist & Elevated) */}
                <div className="flex flex-col md:flex-row justify-between items-center py-4 mb-8 border-b border-gray-300 sticky top-0 bg-white z-10 shadow-sm">
                    
                    <div className="text-sm font-light uppercase tracking-wider mb-4 md:mb-0">
                        <span id="product-count">{displayedProducts.length}</span> Items Available
                        <span id="page-title" className="ml-2 font-medium text-sm block md:inline-block md:ml-4 border-l pl-4 border-gray-300">
                            ALL PRODUCTS
                        </span>
                    </div>

                    {/* Filters: Only Sort remains */}
                    <div className="flex flex-wrap justify-center md:justify-end gap-3 md:gap-6 text-sm">
                        
                        {/* Sort Filter */}
                        <select 
                            id="sort-filter" 
                            value={sortOption}
                            onChange={handleSortChange}
                            className="p-2 border border-gray-300 text-gray-800 font-medium uppercase focus:ring-1 focus:ring-black focus:border-black transition duration-200 appearance-none bg-white"
                            style={{
                                backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3E%3Cpath d='M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z'/%3E%3C/svg%3E")`,
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'right 0.7rem center',
                                backgroundSize: '0.8em',
                                cursor: 'pointer',
                            }}
                        >
                            <option value="recent">Sort: Most Recent</option>
                            <option value="low-high">Sort: Price Low to High</option>
                            <option value="high-low">Sort: Price High to Low</option>
                        </select>
                    </div>
                </div>

                {/* Product Grid */}
                {displayedProducts.length > 0 ? (
                    <div id="product-grid" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 md:gap-8">
                        {displayedProducts.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    /* Empty State Message */
                    <div id="empty-state" className="text-center py-20">
                        <h2 className="text-xl font-light tracking-wider mb-2">NO PRODUCTS FOUND</h2>
                        <p className="text-gray-500">Try adjusting your sorting options.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductListPage;
