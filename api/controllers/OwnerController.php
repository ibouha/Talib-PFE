<?php

require_once __DIR__ . '/../models/Owner.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/Validator.php';
require_once __DIR__ . '/../auth.php';

class OwnerController {
    private $ownerModel;
    
    public function __construct() {
        $this->ownerModel = new Owner();
    }
    
    /**
     * Get all owners with pagination and filters
     */
    public function getAll() {
        try {
            // Get query parameters
            $page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
            $limit = isset($_GET['limit']) ? min(50, max(1, intval($_GET['limit']))) : 20;
            $offset = ($page - 1) * $limit;
            
            $search = $_GET['search'] ?? '';
            
            // Get owners based on filters
            if (!empty($search)) {
                $owners = $this->ownerModel->search($search, $limit, $offset);
                $total = $this->ownerModel->count(); // For simplicity, using total count
            } else {
                $owners = $this->ownerModel->findAll([], 'created_at DESC', $limit, $offset);
                $total = $this->ownerModel->count();
            }
            
            // Remove sensitive data
            foreach ($owners as &$owner) {
                unset($owner['password']);
            }
            
            // Prepare pagination info
            $pagination = [
                'current_page' => $page,
                'per_page' => $limit,
                'total' => $total,
                'total_pages' => ceil($total / $limit),
                'has_next' => $page < ceil($total / $limit),
                'has_prev' => $page > 1
            ];
            
            Response::paginated($owners, $pagination, 'Owners retrieved successfully');
            
        } catch (Exception $e) {
            Response::serverError($e->getMessage());
        }
    }
    
    /**
     * Get owner by ID
     */
    public function getById($id) {
        try {
            if (!$id) {
                Response::error('Owner ID is required', 400);
            }
            
            if (!is_numeric($id)) {
                Response::error('Invalid owner ID', 400);
            }
            
            $owner = $this->ownerModel->getProfileWithStats($id);
            
            if (!$owner) {
                Response::notFound('Owner not found');
            }
            
            // Remove sensitive data
            unset($owner['password']);
            
            Response::success($owner, 'Owner found');
            
        } catch (Exception $e) {
            Response::serverError($e->getMessage());
        }
    }
    
    /**
     * Update owner profile
     */
    public function update($id) {
        try {
            // Authenticate user
            $currentUser = requireAuth();
            
            // Check if user is updating their own profile or is admin
            if ($currentUser['role'] !== 'admin' && $currentUser['user_id'] != $id) {
                Response::forbidden('You can only update your own profile');
            }
            
            // Validate ID
            if (!is_numeric($id)) {
                Response::error('Invalid owner ID', 400);
            }
            
            // Check if owner exists
            $existingOwner = $this->ownerModel->findById($id);
            if (!$existingOwner) {
                Response::notFound('Owner not found');
            }
            
            // Get input data
            $input = json_decode(file_get_contents('php://input'), true);
            
            // Validate input
            $validator = new Validator($input);
            
            // Only validate fields that are present
            if (isset($input['name'])) {
                $validator->required('name', 'Name is required')
                         ->maxLength('name', 100, 'Name must not exceed 100 characters');
            }
            
            if (isset($input['phone'])) {
                $validator->required('phone', 'Phone number is required')
                         ->phone('phone', 'Please provide a valid phone number');
                
                // Check if phone is already taken by another owner
                $existingPhone = $this->ownerModel->findByPhone($input['phone']);
                if ($existingPhone && $existingPhone['id'] != $id) {
                    Response::error('Phone number already exists', 409);
                }
            }
            
            // Note: bio and gender fields will be added to owner table later
            // For now, we skip validation for these fields
            
            if ($validator->fails()) {
                Response::validationError($validator->getErrors());
            }
            
            // Prepare update data
            $updateData = [];
            $allowedFields = ['name', 'phone', 'image']; // Only fields that exist in current owner table
            
            foreach ($allowedFields as $field) {
                if (isset($input[$field])) {
                    $updateData[$field] = $input[$field];
                }
            }
            
            if (empty($updateData)) {
                Response::error('No valid fields to update', 400);
            }
            
            // Update owner
            $success = $this->ownerModel->updateProfile($id, $updateData);
            
            if ($success) {
                $updatedOwner = $this->ownerModel->getProfileWithStats($id);
                Response::success($updatedOwner, 'Profile updated successfully');
            } else {
                Response::serverError('Failed to update profile');
            }
            
        } catch (Exception $e) {
            Response::serverError($e->getMessage());
        }
    }
    
    /**
     * Change owner password
     */
    public function changePassword($id) {
        try {
            // Authenticate user
            $currentUser = requireAuth();
            
            // Check if user is updating their own profile or is admin
            if ($currentUser['role'] !== 'admin' && $currentUser['user_id'] != $id) {
                Response::forbidden('You can only change your own password');
            }
            
            // Validate ID
            if (!is_numeric($id)) {
                Response::error('Invalid owner ID', 400);
            }
            
            // Get input data
            $input = json_decode(file_get_contents('php://input'), true);
            
            // Validate input
            $validator = new Validator($input);
            $validator->required('current_password', 'Current password is required')
                     ->required('new_password', 'New password is required')
                     ->minLength('new_password', 6, 'New password must be at least 6 characters');
            
            if ($validator->fails()) {
                Response::validationError($validator->getErrors());
            }
            
            // Verify current password (only if not admin)
            if ($currentUser['role'] !== 'admin') {
                $owner = $this->ownerModel->findById($id);
                if (!password_verify($input['current_password'], $owner['password'])) {
                    Response::error('Current password is incorrect', 400);
                }
            }
            
            // Change password
            $success = $this->ownerModel->changePassword($id, $input['new_password']);
            
            if ($success) {
                Response::success(null, 'Password changed successfully');
            } else {
                Response::serverError('Failed to change password');
            }
            
        } catch (Exception $e) {
            Response::serverError($e->getMessage());
        }
    }
}
?>
