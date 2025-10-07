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
    if (!categoryData.name || categoryData.name.trim() === "") {
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
    if (!subcategoryData.name || subcategoryData.name.trim() === "") {
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
    if (!productData.name || productData.name.trim() === "") {
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

export const getProductsByCategory = async (categoryId) => {
    // GET requests are public, no auth required
    return API.get(`${CATEGORY_URL}${categoryId}/products/`);
};

export const getProductsBySubCategory = async (subcategoryId) => {
    // GET requests are public, no auth required
    return API.get(`${SUBCATEGORY_URL}${subcategoryId}/products/`);
};

export const updateProduct = async (id, productData) => {
    checkAuth();
    setAuthHeader();
    return API.put(`${PRODUCT_URL}${id}/`, productData);
};

export const deleteProduct = async (id) => {
    checkAuth();
    setAuthHeader();
    return API.delete(`${PRODUCT_URL}${id}/`);
};

