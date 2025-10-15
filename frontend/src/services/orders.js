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

export const updateOrderStatus = async (orderId, statusData) => {
  checkAuth();
  setAuthHeader();
  // Handle both string status and object with status/return_reason
  const payload = typeof statusData === 'string' 
    ? { status: statusData }
    : statusData;
  return API.patch(`${ORDERS_URL}${orderId}/status/`, payload);
};

export const cancelOrder = async (orderId, reason) => {
  checkAuth();
  setAuthHeader();
  return API.patch(`${ORDERS_URL}${orderId}/status/`, { 
    status: 'cancelled',
    return_reason: reason 
  });
};

export const getSalesStatistics = async (filters = {}) => {
  checkAuth();
  setAuthHeader();
  
  // Build query parameters
  const params = new URLSearchParams();
  
  if (filters.period) params.append('period', filters.period);
  if (filters.month) params.append('month', filters.month);
  if (filters.year) params.append('year', filters.year);
  
  const queryString = params.toString();
  const url = queryString ? `${ORDERS_URL}sales-statistics/?${queryString}` : `${ORDERS_URL}sales-statistics/`;
  
  return API.get(url);
};
