<?php
/**
 * AuthController - Handles user authentication (login/register)
 *
 * This controller manages:
 * - Student login and registration
 * - Owner login and registration
 * - Admin login
 * - JWT token generation for sessions
 *
 * For PFE: Simple authentication system for different user types
 */

require_once __DIR__ . '/../models/Student.php';
require_once __DIR__ . '/../models/Owner.php';
require_once __DIR__ . '/../models/Admin.php';
require_once __DIR__ . '/../utils/JWT.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/Validator.php';
require_once __DIR__ . '/../config/Config.php';

class AuthController {
    
    /**
     * Student/Owner login - Simple login for both user types
     */
    public function login() {
        // Get JSON data from request
        $input = json_decode(file_get_contents('php://input'), true);

        // Validate input (check required fields)
        $validator = new Validator($input);
        $validator->required('email', 'Email is required')
                 ->email('email', 'Please provide a valid email')
                 ->required('password', 'Password is required');

        if ($validator->fails()) {
            Response::validationError($validator->getErrors());
        }

        $email = $input['email'];
        $password = $input['password'];

        // Try to authenticate as student first
        $studentModel = new Student();
        $student = $studentModel->verifyPassword($email, $password);

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
        }

        // Try to authenticate as owner if not student
        $ownerModel = new Owner();
        $owner = $ownerModel->verifyPassword($email, $password);

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
        }

        // If neither student nor owner found
        Response::error('Invalid email or password', 401);
    }
    
    /**
     * Student/Owner registration
     */
    public function register() {
        $input = json_decode(file_get_contents('php://input'), true);
        
        // Validate common fields
        $validator = new Validator($input);
        $validator->required('name', 'Name is required')
                 ->maxLength('name', 100, 'Name must not exceed 100 characters')
                 ->required('email', 'Email is required')
                 ->email('email', 'Please provide a valid email')
                 ->required('password', 'Password is required')
                 ->minLength('password', 6, 'Password must be at least 6 characters')
                 ->required('phone', 'Phone number is required')
                 ->phone('phone', 'Please provide a valid phone number')
                 ->required('role', 'Role is required')
                 ->in('role', ['student', 'owner'], 'Role must be either student or owner');
        
        // Additional validation for students
        if (isset($input['role']) && $input['role'] === 'student') {
            $validator->required('university', 'University is required for students')
                     ->studentEmail('email', 'Student email must end with -edu.ma');
        }
        
        if ($validator->fails()) {
            Response::validationError($validator->getErrors());
        }
        
        $role = $input['role'];
        
        try {
            if ($role === 'student') {
                $this->registerStudent($input);
            } else {
                $this->registerOwner($input);
            }
        } catch (Exception $e) {
            Response::serverError($e->getMessage());
        }
    }
    
    /**
     * Register student
     */
    private function registerStudent($data) {
        $studentModel = new Student();
        
        // Check if email already exists
        if ($studentModel->findByEmail($data['email'])) {
            Response::error('Email already exists', 409);
        }

        // Check if phone already exists
        if ($studentModel->findByPhone($data['phone'])) {
            Response::error('Phone number already exists', 409);
        }
        
        // Create student
        $studentData = [
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'],
            'phone' => $data['phone'],
            'university' => $data['university'],
            'bio' => $data['bio'] ?? '',
            'gender' => $data['gender'] ?? null,
            'date_of_birth' => $data['date_of_birth'] ?? null
        ];
        
        $studentId = $studentModel->createStudent($studentData);
        
        if ($studentId) {
            $student = $studentModel->findById($studentId);
            unset($student['password']);
            
            $token = JWT::encode([
                'user_id' => $student['id'],
                'email' => $student['email'],
                'role' => 'student'
            ]);
            
            Response::created([
                'token' => $token,
                'user' => $student,
                'role' => 'student'
            ], 'Student registered successfully');
        } else {
            Response::serverError('Failed to create student account');
        }
    }
    
    /**
     * Register owner
     */
    private function registerOwner($data) {
        $ownerModel = new Owner();
        
        // Check if email already exists
        if ($ownerModel->findByEmail($data['email'])) {
            Response::error('Email already exists', 409);
        }

        // Check if phone already exists
        if ($ownerModel->findByPhone($data['phone'])) {
            Response::error('Phone number already exists', 409);
        }
        
        // Create owner
        $ownerData = [
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'],
            'phone' => $data['phone']
        ];
        
        $ownerId = $ownerModel->createOwner($ownerData);
        
        if ($ownerId) {
            $owner = $ownerModel->findById($ownerId);
            unset($owner['password']);
            
            $token = JWT::encode([
                'user_id' => $owner['id'],
                'email' => $owner['email'],
                'role' => 'owner'
            ]);
            
            Response::created([
                'token' => $token,
                'user' => $owner,
                'role' => 'owner'
            ], 'Owner registered successfully');
        } else {
            Response::serverError('Failed to create owner account');
        }
    }
    
    /**
     * Admin login
     */
    public function adminLogin() {
        $input = json_decode(file_get_contents('php://input'), true);
        
        // Validate input
        $validator = new Validator($input);
        $validator->required('username', 'Username is required')
                 ->required('password', 'Password is required');
        
        if ($validator->fails()) {
            Response::validationError($validator->getErrors());
        }
        
        $username = $input['username'];
        $password = $input['password'];
        
        $adminModel = new Admin();
        $admin = $adminModel->verifyPassword($username, $password);
        
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
}
