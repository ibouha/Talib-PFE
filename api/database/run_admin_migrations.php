<?php
// Migration runner for admin dashboard features
require_once __DIR__ . '/../config/database.php';

try {
    $database = new Database();
    $conn = $database->getConnection();
    
    echo "Running admin dashboard migrations...\n";
    
    // Migration 1: Add status column to student table
    echo "1. Checking student table status column...\n";
    $checkQuery = "SHOW COLUMNS FROM student LIKE 'status'";
    $stmt = $conn->prepare($checkQuery);
    $stmt->execute();
    
    if ($stmt->rowCount() > 0) {
        echo "   Status column already exists in student table.\n";
    } else {
        echo "   Adding status column to student table...\n";
        $alterQuery = "ALTER TABLE `student` 
                       ADD COLUMN `status` ENUM('verified', 'not_verified') NOT NULL DEFAULT 'not_verified' 
                       COMMENT 'User verification status' 
                       AFTER `university`";
        
        $stmt = $conn->prepare($alterQuery);
        $stmt->execute();
        
        // Update existing users to not_verified status
        $updateQuery = "UPDATE `student` SET `status` = 'not_verified'";
        $stmt = $conn->prepare($updateQuery);
        $stmt->execute();
        
        // Add index for better performance
        $indexQuery = "ALTER TABLE `student` ADD INDEX `idx_student_status` (`status`)";
        $stmt = $conn->prepare($indexQuery);
        $stmt->execute();
        
        echo "   Status column added to student table successfully.\n";
    }
    
    // Migration 2: Add status column to owner table
    echo "2. Checking owner table status column...\n";
    $checkQuery = "SHOW COLUMNS FROM owner LIKE 'status'";
    $stmt = $conn->prepare($checkQuery);
    $stmt->execute();
    
    if ($stmt->rowCount() > 0) {
        echo "   Status column already exists in owner table.\n";
    } else {
        echo "   Adding status column to owner table...\n";
        $alterQuery = "ALTER TABLE `owner` 
                       ADD COLUMN `status` ENUM('verified', 'not_verified') NOT NULL DEFAULT 'not_verified' 
                       COMMENT 'User verification status' 
                       AFTER `phone`";
        
        $stmt = $conn->prepare($alterQuery);
        $stmt->execute();
        
        // Update existing users to not_verified status
        $updateQuery = "UPDATE `owner` SET `status` = 'not_verified'";
        $stmt = $conn->prepare($updateQuery);
        $stmt->execute();
        
        // Add index for better performance
        $indexQuery = "ALTER TABLE `owner` ADD INDEX `idx_owner_status` (`status`)";
        $stmt = $conn->prepare($indexQuery);
        $stmt->execute();
        
        echo "   Status column added to owner table successfully.\n";
    }
    
    // Migration 3: Create reports table
    echo "3. Checking reports table...\n";
    $checkQuery = "SHOW TABLES LIKE 'reports'";
    $stmt = $conn->prepare($checkQuery);
    $stmt->execute();
    
    if ($stmt->rowCount() > 0) {
        echo "   Reports table already exists.\n";
    } else {
        echo "   Creating reports table...\n";
        $createQuery = "CREATE TABLE `reports` (
            `id` int(11) NOT NULL AUTO_INCREMENT,
            `reporter_id` int(11) NOT NULL,
            `reporter_type` enum('student','owner') NOT NULL,
            `content_type` enum('housing','item','roommate_profile','user') NOT NULL,
            `content_id` int(11) NOT NULL,
            `reason` varchar(100) NOT NULL,
            `description` text,
            `status` enum('pending','investigating','resolved','dismissed') NOT NULL DEFAULT 'pending',
            `admin_notes` text,
            `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
            `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            KEY `idx_content` (`content_type`, `content_id`),
            KEY `idx_reporter` (`reporter_type`, `reporter_id`),
            KEY `idx_status` (`status`),
            KEY `idx_created_at` (`created_at`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
        
        $stmt = $conn->prepare($createQuery);
        $stmt->execute();
        
        echo "   Reports table created successfully.\n";
    }
    
    echo "\nAll migrations completed successfully!\n";
    echo "Admin dashboard should now work with real data.\n";
    
} catch (Exception $e) {
    echo "Migration failed: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
}
?>
