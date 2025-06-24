<?php

require_once __DIR__ . '/../models/RoommateProfile.php';
require_once __DIR__ . '/../utils/Response.php';

class RoommateController {
    private $roommateModel;
    
    public function __construct() {
        $this->roommateModel = new RoommateProfile();
    }
    
    /**
     * Get all roommate profiles with filters and pagination
     */
    public function getAll() {
        try {
            // Get query parameters
            $page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
            $limit = isset($_GET['limit']) ? min(50, max(1, (int)$_GET['limit'])) : 20;
            $offset = ($page - 1) * $limit;
            
            // Get filters
            $filters = [
                'gender' => $_GET['gender'] ?? '',
                'budget_min' => $_GET['budget_min'] ?? '',
                'budget_max' => $_GET['budget_max'] ?? '',
                'location' => $_GET['location'] ?? '',
                'university' => $_GET['university'] ?? '',
                'age_min' => $_GET['age_min'] ?? '',
                'age_max' => $_GET['age_max'] ?? '',
                'search' => $_GET['search'] ?? '',
                'student_id' => $_GET['student_id'] ?? '' // Filter by student_id for user's own profiles
            ];
            
            // Remove empty filters
            $filters = array_filter($filters, function($value) {
                return $value !== '';
            });
            
            // Get sort order
            $orderBy = $_GET['sort'] ?? 'created_at DESC';
            $allowedSorts = [
                'created_at DESC', 'created_at ASC',
                'budget_min ASC', 'budget_min DESC',
                'budget_max ASC', 'budget_max DESC',
                'age ASC', 'age DESC'
            ];
            
            if (!in_array($orderBy, $allowedSorts)) {
                $orderBy = 'created_at DESC';
            }
            
            // Get roommate profiles
            $profiles = $this->roommateModel->searchProfiles($filters, $orderBy, $limit, $offset);
            $total = $this->roommateModel->countProfiles($filters);
            
            // JSON fields are already decoded in the model
            
            // Prepare pagination info
            $pagination = [
                'current_page' => $page,
                'per_page' => $limit,
                'total' => $total,
                'total_pages' => ceil($total / $limit),
                'has_next' => $page < ceil($total / $limit),
                'has_prev' => $page > 1
            ];
            
            Response::paginated($profiles, $pagination, 'Roommate profiles retrieved successfully');
            
        } catch (Exception $e) {
            Response::serverError($e->getMessage());
        }
    }
    
    /**
     * Get roommate profile by ID
     */
    public function getById($id) {
        try {
            if (!$id) {
                Response::error('Roommate profile ID is required', 400);
            }
            
            $profile = $this->roommateModel->getProfileWithDetails($id);
            
            if (!$profile) {
                Response::notFound('Roommate profile not found');
            }
            
            // JSON fields are already decoded in the model
            
            Response::success($profile, 'Roommate profile retrieved successfully');
            
        } catch (Exception $e) {
            Response::serverError($e->getMessage());
        }
    }
    
    /**
     * Create new roommate profile (with avatar upload and custom mapping)
     */
    public function create() {
        try {
            // Handle both JSON and multipart/form-data
            if (isset($_SERVER['CONTENT_TYPE']) && strpos($_SERVER['CONTENT_TYPE'], 'multipart/form-data') !== false) {
                $input = $_POST;
                // Handle avatar upload
                $avatarPath = null;
                if (isset($_FILES['avatar']) && $_FILES['avatar']['error'] === UPLOAD_ERR_OK) {
                    $uploadDir = __DIR__ . '/../uploads/roommateProfileImages/';
                    $ext = pathinfo($_FILES['avatar']['name'], PATHINFO_EXTENSION);
                    $filename = 'roommate_avatar_' . $input['student_id'] . '_' . time() . '.' . $ext;
                    $targetPath = $uploadDir . $filename;
                    if (move_uploaded_file($_FILES['avatar']['tmp_name'], $targetPath)) {
                        $avatarPath = 'roommateProfileImages/' . $filename;
                    }
                }
                $input['avatar'] = $avatarPath;
                // Parse JSON fields if sent as strings
                foreach(['interests','lifestyle','preferences'] as $jsonField) {
                    if (isset($input[$jsonField]) && is_string($input[$jsonField])) {
                        $decoded = json_decode($input[$jsonField], true);
                        if ($decoded !== null) $input[$jsonField] = $decoded;
                    }
                }
            } else {
                $input = json_decode(file_get_contents('php://input'), true);
            }
            if (!$input) {
                Response::error('Invalid input data', 400);
            }
            // Create roommate profile
            $profileId = $this->roommateModel->createProfile($input);
            if ($profileId) {
                $profile = $this->roommateModel->getProfileWithDetails($profileId);
                Response::created($profile, 'Roommate profile created successfully');
            } else {
                Response::serverError('Failed to create roommate profile');
            }
        } catch (Exception $e) {
            Response::error($e->getMessage(), 400);
        }
    }
    
    /**
     * Update roommate profile (with avatar upload and custom mapping)
     */
    public function update($id) {
        try {
            if (!$id) {
                Response::error('Roommate profile ID is required', 400);
            }
            
            // Check if profile exists
            $existingProfile = $this->roommateModel->findById($id);
            if (!$existingProfile) {
                Response::notFound('Roommate profile not found');
            }
            
            // Handle both JSON and multipart/form-data
            if (isset($_SERVER['CONTENT_TYPE']) && strpos($_SERVER['CONTENT_TYPE'], 'multipart/form-data') !== false) {
                $input = $_POST;
                // Handle avatar upload
                $avatarPath = $existingProfile['avatar'];
                if (isset($_FILES['avatar']) && $_FILES['avatar']['error'] === UPLOAD_ERR_OK) {
                    $uploadDir = __DIR__ . '/../uploads/roommateProfileImages/';
                    $ext = pathinfo($_FILES['avatar']['name'], PATHINFO_EXTENSION);
                    $filename = 'roommate_avatar_' . $existingProfile['student_id'] . '_' . time() . '.' . $ext;
                    $targetPath = $uploadDir . $filename;
                    if (move_uploaded_file($_FILES['avatar']['tmp_name'], $targetPath)) {
                        $avatarPath = 'roommateProfileImages/' . $filename;
                    }
                }
                $input['avatar'] = $avatarPath;
                // Parse JSON fields if sent as strings
                foreach(['interests','lifestyle','preferences'] as $jsonField) {
                    if (isset($input[$jsonField]) && is_string($input[$jsonField])) {
                        $decoded = json_decode($input[$jsonField], true);
                        if ($decoded !== null) $input[$jsonField] = $decoded;
                    }
                }
            } else {
                $input = json_decode(file_get_contents('php://input'), true);
            }
            if (!$input) {
                Response::error('Invalid input data', 400);
            }
            
            // Update profile
            $success = $this->roommateModel->updateProfile($id, $input);
            
            if ($success) {
                $updatedProfile = $this->roommateModel->getProfileWithDetails($id);
                Response::success($updatedProfile, 'Roommate profile updated successfully');
            } else {
                Response::serverError('Failed to update roommate profile');
            }
            
        } catch (Exception $e) {
            Response::error($e->getMessage(), 400);
        }
    }
    
    /**
     * Delete roommate profile
     */
    public function delete($id) {
        try {
            if (!$id) {
                Response::error('Roommate profile ID is required', 400);
            }
            
            // Check if profile exists
            $existingProfile = $this->roommateModel->findById($id);
            if (!$existingProfile) {
                Response::notFound('Roommate profile not found');
            }
            
            // Delete profile
            $success = $this->roommateModel->deleteProfile($id);
            
            if ($success) {
                Response::success(null, 'Roommate profile deleted successfully');
            } else {
                Response::serverError('Failed to delete roommate profile');
            }
            
        } catch (Exception $e) {
            Response::serverError($e->getMessage());
        }
    }
    
    /**
     * Get roommate profile by student ID
     */
    public function getByStudentId($studentId) {
        try {
            if (!$studentId) {
                Response::error('Student ID is required', 400);
            }
            
            $profile = $this->roommateModel->getByStudentId($studentId);

            if (!$profile) {
                Response::notFound('No roommate profile found for this student');
            }

            Response::success($profile, 'Roommate profile retrieved successfully');
            
        } catch (Exception $e) {
            Response::serverError($e->getMessage());
        }
    }
    
    /**
     * Get compatible roommates for a profile
     */
    public function getCompatible($id) {
        try {
            if (!$id) {
                Response::error('Roommate profile ID is required', 400);
            }
            
            $limit = isset($_GET['limit']) ? min(20, max(1, (int)$_GET['limit'])) : 10;
            
            $compatibleRoommates = $this->roommateModel->getCompatibleRoommates($id, $limit);
            
            Response::success($compatibleRoommates, 'Compatible roommates retrieved successfully');
            
        } catch (Exception $e) {
            Response::serverError($e->getMessage());
        }
    }

}
?>
