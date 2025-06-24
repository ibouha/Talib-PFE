<?php
// Simple migration runner
require_once __DIR__ . '/../config/database.php';

try {
    $database = new Database();
    $conn = $database->getConnection();
    
    echo "Running migration to add move_in_date field...\n";
    
    // Check if column already exists
    $checkQuery = "SHOW COLUMNS FROM roommateprofile LIKE 'move_in_date'";
    $stmt = $conn->prepare($checkQuery);
    $stmt->execute();
    
    if ($stmt->rowCount() > 0) {
        echo "Column 'move_in_date' already exists. Skipping migration.\n";
    } else {
        // Add the column
        $alterQuery = "ALTER TABLE `roommateprofile` 
                       ADD COLUMN `move_in_date` DATE NULL COMMENT 'Preferred move-in date' 
                       AFTER `location`";
        
        $stmt = $conn->prepare($alterQuery);
        $stmt->execute();
        
        echo "Column 'move_in_date' added successfully.\n";
        
        // Update existing records with a default move-in date (30 days from now)
        $updateQuery = "UPDATE `roommateprofile` 
                        SET `move_in_date` = DATE_ADD(CURDATE(), INTERVAL 30 DAY) 
                        WHERE `move_in_date` IS NULL";
        
        $stmt = $conn->prepare($updateQuery);
        $stmt->execute();
        
        echo "Updated existing records with default move-in dates.\n";
    }
    
    echo "Migration completed successfully!\n";
    
} catch (Exception $e) {
    echo "Migration failed: " . $e->getMessage() . "\n";
}
?>
