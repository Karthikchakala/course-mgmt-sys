// frontend/src/context/AuthContext.tsx

'use client'; 

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie'; // Use cookies for potentially storing the token

// Define User shape
interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'student';
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Axios client pointed directly to the backend server
const authClient = axios.create({
    baseURL: 'http://localhost:5000', // Explicit backend URL (same as before)
    headers: { 'Content-Type': 'application/json' },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Function to handle successful login/registration
    const handleAuthSuccess = (token: string, userData: User) => {
        // Store token in cookies for potential future use (secure method)
        // NOTE: For purely client-side logic, localStorage is often faster. 
        // We'll use localStorage/sessionStorage for simplicity as per previous plan.
        localStorage.setItem('token', token);
        
        setUser(userData);
        setIsAuthenticated(true);
        setIsLoading(false);
    };

    // Check token on initial load (only runs in browser environment)
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            // Simple token check (ideally, this would involve a server call to /auth/me)
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                const storedUser: User = { id: payload.id, name: payload.name || '', email: payload.email, role: payload.role };
                
                // Assuming token is valid enough to hydrate state
                handleAuthSuccess(token, storedUser);
            } catch (e) {
                // Token is malformed or invalid
                logout();
            }
        }
        setIsLoading(false);
    }, []);


    const login = async (email: string, password: string) => {
        const res = await authClient.post('/auth/login', { email, password });
        
        const { token, ...userData } = res.data;
        // The user data returned from the backend is not guaranteed to have 'name' yet, 
        // so we derive the name property from the stored user state.
        handleAuthSuccess(token, { ...userData, name: res.data.name || 'User' });
    };

    const register = async (name: string, email: string, password: string) => {
        const res = await authClient.post('/auth/register', { name, email, password });
        
        const { token, ...userData } = res.data;
        handleAuthSuccess(token, { ...userData, name: name });
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setIsAuthenticated(false);
        setIsLoading(false);
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, login, register, logout, isLoading }}>
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