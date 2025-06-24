<?php
// Migration runner for reports table
require_once __DIR__ . '/../config/database.php';

try {
    $database = new Database();
    $conn = $database->getConnection();
    
    echo "Running migration to create reports table...\n";
    
    // Read and execute the SQL file
    $sql = file_get_contents(__DIR__ . '/create_reports_table.sql');
    
    // Split by semicolon and execute each statement
    $statements = array_filter(array_map('trim', explode(';', $sql)));
    
    foreach ($statements as $statement) {
        if (!empty($statement)) {
            $stmt = $conn->prepare($statement);
            $stmt->execute();
            echo "Executed: " . substr($statement, 0, 50) . "...\n";
        }
    }
    
    echo "Reports table migration completed successfully!\n";
    
} catch (Exception $e) {
    echo "Migration failed: " . $e->getMessage() . "\n";
}
?>
