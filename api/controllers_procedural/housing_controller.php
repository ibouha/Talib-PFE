<?php
/**
 * Housing Controller - Procedural approach
 * Functions to handle housing-related HTTP requests
 */

require_once __DIR__ . '/../models_procedural/housing_model.php';
require_once __DIR__ . '/../auth_procedural.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/Validator.php';

/**
 * Handle GET /housing - Get all housing listings
 */
function handle_get_all_housing() {
    try {
        // Get pagination parameters
        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 20;
        $offset = ($page - 1) * $limit;
        
        // Get filter parameters
        $filters = [
            'city' => $_GET['city'] ?? null,
            'type' => $_GET['type'] ?? null,
            'min_price' => $_GET['min_price'] ?? null,
            'max_price' => $_GET['max_price'] ?? null,
            'bedrooms' => $_GET['bedrooms'] ?? null,
            'is_furnished' => $_GET['is_furnished'] ?? null,
            'status' => $_GET['status'] ?? null
        ];
        
        // Remove empty filters
        $filters = array_filter($filters, function($value) {
            return $value !== null && $value !== '';
        });
        
        $housing = get_all_housing($filters, $limit, $offset);
        $total = count_housing($filters);
        
        Response::success([
            'housing' => $housing,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $total,
                'pages' => ceil($total / $limit)
            ]
        ]);
        
    } catch (Exception $e) {
        Response::serverError('Failed to retrieve housing listings');
    }
}

/**
 * Handle GET /housing/{id} - Get housing by ID
 */
function handle_get_housing($id) {
    try {
        if (!$id || !is_numeric($id)) {
            Response::error('Invalid housing ID', 400);
            return;
        }
        
        $housing = get_housing_with_details($id);
        
        if (!$housing) {
            Response::notFound('Housing not found');
            return;
        }
        
        Response::success(['housing' => $housing]);
        
    } catch (Exception $e) {
        Response::serverError('Failed to retrieve housing');
    }
}

/**
 * Handle POST /housing - Create new housing listing
 */
function handle_create_housing() {
    try {
        // Require owner access
        $currentUser = require_owner_access();
        
        // Get JSON input
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            Response::error('Invalid JSON data', 400);
            return;
        }
        
        // Validate input
        $errors = validate_housing_data($input, true); // true for creation
        
        if (!empty($errors)) {
            Response::validationError($errors);
            return;
        }
        
        // Add owner ID to data
        $input['owner_id'] = $currentUser['id'];
        
        // Create housing
        $housing_id = create_housing($input);
        
        if (!$housing_id) {
            Response::serverError('Failed to create housing listing');
            return;
        }
        
        // Handle image associations if images are provided
        if (isset($input['images']) && is_array($input['images'])) {
            foreach ($input['images'] as $imagePath) {
                if (!empty($imagePath)) {
                    add_housing_image($housing_id, $imagePath);
                }
            }
        }
        
        // Get created housing with details
        $housing = get_housing_with_details($housing_id);
        
        Response::success([
            'message' => 'Housing listing created successfully',
            'housing' => $housing
        ], 201);
        
    } catch (Exception $e) {
        Response::serverError('Failed to create housing listing');
    }
}

/**
 * Handle PUT /housing/{id} - Update housing listing
 */
function handle_update_housing($id) {
    try {
        if (!$id || !is_numeric($id)) {
            Response::error('Invalid housing ID', 400);
            return;
        }
        
        // Authenticate user
        $currentUser = authenticate_user();
        
        // Check if housing exists
        $existing_housing = get_housing_by_id($id);
        if (!$existing_housing) {
            Response::notFound('Housing not found');
            return;
        }
        
        // Check if user can update this housing
        if ($currentUser['role'] === 'owner' && $currentUser['id'] != $existing_housing['owner_id']) {
            Response::forbidden('You can only update your own housing listings');
            return;
        } elseif ($currentUser['role'] !== 'owner' && $currentUser['role'] !== 'admin') {
            Response::forbidden('Access denied');
            return;
        }
        
        // Get JSON input
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            Response::error('Invalid JSON data', 400);
            return;
        }
        
        // Validate input
        $errors = validate_housing_data($input, false); // false for update
        
        if (!empty($errors)) {
            Response::validationError($errors);
            return;
        }
        
        // Remove owner_id from update data (shouldn't be changed)
        unset($input['owner_id']);
        
        // Update housing
        $success = update_housing($id, $input);
        
        if (!$success) {
            Response::serverError('Failed to update housing listing');
            return;
        }
        
        // Get updated housing
        $housing = get_housing_with_details($id);
        
        Response::success([
            'message' => 'Housing listing updated successfully',
            'housing' => $housing
        ]);
        
    } catch (Exception $e) {
        Response::serverError('Failed to update housing listing');
    }
}

/**
 * Handle DELETE /housing/{id} - Delete housing listing
 */
function handle_delete_housing($id) {
    try {
        if (!$id || !is_numeric($id)) {
            Response::error('Invalid housing ID', 400);
            return;
        }
        
        // Authenticate user
        $currentUser = authenticate_user();
        
        // Check if housing exists
        $housing = get_housing_by_id($id);
        if (!$housing) {
            Response::notFound('Housing not found');
            return;
        }
        
        // Check if user can delete this housing
        if ($currentUser['role'] === 'owner' && $currentUser['id'] != $housing['owner_id']) {
            Response::forbidden('You can only delete your own housing listings');
            return;
        } elseif ($currentUser['role'] !== 'owner' && $currentUser['role'] !== 'admin') {
            Response::forbidden('Access denied');
            return;
        }
        
        // Delete housing
        $success = delete_housing($id);
        
        if (!$success) {
            Response::serverError('Failed to delete housing listing');
            return;
        }
        
        Response::success(['message' => 'Housing listing deleted successfully']);
        
    } catch (Exception $e) {
        Response::serverError('Failed to delete housing listing');
    }
}

/**
 * Handle POST /housing/{id}/contact - Contact housing owner
 */
function handle_housing_contact($id) {
    try {
        if (!$id || !is_numeric($id)) {
            Response::error('Invalid housing ID', 400);
            return;
        }
        
        // Require student access
        $currentUser = require_student_access();
        
        // Check if housing exists
        $housing = get_housing_by_id($id);
        if (!$housing) {
            Response::notFound('Housing not found');
            return;
        }
        
        // Get JSON input
        $input = json_decode(file_get_contents('php://input'), true);
        $message = isset($input['message']) ? $input['message'] : null;
        
        // Add housing contact
        $success = add_housing_contact($id, $currentUser['id'], $message);
        
        if (!$success) {
            Response::serverError('Failed to send contact request');
            return;
        }
        
        Response::success(['message' => 'Contact request sent successfully']);
        
    } catch (Exception $e) {
        Response::serverError('Failed to send contact request');
    }
}

/**
 * Validate housing data
 */
function validate_housing_data($data, $is_creation = false) {
    $errors = [];
    
    // Required fields for creation
    if ($is_creation) {
        if (empty($data['title'])) {
            $errors['title'] = 'Title is required';
        }
        
        if (empty($data['description'])) {
            $errors['description'] = 'Description is required';
        }
        
        if (empty($data['address'])) {
            $errors['address'] = 'Address is required';
        }
        
        if (empty($data['city'])) {
            $errors['city'] = 'City is required';
        }
        
        if (empty($data['type'])) {
            $errors['type'] = 'Type is required';
        } elseif (!in_array($data['type'], ['studio', 'apartment', 'shared', 'dormitory'])) {
            $errors['type'] = 'Invalid type';
        }
        
        if (!isset($data['bedrooms']) || !is_numeric($data['bedrooms']) || $data['bedrooms'] < 0) {
            $errors['bedrooms'] = 'Valid number of bedrooms is required';
        }
        
        if (!isset($data['bathrooms']) || !is_numeric($data['bathrooms']) || $data['bathrooms'] < 0) {
            $errors['bathrooms'] = 'Valid number of bathrooms is required';
        }
        
        if (!isset($data['area']) || !is_numeric($data['area']) || $data['area'] <= 0) {
            $errors['area'] = 'Valid area is required';
        }
        
        if (!isset($data['price']) || !is_numeric($data['price']) || $data['price'] <= 0) {
            $errors['price'] = 'Valid price is required';
        }
        
        if (empty($data['available_from'])) {
            $errors['available_from'] = 'Available from date is required';
        }
        
        if (empty($data['available_to'])) {
            $errors['available_to'] = 'Available to date is required';
        }
        
        if (!isset($data['is_furnished'])) {
            $errors['is_furnished'] = 'Furnished status is required';
        }
    } else {
        // Optional validation for updates
        if (isset($data['type']) && !in_array($data['type'], ['studio', 'apartment', 'shared', 'dormitory'])) {
            $errors['type'] = 'Invalid type';
        }
        
        if (isset($data['bedrooms']) && (!is_numeric($data['bedrooms']) || $data['bedrooms'] < 0)) {
            $errors['bedrooms'] = 'Valid number of bedrooms is required';
        }
        
        if (isset($data['bathrooms']) && (!is_numeric($data['bathrooms']) || $data['bathrooms'] < 0)) {
            $errors['bathrooms'] = 'Valid number of bathrooms is required';
        }
        
        if (isset($data['area']) && (!is_numeric($data['area']) || $data['area'] <= 0)) {
            $errors['area'] = 'Valid area is required';
        }
        
        if (isset($data['price']) && (!is_numeric($data['price']) || $data['price'] <= 0)) {
            $errors['price'] = 'Valid price is required';
        }
    }
    
    return $errors;
}
