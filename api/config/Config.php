<?php

// Simple configuration file

// Database configuration
$db_host = 'localhost';
$db_name = 'talib';
$db_user = 'root';
$db_pass = '';

// JWT configuration
$jwt_secret = 'your-secret-key-change-this-in-production';
$jwt_expiration = 86400; // 24 hours in seconds

// File upload configuration
$upload_dir = '../uploads/';
$max_file_size = 5242880; // 5MB in bytes
$allowed_image_types = array('image/jpeg', 'image/png', 'image/gif', 'image/webp');

// API configuration
$api_version = 'v1';
$base_url = 'http://localhost/Talib-PFE/api/';

// Pagination
$default_page_size = 20;
$max_page_size = 100;

// CORS configuration
$allowed_origins = array(
    'http://localhost:5173', // Vite dev server
    'http://localhost:5174', // Vite dev server
    'http://localhost:5175', // Vite dev server
    'http://localhost:3000', // React dev server
    'http://localhost:8080'  // Alternative dev server
);

// Error messages
$error_messages = array(
    'INVALID_CREDENTIALS' => 'Invalid email or password',
    'USER_NOT_FOUND' => 'User not found',
    'EMAIL_EXISTS' => 'Email already exists',
    'PHONE_EXISTS' => 'Phone number already exists',
    'UNAUTHORIZED' => 'Unauthorized access',
    'FORBIDDEN' => 'Access forbidden',
    'VALIDATION_ERROR' => 'Validation error',
    'SERVER_ERROR' => 'Internal server error',
    'NOT_FOUND' => 'Resource not found',
    'FILE_UPLOAD_ERROR' => 'File upload failed',
    'INVALID_FILE_TYPE' => 'Invalid file type',
    'FILE_TOO_LARGE' => 'File size too large'
);

// Success messages
$success_messages = array(
    'USER_CREATED' => 'User created successfully',
    'LOGIN_SUCCESS' => 'Login successful',
    'LOGOUT_SUCCESS' => 'Logout successful',
    'DATA_RETRIEVED' => 'Data retrieved successfully',
    'DATA_CREATED' => 'Data created successfully',
    'DATA_UPDATED' => 'Data updated successfully',
    'DATA_DELETED' => 'Data deleted successfully',
    'FILE_UPLOADED' => 'File uploaded successfully'
);

// Simple function to check if development mode
function isDevelopment() {
    return true; // Set to false in production
}
