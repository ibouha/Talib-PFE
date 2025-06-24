<?php
/**
 * Housing Model - Manages housing listings and related operations
 *
 * This model handles:
 * - Creating and updating housing listings
 * - Searching and filtering housing
 * - Managing housing images
 * - Handling student inquiries/contacts
 *
 * For PFE: Simple housing management system
 */

require_once __DIR__ . '/BaseModel.php';

class Housing extends BaseModel {
    protected $table = 'housing'; // Database table name

    /**
     * Create new housing listing - Add a new property for rent
     */
    public function createHousing($data) {
        // Set timestamps automatically
        $data['created_at'] = date('Y-m-d H:i:s');
        $data['updated_at'] = date('Y-m-d H:i:s');

        return $this->create($data);
    }
    
    /**
     * Update housing listing
     */
    public function updateHousing($id, $data) {
        // Set updated timestamp
        $data['updated_at'] = date('Y-m-d H:i:s');
        
        return $this->update($id, $data);
    }
    
    /**
     * Get housing with images and owner info
     */
    public function getHousingWithDetails($id) {
        $query = "SELECT h.*, o.name as owner_name, o.email as owner_email, o.phone as owner_phone
                  FROM {$this->table} h
                  LEFT JOIN owner o ON h.owner_id = o.id
                  WHERE h.id = :id";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        
        $housing = $stmt->fetch();
        
        if ($housing) {
            // Get images
            $housing['images'] = $this->getHousingImages($id);
            
            // Get contact count
            $housing['contact_count'] = $this->getContactCount($id);
        }
        
        return $housing;
    }
    
    /**
     * Get housing images
     */
    public function getHousingImages($housingId) {
        $query = "SELECT path FROM housingimage WHERE housing_id = :housing_id ORDER BY id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':housing_id', $housingId, PDO::PARAM_INT);
        $stmt->execute();

        $images = $stmt->fetchAll(PDO::FETCH_COLUMN);
        return $images;
    }
    
    /**
     * Add housing image
     */
    public function addHousingImage($housingId, $imagePath) {
        $query = "INSERT INTO housingimage (housing_id, path) VALUES (:housing_id, :path)";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':housing_id', $housingId, PDO::PARAM_INT);
        $stmt->bindParam(':path', $imagePath);

        return $stmt->execute();
    }
    
    /**
     * Remove housing image
     */
    public function removeHousingImage($imageId) {
        $query = "DELETE FROM housingimage WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $imageId, PDO::PARAM_INT);

        return $stmt->execute();
    }
    
    /**
     * Get contact count for housing
     */
    public function getContactCount($housingId) {
        $query = "SELECT COUNT(*) as total FROM housingcontact WHERE housing_id = :housing_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':housing_id', $housingId, PDO::PARAM_INT);
        $stmt->execute();

        $result = $stmt->fetch();
        return (int) $result['total'];
    }
    
    /**
     * Search housing with filters
     */
    public function searchHousing($filters = [], $orderBy = 'created_at DESC', $limit = 20, $offset = 0) {
        $whereConditions = [];
        $params = [];
        
        // Build WHERE clause based on filters
        if (!empty($filters['city'])) {
            $whereConditions[] = "h.city = :city";
            $params[':city'] = $filters['city'];
        }
        
        if (!empty($filters['type'])) {
            $whereConditions[] = "h.type = :type";
            $params[':type'] = $filters['type'];
        }
        
        if (!empty($filters['min_price'])) {
            $whereConditions[] = "h.price >= :min_price";
            $params[':min_price'] = $filters['min_price'];
        }
        
        if (!empty($filters['max_price'])) {
            $whereConditions[] = "h.price <= :max_price";
            $params[':max_price'] = $filters['max_price'];
        }
        
        if (!empty($filters['bedrooms'])) {
            $whereConditions[] = "h.bedrooms >= :bedrooms";
            $params[':bedrooms'] = $filters['bedrooms'];
        }
        
        if (!empty($filters['bathrooms'])) {
            $whereConditions[] = "h.bathrooms >= :bathrooms";
            $params[':bathrooms'] = $filters['bathrooms'];
        }
        
        if (!empty($filters['is_furnished'])) {
            $whereConditions[] = "h.is_furnished = :is_furnished";
            $params[':is_furnished'] = $filters['is_furnished'] === 'true' ? 1 : 0;
        }
        
        if (!empty($filters['status'])) {
            $whereConditions[] = "h.status = :status";
            $params[':status'] = $filters['status'];
        } else {
            // Default to available only
            $whereConditions[] = "h.status = 'available'";
        }
        
        if (!empty($filters['available_from'])) {
            $whereConditions[] = "h.available_from <= :available_from";
            $params[':available_from'] = $filters['available_from'];
        }
        
        if (!empty($filters['search'])) {
            $whereConditions[] = "(h.title LIKE :search1 OR h.description LIKE :search2 OR h.address LIKE :search3)";
            $searchTerm = '%' . $filters['search'] . '%';
            $params[':search1'] = $searchTerm;
            $params[':search2'] = $searchTerm;
            $params[':search3'] = $searchTerm;
        }
        
        // Filter by owner_id if provided
        if (!empty($filters['owner_id'])) {
            $whereConditions[] = "h.owner_id = :owner_id";
            $params[':owner_id'] = $filters['owner_id'];
        }
        
        // Build query - Get housing with owner info and images
        $query = "SELECT h.*, o.name as owner_name, o.phone as owner_phone,
                         (SELECT GROUP_CONCAT(hi.path) FROM housingimage hi WHERE hi.housing_id = h.id LIMIT 3) as images
                  FROM {$this->table} h
                  LEFT JOIN owner o ON h.owner_id = o.id";
        
        if (!empty($whereConditions)) {
            $query .= " WHERE " . implode(' AND ', $whereConditions);
        }
        
        $query .= " ORDER BY {$orderBy} LIMIT :limit OFFSET :offset";
        
        $stmt = $this->conn->prepare($query);
        
        // Bind parameters
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        
        $stmt->execute();
        $results = $stmt->fetchAll();
        
        // Process images
        foreach ($results as &$housing) {
            $housing['images'] = $housing['images'] ? explode(',', $housing['images']) : [];
        }
        
        return $results;
    }
    
    /**
     * Count housing with filters
     */
    public function countHousing($filters = []) {
        $whereConditions = [];
        $params = [];
        
        // Build WHERE clause (same logic as searchHousing)
        if (!empty($filters['city'])) {
            $whereConditions[] = "city = :city";
            $params[':city'] = $filters['city'];
        }
        
        if (!empty($filters['type'])) {
            $whereConditions[] = "type = :type";
            $params[':type'] = $filters['type'];
        }
        
        if (!empty($filters['min_price'])) {
            $whereConditions[] = "price >= :min_price";
            $params[':min_price'] = $filters['min_price'];
        }
        
        if (!empty($filters['max_price'])) {
            $whereConditions[] = "price <= :max_price";
            $params[':max_price'] = $filters['max_price'];
        }
        
        if (!empty($filters['bedrooms'])) {
            $whereConditions[] = "bedrooms >= :bedrooms";
            $params[':bedrooms'] = $filters['bedrooms'];
        }
        
        if (!empty($filters['bathrooms'])) {
            $whereConditions[] = "bathrooms >= :bathrooms";
            $params[':bathrooms'] = $filters['bathrooms'];
        }
        
        if (!empty($filters['is_furnished'])) {
            $whereConditions[] = "is_furnished = :is_furnished";
            $params[':is_furnished'] = $filters['is_furnished'] === 'true' ? 1 : 0;
        }
        
        if (!empty($filters['status'])) {
            $whereConditions[] = "status = :status";
            $params[':status'] = $filters['status'];
        } else {
            $whereConditions[] = "status = 'available'";
        }
        
        if (!empty($filters['available_from'])) {
            $whereConditions[] = "available_from <= :available_from";
            $params[':available_from'] = $filters['available_from'];
        }
        
        if (!empty($filters['search'])) {
            $whereConditions[] = "(title LIKE :search1 OR description LIKE :search2 OR address LIKE :search3)";
            $searchTerm = '%' . $filters['search'] . '%';
            $params[':search1'] = $searchTerm;
            $params[':search2'] = $searchTerm;
            $params[':search3'] = $searchTerm;
        }

        // Filter by owner_id if provided
        if (!empty($filters['owner_id'])) {
            $whereConditions[] = "owner_id = :owner_id";
            $params[':owner_id'] = $filters['owner_id'];
        }

        $query = "SELECT COUNT(*) as total FROM {$this->table}";
        
        if (!empty($whereConditions)) {
            $query .= " WHERE " . implode(' AND ', $whereConditions);
        }
        
        $stmt = $this->conn->prepare($query);
        
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        
        $stmt->execute();
        $result = $stmt->fetch();
        
        return (int) $result['total'];
    }
    
    /**
     * Get housing by owner
     */
    public function getByOwner($ownerId, $limit = 20, $offset = 0) {
        $query = "SELECT h.*,
                         (SELECT COUNT(*) FROM housingcontact hc WHERE hc.housing_id = h.id) as contact_count,
                         (SELECT GROUP_CONCAT(hi.path) FROM housingimage hi WHERE hi.housing_id = h.id) as images
                  FROM {$this->table} h
                  WHERE h.owner_id = :owner_id
                  ORDER BY h.created_at DESC
                  LIMIT :limit OFFSET :offset";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':owner_id', $ownerId, PDO::PARAM_INT);
        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        
        $results = $stmt->fetchAll();
        
        // Process images
        foreach ($results as &$housing) {
            $housing['images'] = $housing['images'] ? explode(',', $housing['images']) : [];
        }
        
        return $results;
    }
    
    /**
     * Add housing contact/inquiry
     */
    public function addContact($housingId, $studentId, $message = null) {
        $query = "INSERT INTO housingcontact (housing_id, student_id, message, contact_date)
                  VALUES (:housing_id, :student_id, :message, NOW())";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':housing_id', $housingId, PDO::PARAM_INT);
        $stmt->bindParam(':student_id', $studentId, PDO::PARAM_INT);
        $stmt->bindParam(':message', $message);

        return $stmt->execute();
    }
}
