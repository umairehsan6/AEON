import { checkAuth, setAuthHeader } from "./inventory";
import API from "../api/axios";

// API URL
const COLLECTION_URL = "/api/inventory/collections/";
// Helper function to set authorization header
export const CollectionPost = async (collectionData) => {
    checkAuth();
    setAuthHeader();
    return API.post(COLLECTION_URL, collectionData);
};

export const getCollections = async () => {
    // GET requests are public, no auth required
    return API.get(COLLECTION_URL);
};

export const updateCollection = async (collectionId, data) => {
    checkAuth();
    setAuthHeader();
    return API.patch(`${COLLECTION_URL}${collectionId}/`, data);
};

export const setCollectionProducts = async (collectionId, productIds) => {
    checkAuth();
    setAuthHeader();
    // accepts array of product IDs
    return API.post(`${COLLECTION_URL}${collectionId}/products/`, { products: productIds });
};

export const getCollectionProducts = async (collectionId) => {
    // public read
    return API.get(`${COLLECTION_URL}${collectionId}/products/`);
};

export const removeProductFromCollection = async (collectionId, productId) => {
    checkAuth();
    setAuthHeader();
    return API.delete(`${COLLECTION_URL}${collectionId}/products/${productId}/`);
};