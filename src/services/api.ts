import axios from 'axios';
import type { Expense, Category, DashboardStats, AuthResponse, BillsResponse, User } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

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

    updateProfile: async (data: Partial<User>): Promise<User> => {
        const response = await api.put<User>('/auth/profile', data);
        return response.data;
    },

    changePassword: async (password: string) => {
        const response = await api.put('/auth/password', { password });
        return response.data;
    },
    uploadAvatar: async (formData: FormData) => {
        const response = await api.post('/auth/upload-avatar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
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
    getStats: async (monthlyPeriod: '3months' | '6months' | 'year' | 'month' | 'lastYear' = '3months', categoryPeriod: '3months' | '6months' | 'year' | 'month' | 'lastYear' = '3months'): Promise<DashboardStats> => {
        const response = await api.get<DashboardStats>('/dashboard/stats', { params: { monthlyPeriod, categoryPeriod } });
        return response.data;
    },
};

//Cards API
export const cardsAPI = {
    getAll: async (): Promise<any[]> => {
        const response = await api.get('/cards');
        return response.data;
    },
    create: async (data: { name: string; bank: string }): Promise<any> => {
        const response = await api.post('/cards', data);
        return response.data;
    },
    update: async (id: number, data: { name: string; bank: string }): Promise<any> => {
        const response = await api.put(`/cards/${id}`, data);
        return response.data;
    },
    delete: async (id: number): Promise<void> => {
        await api.delete(`/cards/${id}`);
    },
    getStats: async (): Promise<any[]> => {
        const response = await api.get('/cards/stats');
        return response.data;
    },
};

// Goals API
export const goalsAPI = {
    getAll: async (): Promise<any[]> => {
        const response = await api.get('/goals');
        return response.data;
    },
    create: async (data: any): Promise<any> => {
        const response = await api.post('/goals', data);
        return response.data;
    },
    update: async (id: number, data: any): Promise<any> => {
        const response = await api.put(`/goals/${id}`, data);
        return response.data;
    },
    delete: async (id: number): Promise<void> => {
        await api.delete(`/goals/${id}`);
    },
};

export default api;
