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
  stockQuantity: number;
  lowStockThreshold: number;
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
  status: 'DRAFT' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  total: number;
  notes: string | null;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
};

export type Invoice = {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customer: Customer;
  orderId: string | null;
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  subtotal: number;
  taxAmount: number;
  discount: number;
  total: number;
  issueDate: string;
  dueDate: string;
  paidDate: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ProcessingStatus = {
  orderId: string;
  orderStatus: Order['status'];
  processingStatus: 'not_started' | 'waiting' | 'active' | 'completed' | 'failed';
  progress: number;
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

  confirmOrder: async (id: string): Promise<Order & { jobId: string; message: string }> => {
    const response = await api.post<Order & { jobId: string; message: string }>(`/erp/orders/${id}/confirm`);
    return response.data;
  },

  getProcessingStatus: async (id: string): Promise<ProcessingStatus> => {
    const response = await api.get<ProcessingStatus>(`/erp/orders/${id}/processing-status`);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/erp/orders/${id}`);
  },
};

// ===========================================
// Invoices Service
// ===========================================
export const invoicesService = {
  getAll: async (): Promise<Invoice[]> => {
    const response = await api.get<PaginatedResponse<Invoice>>('/erp/invoices');
    return response.data.data;
  },

  getById: async (id: string): Promise<Invoice> => {
    const response = await api.get<Invoice>(`/erp/invoices/${id}`);
    return response.data;
  },

  updateStatus: async (id: string, status: Invoice['status']): Promise<Invoice> => {
    const response = await api.patch<Invoice>(`/erp/invoices/${id}/status`, { status });
    return response.data;
  },

  sendInvoice: async (id: string): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>(`/erp/invoices/${id}/send`);
    return response.data;
  },

  getStats: async (): Promise<{
    total: number;
    draft: number;
    sent: number;
    paid: number;
    overdue: number;
    totalRevenue: number;
  }> => {
    const response = await api.get('/erp/invoices/stats');
    return response.data;
  },
};
