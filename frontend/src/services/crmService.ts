// ===========================================
// CRM Service - Contacts, Leads, Deals API
// ===========================================

import api from './api';

// ===========================================
// Types
// ===========================================
export type Activity = {
  id: string;
  type: 'CALL' | 'EMAIL' | 'MEETING' | 'TASK' | 'NOTE';
  title: string;
  description: string | null;
  dueDate: string | null;
  completed: boolean;
  completedAt: string | null;
  contactId: string | null;
  dealId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Contact = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  jobTitle: string | null;
  source: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  activities?: Activity[];
};

export type Lead = {
  id: string;
  title: string;
  description: string | null;
  status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'PROPOSAL' | 'NEGOTIATION' | 'WON' | 'LOST';
  value: number | null;
  source: string | null;
  contactId: string | null;
  contact: Contact | null;
  assignedToId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Deal = {
  id: string;
  title: string;
  value: number;
  stage: 'PROSPECTING' | 'QUALIFICATION' | 'PROPOSAL' | 'NEGOTIATION' | 'CLOSED_WON' | 'CLOSED_LOST';
  probability: number | null;
  expectedCloseDate: string | null;
  contactId: string | null;
  contact: Contact | null;
  assignedToId: string | null;
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
// Activities Service
// ===========================================
export const activitiesService = {
  getAll: async (params?: { contactId?: string; dealId?: string; page?: number; pageSize?: number }): Promise<PaginatedResponse<Activity>> => {
    const searchParams = new URLSearchParams();
    if (params?.contactId) searchParams.set('contactId', params.contactId);
    if (params?.dealId) searchParams.set('dealId', params.dealId);
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize));

    const query = searchParams.toString();
    const url = query ? `/crm/activities?${query}` : '/crm/activities';

    const response = await api.get<PaginatedResponse<Activity>>(url);
    return response.data;
  },

  create: async (data: {
    type: Activity['type'];
    title: string;
    description?: string;
    contactId?: string;
    dealId?: string;
    dueDate?: string;
  }): Promise<Activity> => {
    const response = await api.post<Activity>('/crm/activities', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Omit<Activity, 'id' | 'contactId' | 'dealId' | 'createdAt' | 'updatedAt'>>): Promise<Activity> => {
    const response = await api.patch<Activity>(`/crm/activities/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/crm/activities/${id}`);
  },

  getTaskSummary: async (): Promise<{ today: Activity[]; overdue: Activity[] }> => {
    const response = await api.get<{ today: Activity[]; overdue: Activity[] }>(
      '/crm/activities/summary/tasks',
    );
    return response.data;
  },
};

// ===========================================
// Contacts Service
// ===========================================
export const contactsService = {
  getAll: async (): Promise<Contact[]> => {
    const response = await api.get<PaginatedResponse<Contact>>('/crm/contacts');
    return response.data.data;
  },

  getById: async (id: string): Promise<Contact> => {
    const response = await api.get<Contact>(`/crm/contacts/${id}`);
    return response.data;
  },

  create: async (data: Partial<Contact>): Promise<Contact> => {
    const response = await api.post<Contact>('/crm/contacts', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Contact>): Promise<Contact> => {
    const response = await api.patch<Contact>(`/crm/contacts/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/crm/contacts/${id}`);
  },
};

// ===========================================
// Leads Service
// ===========================================
export const leadsService = {
  getAll: async (): Promise<Lead[]> => {
    const response = await api.get<PaginatedResponse<Lead>>('/crm/leads');
    return response.data.data;
  },

  getById: async (id: string): Promise<Lead> => {
    const response = await api.get<Lead>(`/crm/leads/${id}`);
    return response.data;
  },

  create: async (data: Partial<Lead>): Promise<Lead> => {
    const response = await api.post<Lead>('/crm/leads', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Lead>): Promise<Lead> => {
    const response = await api.patch<Lead>(`/crm/leads/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/crm/leads/${id}`);
  },
};

// ===========================================
// Deals Service
// ===========================================
export const dealsService = {
  getAll: async (): Promise<Deal[]> => {
    const response = await api.get<PaginatedResponse<Deal>>('/crm/deals');
    return response.data.data;
  },

  getPipeline: async (): Promise<Record<string, Deal[]>> => {
    const response = await api.get<Record<string, Deal[]>>('/crm/deals/pipeline');
    return response.data;
  },

  getById: async (id: string): Promise<Deal> => {
    const response = await api.get<Deal>(`/crm/deals/${id}`);
    return response.data;
  },

  create: async (data: Partial<Deal>): Promise<Deal> => {
    const response = await api.post<Deal>('/crm/deals', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Deal>): Promise<Deal> => {
    const response = await api.patch<Deal>(`/crm/deals/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/crm/deals/${id}`);
  },
};
