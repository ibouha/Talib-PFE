<?php

require_once __DIR__ . '/../models/Housing.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/Validator.php';
require_once __DIR__ . '/../auth.php';

class HousingController {
    private $housingModel;
    
    public function __construct() {
        $this->housingModel = new Housing();
    }
    
    /**
     * Get all housing with pagination and filters
     */
    public function getAll() {
        try {
            // Get query parameters
            $page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
            $limit = isset($_GET['limit']) ? min(50, max(1, intval($_GET['limit']))) : 20;
            $offset = ($page - 1) * $limit;
            
            $city = $_GET['city'] ?? '';
            $type = $_GET['type'] ?? '';
            $minPrice = isset($_GET['min_price']) ? floatval($_GET['min_price']) : null;
            $maxPrice = isset($_GET['max_price']) ? floatval($_GET['max_price']) : null;
            $search = $_GET['search'] ?? '';
            $ownerId = $_GET['owner_id'] ?? '';

            // Build filters
            $filters = [];
            if (!empty($city)) $filters['city'] = $city;
            if (!empty($type)) $filters['type'] = $type;
            if ($minPrice !== null) $filters['min_price'] = $minPrice;
            if ($maxPrice !== null) $filters['max_price'] = $maxPrice;
            if (!empty($search)) $filters['search'] = $search;
            if (!empty($ownerId)) $filters['owner_id'] = $ownerId;
            
            // Get housing with images (always use searchHousing method to include images)
            $housing = $this->housingModel->searchHousing($filters, 'created_at DESC', $limit, $offset);
            $total = $this->housingModel->countHousing($filters);
            
            // Prepare pagination info
            $pagination = [
                'current_page' => $page,
                'per_page' => $limit,
                'total' => $total,
                'total_pages' => ceil($total / $limit),
                'has_next' => $page < ceil($total / $limit),
                'has_prev' => $page > 1
            ];
            
            Response::paginated($housing, $pagination, 'Housing retrieved successfully');
            
        } catch (Exception $e) {
            Response::serverError($e->getMessage());
        }
    }
    
    /**
     * Get housing by ID
     */
    public function getById($id) {
        try {
            if (!$id) {
                Response::error('Housing ID is required', 400);
            }
            
            if (!is_numeric($id)) {
                Response::error('Invalid housing ID', 400);
            }
            
            $housing = $this->housingModel->getHousingWithDetails($id);
            
            if (!$housing) {
                Response::notFound('Housing not found');
            }
            
            Response::success($housing, 'Housing found');
            
        } catch (Exception $e) {
            Response::serverError($e->getMessage());
        }
    }
    
    /**
     * Create new housing
     */
    public function create() {
        try {
            // Authenticate user
            $currentUser = requireAuth();
            
            // Only owners can create housing
            if ($currentUser['role'] !== 'owner') {
                Response::forbidden('Only owners can create housing listings');
            }
            
            // Get input data
            $input = json_decode(file_get_contents('php://input'), true);

            // Debug: Log received data
            error_log('Housing creation - Received data: ' . json_encode($input));
            error_log('Housing creation - Current user: ' . json_encode($currentUser));

            // Validate input
            $validator = new Validator($input);
            $validator->required('title', 'Title is required')
                     ->maxLength('title', 200, 'Title must not exceed 200 characters')
                     ->required('description', 'Description is required')
                     ->required('address', 'Address is required')
                     ->required('city', 'City is required')
                     ->required('price', 'Price is required')
                     ->numeric('price', 'Price must be a number')
                     ->min('price', 0, 'Price must be positive')
                     ->required('type', 'Type is required')
                     ->required('bedrooms', 'Number of bedrooms is required')
                     ->numeric('bedrooms', 'Bedrooms must be a number')
                     ->required('bathrooms', 'Number of bathrooms is required')
                     ->numeric('bathrooms', 'Bathrooms must be a number')
                     ->required('area', 'Area is required')
                     ->numeric('area', 'Area must be a number')
                     ->required('available_from', 'Available from date is required')
                     ->date('available_from', 'Y-m-d', 'Available from must be a valid date');

            // Validate available_to if provided
            if (isset($input['available_to']) && !empty($input['available_to'])) {
                $validator->date('available_to', 'Y-m-d', 'Available to must be a valid date');
            }
            
            if ($validator->fails()) {
                error_log('Housing creation - Validation failed: ' . json_encode($validator->getErrors()));
                Response::validationError($validator->getErrors());
            }
            
            // Prepare housing data
            $housingData = [
                'title' => $input['title'],
                'description' => $input['description'],
                'address' => $input['address'],
                'city' => $input['city'],
                'price' => floatval($input['price']),
                'type' => $input['type'],
                'bedrooms' => intval($input['bedrooms']),
                'bathrooms' => intval($input['bathrooms']),
                'area' => floatval($input['area']),
                'available_from' => $input['available_from'],
                'available_to' => $input['available_to'] ?? null,
                'is_furnished' => isset($input['is_furnished']) ? (bool)$input['is_furnished'] : false,
                'amenities' => $input['amenities'] ?? '',
                'owner_id' => $currentUser['user_id']
            ];
            
            // Debug: Log housing data before creation
            error_log('Housing creation - Final housing data: ' . json_encode($housingData));

            // Create housing
            $housingId = $this->housingModel->create($housingData);

            if ($housingId) {
                error_log('Housing creation - Success, ID: ' . $housingId);
                $newHousing = $this->housingModel->getHousingWithDetails($housingId);
                Response::success($newHousing, 'Housing created successfully', 201);
            } else {
                error_log('Housing creation - Failed to create housing');
                Response::serverError('Failed to create housing');
            }
            
        } catch (Exception $e) {
            Response::serverError($e->getMessage());
        }
    }
    
    /**
     * Update housing
     */
    public function update($id) {
        try {
            // Authenticate user
            $currentUser = requireAuth();
            
            // Validate ID
            if (!is_numeric($id)) {
                Response::error('Invalid housing ID', 400);
            }
            
            // Check if housing exists
            $existingHousing = $this->housingModel->findById($id);
            if (!$existingHousing) {
                Response::notFound('Housing not found');
            }
            
            // Check if user owns this housing or is admin
            if ($currentUser['role'] !== 'admin' && $existingHousing['owner_id'] != $currentUser['user_id']) {
                Response::forbidden('You can only update your own housing listings');
            }
            
            // Get input data
            $input = json_decode(file_get_contents('php://input'), true);
            
            // Validate input (only validate fields that are present)
            $validator = new Validator($input);
            
            if (isset($input['title'])) {
                $validator->required('title', 'Title is required')
                         ->maxLength('title', 200, 'Title must not exceed 200 characters');
            }
            
            if (isset($input['price'])) {
                $validator->numeric('price', 'Price must be a number')
                         ->min('price', 0, 'Price must be positive');
            }
            
            if (isset($input['bedrooms'])) {
                $validator->numeric('bedrooms', 'Bedrooms must be a number');
            }
            
            if (isset($input['bathrooms'])) {
                $validator->numeric('bathrooms', 'Bathrooms must be a number');
            }
            
            if (isset($input['area'])) {
                $validator->numeric('area', 'Area must be a number');
            }
            
            if (isset($input['available_from'])) {
                $validator->date('available_from', 'Y-m-d', 'Available from must be a valid date');
            }
            
            if ($validator->fails()) {
                Response::validationError($validator->getErrors());
            }
            
            // Prepare update data
            $updateData = [];
            $allowedFields = ['title', 'description', 'address', 'city', 'price', 'type', 
                            'bedrooms', 'bathrooms', 'area', 'available_from', 'available_to', 
                            'is_furnished', 'amenities'];
            
            foreach ($allowedFields as $field) {
                if (isset($input[$field])) {
                    if (in_array($field, ['price', 'area'])) {
                        $updateData[$field] = floatval($input[$field]);
                    } elseif (in_array($field, ['bedrooms', 'bathrooms'])) {
                        $updateData[$field] = intval($input[$field]);
                    } elseif ($field === 'is_furnished') {
                        $updateData[$field] = (bool)$input[$field];
                    } else {
                        $updateData[$field] = $input[$field];
                    }
                }
            }
            
            if (empty($updateData)) {
                Response::error('No valid fields to update', 400);
            }
            
            // Update housing
            $success = $this->housingModel->update($id, $updateData);
            
            if ($success) {
                $updatedHousing = $this->housingModel->getHousingWithDetails($id);
                Response::success($updatedHousing, 'Housing updated successfully');
            } else {
                Response::serverError('Failed to update housing');
            }
            
        } catch (Exception $e) {
            Response::serverError($e->getMessage());
        }
    }
    
    /**
     * Delete housing
     */
    public function delete($id) {
        try {
            // Authenticate user
            $currentUser = requireAuth();
            
            // Validate ID
            if (!is_numeric($id)) {
                Response::error('Invalid housing ID', 400);
            }
            
            // Check if housing exists
            $existingHousing = $this->housingModel->findById($id);
            if (!$existingHousing) {
                Response::notFound('Housing not found');
            }
            
            // Check if user owns this housing or is admin
            if ($currentUser['role'] !== 'admin' && $existingHousing['owner_id'] != $currentUser['user_id']) {
                Response::forbidden('You can only delete your own housing listings');
            }
            
            // Delete housing
            $success = $this->housingModel->delete($id);
            
            if ($success) {
                Response::success(null, 'Housing deleted successfully');
            } else {
                Response::serverError('Failed to delete housing');
            }
            
        } catch (Exception $e) {
            Response::serverError($e->getMessage());
        }
    }
}
?>
