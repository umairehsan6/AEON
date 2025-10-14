import { checkAuth, setAuthHeader } from "./inventory";
import API from "../api/axios";

// API URL
const COLLECTION_URL = "/api/inventory/collections/";
// Helper function to set authorization header
export const CollectionPost = async (collectionData) => {
    try {
        checkAuth();
        setAuthHeader();
        console.log('Creating collection with data:', collectionData);
        const response = await API.post(COLLECTION_URL, collectionData);
        console.log('Collection created successfully:', response.data);
        return response;
    } catch (error) {
        console.error('Collection creation error:', error);
        console.error('Error response:', error.response?.data);
        console.error('Error status:', error.response?.status);
        throw error;
    }
};

export const getCollections = async () => {
    // GET requests are public, no auth required
    return API.get(COLLECTION_URL);
};

export const updateCollection = async (collectionId, data) => {
    try {
        checkAuth();
        setAuthHeader();
        console.log('Updating collection:', { collectionId, data });
        const response = await API.patch(`${COLLECTION_URL}${collectionId}/`, data);
        console.log('Collection update response:', response.data);
        return response;
    } catch (error) {
        console.error('Collection update error:', error);
        console.error('Error response:', error.response?.data);
        console.error('Error status:', error.response?.status);
        throw error;
    }
};

export const setCollectionProducts = async (collectionId, productIds) => {
    try {
        checkAuth();
        setAuthHeader();
        console.log('Setting collection products:', { collectionId, productIds });
        const response = await API.post(`${COLLECTION_URL}${collectionId}/products/`, { products: productIds });
        console.log('Collection products set successfully:', response.data);
        return response;
    } catch (error) {
        console.error('Set collection products error:', error);
        console.error('Error response:', error.response?.data);
        console.error('Error status:', error.response?.status);
        throw error;
    }
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