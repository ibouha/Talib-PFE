<?php
/**
 * Item Model - Manages marketplace items (buy/sell system)
 *
 * This model handles:
 * - Creating and updating item listings
 * - Searching and filtering items
 * - Managing item images
 * - Tracking favorites and categories
 *
 * For PFE: Simple marketplace for students to buy/sell items
 */

require_once __DIR__ . '/BaseModel.php';

class Item extends BaseModel {
    protected $table = 'item'; // Database table name (lowercase)
    
    /**
     * Create new item listing
     */
    public function createItem($data) {
        // Set timestamps
        $data['created_at'] = date('Y-m-d H:i:s');
        $data['updated_at'] = date('Y-m-d H:i:s');
        
        return $this->create($data);
    }
    
    /**
     * Update item listing
     */
    public function updateItem($id, $data) {
        // Set updated timestamp
        $data['updated_at'] = date('Y-m-d H:i:s');
        
        return $this->update($id, $data);
    }
    
    /**
     * Get item with images and seller info
     */
    public function getItemWithDetails($id) {
        $query = "SELECT i.*, s.name as seller_name, s.email as seller_email, s.phone as seller_phone, s.university as seller_university
                  FROM {$this->table} i
                  LEFT JOIN student s ON i.student_id = s.id
                  WHERE i.id = :id";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        
        $item = $stmt->fetch();
        
        if ($item) {
            // Get images
            $item['images'] = $this->getItemImages($id);
            
            // Get favorite count
            $item['favorite_count'] = $this->getFavoriteCount($id);
        }
        
        return $item;
    }
    
    /**
     * Get item images - Get all photos for an item
     */
    public function getItemImages($itemId) {
        $query = "SELECT path FROM itemimage WHERE item_id = :item_id ORDER BY id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':item_id', $itemId, PDO::PARAM_INT);
        $stmt->execute();

        $images = $stmt->fetchAll(PDO::FETCH_COLUMN);
        return $images;
    }

    /**
     * Add item image - Upload a new photo for an item
     */
    public function addItemImage($itemId, $imagePath) {
        $query = "INSERT INTO itemimage (item_id, path) VALUES (:item_id, :path)";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':item_id', $itemId, PDO::PARAM_INT);
        $stmt->bindParam(':path', $imagePath);

        return $stmt->execute();
    }

    /**
     * Remove item image - Delete a photo
     */
    public function removeItemImage($imageId) {
        $query = "DELETE FROM itemimage WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $imageId, PDO::PARAM_INT);

        return $stmt->execute();
    }
    
    /**
     * Get favorite count for item - How many students liked this item
     */
    public function getFavoriteCount($itemId) {
        $query = "SELECT COUNT(*) as total FROM favorite WHERE item_id = :item_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':item_id', $itemId, PDO::PARAM_INT);
        $stmt->execute();

        $result = $stmt->fetch();
        return (int) $result['total'];
    }
    
    /**
     * Search items with filters
     */
    public function searchItems($filters = [], $orderBy = 'created_at DESC', $limit = 20, $offset = 0) {
        $whereConditions = [];
        $params = [];
        
        // Build WHERE clause based on filters
        if (!empty($filters['category'])) {
            $whereConditions[] = "i.category = :category";
            $params[':category'] = $filters['category'];
        }
        
        if (!empty($filters['condition_status'])) {
            $whereConditions[] = "i.condition_status = :condition_status";
            $params[':condition_status'] = $filters['condition_status'];
        }
        
        if (!empty($filters['location'])) {
            $whereConditions[] = "i.location LIKE :location";
            $params[':location'] = '%' . $filters['location'] . '%';
        }
        
        if (!empty($filters['min_price'])) {
            $whereConditions[] = "i.price >= :min_price";
            $params[':min_price'] = $filters['min_price'];
        }
        
        if (!empty($filters['max_price'])) {
            $whereConditions[] = "i.price <= :max_price";
            $params[':max_price'] = $filters['max_price'];
        }
        
        if (!empty($filters['is_free'])) {
            $whereConditions[] = "i.is_free = :is_free";
            $params[':is_free'] = $filters['is_free'] === 'true' ? 1 : 0;
        }
        
        if (!empty($filters['status'])) {
            $whereConditions[] = "i.status = :status";
            $params[':status'] = $filters['status'];
        } else {
            // Default to available only
            $whereConditions[] = "i.status = 'available'";
        }
        
        if (!empty($filters['university'])) {
            $whereConditions[] = "s.university LIKE :university";
            $params[':university'] = '%' . $filters['university'] . '%';
        }
        
        if (!empty($filters['search'])) {
            $whereConditions[] = "(i.title LIKE :search1 OR i.description LIKE :search2)";
            $searchTerm = '%' . $filters['search'] . '%';
            $params[':search1'] = $searchTerm;
            $params[':search2'] = $searchTerm;
        }

        // Filter by student_id for user's own items
        if (!empty($filters['student_id'])) {
            $whereConditions[] = "i.student_id = :student_id";
            $params[':student_id'] = $filters['student_id'];
        }
        
        // Build query
        $query = "SELECT i.*, s.name as seller_name, s.university as seller_university,
                         (SELECT GROUP_CONCAT(ii.path) FROM itemimage ii WHERE ii.item_id = i.id LIMIT 3) as images,
                         (SELECT COUNT(*) FROM favorite f WHERE f.item_id = i.id) as favorite_count
                  FROM {$this->table} i
                  LEFT JOIN student s ON i.student_id = s.id";
        
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
        foreach ($results as &$item) {
            $item['images'] = $item['images'] ? explode(',', $item['images']) : [];
        }
        
        return $results;
    }
    
    /**
     * Count items with filters
     */
    public function countItems($filters = []) {
        $whereConditions = [];
        $params = [];
        
        // Build WHERE clause (same logic as searchItems)
        if (!empty($filters['category'])) {
            $whereConditions[] = "i.category = :category";
            $params[':category'] = $filters['category'];
        }
        
        if (!empty($filters['condition_status'])) {
            $whereConditions[] = "i.condition_status = :condition_status";
            $params[':condition_status'] = $filters['condition_status'];
        }
        
        if (!empty($filters['location'])) {
            $whereConditions[] = "i.location LIKE :location";
            $params[':location'] = '%' . $filters['location'] . '%';
        }
        
        if (!empty($filters['min_price'])) {
            $whereConditions[] = "i.price >= :min_price";
            $params[':min_price'] = $filters['min_price'];
        }
        
        if (!empty($filters['max_price'])) {
            $whereConditions[] = "i.price <= :max_price";
            $params[':max_price'] = $filters['max_price'];
        }
        
        if (!empty($filters['is_free'])) {
            $whereConditions[] = "i.is_free = :is_free";
            $params[':is_free'] = $filters['is_free'] === 'true' ? 1 : 0;
        }
        
        if (!empty($filters['status'])) {
            $whereConditions[] = "i.status = :status";
            $params[':status'] = $filters['status'];
        } else {
            $whereConditions[] = "i.status = 'available'";
        }
        
        if (!empty($filters['university'])) {
            $whereConditions[] = "s.university LIKE :university";
            $params[':university'] = '%' . $filters['university'] . '%';
        }
        
        if (!empty($filters['search'])) {
            $whereConditions[] = "(i.title LIKE :search1 OR i.description LIKE :search2)";
            $searchTerm = '%' . $filters['search'] . '%';
            $params[':search1'] = $searchTerm;
            $params[':search2'] = $searchTerm;
        }

        // Filter by student_id for user's own items
        if (!empty($filters['student_id'])) {
            $whereConditions[] = "i.student_id = :student_id";
            $params[':student_id'] = $filters['student_id'];
        }

        $query = "SELECT COUNT(*) as total FROM {$this->table} i LEFT JOIN student s ON i.student_id = s.id";
        
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
     * Get items by student
     */
    public function getByStudent($studentId, $limit = 20, $offset = 0) {
        $query = "SELECT i.*, 
                         (SELECT COUNT(*) FROM Favorite f WHERE f.item_id = i.id) as favorite_count,
                         (SELECT GROUP_CONCAT(ii.path) FROM ItemImage ii WHERE ii.item_id = i.id) as images
                  FROM {$this->table} i
                  WHERE i.student_id = :student_id
                  ORDER BY i.created_at DESC
                  LIMIT :limit OFFSET :offset";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':student_id', $studentId, PDO::PARAM_INT);
        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        
        $results = $stmt->fetchAll();
        
        // Process images
        foreach ($results as &$item) {
            $item['images'] = $item['images'] ? explode(',', $item['images']) : [];
        }
        
        return $results;
    }
    
    /**
     * Get items by category
     */
    public function getByCategory($category, $limit = 20, $offset = 0) {
        $query = "SELECT i.*, s.name as seller_name, s.university as seller_university,
                         (SELECT GROUP_CONCAT(ii.path) FROM ItemImage ii WHERE ii.item_id = i.id LIMIT 3) as images
                  FROM {$this->table} i
                  LEFT JOIN Student s ON i.student_id = s.id
                  WHERE i.category = :category AND i.status = 'available'
                  ORDER BY i.created_at DESC
                  LIMIT :limit OFFSET :offset";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':category', $category);
        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        
        $results = $stmt->fetchAll();
        
        // Process images
        foreach ($results as &$item) {
            $item['images'] = $item['images'] ? explode(',', $item['images']) : [];
        }
        
        return $results;
    }
    
    /**
     * Get popular categories
     */
    public function getPopularCategories($limit = 10) {
        $query = "SELECT category, COUNT(*) as item_count 
                  FROM {$this->table} 
                  WHERE status = 'available' 
                  GROUP BY category 
                  ORDER BY item_count DESC 
                  LIMIT :limit";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        
        return $stmt->fetchAll();
    }
    
    /**
     * Mark item as sold
     */
    public function markAsSold($id) {
        return $this->updateItem($id, ['status' => 'sold']);
    }
    
    /**
     * Mark item as available
     */
    public function markAsAvailable($id) {
        return $this->updateItem($id, ['status' => 'available']);
    }
}
