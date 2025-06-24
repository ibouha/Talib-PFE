<?php
/**
 * Database Connection - Procedural approach
 * Simple functions to handle database connections
 */

require_once __DIR__ . '/Config.php';

// Global database connection variable
$database_connection = null;

/**
 * Get database connection (singleton pattern)
 */
function getDatabase() {
    global $database_connection;
    global $db_host, $db_name, $db_user, $db_pass;
    
    // Return existing connection if available
    if ($database_connection !== null) {
        return $database_connection;
    }
    
    try {
        // Create new MySQLi connection
        $database_connection = new mysqli($db_host, $db_user, $db_pass, $db_name);
        
        // Check connection
        if ($database_connection->connect_error) {
            throw new Exception("Connection failed: " . $database_connection->connect_error);
        }
        
        // Set charset to UTF-8
        $database_connection->set_charset("utf8mb4");
        
        return $database_connection;
        
    } catch (Exception $e) {
        error_log("Database connection error: " . $e->getMessage());
        throw new Exception("Database connection failed");
    }
}

/**
 * Close database connection
 */
function closeDatabase() {
    global $database_connection;
    
    if ($database_connection !== null) {
        $database_connection->close();
        $database_connection = null;
    }
}

/**
 * Execute a simple query and return results
 */
function executeQuery($sql, $params = [], $types = "") {
    $db = getDatabase();
    
    try {
        if (empty($params)) {
            // Simple query without parameters
            $result = $db->query($sql);
            
            if ($result === false) {
                throw new Exception("Query failed: " . $db->error);
            }
            
            return $result;
        } else {
            // Prepared statement with parameters
            $stmt = $db->prepare($sql);
            
            if (!$stmt) {
                throw new Exception("Prepare failed: " . $db->error);
            }
            
            if (!empty($types) && !empty($params)) {
                $stmt->bind_param($types, ...$params);
            }
            
            $stmt->execute();
            
            if ($stmt->error) {
                throw new Exception("Execute failed: " . $stmt->error);
            }
            
            $result = $stmt->get_result();
            $stmt->close();
            
            return $result;
        }
        
    } catch (Exception $e) {
        error_log("Query execution error: " . $e->getMessage());
        throw $e;
    }
}

/**
 * Execute an INSERT query and return the inserted ID
 */
function executeInsert($sql, $params = [], $types = "") {
    $db = getDatabase();
    
    try {
        $stmt = $db->prepare($sql);
        
        if (!$stmt) {
            throw new Exception("Prepare failed: " . $db->error);
        }
        
        if (!empty($types) && !empty($params)) {
            $stmt->bind_param($types, ...$params);
        }
        
        $success = $stmt->execute();
        
        if (!$success) {
            throw new Exception("Execute failed: " . $stmt->error);
        }
        
        $insert_id = $db->insert_id;
        $stmt->close();
        
        return $insert_id;
        
    } catch (Exception $e) {
        error_log("Insert execution error: " . $e->getMessage());
        throw $e;
    }
}

/**
 * Execute an UPDATE or DELETE query and return affected rows
 */
function executeUpdate($sql, $params = [], $types = "") {
    $db = getDatabase();
    
    try {
        $stmt = $db->prepare($sql);
        
        if (!$stmt) {
            throw new Exception("Prepare failed: " . $db->error);
        }
        
        if (!empty($types) && !empty($params)) {
            $stmt->bind_param($types, ...$params);
        }
        
        $success = $stmt->execute();
        
        if (!$success) {
            throw new Exception("Execute failed: " . $stmt->error);
        }
        
        $affected_rows = $stmt->affected_rows;
        $stmt->close();
        
        return $affected_rows;
        
    } catch (Exception $e) {
        error_log("Update execution error: " . $e->getMessage());
        throw $e;
    }
}

/**
 * Fetch a single row from query result
 */
function fetchRow($sql, $params = [], $types = "") {
    $result = executeQuery($sql, $params, $types);
    
    if ($result && $result->num_rows > 0) {
        return $result->fetch_assoc();
    }
    
    return null;
}

/**
 * Fetch all rows from query result
 */
function fetchAll($sql, $params = [], $types = "") {
    $result = executeQuery($sql, $params, $types);
    $rows = [];
    
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $rows[] = $row;
        }
    }
    
    return $rows;
}

/**
 * Begin database transaction
 */
function beginTransaction() {
    $db = getDatabase();
    $db->autocommit(false);
}

/**
 * Commit database transaction
 */
function commitTransaction() {
    $db = getDatabase();
    $db->commit();
    $db->autocommit(true);
}

/**
 * Rollback database transaction
 */
function rollbackTransaction() {
    $db = getDatabase();
    $db->rollback();
    $db->autocommit(true);
}

/**
 * Escape string for database queries (when not using prepared statements)
 */
function escapeString($string) {
    $db = getDatabase();
    return $db->real_escape_string($string);
}

/**
 * Get last database error
 */
function getLastError() {
    $db = getDatabase();
    return $db->error;
}
