<?php
/**
 * Housing Model - Procedural approach
 * Functions to handle housing data operations
 */

require_once __DIR__ . '/../config/Database_procedural.php';

/**
 * Create new housing listing
 */
function create_housing($data) {
    $data['created_at'] = date('Y-m-d H:i:s');
    $data['updated_at'] = date('Y-m-d H:i:s');
    
    $sql = "INSERT INTO housing (title, description, address, city, type, bedrooms, bathrooms, area, price, 
                                available_from, available_to, is_furnished, amenities, status, owner_id, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
    try {
        return executeInsert($sql, [
            $data['title'],
            $data['description'],
            $data['address'],
            $data['city'],
            $data['type'],
            $data['bedrooms'],
            $data['bathrooms'],
            $data['area'],
            $data['price'],
            $data['available_from'],
            $data['available_to'],
            $data['is_furnished'],
            $data['amenities'],
            $data['status'] ?? 'available',
            $data['owner_id'],
            $data['created_at'],
            $data['updated_at']
        ], "sssssiiiddsssisss");
    } catch (Exception $e) {
        error_log("Create housing error: " . $e->getMessage());
        return false;
    }
}

/**
 * Get housing by ID
 */
function get_housing_by_id($id) {
    $sql = "SELECT * FROM housing WHERE id = ?";
    return fetchRow($sql, [$id], "i");
}

/**
 * Get housing with details (including owner info)
 */
function get_housing_with_details($id) {
    $sql = "SELECT h.*, o.name as owner_name, o.email as owner_email, o.phone as owner_phone
            FROM housing h
            LEFT JOIN owner o ON h.owner_id = o.id
            WHERE h.id = ?";
    
    $housing = fetchRow($sql, [$id], "i");
    
    if ($housing) {
        // Get images
        $housing['images'] = get_housing_images($id);
        
        // Get contact count
        $housing['contact_count'] = get_housing_contact_count($id);
    }
    
    return $housing;
}

/**
 * Get all housing listings
 */
function get_all_housing($filters = [], $limit = 20, $offset = 0) {
    $whereClause = [];
    $values = [];
    $types = "";
    
    // Build WHERE clause based on filters
    if (!empty($filters['city'])) {
        $whereClause[] = "city = ?";
        $values[] = $filters['city'];
        $types .= "s";
    }
    
    if (!empty($filters['type'])) {
        $whereClause[] = "type = ?";
        $values[] = $filters['type'];
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
    
    if (!empty($filters['bedrooms'])) {
        $whereClause[] = "bedrooms >= ?";
        $values[] = $filters['bedrooms'];
        $types .= "i";
    }
    
    if (!empty($filters['is_furnished'])) {
        $whereClause[] = "is_furnished = ?";
        $values[] = $filters['is_furnished'];
        $types .= "i";
    }
    
    // Default to available housing only
    if (!isset($filters['status'])) {
        $whereClause[] = "status = 'available'";
    } elseif (!empty($filters['status'])) {
        $whereClause[] = "status = ?";
        $values[] = $filters['status'];
        $types .= "s";
    }
    
    $sql = "SELECT h.*, o.name as owner_name 
            FROM housing h 
            LEFT JOIN owner o ON h.owner_id = o.id";
    
    if (!empty($whereClause)) {
        $sql .= " WHERE " . implode(" AND ", $whereClause);
    }
    
    $sql .= " ORDER BY h.created_at DESC LIMIT ? OFFSET ?";
    $values[] = $limit;
    $values[] = $offset;
    $types .= "ii";
    
    $housing = fetchAll($sql, $values, $types);
    
    // Add images to each housing
    foreach ($housing as &$house) {
        $house['images'] = get_housing_images($house['id']);
    }
    
    return $housing;
}

/**
 * Update housing
 */
function update_housing($id, $data) {
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
            if (in_array($key, ['bedrooms', 'bathrooms', 'is_furnished', 'owner_id'])) {
                $types .= "i";
            } elseif (in_array($key, ['area', 'price'])) {
                $types .= "d";
            } else {
                $types .= "s";
            }
        }
    }
    
    if (empty($fields)) {
        return false;
    }
    
    $sql = "UPDATE housing SET " . implode(", ", $fields) . " WHERE id = ?";
    $values[] = $id;
    $types .= "i";
    
    try {
        return executeUpdate($sql, $values, $types) > 0;
    } catch (Exception $e) {
        error_log("Update housing error: " . $e->getMessage());
        return false;
    }
}

/**
 * Delete housing
 */
function delete_housing($id) {
    $sql = "DELETE FROM housing WHERE id = ?";
    
    try {
        return executeUpdate($sql, [$id], "i") > 0;
    } catch (Exception $e) {
        error_log("Delete housing error: " . $e->getMessage());
        return false;
    }
}

/**
 * Count housing listings
 */
function count_housing($filters = []) {
    $whereClause = [];
    $values = [];
    $types = "";
    
    // Build WHERE clause based on filters (same logic as get_all_housing)
    if (!empty($filters['city'])) {
        $whereClause[] = "city = ?";
        $values[] = $filters['city'];
        $types .= "s";
    }
    
    if (!empty($filters['type'])) {
        $whereClause[] = "type = ?";
        $values[] = $filters['type'];
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
    
    if (!isset($filters['status'])) {
        $whereClause[] = "status = 'available'";
    } elseif (!empty($filters['status'])) {
        $whereClause[] = "status = ?";
        $values[] = $filters['status'];
        $types .= "s";
    }
    
    $sql = "SELECT COUNT(*) as total FROM housing";
    
    if (!empty($whereClause)) {
        $sql .= " WHERE " . implode(" AND ", $whereClause);
    }
    
    $result = fetchRow($sql, $values, $types);
    return $result['total'];
}

/**
 * Get housing images
 */
function get_housing_images($housingId) {
    $sql = "SELECT * FROM housingimage WHERE housing_id = ? ORDER BY id";
    return fetchAll($sql, [$housingId], "i");
}

/**
 * Add housing image
 */
function add_housing_image($housingId, $imagePath) {
    $sql = "INSERT INTO housingimage (housing_id, path) VALUES (?, ?)";
    
    try {
        return executeInsert($sql, [$housingId, $imagePath], "is") > 0;
    } catch (Exception $e) {
        error_log("Add housing image error: " . $e->getMessage());
        return false;
    }
}

/**
 * Delete housing image
 */
function delete_housing_image($imageId) {
    $sql = "DELETE FROM housingimage WHERE id = ?";
    
    try {
        return executeUpdate($sql, [$imageId], "i") > 0;
    } catch (Exception $e) {
        error_log("Delete housing image error: " . $e->getMessage());
        return false;
    }
}

/**
 * Get housing contact count
 */
function get_housing_contact_count($housingId) {
    $result = fetchRow("SELECT COUNT(*) as total FROM housingcontact WHERE housing_id = ?", [$housingId], "i");
    return $result['total'];
}

/**
 * Add housing contact
 */
function add_housing_contact($housingId, $studentId, $message = null) {
    $sql = "INSERT INTO housingcontact (housing_id, student_id, message, contact_date) VALUES (?, ?, ?, ?)";
    
    try {
        return executeInsert($sql, [$housingId, $studentId, $message, date('Y-m-d H:i:s')], "iiss") > 0;
    } catch (Exception $e) {
        error_log("Add housing contact error: " . $e->getMessage());
        return false;
    }
}
