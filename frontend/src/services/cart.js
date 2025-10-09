import API from "../api/axios";
import { checkAuth, setAuthHeader } from "./inventory";

const CART_URL = "/api/cart/";

export const getCart = async () => {
  checkAuth();
  setAuthHeader();
  return API.get(CART_URL);
};

export const addToCart = async ({ product, size, quantity }) => {
  checkAuth();
  setAuthHeader();
  return API.post(CART_URL, { product, size, quantity });
};

export const updateCartItem = async (itemId, quantity) => {
  checkAuth();
  setAuthHeader();
  return API.patch(`${CART_URL}items/${itemId}/`, { quantity });
};

export const removeCartItem = async (itemId) => {
  checkAuth();
  setAuthHeader();
  return API.delete(`${CART_URL}items/${itemId}/`);
};

export const checkoutCart = async (itemIds /* optional: array */) => {
  checkAuth();
  setAuthHeader();
  return API.post(`${CART_URL}checkout/`, itemIds && Array.isArray(itemIds) ? { item_ids: itemIds } : {});
};
