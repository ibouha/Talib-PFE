<?php
/**
 * Admin Controller - Procedural approach
 * Functions to handle admin-related HTTP requests
 */

require_once __DIR__ . '/../models_procedural/student_model.php';
require_once __DIR__ . '/../models_procedural/owner_model.php';
require_once __DIR__ . '/../models_procedural/admin_model.php';
require_once __DIR__ . '/../auth_procedural.php';
require_once __DIR__ . '/../utils/Response.php';

/**
 * Handle GET /admin/users - Get all users for admin dashboard
 */
function handle_get_all_users() {
    try {
        // Require admin access
        $currentUser = require_admin_access();
        
        // Get all students
        $students = get_all_students_with_stats();
        
        // Get all owners
        $owners = get_all_owners_with_stats();
        
        // Combine and format users
        $users = [];
        
        foreach ($students as $student) {
            $users[] = [
                'id' => $student['id'],
                'name' => $student['name'],
                'email' => $student['email'],
                'phone' => $student['phone'],
                'role' => 'student',
                'status' => $student['status'],
                'university' => $student['university'] ?? null,
                'image' => $student['image'],
                'created_at' => $student['created_at'],
                'updated_at' => $student['updated_at']
            ];
        }
        
        foreach ($owners as $owner) {
            $users[] = [
                'id' => $owner['id'],
                'name' => $owner['name'],
                'email' => $owner['email'],
                'phone' => $owner['phone'],
                'role' => 'owner',
                'status' => $owner['status'],
                'university' => null,
                'image' => $owner['image'],
                'created_at' => $owner['created_at'],
                'updated_at' => $owner['updated_at']
            ];
        }
        
        // Sort by creation date (newest first)
        usort($users, function($a, $b) {
            return strtotime($b['created_at']) - strtotime($a['created_at']);
        });
        
        Response::success(['users' => $users]);
        
    } catch (Exception $e) {
        Response::serverError('Failed to retrieve users');
    }
}

/**
 * Handle GET /admin/stats - Get user statistics
 */
function handle_get_user_stats() {
    try {
        // Require admin access
        $currentUser = require_admin_access();
        
        $stats = [
            'total_students' => get_total_students_count(),
            'verified_students' => get_verified_students_count(),
            'total_owners' => get_total_owners_count(),
            'verified_owners' => get_verified_owners_count(),
        ];
        
        Response::success(['stats' => $stats]);
        
    } catch (Exception $e) {
        Response::serverError('Failed to retrieve user statistics');
    }
}

/**
 * Handle PUT /admin/users/status - Update user verification status
 */
function handle_update_user_status() {
    try {
        // Require admin access
        $currentUser = require_admin_access();
        
        // Get JSON input
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input || !isset($input['user_id']) || !isset($input['role']) || !isset($input['status'])) {
            Response::error('User ID, role, and status are required', 400);
            return;
        }
        
        $userId = $input['user_id'];
        $role = $input['role'];
        $status = $input['status'];
        
        // Validate role
        if (!in_array($role, ['student', 'owner'])) {
            Response::error('Invalid role. Must be student or owner', 400);
            return;
        }
        
        // Validate status
        if (!in_array($status, ['verified', 'not_verified'])) {
            Response::error('Invalid status. Must be verified or not_verified', 400);
            return;
        }
        
        // Update user status based on role
        $success = false;
        if ($role === 'student') {
            // Check if student exists
            $student = get_student_by_id($userId);
            if (!$student) {
                Response::notFound('Student not found');
                return;
            }
            $success = update_student_status($userId, $status);
        } else {
            // Check if owner exists
            $owner = get_owner_by_id($userId);
            if (!$owner) {
                Response::notFound('Owner not found');
                return;
            }
            $success = update_owner_status($userId, $status);
        }
        
        if (!$success) {
            Response::serverError('Failed to update user status');
            return;
        }
        
        Response::success(['message' => 'User status updated successfully']);
        
    } catch (Exception $e) {
        Response::serverError('Failed to update user status');
    }
}

/**
 * Handle DELETE /admin/users - Delete user
 */
function handle_delete_user() {
    try {
        // Require admin access
        $currentUser = require_admin_access();
        
        // Get JSON input
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input || !isset($input['user_id']) || !isset($input['role'])) {
            Response::error('User ID and role are required', 400);
            return;
        }
        
        $userId = $input['user_id'];
        $role = $input['role'];
        
        // Validate role
        if (!in_array($role, ['student', 'owner'])) {
            Response::error('Invalid role. Must be student or owner', 400);
            return;
        }
        
        // Delete user based on role
        $success = false;
        if ($role === 'student') {
            // Check if student exists
            $student = get_student_by_id($userId);
            if (!$student) {
                Response::notFound('Student not found');
                return;
            }
            $success = delete_student($userId);
        } else {
            // Check if owner exists
            $owner = get_owner_by_id($userId);
            if (!$owner) {
                Response::notFound('Owner not found');
                return;
            }
            $success = delete_owner($userId);
        }
        
        if (!$success) {
            Response::serverError('Failed to delete user');
            return;
        }
        
        Response::success(['message' => 'User deleted successfully']);
        
    } catch (Exception $e) {
        Response::serverError('Failed to delete user');
    }
}

/**
 * Handle GET /admin/platform-stats - Get platform statistics
 */
function handle_get_platform_stats() {
    try {
        // Require admin access
        $currentUser = require_admin_access();
        
        $stats = get_platform_stats();
        
        Response::success(['stats' => $stats]);
        
    } catch (Exception $e) {
        Response::serverError('Failed to retrieve platform statistics');
    }
}

/**
 * Handle GET /admin/recent-activity - Get recent platform activity
 */
function handle_get_recent_activity() {
    try {
        // Require admin access
        $currentUser = require_admin_access();
        
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 20;
        
        $activities = get_recent_activity($limit);
        
        Response::success(['activities' => $activities]);
        
    } catch (Exception $e) {
        Response::serverError('Failed to retrieve recent activity');
    }
}

/**
 * Handle POST /admin/create-admin - Create new admin (super admin only)
 */
function handle_create_admin() {
    try {
        // Require admin access
        $currentUser = require_admin_access();
        
        // Get JSON input
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input || !isset($input['username']) || !isset($input['password'])) {
            Response::error('Username and password are required', 400);
            return;
        }
        
        $username = $input['username'];
        $password = $input['password'];
        
        // Validate input
        if (strlen($username) < 3) {
            Response::error('Username must be at least 3 characters', 400);
            return;
        }
        
        if (strlen($password) < 6) {
            Response::error('Password must be at least 6 characters', 400);
            return;
        }
        
        // Check if admin already exists
        if (find_admin_by_username($username)) {
            Response::error('Admin username already exists', 409);
            return;
        }
        
        // Create admin
        $success = create_admin($username, $password);
        
        if (!$success) {
            Response::serverError('Failed to create admin');
            return;
        }
        
        Response::success(['message' => 'Admin created successfully'], 201);
        
    } catch (Exception $e) {
        Response::serverError('Failed to create admin');
    }
}

/**
 * Handle PUT /admin/change-password - Change admin password
 */
function handle_change_admin_password() {
    try {
        // Require admin access
        $currentUser = require_admin_access();
        
        // Get JSON input
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input || !isset($input['current_password']) || !isset($input['new_password'])) {
            Response::error('Current password and new password are required', 400);
            return;
        }
        
        $currentPassword = $input['current_password'];
        $newPassword = $input['new_password'];
        
        // Validate new password
        if (strlen($newPassword) < 6) {
            Response::error('New password must be at least 6 characters', 400);
            return;
        }
        
        // Verify current password
        $admin = verify_admin_password($currentUser['username'], $currentPassword);
        if (!$admin) {
            Response::error('Current password is incorrect', 401);
            return;
        }
        
        // Change password
        $success = change_admin_password($currentUser['username'], $newPassword);
        
        if (!$success) {
            Response::serverError('Failed to change password');
            return;
        }
        
        Response::success(['message' => 'Password changed successfully']);
        
    } catch (Exception $e) {
        Response::serverError('Failed to change password');
    }
}
