// ===========================================
// Users Service - User Management API
// ===========================================

import api from './api';

// ===========================================
// Types
// ===========================================
export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR' | 'VIEWER';
  avatar: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateUserData = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: User['role'];
};

export type UpdateUserData = Partial<Omit<CreateUserData, 'password'>> & {
  password?: string;
  isActive?: boolean;
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
// Users Service
// ===========================================
export const usersService = {
  getAll: async (): Promise<User[]> => {
    const response = await api.get<PaginatedResponse<User>>('/users');
    return response.data.data || [];
  },

  getById: async (id: string): Promise<User> => {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  },

  create: async (data: CreateUserData): Promise<User> => {
    const response = await api.post<User>('/users', data);
    return response.data;
  },

  update: async (id: string, data: UpdateUserData): Promise<User> => {
    const response = await api.patch<User>(`/users/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },
};
