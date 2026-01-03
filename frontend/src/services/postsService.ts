// ===========================================
// Posts Service - CMS Posts API Calls
// ===========================================

import api from './api';

// ===========================================
// Types
// ===========================================
export type Post = {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  excerpt: string | null;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  featuredImage: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
  };
  category: {
    id: string;
    name: string;
  } | null;
};

export type CreatePostData = {
  title: string;
  content?: string;
  excerpt?: string;
  categoryId?: string;
  status?: 'DRAFT' | 'PUBLISHED';
  metaTitle?: string;
  metaDescription?: string;
};

export type UpdatePostData = Partial<CreatePostData>;

export type PostsResponse = {
  data: Post[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
};

// ===========================================
// Posts Service Functions
// ===========================================
export const postsService = {
  // Get all posts
  getAll: async (): Promise<Post[]> => {
    const response = await api.get<PostsResponse>('/posts');
    return response.data.data;
  },

  // Get single post
  getById: async (id: string): Promise<Post> => {
    const response = await api.get<Post>(`/posts/${id}`);
    return response.data;
  },

  // Create post
  create: async (data: CreatePostData): Promise<Post> => {
    const response = await api.post<Post>('/posts', data);
    return response.data;
  },

  // Update post
  update: async (id: string, data: UpdatePostData): Promise<Post> => {
    const response = await api.patch<Post>(`/posts/${id}`, data);
    return response.data;
  },

  // Delete post
  delete: async (id: string): Promise<void> => {
    await api.delete(`/posts/${id}`);
  },

  // Publish post
  publish: async (id: string): Promise<Post> => {
    const response = await api.patch<Post>(`/posts/${id}/publish`);
    return response.data;
  },
};
