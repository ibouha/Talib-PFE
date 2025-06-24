<?php
/**
 * Item Controller - Procedural approach
 * Functions to handle item-related HTTP requests
 */

require_once __DIR__ . '/../models_procedural/item_model.php';
require_once __DIR__ . '/../auth_procedural.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/Validator.php';

/**
 * Handle GET /items - Get all items
 */
function handle_get_all_items() {
    try {
        // Get pagination parameters
        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 20;
        $offset = ($page - 1) * $limit;
        
        // Get filter parameters
        $filters = [
            'category' => $_GET['category'] ?? null,
            'location' => $_GET['location'] ?? null,
            'condition' => $_GET['condition'] ?? null,
            'min_price' => $_GET['min_price'] ?? null,
            'max_price' => $_GET['max_price'] ?? null,
            'is_free' => $_GET['is_free'] ?? null,
            'search' => $_GET['search'] ?? null,
            'status' => $_GET['status'] ?? null
        ];
        
        // Remove empty filters
        $filters = array_filter($filters, function($value) {
            return $value !== null && $value !== '';
        });
        
        $items = search_items($filters, 'created_at DESC', $limit, $offset);
        $total = count_items($filters);
        
        Response::success([
            'items' => $items,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $total,
                'pages' => ceil($total / $limit)
            ]
        ]);
        
    } catch (Exception $e) {
        Response::serverError('Failed to retrieve items');
    }
}

/**
 * Handle GET /items/{id} - Get item by ID
 */
function handle_get_item($id) {
    try {
        if (!$id || !is_numeric($id)) {
            Response::error('Invalid item ID', 400);
            return;
        }
        
        $item = get_item_with_details($id);
        
        if (!$item) {
            Response::notFound('Item not found');
            return;
        }
        
        Response::success(['item' => $item]);
        
    } catch (Exception $e) {
        Response::serverError('Failed to retrieve item');
    }
}

/**
 * Handle POST /items - Create new item
 */
function handle_create_item() {
    try {
        // Require student access
        $currentUser = require_student_access();
        
        // Get JSON input
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            Response::error('Invalid JSON data', 400);
            return;
        }
        
        // Validate input
        $errors = validate_item_data($input, true); // true for creation
        
        if (!empty($errors)) {
            Response::validationError($errors);
            return;
        }
        
        // Add student ID to data
        $input['student_id'] = $currentUser['id'];
        
        // Create item
        $item_id = create_item($input);
        
        if (!$item_id) {
            Response::serverError('Failed to create item');
            return;
        }
        
        // Handle image associations if images are provided
        if (isset($input['images']) && is_array($input['images'])) {
            foreach ($input['images'] as $imagePath) {
                if (!empty($imagePath)) {
                    add_item_image($item_id, $imagePath);
                }
            }
        }
        
        // Get created item with details
        $item = get_item_with_details($item_id);
        
        Response::success([
            'message' => 'Item created successfully',
            'item' => $item
        ], 201);
        
    } catch (Exception $e) {
        Response::serverError('Failed to create item');
    }
}

/**
 * Handle PUT /items/{id} - Update item
 */
function handle_update_item($id) {
    try {
        if (!$id || !is_numeric($id)) {
            Response::error('Invalid item ID', 400);
            return;
        }
        
        // Authenticate user
        $currentUser = authenticate_user();
        
        // Check if item exists
        $existing_item = get_item_by_id($id);
        if (!$existing_item) {
            Response::notFound('Item not found');
            return;
        }
        
        // Check if user can update this item
        if ($currentUser['role'] === 'student' && $currentUser['id'] != $existing_item['student_id']) {
            Response::forbidden('You can only update your own items');
            return;
        } elseif ($currentUser['role'] !== 'student' && $currentUser['role'] !== 'admin') {
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
        $errors = validate_item_data($input, false); // false for update
        
        if (!empty($errors)) {
            Response::validationError($errors);
            return;
        }
        
        // Remove student_id from update data (shouldn't be changed)
        unset($input['student_id']);
        
        // Update item
        $success = update_item($id, $input);
        
        if (!$success) {
            Response::serverError('Failed to update item');
            return;
        }
        
        // Get updated item
        $item = get_item_with_details($id);
        
        Response::success([
            'message' => 'Item updated successfully',
            'item' => $item
        ]);
        
    } catch (Exception $e) {
        Response::serverError('Failed to update item');
    }
}

/**
 * Handle PUT /items/{id}/sold - Mark item as sold
 */
function handle_mark_item_sold($id) {
    try {
        if (!$id || !is_numeric($id)) {
            Response::error('Invalid item ID', 400);
            return;
        }
        
        // Authenticate user
        $currentUser = authenticate_user();
        
        // Check if item exists
        $existing_item = get_item_by_id($id);
        if (!$existing_item) {
            Response::notFound('Item not found');
            return;
        }
        
        // Check if user can update this item
        if ($currentUser['role'] === 'student' && $currentUser['id'] != $existing_item['student_id']) {
            Response::forbidden('You can only update your own items');
            return;
        } elseif ($currentUser['role'] !== 'student' && $currentUser['role'] !== 'admin') {
            Response::forbidden('Access denied');
            return;
        }
        
        // Mark as sold
        $success = mark_item_as_sold($id);
        
        if (!$success) {
            Response::serverError('Failed to mark item as sold');
            return;
        }
        
        // Get updated item
        $item = get_item_with_details($id);
        
        Response::success([
            'message' => 'Item marked as sold successfully',
            'item' => $item
        ]);
        
    } catch (Exception $e) {
        Response::serverError('Failed to mark item as sold');
    }
}

/**
 * Handle DELETE /items/{id} - Delete item
 */
function handle_delete_item($id) {
    try {
        if (!$id || !is_numeric($id)) {
            Response::error('Invalid item ID', 400);
            return;
        }
        
        // Authenticate user
        $currentUser = authenticate_user();
        
        // Check if item exists
        $item = get_item_by_id($id);
        if (!$item) {
            Response::notFound('Item not found');
            return;
        }
        
        // Check if user can delete this item
        if ($currentUser['role'] === 'student' && $currentUser['id'] != $item['student_id']) {
            Response::forbidden('You can only delete your own items');
            return;
        } elseif ($currentUser['role'] !== 'student' && $currentUser['role'] !== 'admin') {
            Response::forbidden('Access denied');
            return;
        }
        
        // Delete item
        $success = delete_item($id);
        
        if (!$success) {
            Response::serverError('Failed to delete item');
            return;
        }
        
        Response::success(['message' => 'Item deleted successfully']);
        
    } catch (Exception $e) {
        Response::serverError('Failed to delete item');
    }
}

/**
 * Handle GET /items/categories - Get popular categories
 */
function handle_get_item_categories() {
    try {
        $categories = get_popular_categories();
        
        Response::success(['categories' => $categories]);
        
    } catch (Exception $e) {
        Response::serverError('Failed to retrieve categories');
    }
}

/**
 * Validate item data
 */
function validate_item_data($data, $is_creation = false) {
    $errors = [];
    
    // Required fields for creation
    if ($is_creation) {
        if (empty($data['title'])) {
            $errors['title'] = 'Title is required';
        }
        
        if (empty($data['description'])) {
            $errors['description'] = 'Description is required';
        }
        
        if (!isset($data['price']) || (!is_numeric($data['price']) && !$data['is_free'])) {
            $errors['price'] = 'Valid price is required';
        }
        
        if (empty($data['category'])) {
            $errors['category'] = 'Category is required';
        }
        
        if (empty($data['location'])) {
            $errors['location'] = 'Location is required';
        }
        
        if (!isset($data['is_free'])) {
            $errors['is_free'] = 'Free status is required';
        }
    } else {
        // Optional validation for updates
        if (isset($data['price']) && !is_numeric($data['price']) && !$data['is_free']) {
            $errors['price'] = 'Valid price is required';
        }
    }
    
    // Validate condition if provided
    if (isset($data['condition_status']) && !in_array($data['condition_status'], ['new', 'like_new', 'good', 'fair', 'poor'])) {
        $errors['condition_status'] = 'Invalid condition status';
    }
    
    // Validate status if provided
    if (isset($data['status']) && !in_array($data['status'], ['available', 'sold', 'reserved'])) {
        $errors['status'] = 'Invalid status';
    }
    
    return $errors;
}
