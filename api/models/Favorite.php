<?php

require_once __DIR__ . '/BaseModel.php';

class Favorite extends BaseModel {
    protected $table = 'favorite';
    
    /**
     * Add item to favorites
     */
    public function addToFavorites($data) {
        // Validate required fields
        if (empty($data['student_id']) || empty($data['type'])) {
            throw new Exception('Student ID and type are required');
        }
        
        $studentId = $data['student_id'];
        $type = $data['type'];
        
        // Validate type and get the appropriate ID
        $itemId = null;
        $housingId = null;
        $roommateProfileId = null;
        
        if ($type === 'Item') {
            if (empty($data['item_id'])) {
                throw new Exception('Item ID is required for item favorites');
            }
            $itemId = $data['item_id'];
        } elseif ($type === 'Housing') {
            if (empty($data['housing_id'])) {
                throw new Exception('Housing ID is required for housing favorites');
            }
            $housingId = $data['housing_id'];
        } elseif ($type === 'RoommateProfile') {
            if (empty($data['roommateProfile_id'])) {
                throw new Exception('Roommate Profile ID is required for roommate favorites');
            }
            $roommateProfileId = $data['roommateProfile_id'];
        } else {
            throw new Exception('Invalid type. Must be Item, Housing, or RoommateProfile');
        }
        
        // Check if already in favorites
        if ($this->isAlreadyFavorited($studentId, $type, $itemId, $housingId, $roommateProfileId)) {
            throw new Exception('Already in favorites');
        }
        
        // Prepare data for insertion
        $favoriteData = [
            'student_id' => $studentId,
            'type' => $type,
            'item_id' => $itemId,
            'housing_id' => $housingId,
            'roommateProfile_id' => $roommateProfileId,
            'created_at' => date('Y-m-d H:i:s')
        ];
        
        return $this->create($favoriteData);
    }
    
    /**
     * Check if item is already favorited
     */
    public function isAlreadyFavorited($studentId, $type, $itemId = null, $housingId = null, $roommateProfileId = null) {
        $where = "WHERE student_id = :student_id AND type = :type";
        $params = [
            ':student_id' => $studentId,
            ':type' => $type
        ];
        
        if ($type === 'Item' && $itemId) {
            $where .= " AND item_id = :item_id";
            $params[':item_id'] = $itemId;
        } elseif ($type === 'Housing' && $housingId) {
            $where .= " AND housing_id = :housing_id";
            $params[':housing_id'] = $housingId;
        } elseif ($type === 'RoommateProfile' && $roommateProfileId) {
            $where .= " AND roommateProfile_id = :roommateProfile_id";
            $params[':roommateProfile_id'] = $roommateProfileId;
        }
        
        $query = "SELECT COUNT(*) as count FROM {$this->table} $where";
        $stmt = $this->conn->prepare($query);
        $stmt->execute($params);
        
        $result = $stmt->fetch();
        return $result['count'] > 0;
    }
    
    /**
     * Get user favorites with details
     */
    public function getUserFavorites($studentId, $type = null, $limit = 20, $offset = 0) {
        $where = "WHERE f.student_id = :student_id";
        $params = [':student_id' => $studentId];
        
        if ($type) {
            $where .= " AND f.type = :type";
            $params[':type'] = $type;
        }
        
        $query = "SELECT f.*,
                         i.title as item_title, i.price as item_price, i.category as item_category, i.location as item_location,
                         h.title as housing_title, h.price as housing_price, h.city as housing_city, h.type as housing_type,
                         rp.budget as roommate_budget, rp.location as roommate_location, rp.name as roommate_name,
                         rp.age as roommate_age, rp.university as roommate_university
                  FROM {$this->table} f
                  LEFT JOIN item i ON f.item_id = i.id
                  LEFT JOIN housing h ON f.housing_id = h.id
                  LEFT JOIN roommateprofile rp ON f.roommateProfile_id = rp.id
                  $where
                  ORDER BY f.created_at DESC
                  LIMIT $limit OFFSET $offset";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute($params);
        
        return $stmt->fetchAll();
    }
    
    /**
     * Count user favorites
     */
    public function countUserFavorites($studentId, $type = null) {
        $where = "WHERE student_id = :student_id";
        $params = [':student_id' => $studentId];
        
        if ($type) {
            $where .= " AND type = :type";
            $params[':type'] = $type;
        }
        
        $query = "SELECT COUNT(*) as total FROM {$this->table} $where";
        $stmt = $this->conn->prepare($query);
        $stmt->execute($params);
        
        $result = $stmt->fetch();
        return $result['total'];
    }
    
    /**
     * Remove from favorites
     */
    public function removeFromFavorites($id) {
        return $this->delete($id);
    }
    
    /**
     * Remove specific favorite by student and item/housing
     */
    public function removeSpecificFavorite($studentId, $type, $itemId = null, $housingId = null, $roommateProfileId = null) {
        $where = "WHERE student_id = :student_id AND type = :type";
        $params = [
            ':student_id' => $studentId,
            ':type' => $type
        ];
        
        if ($type === 'Item' && $itemId) {
            $where .= " AND item_id = :item_id";
            $params[':item_id'] = $itemId;
        } elseif ($type === 'Housing' && $housingId) {
            $where .= " AND housing_id = :housing_id";
            $params[':housing_id'] = $housingId;
        } elseif ($type === 'RoommateProfile' && $roommateProfileId) {
            $where .= " AND roommateProfile_id = :roommateProfile_id";
            $params[':roommateProfile_id'] = $roommateProfileId;
        }
        
        $query = "DELETE FROM {$this->table} $where";
        $stmt = $this->conn->prepare($query);
        
        return $stmt->execute($params);
    }
    
    /**
     * Get favorites by type
     */
    public function getFavoritesByType($studentId, $type) {
        return $this->getUserFavorites($studentId, $type);
    }
    
    /**
     * Get favorite statistics for a student
     */
    public function getFavoriteStats($studentId) {
        $stats = [];
        
        // Count by type
        $types = ['Item', 'Housing', 'RoommateProfile'];
        
        foreach ($types as $type) {
            $query = "SELECT COUNT(*) as count FROM {$this->table} WHERE student_id = :student_id AND type = :type";
            $stmt = $this->conn->prepare($query);
            $stmt->execute([':student_id' => $studentId, ':type' => $type]);
            $result = $stmt->fetch();
            $stats[strtolower($type) . '_count'] = $result['count'];
        }
        
        // Total favorites
        $query = "SELECT COUNT(*) as total FROM {$this->table} WHERE student_id = :student_id";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([':student_id' => $studentId]);
        $result = $stmt->fetch();
        $stats['total_favorites'] = $result['total'];
        
        return $stats;
    }
    
    /**
     * Get most favorited items
     */
    public function getMostFavoritedItems($limit = 10) {
        $query = "SELECT i.*, COUNT(f.id) as favorite_count
                  FROM item i
                  LEFT JOIN {$this->table} f ON i.id = f.item_id AND f.type = 'Item'
                  GROUP BY i.id
                  ORDER BY favorite_count DESC, i.created_at DESC
                  LIMIT $limit";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        
        return $stmt->fetchAll();
    }
    
    /**
     * Get most favorited housing
     */
    public function getMostFavoritedHousing($limit = 10) {
        $query = "SELECT h.*, COUNT(f.id) as favorite_count
                  FROM housing h
                  LEFT JOIN {$this->table} f ON h.id = f.housing_id AND f.type = 'Housing'
                  GROUP BY h.id
                  ORDER BY favorite_count DESC, h.created_at DESC
                  LIMIT $limit";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        
        return $stmt->fetchAll();
    }
    
    /**
     * Check if specific item is favorited by student
     */
    public function isFavorited($studentId, $type, $itemId = null, $housingId = null, $roommateProfileId = null) {
        return $this->isAlreadyFavorited($studentId, $type, $itemId, $housingId, $roommateProfileId);
    }
    
    /**
     * Get recent favorites
     */
    public function getRecentFavorites($studentId, $limit = 5) {
        return $this->getUserFavorites($studentId, null, $limit, 0);
    }
}
?>
