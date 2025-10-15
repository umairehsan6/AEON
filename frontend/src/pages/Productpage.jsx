import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById } from '../services/inventory';
import { addToCart } from '../services/cart';
import { useCart } from '../context/CartContext';
import { useProductRefresh } from '../context/ProductContext';
import { getUserRole } from '../services/authutils';

// Main App component to display the Zara-style product page
const App = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addCount } = useCart();
  const { refreshTrigger } = useProductRefresh();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [sizeInventory, setSizeInventory] = useState({});
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Check if user is admin
  useEffect(() => {
    const userRole = getUserRole();
    setIsAdmin(userRole === 'admin');
  }, []);

  // Fetch product data from API
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getProductById(id);
        const productData = response.data;
        
        // Process inventory data
        let sizesArray = ['ONE SIZE'];
        let inventoryMap = {};
        const sizes = productData.sizes || productData.total_stock_by_sizes;
        
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
        
        setProduct({
          ...productData,
          sizes: sizesArray,
          colors: productData.colors || [{ name: productData.color || 'DEFAULT', code: 'bg-gray-200' }]
        });
        
        setSizeInventory(inventoryMap);
        
        // Reset selected image index when product changes
        setSelectedImageIndex(0);
        
        
        // Set default size (prefer in-stock sizes for all users)
        if (sizesArray.length > 0) {
          // Find first in-stock size - if none available, don't select any
          const inStockSize = sizesArray.find(size => inventoryMap[size] > 0);
          setSelectedSize(inStockSize || '');
        }
        
      } catch (err) {
        console.error('Failed to fetch product:', err);
        setError('Product not found');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id, isAdmin, refreshTrigger]);

  // Helper function to check if a size is available
  const isSizeAvailable = (size) => {
    const quantity = sizeInventory[size] || 0;
    const isAvailable = quantity > 0;
    return isAvailable;
  };

  // Helper function to get size availability text
  const getSizeAvailabilityText = (size) => {
    const quantity = sizeInventory[size] || 0;
    if (isAdmin) return `${quantity} in stock`;
    if (quantity === 0) return 'Out of stock';
    if (quantity <= 5) return `Only ${quantity} left`;
    return 'In stock';
  };

  // Helper functions for image handling
  const getProductImages = () => {
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      return product.images;
    }
    // Fallback to primary_image or image_url for backward compatibility
    if (product.primary_image) {
      return [{ id: 'img_1', url: product.primary_image, alt: product.name, is_primary: true, order: 1 }];
    }
    if (product.image_url && typeof product.image_url === 'string') {
      return [{ id: 'img_1', url: product.image_url, alt: product.name, is_primary: true, order: 1 }];
    }
    return [];
  };

  const getCurrentImage = () => {
    const images = getProductImages();
    if (images.length === 0) return null;
    return images[selectedImageIndex] || images[0];
  };

  const getPlaceholderImage = () => {
    const imageSize = 600;
    const bgColor = (product.color || '').toUpperCase().includes('BLACK') ? '000' : 'EBEBEB';
    const textColor = (product.color || '').toUpperCase().includes('BLACK') ? 'FFF' : '000';
    const placeholderText = (product.name || 'PRODUCT').split(' ').slice(0, 2).join(' ');
    return `https://placehold.co/${imageSize}x${imageSize}/${bgColor}/${textColor}?text=${placeholderText}`;
  };

  const handleAddToCart = async () => {
    if (!product || !selectedSize || addingToCart) return;
    
    // STRICT CHECK: Prevent adding out-of-stock items at all costs (for all users)
    if (!isSizeAvailable(selectedSize)) {
      console.error('Attempted to add out-of-stock item to cart - BLOCKED');
      return; // Don't even show alert, just silently prevent
    }
    
    try {
      setAddingToCart(true);
      await addToCart({ 
        product: product.id, 
        size: selectedSize, 
        quantity: 1 
      });
      
      setAddedToCart(true);
      addCount(1);
      
      // Refresh product data to get updated stock levels
      const response = await getProductById(id);
      const updatedProductData = response.data;
      
      // Update the product state with fresh stock data
      let sizesArray = ['ONE SIZE'];
      let inventoryMap = {};
      const sizes = updatedProductData.sizes || updatedProductData.total_stock_by_sizes;
      
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
      
      setProduct({
        ...updatedProductData,
        sizes: sizesArray,
        colors: updatedProductData.colors || [{ name: updatedProductData.color || 'DEFAULT', code: 'bg-gray-200' }]
      });
      
      setSizeInventory(inventoryMap);
      
      // Reset feedback after delay
      setTimeout(() => {
        setAddedToCart(false);
      }, 2000);
      
    } catch (err) {
      console.error('Failed to add to cart:', err);
      
      // Check if it's an authentication error
      if (err.message && err.message.includes('No authentication token found')) {
        // Redirect to login with current page as return URL
        const currentUrl = window.location.pathname + window.location.search;
        navigate(`/login?returnTo=${encodeURIComponent(currentUrl)}`);
        return;
      }
      
      // Check if it's a 401 Unauthorized error
      if (err.response && err.response.status === 401) {
        // Redirect to login with current page as return URL
        const currentUrl = window.location.pathname + window.location.search;
        navigate(`/login?returnTo=${encodeURIComponent(currentUrl)}`);
        return;
      }
      
      // Check if it's a stock error
      if (err.response && err.response.data && err.response.data.error) {
        alert(err.response.data.error);
      } else {
        alert('Failed to add item to cart. Please try again.');
      }
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-gray-800 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-light tracking-wider mb-2">LOADING PRODUCT...</h2>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white text-gray-800 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-light tracking-wider mb-2">PRODUCT NOT FOUND</h2>
          <button 
            onClick={() => navigate('/products')}
            className="mt-4 px-6 py-2 bg-black text-white uppercase tracking-wider hover:bg-gray-800 transition-colors"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  return (
    // Outer container for the entire page, ensuring clean white background and Inter font (default in Tailwind setup)
    <div className="min-h-screen bg-white text-gray-800 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row">
        
        {/* === LEFT SIDE: IMAGE/CANVAS CONTAINER (Dominates on desktop) === */}
        <div className="lg:w-3/5 xl:w-2/3 h-auto lg:pr-12">
          {/* Main Product Image/Canvas Area - Styled for high contrast and large scale */}
          <div className="w-full aspect-square max-h-[500px] bg-gray-100 mb-6 flex items-center justify-center border border-gray-200 shadow-sm rounded-lg overflow-hidden relative">
            {(() => {
              const currentImage = getCurrentImage();
              const images = getProductImages();
              
              if (currentImage) {
                return (
                  <img 
                    src={currentImage.url} 
                    alt={currentImage.alt || product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = getPlaceholderImage();
                    }}
                  />
                );
              }
              
              return (
                <div className="text-xl font-medium text-gray-500 p-10 text-center">
                  {product.name}<br />
                  <span className="text-sm">(No image available)</span>
                </div>
              );
            })()}
            
            {/* Image Navigation Arrows (only show if multiple images) */}
            {(() => {
              const images = getProductImages();
              if (images.length > 1) {
                return (
                  <>
                    {/* Previous Image Button */}
                    {selectedImageIndex > 0 && (
                      <button
                        onClick={() => setSelectedImageIndex(selectedImageIndex - 1)}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-black p-2 rounded-full shadow-lg transition-all duration-200"
                        aria-label="Previous image"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                    )}
                    
                    {/* Next Image Button */}
                    {selectedImageIndex < images.length - 1 && (
                      <button
                        onClick={() => setSelectedImageIndex(selectedImageIndex + 1)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-black p-2 rounded-full shadow-lg transition-all duration-200"
                        aria-label="Next image"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    )}
                  </>
                );
              }
              return null;
            })()}
          </div>

          {/* Image Thumbnail Grid */}
          {(() => {
            const images = getProductImages();
            if (images.length > 1) {
              return (
                <div className="grid grid-cols-3 gap-3">
                  {images.map((image, index) => (
                    <button
                      key={image.id}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`aspect-square bg-gray-50 border-2 rounded-md overflow-hidden transition-all duration-200 ${
                        selectedImageIndex === index 
                          ? 'border-black shadow-md' 
                          : 'border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      <img 
                        src={image.url} 
                        alt={image.alt || `${product.name} view ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = getPlaceholderImage();
                        }}
                      />
                    </button>
                  ))}
                </div>
              );
            }
            return null;
          })()}
        </div>
        
        {/* === RIGHT SIDE: PRODUCT INFO & CTA (Sticky on desktop) === */}
        <div className="lg:w-2/5 xl:w-1/3 lg:sticky lg:top-8 h-fit mt-8 lg:mt-0">
          
          {/* Product Title and Ref */}
          <h1 className="text-3xl font-light tracking-wider mb-1">{product.name}</h1>
          <p className="text-sm text-gray-500 mb-4">REF: {product.id}</p>
          
          <div className="my-4 border-t border-gray-200" />

          {/* Price */}
          <div className="text-2xl font-normal mb-6">${Number(product.price || 0).toFixed(2)}</div>

          {/* Color Selector */}
          {product.colors && product.colors.length > 1 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-2 uppercase">COLOR: <span className="font-normal">{product.colors[0].name}</span></h3>
              <div className="flex space-x-2">
                {product.colors.map((color) => (
                  <div
                    key={color.name}
                    className={`w-6 h-6 rounded-full cursor-pointer transition-all ${color.code} ${
                      color.name === product.colors[0].name 
                        ? 'ring-2 ring-black ring-offset-2' 
                        : 'hover:opacity-75 border border-gray-200'
                    }`}
                    aria-label={`Select color ${color.name}`}
                  ></div>
                ))}
              </div>
            </div>
          )}

          {/* Size Selector */}
          <div className="mb-8">
            <h3 className="text-sm font-medium mb-2 uppercase">SIZE</h3>
            <div className="grid grid-cols-5 gap-2 text-center">
              {product.sizes.map((size) => {
                const isAvailable = isSizeAvailable(size);
                const isSelected = size === selectedSize;
                const quantity = sizeInventory[size] || 0;
                
                
                return (
                  <button
                    key={size}
                    onClick={() => {
                      // Only allow selection if size is available
                      if (isAvailable) {
                        setSelectedSize(size);
                      }
                    }}
                    disabled={!isAvailable}
                    className={`py-2 text-sm border-2 transition-colors duration-150 rounded-sm relative ${
                      isSelected
                        ? 'bg-black text-white border-black'
                        : isAvailable
                          ? 'bg-white text-gray-800 border-gray-200 hover:border-black'
                          : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                    }`}
                    title={getSizeAvailabilityText(size)}
                  >
                    {size}
                    {!isAvailable && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                    )}
                  </button>
                );
              })}
            </div>
            
            {/* Size availability info */}
            {selectedSize && (
              <div className="mt-2 text-xs text-gray-600">
                {getSizeAvailabilityText(selectedSize)}
              </div>
            )}
            
            
            {/* Size guide links */}
            <div className="flex justify-between text-xs mt-3">
              <button className="underline hover:text-black text-gray-600">SIZE GUIDE</button>
              <button className="underline hover:text-black text-gray-600">FIND YOUR SIZE</button>
            </div>
          </div>

          {/* Call-to-Action Button - The prominent ZARA black button */}
          <button
            onClick={(!isSizeAvailable(selectedSize)) ? undefined : handleAddToCart}
            disabled={addingToCart || !selectedSize || !isSizeAvailable(selectedSize)}
            className={`w-full py-4 text-white text-lg font-medium tracking-widest uppercase transition-colors duration-200 rounded-sm shadow-lg mb-6 ${
              addedToCart 
                ? 'bg-green-600 hover:bg-green-700' 
                : addingToCart 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : !isSizeAvailable(selectedSize)
                    ? 'bg-gray-400 cursor-not-allowed pointer-events-none'
                    : 'bg-black hover:bg-gray-800'
            }`}
            style={{
              pointerEvents: !isSizeAvailable(selectedSize) ? 'none' : 'auto'
            }}
          >
            {addedToCart 
              ? 'ADDED TO BAG!' 
              : addingToCart 
                ? 'ADDING...' 
                : !isSizeAvailable(selectedSize)
                  ? 'OUT OF STOCK'
                  : 'ADD TO BAG'
            }
          </button>
          
          {/* Details and Information Panels */}
          
          <div className="my-6 border-t border-gray-100" />

          {/* Details Section */}
          <div className="space-y-4">
            <h3 className="text-base font-medium">DETAILS</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {product.description || 'No description available for this product.'}
            </p>
            
            {product.composition && product.composition.length > 0 && (
              <>
                <h3 className="text-base font-medium pt-4">COMPOSITION</h3>
                <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
                  {product.composition.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </>
            )}
            
            {/* Product Info */}
            <div className="pt-4">
              <h3 className="text-base font-medium mb-2">PRODUCT INFO</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p><span className="font-medium">Category:</span> {product.category_name || 'N/A'}</p>
                <p><span className="font-medium">Subcategory:</span> {product.subcategory_name || 'N/A'}</p>
                <p><span className="font-medium">Color:</span> {product.color || 'N/A'}</p>
                <p><span className="font-medium">Status:</span> {product.is_live ? 'Live' : 'Draft'}</p>
              </div>
            </div>
          </div>
          
          <div className="my-6 border-t border-gray-100" />
          
          {/* Collapsible Info Links with Content */}
          <InfoLink title="IN-STORE AVAILABILITY">
            <div className="space-y-3">
              <p className="font-medium text-gray-800">Check availability at our stores:</p>
              <div className="space-y-2">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="font-medium">Downtown Store</span>
                  <span className="text-green-600 font-medium">In Stock</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="font-medium">Mall Location</span>
                  <span className="text-green-600 font-medium">In Stock</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="font-medium">Outlet Store</span>
                  <span className="text-orange-600 font-medium">Limited Stock</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="font-medium">Airport Store</span>
                  <span className="text-red-600 font-medium">Out of Stock</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                Store availability is updated every 2 hours. Please call ahead to confirm stock before visiting.
              </p>
            </div>
          </InfoLink>
          
          <InfoLink title="SHIPPING, EXCHANGES AND RETURNS">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-800 mb-2">Shipping</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Free standard shipping on orders over $50</li>
                  <li>• Express shipping (1-2 business days): $15</li>
                  <li>• Standard shipping (3-5 business days): $8</li>
                  <li>• International shipping available to select countries</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-800 mb-2">Returns & Exchanges</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• 30-day return policy for unworn items with tags</li>
                  <li>• Free returns within 30 days of purchase</li>
                  <li>• Exchanges available in-store or online</li>
                  <li>• Final sale items cannot be returned</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-800 mb-2">Size Guide</h4>
                <p className="text-sm text-gray-600">
                  Not sure about your size? Use our size guide or visit any of our stores for a free fitting consultation.
                </p>
              </div>
              
              <p className="text-xs text-gray-500 mt-3">
                For more information, contact our customer service at 1-800-AEON-HELP or visit our FAQ section.
              </p>
            </div>
          </InfoLink>
          
        </div>
        
      </div>
      
    </div>
  );
};

// Collapsible info component with content
const InfoLink = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left text-sm font-medium py-3 flex justify-between items-center hover:bg-gray-50 transition-colors"
      >
        <span className="uppercase">{title}</span>
        <svg 
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
        </svg>
      </button>
      {isOpen && (
        <div className="pb-4 text-sm text-gray-600 leading-relaxed">
          {children}
        </div>
      )}
    </div>
  );
};

export default App;
