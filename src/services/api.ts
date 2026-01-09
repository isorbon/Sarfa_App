import axios from 'axios';
import type { Expense, Category, DashboardStats, AuthResponse, BillsResponse } from '../types';

const API_BASE_URL = '/api';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auth API
export const authAPI = {
    login: async (email: string, password: string): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/auth/login', { email, password });
        return response.data;
    },

    register: async (email: string, password: string, name: string): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/auth/register', { email, password, name });
        return response.data;
    },
};

// Expenses API
export const expensesAPI = {
    getAll: async (params?: { startDate?: string; endDate?: string; category?: string }): Promise<Expense[]> => {
        const response = await api.get<Expense[]>('/expenses', { params });
        return response.data;
    },

    create: async (expense: Omit<Expense, 'id' | 'user_id' | 'created_at'>): Promise<Expense> => {
        const response = await api.post<Expense>('/expenses', expense);
        return response.data;
    },

    update: async (id: number, expense: Partial<Expense>): Promise<Expense> => {
        const response = await api.put<Expense>(`/expenses/${id}`, expense);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/expenses/${id}`);
    },
};

// Categories API
export const categoriesAPI = {
    getAll: async (): Promise<Category[]> => {
        const response = await api.get<Category[]>('/categories');
        return response.data;
    },
};

// Bills API
export const billsAPI = {
    getAll: async (params?: { search?: string; startDate?: string; endDate?: string }): Promise<BillsResponse> => {
        const response = await api.get<BillsResponse>('/bills', { params });
        return response.data;
    },
};

// Dashboard API
export const dashboardAPI = {
    getStats: async (period: 'recent' | 'month' | 'year' = 'recent'): Promise<DashboardStats> => {
        const response = await api.get<DashboardStats>('/dashboard/stats', { params: { period } });
        return response.data;
    },
};

export default api;
