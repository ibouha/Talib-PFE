<?php
/**
 * StudentController - Manages student-related operations
 *
 * This controller handles:
 * - Getting student profiles and lists
 * - Updating student information
 * - Changing passwords
 * - Managing student items
 *
 * For PFE: Simple student management with proper validation
 */

require_once __DIR__ . '/../models/Student.php';
require_once __DIR__ . '/../auth.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/Validator.php';
require_once __DIR__ . '/../config/Config.php';

class StudentController {
    private $studentModel; // Student model instance

    public function __construct() {
        $this->studentModel = new Student();
    }
    
    /**
     * Get all students with pagination and filters - Simple student listing
     */
    public function getAll() {
        try {
            // Get query parameters from URL (?page=1&limit=20&search=ahmed)
            $page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
            $limit = isset($_GET['limit']) ? min(100, max(1, (int)$_GET['limit'])) : 20;
            $search = $_GET['search'] ?? '';
            $university = $_GET['university'] ?? '';

            $offset = ($page - 1) * $limit; // Calculate offset for pagination

            // Get students based on filters (simple if-else logic)
            if (!empty($search)) {
                // Search by name or email
                $students = $this->studentModel->search($search, $limit, $offset);
                $total = $this->studentModel->count(); // For simplicity, using total count
            } elseif (!empty($university)) {
                // Filter by university
                $students = $this->studentModel->getByUniversity($university, $limit, $offset);
                $total = $this->studentModel->count(['university' => $university]);
            } else {
                // Get all students (newest first)
                $students = $this->studentModel->findAll([], 'created_at DESC', $limit, $offset);
                $total = $this->studentModel->count();
            }

            // Remove sensitive data (never send passwords!)
            foreach ($students as &$student) {
                unset($student['password']);
            }

            // Prepare pagination info for frontend
            $pagination = [
                'current_page' => $page,
                'per_page' => $limit,
                'total' => $total,
                'total_pages' => ceil($total / $limit),
                'has_next' => $page < ceil($total / $limit),
                'has_prev' => $page > 1
            ];

            Response::paginated($students, $pagination, 'Students retrieved successfully');

        } catch (Exception $e) {
            Response::serverError($e->getMessage());
        }
    }
    
    /**
     * Get student by ID
     */
    public function getById($id) {
        try {
            // Validate ID
            if (!is_numeric($id)) {
                Response::error('Invalid student ID', 400);
            }
            
            $student = $this->studentModel->getProfileWithStats($id);
            
            if (!$student) {
                Response::notFound('Student not found');
            }
            
            Response::success($student, 'Student retrieved successfully');
            
        } catch (Exception $e) {
            Response::serverError($e->getMessage());
        }
    }
    
    /**
     * Update student profile
     */
    public function update($id) {
        try {
            // Authenticate user
            $currentUser = authenticateUser();

            // Check if user is updating their own profile or is admin
            if ($currentUser['role'] !== 'admin' && $currentUser['user_id'] != $id) {
                Response::forbidden('You can only update your own profile');
            }
            
            // Validate ID
            if (!is_numeric($id)) {
                Response::error('Invalid student ID', 400);
            }
            
            // Check if student exists
            $existingStudent = $this->studentModel->findById($id);
            if (!$existingStudent) {
                Response::notFound('Student not found');
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
                
                // Check if phone is already taken by another student
                $existingPhone = $this->studentModel->findByPhone($input['phone']);
                if ($existingPhone && $existingPhone['id'] != $id) {
                    Response::error('Phone number already exists', 409);
                }
            }
            
            if (isset($input['university'])) {
                $validator->required('university', 'University is required')
                         ->maxLength('university', 100, 'University name must not exceed 100 characters');
            }
            
            if (isset($input['bio'])) {
                $validator->maxLength('bio', 1000, 'Bio must not exceed 1000 characters');
            }
            
            if (isset($input['gender'])) {
                $validator->in('gender', ['male', 'female', 'other'], 'Gender must be male, female, or other');
            }
            
            if (isset($input['date_of_birth'])) {
                $validator->date('date_of_birth', 'Y-m-d', 'Date of birth must be in YYYY-MM-DD format');
            }
            
            if ($validator->fails()) {
                Response::validationError($validator->getErrors());
            }
            
            // Prepare update data
            $updateData = [];
            $allowedFields = ['name', 'phone', 'university', 'bio', 'gender', 'date_of_birth', 'image'];
            
            foreach ($allowedFields as $field) {
                if (isset($input[$field])) {
                    $updateData[$field] = $input[$field];
                }
            }
            
            if (empty($updateData)) {
                Response::error('No valid fields to update', 400);
            }

            // Update student
            $success = $this->studentModel->updateProfile($id, $updateData);

            if ($success) {
                $updatedStudent = $this->studentModel->getProfileWithStats($id);
                Response::success($updatedStudent, 'Profile updated successfully');
            } else {
                Response::serverError('Failed to update profile');
            }
            
        } catch (Exception $e) {
            Response::serverError($e->getMessage());
        }
    }
    
    /**
     * Change student password
     */
    public function changePassword($id) {
        try {
            // Authenticate user
            $currentUser = authenticateUser();

            // Check if user is updating their own password
            if ($currentUser['role'] !== 'admin' && $currentUser['user_id'] != $id) {
                Response::forbidden('You can only change your own password');
            }
            
            // Validate ID
            if (!is_numeric($id)) {
                Response::error('Invalid student ID', 400);
            }
            
            // Get input data
            $input = json_decode(file_get_contents('php://input'), true);
            
            // Validate input
            $validator = new Validator($input);
            $validator->required('current_password', 'Current password is required')
                     ->required('new_password', 'New password is required')
                     ->minLength('new_password', 6, 'New password must be at least 6 characters')
                     ->required('confirm_password', 'Password confirmation is required');
            
            if ($validator->fails()) {
                Response::validationError($validator->getErrors());
            }
            
            // Check if new password matches confirmation
            if ($input['new_password'] !== $input['confirm_password']) {
                Response::error('New password and confirmation do not match', 400);
            }
            
            // Verify current password (only if not admin)
            if ($currentUser['role'] !== 'admin') {
                $student = $this->studentModel->findById($id);
                if (!password_verify($input['current_password'], $student['password'])) {
                    Response::error('Current password is incorrect', 400);
                }
            }
            
            // Change password
            $success = $this->studentModel->changePassword($id, $input['new_password']);
            
            if ($success) {
                Response::success(null, 'Password changed successfully');
            } else {
                Response::serverError('Failed to change password');
            }
            
        } catch (Exception $e) {
            Response::serverError($e->getMessage());
        }
    }
    
    /**
     * Get student's items
     */
    public function getItems($id) {
        try {
            // Validate ID
            if (!is_numeric($id)) {
                Response::error('Invalid student ID', 400);
            }
            
            // Check if student exists
            $student = $this->studentModel->findById($id);
            if (!$student) {
                Response::notFound('Student not found');
            }
            
            // Get pagination parameters
            $page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
            $limit = isset($_GET['limit']) ? min(100, max(1, (int)$_GET['limit'])) : 20;
            $offset = ($page - 1) * $limit;
            
            // Get student's items
            require_once __DIR__ . '/../models/Item.php';
            $itemModel = new Item();
            $items = $itemModel->getByStudent($id, $limit, $offset);
            $total = $itemModel->count(['student_id' => $id]);
            
            // Prepare pagination info
            $pagination = [
                'current_page' => $page,
                'per_page' => $limit,
                'total' => $total,
                'total_pages' => ceil($total / $limit),
                'has_next' => $page < ceil($total / $limit),
                'has_prev' => $page > 1
            ];
            
            Response::paginated($items, $pagination, 'Student items retrieved successfully');
            
        } catch (Exception $e) {
            Response::serverError($e->getMessage());
        }
    }
}
