<?php
/**
 * Student Model - Procedural approach
 * Functions to handle student data operations
 */

require_once __DIR__ . '/../config/Database_procedural.php';

/**
 * Get all students
 */
function get_all_students($limit = 20, $offset = 0) {
    $sql = "SELECT id, name, email, phone, university, status, image, bio, gender, date_of_birth, created_at 
            FROM student 
            ORDER BY created_at DESC 
            LIMIT ? OFFSET ?";
    
    return fetchAll($sql, [$limit, $offset], "ii");
}

/**
 * Get student by ID
 */
function get_student_by_id($id) {
    $sql = "SELECT id, name, email, phone, university, status, image, bio, gender, date_of_birth, created_at 
            FROM student 
            WHERE id = ?";
    
    return fetchRow($sql, [$id], "i");
}

/**
 * Get student by email (including password for authentication)
 */
function get_student_by_email($email) {
    $sql = "SELECT * FROM student WHERE email = ?";
    return fetchRow($sql, [$email], "s");
}

/**
 * Create new student
 */
function create_student($data) {
    // Hash password
    $data['password'] = password_hash($data['password'], PASSWORD_DEFAULT);
    $data['created_at'] = date('Y-m-d H:i:s');
    $data['updated_at'] = date('Y-m-d H:i:s');
    
    $sql = "INSERT INTO student (name, email, password, phone, university, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?)";
    
    try {
        return executeInsert($sql, [
            $data['name'], 
            $data['email'], 
            $data['password'], 
            $data['phone'], 
            $data['university'],
            $data['created_at'],
            $data['updated_at']
        ], "sssssss");
    } catch (Exception $e) {
        error_log("Create student error: " . $e->getMessage());
        return false;
    }
}

/**
 * Update student
 */
function update_student($id, $data) {
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
    
    $sql = "UPDATE student SET " . implode(", ", $fields) . " WHERE id = ?";
    $values[] = $id;
    $types .= "i";
    
    try {
        return executeUpdate($sql, $values, $types) > 0;
    } catch (Exception $e) {
        error_log("Update student error: " . $e->getMessage());
        return false;
    }
}

/**
 * Verify student password
 */
function verify_student_password($email, $password) {
    $student = get_student_by_email($email);
    
    if ($student && password_verify($password, $student['password'])) {
        // Remove password from returned data
        unset($student['password']);
        return $student;
    }
    
    return false;
}

/**
 * Delete student
 */
function delete_student($id) {
    $sql = "DELETE FROM student WHERE id = ?";
    
    try {
        return executeUpdate($sql, [$id], "i") > 0;
    } catch (Exception $e) {
        error_log("Delete student error: " . $e->getMessage());
        return false;
    }
}

/**
 * Count total students
 */
function count_students($conditions = []) {
    if (empty($conditions)) {
        $result = fetchRow("SELECT COUNT(*) as total FROM student");
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
    
    $sql = "SELECT COUNT(*) as total FROM student WHERE " . implode(" AND ", $whereClause);
    $result = fetchRow($sql, $values, $types);
    
    return $result['total'];
}

/**
 * Search students by university
 */
function search_students_by_university($university, $limit = 20, $offset = 0) {
    $sql = "SELECT id, name, email, phone, university, status, image, bio, gender, created_at 
            FROM student 
            WHERE university LIKE ? 
            ORDER BY created_at DESC 
            LIMIT ? OFFSET ?";
    
    $search_term = "%$university%";
    return fetchAll($sql, [$search_term, $limit, $offset], "sii");
}

/**
 * Search students by name or university
 */
function search_students($query, $limit = 20, $offset = 0) {
    $sql = "SELECT id, name, email, university, image, created_at
            FROM student
            WHERE name LIKE ? OR university LIKE ?
            ORDER BY name ASC
            LIMIT ? OFFSET ?";
    
    $search_term = "%$query%";
    return fetchAll($sql, [$search_term, $search_term, $limit, $offset], "ssii");
}

/**
 * Get students by university
 */
function get_students_by_university($university, $limit = 20, $offset = 0) {
    $sql = "SELECT id, name, email, phone, university, status, image, bio, gender, created_at 
            FROM student 
            WHERE university = ? 
            ORDER BY created_at DESC 
            LIMIT ? OFFSET ?";
    
    return fetchAll($sql, [$university, $limit, $offset], "sii");
}

/**
 * Get all students with stats for admin dashboard
 */
function get_all_students_with_stats() {
    $sql = "SELECT * FROM student ORDER BY created_at DESC";
    $students = fetchAll($sql);
    
    // Remove passwords for security
    foreach ($students as &$student) {
        unset($student['password']);
    }
    
    return $students;
}

/**
 * Update student status
 */
function update_student_status($id, $status) {
    $data = [
        'status' => $status,
        'updated_at' => date('Y-m-d H:i:s')
    ];
    
    return update_student($id, $data);
}

/**
 * Get verified students count
 */
function get_verified_students_count() {
    $result = fetchRow("SELECT COUNT(*) as total FROM student WHERE status = 'verified'");
    return $result['total'];
}

/**
 * Get total students count
 */
function get_total_students_count() {
    $result = fetchRow("SELECT COUNT(*) as total FROM student");
    return $result['total'];
}

/**
 * Change student password
 */
function change_student_password($id, $newPassword) {
    $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
    $sql = "UPDATE student SET password = ?, updated_at = ? WHERE id = ?";
    
    try {
        return executeUpdate($sql, [$hashedPassword, date('Y-m-d H:i:s'), $id], "ssi") > 0;
    } catch (Exception $e) {
        error_log("Change student password error: " . $e->getMessage());
        return false;
    }
}
