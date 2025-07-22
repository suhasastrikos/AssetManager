import axios, { AxiosResponse } from 'axios';
import { ApiResponse, PaginatedResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export class BaseService<T> {
  constructor(protected endpoint: string) {}

  async getAll(params?: Record<string, any>): Promise<PaginatedResponse<T>> {
    const response: AxiosResponse<PaginatedResponse<T>> = await api.get(this.endpoint, { params });
    return response.data;
  }

  async getById(id: string): Promise<T> {
    const response: AxiosResponse<ApiResponse<T>> = await api.get(`${this.endpoint}/${id}`);
    return response.data.data;
  }

  async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    const response: AxiosResponse<ApiResponse<T>> = await api.post(this.endpoint, data);
    return response.data.data;
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    const response: AxiosResponse<ApiResponse<T>> = await api.put(`${this.endpoint}/${id}`, data);
    return response.data.data;
  }

  async delete(id: string): Promise<void> {
    await api.delete(`${this.endpoint}/${id}`);
  }
}