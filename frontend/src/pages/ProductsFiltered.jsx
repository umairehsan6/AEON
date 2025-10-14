import React, { useState, useEffect } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import { getFilteredProducts } from '../services/inventory';
import ProductUserCard from '../components/ProductUserCard';

const ProductsFiltered = () => {
  const [searchParams] = useSearchParams();
  const params = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        // Extract filters from URL parameters and route params
        const currentFilters = {
          gender: params.category || searchParams.get('gender') || '',
          category: params.category || searchParams.get('category') || '',
          subcategory: searchParams.get('subcategory') || '',
          collection: params.collectionName || searchParams.get('collection') || '',
          search: searchParams.get('search') || '',
          is_live: true
        };

        // Determine gender from URL path
        const pathname = window.location.pathname;
        if (pathname.startsWith('/women')) {
          currentFilters.gender = 'women';
        } else if (pathname.startsWith('/men')) {
          currentFilters.gender = 'men';
        } else if (pathname.startsWith('/kids')) {
          currentFilters.gender = 'kids';
        }

        setFilters(currentFilters);

        console.log('Fetching products with filters:', currentFilters);
        const response = await getFilteredProducts(currentFilters);
        
        setProducts(response.data.products || []);
        console.log('Products loaded:', response.data.products?.length || 0);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchParams, params]);

  const getPageTitle = () => {
    if (filters.collection) {
      return `${filters.collection.toUpperCase()} COLLECTION`;
    }
    if (filters.subcategory) {
      return `${filters.gender.toUpperCase()} ${filters.subcategory.toUpperCase()}`;
    }
    if (filters.category) {
      return `${filters.gender.toUpperCase()} ${filters.category.toUpperCase()}`;
    }
    if (filters.gender) {
      return `${filters.gender.toUpperCase()}`;
    }
    if (filters.search) {
      return `SEARCH RESULTS FOR "${filters.search.toUpperCase()}"`;
    }
    return 'ALL PRODUCTS';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-light tracking-wider uppercase text-center">
            {getPageTitle()}
          </h1>
          {products.length > 0 && (
            <p className="text-center text-gray-600 mt-2">
              {products.length} {products.length === 1 ? 'product' : 'products'} found
            </p>
          )}
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-600 text-lg">No products found matching your criteria.</p>
            <a 
              href="/" 
              className="inline-block mt-4 bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition"
            >
              Continue Shopping
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductUserCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      {/* Debug Info (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-sm">
          <h4 className="font-bold mb-2">Debug Info:</h4>
          <pre className="whitespace-pre-wrap">
            {JSON.stringify(filters, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default ProductsFiltered;
