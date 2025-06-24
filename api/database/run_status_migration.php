<?php
// Migration runner for user status columns
require_once __DIR__ . '/../config/database.php';

try {
    $database = new Database();
    $conn = $database->getConnection();
    
    echo "Running migration to add status columns...\n";
    
    // Check if status column already exists in student table
    $checkStudentQuery = "SHOW COLUMNS FROM student LIKE 'status'";
    $stmt = $conn->prepare($checkStudentQuery);
    $stmt->execute();
    
    if ($stmt->rowCount() > 0) {
        echo "Status column already exists in student table. Skipping student table migration.\n";
    } else {
        // Add status column to student table
        $alterStudentQuery = "ALTER TABLE `student` 
                             ADD COLUMN `status` ENUM('verified', 'not_verified') NOT NULL DEFAULT 'not_verified' COMMENT 'User verification status' 
                             AFTER `university`";
        
        $stmt = $conn->prepare($alterStudentQuery);
        $stmt->execute();
        
        echo "Status column added to student table successfully.\n";
        
        // Add index for student status
        $indexStudentQuery = "ALTER TABLE `student` ADD INDEX `idx_student_status` (`status`)";
        $stmt = $conn->prepare($indexStudentQuery);
        $stmt->execute();
        
        echo "Index added for student status column.\n";
    }
    
    // Check if status column already exists in owner table
    $checkOwnerQuery = "SHOW COLUMNS FROM owner LIKE 'status'";
    $stmt = $conn->prepare($checkOwnerQuery);
    $stmt->execute();
    
    if ($stmt->rowCount() > 0) {
        echo "Status column already exists in owner table. Skipping owner table migration.\n";
    } else {
        // Add status column to owner table
        $alterOwnerQuery = "ALTER TABLE `owner` 
                           ADD COLUMN `status` ENUM('verified', 'not_verified') NOT NULL DEFAULT 'not_verified' COMMENT 'User verification status' 
                           AFTER `phone`";
        
        $stmt = $conn->prepare($alterOwnerQuery);
        $stmt->execute();
        
        echo "Status column added to owner table successfully.\n";
        
        // Add index for owner status
        $indexOwnerQuery = "ALTER TABLE `owner` ADD INDEX `idx_owner_status` (`status`)";
        $stmt = $conn->prepare($indexOwnerQuery);
        $stmt->execute();
        
        echo "Index added for owner status column.\n";
    }
    
    echo "Migration completed successfully!\n";
    
} catch (Exception $e) {
    echo "Migration failed: " . $e->getMessage() . "\n";
}
?>
