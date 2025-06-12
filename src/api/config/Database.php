<?php

// Simple database configuration
$db_host = 'localhost';
$db_name = 'talib';
$db_user = 'root';
$db_pass = '';

// Simple function to get database connection
function getConnection() {
    global $db_host, $db_name, $db_user, $db_pass;

    try {
        $dsn = "mysql:host=$db_host;dbname=$db_name;charset=utf8mb4";

        $options = array(
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false
        );

        $pdo = new PDO($dsn, $db_user, $db_pass, $options);
        return $pdo;

    } catch(PDOException $e) {
        die("Database connection failed: " . $e->getMessage());
    }
}
