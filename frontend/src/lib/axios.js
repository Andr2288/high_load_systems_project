import axios from "axios";

// Detect environment and API URL
const getBaseURL = () => {
    // Check if we're in browser environment
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        const protocol = window.location.protocol;

        // Production environment (Render)
        if (hostname.includes('flasheng-frontend')) {
            return 'https://flasheng-backend.onrender.com/api';
        }

        // Local development
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'http://localhost:5001/api';
        }

        // Fallback for other custom domains
        return `${protocol}//${hostname.replace('frontend', 'backend')}/api`;
    }

    // Server-side rendering fallback
    return 'http://localhost:5001/api';
};

export const axiosInstance = axios.create({
    baseURL: getBaseURL(),
    withCredentials: true,
    timeout: 30000, // 30 seconds timeout
    headers: {
        'Content-Type': 'application/json',
    }
});

// Request interceptor for debugging
axiosInstance.interceptors.request.use(
    (config) => {
        if (process.env.NODE_ENV === 'development') {
            console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        }
        return config;
    },
    (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
    (response) => {
        if (process.env.NODE_ENV === 'development') {
            console.log(`✅ API Response: ${response.status} ${response.config.url}`);
        }
        return response;
    },
    (error) => {
        if (process.env.NODE_ENV === 'development') {
            console.error(`❌ API Error: ${error.response?.status} ${error.config?.url}`, error.response?.data);
        }

        // Handle common errors
        if (error.response?.status === 401) {
            // Unauthorized - clear token and redirect to login
            localStorage.removeItem('token');
            if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);