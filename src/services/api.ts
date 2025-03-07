import axios, { AxiosError, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// Types
export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface PaymentDetails {
  cardName: string;
  cardNumber: string;
  cardExpiry: string;
  cardCVC: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'canceled';
  createdAt: string;
}

// API base URL - can be overridden by environment variables
const API_URL = import.meta.env.VITE_API_URL || 'https://e-commerce-checkout-api-production.up.railway.app/api';

// Create an axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    // Handle authentication errors
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      // You could dispatch a logout action here or redirect
    }
    return Promise.reject(error);
  }
);

// API endpoints
const endpoints = {
  // Authentication
  auth: {
    login: (data: { email: string; password: string }) => api.post('/auth/login', data),
    register: (data: { email: string; password: string; firstName: string; lastName: string }) => 
      api.post('/auth/register', data),
  },
  
  // Cart
  cart: {
    get: () => api.get('/cart'),
    add: (data: { productId: string; name: string; price: number; quantity: number; image?: string }) => 
      api.post('/cart', data),
    update: (itemId: string, data: { quantity: number }) => api.put(`/cart/${itemId}`, data),
    remove: (itemId: string) => api.delete(`/cart/${itemId}`),
    clear: () => api.delete('/cart'),
  },
  
  // Shipping
  shipping: {
    getOptions: () => api.get('/shipping/options'),
    calculate: (data: { address: any; items: any[]; shippingOptionId: string }) => 
      api.post('/shipping/calculate', data),
    validateAddress: (address: any) => api.post('/shipping/validate-address', address),
  },
  
  // Payment
  payment: {
    getMethods: () => api.get('/payment/methods'),
    createIntent: (data: { amount: number; currency: string; paymentMethodId?: string }) => 
      api.post('/payment/create-intent', data),
    confirm: (data: { paymentIntentId: string }) => api.post('/payment/confirm', data),
  },
  
  // Orders
  orders: {
    getAll: () => api.get('/order'),
    getById: (orderId: string) => api.get(`/order/${orderId}`),
    create: (data: any) => api.post('/order', data),
  },
};

export { api, endpoints }; 