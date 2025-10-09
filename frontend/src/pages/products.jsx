import React, { useState, useEffect, useMemo } from 'react';
import ProductUserCard from '../components/ProductUserCard';
import { getProducts } from '../services/inventory';

// Products are fetched from backend

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
 * Main component for the product list page.
 */
const ProductListPage = () => {
    // State for the currently selected sort option
    const [sortOption, setSortOption] = useState('recent');
    // Source products (from API) and displayed products (after sort)
    const [allProducts, setAllProducts] = useState([]);
    const [displayedProducts, setDisplayedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    
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

    // Load all products from backend once
    useEffect(() => {
        let mounted = true;
        const load = async () => {
            try {
                const res = await getProducts();
                const data = Array.isArray(res?.data) ? res.data : (res?.data?.results || []);
                // Normalize minimal fields expected by ProductUserCard
                const normalized = data.map(p => {
                    let sizesArray = ['ONE SIZE'];
                    const sizes = p.sizes ?? p.sizes_available;
                    if (Array.isArray(sizes)) {
                        // Could be array of strings or array of objects { size, quantity }
                        if (sizes.length > 0 && typeof sizes[0] === 'object') {
                            sizesArray = sizes.map(s => String(s.size ?? s.label ?? 'ONE'));
                        } else {
                            sizesArray = sizes.map(s => String(s));
                        }
                    } else if (sizes && typeof sizes === 'object') {
                        // Object map like { S: 10, M: 5 }
                        sizesArray = Object.keys(sizes);
                    }

                    return {
                        id: p.id,
                        name: p.name,
                        price: Number(p.price || 0),
                        color: p.color || 'WHITE',
                        sizes_available: sizesArray,
                        sizes: p.sizes,
                        total_stock_by_sizes: p.total_stock_by_sizes,
                        date: p.created_at || p.date || new Date().toISOString(),
                    };
                });
                if (mounted) setAllProducts(normalized);
            } catch (e) {
                console.error('Failed to load products', e);
                if (mounted) setAllProducts([]);
            } finally {
                if (mounted) setLoading(false);
            }
        };
        load();
        return () => { mounted = false; };
    }, []);

    // Recompute displayed products when sort option or data changes
    useEffect(() => {
        const sorted = handleSort(allProducts);
        setDisplayedProducts(sorted);
    }, [allProducts, sortOption, handleSort]);

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
                {loading ? (
                    <div className="text-center py-20">
                        <h2 className="text-xl font-light tracking-wider mb-2">LOADING PRODUCTS...</h2>
                    </div>
                ) : displayedProducts.length > 0 ? (
                    <div id="product-grid" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl-grid-cols-5 gap-4 sm:gap-6 md:gap-8">
                        {displayedProducts.map(product => (
                            <ProductUserCard key={product.id} product={product} />
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
