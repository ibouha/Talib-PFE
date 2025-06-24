<?php

require_once __DIR__ . '/BaseModel.php';

class RoommateProfile extends BaseModel {
    protected $table = 'roommateprofile';
    
    /**
     * Create new roommate profile - DIRECT MAPPING (No conversion needed!)
     */
    public function createProfile($data) {
        // Simple validation - check required fields
        $required = ['student_id', 'name', 'age', 'gender', 'university', 'program', 'year', 'bio', 'budget', 'lookingFor', 'location', 'phone', 'moveInDate'];
        foreach ($required as $field) {
            if (!isset($data[$field]) || $data[$field] === '') {
                throw new Exception("Field '$field' is required");
            }
        }

        // Basic validation
        if (!is_numeric($data['age']) || $data['age'] < 16 || $data['age'] > 100) {
            throw new Exception("Age must be between 16 and 100");
        }

        if (!is_numeric($data['budget']) || $data['budget'] < 0) {
            throw new Exception("Budget must be a positive number");
        }

        // Validate phone number (Moroccan format)
        if (!preg_match('/^(\+212|0)[5-7][0-9]{8}$/', $data['phone'])) {
            throw new Exception("Invalid phone number format. Use Moroccan format: +212612345678 or 0612345678");
        }

        // Validate move-in date (cannot be in the past)
        $moveInDate = new DateTime($data['moveInDate']);
        $today = new DateTime();
        $today->setTime(0, 0, 0);
        if ($moveInDate < $today) {
            throw new Exception("Move-in date cannot be in the past");
        }

        // Check if student already has a roommate profile
        if ($this->studentHasProfile($data['student_id'])) {
            throw new Exception('Student already has a roommate profile');
        }

        // DIRECT MAPPING - No conversion needed! Frontend matches database
        $profileData = [
            'student_id' => $data['student_id'],
            'name' => trim($data['name']),
            'age' => (int)$data['age'],
            'gender' => $data['gender'],
            'university' => trim($data['university']),
            'program' => trim($data['program']),
            'year' => (int)$data['year'],
            'bio' => trim($data['bio']),
            'interests' => isset($data['interests']) && is_array($data['interests']) ? json_encode($data['interests']) : null,
            'lifestyle' => isset($data['lifestyle']) && is_array($data['lifestyle']) ? json_encode($data['lifestyle']) : null,
            'preferences' => isset($data['preferences']) && is_array($data['preferences']) ? json_encode($data['preferences']) : null,
            'budget' => (float)$data['budget'],
            'lookingFor' => trim($data['lookingFor']),
            'location' => trim($data['location']),
            'phone' => trim($data['phone']),
            'move_in_date' => $data['moveInDate'],
            'avatar' => isset($data['avatar']) ? $data['avatar'] : null,
            'created_at' => date('Y-m-d H:i:s'),
            'updated_at' => date('Y-m-d H:i:s')
        ];

        return $this->create($profileData);
    }
    
    /**
     * Get roommate profile with student details - DIRECT ACCESS
     */
    public function getProfileWithDetails($id) {
        $query = "SELECT rp.*, s.email as student_email, s.phone as student_phone, s.image as student_image
                  FROM {$this->table} rp
                  LEFT JOIN student s ON rp.student_id = s.id
                  WHERE rp.id = :id LIMIT 1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->execute();

        $result = $stmt->fetch();

        // Decode JSON fields if result exists
        if ($result) {
            $result = $this->decodeJsonFields($result);
        }

        return $result;
    }

    /**
     * Helper method to decode JSON fields
     */
    private function decodeJsonFields($profile) {
        if (!$profile) return $profile;

        // Decode JSON fields
        if (isset($profile['interests']) && $profile['interests']) {
            $decoded = json_decode($profile['interests'], true);
            $profile['interests'] = $decoded !== null ? $decoded : [];
        } else {
            $profile['interests'] = [];
        }

        if (isset($profile['lifestyle']) && $profile['lifestyle']) {
            $decoded = json_decode($profile['lifestyle'], true);
            $profile['lifestyle'] = $decoded !== null ? $decoded : [];
        } else {
            $profile['lifestyle'] = [];
        }

        if (isset($profile['preferences']) && $profile['preferences']) {
            $decoded = json_decode($profile['preferences'], true);
            $profile['preferences'] = $decoded !== null ? $decoded : [];
        } else {
            $profile['preferences'] = [];
        }

        return $profile;
    }



    /**
     * Search roommate profiles - DIRECT ACCESS
     */
    public function searchProfiles($filters = [], $orderBy = 'created_at DESC', $limit = 20, $offset = 0) {
        $where = "WHERE 1=1";
        $params = [];

        // Direct filters using new database fields
        if (!empty($filters['budget_min'])) {
            $where .= " AND rp.budget >= :budget_min";
            $params[':budget_min'] = $filters['budget_min'];
        }

        if (!empty($filters['budget_max'])) {
            $where .= " AND rp.budget <= :budget_max";
            $params[':budget_max'] = $filters['budget_max'];
        }

        if (!empty($filters['location'])) {
            $where .= " AND rp.location LIKE :location";
            $params[':location'] = '%' . $filters['location'] . '%';
        }

        if (!empty($filters['university'])) {
            $where .= " AND rp.university LIKE :university";
            $params[':university'] = '%' . $filters['university'] . '%';
        }

        if (!empty($filters['search'])) {
            $where .= " AND (rp.name LIKE :search OR rp.bio LIKE :search2 OR rp.university LIKE :search3)";
            $params[':search'] = '%' . $filters['search'] . '%';
            $params[':search2'] = '%' . $filters['search'] . '%';
            $params[':search3'] = '%' . $filters['search'] . '%';
        }

        // Filter by student_id for user's own profiles
        if (!empty($filters['student_id'])) {
            $where .= " AND rp.student_id = :student_id";
            $params[':student_id'] = $filters['student_id'];
        }

        $query = "SELECT rp.*, s.email as student_email, s.phone as student_phone, s.image as student_image
                  FROM {$this->table} rp
                  LEFT JOIN student s ON rp.student_id = s.id
                  $where
                  ORDER BY $orderBy
                  LIMIT $limit OFFSET $offset";

        $stmt = $this->conn->prepare($query);
        $stmt->execute($params);

        $results = $stmt->fetchAll();

        // Decode JSON fields for each result
        foreach ($results as &$result) {
            $result = $this->decodeJsonFields($result);
        }

        return $results;
    }
    
    /**
     * Count roommate profiles - DIRECT ACCESS
     */
    public function countProfiles($filters = []) {
        $where = "WHERE 1=1";
        $params = [];

        // Direct filters using new database fields
        if (!empty($filters['budget_min'])) {
            $where .= " AND rp.budget >= :budget_min";
            $params[':budget_min'] = $filters['budget_min'];
        }

        if (!empty($filters['budget_max'])) {
            $where .= " AND rp.budget <= :budget_max";
            $params[':budget_max'] = $filters['budget_max'];
        }

        if (!empty($filters['location'])) {
            $where .= " AND rp.location LIKE :location";
            $params[':location'] = '%' . $filters['location'] . '%';
        }

        if (!empty($filters['search'])) {
            $where .= " AND (rp.name LIKE :search OR rp.bio LIKE :search2)";
            $params[':search'] = '%' . $filters['search'] . '%';
            $params[':search2'] = '%' . $filters['search'] . '%';
        }

        // Filter by student_id for user's own profiles
        if (!empty($filters['student_id'])) {
            $where .= " AND rp.student_id = :student_id";
            $params[':student_id'] = $filters['student_id'];
        }

        $query = "SELECT COUNT(*) as total
                  FROM {$this->table} rp
                  $where";

        $stmt = $this->conn->prepare($query);
        $stmt->execute($params);

        $result = $stmt->fetch();
        return $result['total'];
    }
    
    /**
     * Update roommate profile - DIRECT ACCESS
     */
    public function updateProfile($id, $data) {
        // Remove fields that shouldn't be updated
        unset($data['student_id'], $data['created_at']);

        // Encode JSON fields if present
        if (isset($data['interests']) && is_array($data['interests'])) {
            $data['interests'] = json_encode($data['interests']);
        }
        if (isset($data['lifestyle']) && is_array($data['lifestyle'])) {
            $data['lifestyle'] = json_encode($data['lifestyle']);
        }
        if (isset($data['preferences']) && is_array($data['preferences'])) {
            $data['preferences'] = json_encode($data['preferences']);
        }

        // Add updated timestamp
        $data['updated_at'] = date('Y-m-d H:i:s');

        return $this->update($id, $data);
    }
    
    /**
     * Check if student already has a roommate profile
     */
    public function studentHasProfile($studentId) {
        $query = "SELECT COUNT(*) as count FROM {$this->table} WHERE student_id = :student_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':student_id', $studentId);
        $stmt->execute();
        
        $result = $stmt->fetch();
        return $result['count'] > 0;
    }
    
    /**
     * Get roommate profile by student ID - DIRECT ACCESS
     */
    public function getByStudentId($studentId) {
        $query = "SELECT rp.*, s.email as student_email, s.phone as student_phone, s.image as student_image
                  FROM {$this->table} rp
                  LEFT JOIN student s ON rp.student_id = s.id
                  WHERE rp.student_id = :student_id LIMIT 1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':student_id', $studentId);
        $stmt->execute();

        $result = $stmt->fetch();

        // Decode JSON fields if result exists
        if ($result) {
            $result = $this->decodeJsonFields($result);
        }

        return $result;
    }
    
    /**
     * Delete roommate profile
     */
    public function deleteProfile($id) {
        return $this->delete($id);
    }
    
    /**
     * Get compatible roommates - DIRECT ACCESS
     */
    public function getCompatibleRoommates($profileId, $limit = 10) {
        $profile = $this->findById($profileId);
        if (!$profile) {
            return [];
        }

        // Budget range (±500 MAD)
        $budgetMin = $profile['budget'] - 500;
        $budgetMax = $profile['budget'] + 500;

        $query = "SELECT rp.*, s.email as student_email, s.phone as student_phone, s.image as student_image
                  FROM {$this->table} rp
                  LEFT JOIN student s ON rp.student_id = s.id
                  WHERE rp.id != :profile_id
                  AND rp.budget BETWEEN :budget_min AND :budget_max
                  AND rp.location LIKE :location
                  ORDER BY rp.created_at DESC
                  LIMIT $limit";

        $stmt = $this->conn->prepare($query);
        $locationPattern = '%' . $profile['location'] . '%';

        $stmt->bindParam(':profile_id', $profileId);
        $stmt->bindParam(':budget_min', $budgetMin);
        $stmt->bindParam(':budget_max', $budgetMax);
        $stmt->bindParam(':location', $locationPattern);
        $stmt->execute();

        $results = $stmt->fetchAll();

        // Decode JSON fields for each result
        foreach ($results as &$result) {
            $result = $this->decodeJsonFields($result);
        }

        return $results;
    }
}
