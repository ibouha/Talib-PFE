<?php
/**
 * Roommate Model - Procedural approach
 * Functions to handle roommate profile data operations
 */

require_once __DIR__ . '/../config/Database_procedural.php';

/**
 * Create new roommate profile
 */
function create_roommate_profile($data) {
    $data['created_at'] = date('Y-m-d H:i:s');
    $data['updated_at'] = date('Y-m-d H:i:s');
    
    // Encode JSON fields if they are arrays
    if (isset($data['interests']) && is_array($data['interests'])) {
        $data['interests'] = json_encode($data['interests']);
    }
    if (isset($data['lifestyle']) && is_array($data['lifestyle'])) {
        $data['lifestyle'] = json_encode($data['lifestyle']);
    }
    if (isset($data['preferences']) && is_array($data['preferences'])) {
        $data['preferences'] = json_encode($data['preferences']);
    }
    
    $sql = "INSERT INTO roommateprofile (student_id, name, age, gender, university, program, year, bio, interests, lifestyle, preferences, budget, lookingFor, location, move_in_date, phone, avatar, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
    try {
        return executeInsert($sql, [
            $data['student_id'],
            $data['name'],
            $data['age'],
            $data['gender'],
            $data['university'],
            $data['program'],
            $data['year'],
            $data['bio'],
            $data['interests'],
            $data['lifestyle'],
            $data['preferences'],
            $data['budget'],
            $data['lookingFor'],
            $data['location'],
            $data['move_in_date'] ?? null,
            $data['phone'] ?? null,
            $data['avatar'] ?? null,
            $data['created_at'],
            $data['updated_at']
        ], "isissiissssdsssssss");
    } catch (Exception $e) {
        error_log("Create roommate profile error: " . $e->getMessage());
        return false;
    }
}

/**
 * Get roommate profile by ID
 */
function get_roommate_profile_by_id($id) {
    $sql = "SELECT * FROM roommateprofile WHERE id = ?";
    $profile = fetchRow($sql, [$id], "i");
    
    if ($profile) {
        $profile = decode_roommate_json_fields($profile);
    }
    
    return $profile;
}

/**
 * Get roommate profile with student details
 */
function get_roommate_profile_with_details($id) {
    $sql = "SELECT rp.*, s.email as student_email, s.phone as student_phone, s.image as student_image
            FROM roommateprofile rp
            LEFT JOIN student s ON rp.student_id = s.id
            WHERE rp.id = ?";
    
    $profile = fetchRow($sql, [$id], "i");
    
    if ($profile) {
        $profile = decode_roommate_json_fields($profile);
    }
    
    return $profile;
}

/**
 * Get all roommate profiles
 */
function get_all_roommate_profiles($filters = [], $limit = 20, $offset = 0) {
    $whereClause = [];
    $values = [];
    $types = "";
    
    // Build WHERE clause based on filters
    if (!empty($filters['location'])) {
        $whereClause[] = "location LIKE ?";
        $values[] = "%" . $filters['location'] . "%";
        $types .= "s";
    }
    
    if (!empty($filters['university'])) {
        $whereClause[] = "university LIKE ?";
        $values[] = "%" . $filters['university'] . "%";
        $types .= "s";
    }
    
    if (!empty($filters['gender'])) {
        $whereClause[] = "gender = ?";
        $values[] = $filters['gender'];
        $types .= "s";
    }
    
    if (!empty($filters['min_budget'])) {
        $whereClause[] = "budget >= ?";
        $values[] = $filters['min_budget'];
        $types .= "d";
    }
    
    if (!empty($filters['max_budget'])) {
        $whereClause[] = "budget <= ?";
        $values[] = $filters['max_budget'];
        $types .= "d";
    }
    
    if (!empty($filters['lookingFor'])) {
        $whereClause[] = "lookingFor = ?";
        $values[] = $filters['lookingFor'];
        $types .= "s";
    }
    
    $sql = "SELECT rp.*, s.image as student_image 
            FROM roommateprofile rp 
            LEFT JOIN student s ON rp.student_id = s.id";
    
    if (!empty($whereClause)) {
        $sql .= " WHERE " . implode(" AND ", $whereClause);
    }
    
    $sql .= " ORDER BY rp.created_at DESC LIMIT ? OFFSET ?";
    $values[] = $limit;
    $values[] = $offset;
    $types .= "ii";
    
    $profiles = fetchAll($sql, $values, $types);
    
    // Decode JSON fields for each profile
    foreach ($profiles as &$profile) {
        $profile = decode_roommate_json_fields($profile);
    }
    
    return $profiles;
}

/**
 * Update roommate profile
 */
function update_roommate_profile($id, $data) {
    $fields = [];
    $values = [];
    $types = "";
    
    // Remove fields that shouldn't be updated
    unset($data['student_id'], $data['created_at']);
    
    // Add updated timestamp
    $data['updated_at'] = date('Y-m-d H:i:s');
    
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
    
    // Build dynamic update query
    foreach ($data as $key => $value) {
        if ($key !== 'id') {
            $fields[] = "$key = ?";
            $values[] = $value;
            
            // Determine type
            if (in_array($key, ['age', 'year', 'student_id'])) {
                $types .= "i";
            } elseif ($key === 'budget') {
                $types .= "d";
            } else {
                $types .= "s";
            }
        }
    }
    
    if (empty($fields)) {
        return false;
    }
    
    $sql = "UPDATE roommateprofile SET " . implode(", ", $fields) . " WHERE id = ?";
    $values[] = $id;
    $types .= "i";
    
    try {
        return executeUpdate($sql, $values, $types) > 0;
    } catch (Exception $e) {
        error_log("Update roommate profile error: " . $e->getMessage());
        return false;
    }
}

/**
 * Delete roommate profile
 */
function delete_roommate_profile($id) {
    $sql = "DELETE FROM roommateprofile WHERE id = ?";
    
    try {
        return executeUpdate($sql, [$id], "i") > 0;
    } catch (Exception $e) {
        error_log("Delete roommate profile error: " . $e->getMessage());
        return false;
    }
}

/**
 * Get roommate profiles by student ID
 */
function get_roommate_profiles_by_student($studentId, $limit = 20, $offset = 0) {
    $sql = "SELECT * FROM roommateprofile WHERE student_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?";
    
    $profiles = fetchAll($sql, [$studentId, $limit, $offset], "iii");
    
    // Decode JSON fields for each profile
    foreach ($profiles as &$profile) {
        $profile = decode_roommate_json_fields($profile);
    }
    
    return $profiles;
}

/**
 * Count roommate profiles
 */
function count_roommate_profiles($filters = []) {
    $whereClause = [];
    $values = [];
    $types = "";
    
    // Build WHERE clause (same logic as get_all_roommate_profiles)
    if (!empty($filters['location'])) {
        $whereClause[] = "location LIKE ?";
        $values[] = "%" . $filters['location'] . "%";
        $types .= "s";
    }
    
    if (!empty($filters['university'])) {
        $whereClause[] = "university LIKE ?";
        $values[] = "%" . $filters['university'] . "%";
        $types .= "s";
    }
    
    if (!empty($filters['gender'])) {
        $whereClause[] = "gender = ?";
        $values[] = $filters['gender'];
        $types .= "s";
    }
    
    if (!empty($filters['min_budget'])) {
        $whereClause[] = "budget >= ?";
        $values[] = $filters['min_budget'];
        $types .= "d";
    }
    
    if (!empty($filters['max_budget'])) {
        $whereClause[] = "budget <= ?";
        $values[] = $filters['max_budget'];
        $types .= "d";
    }
    
    if (!empty($filters['lookingFor'])) {
        $whereClause[] = "lookingFor = ?";
        $values[] = $filters['lookingFor'];
        $types .= "s";
    }
    
    $sql = "SELECT COUNT(*) as total FROM roommateprofile";
    
    if (!empty($whereClause)) {
        $sql .= " WHERE " . implode(" AND ", $whereClause);
    }
    
    $result = fetchRow($sql, $values, $types);
    return $result['total'];
}

/**
 * Decode JSON fields in roommate profile
 */
function decode_roommate_json_fields($profile) {
    if (!$profile) return $profile;
    
    // Decode JSON fields
    if (!empty($profile['interests'])) {
        $profile['interests'] = json_decode($profile['interests'], true) ?: [];
    } else {
        $profile['interests'] = [];
    }
    
    if (!empty($profile['lifestyle'])) {
        $profile['lifestyle'] = json_decode($profile['lifestyle'], true) ?: [];
    } else {
        $profile['lifestyle'] = [];
    }
    
    if (!empty($profile['preferences'])) {
        $profile['preferences'] = json_decode($profile['preferences'], true) ?: [];
    } else {
        $profile['preferences'] = [];
    }
    
    return $profile;
}

/**
 * Get compatible roommate profiles (basic compatibility)
 */
function get_compatible_roommate_profiles($profileId, $limit = 10) {
    $profile = get_roommate_profile_by_id($profileId);
    
    if (!$profile) {
        return [];
    }
    
    // Simple compatibility: same location, similar budget range, compatible gender preferences
    $sql = "SELECT rp.*, s.image as student_image 
            FROM roommateprofile rp 
            LEFT JOIN student s ON rp.student_id = s.id
            WHERE rp.id != ? 
            AND rp.location = ? 
            AND ABS(rp.budget - ?) <= 500
            ORDER BY ABS(rp.budget - ?) ASC
            LIMIT ?";
    
    $profiles = fetchAll($sql, [$profileId, $profile['location'], $profile['budget'], $profile['budget'], $limit], "isddi");
    
    // Decode JSON fields for each profile
    foreach ($profiles as &$compatibleProfile) {
        $compatibleProfile = decode_roommate_json_fields($compatibleProfile);
    }
    
    return $profiles;
}
