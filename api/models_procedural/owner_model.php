<?php
/**
 * Owner Model - Procedural approach
 * Functions to handle owner data operations
 */

require_once __DIR__ . '/../config/Database_procedural.php';

/**
 * Create new owner
 */
function create_owner($data) {
    // Hash password
    $data['password'] = password_hash($data['password'], PASSWORD_DEFAULT);
    $data['created_at'] = date('Y-m-d H:i:s');
    $data['updated_at'] = date('Y-m-d H:i:s');
    
    $sql = "INSERT INTO owner (name, email, password, phone, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, ?)";
    
    try {
        return executeInsert($sql, [
            $data['name'], 
            $data['email'], 
            $data['password'], 
            $data['phone'],
            $data['created_at'],
            $data['updated_at']
        ], "ssssss");
    } catch (Exception $e) {
        error_log("Create owner error: " . $e->getMessage());
        return false;
    }
}

/**
 * Find owner by email
 */
function get_owner_by_email($email) {
    $sql = "SELECT * FROM owner WHERE email = ?";
    return fetchRow($sql, [$email], "s");
}

/**
 * Find owner by phone
 */
function get_owner_by_phone($phone) {
    $sql = "SELECT * FROM owner WHERE phone = ?";
    return fetchRow($sql, [$phone], "s");
}

/**
 * Get owner by ID
 */
function get_owner_by_id($id) {
    $sql = "SELECT id, name, email, phone, status, image, created_at, updated_at FROM owner WHERE id = ?";
    return fetchRow($sql, [$id], "i");
}

/**
 * Verify owner password
 */
function verify_owner_password($email, $password) {
    $owner = get_owner_by_email($email);
    
    if ($owner && password_verify($password, $owner['password'])) {
        // Remove password from returned data
        unset($owner['password']);
        return $owner;
    }
    
    return false;
}

/**
 * Update owner
 */
function update_owner($id, $data) {
    $fields = [];
    $values = [];
    $types = "";
    
    // Add updated timestamp
    $data['updated_at'] = date('Y-m-d H:i:s');
    
    // Build dynamic update query
    foreach ($data as $key => $value) {
        if ($key !== 'id' && $key !== 'password' && $key !== 'created_at') {
            $fields[] = "$key = ?";
            $values[] = $value;
            $types .= "s";
        }
    }
    
    if (empty($fields)) {
        return false;
    }
    
    $sql = "UPDATE owner SET " . implode(", ", $fields) . " WHERE id = ?";
    $values[] = $id;
    $types .= "i";
    
    try {
        return executeUpdate($sql, $values, $types) > 0;
    } catch (Exception $e) {
        error_log("Update owner error: " . $e->getMessage());
        return false;
    }
}

/**
 * Change owner password
 */
function change_owner_password($id, $newPassword) {
    $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
    $sql = "UPDATE owner SET password = ?, updated_at = ? WHERE id = ?";
    
    try {
        return executeUpdate($sql, [$hashedPassword, date('Y-m-d H:i:s'), $id], "ssi") > 0;
    } catch (Exception $e) {
        error_log("Change owner password error: " . $e->getMessage());
        return false;
    }
}

/**
 * Get owner profile with statistics
 */
function get_owner_profile_with_stats($id) {
    $owner = get_owner_by_id($id);
    
    if (!$owner) {
        return null;
    }
    
    // Get statistics
    $stats = get_owner_stats($id);
    $owner['stats'] = $stats;
    
    return $owner;
}

/**
 * Get owner statistics
 */
function get_owner_stats($ownerId) {
    $stats = [];
    
    try {
        // Count housing listings
        $result = fetchRow("SELECT COUNT(*) as total FROM housing WHERE owner_id = ?", [$ownerId], "i");
        $stats['housing_listings'] = $result['total'];
        
        // Count available housing
        $result = fetchRow("SELECT COUNT(*) as total FROM housing WHERE owner_id = ? AND status = 'available'", [$ownerId], "i");
        $stats['available_housing'] = $result['total'];
        
        // Count rented housing
        $result = fetchRow("SELECT COUNT(*) as total FROM housing WHERE owner_id = ? AND status = 'rented'", [$ownerId], "i");
        $stats['rented_housing'] = $result['total'];
        
        // Count housing contacts/inquiries
        $result = fetchRow(
            "SELECT COUNT(*) as total FROM housingcontact hc 
             JOIN housing h ON hc.housing_id = h.id 
             WHERE h.owner_id = ?", 
            [$ownerId], "i"
        );
        $stats['total_inquiries'] = $result['total'];
        
        // Get recent inquiries (last 30 days)
        $result = fetchRow(
            "SELECT COUNT(*) as total FROM housingcontact hc 
             JOIN housing h ON hc.housing_id = h.id 
             WHERE h.owner_id = ? AND hc.contact_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)", 
            [$ownerId], "i"
        );
        $stats['recent_inquiries'] = $result['total'];
        
        return $stats;
        
    } catch (Exception $e) {
        error_log("Get owner stats error: " . $e->getMessage());
        return [];
    }
}

/**
 * Get housing listings for owner
 */
function get_owner_housing_listings($ownerId, $limit = 20, $offset = 0) {
    $sql = "SELECT h.*, 
                   (SELECT COUNT(*) FROM housingcontact hc WHERE hc.housing_id = h.id) as inquiry_count,
                   (SELECT GROUP_CONCAT(hi.path) FROM housingimage hi WHERE hi.housing_id = h.id) as images
            FROM housing h 
            WHERE h.owner_id = ? 
            ORDER BY h.created_at DESC 
            LIMIT ? OFFSET ?";
    
    return fetchAll($sql, [$ownerId, $limit, $offset], "iii");
}

/**
 * Get all owners
 */
function get_all_owners($limit = 20, $offset = 0) {
    $sql = "SELECT id, name, email, phone, status, image, created_at, updated_at 
            FROM owner 
            ORDER BY created_at DESC 
            LIMIT ? OFFSET ?";
    
    return fetchAll($sql, [$limit, $offset], "ii");
}

/**
 * Count total owners
 */
function count_owners($conditions = []) {
    if (empty($conditions)) {
        $result = fetchRow("SELECT COUNT(*) as total FROM owner");
        return $result['total'];
    }
    
    // Handle conditions if provided
    $whereClause = [];
    $values = [];
    $types = "";
    
    foreach ($conditions as $key => $value) {
        $whereClause[] = "$key = ?";
        $values[] = $value;
        $types .= "s";
    }
    
    $sql = "SELECT COUNT(*) as total FROM owner WHERE " . implode(" AND ", $whereClause);
    $result = fetchRow($sql, $values, $types);
    
    return $result['total'];
}

/**
 * Get all owners with stats for admin dashboard
 */
function get_all_owners_with_stats() {
    $sql = "SELECT * FROM owner ORDER BY created_at DESC";
    $owners = fetchAll($sql);
    
    // Remove passwords for security
    foreach ($owners as &$owner) {
        unset($owner['password']);
    }
    
    return $owners;
}

/**
 * Update owner status
 */
function update_owner_status($id, $status) {
    $data = [
        'status' => $status,
        'updated_at' => date('Y-m-d H:i:s')
    ];
    
    return update_owner($id, $data);
}

/**
 * Get verified owners count
 */
function get_verified_owners_count() {
    $result = fetchRow("SELECT COUNT(*) as total FROM owner WHERE status = 'verified'");
    return $result['total'];
}

/**
 * Get total owners count
 */
function get_total_owners_count() {
    $result = fetchRow("SELECT COUNT(*) as total FROM owner");
    return $result['total'];
}

/**
 * Delete owner
 */
function delete_owner($id) {
    $sql = "DELETE FROM owner WHERE id = ?";
    
    try {
        return executeUpdate($sql, [$id], "i") > 0;
    } catch (Exception $e) {
        error_log("Delete owner error: " . $e->getMessage());
        return false;
    }
}
