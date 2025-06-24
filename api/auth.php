<?php

// Simple authentication functions
require_once 'config/Config.php';
require_once 'config/Database.php';
require_once 'utils/JWT.php';
require_once 'utils/Response.php';

// Authenticate user from JWT token
function authenticateUser() {
    $headers = getallheaders();
    $authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : '';
    
    if (empty($authHeader)) {
        sendUnauthorized('Authorization header missing');
    }
    
    // Extract token from "Bearer <token>"
    if (!preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        sendUnauthorized('Invalid authorization header format');
    }
    
    $token = $matches[1];
    
    try {
        $payload = decodeJWT($token);
        return array(
            'user_id' => $payload['user_id'],
            'email' => isset($payload['email']) ? $payload['email'] : (isset($payload['username']) ? $payload['username'] : null),
            'username' => isset($payload['username']) ? $payload['username'] : null,
            'role' => $payload['role']
        );
    } catch (Exception $e) {
        sendUnauthorized('Invalid or expired token');
    }
}

// Check if user has required role
function requireRole($requiredRole) {
    $user = authenticateUser();
    
    if ($user['role'] !== $requiredRole) {
        sendForbidden('Insufficient permissions');
    }
    
    return $user;
}

// Check if user is student
function requireStudent() {
    return requireRole('student');
}

// Check if user is owner
function requireOwner() {
    return requireRole('owner');
}

// Check if user is admin
function requireAdmin() {
    return requireRole('admin');
}

// Check if user is student or owner
function requireStudentOrOwner() {
    $user = authenticateUser();
    
    if (!in_array($user['role'], array('student', 'owner'))) {
        sendForbidden('Access restricted to students and owners');
    }
    
    return $user;
}

// Get current user (optional authentication)
function getCurrentUser() {
    try {
        return authenticateUser();
    } catch (Exception $e) {
        return null;
    }
}

// Check if current user owns the resource
function checkOwnership($resourceUserId) {
    $user = authenticateUser();
    
    if ($user['user_id'] != $resourceUserId) {
        sendForbidden('You can only access your own resources');
    }
    
    return $user;
}

// Student functions
function registerStudent($data) {
    $pdo = getConnection();
    
    // Check if email already exists
    $stmt = $pdo->prepare("SELECT id FROM Student WHERE email = ?");
    $stmt->execute(array($data['email']));
    if ($stmt->fetch()) {
        sendError('Email already exists', 409);
    }
    
    // Check if phone already exists
    $stmt = $pdo->prepare("SELECT id FROM Student WHERE phone = ?");
    $stmt->execute(array($data['phone']));
    if ($stmt->fetch()) {
        sendError('Phone number already exists', 409);
    }
    
    // Hash password
    $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);
    
    // Insert student
    $stmt = $pdo->prepare("INSERT INTO Student (name, email, password, phone, university, bio, gender, date_of_birth, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())");
    
    $success = $stmt->execute(array(
        $data['name'],
        $data['email'],
        $hashedPassword,
        $data['phone'],
        $data['university'],
        isset($data['bio']) ? $data['bio'] : '',
        isset($data['gender']) ? $data['gender'] : null,
        isset($data['date_of_birth']) ? $data['date_of_birth'] : null
    ));
    
    if ($success) {
        $studentId = $pdo->lastInsertId();
        
        // Get the created student
        $stmt = $pdo->prepare("SELECT id, name, email, phone, university, bio, gender, date_of_birth, created_at FROM Student WHERE id = ?");
        $stmt->execute(array($studentId));
        $student = $stmt->fetch();
        
        // Create JWT token
        $token = createJWT(array(
            'user_id' => $student['id'],
            'email' => $student['email'],
            'role' => 'student'
        ));
        
        sendCreated(array(
            'token' => $token,
            'user' => $student,
            'role' => 'student'
        ), 'Student account created successfully');
    } else {
        sendServerError('Failed to create student account');
    }
}

function loginStudent($email, $password) {
    $pdo = getConnection();
    
    $stmt = $pdo->prepare("SELECT * FROM Student WHERE email = ?");
    $stmt->execute(array($email));
    $student = $stmt->fetch();
    
    if ($student && password_verify($password, $student['password'])) {
        // Remove password from response
        unset($student['password']);
        
        // Create JWT token
        $token = createJWT(array(
            'user_id' => $student['id'],
            'email' => $student['email'],
            'role' => 'student'
        ));
        
        return array(
            'token' => $token,
            'user' => $student,
            'role' => 'student'
        );
    }
    
    return false;
}

// Owner functions
function registerOwner($data) {
    $pdo = getConnection();
    
    // Check if email already exists
    $stmt = $pdo->prepare("SELECT id FROM owner WHERE email = ?");
    $stmt->execute(array($data['email']));
    if ($stmt->fetch()) {
        sendError('Email already exists', 409);
    }
    
    // Check if phone already exists
    $stmt = $pdo->prepare("SELECT id FROM owner WHERE phone = ?");
    $stmt->execute(array($data['phone']));
    if ($stmt->fetch()) {
        sendError('Phone number already exists', 409);
    }
    
    // Hash password
    $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);
    
    // Insert owner
    $stmt = $pdo->prepare("INSERT INTO owner (name, email, password, phone) VALUES (?, ?, ?, ?)");
    
    $success = $stmt->execute(array(
        $data['name'],
        $data['email'],
        $hashedPassword,
        $data['phone']
    ));
    
    if ($success) {
        $ownerId = $pdo->lastInsertId();
        
        // Get the created owner
        $stmt = $pdo->prepare("SELECT id, name, email, phone FROM owner WHERE id = ?");
        $stmt->execute(array($ownerId));
        $owner = $stmt->fetch();
        
        // Create JWT token
        $token = createJWT(array(
            'user_id' => $owner['id'],
            'email' => $owner['email'],
            'role' => 'owner'
        ));
        
        sendCreated(array(
            'token' => $token,
            'user' => $owner,
            'role' => 'owner'
        ), 'Owner account created successfully');
    } else {
        sendServerError('Failed to create owner account');
    }
}

function loginOwner($email, $password) {
    $pdo = getConnection();
    
    $stmt = $pdo->prepare("SELECT * FROM owner WHERE email = ?");
    $stmt->execute(array($email));
    $owner = $stmt->fetch();
    
    if ($owner && password_verify($password, $owner['password'])) {
        // Remove password from response
        unset($owner['password']);
        
        // Create JWT token
        $token = createJWT(array(
            'user_id' => $owner['id'],
            'email' => $owner['email'],
            'role' => 'owner'
        ));
        
        return array(
            'token' => $token,
            'user' => $owner,
            'role' => 'owner'
        );
    }
    
    return false;
}

// Admin functions
function loginAdmin($username, $password) {
    $pdo = getConnection();
    
    $stmt = $pdo->prepare("SELECT * FROM admin WHERE username = ?");
    $stmt->execute(array($username));
    $admin = $stmt->fetch();
    
    if ($admin && password_verify($password, $admin['password'])) {
        // Create JWT token
        $token = createJWT(array(
            'user_id' => $admin['username'],
            'username' => $admin['username'],
            'role' => 'admin'
        ));
        
        return array(
            'token' => $token,
            'user' => array('username' => $admin['username']),
            'role' => 'admin'
        );
    }
    
    return false;
}

/**
 * Require authentication and return current user
 * Throws exception if not authenticated
 */
function requireAuth() {
    $user = authenticateUser();

    if (!$user) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Authentication required']);
        exit;
    }

    return $user;
}
