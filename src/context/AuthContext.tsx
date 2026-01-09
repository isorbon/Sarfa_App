import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '../services/api';
import type { User } from '../types';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, name: string) => Promise<void>;
    logout: () => void;
    updateUser: (data: Partial<User>) => Promise<void>;
    changePassword: (password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in on mount
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (token && storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                console.error('Error parsing stored user:', error);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }

        setLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        const response = await authAPI.login(email, password);
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        setUser(response.user);
    };

    const register = async (email: string, password: string, name: string) => {
        const response = await authAPI.register(email, password, name);
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        setUser(response.user);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    const updateUser = async (data: Partial<User>) => {
        const updatedUser = await authAPI.updateProfile(data);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
    };

    const changePassword = async (password: string) => {
        await authAPI.changePassword(password);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, changePassword }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
