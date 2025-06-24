<?php
/**
 * Roommate Controller - Procedural approach
 * Functions to handle roommate profile-related HTTP requests
 */

require_once __DIR__ . '/../models_procedural/roommate_model.php';
require_once __DIR__ . '/../auth_procedural.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/Validator.php';

/**
 * Handle GET /roommates - Get all roommate profiles
 */
function handle_get_all_roommates() {
    try {
        // Get pagination parameters
        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 20;
        $offset = ($page - 1) * $limit;
        
        // Get filter parameters
        $filters = [
            'location' => $_GET['location'] ?? null,
            'university' => $_GET['university'] ?? null,
            'gender' => $_GET['gender'] ?? null,
            'min_budget' => $_GET['min_budget'] ?? null,
            'max_budget' => $_GET['max_budget'] ?? null,
            'lookingFor' => $_GET['lookingFor'] ?? null
        ];
        
        // Remove empty filters
        $filters = array_filter($filters, function($value) {
            return $value !== null && $value !== '';
        });
        
        $profiles = get_all_roommate_profiles($filters, $limit, $offset);
        $total = count_roommate_profiles($filters);
        
        Response::success([
            'roommates' => $profiles,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $total,
                'pages' => ceil($total / $limit)
            ]
        ]);
        
    } catch (Exception $e) {
        Response::serverError('Failed to retrieve roommate profiles');
    }
}

/**
 * Handle GET /roommates/{id} - Get roommate profile by ID
 */
function handle_get_roommate($id) {
    try {
        if (!$id || !is_numeric($id)) {
            Response::error('Invalid roommate profile ID', 400);
            return;
        }
        
        $profile = get_roommate_profile_with_details($id);
        
        if (!$profile) {
            Response::notFound('Roommate profile not found');
            return;
        }
        
        Response::success(['roommate' => $profile]);
        
    } catch (Exception $e) {
        Response::serverError('Failed to retrieve roommate profile');
    }
}

/**
 * Handle POST /roommates - Create new roommate profile
 */
function handle_create_roommate() {
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
        $errors = validate_roommate_data($input, true); // true for creation
        
        if (!empty($errors)) {
            Response::validationError($errors);
            return;
        }
        
        // Add student ID to data
        $input['student_id'] = $currentUser['id'];
        
        // Create roommate profile
        $profile_id = create_roommate_profile($input);
        
        if (!$profile_id) {
            Response::serverError('Failed to create roommate profile');
            return;
        }
        
        // Get created profile with details
        $profile = get_roommate_profile_with_details($profile_id);
        
        Response::success([
            'message' => 'Roommate profile created successfully',
            'roommate' => $profile
        ], 201);
        
    } catch (Exception $e) {
        Response::serverError('Failed to create roommate profile');
    }
}

/**
 * Handle PUT /roommates/{id} - Update roommate profile
 */
function handle_update_roommate($id) {
    try {
        if (!$id || !is_numeric($id)) {
            Response::error('Invalid roommate profile ID', 400);
            return;
        }
        
        // Authenticate user
        $currentUser = authenticate_user();
        
        // Check if profile exists
        $existing_profile = get_roommate_profile_by_id($id);
        if (!$existing_profile) {
            Response::notFound('Roommate profile not found');
            return;
        }
        
        // Check if user can update this profile
        if ($currentUser['role'] === 'student' && $currentUser['id'] != $existing_profile['student_id']) {
            Response::forbidden('You can only update your own roommate profiles');
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
        $errors = validate_roommate_data($input, false); // false for update
        
        if (!empty($errors)) {
            Response::validationError($errors);
            return;
        }
        
        // Update roommate profile
        $success = update_roommate_profile($id, $input);
        
        if (!$success) {
            Response::serverError('Failed to update roommate profile');
            return;
        }
        
        // Get updated profile
        $profile = get_roommate_profile_with_details($id);
        
        Response::success([
            'message' => 'Roommate profile updated successfully',
            'roommate' => $profile
        ]);
        
    } catch (Exception $e) {
        Response::serverError('Failed to update roommate profile');
    }
}

/**
 * Handle DELETE /roommates/{id} - Delete roommate profile
 */
function handle_delete_roommate($id) {
    try {
        if (!$id || !is_numeric($id)) {
            Response::error('Invalid roommate profile ID', 400);
            return;
        }
        
        // Authenticate user
        $currentUser = authenticate_user();
        
        // Check if profile exists
        $profile = get_roommate_profile_by_id($id);
        if (!$profile) {
            Response::notFound('Roommate profile not found');
            return;
        }
        
        // Check if user can delete this profile
        if ($currentUser['role'] === 'student' && $currentUser['id'] != $profile['student_id']) {
            Response::forbidden('You can only delete your own roommate profiles');
            return;
        } elseif ($currentUser['role'] !== 'student' && $currentUser['role'] !== 'admin') {
            Response::forbidden('Access denied');
            return;
        }
        
        // Delete roommate profile
        $success = delete_roommate_profile($id);
        
        if (!$success) {
            Response::serverError('Failed to delete roommate profile');
            return;
        }
        
        Response::success(['message' => 'Roommate profile deleted successfully']);
        
    } catch (Exception $e) {
        Response::serverError('Failed to delete roommate profile');
    }
}

/**
 * Handle GET /roommates/{id}/compatible - Get compatible roommate profiles
 */
function handle_get_compatible_roommates($id) {
    try {
        if (!$id || !is_numeric($id)) {
            Response::error('Invalid roommate profile ID', 400);
            return;
        }
        
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
        
        $compatible_profiles = get_compatible_roommate_profiles($id, $limit);
        
        Response::success(['compatible_roommates' => $compatible_profiles]);
        
    } catch (Exception $e) {
        Response::serverError('Failed to retrieve compatible roommate profiles');
    }
}

/**
 * Handle GET /roommates/by-student/{student_id} - Get roommate profiles by student
 */
function handle_get_roommates_by_student($student_id) {
    try {
        if (!$student_id || !is_numeric($student_id)) {
            Response::error('Invalid student ID', 400);
            return;
        }
        
        // Get pagination parameters
        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 20;
        $offset = ($page - 1) * $limit;
        
        $profiles = get_roommate_profiles_by_student($student_id, $limit, $offset);
        
        Response::success(['roommate_profiles' => $profiles]);
        
    } catch (Exception $e) {
        Response::serverError('Failed to retrieve student roommate profiles');
    }
}

/**
 * Validate roommate profile data
 */
function validate_roommate_data($data, $is_creation = false) {
    $errors = [];
    
    // Required fields for creation
    if ($is_creation) {
        if (empty($data['name'])) {
            $errors['name'] = 'Name is required';
        }
        
        if (!isset($data['age']) || !is_numeric($data['age']) || $data['age'] < 16 || $data['age'] > 100) {
            $errors['age'] = 'Valid age is required (16-100)';
        }
        
        if (empty($data['gender']) || !in_array($data['gender'], ['male', 'female', 'other'])) {
            $errors['gender'] = 'Valid gender is required';
        }
        
        if (empty($data['university'])) {
            $errors['university'] = 'University is required';
        }
        
        if (empty($data['program'])) {
            $errors['program'] = 'Program is required';
        }
        
        if (!isset($data['year']) || !is_numeric($data['year']) || $data['year'] < 1 || $data['year'] > 10) {
            $errors['year'] = 'Valid study year is required (1-10)';
        }
        
        if (empty($data['bio'])) {
            $errors['bio'] = 'Bio is required';
        }
        
        if (!isset($data['budget']) || !is_numeric($data['budget']) || $data['budget'] <= 0) {
            $errors['budget'] = 'Valid budget is required';
        }
        
        if (empty($data['lookingFor'])) {
            $errors['lookingFor'] = 'Looking for is required';
        }
        
        if (empty($data['location'])) {
            $errors['location'] = 'Location is required';
        }
    } else {
        // Optional validation for updates
        if (isset($data['age']) && (!is_numeric($data['age']) || $data['age'] < 16 || $data['age'] > 100)) {
            $errors['age'] = 'Valid age is required (16-100)';
        }
        
        if (isset($data['gender']) && !in_array($data['gender'], ['male', 'female', 'other'])) {
            $errors['gender'] = 'Valid gender is required';
        }
        
        if (isset($data['year']) && (!is_numeric($data['year']) || $data['year'] < 1 || $data['year'] > 10)) {
            $errors['year'] = 'Valid study year is required (1-10)';
        }
        
        if (isset($data['budget']) && (!is_numeric($data['budget']) || $data['budget'] <= 0)) {
            $errors['budget'] = 'Valid budget is required';
        }
    }
    
    return $errors;
}
