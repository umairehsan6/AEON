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