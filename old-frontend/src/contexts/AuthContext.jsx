// frontend/src/contexts/AuthContext.jsx

import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// Explicit client pointing to backend root
const authClient = axios.create({
    baseURL: 'http://localhost:5000', 
    headers: { 'Content-Type': 'application/json' },
});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const storedToken = localStorage.getItem('token');
            const storedUser = JSON.parse(localStorage.getItem('user'));

            if (storedToken && storedUser) {
                try {
                    // Simple token expiration check
                    const payload = JSON.parse(atob(storedToken.split('.')[1]));
                    if (payload.exp * 1000 > Date.now()) {
                         setUser(storedUser);
                    } else {
                        logout();
                    }
                } catch (e) {
                    logout();
                }
            }
            setIsLoading(false);
        };
        checkAuth();
    }, [token]);

    const handleAuthSuccess = (res) => {
        const { token, ...userData } = res.data;
        localStorage.setItem('token', token);
        
        const userToStore = { ...userData, name: userData.name || 'User' };
        localStorage.setItem('user', JSON.stringify(userToStore)); 
        
        setToken(token);
        setUser(userToStore);
        return true;
    };

    const login = async (email, password) => {
        // FIX: Call the full path /auth/login explicitly
        const res = await authClient.post('/auth/login', { email, password });
        return handleAuthSuccess(res);
    };

    const register = async (name, email, password) => {
        // FIX: Call the full path /auth/register explicitly
        const res = await authClient.post('/auth/register', { name, email, password });
        // Backend returns user data but registration often doesn't return full name in payload, so derive it
        const userData = { ...res.data, name };
        return handleAuthSuccess({ data: userData });
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    };

    const value = {
        user,
        token,
        isLoading,
        isAuthenticated: !!token && !!user,
        login,
        register,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {!isLoading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};