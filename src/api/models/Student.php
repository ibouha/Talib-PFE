<?php

require_once __DIR__ . '/BaseModel.php';

class Student extends BaseModel {
    protected $table = 'Student';
    /**
     * Create new student
     */
    public function createStudent($data) {
        // Hash password
        $data['password'] = password_hash($data['password'], PASSWORD_DEFAULT);
        
        // Set timestamps
        $data['created_at'] = date('Y-m-d H:i:s');
        $data['updated_at'] = date('Y-m-d H:i:s');
        
        return $this->create($data);
    }
    
    /**
     * Find student by email
     */
    public function findByEmail($email) {
        $query = "SELECT * FROM {$this->table} WHERE email = :email LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':email', $email);
        $stmt->execute();
        
        return $stmt->fetch();
    }
    
    /**
     * Find student by phone
     */
    public function findByPhone($phone) {
        $query = "SELECT * FROM {$this->table} WHERE phone = :phone LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':phone', $phone);
        $stmt->execute();
        
        return $stmt->fetch();
    }
    
    /**
     * Verify student password
     */
    public function verifyPassword($email, $password) {
        $student = $this->findByEmail($email);
        
        if ($student && password_verify($password, $student['password'])) {
            // Remove password from returned data
            unset($student['password']);
            return $student;
        }
        
        return false;
    }
    
    /**
     * Update student profile
     */
    public function updateProfile($id, $data) {
        // Remove sensitive fields that shouldn't be updated via profile
        unset($data['password'], $data['email'], $data['created_at']);
        
        // Set updated timestamp
        $data['updated_at'] = date('Y-m-d H:i:s');
        
        return $this->update($id, $data);
    }
    
    /**
     * Change student password
     */
    public function changePassword($id, $newPassword) {
        $data = [
            'password' => password_hash($newPassword, PASSWORD_DEFAULT),
            'updated_at' => date('Y-m-d H:i:s')
        ];
        
        return $this->update($id, $data);
    }
    
    /**
     * Get student profile with statistics
     */
    public function getProfileWithStats($id) {
        $student = $this->findById($id);
        
        if (!$student) {
            return null;
        }
        
        // Remove password
        unset($student['password']);
        
        // Get statistics
        $stats = $this->getStudentStats($id);
        $student['stats'] = $stats;
        
        return $student;
    }
    
    /**
     * Get student statistics
     */
    public function getStudentStats($studentId) {
        $stats = [];
        
        // Count items posted
        $query = "SELECT COUNT(*) as total FROM Item WHERE student_id = :student_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':student_id', $studentId);
        $stmt->execute();
        $stats['items_posted'] = $stmt->fetch()['total'];
        
        // Count roommate profiles
        $query = "SELECT COUNT(*) as total FROM RoommateProfile WHERE student_id = :student_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':student_id', $studentId);
        $stmt->execute();
        $stats['roommate_profiles'] = $stmt->fetch()['total'];
        
        // Count favorites
        $query = "SELECT COUNT(*) as total FROM Favorite WHERE student_id = :student_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':student_id', $studentId);
        $stmt->execute();
        $stats['favorites'] = $stmt->fetch()['total'];
        
        return $stats;
    }
    
    /**
     * Search students by university or name
     */
    public function search($query, $limit = 20, $offset = 0) {
        $searchQuery = "SELECT id, name, email, university, image, created_at 
                       FROM {$this->table} 
                       WHERE name LIKE :query OR university LIKE :query 
                       ORDER BY name ASC 
                       LIMIT :limit OFFSET :offset";
        
        $stmt = $this->conn->prepare($searchQuery);
        $searchTerm = "%{$query}%";
        $stmt->bindParam(':query', $searchTerm);
        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        
        return $stmt->fetchAll();
    }
    
    /**
     * Get students by university
     */
    public function getByUniversity($university, $limit = 20, $offset = 0) {
        $query = "SELECT id, name, email, university, image, created_at 
                  FROM {$this->table} 
                  WHERE university = :university 
                  ORDER BY name ASC 
                  LIMIT :limit OFFSET :offset";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':university', $university);
        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        
        return $stmt->fetchAll();
    }
}
