<?php
/**
 * Auth Controller - Procedural approach
 * Functions to handle authentication requests
 */

require_once __DIR__ . '/../models_procedural/student_model.php';
require_once __DIR__ . '/../models_procedural/owner_model.php';
require_once __DIR__ . '/../models_procedural/admin_model.php';
require_once __DIR__ . '/../utils/JWT.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/Validator.php';
require_once __DIR__ . '/../config/Config.php';

/**
 * Handle login request
 */
function handle_login() {
    // Get JSON data from request
    $input = json_decode(file_get_contents('php://input'), true);

    // Validate input
    if (!$input || !isset($input['email']) || !isset($input['password'])) {
        Response::error('Email and password are required', 400);
        return;
    }

    $email = $input['email'];
    $password = $input['password'];

    // Try to authenticate as student first
    $student = verify_student_password($email, $password);

    if ($student) {
        // Create JWT token for session management
        $token = JWT::encode([
            'user_id' => $student['id'],
            'email' => $student['email'],
            'role' => 'student'
        ]);

        Response::success([
            'token' => $token,
            'user' => $student,
            'role' => 'student'
        ], 'Login successful');
        return;
    }

    // Try to authenticate as owner if not student
    $owner = verify_owner_password($email, $password);

    if ($owner) {
        // Create JWT token for session management
        $token = JWT::encode([
            'user_id' => $owner['id'],
            'email' => $owner['email'],
            'role' => 'owner'
        ]);

        Response::success([
            'token' => $token,
            'user' => $owner,
            'role' => 'owner'
        ], 'Login successful');
        return;
    }

    // If neither student nor owner found
    Response::error('Invalid email or password', 401);
}

/**
 * Handle register request
 */
function handle_register() {
    // Get JSON data from request
    $input = json_decode(file_get_contents('php://input'), true);

    if (!$input) {
        Response::error('Invalid JSON data', 400);
        return;
    }

    // Validate required fields
    $errors = validate_registration_data($input);
    
    if (!empty($errors)) {
        Response::validationError($errors);
        return;
    }
    
    $role = $input['role'];
    
    try {
        if ($role === 'student') {
            handle_register_student($input);
        } else {
            handle_register_owner($input);
        }
    } catch (Exception $e) {
        Response::serverError($e->getMessage());
    }
}

/**
 * Handle student registration
 */
function handle_register_student($input) {
    // Check if email already exists
    if (get_student_by_email($input['email'])) {
        Response::error('Email already exists', 409);
        return;
    }
    
    // Check if phone already exists (check both student and owner tables)
    if (get_student_by_phone($input['phone']) || get_owner_by_phone($input['phone'])) {
        Response::error('Phone number already exists', 409);
        return;
    }
    
    // Create student
    $studentId = create_student($input);
    
    if (!$studentId) {
        Response::serverError('Failed to create student account');
        return;
    }
    
    // Get created student (without password)
    $student = get_student_by_id($studentId);
    
    // Create JWT token
    $token = JWT::encode([
        'user_id' => $student['id'],
        'email' => $student['email'],
        'role' => 'student'
    ]);
    
    Response::success([
        'token' => $token,
        'user' => $student,
        'role' => 'student'
    ], 'Student account created successfully', 201);
}

/**
 * Handle owner registration
 */
function handle_register_owner($input) {
    // Check if email already exists
    if (get_owner_by_email($input['email'])) {
        Response::error('Email already exists', 409);
        return;
    }
    
    // Check if phone already exists (check both student and owner tables)
    if (get_student_by_phone($input['phone']) || get_owner_by_phone($input['phone'])) {
        Response::error('Phone number already exists', 409);
        return;
    }
    
    // Create owner
    $ownerId = create_owner($input);
    
    if (!$ownerId) {
        Response::serverError('Failed to create owner account');
        return;
    }
    
    // Get created owner (without password)
    $owner = get_owner_by_id($ownerId);
    
    // Create JWT token
    $token = JWT::encode([
        'user_id' => $owner['id'],
        'email' => $owner['email'],
        'role' => 'owner'
    ]);
    
    Response::success([
        'token' => $token,
        'user' => $owner,
        'role' => 'owner'
    ], 'Owner account created successfully', 201);
}

/**
 * Handle admin login
 */
function handle_admin_login() {
    // Get JSON data from request
    $input = json_decode(file_get_contents('php://input'), true);

    if (!$input || !isset($input['username']) || !isset($input['password'])) {
        Response::error('Username and password are required', 400);
        return;
    }
    
    $username = $input['username'];
    $password = $input['password'];
    
    $admin = verify_admin_password($username, $password);
    
    if ($admin) {
        $token = JWT::encode([
            'user_id' => $admin['username'],
            'username' => $admin['username'],
            'role' => 'admin'
        ]);
        
        Response::success([
            'token' => $token,
            'user' => ['username' => $admin['username']],
            'role' => 'admin'
        ], 'Admin login successful');
    } else {
        Response::error('Invalid username or password', 401);
    }
}

/**
 * Validate registration data
 */
function validate_registration_data($data) {
    $errors = [];
    
    // Required fields
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
    
    if (empty($data['role']) || !in_array($data['role'], ['student', 'owner'])) {
        $errors['role'] = 'Valid role is required (student or owner)';
    }
    
    // Additional validation for students
    if (isset($data['role']) && $data['role'] === 'student') {
        if (empty($data['university'])) {
            $errors['university'] = 'University is required for students';
        }
        
        // Check if email ends with -edu.ma for students
        if (!empty($data['email']) && !preg_match('/-edu\.ma$/', $data['email'])) {
            $errors['email'] = 'Student email must end with -edu.ma';
        }
    }
    
    return $errors;
}

/**
 * Get student by phone (helper function)
 */
function get_student_by_phone($phone) {
    $sql = "SELECT * FROM student WHERE phone = ?";
    return fetchRow($sql, [$phone], "s");
}
