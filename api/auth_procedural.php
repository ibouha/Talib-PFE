<?php
/**
 * Authentication Helper Functions - Procedural approach
 * Functions to handle JWT authentication and user verification
 */

require_once __DIR__ . '/utils/JWT.php';
require_once __DIR__ . '/utils/Response.php';
require_once __DIR__ . '/models_procedural/student_model.php';
require_once __DIR__ . '/models_procedural/owner_model.php';
require_once __DIR__ . '/models_procedural/admin_model.php';

/**
 * Authenticate user from JWT token
 */
function authenticate_user() {
    $headers = getallheaders();
    $authHeader = null;
    
    // Check for Authorization header (case-insensitive)
    foreach ($headers as $key => $value) {
        if (strtolower($key) === 'authorization') {
            $authHeader = $value;
            break;
        }
    }
    
    if (!$authHeader) {
        Response::error('Authorization header missing', 401);
        exit;
    }
    
    // Extract token from "Bearer TOKEN" format
    if (!preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        Response::error('Invalid authorization header format', 401);
        exit;
    }
    
    $token = $matches[1];
    
    try {
        // Decode JWT token
        $decoded = JWT::decode($token);
        
        if (!$decoded) {
            Response::error('Invalid token', 401);
            exit;
        }
        
        // Get user data based on role
        $user = null;
        
        if ($decoded['role'] === 'student') {
            $user = get_student_by_id($decoded['user_id']);
            if ($user) {
                unset($user['password']); // Remove password from user data
            }
        } elseif ($decoded['role'] === 'owner') {
            $user = get_owner_by_id($decoded['user_id']);
        } elseif ($decoded['role'] === 'admin') {
            $user = ['username' => $decoded['username']];
        }
        
        if (!$user && $decoded['role'] !== 'admin') {
            Response::error('User not found', 401);
            exit;
        }
        
        // Return user data with role
        return [
            'id' => $decoded['user_id'] ?? $decoded['username'],
            'role' => $decoded['role'],
            'user_data' => $user,
            'email' => $decoded['email'] ?? null,
            'username' => $decoded['username'] ?? null
        ];
        
    } catch (Exception $e) {
        Response::error('Token validation failed: ' . $e->getMessage(), 401);
        exit;
    }
}

/**
 * Authenticate user and require specific role
 */
function authenticate_user_with_role($requiredRole) {
    $currentUser = authenticate_user();
    
    if ($currentUser['role'] !== $requiredRole) {
        Response::forbidden('Access denied. Required role: ' . $requiredRole);
        exit;
    }
    
    return $currentUser;
}

/**
 * Authenticate user and allow multiple roles
 */
function authenticate_user_with_roles($allowedRoles) {
    $currentUser = authenticate_user();
    
    if (!in_array($currentUser['role'], $allowedRoles)) {
        Response::forbidden('Access denied. Allowed roles: ' . implode(', ', $allowedRoles));
        exit;
    }
    
    return $currentUser;
}

/**
 * Check if user is authenticated (optional authentication)
 */
function get_authenticated_user() {
    $headers = getallheaders();
    $authHeader = null;
    
    // Check for Authorization header (case-insensitive)
    foreach ($headers as $key => $value) {
        if (strtolower($key) === 'authorization') {
            $authHeader = $value;
            break;
        }
    }
    
    if (!$authHeader) {
        return null; // No authentication provided
    }
    
    // Extract token from "Bearer TOKEN" format
    if (!preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        return null; // Invalid format
    }
    
    $token = $matches[1];
    
    try {
        // Decode JWT token
        $decoded = JWT::decode($token);
        
        if (!$decoded) {
            return null;
        }
        
        // Get user data based on role
        $user = null;
        
        if ($decoded['role'] === 'student') {
            $user = get_student_by_id($decoded['user_id']);
            if ($user) {
                unset($user['password']); // Remove password from user data
            }
        } elseif ($decoded['role'] === 'owner') {
            $user = get_owner_by_id($decoded['user_id']);
        } elseif ($decoded['role'] === 'admin') {
            $user = ['username' => $decoded['username']];
        }
        
        if (!$user && $decoded['role'] !== 'admin') {
            return null;
        }
        
        // Return user data with role
        return [
            'id' => $decoded['user_id'] ?? $decoded['username'],
            'role' => $decoded['role'],
            'user_data' => $user,
            'email' => $decoded['email'] ?? null,
            'username' => $decoded['username'] ?? null
        ];
        
    } catch (Exception $e) {
        return null; // Token validation failed
    }
}

/**
 * Verify resource ownership (for students)
 */
function verify_student_ownership($studentId) {
    $currentUser = authenticate_user();
    
    if ($currentUser['role'] !== 'student') {
        Response::forbidden('Student access required');
        exit;
    }
    
    if ($currentUser['id'] != $studentId) {
        Response::forbidden('You can only access your own resources');
        exit;
    }
    
    return $currentUser;
}

/**
 * Verify resource ownership (for owners)
 */
function verify_owner_ownership($ownerId) {
    $currentUser = authenticate_user();
    
    if ($currentUser['role'] !== 'owner') {
        Response::forbidden('Owner access required');
        exit;
    }
    
    if ($currentUser['id'] != $ownerId) {
        Response::forbidden('You can only access your own resources');
        exit;
    }
    
    return $currentUser;
}

/**
 * Check if user can access resource (owner of resource or admin)
 */
function can_access_resource($resourceOwnerId, $ownerRole = 'student') {
    $currentUser = authenticate_user();
    
    // Admin can access everything
    if ($currentUser['role'] === 'admin') {
        return true;
    }
    
    // Owner can access their own resources
    if ($currentUser['role'] === $ownerRole && $currentUser['id'] == $resourceOwnerId) {
        return true;
    }
    
    return false;
}

/**
 * Require admin access
 */
function require_admin_access() {
    return authenticate_user_with_role('admin');
}

/**
 * Require student access
 */
function require_student_access() {
    return authenticate_user_with_role('student');
}

/**
 * Require owner access
 */
function require_owner_access() {
    return authenticate_user_with_role('owner');
}
