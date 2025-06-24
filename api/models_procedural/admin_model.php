<?php
/**
 * Admin Model - Procedural approach
 * Functions to handle admin data operations
 */

require_once __DIR__ . '/../config/Database_procedural.php';

/**
 * Find admin by username
 */
function find_admin_by_username($username) {
    $sql = "SELECT * FROM admin WHERE username = ? LIMIT 1";
    return fetchRow($sql, [$username], "s");
}

/**
 * Verify admin password
 */
function verify_admin_password($username, $password) {
    $admin = find_admin_by_username($username);
    
    if ($admin && password_verify($password, $admin['password'])) {
        // Remove password from returned data
        unset($admin['password']);
        return $admin;
    }
    
    return false;
}

/**
 * Create new admin
 */
function create_admin($username, $password) {
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    $sql = "INSERT INTO admin (username, password) VALUES (?, ?)";
    
    try {
        return executeUpdate($sql, [$username, $hashedPassword], "ss") > 0;
    } catch (Exception $e) {
        error_log("Create admin error: " . $e->getMessage());
        return false;
    }
}

/**
 * Change admin password
 */
function change_admin_password($username, $newPassword) {
    $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
    $sql = "UPDATE admin SET password = ? WHERE username = ?";
    
    try {
        return executeUpdate($sql, [$hashedPassword, $username], "ss") > 0;
    } catch (Exception $e) {
        error_log("Change admin password error: " . $e->getMessage());
        return false;
    }
}

/**
 * Get platform statistics
 */
function get_platform_stats() {
    $stats = [];
    
    try {
        // Count total students
        $result = fetchRow("SELECT COUNT(*) as total FROM student");
        $stats['total_students'] = $result['total'];
        
        // Count total owners
        $result = fetchRow("SELECT COUNT(*) as total FROM owner");
        $stats['total_owners'] = $result['total'];
        
        // Count total housing listings
        $result = fetchRow("SELECT COUNT(*) as total FROM housing");
        $stats['total_housing'] = $result['total'];
        
        // Count available housing
        $result = fetchRow("SELECT COUNT(*) as total FROM housing WHERE status = 'available'");
        $stats['available_housing'] = $result['total'];
        
        // Count total items
        $result = fetchRow("SELECT COUNT(*) as total FROM item");
        $stats['total_items'] = $result['total'];
        
        // Count available items
        $result = fetchRow("SELECT COUNT(*) as total FROM item WHERE status = 'available'");
        $stats['available_items'] = $result['total'];
        
        // Count roommate profiles
        $result = fetchRow("SELECT COUNT(*) as total FROM roommateprofile");
        $stats['roommate_profiles'] = $result['total'];
        
        // Count total favorites
        $result = fetchRow("SELECT COUNT(*) as total FROM favorite");
        $stats['total_favorites'] = $result['total'];
        
        // Get recent registrations (last 30 days)
        $result = fetchRow("SELECT COUNT(*) as total FROM student WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)");
        $stats['recent_student_registrations'] = $result['total'];
        
        // Get top universities by student count
        $stats['top_universities'] = fetchAll(
            "SELECT university, COUNT(*) as student_count 
             FROM student 
             GROUP BY university 
             ORDER BY student_count DESC 
             LIMIT 5"
        );
        
        // Get housing by city
        $stats['housing_by_city'] = fetchAll(
            "SELECT city, COUNT(*) as housing_count 
             FROM housing 
             GROUP BY city 
             ORDER BY housing_count DESC 
             LIMIT 5"
        );
        
        return $stats;
        
    } catch (Exception $e) {
        error_log("Get platform stats error: " . $e->getMessage());
        return [];
    }
}

/**
 * Get recent activity
 */
function get_recent_activity($limit = 20) {
    $activities = [];
    
    try {
        // Recent student registrations
        $studentActivities = fetchAll(
            "SELECT 'student_registration' as type, name as title, created_at as date 
             FROM student 
             ORDER BY created_at DESC 
             LIMIT ?",
            [$limit],
            "i"
        );
        $activities = array_merge($activities, $studentActivities);
        
        // Recent housing listings
        $housingActivities = fetchAll(
            "SELECT 'housing_listing' as type, title, created_at as date 
             FROM housing 
             ORDER BY created_at DESC 
             LIMIT ?",
            [$limit],
            "i"
        );
        $activities = array_merge($activities, $housingActivities);
        
        // Recent item listings
        $itemActivities = fetchAll(
            "SELECT 'item_listing' as type, title, created_at as date 
             FROM item 
             ORDER BY created_at DESC 
             LIMIT ?",
            [$limit],
            "i"
        );
        $activities = array_merge($activities, $itemActivities);
        
        // Sort by date
        usort($activities, function($a, $b) {
            return strtotime($b['date']) - strtotime($a['date']);
        });
        
        return array_slice($activities, 0, $limit);
        
    } catch (Exception $e) {
        error_log("Get recent activity error: " . $e->getMessage());
        return [];
    }
}
