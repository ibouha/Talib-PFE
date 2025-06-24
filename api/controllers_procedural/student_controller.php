<?php
/**
 * Student Controller - Procedural approach
 * Functions to handle student-related HTTP requests
 */

require_once __DIR__ . '/../models_procedural/student_model.php';
require_once __DIR__ . '/../auth_procedural.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/Validator.php';

/**
 * Handle GET /students - Get all students
 */
function handle_get_students() {
    try {
        // Get pagination parameters
        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 20;
        $offset = ($page - 1) * $limit;
        
        // Get search parameters
        $search = isset($_GET['search']) ? $_GET['search'] : null;
        $university = isset($_GET['university']) ? $_GET['university'] : null;
        
        $students = [];
        $total = 0;
        
        if (!empty($search)) {
            // Search by name or university
            $students = search_students($search, $limit, $offset);
            $total = count_students(); // For simplicity, using total count
        } elseif (!empty($university)) {
            // Filter by university
            $students = get_students_by_university($university, $limit, $offset);
            $total = count_students(['university' => $university]);
        } else {
            // Get all students
            $students = get_all_students($limit, $offset);
            $total = count_students();
        }
        
        Response::success([
            'students' => $students,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $total,
                'pages' => ceil($total / $limit)
            ]
        ]);
        
    } catch (Exception $e) {
        Response::serverError('Failed to retrieve students');
    }
}

/**
 * Handle GET /students/{id} - Get student by ID
 */
function handle_get_student($id) {
    try {
        if (!$id || !is_numeric($id)) {
            Response::error('Invalid student ID', 400);
            return;
        }
        
        $student = get_student_by_id($id);
        
        if (!$student) {
            Response::notFound('Student not found');
            return;
        }
        
        Response::success(['student' => $student]);
        
    } catch (Exception $e) {
        Response::serverError('Failed to retrieve student');
    }
}

/**
 * Handle POST /students - Create new student
 */
function handle_create_student() {
    try {
        // Get JSON input
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            Response::error('Invalid JSON data', 400);
            return;
        }
        
        // Validate input
        $errors = validate_student_data($input, true); // true for creation
        
        if (!empty($errors)) {
            Response::validationError($errors);
            return;
        }
        
        // Check if email already exists
        if (get_student_by_email($input['email'])) {
            Response::error('Email already exists', 409);
            return;
        }
        
        // Create student
        $student_id = create_student($input);
        
        if (!$student_id) {
            Response::serverError('Failed to create student');
            return;
        }
        
        // Get created student (without password)
        $student = get_student_by_id($student_id);
        
        Response::success([
            'message' => 'Student created successfully',
            'student' => $student
        ], 201);
        
    } catch (Exception $e) {
        Response::serverError('Failed to create student');
    }
}

/**
 * Handle PUT /students/{id} - Update student
 */
function handle_update_student($id) {
    try {
        if (!$id || !is_numeric($id)) {
            Response::error('Invalid student ID', 400);
            return;
        }
        
        // Authenticate user
        $currentUser = authenticate_user();
        
        // Check if user can update this student
        if ($currentUser['role'] === 'student' && $currentUser['id'] != $id) {
            Response::forbidden('You can only update your own profile');
            return;
        } elseif ($currentUser['role'] !== 'student' && $currentUser['role'] !== 'admin') {
            Response::forbidden('Access denied');
            return;
        }
        
        // Check if student exists
        $existing_student = get_student_by_id($id);
        if (!$existing_student) {
            Response::notFound('Student not found');
            return;
        }
        
        // Get JSON input
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            Response::error('Invalid JSON data', 400);
            return;
        }
        
        // Validate input
        $errors = validate_student_data($input, false); // false for update
        
        if (!empty($errors)) {
            Response::validationError($errors);
            return;
        }
        
        // Update student
        $success = update_student($id, $input);
        
        if (!$success) {
            Response::serverError('Failed to update student');
            return;
        }
        
        // Get updated student
        $student = get_student_by_id($id);
        
        Response::success([
            'message' => 'Student updated successfully',
            'student' => $student
        ]);
        
    } catch (Exception $e) {
        Response::serverError('Failed to update student');
    }
}

/**
 * Handle DELETE /students/{id} - Delete student
 */
function handle_delete_student($id) {
    try {
        if (!$id || !is_numeric($id)) {
            Response::error('Invalid student ID', 400);
            return;
        }
        
        // Require admin access for deletion
        $currentUser = require_admin_access();
        
        // Check if student exists
        $student = get_student_by_id($id);
        if (!$student) {
            Response::notFound('Student not found');
            return;
        }
        
        // Delete student
        $success = delete_student($id);
        
        if (!$success) {
            Response::serverError('Failed to delete student');
            return;
        }
        
        Response::success(['message' => 'Student deleted successfully']);
        
    } catch (Exception $e) {
        Response::serverError('Failed to delete student');
    }
}

/**
 * Handle PUT /students/{id}/status - Update student status (admin only)
 */
function handle_update_student_status($id) {
    try {
        if (!$id || !is_numeric($id)) {
            Response::error('Invalid student ID', 400);
            return;
        }
        
        // Require admin access
        $currentUser = require_admin_access();
        
        // Get JSON input
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input || !isset($input['status'])) {
            Response::error('Status is required', 400);
            return;
        }
        
        $status = $input['status'];
        
        if (!in_array($status, ['verified', 'not_verified'])) {
            Response::error('Invalid status. Must be verified or not_verified', 400);
            return;
        }
        
        // Check if student exists
        $student = get_student_by_id($id);
        if (!$student) {
            Response::notFound('Student not found');
            return;
        }
        
        // Update status
        $success = update_student_status($id, $status);
        
        if (!$success) {
            Response::serverError('Failed to update student status');
            return;
        }
        
        // Get updated student
        $student = get_student_by_id($id);
        
        Response::success([
            'message' => 'Student status updated successfully',
            'student' => $student
        ]);
        
    } catch (Exception $e) {
        Response::serverError('Failed to update student status');
    }
}

/**
 * Validate student data
 */
function validate_student_data($data, $is_creation = false) {
    $errors = [];
    
    // Required fields for creation
    if ($is_creation) {
        if (empty($data['name'])) {
            $errors['name'] = 'Name is required';
        }
        
        if (empty($data['email'])) {
            $errors['email'] = 'Email is required';
        } elseif (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            $errors['email'] = 'Invalid email format';
        }
        
        if (empty($data['password'])) {
            $errors['password'] = 'Password is required';
        } elseif (strlen($data['password']) < 6) {
            $errors['password'] = 'Password must be at least 6 characters';
        }
        
        if (empty($data['phone'])) {
            $errors['phone'] = 'Phone is required';
        }
        
        if (empty($data['university'])) {
            $errors['university'] = 'University is required';
        }
    } else {
        // Optional validation for updates
        if (isset($data['email']) && !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            $errors['email'] = 'Invalid email format';
        }
        
        if (isset($data['password']) && strlen($data['password']) < 6) {
            $errors['password'] = 'Password must be at least 6 characters';
        }
    }
    
    return $errors;
}
