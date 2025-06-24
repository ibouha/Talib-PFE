<?php

require_once __DIR__ . '/../models/Item.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../auth.php';

class ItemController {
    private $itemModel;

    public function __construct() {
        $this->itemModel = new Item();
    }
    
    // Get all items with simple pagination
    public function getAll() {
        // Get page number
        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $limit = 20;
        $offset = ($page - 1) * $limit;

        // Get filters
        $filters = [];
        if (!empty($_GET['category'])) {
            $filters['category'] = $_GET['category'];
        }
        if (!empty($_GET['search'])) {
            $filters['search'] = $_GET['search'];
        }
        if (!empty($_GET['location'])) {
            $filters['location'] = $_GET['location'];
        }
        if (!empty($_GET['min_price'])) {
            $filters['min_price'] = $_GET['min_price'];
        }
        if (!empty($_GET['max_price'])) {
            $filters['max_price'] = $_GET['max_price'];
        }
        if (!empty($_GET['student_id'])) {
            $filters['student_id'] = $_GET['student_id'];
        }

        // Get items from model
        $items = $this->itemModel->searchItems($filters, 'created_at DESC', $limit, $offset);
        $total = $this->itemModel->countItems($filters);

        // Prepare response
        $response = [
            'items' => $items,
            'pagination' => [
                'current_page' => $page,
                'total' => $total,
                'per_page' => $limit,
                'total_pages' => ceil($total / $limit)
            ]
        ];

        Response::success($response, 'Items retrieved successfully');
    }
    
    // Get item by ID
    public function getById($id) {
        if (!$id) {
            Response::error('Item ID is required');
        }

        $item = $this->itemModel->getItemWithDetails($id);

        if (!$item) {
            Response::notFound('Item not found');
        }

        Response::success($item, 'Item found');
    }
    
    // Create new item
    public function create() {
        try {
            // Authenticate user
            $currentUser = authenticateUser();

            // Only students can create item listings
            if ($currentUser['role'] !== 'student') {
                Response::forbidden('Only students can create item listings');
            }

            // Get POST data
            $data = json_decode(file_get_contents('php://input'), true);

            // Simple validation
            if (empty($data['title']) || empty($data['description']) || empty($data['category']) || empty($data['location']) || !isset($data['price'])) {
                Response::error('Required fields: title, description, category, location, price');
            }

            // If item is free, set price to 0
            if (isset($data['is_free']) && $data['is_free']) {
                $data['price'] = 0;
            }

            // Prepare item data
            $itemData = [
                'title' => $data['title'],
                'description' => $data['description'],
                'price' => $data['price'],
                'category' => $data['category'],
                'condition_status' => $data['condition_status'] ?? 'good',
                'is_free' => isset($data['is_free']) ? (bool)$data['is_free'] : false,
                'location' => $data['location'],
                'status' => 'available',
                'student_id' => $currentUser['user_id'] // Get student_id from authenticated user
            ];

            // Create item using model
            $itemId = $this->itemModel->createItem($itemData);

            if ($itemId) {
                // Handle image associations if images are provided
                if (isset($data['images']) && is_array($data['images'])) {
                    foreach ($data['images'] as $imagePath) {
                        if (!empty($imagePath)) {
                            $this->itemModel->addItemImage($itemId, $imagePath);
                        }
                    }
                }

                $item = $this->itemModel->getItemWithDetails($itemId);
                Response::created($item, 'Item created successfully');
            } else {
                Response::error('Failed to create item');
            }
        } catch (Exception $e) {
            Response::serverError($e->getMessage());
        }
    }
    
    /**
     * Update item listing
     */
    public function update($id) {
        try {
            // Authenticate user
            $currentUser = authenticateUser();
            
            // Validate ID
            if (!is_numeric($id)) {
                Response::error('Invalid item ID', 400);
            }
            
            // Check if item exists
            $existingItem = $this->itemModel->findById($id);
            if (!$existingItem) {
                Response::notFound('Item not found');
            }
            
            // Check ownership (only student owner or admin can update)
            if ($currentUser['role'] !== 'admin' && 
                ($currentUser['role'] !== 'student' || $currentUser['user_id'] != $existingItem['student_id'])) {
                Response::forbidden('You can only update your own item listings');
            }
            
            // Get input data
            $input = json_decode(file_get_contents('php://input'), true);
            
            // Validate input (only validate fields that are present)
            $validator = new Validator($input);
            
            if (isset($input['title'])) {
                $validator->required('title', 'Title is required')
                         ->maxLength('title', 100, 'Title must not exceed 100 characters');
            }
            
            if (isset($input['description'])) {
                $validator->required('description', 'Description is required');
            }
            
            if (isset($input['price'])) {
                $validator->numeric('price', 'Price must be a number')
                         ->min('price', 0, 'Price must be positive');
            }
            
            if (isset($input['category'])) {
                $validator->required('category', 'Category is required')
                         ->maxLength('category', 50, 'Category must not exceed 50 characters');
            }
            
            if (isset($input['location'])) {
                $validator->required('location', 'Location is required')
                         ->maxLength('location', 100, 'Location must not exceed 100 characters');
            }
            
            if (isset($input['condition_status'])) {
                $validator->in('condition_status', ['new', 'like_new', 'good', 'fair', 'poor'], 'Condition must be new, like_new, good, fair, or poor');
            }
            
            if (isset($input['status'])) {
                $validator->in('status', ['available', 'sold', 'reserved'], 'Status must be available, sold, or reserved');
            }
            
            if ($validator->fails()) {
                Response::validationError($validator->getErrors());
            }
            
            // Prepare update data
            $updateData = [];
            $allowedFields = ['title', 'description', 'price', 'category', 'condition_status', 'is_free', 'location', 'status'];
            
            foreach ($allowedFields as $field) {
                if (isset($input[$field])) {
                    if ($field === 'is_free') {
                        $updateData[$field] = $input[$field] === true || $input[$field] === 'true' || $input[$field] === 1;
                        // If item is marked as free, set price to 0
                        if ($updateData[$field]) {
                            $updateData['price'] = 0;
                        }
                    } else {
                        $updateData[$field] = $input[$field];
                    }
                }
            }
            
            if (empty($updateData)) {
                Response::error('No valid fields to update', 400);
            }
            
            // Update item
            $success = $this->itemModel->updateItem($id, $updateData);
            
            if ($success) {
                $updatedItem = $this->itemModel->getItemWithDetails($id);
                Response::success($updatedItem, 'Item listing updated successfully');
            } else {
                Response::serverError('Failed to update item listing');
            }
            
        } catch (Exception $e) {
            Response::serverError($e->getMessage());
        }
    }
    
    /**
     * Delete item listing
     */
    public function delete($id) {
        try {
            // Authenticate user
            $currentUser = authenticateUser();
            
            // Validate ID
            if (!is_numeric($id)) {
                Response::error('Invalid item ID', 400);
            }
            
            // Check if item exists
            $existingItem = $this->itemModel->findById($id);
            if (!$existingItem) {
                Response::notFound('Item not found');
            }
            
            // Check ownership (only student owner or admin can delete)
            if ($currentUser['role'] !== 'admin' && 
                ($currentUser['role'] !== 'student' || $currentUser['user_id'] != $existingItem['student_id'])) {
                Response::forbidden('You can only delete your own item listings');
            }
            
            // Delete item (this will cascade delete images and favorites)
            $success = $this->itemModel->delete($id);
            
            if ($success) {
                Response::success(null, 'Item listing deleted successfully');
            } else {
                Response::serverError('Failed to delete item listing');
            }
            
        } catch (Exception $e) {
            Response::serverError($e->getMessage());
        }
    }
    
    /**
     * Get popular categories
     */
    public function getCategories() {
        try {
            $limit = isset($_GET['limit']) ? min(20, max(1, (int)$_GET['limit'])) : 10;
            $categories = $this->itemModel->getPopularCategories($limit);
            
            Response::success($categories, 'Categories retrieved successfully');
            
        } catch (Exception $e) {
            Response::serverError($e->getMessage());
        }
    }
    
    /**
     * Mark item as sold
     */
    public function markAsSold($id) {
        try {
            // Authenticate user
            $currentUser = authenticateUser();
            
            // Validate ID
            if (!is_numeric($id)) {
                Response::error('Invalid item ID', 400);
            }
            
            // Check if item exists
            $existingItem = $this->itemModel->findById($id);
            if (!$existingItem) {
                Response::notFound('Item not found');
            }
            
            // Check ownership
            if ($currentUser['role'] !== 'admin' && 
                ($currentUser['role'] !== 'student' || $currentUser['user_id'] != $existingItem['student_id'])) {
                Response::forbidden('You can only update your own item listings');
            }
            
            // Mark as sold
            $success = $this->itemModel->markAsSold($id);
            
            if ($success) {
                Response::success(null, 'Item marked as sold successfully');
            } else {
                Response::serverError('Failed to mark item as sold');
            }
            
        } catch (Exception $e) {
            Response::serverError($e->getMessage());
        }
    }
}
