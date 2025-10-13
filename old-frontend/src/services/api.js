// frontend/src/services/api.js

import axios from 'axios';

const apiClient = axios.create({
    // Explicitly point to backend for stable communication
    baseURL: 'http://localhost:5000', 
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Attach JWT token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default apiClient;