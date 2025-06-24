<?php
/**
 * AdminController - Manages admin operations for user management
 */

require_once __DIR__ . '/../models/Student.php';
require_once __DIR__ . '/../models/Owner.php';
require_once __DIR__ . '/../auth.php';
require_once __DIR__ . '/../utils/Response.php';

class AdminController {
    private $studentModel;
    private $ownerModel;

    public function __construct() {
        $this->studentModel = new Student();
        $this->ownerModel = new Owner();
    }

    /**
     * Get all users (students and owners) for admin dashboard
     */
    public function getAllUsers() {
        try {
            // Authenticate admin
            $currentUser = authenticateUser();
            if ($currentUser['role'] !== 'admin') {
                Response::forbidden('Admin access required');
            }

            // Get all students
            $students = $this->studentModel->getAllWithStats();

            // Get all owners
            $owners = $this->ownerModel->getAll();

            // Format the data
            $allUsers = [];
            
            // Add students
            foreach ($students as $student) {
                $allUsers[] = [
                    'id' => $student['id'],
                    'name' => $student['name'],
                    'email' => $student['email'],
                    'phone' => $student['phone'],
                    'university' => $student['university'] ?? null,
                    'status' => $student['status'] ?? 'not_verified',
                    'role' => 'student',
                    'created_at' => $student['created_at'],
                    'updated_at' => $student['updated_at'],
                    'image' => $student['image'] ?? null
                ];
            }
            
            // Add owners
            foreach ($owners as $owner) {
                $allUsers[] = [
                    'id' => $owner['id'],
                    'name' => $owner['name'],
                    'email' => $owner['email'],
                    'phone' => $owner['phone'],
                    'university' => null,
                    'status' => $owner['status'] ?? 'not_verified',
                    'role' => 'owner',
                    'created_at' => $owner['created_at'],
                    'updated_at' => $owner['updated_at'],
                    'image' => $owner['image'] ?? null
                ];
            }

            // Sort by created_at desc
            usort($allUsers, function($a, $b) {
                return strtotime($b['created_at']) - strtotime($a['created_at']);
            });

            Response::success($allUsers, 'Users retrieved successfully');

        } catch (Exception $e) {
            Response::serverError($e->getMessage());
        }
    }

    /**
     * Update user status (verify/unverify)
     */
    public function updateUserStatus() {
        try {
            // Authenticate admin
            $currentUser = authenticateUser();
            if ($currentUser['role'] !== 'admin') {
                Response::forbidden('Admin access required');
            }

            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($input['user_id']) || !isset($input['role']) || !isset($input['status'])) {
                Response::error('user_id, role, and status are required', 400);
            }

            $userId = $input['user_id'];
            $role = $input['role'];
            $status = $input['status'];

            // Validate status
            if (!in_array($status, ['verified', 'not_verified'])) {
                Response::error('Status must be verified or not_verified', 400);
            }

            // Validate role
            if (!in_array($role, ['student', 'owner'])) {
                Response::error('Role must be student or owner', 400);
            }

            $success = false;
            
            if ($role === 'student') {
                $success = $this->studentModel->updateStatus($userId, $status);
            } else {
                $success = $this->ownerModel->updateStatus($userId, $status);
            }

            if ($success) {
                Response::success(null, 'User status updated successfully');
            } else {
                Response::serverError('Failed to update user status');
            }

        } catch (Exception $e) {
            Response::serverError($e->getMessage());
        }
    }

    /**
     * Delete user account
     */
    public function deleteUser() {
        try {
            // Authenticate admin
            $currentUser = authenticateUser();
            if ($currentUser['role'] !== 'admin') {
                Response::forbidden('Admin access required');
            }

            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($input['user_id']) || !isset($input['role'])) {
                Response::error('user_id and role are required', 400);
            }

            $userId = $input['user_id'];
            $role = $input['role'];

            // Validate role
            if (!in_array($role, ['student', 'owner'])) {
                Response::error('Role must be student or owner', 400);
            }

            $success = false;
            
            if ($role === 'student') {
                // Check if student exists
                $student = $this->studentModel->findById($userId);
                if (!$student) {
                    Response::notFound('Student not found');
                }
                $success = $this->studentModel->delete($userId);
            } else {
                // Check if owner exists
                $owner = $this->ownerModel->findById($userId);
                if (!$owner) {
                    Response::notFound('Owner not found');
                }
                $success = $this->ownerModel->delete($userId);
            }

            if ($success) {
                Response::success(null, 'User deleted successfully');
            } else {
                Response::serverError('Failed to delete user');
            }

        } catch (Exception $e) {
            Response::serverError($e->getMessage());
        }
    }

    /**
     * Get user statistics for admin dashboard
     */
    public function getUserStats() {
        try {
            // Authenticate admin
            $currentUser = authenticateUser();
            if ($currentUser['role'] !== 'admin') {
                Response::forbidden('Admin access required');
            }

            $stats = [
                'total_students' => $this->studentModel->getTotalCount(),
                'verified_students' => $this->studentModel->getVerifiedCount(),
                'total_owners' => $this->ownerModel->getTotalCount(),
                'verified_owners' => $this->ownerModel->getVerifiedCount(),
            ];

            $stats['total_users'] = $stats['total_students'] + $stats['total_owners'];
            $stats['total_verified'] = $stats['verified_students'] + $stats['verified_owners'];
            $stats['total_unverified'] = $stats['total_users'] - $stats['total_verified'];

            Response::success($stats, 'User statistics retrieved successfully');

        } catch (Exception $e) {
            Response::serverError($e->getMessage());
        }
    }
}
?>
