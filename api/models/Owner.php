<?php

require_once __DIR__ . '/BaseModel.php';

class Owner extends BaseModel {
    protected $table = 'owner';
    
    /**
     * Create new owner
     */
    public function createOwner($data) {
        // Hash password
        $data['password'] = password_hash($data['password'], PASSWORD_DEFAULT);
        
        return $this->create($data);
    }
    
    /**
     * Find owner by email
     */
    public function findByEmail($email) {
        $query = "SELECT * FROM {$this->table} WHERE email = :email LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':email', $email);
        $stmt->execute();
        
        return $stmt->fetch();
    }
    
    /**
     * Find owner by phone
     */
    public function findByPhone($phone) {
        $query = "SELECT * FROM {$this->table} WHERE phone = :phone LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':phone', $phone);
        $stmt->execute();
        
        return $stmt->fetch();
    }
    
    /**
     * Verify owner password
     */
    public function verifyPassword($email, $password) {
        $owner = $this->findByEmail($email);
        
        if ($owner && password_verify($password, $owner['password'])) {
            // Remove password from returned data
            unset($owner['password']);
            return $owner;
        }
        
        return false;
    }
    
    /**
     * Update owner profile
     */
    public function updateProfile($id, $data) {
        // Remove sensitive fields that shouldn't be updated via profile
        unset($data['password'], $data['email'], $data['created_at']);

        // Set updated timestamp
        $data['updated_at'] = date('Y-m-d H:i:s');

        return $this->update($id, $data);
    }
    
    /**
     * Change owner password
     */
    public function changePassword($id, $newPassword) {
        $data = [
            'password' => password_hash($newPassword, PASSWORD_DEFAULT)
        ];
        
        return $this->update($id, $data);
    }
    
    /**
     * Get owner profile with statistics
     */
    public function getProfileWithStats($id) {
        $owner = $this->findById($id);
        
        if (!$owner) {
            return null;
        }
        
        // Remove password
        unset($owner['password']);
        
        // Get statistics
        $stats = $this->getOwnerStats($id);
        $owner['stats'] = $stats;
        
        return $owner;
    }
    
    /**
     * Get owner statistics
     */
    public function getOwnerStats($ownerId) {
        $stats = [];
        
        // Count housing listings
        $query = "SELECT COUNT(*) as total FROM Housing WHERE owner_id = :owner_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':owner_id', $ownerId);
        $stmt->execute();
        $stats['housing_listings'] = $stmt->fetch()['total'];
        
        // Count available housing
        $query = "SELECT COUNT(*) as total FROM Housing WHERE owner_id = :owner_id AND status = 'available'";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':owner_id', $ownerId);
        $stmt->execute();
        $stats['available_housing'] = $stmt->fetch()['total'];
        
        // Count rented housing
        $query = "SELECT COUNT(*) as total FROM Housing WHERE owner_id = :owner_id AND status = 'rented'";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':owner_id', $ownerId);
        $stmt->execute();
        $stats['rented_housing'] = $stmt->fetch()['total'];
        
        // Count housing contacts/inquiries
        $query = "SELECT COUNT(*) as total FROM HousingContact hc 
                  JOIN Housing h ON hc.housing_id = h.id 
                  WHERE h.owner_id = :owner_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':owner_id', $ownerId);
        $stmt->execute();
        $stats['inquiries'] = $stmt->fetch()['total'];
        
        return $stats;
    }
    
    /**
     * Get housing listings for owner
     */
    public function getHousingListings($ownerId, $limit = 20, $offset = 0) {
        $query = "SELECT h.*, 
                         (SELECT COUNT(*) FROM HousingContact hc WHERE hc.housing_id = h.id) as inquiry_count,
                         (SELECT GROUP_CONCAT(hi.path) FROM HousingImage hi WHERE hi.housing_id = h.id) as images
                  FROM Housing h 
                  WHERE h.owner_id = :owner_id 
                  ORDER BY h.created_at DESC 
                  LIMIT :limit OFFSET :offset";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':owner_id', $ownerId);
        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        
        $listings = $stmt->fetchAll();
        
        // Process images
        foreach ($listings as &$listing) {
            $listing['images'] = $listing['images'] ? explode(',', $listing['images']) : [];
        }
        
        return $listings;
    }
    
    /**
     * Get housing inquiries for owner
     */
    public function getHousingInquiries($ownerId, $limit = 20, $offset = 0) {
        $query = "SELECT hc.*, h.title as housing_title, s.name as student_name, s.email as student_email
                  FROM HousingContact hc
                  JOIN Housing h ON hc.housing_id = h.id
                  JOIN Student s ON hc.student_id = s.id
                  WHERE h.owner_id = :owner_id
                  ORDER BY hc.contact_date DESC
                  LIMIT :limit OFFSET :offset";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':owner_id', $ownerId);
        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        
        return $stmt->fetchAll();
    }

    /**
     * Search owners by name or email
     */
    public function search($searchTerm, $limit = 20, $offset = 0) {
        $query = "SELECT * FROM {$this->table}
                  WHERE name LIKE :search OR email LIKE :search
                  ORDER BY created_at DESC
                  LIMIT :limit OFFSET :offset";

        $stmt = $this->conn->prepare($query);
        $searchParam = '%' . $searchTerm . '%';
        $stmt->bindParam(':search', $searchParam);
        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll();
    }

    /**
     * Get all owners for admin dashboard
     */
    public function getAll() {
        $query = "SELECT * FROM {$this->table} ORDER BY created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();

        $owners = $stmt->fetchAll();

        // Remove passwords for security
        foreach ($owners as &$owner) {
            unset($owner['password']);
        }

        return $owners;
    }

    /**
     * Update owner status (verified/not_verified)
     */
    public function updateStatus($id, $status) {
        $data = [
            'status' => $status,
            'updated_at' => date('Y-m-d H:i:s')
        ];

        return $this->update($id, $data);
    }

    /**
     * Get total count of owners
     */
    public function getTotalCount() {
        $query = "SELECT COUNT(*) as total FROM {$this->table}";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();

        return $stmt->fetch()['total'];
    }

    /**
     * Get count of verified owners
     */
    public function getVerifiedCount() {
        $query = "SELECT COUNT(*) as total FROM {$this->table} WHERE status = 'verified'";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();

        return $stmt->fetch()['total'];
    }
}
