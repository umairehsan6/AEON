import API from "../api/axios";
import { checkAuth, setAuthHeader } from "./inventory";

const ORDERS_URL = "/api/orders/";

export const getUserCheckoutData = async () => {
  checkAuth();
  setAuthHeader();
  return API.get(`${ORDERS_URL}checkout-data/`);
};

export const checkoutOrder = async (payload) => {
  checkAuth();
  setAuthHeader();
  return API.post(`${ORDERS_URL}checkout/`, payload);
};

export const getMyOrders = async () => {
  checkAuth();
  setAuthHeader();
  return API.get(`${ORDERS_URL}mine/`);
};

export const getAllOrders = async () => {
  checkAuth();
  setAuthHeader();
  return API.get(`${ORDERS_URL}admin-list/`);
};

export const updateOrderStatus = async (orderId, status) => {
  checkAuth();
  setAuthHeader();
  return API.patch(`${ORDERS_URL}${orderId}/status/`, { status });
};

export const cancelOrder = async (orderId, reason) => {
  checkAuth();
  setAuthHeader();
  return API.patch(`${ORDERS_URL}${orderId}/status/`, { 
    status: 'cancelled',
    return_reason: reason 
  });
};
