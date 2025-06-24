// API Configuration for Talib Backend
import axios from 'axios';

// Base URL for your PHP API
const BASE_URL = 'http://localhost/Talib-PFE/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    // List of endpoints that don't require authentication
    const publicEndpoints = [
      '/endpoints/housing.php',
      '/endpoints/items.php',
      '/endpoints/roommates.php',
      '/endpoints/auth.php'
    ];

    // Check if this is a public endpoint (GET requests to view data)
    const isPublicEndpoint = publicEndpoints.some(endpoint =>
      config.url?.includes(endpoint)
    );

    const isGetRequest = config.method?.toLowerCase() === 'get';

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Adding token to request:', {
        url: config.url,
        method: config.method,
        token: token.substring(0, 20) + '...' // Log first 20 chars for debugging
      });
    } else if (!isPublicEndpoint || !isGetRequest) {
      // Only log warning for endpoints that actually require authentication
      console.warn('No token found for request:', config.url);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors and clean responses
api.interceptors.response.use(
  (response) => {
    console.log('API Response received:', {
      url: response.config?.url,
      status: response.status,
      data: response.data
    });

    // Handle mixed HTML/JSON responses (PHP warnings + JSON)
    if (typeof response.data === 'string' && response.data.includes('<br />')) {
      try {
        // Extract JSON from the response by finding the last { and parsing from there
        const jsonStart = response.data.lastIndexOf('{');
        if (jsonStart !== -1) {
          const jsonString = response.data.substring(jsonStart);
          response.data = JSON.parse(jsonString);
          console.log('Cleaned response data:', response.data);
        }
      } catch (error) {
        console.error('Failed to parse mixed HTML/JSON response:', error);
      }
    }

    return response;
  },
  (error) => {
    console.error('API Error:', {
      status: error.response?.status,
      url: error.config?.url,
      method: error.config?.method,
      data: error.response?.data,
      headers: error.config?.headers,
      message: error.message
    });

    if (error.response?.status === 401) {
      console.warn('401 Unauthorized - logging out user');
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    REGISTER: '/endpoints/auth.php?action=register',
    LOGIN: '/endpoints/auth.php?action=login',
    ADMIN_LOGIN: '/endpoints/auth.php?action=admin-login',
  },
  
  // Items
  ITEMS: {
    GET_ALL: '/endpoints/items.php',
    GET_BY_ID: (id: string) => `/endpoints/items.php?id=${id}`,
    CREATE: '/endpoints/items.php',
    UPDATE: (id: string) => `/endpoints/items.php?id=${id}`,
    DELETE: (id: string) => `/endpoints/items.php?id=${id}`,
    CATEGORIES: '/endpoints/items.php?action=categories',
  },

  // Housing
  HOUSING: {
    GET_ALL: '/endpoints/housing.php',
    GET_BY_ID: (id: string) => `/endpoints/housing.php?id=${id}`,
    CREATE: '/endpoints/housing.php',
    UPDATE: (id: string) => `/endpoints/housing.php?id=${id}`,
    DELETE: (id: string) => `/endpoints/housing.php?id=${id}`,
    CONTACT: (id: string) => `/endpoints/housing.php?id=${id}&action=contact`,
  },
  
  // Students
  STUDENTS: {
    GET_ALL: '/endpoints/students.php',
    GET_BY_ID: (id: string) => `/endpoints/students.php?id=${id}`,
    UPDATE: (id: string) => `/endpoints/students.php?id=${id}`,
    GET_ITEMS: (id: string) => `/endpoints/students.php?id=${id}&action=items`,
  },
  
  // Roommates
  ROOMMATES: {
    GET_ALL: '/endpoints/roommates.php',
    GET_BY_ID: (id: string) => `/endpoints/roommates.php?id=${id}`,
    CREATE: '/endpoints/roommates.php',
    UPDATE: (id: string) => `/endpoints/roommates.php?id=${id}`,
    DELETE: (id: string) => `/endpoints/roommates.php?id=${id}`,
    BY_STUDENT: (studentId: string) => `/endpoints/roommates.php?action=by-student&student_id=${studentId}`,
    COMPATIBLE: (id: string) => `/endpoints/roommates.php?action=compatible&id=${id}`,
  },
  
  // Favorites
  FAVORITES: {
    GET_ALL: (studentId: string) => `/endpoints/favorites.php?student_id=${studentId}`,
    CREATE: '/endpoints/favorites.php',
    DELETE: (id: string) => `/endpoints/favorites.php?id=${id}`,
    STATS: (studentId: string) => `/endpoints/favorites.php?action=stats&student_id=${studentId}`,
    CHECK: (studentId: string, type: string, itemId: string) => `/endpoints/favorites.php?action=check&student_id=${studentId}&type=${type}&item_id=${itemId}`,
  },
};

// Types for API responses
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  items?: T[];
  housing?: T[];
  roommates?: T[];
  data?: T[]; // Backend returns data in this format
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

// User types
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  university?: string;
  role: 'student' | 'owner' | 'admin';
  created_at?: string;
  updated_at?: string;
}

// Item types
export interface Item {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition_status?: string;
  is_free: boolean;
  status?: string;
  location: string;
  student_id: string;
  images?: string[]; // Array of image URLs
  created_at: string;
  updated_at: string;
  // Seller information (from JOIN with student table)
  seller_name?: string;
  seller_email?: string;
  seller_phone?: string;
  seller_university?: string;
}

// Housing types
export interface Housing {
  id: string;
  title: string;
  description: string;
  address: string;
  city: string;
  price: number;
  type: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  available_from: string;
  available_to: string;
  is_furnished: boolean;
  amenities: string;
  status?: string;
  owner_id: string;
  images?: string[]; // Array of image URLs
  created_at: string;
  updated_at: string;
}

// Roommate types
export interface RoommateProfile {
  id: string;
  student_id: string;
  headline: string;
  description: string;
  monthly_budget: number;
  move_in_date: string;
  duration: string;
  preferences?: string;
  location_preference: string;
  created_at: string;
  updated_at: string;
  student_name?: string;
  student_university?: string;
  avatar?: string; // Add avatar field
}

// Favorite types
export interface Favorite {
  id: string;
  student_id: string;
  type: 'Item' | 'Housing' | 'RoommateProfile';
  item_id?: string;
  housing_id?: string;
  roommateProfile_id?: string;
  created_at: string;
}

export default api;
