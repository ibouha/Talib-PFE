<?php

require_once __DIR__ . '/BaseModel.php';

class Admin extends BaseModel {
    protected $table = 'admin';
    
    /**
     * Find admin by username
     */
    public function findByUsername($username) {
        $query = "SELECT * FROM {$this->table} WHERE username = :username LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':username', $username);
        $stmt->execute();
        
        return $stmt->fetch();
    }
    
    /**
     * Verify admin password
     */
    public function verifyPassword($username, $password) {
        $admin = $this->findByUsername($username);
        
        if ($admin && password_verify($password, $admin['password'])) {
            // Remove password from returned data
            unset($admin['password']);
            return $admin;
        }
        
        return false;
    }
    
    /**
     * Create new admin
     */
    public function createAdmin($username, $password) {
        $data = [
            'username' => $username,
            'password' => password_hash($password, PASSWORD_DEFAULT)
        ];
        
        $query = "INSERT INTO {$this->table} (username, password) VALUES (:username, :password)";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':username', $data['username']);
        $stmt->bindParam(':password', $data['password']);
        
        return $stmt->execute();
    }
    
    /**
     * Change admin password
     */
    public function changePassword($username, $newPassword) {
        $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
        
        $query = "UPDATE {$this->table} SET password = :password WHERE username = :username";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':password', $hashedPassword);
        $stmt->bindParam(':username', $username);
        
        return $stmt->execute();
    }
    
    /**
     * Get platform statistics
     */
    public function getPlatformStats() {
        $stats = [];
        
        // Count total students
        $query = "SELECT COUNT(*) as total FROM Student";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $stats['total_students'] = $stmt->fetch()['total'];
        
        // Count total owners
        $query = "SELECT COUNT(*) as total FROM owner";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $stats['total_owners'] = $stmt->fetch()['total'];
        
        // Count total housing listings
        $query = "SELECT COUNT(*) as total FROM Housing";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $stats['total_housing'] = $stmt->fetch()['total'];
        
        // Count available housing
        $query = "SELECT COUNT(*) as total FROM Housing WHERE status = 'available'";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $stats['available_housing'] = $stmt->fetch()['total'];
        
        // Count total items
        $query = "SELECT COUNT(*) as total FROM Item";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $stats['total_items'] = $stmt->fetch()['total'];
        
        // Count available items
        $query = "SELECT COUNT(*) as total FROM Item WHERE status = 'available'";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $stats['available_items'] = $stmt->fetch()['total'];
        
        // Count roommate profiles
        $query = "SELECT COUNT(*) as total FROM RoommateProfile";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $stats['roommate_profiles'] = $stmt->fetch()['total'];
        
        // Count total favorites
        $query = "SELECT COUNT(*) as total FROM Favorite";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $stats['total_favorites'] = $stmt->fetch()['total'];
        
        // Get recent registrations (last 30 days)
        $query = "SELECT COUNT(*) as total FROM Student WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $stats['recent_student_registrations'] = $stmt->fetch()['total'];
        
        // Get top universities by student count
        $query = "SELECT university, COUNT(*) as student_count 
                  FROM Student 
                  GROUP BY university 
                  ORDER BY student_count DESC 
                  LIMIT 5";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $stats['top_universities'] = $stmt->fetchAll();
        
        // Get housing by city
        $query = "SELECT city, COUNT(*) as housing_count 
                  FROM Housing 
                  GROUP BY city 
                  ORDER BY housing_count DESC 
                  LIMIT 5";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $stats['housing_by_city'] = $stmt->fetchAll();
        
        return $stats;
    }
    
    /**
     * Get recent activity
     */
    public function getRecentActivity($limit = 20) {
        $activities = [];
        
        // Recent student registrations
        $query = "SELECT 'student_registration' as type, name as title, created_at as date 
                  FROM Student 
                  ORDER BY created_at DESC 
                  LIMIT :limit";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        $activities = array_merge($activities, $stmt->fetchAll());
        
        // Recent housing listings
        $query = "SELECT 'housing_listing' as type, title, created_at as date 
                  FROM Housing 
                  ORDER BY created_at DESC 
                  LIMIT :limit";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        $activities = array_merge($activities, $stmt->fetchAll());
        
        // Recent item listings
        $query = "SELECT 'item_listing' as type, title, created_at as date 
                  FROM Item 
                  ORDER BY created_at DESC 
                  LIMIT :limit";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        $activities = array_merge($activities, $stmt->fetchAll());
        
        // Sort by date
        usort($activities, function($a, $b) {
            return strtotime($b['date']) - strtotime($a['date']);
        });
        
        return array_slice($activities, 0, $limit);
    }
}
