import { useState, useEffect } from 'react';
import { Plus, Layers, Package, Zap, Pencil } from 'lucide-react'; // Added Pencil icon
import { 
    postCategories, 
    getCategories, 
    postSubCategories, 
    getSubCategories,
    getSubCategoriesByCategory,
    postProducts,
    getProducts,
    updateProduct,
    deleteProduct
} from '../services/inventory';

// --- CONSTANTS ---
const ADULT_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL' , "ONE SIZE"]; // Standard sizes
const SHOE_SIZES = ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46']; // Shoe sizes
const KIDS_SIZES = ['2-3Y', '4-5Y', '6-7Y', '8-9Y', '10-11Y', '12-13Y']; // Age-based sizes
const GENDER_OPTIONS = [
    { name: 'WOMAN', key: 'woman' },
    { name: 'MAN', key: 'man' },
    { name: 'KIDS', key: 'kids' },
];

const INITIAL_PRODUCT_CATEGORIES = [
  {
    name: 'TOPS',
    key: 'tops',
    subcategories: [
      { name: 'T-SHIRTS', key: 't-shirts' },
      { name: 'SHIRTS', key: 'shirts' },
      { name: 'SWEATERS', key: 'sweaters' },
    ],
  },
  {
    name: 'BOTTOMS',
    key: 'bottoms',
    subcategories: [
      { name: 'JEANS', key: 'jeans' },
      { name: 'TROUSERS', key: 'trousers' },
      { name: 'SHORTS', key: 'shorts' },
    ],
  },
  {
    name: 'ACCESSORIES',
    key: 'accessories',
    subcategories: [
      { name: 'BAGS', key: 'bags' },
      { name: 'JEWELRY', key: 'jewelry' },
    ],
  },
];

// Updated Mock Data to reflect new structure
const INITIAL_PRODUCTS = [
  { id: 1, name: 'SLIM FIT JEANS', price: 49.90, category: 'bottoms', subcategory: 'jeans', gender: 'man', color: 'DARK BLUE', sizes: [{ size: 'M', quantity: 15 }, { size: 'L', quantity: 10 }], totalStock: 25, isLive: true, imageUrl: 'jeans', description: 'Classic slim fit denim jeans in a dark wash.' },
  { id: 2, name: 'OVERSIZE T-SHIRT', price: 19.90, category: 'tops', subcategory: 't-shirts', gender: 'woman', color: 'WHITE', sizes: [{ size: 'XS', quantity: 5 }, { size: 'S', quantity: 10 }, { size: 'M', quantity: 15 }], totalStock: 30, isLive: true, imageUrl: 'tshirt', description: 'Soft cotton oversized t-shirt.' },
  { id: 3, name: 'MINI BACKPACK', price: 35.00, category: 'accessories', subcategory: 'bags', gender: 'kids', color: 'PINK', sizes: [{ size: 'N/A', quantity: 50 }], totalStock: 50, isLive: false, imageUrl: 'backpack', description: 'Small pink backpack for children aged 6-7.' },
  { id: 4, name: 'BROWN LEATHER BAG', price: 99.00, category: 'accessories', subcategory: 'bags', gender: 'woman', color: 'BROWN', sizes: [{ size: 'N/A', quantity: 20 }], totalStock: 20, isLive: true, imageUrl: 'bag', description: 'Premium leather handbag.' },
];

// Utility function
const toKey = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// Helper to determine the correct size set for a gender/department
const getActiveSizes = (genderKey, isAccessory, categoryKey) => {
    if (isAccessory) return ['N/A'];
    if (categoryKey === 'shoes') return SHOE_SIZES;
    if (genderKey === 'kids') return KIDS_SIZES;
    if (genderKey === 'woman' || genderKey === 'man') return ADULT_SIZES;
    return [];
};

// --- 2. ADMIN COMPONENTS ---

/**
 * Modal Component for Editing an existing Product.
 */
const EditProductModal = ({ product, categories, onSave, onClose }) => {
    const [name, setName] = useState(product.name);
    const [price, setPrice] = useState(product.price.toString());
    const [categoryKey, setCategoryKey] = useState(product.category);
    const [subcategoryKey, setSubcategoryKey] = useState(product.subcategory || '');
    const [genderKey] = useState(product.gender); // Gender is fixed for existing products
    const [color, setColor] = useState(product.color);
    const [isLive, setIsLive] = useState(product.isLive);
    const [imageUrl, setImageUrl] = useState(product.imageUrl || '');
    const [description, setDescription] = useState(product.description || '');

    const isAccessory = categoryKey === 'accessories';
    const currentCategory = categories.find(c => c.key === categoryKey);
    const subcategories = currentCategory ? currentCategory.subcategories : [];
    
    // Determine the active size list and initialize quantities based on current product data
    const activeSizes = getActiveSizes(genderKey, isAccessory, categoryKey);
    
    const [sizeQuantities, setSizeQuantities] = useState(() => {
        const stockMap = product.sizes.reduce((acc, s) => ({
            ...acc,
            [s.size]: s.quantity
        }), {});
        
        // Populate current quantities, defaulting to 0 for sizes in the set that weren't stocked
        return activeSizes.reduce((acc, size) => ({
            ...acc,
            [size]: stockMap[size] || 0
        }), {});
    });
    
    // Calculate total stock automatically
    const totalStock = activeSizes.reduce((sum, size) => sum + (parseInt(sizeQuantities[size]) || 0), 0);

    // Handler for quantity change
    const handleQuantityChange = (size, value) => {
        const sanitizedValue = value === '' ? '' : Math.max(0, parseInt(value) || 0); 
        setSizeQuantities(prev => ({
            ...prev,
            [size]: sanitizedValue,
        }));
    };

    const handleSave = (e) => {
        e.preventDefault();

        // Basic validation
        if (!name.trim() || !price || !categoryKey || !genderKey || !color.trim() || totalStock === 0) {
            console.error("Please ensure all required fields are filled and stock is greater than 0.");
            return;
        }

        // Format sizes and quantities for saving
        const sizesToSave = activeSizes
            .map(size => ({ size, quantity: parseInt(sizeQuantities[size]) || 0 }))
            .filter(item => item.quantity > 0);

        const updatedProduct = {
            ...product,
            name: name.toUpperCase(),
            price: parseFloat(price),
            category: categoryKey,
            subcategory: subcategoryKey || '',
            color: color.toUpperCase(),
            sizes: sizesToSave,
            totalStock: totalStock,
            isLive: isLive,
            imageUrl: imageUrl.trim(),
            description: description.trim(),
        };

        onSave(updatedProduct);
        onClose();
    };


    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto transform scale-100 transition-transform duration-300">
                <form onSubmit={handleSave} className="p-6 md:p-8">
                    <div className='flex justify-between items-center border-b pb-3 mb-6'>
                        <h3 className="text-2xl font-bold tracking-wider uppercase">
                            Edit Product: {product.name}
                        </h3>
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="text-gray-500 hover:text-black transition text-3xl font-light"
                        >&times;</button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

                        {/* Basic Identity & Pricing */}
                        <div className='md:col-span-2'>
                            <label className="block text-sm font-medium mb-1">Product Name *</label>
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-md text-sm focus:ring-black focus:border-black" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Price ($) *</label>
                            <input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-md text-sm focus:ring-black focus:border-black" />
                        </div>
                        <div className='flex flex-col justify-end'>
                             <div className='text-base font-extrabold bg-black text-white px-4 py-3 rounded-lg shadow-md text-center'>
                                TOTAL STOCK: {totalStock}
                            </div>
                        </div>

                        {/* Classification (Gender fixed, Category/Subcategory editable) */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Department (Gender)</label>
                            <input type="text" value={product.gender.toUpperCase()} disabled
                                className="w-full p-3 border border-gray-300 bg-gray-100 rounded-md text-sm" />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium mb-1">Product Category *</label>
                            <select value={categoryKey} onChange={(e) => setCategoryKey(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-md text-sm focus:ring-black focus:border-black">
                                {categories.map(cat => (<option key={cat.key} value={cat.key}>{cat.name}</option>))}
                            </select>
                        </div>

                        <div className='md:col-span-2'>
                            <label className="block text-sm font-medium mb-1">Product Type (Subcategory)</label>
                            <select value={subcategoryKey} onChange={(e) => setSubcategoryKey(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-md text-sm focus:ring-black focus:border-black" disabled={subcategories.length === 0}>
                                <option value="">-- Select Product Type --</option>
                                {subcategories.map(sub => (<option key={sub.key} value={sub.key}>{sub.name}</option>))}
                            </select>
                        </div>
                        
                        {/* Aesthetics */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Product Color *</label>
                            <input type="text" value={color} onChange={(e) => setColor(e.target.value)}
                                placeholder="e.g., BLACK, RED, BLUE"
                                className="w-full p-3 border border-gray-300 rounded-md text-sm focus:ring-black focus:border-black" />
                        </div>
                        
                        <div className='md:col-span-3'>
                            <label className="block text-sm font-medium mb-1">Image Reference (URL/Keyword)</label>
                            <input type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}
                                placeholder="e.g., black-dress-model.jpg"
                                className="w-full p-3 border border-gray-300 rounded-md text-sm focus:ring-black focus:border-black" />
                            <p className='text-xs text-gray-500 mt-1'>Enter a keyword or URL for image reference.</p>
                        </div>
                        
                        <div className="md:col-span-4">
                            <label className="block text-sm font-medium mb-1">Product Description</label>
                            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows="3"
                                placeholder="Describe the material, fit, and styling details..."
                                className="w-full p-3 border border-gray-300 rounded-md text-sm focus:ring-black focus:border-black" />
                        </div>
                        
                        {/* Stock Management */}
                        <div className="md:col-span-4 border-t pt-4">
                            <label className="block text-sm font-bold text-gray-800 mb-4">Update Stock by Size</label>
                            
                            <div className="flex flex-wrap gap-4 justify-start">
                                {activeSizes.map(size => (
                                    <div key={size} className='w-24 sm:w-28 flex flex-col items-center bg-gray-50 p-3 rounded-lg border border-gray-200'>
                                        <label className="text-sm font-extrabold uppercase mb-2 text-black">{size}</label>
                                        <input
                                            type="number" min="0"
                                            value={sizeQuantities[size] || ''}
                                            onChange={(e) => handleQuantityChange(size, e.target.value)}
                                            placeholder="0"
                                            className="w-full text-xl text-center font-mono py-1 border-b-2 border-gray-400 focus:border-black focus:outline-none transition-colors"
                                        />
                                    </div>
                                ))}
                            </div>
                            {totalStock === 0 && <p className='text-xs text-red-500 mt-2'>Enter stock quantity for at least one size.</p>}
                        </div>

                        {/* Live Status and Save */}
                        <div className='md:col-span-4 border-t pt-4 flex justify-between items-center'>
                            <label className="flex items-center space-x-3 cursor-pointer bg-white p-2 rounded-lg w-fit">
                                <input
                                    type="checkbox"
                                    checked={isLive}
                                    onChange={(e) => setIsLive(e.target.checked)}
                                    className="h-6 w-6 text-black border-gray-300 rounded focus:ring-black"
                                />
                                <span className="text-base font-semibold text-gray-800">
                                    {isLive ? 'Product is LIVE' : 'Product is DRAFT'}
                                </span>
                            </label>

                            <button 
                                type="submit" 
                                className="bg-black text-white px-8 py-3 rounded-md flex items-center justify-center hover:bg-gray-800 transition tracking-wider uppercase shadow-md disabled:opacity-50"
                                disabled={!categoryKey || totalStock === 0 || !name.trim() || !price || !color.trim()}
                            >
                                <Pencil size={18} className='mr-2' /> Update Product
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

/**
 * Component for adding new categories and subcategories. (Unchanged for this task)
 */
const CategoryManager = ({ categories, setCategories }) => {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [parentCategoryKey, setParentCategoryKey] = useState('');
  const [newSubcategoryName, setNewSubcategoryName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    try {
      setLoading(true);
      setError(null);
      
      const categoryData = { name: newCategoryName.toUpperCase() };
      const response = await postCategories(categoryData);
      
      // Add the new category to local state
      const newCategory = {
        id: response.data.id,
        name: response.data.name,
        key: toKey(response.data.name),
        subcategories: []
      };
      
      setCategories(prev => [...prev, newCategory]);
      setNewCategoryName('');
      
    } catch (err) {
      console.error('Error adding category:', err);
      setError(err.response?.data?.name?.[0] || err.message || 'Failed to add category');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubcategory = async (e) => {
    e.preventDefault();
    if (!parentCategoryKey || !newSubcategoryName.trim()) return;

    try {
      setLoading(true);
      setError(null);
      
      // Find the parent category
      const parentCategory = categories.find(cat => cat.key === parentCategoryKey);
      if (!parentCategory) {
        throw new Error('Parent category not found');
      }
      
      const subcategoryData = {
        name: newSubcategoryName.toUpperCase(),
        category: parentCategory.id
      };
      
      const response = await postSubCategories(subcategoryData);
      
      // Add the new subcategory to local state
      const newSubcategory = {
        id: response.data.id,
        name: response.data.name,
        key: toKey(response.data.name),
        category: response.data.category
      };
      
      setCategories(prev => prev.map(cat => 
        cat.id === parentCategory.id 
          ? { ...cat, subcategories: [...cat.subcategories, newSubcategory] }
          : cat
      ));
      
      setNewSubcategoryName('');
      setParentCategoryKey('');
      
    } catch (err) {
      console.error('Error adding subcategory:', err);
      setError(err.response?.data?.name?.[0] || err.message || 'Failed to add subcategory');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8 bg-white rounded-lg shadow-xl border border-gray-100 max-w-4xl mx-auto">
      <h3 className="text-2xl font-bold mb-6 tracking-wider uppercase border-b pb-3 text-center">Category Management</h3>
      <p className="text-sm text-gray-600 mb-6 text-center">Manage high-level product categories (e.g., TOPS) and their product types (e.g., HOODIES). Gender (MAN/WOMAN/KIDS) is fixed.</p>
      
      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Add Top-Level Category */}
      <div className="mb-8 pb-6 border-b">
        <h4 className="font-semibold text-lg mb-3">Add New Main Product Category</h4>
        <form onSubmit={handleAddCategory} className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="e.g., OUTERWEAR, FOOTWEAR"
            className="flex-grow p-3 border border-gray-300 rounded-md text-sm focus:ring-black focus:border-black transition"
          />
          <button 
            type="submit" 
            disabled={loading}
            className="bg-black text-white px-4 py-3 rounded-md flex items-center justify-center hover:bg-gray-800 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Plus size={18} />
            )}
            <span className="ml-2">{loading ? 'Adding...' : 'Add Category'}</span>
          </button>
        </form>
      </div>

      {/* Add Subcategory */}
      <div className="mb-8 pb-6 border-b">
        <h4 className="font-semibold text-lg mb-3">Add New Product Type (Subcategory)</h4>
        <form onSubmit={handleAddSubcategory}>
          <select
            value={parentCategoryKey}
            onChange={(e) => setParentCategoryKey(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md text-sm mb-3 focus:ring-black focus:border-black transition"
          >
            <option value="">-- Select Parent Category (e.g., TOPS) --</option>
            {categories.map(cat => (
              <option key={cat.key} value={cat.key}>{cat.name}</option>
            ))}
          </select>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <input
              type="text"
              value={newSubcategoryName}
              onChange={(e) => setNewSubcategoryName(e.target.value)}
              placeholder="e.g., HOODIES, SKIRTS, SNEAKERS"
              className="flex-grow p-3 border border-gray-300 rounded-md text-sm focus:ring-black focus:border-black transition"
            />
            <button 
              type="submit" 
              disabled={loading}
              className="bg-black text-white px-4 py-3 rounded-md flex items-center justify-center hover:bg-gray-800 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Plus size={18} />
              )}
              <span className="ml-2">{loading ? 'Adding...' : 'Add Product Type'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Display Current Categories */}
      <div className="mt-6">
        <h4 className="font-bold text-lg mb-3 uppercase tracking-wider">Current Structure ({categories.length} Categories):</h4>
        <div className="max-h-60 overflow-y-auto pr-2">
            <ul className="text-sm space-y-2">
            {categories.map(cat => (
                <li key={cat.key} className="p-3 bg-gray-100 rounded-lg">
                <span className="font-bold text-base block">{cat.name} ({cat.key})</span>
                {cat.subcategories.length > 0 ? (
                    <span className="text-gray-600 mt-1 block text-xs">Product Types: {cat.subcategories.map(sub => sub.name).join(' | ')}</span>
                ) : (
                    <span className="text-gray-400 mt-1 block italic text-xs">No product types defined.</span>
                )}
                </li>
            ))}
            </ul>
        </div>
      </div>
    </div>
  );
};

/**
 * Component for adding new products and managing the inventory list.
 */
const ProductManager = ({ categories, setProducts, products }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [categoryKey, setCategoryKey] = useState(''); // TOPS/BOTTOMS/ACCESSORIES
  const [subcategoryKey, setSubcategoryKey] = useState(''); // T-SHIRTS/JEANS/etc.
  const [genderKey, setGenderKey] = useState(''); // WOMAN/MAN/KIDS (New field)
  const [color, setColor] = useState('');
  const [isLive, setIsLive] = useState(false); // New field for product visibility
  
  // State to hold quantity for all possible sizes.
  const [sizeQuantities, setSizeQuantities] = useState(
    ADULT_SIZES.reduce((acc, size) => ({ ...acc, [size]: 0 }), {})
  );
  
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  
  // NEW STATE for managing the Edit Modal
  const [editingProduct, setEditingProduct] = useState(null);
  
  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Find the subcategories based on the selected Product Category
  const currentCategory = categories.find(c => c.key === categoryKey);
  const subcategories = currentCategory ? currentCategory.subcategories : [];

  // Determine the active set of sizes based on the selected Gender/Department
  const isAccessory = categoryKey === 'accessories';
  const activeSizes = getActiveSizes(genderKey, isAccessory, categoryKey);
  
  // EFFECT: Reset size quantities when the Gender key changes or category changes (for Accessories)
  useEffect(() => {
    if (genderKey || isAccessory) {
        const newQuantities = activeSizes.reduce((acc, size) => ({ 
            ...acc, 
            [size]: 0 
        }), {});
        setSizeQuantities(newQuantities);
    }
  }, [genderKey, isAccessory]);
  
  // Calculate total stock automatically
  const totalStock = activeSizes.reduce((sum, size) => sum + (parseInt(sizeQuantities[size]) || 0), 0);
  
  // Handler for quantity change
  const handleQuantityChange = (size, value) => {
    const sanitizedValue = value === '' ? '' : Math.max(0, parseInt(value) || 0); 
    
    setSizeQuantities(prev => ({
        ...prev,
        [size]: sanitizedValue,
    }));
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    
    // Final validation
    if (!name.trim() || !price || !categoryKey || !genderKey || !color.trim() || totalStock === 0) {
      setError("Please fill in all required fields (Name, Price, Category, Gender, Color) and ensure stock is greater than 0.");
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Find the selected category and subcategory IDs
      const selectedCategory = categories.find(c => c.key === categoryKey);
      const selectedSubcategory = subcategories.find(s => s.key === subcategoryKey);
      
      if (!selectedCategory) {
        throw new Error('Selected category not found');
      }
      
      // Format sizes and quantities for saving
      const sizesToSave = activeSizes
          .map(size => ({ size, quantity: parseInt(sizeQuantities[size]) || 0 }))
          .filter(item => item.quantity > 0);
      
      const productData = {
          name: name.toUpperCase(),
          price: parseFloat(price),
          category: selectedCategory.id,
          subcategory: selectedSubcategory ? selectedSubcategory.id : null,
          gender: genderKey,
          color: color.toUpperCase(),
          sizes: sizesToSave,
          total_stock_by_sizes: sizesToSave,
          is_live: isLive,
          image_url: imageUrl.trim() || null,
          description: description.trim() || null,
          price: parseFloat(price)
        };

      const response = await postProducts(productData);
      
      // Add the new product to local state
      const newProduct = {
        id: response.data.id,
        name: response.data.name,
        price: parseFloat(response.data.price),
        category: categoryKey,
        subcategory: subcategoryKey || '',
        gender: response.data.gender,
        color: response.data.color,
        sizes: response.data.total_stock_by_sizes,
        totalStock: response.data.total_stock_by_sizes.reduce((sum, s) => sum + s.quantity, 0),
        isLive: response.data.is_live,
        imageUrl: response.data.image_url || '',
        description: response.data.description || '',
      };

      setProducts(prev => [newProduct, ...prev]);
      
      // Reset form
      setName('');
      setPrice('');
      setCategoryKey('');
      setSubcategoryKey('');
      setGenderKey('');
      setColor('');
      setIsLive(false);
      setSizeQuantities(ADULT_SIZES.reduce((acc, size) => ({ ...acc, [size]: 0 }), {})); 
      setImageUrl('');
      setDescription('');
      
    } catch (err) {
      console.error('Error adding product:', err);
      setError(err.response?.data?.message || err.message || 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  // Handler for updating a product from the modal
  const handleUpdateProduct = async (updatedProduct) => {
    try {
      setLoading(true);
      setError(null);
      
      // Find the selected category and subcategory IDs
      const selectedCategory = categories.find(c => c.key === updatedProduct.category);
      const selectedSubcategory = categories
        .find(c => c.key === updatedProduct.category)
        ?.subcategories.find(s => s.key === updatedProduct.subcategory);
      
      if (!selectedCategory) {
        throw new Error('Selected category not found');
      }
      
      const productData = {
        name: updatedProduct.name,
        price: updatedProduct.price,
        category_id: selectedCategory.id,
        subcategory_id: selectedSubcategory ? selectedSubcategory.id : null,
        gender: updatedProduct.gender,
        color: updatedProduct.color,
        sizes: updatedProduct.sizes,
        total_stock_by_sizes: updatedProduct.sizes,
        is_live: updatedProduct.isLive,
        image_url: updatedProduct.imageUrl || null,
        description: updatedProduct.description || null,
      };

      const response = await updateProduct(updatedProduct.id, productData);
      
      // Update the product in local state with proper data mapping
      const updatedProductFromAPI = {
        ...updatedProduct,
        name: response.data.name,
        price: response.data.price,
        gender: response.data.gender,
        color: response.data.color,
        sizes: response.data.total_stock_by_sizes,
        totalStock: response.data.total_stock_by_sizes.reduce((sum, s) => sum + s.quantity, 0),
        isLive: response.data.is_live,
        imageUrl: response.data.image_url || '',
        description: response.data.description || '',
      };
      
      setProducts(prevProducts => prevProducts.map(p => 
          p.id === updatedProduct.id ? updatedProductFromAPI : p
      ));
      setEditingProduct(null); // Close modal
      
    } catch (err) {
      console.error('Error updating product:', err);
      setError(err.response?.data?.message || err.message || 'Failed to update product');
    } finally {
      setLoading(false);
    }
};

  // Handler for deleting a product
  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      await deleteProduct(productId);
      
      // Remove the product from local state
      setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
      
    } catch (err) {
      console.error('Error deleting product:', err);
      setError(err.message || 'Failed to delete product');
    } finally {
      setLoading(false);
    }
  };

  const genderOptionsWithDefault = [{ name: '-- Select Department (Gender) --', key: '' }, ...GENDER_OPTIONS];

  // Logic to show only the 3 most recent products
  const recentProducts = products.slice(0, 3);

  return (
    <div className="p-6 md:p-8 bg-white rounded-lg shadow-xl border border-gray-100 max-w-6xl mx-auto">
      <h3 className="text-2xl font-bold mb-6 tracking-wider uppercase border-b pb-3 text-center">Product Management</h3>
      
      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}
      
      {/* Product Addition Form */}
      <h4 className="font-semibold text-lg mb-3">Add New Product</h4>
      <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-4 gap-6 p-4 border rounded-lg mb-8 bg-gray-50">
        
        {/* 1. IDENTITY: Name */}
        <div className='md:col-span-2'>
          <label className="block text-sm font-medium mb-1">Product Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md text-sm focus:ring-black focus:border-black"
          />
        </div>
        <div className='md:col-span-2'>
            {/* Empty space for alignment/gaps */}
        </div>

        {/* 2. CLASSIFICATION: Gender, Category, Subcategory */}
        <div>
          <label className="block text-sm font-medium mb-1">Gender/Department *</label>
          <select
            value={genderKey}
            onChange={(e) => setGenderKey(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md text-sm focus:ring-black focus:border-black"
          >
            {genderOptionsWithDefault.map(g => (
                <option key={g.key} value={g.key}>{g.name}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Product Category *</label>
          <select
            value={categoryKey}
            onChange={(e) => {
                setCategoryKey(e.target.value);
                setSubcategoryKey(''); 
            }}
            className="w-full p-3 border border-gray-300 rounded-md text-sm focus:ring-black focus:border-black"
          >
            <option value="">-- Select Category --</option>
            {categories.map(cat => (
              <option key={cat.key} value={cat.key}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className='md:col-span-2'>
          <label className="block text-sm font-medium mb-1">Product Type (Subcategory)</label>
          <select
            value={subcategoryKey}
            onChange={(e) => setSubcategoryKey(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md text-sm focus:ring-black focus:border-black"
            disabled={subcategories.length === 0}
          >
            <option value="">-- Select Product Type --</option>
            {subcategories.map(sub => (
              <option key={sub.key} value={sub.key}>{sub.name}</option>
            ))}
          </select>
        </div>

        {/* 3. AESTHETICS & DETAIL */}
        <div>
            <label className="block text-sm font-medium mb-1">Product Color *</label>
            <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="e.g., BLACK, RED, BLUE"
                className="w-full p-3 border border-gray-300 rounded-md text-sm focus:ring-black focus:border-black"
            />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Image Reference (URL/Keyword)</label>
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="e.g., black-dress-model.jpg or 'dress'"
            className="w-full p-3 border border-gray-300 rounded-md text-sm focus:ring-black focus:border-black"
          />
          <p className='text-xs text-gray-500 mt-1'>Enter a keyword or URL for image reference.</p>
        </div>

        {/* Description and Price */}
        <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Product Description</label>
            <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="3"
                placeholder="Describe the material, fit, and styling details..."
                className="w-full p-3 border border-gray-300 rounded-md text-sm focus:ring-black focus:border-black"
            />
        </div>
        
        <div className="md:col-span-2 flex flex-col justify-end">
            <div>
              <label className="block text-sm font-medium mb-1">Price ($) *</label>
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md text-sm focus:ring-black focus:border-black"
              />
            </div>
        </div>

        {/* 4. INVENTORY: Sizes and Stock */}
        <div className="md:col-span-4 border-t pt-4">
            <div className='flex justify-between items-center mb-4'>
                <label className="block text-sm font-bold text-gray-800">
                    Stock by Size 
                    {genderKey === 'kids' && ' (Age Range)'}
                    {(genderKey === 'woman' || genderKey === 'man') && ' (Apparel Size)'}
                    {isAccessory && ' (One-Size Stock)'}
                    {!genderKey && ' (Select Gender to determine sizes)'}
                </label>
                <div className='text-base font-extrabold bg-black text-white px-4 py-1.5 rounded-lg shadow-md'>
                    TOTAL STOCK: {totalStock}
                </div>
            </div>
            
            <div className="flex flex-wrap gap-4 justify-start">
                {activeSizes.map(size => (
                    <div 
                        key={size} 
                        className='w-24 sm:w-28 flex flex-col items-center bg-white p-3 rounded-lg border border-gray-200 transition-shadow hover:shadow-lg'
                    >
                        <label className="text-sm font-extrabold uppercase mb-2 text-black">{size}</label>
                        <input
                            type="number"
                            min="0"
                            value={sizeQuantities[size] || ''}
                            onChange={(e) => handleQuantityChange(size, e.target.value)}
                            placeholder="0"
                            className="w-full text-xl text-center font-mono py-1 border-b-2 border-gray-400 focus:border-black focus:outline-none transition-colors"
                        />
                    </div>
                ))}
            </div>
            
            {/* Conditional messaging */}
            {!genderKey && !isAccessory && <p className='text-xs text-blue-500 mt-2'>Select a Gender/Department above to display relevant sizes.</p>}
            {totalStock === 0 && (genderKey || isAccessory) && <p className='text-xs text-red-500 mt-2'>Enter stock quantity for at least one size.</p>}
        </div>

        {/* 5. ACTION: Make Product Live */}
        <div className='md:col-span-4 border-t pt-4'>
            <label className="flex items-center space-x-3 cursor-pointer bg-white p-4 rounded-lg border border-gray-300 w-full hover:shadow-sm transition">
                <input
                    type="checkbox"
                    checked={isLive}
                    onChange={(e) => setIsLive(e.target.checked)}
                    className="h-6 w-6 text-black border-gray-300 rounded focus:ring-black"
                />
                <span className="text-base font-semibold text-gray-800">Make Product Live on E-Commerce Site</span>
            </label>
        </div>


        {/* Submit Button */}
        <div className="md:col-span-4 mt-2">
          <button 
            type="submit" 
            disabled={loading || !categoryKey || !genderKey || totalStock === 0 || !name.trim() || !price || !color.trim()}
            className="w-full bg-black text-white px-4 py-3 rounded-md flex items-center justify-center hover:bg-gray-800 transition tracking-wider uppercase shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Plus size={18} className='mr-2' />
            )}
            {loading ? 'Adding Product...' : 'Add Product to Inventory'}
          </button>
        </div>
      </form>

      {/* --- INVENTORY LIST SECTION --- */}
      <div className="mt-8 pt-4 border-t">
        <div className='flex justify-between items-center mb-4'>
            <h4 className="font-bold text-lg uppercase tracking-wider">
                Recent Inventory Ads (<span className='text-black'>{recentProducts.length}</span> / {products.length} Total Items)
            </h4>
            
            {/* Show All Items Button (Placeholder for external link) */}
            <button
                onClick={() => console.log('Navigate to full inventory page')} // Placeholder action
                className={`px-4 py-2 text-sm font-semibold rounded-md transition bg-gray-200 text-gray-700 hover:bg-gray-300 shadow-sm`}
            >
                Show All Items
            </button>
        </div>
        
        <div className="max-h-60 overflow-y-auto pr-2">
            <ul className="text-sm space-y-2">
                {recentProducts.length > 0 ? (
                    recentProducts.map(p => (
                        <li key={p.id} className="p-3 bg-gray-100 rounded-lg flex justify-between items-center transition-all duration-300 hover:bg-gray-200">
                            <div className="flex flex-col">
                                <span className="font-medium block">{p.name} - <span className='text-gray-700'>{p.color}</span></span>
                                <span className="text-xs text-gray-500 block mt-1">
                                    Dept: <span className='font-bold uppercase'>{p.gender}</span> | Cat: {p.category}{p.subcategory ? ` / ${p.subcategory}` : ''}
                                </span>
                                <span className="text-xs text-gray-400 block mt-1">
                                    **STOCK**: {p.totalStock} pieces
                                </span>
                            </div>
                            <div className="text-right flex items-center space-x-3">
                                {/* Live Status Icon */}
                                {p.isLive ? (
                                    <Zap size={18} className='text-green-600' title="Live on Website" />
                                ) : (
                                    <span className="text-xs text-red-500 font-semibold italic">Draft</span>
                                )}
                                <span className="text-gray-600 font-semibold">${typeof p.price === 'number' ? p.price.toFixed(2) : parseFloat(p.price).toFixed(2)}</span>
                                
                                {/* Edit Button */}
                                <button
                                    onClick={() => setEditingProduct(p)}
                                    className='bg-black text-white p-2 rounded-full hover:bg-gray-800 transition shadow-md'
                                    title="Edit Product Details"
                                >
                                    <Pencil size={14} />
                                </button>
                                
                                {/* Delete Button */}
                                <button
                                    onClick={() => handleDeleteProduct(p.id)}
                                    disabled={loading}
                                    className='bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed'
                                    title="Delete Product"
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="3,6 5,6 21,6"></polyline>
                                        <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
                                        <line x1="10" y1="11" x2="10" y2="17"></line>
                                        <line x1="14" y1="11" x2="14" y2="17"></line>
                                    </svg>
                                </button>
                            </div>
                        </li>
                    ))
                ) : (
                    <li className="p-4 text-center text-gray-500 italic bg-gray-100 rounded-lg">
                        No recent products added.
                    </li>
                )}
            </ul>
        </div>
      </div>
      
      {/* Product Edit Modal */}
      {editingProduct && (
        <EditProductModal 
            product={editingProduct} 
            categories={categories} 
            onSave={handleUpdateProduct}
            onClose={() => setEditingProduct(null)}
        />
      )}
    </div>
  );
};

/**
 * The main layout for the Admin Dashboard with integrated tabs.
 */
const AdminDashboard = ({ categories, setCategories, products, setProducts, activeTab, setActiveTab }) => {
    
    const renderContent = () => {
        switch (activeTab) {
            case 'categories':
                return <CategoryManager categories={categories} setCategories={setCategories} />;
            case 'products':
                return <ProductManager categories={categories} setProducts={setProducts} products={products} />;
            default:
                // Defaulting to products
                return <ProductManager categories={categories} setProducts={setProducts} products={products} />;
        }
    };

    const navItems = [
        { key: 'products', name: 'Products', icon: Package },
        { key: 'categories', name: 'Categories', icon: Layers },
    ];

    return (
        <div className="min-h-screen bg-gray-100 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Tab Navigation */}
                <div className="flex justify-center mb-10 border-b border-black">
                    {navItems.map(item => {
                        const isActive = activeTab === item.key;
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.key}
                                onClick={() => setActiveTab(item.key)}
                                className={`flex items-center space-x-2 py-3 px-8 text-sm font-semibold tracking-widest uppercase transition duration-300 
                                            ${isActive 
                                                ? 'bg-black text-white' 
                                                : 'text-gray-700 hover:bg-gray-200'}`}
                            >
                                <Icon size={18} />
                                <span>{item.name}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Content */}
                {renderContent()}
            </div>
        </div>
    );
};


// --- 3. MAIN APP COMPONENT ---

const App = () => {
  // Global state for categories and products
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // State to manage which tab is active in the admin view. Starting with 'products'
  const [activeTab, setActiveTab] = useState('products');

  // Fetch categories and subcategories from API on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch categories and subcategories in parallel
        const [categoriesResponse, subcategoriesResponse] = await Promise.all([
          getCategories(),
          getSubCategories()
        ]);
        
        // Transform API data to match the expected format
        const apiCategories = categoriesResponse.data.map(cat => ({
          id: cat.id,
          name: cat.name,
          key: cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
          subcategories: []
        }));
        
        // Group subcategories by category
        const subcategoriesData = subcategoriesResponse.data;
        const categoriesWithSubcategories = apiCategories.map(category => {
          const categorySubcategories = subcategoriesData
            .filter(sub => sub.category === category.id)
            .map(sub => ({
              id: sub.id,
              name: sub.name,
              key: sub.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
              category: sub.category
            }));
          
          return {
            ...category,
            subcategories: categorySubcategories
          };
        });
        
        setCategories(categoriesWithSubcategories);
        setSubcategories(subcategoriesData);
        
        // Also fetch products if needed
        try {
          const productsResponse = await getProducts();
          setProducts(productsResponse.data || []);
        } catch (productError) {
          console.warn('Could not fetch products:', productError);
          // Keep using initial products as fallback
          setProducts(INITIAL_PRODUCTS);
        }
        
      } catch (err) {
        console.error('Error fetching data:', err);
        
        // Handle different types of errors
        if (err.response?.status === 401) {
          setError('Authentication required. Please log in to access the product management system.');
        } else if (err.response?.status === 403) {
          setError('Access denied. You do not have permission to access this resource.');
        } else if (err.response?.status >= 500) {
          setError('Server error. Please try again later.');
        } else if (err.message?.includes('No authentication token')) {
          setError('Please log in to access the product management system.');
        } else {
          setError(err.message || 'Failed to load data');
        }
        
        // Fallback to initial data
        setCategories(INITIAL_PRODUCT_CATEGORIES);
        setProducts(INITIAL_PRODUCTS);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); 

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white font-['Inter',_sans-serif] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading inventory data...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-white font-['Inter',_sans-serif] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="flex gap-3 justify-center">
            <button 
              onClick={() => window.location.reload()} 
              className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors"
            >
              Retry
            </button>
            {(error.includes('Authentication') || error.includes('log in')) && (
              <button 
                onClick={() => window.location.href = '/login'} 
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                Go to Login
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-['Inter',_sans-serif]">
      
      {/* ADMIN DASHBOARD (Now includes title and navigation) */}
      <AdminDashboard 
        categories={categories} 
        setCategories={setCategories} 
        products={products}
        setProducts={setProducts}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
    </div>
  );
};

export default App;
