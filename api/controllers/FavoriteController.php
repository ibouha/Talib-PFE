<?php

require_once __DIR__ . '/../models/Favorite.php';
require_once __DIR__ . '/../utils/Response.php';

class FavoriteController {
    private $favoriteModel;
    
    public function __construct() {
        $this->favoriteModel = new Favorite();
    }
    
    /**
     * Get user favorites
     */
    public function getUserFavorites() {
        try {
            $studentId = $_GET['student_id'] ?? null;
            $type = $_GET['type'] ?? null;
            
            if (!$studentId) {
                Response::error('Student ID is required', 400);
            }
            
            // Get pagination parameters
            $page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
            $limit = isset($_GET['limit']) ? min(50, max(1, (int)$_GET['limit'])) : 20;
            $offset = ($page - 1) * $limit;
            
            // Get favorites
            $favorites = $this->favoriteModel->getUserFavorites($studentId, $type, $limit, $offset);
            $total = $this->favoriteModel->countUserFavorites($studentId, $type);
            
            // Prepare pagination info
            $pagination = [
                'current_page' => $page,
                'per_page' => $limit,
                'total' => $total,
                'total_pages' => ceil($total / $limit),
                'has_next' => $page < ceil($total / $limit),
                'has_prev' => $page > 1
            ];
            
            Response::paginated($favorites, $pagination, 'Favorites retrieved successfully');
            
        } catch (Exception $e) {
            Response::serverError($e->getMessage());
        }
    }
    
    /**
     * Add to favorites
     */
    public function addToFavorites() {
        try {
            // Get input data
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input) {
                Response::error('Invalid JSON data', 400);
            }
            
            // Add to favorites
            $favoriteId = $this->favoriteModel->addToFavorites($input);
            
            if ($favoriteId) {
                Response::created(['id' => $favoriteId], 'Added to favorites successfully');
            } else {
                Response::serverError('Failed to add to favorites');
            }
            
        } catch (Exception $e) {
            Response::error($e->getMessage(), 400);
        }
    }
    
    /**
     * Remove from favorites
     */
    public function removeFromFavorites($id) {
        try {
            if (!$id) {
                Response::error('Favorite ID is required', 400);
            }
            
            // Check if favorite exists
            $existingFavorite = $this->favoriteModel->findById($id);
            if (!$existingFavorite) {
                Response::notFound('Favorite not found');
            }
            
            // Remove from favorites
            $success = $this->favoriteModel->removeFromFavorites($id);
            
            if ($success) {
                Response::success(null, 'Removed from favorites successfully');
            } else {
                Response::serverError('Failed to remove from favorites');
            }
            
        } catch (Exception $e) {
            Response::serverError($e->getMessage());
        }
    }
    
    /**
     * Get favorite statistics for a student
     */
    public function getFavoriteStats() {
        try {
            $studentId = $_GET['student_id'] ?? null;
            
            if (!$studentId) {
                Response::error('Student ID is required', 400);
            }
            
            $stats = $this->favoriteModel->getFavoriteStats($studentId);
            
            Response::success($stats, 'Favorite statistics retrieved successfully');
            
        } catch (Exception $e) {
            Response::serverError($e->getMessage());
        }
    }
    
    /**
     * Check if item is favorited
     */
    public function checkFavorited() {
        try {
            $studentId = $_GET['student_id'] ?? null;
            $type = $_GET['type'] ?? null;
            $itemId = $_GET['item_id'] ?? null;
            $housingId = $_GET['housing_id'] ?? null;
            $roommateProfileId = $_GET['roommateProfile_id'] ?? null;
            
            if (!$studentId || !$type) {
                Response::error('Student ID and type are required', 400);
            }
            
            $isFavorited = $this->favoriteModel->isFavorited($studentId, $type, $itemId, $housingId, $roommateProfileId);
            
            Response::success(['is_favorited' => $isFavorited], 'Favorite status checked successfully');
            
        } catch (Exception $e) {
            Response::serverError($e->getMessage());
        }
    }
    
    /**
     * Get most favorited items
     */
    public function getMostFavoritedItems() {
        try {
            $limit = isset($_GET['limit']) ? min(20, max(1, (int)$_GET['limit'])) : 10;
            
            $items = $this->favoriteModel->getMostFavoritedItems($limit);
            
            Response::success($items, 'Most favorited items retrieved successfully');
            
        } catch (Exception $e) {
            Response::serverError($e->getMessage());
        }
    }
    
    /**
     * Get most favorited housing
     */
    public function getMostFavoritedHousing() {
        try {
            $limit = isset($_GET['limit']) ? min(20, max(1, (int)$_GET['limit'])) : 10;
            
            $housing = $this->favoriteModel->getMostFavoritedHousing($limit);
            
            Response::success($housing, 'Most favorited housing retrieved successfully');
            
        } catch (Exception $e) {
            Response::serverError($e->getMessage());
        }
    }
    
    /**
     * Get recent favorites
     */
    public function getRecentFavorites() {
        try {
            $studentId = $_GET['student_id'] ?? null;
            $limit = isset($_GET['limit']) ? min(10, max(1, (int)$_GET['limit'])) : 5;
            
            if (!$studentId) {
                Response::error('Student ID is required', 400);
            }
            
            $favorites = $this->favoriteModel->getRecentFavorites($studentId, $limit);
            
            Response::success($favorites, 'Recent favorites retrieved successfully');
            
        } catch (Exception $e) {
            Response::serverError($e->getMessage());
        }
    }
    
    /**
     * Remove specific favorite by type and ID
     */
    public function removeSpecificFavorite() {
        try {
            // Get input data
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input) {
                Response::error('Invalid JSON data', 400);
            }
            
            $studentId = $input['student_id'] ?? null;
            $type = $input['type'] ?? null;
            $itemId = $input['item_id'] ?? null;
            $housingId = $input['housing_id'] ?? null;
            $roommateProfileId = $input['roommateProfile_id'] ?? null;
            
            if (!$studentId || !$type) {
                Response::error('Student ID and type are required', 400);
            }
            
            $success = $this->favoriteModel->removeSpecificFavorite($studentId, $type, $itemId, $housingId, $roommateProfileId);
            
            if ($success) {
                Response::success(null, 'Removed from favorites successfully');
            } else {
                Response::error('Favorite not found or already removed', 404);
            }
            
        } catch (Exception $e) {
            Response::error($e->getMessage(), 400);
        }
    }
}
?>
