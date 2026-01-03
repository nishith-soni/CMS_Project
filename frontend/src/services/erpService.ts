// ===========================================
// ERP Service - Products, Customers, Orders API
// ===========================================

import api from './api';

// ===========================================
// Types
// ===========================================
export type Product = {
  id: string;
  name: string;
  sku: string;
  description: string | null;
  price: number;
  cost: number | null;
  quantity: number;
  minQuantity: number;
  category: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Customer = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type OrderItem = {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  total: number;
};

export type Order = {
  id: string;
  orderNumber: string;
  customerId: string;
  customer: Customer;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  subtotal: number;
  tax: number;
  total: number;
  notes: string | null;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
};

export type PaginatedResponse<T> = {
  data: T[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
};

// ===========================================
// Products Service
// ===========================================
export const productsService = {
  getAll: async (): Promise<Product[]> => {
    const response = await api.get<PaginatedResponse<Product>>('/erp/products');
    return response.data.data;
  },

  getById: async (id: string): Promise<Product> => {
    const response = await api.get<Product>(`/erp/products/${id}`);
    return response.data;
  },

  create: async (data: Partial<Product>): Promise<Product> => {
    const response = await api.post<Product>('/erp/products', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Product>): Promise<Product> => {
    const response = await api.patch<Product>(`/erp/products/${id}`, data);
    return response.data;
  },

  updateStock: async (id: string, quantity: number, operation: 'add' | 'subtract' | 'set'): Promise<Product> => {
    const response = await api.patch<Product>(`/erp/products/${id}/stock`, { quantity, operation });
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/erp/products/${id}`);
  },
};

// ===========================================
// Customers Service
// ===========================================
export const customersService = {
  getAll: async (): Promise<Customer[]> => {
    const response = await api.get<PaginatedResponse<Customer>>('/erp/customers');
    return response.data.data;
  },

  getById: async (id: string): Promise<Customer> => {
    const response = await api.get<Customer>(`/erp/customers/${id}`);
    return response.data;
  },

  create: async (data: Partial<Customer>): Promise<Customer> => {
    const response = await api.post<Customer>('/erp/customers', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Customer>): Promise<Customer> => {
    const response = await api.patch<Customer>(`/erp/customers/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/erp/customers/${id}`);
  },
};

// ===========================================
// Orders Service
// ===========================================
export const ordersService = {
  getAll: async (): Promise<Order[]> => {
    const response = await api.get<PaginatedResponse<Order>>('/erp/orders');
    return response.data.data;
  },

  getById: async (id: string): Promise<Order> => {
    const response = await api.get<Order>(`/erp/orders/${id}`);
    return response.data;
  },

  create: async (data: { customerId: string; items: { productId: string; quantity: number }[]; notes?: string }): Promise<Order> => {
    const response = await api.post<Order>('/erp/orders', data);
    return response.data;
  },

  updateStatus: async (id: string, status: Order['status']): Promise<Order> => {
    const response = await api.patch<Order>(`/erp/orders/${id}/status`, { status });
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/erp/orders/${id}`);
  },
};
