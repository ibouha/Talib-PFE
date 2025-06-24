<?php
/**
 * Item Model - Procedural approach
 * Functions to handle item data operations
 */

require_once __DIR__ . '/../config/Database_procedural.php';

/**
 * Create new item
 */
function create_item($data) {
    $data['created_at'] = date('Y-m-d H:i:s');
    $data['updated_at'] = date('Y-m-d H:i:s');
    
    $sql = "INSERT INTO item (title, description, price, category, condition_status, status, is_free, location, student_id, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
    try {
        return executeInsert($sql, [
            $data['title'],
            $data['description'],
            $data['price'],
            $data['category'],
            $data['condition_status'] ?? 'good',
            $data['status'] ?? 'available',
            $data['is_free'] ?? 0,
            $data['location'],
            $data['student_id'],
            $data['created_at'],
            $data['updated_at']
        ], "ssdsssissss");
    } catch (Exception $e) {
        error_log("Create item error: " . $e->getMessage());
        return false;
    }
}

/**
 * Get item by ID
 */
function get_item_by_id($id) {
    $sql = "SELECT * FROM item WHERE id = ?";
    return fetchRow($sql, [$id], "i");
}

/**
 * Get item with details (including seller info)
 */
function get_item_with_details($id) {
    $sql = "SELECT i.*, s.name as seller_name, s.email as seller_email, s.phone as seller_phone, s.university as seller_university
            FROM item i
            LEFT JOIN student s ON i.student_id = s.id
            WHERE i.id = ?";
    
    $item = fetchRow($sql, [$id], "i");
    
    if ($item) {
        // Get images
        $item['images'] = get_item_images($id);
        
        // Get favorite count
        $item['favorite_count'] = get_item_favorite_count($id);
    }
    
    return $item;
}

/**
 * Search items with filters
 */
function search_items($filters = [], $orderBy = 'created_at DESC', $limit = 20, $offset = 0) {
    $whereClause = [];
    $values = [];
    $types = "";
    
    // Build WHERE clause based on filters
    if (!empty($filters['category'])) {
        $whereClause[] = "category = ?";
        $values[] = $filters['category'];
        $types .= "s";
    }
    
    if (!empty($filters['location'])) {
        $whereClause[] = "location LIKE ?";
        $values[] = "%" . $filters['location'] . "%";
        $types .= "s";
    }
    
    if (!empty($filters['condition'])) {
        $whereClause[] = "condition_status = ?";
        $values[] = $filters['condition'];
        $types .= "s";
    }
    
    if (!empty($filters['min_price'])) {
        $whereClause[] = "price >= ?";
        $values[] = $filters['min_price'];
        $types .= "d";
    }
    
    if (!empty($filters['max_price'])) {
        $whereClause[] = "price <= ?";
        $values[] = $filters['max_price'];
        $types .= "d";
    }
    
    if (isset($filters['is_free']) && $filters['is_free'] !== '') {
        $whereClause[] = "is_free = ?";
        $values[] = $filters['is_free'];
        $types .= "i";
    }
    
    if (!empty($filters['search'])) {
        $whereClause[] = "(title LIKE ? OR description LIKE ?)";
        $searchTerm = "%" . $filters['search'] . "%";
        $values[] = $searchTerm;
        $values[] = $searchTerm;
        $types .= "ss";
    }
    
    // Default to available items only
    if (!isset($filters['status'])) {
        $whereClause[] = "status = 'available'";
    } elseif (!empty($filters['status'])) {
        $whereClause[] = "status = ?";
        $values[] = $filters['status'];
        $types .= "s";
    }
    
    $sql = "SELECT i.*, s.name as seller_name, s.university as seller_university 
            FROM item i 
            LEFT JOIN student s ON i.student_id = s.id";
    
    if (!empty($whereClause)) {
        $sql .= " WHERE " . implode(" AND ", $whereClause);
    }
    
    $sql .= " ORDER BY " . $orderBy . " LIMIT ? OFFSET ?";
    $values[] = $limit;
    $values[] = $offset;
    $types .= "ii";
    
    $items = fetchAll($sql, $values, $types);
    
    // Add images to each item
    foreach ($items as &$item) {
        $item['images'] = get_item_images($item['id']);
    }
    
    return $items;
}

/**
 * Count items with filters
 */
function count_items($filters = []) {
    $whereClause = [];
    $values = [];
    $types = "";
    
    // Build WHERE clause (same logic as search_items)
    if (!empty($filters['category'])) {
        $whereClause[] = "category = ?";
        $values[] = $filters['category'];
        $types .= "s";
    }
    
    if (!empty($filters['location'])) {
        $whereClause[] = "location LIKE ?";
        $values[] = "%" . $filters['location'] . "%";
        $types .= "s";
    }
    
    if (!empty($filters['condition'])) {
        $whereClause[] = "condition_status = ?";
        $values[] = $filters['condition'];
        $types .= "s";
    }
    
    if (!empty($filters['min_price'])) {
        $whereClause[] = "price >= ?";
        $values[] = $filters['min_price'];
        $types .= "d";
    }
    
    if (!empty($filters['max_price'])) {
        $whereClause[] = "price <= ?";
        $values[] = $filters['max_price'];
        $types .= "d";
    }
    
    if (isset($filters['is_free']) && $filters['is_free'] !== '') {
        $whereClause[] = "is_free = ?";
        $values[] = $filters['is_free'];
        $types .= "i";
    }
    
    if (!empty($filters['search'])) {
        $whereClause[] = "(title LIKE ? OR description LIKE ?)";
        $searchTerm = "%" . $filters['search'] . "%";
        $values[] = $searchTerm;
        $values[] = $searchTerm;
        $types .= "ss";
    }
    
    if (!isset($filters['status'])) {
        $whereClause[] = "status = 'available'";
    } elseif (!empty($filters['status'])) {
        $whereClause[] = "status = ?";
        $values[] = $filters['status'];
        $types .= "s";
    }
    
    $sql = "SELECT COUNT(*) as total FROM item";
    
    if (!empty($whereClause)) {
        $sql .= " WHERE " . implode(" AND ", $whereClause);
    }
    
    $result = fetchRow($sql, $values, $types);
    return $result['total'];
}

/**
 * Update item
 */
function update_item($id, $data) {
    $fields = [];
    $values = [];
    $types = "";
    
    // Add updated timestamp
    $data['updated_at'] = date('Y-m-d H:i:s');
    
    // Build dynamic update query
    foreach ($data as $key => $value) {
        if ($key !== 'id' && $key !== 'created_at') {
            $fields[] = "$key = ?";
            $values[] = $value;
            
            // Determine type
            if (in_array($key, ['is_free', 'student_id'])) {
                $types .= "i";
            } elseif ($key === 'price') {
                $types .= "d";
            } else {
                $types .= "s";
            }
        }
    }
    
    if (empty($fields)) {
        return false;
    }
    
    $sql = "UPDATE item SET " . implode(", ", $fields) . " WHERE id = ?";
    $values[] = $id;
    $types .= "i";
    
    try {
        return executeUpdate($sql, $values, $types) > 0;
    } catch (Exception $e) {
        error_log("Update item error: " . $e->getMessage());
        return false;
    }
}

/**
 * Mark item as sold
 */
function mark_item_as_sold($id) {
    return update_item($id, ['status' => 'sold']);
}

/**
 * Delete item
 */
function delete_item($id) {
    $sql = "DELETE FROM item WHERE id = ?";
    
    try {
        return executeUpdate($sql, [$id], "i") > 0;
    } catch (Exception $e) {
        error_log("Delete item error: " . $e->getMessage());
        return false;
    }
}

/**
 * Get item images
 */
function get_item_images($itemId) {
    $sql = "SELECT * FROM itemimage WHERE item_id = ? ORDER BY id";
    return fetchAll($sql, [$itemId], "i");
}

/**
 * Add item image
 */
function add_item_image($itemId, $imagePath) {
    $sql = "INSERT INTO itemimage (item_id, path) VALUES (?, ?)";
    
    try {
        return executeInsert($sql, [$itemId, $imagePath], "is") > 0;
    } catch (Exception $e) {
        error_log("Add item image error: " . $e->getMessage());
        return false;
    }
}

/**
 * Delete item image
 */
function delete_item_image($imageId) {
    $sql = "DELETE FROM itemimage WHERE id = ?";
    
    try {
        return executeUpdate($sql, [$imageId], "i") > 0;
    } catch (Exception $e) {
        error_log("Delete item image error: " . $e->getMessage());
        return false;
    }
}

/**
 * Get item favorite count
 */
function get_item_favorite_count($itemId) {
    $result = fetchRow("SELECT COUNT(*) as total FROM favorite WHERE item_id = ?", [$itemId], "i");
    return $result['total'];
}

/**
 * Get popular categories
 */
function get_popular_categories($limit = 10) {
    $sql = "SELECT category, COUNT(*) as count 
            FROM item 
            WHERE status = 'available' 
            GROUP BY category 
            ORDER BY count DESC 
            LIMIT ?";
    
    return fetchAll($sql, [$limit], "i");
}

/**
 * Get items by student
 */
function get_items_by_student($studentId, $limit = 20, $offset = 0) {
    $sql = "SELECT * FROM item WHERE student_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?";
    
    $items = fetchAll($sql, [$studentId, $limit, $offset], "iii");
    
    // Add images to each item
    foreach ($items as &$item) {
        $item['images'] = get_item_images($item['id']);
    }
    
    return $items;
}
