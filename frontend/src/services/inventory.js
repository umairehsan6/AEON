import API from "../api/axios";

// API URLs
const CATEGORY_URL = "/api/inventory/categories/";
const SUBCATEGORY_URL = "/api/inventory/subcategories/";
const PRODUCT_URL = "/api/inventory/products/";

// Helper function to set authorization header
export const setAuthHeader = () => {
    const token = localStorage.getItem("access_token");
    if (token) {
        API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        return true;
    } else {
        // Clear any existing auth header if no token
        delete API.defaults.headers.common["Authorization"];
        return false;
    }
};

// Helper function to check if user is authenticated
export const checkAuth = () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
        throw new Error('No authentication token found. Please log in.');
    }
    return token;
};

// CATEGORY API FUNCTIONS
export const postCategories = async (categoryData) => {
    // Validate input data
    if (!categoryData.name || categoryData.name?.trim() === "") {
        throw new Error("Category name is required");
    }
    checkAuth(); // This will throw if not authenticated
    setAuthHeader();
    return API.post(CATEGORY_URL, categoryData);
};

export const getCategories = async () => {
    // GET requests are public, no auth required
    return API.get(CATEGORY_URL);
};

export const updateCategory = async (id, categoryData) => {
    checkAuth();
    setAuthHeader();
    return API.put(`${CATEGORY_URL}${id}/`, categoryData);
};

export const deleteCategory = async (id) => {
    checkAuth();
    setAuthHeader();
    return API.delete(`${CATEGORY_URL}${id}/`);
};

// SUBCATEGORY API FUNCTIONS
export const postSubCategories = async (subcategoryData) => {
    if (!subcategoryData.name || subcategoryData.name?.trim() === "") {
        throw new Error("Subcategory name is required");
    }
    if (!subcategoryData.category) {
        throw new Error("Category is required");
    }
    checkAuth();
    setAuthHeader();
    return API.post(SUBCATEGORY_URL, subcategoryData);
};

export const getSubCategories = async () => {
    // GET requests are public, no auth required
    return API.get(SUBCATEGORY_URL);
};

export const getSubCategoriesByCategory = async (categoryId) => {
    // GET requests are public, no auth required
    return API.get(`${CATEGORY_URL}${categoryId}/subcategories/`);
};

export const updateSubCategory = async (id, subcategoryData) => {
    checkAuth();
    setAuthHeader();
    return API.put(`${SUBCATEGORY_URL}${id}/`, subcategoryData);
};

export const deleteSubCategory = async (id) => {
    checkAuth();
    setAuthHeader();
    return API.delete(`${SUBCATEGORY_URL}${id}/`);
};

// PRODUCT API FUNCTIONS
export const postProducts = async (productData) => {
    if (!productData.name || productData.name?.trim() === "") {
        throw new Error("Product name is required");
    }
    checkAuth();
    setAuthHeader();
    return API.post(PRODUCT_URL, productData);
};

export const getProducts = async () => {
    // GET requests are public, no auth required
    return API.get(PRODUCT_URL);
};

export const getProductById = async (id) => {
    // GET requests are public, no auth required
    return API.get(`${PRODUCT_URL}${id}/`);
};

export const getProductsByCategory = async (categoryId) => {
    // GET requests are public, no auth required
    return API.get(`${CATEGORY_URL}${categoryId}/products/`);
};

export const getProductsBySubCategory = async (subcategoryId) => {
    // GET requests are public, no auth required
    return API.get(`${SUBCATEGORY_URL}${subcategoryId}/products/`);
};

export const updateProduct = async (id, productData) => {
    try {
        checkAuth();
        setAuthHeader();
        console.log('Sending update request to:', `${PRODUCT_URL}${id}/`);
        console.log('Request data:', productData);
        const response = await API.put(`${PRODUCT_URL}${id}/`, productData);
        console.log('Update response received:', response.data);
        return response;
    } catch (error) {
        console.error('Update product error:', error);
        console.error('Error response:', error.response?.data);
        console.error('Error status:', error.response?.status);
        throw error;
    }
};

export const deleteProduct = async (id) => {
    checkAuth();
    setAuthHeader();
    return API.delete(`${PRODUCT_URL}${id}/`);
};

// Master API for all product filtering
export const getFilteredProducts = async (filters = {}) => {
    try {
        console.log('Fetching filtered products with filters:', filters);
        
        // Build query parameters
        const params = new URLSearchParams();
        
        if (filters.gender) params.append('gender', filters.gender);
        if (filters.category) params.append('category', filters.category);
        if (filters.subcategory) params.append('subcategory', filters.subcategory);
        if (filters.collection) params.append('collection', filters.collection);
        if (filters.search) params.append('search', filters.search);
        if (filters.is_live !== undefined) params.append('is_live', filters.is_live);
        
        const queryString = params.toString();
        const url = queryString ? `${PRODUCT_URL}filter/?${queryString}` : `${PRODUCT_URL}filter/`;
        
        console.log('Master API URL:', url);
        
        const response = await API.get(url);
        console.log('Master API response:', response.data);
        
        return response;
    } catch (error) {
        console.error('Error fetching filtered products:', error);
        throw error;
    }
};

// Get categories organized by gender for sidebar
export const getCategoriesByGender = async () => {
    try {
        console.log('Fetching categories organized by gender');
        
        // Get all categories and subcategories
        const [categoriesResponse, subcategoriesResponse] = await Promise.all([
            getCategories(),
            getSubCategories()
        ]);
        
        const categories = categoriesResponse.data;
        const subcategories = subcategoriesResponse.data;
        
        // Organize categories by gender
        const organizedData = {
            women: {
                categories: []
            },
            men: {
                categories: []
            },
            kids: {
                categories: []
            }
        };
        
        // Process each category
        categories.forEach(category => {
            const categorySubcategories = subcategories.filter(sub => sub.category === category.id);
            
            const categoryData = {
                id: category.id,
                name: category.name,
                key: category.name.toLowerCase().replace(/\s+/g, '-'),
                subcategories: categorySubcategories.map(sub => ({
                    id: sub.id,
                    name: sub.name,
                    key: sub.name.toLowerCase().replace(/\s+/g, '-')
                }))
            };
            
            // Add to all genders (categories can be for any gender)
            organizedData.women.categories.push(categoryData);
            organizedData.men.categories.push(categoryData);
            organizedData.kids.categories.push(categoryData);
        });
        
        console.log('Organized categories by gender:', organizedData);
        return organizedData;
    } catch (error) {
        console.error('Error fetching categories by gender:', error);
        throw error;
    }
};

