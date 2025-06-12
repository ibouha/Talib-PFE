<?php

require_once __DIR__ . '/../config/Database.php';

abstract class BaseModel {
    protected $db;
    protected $conn;
    protected $table;
    
    public function __construct() {
        $this->db = new Database();
        $this->conn = $this->db->getConnection();
    }
    
    /**
     * Find record by ID
     */
    public function findById($id) {
        $query = "SELECT * FROM {$this->table} WHERE id = :id LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        
        return $stmt->fetch();
    }
    
    /**
     * Find all records with optional conditions
     */
    public function findAll($conditions = [], $orderBy = 'id DESC', $limit = null, $offset = 0) {
        $query = "SELECT * FROM {$this->table}";
        
        if (!empty($conditions)) {
            $whereClause = [];
            foreach ($conditions as $field => $value) {
                $whereClause[] = "{$field} = :{$field}";
            }
            $query .= " WHERE " . implode(' AND ', $whereClause);
        }
        
        if ($orderBy) {
            $query .= " ORDER BY {$orderBy}";
        }
        
        if ($limit) {
            $query .= " LIMIT {$limit} OFFSET {$offset}";
        }
        
        $stmt = $this->conn->prepare($query);
        
        // Bind parameters
        foreach ($conditions as $field => $value) {
            $stmt->bindValue(":{$field}", $value);
        }
        
        $stmt->execute();
        return $stmt->fetchAll();
    }
    
    /**
     * Count records with optional conditions
     */
    public function count($conditions = []) {
        $query = "SELECT COUNT(*) as total FROM {$this->table}";
        
        if (!empty($conditions)) {
            $whereClause = [];
            foreach ($conditions as $field => $value) {
                $whereClause[] = "{$field} = :{$field}";
            }
            $query .= " WHERE " . implode(' AND ', $whereClause);
        }
        
        $stmt = $this->conn->prepare($query);
        
        // Bind parameters
        foreach ($conditions as $field => $value) {
            $stmt->bindValue(":{$field}", $value);
        }
        
        $stmt->execute();
        $result = $stmt->fetch();
        
        return (int) $result['total'];
    }
    
    /**
     * Create new record
     */
    public function create($data) {
        $fields = array_keys($data);
        $placeholders = array_map(function($field) { return ":{$field}"; }, $fields);
        
        $query = "INSERT INTO {$this->table} (" . implode(', ', $fields) . ") 
                  VALUES (" . implode(', ', $placeholders) . ")";
        
        $stmt = $this->conn->prepare($query);
        
        // Bind parameters
        foreach ($data as $field => $value) {
            $stmt->bindValue(":{$field}", $value);
        }
        
        if ($stmt->execute()) {
            return $this->conn->lastInsertId();
        }
        
        return false;
    }
    
    /**
     * Update record by ID
     */
    public function update($id, $data) {
        $fields = array_keys($data);
        $setClause = array_map(function($field) { return "{$field} = :{$field}"; }, $fields);
        
        $query = "UPDATE {$this->table} SET " . implode(', ', $setClause) . " WHERE id = :id";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        
        // Bind parameters
        foreach ($data as $field => $value) {
            $stmt->bindValue(":{$field}", $value);
        }
        
        return $stmt->execute();
    }
    
    /**
     * Delete record by ID
     */
    public function delete($id) {
        $query = "DELETE FROM {$this->table} WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        
        return $stmt->execute();
    }
    
    /**
     * Check if record exists
     */
    public function exists($conditions) {
        return $this->count($conditions) > 0;
    }
    
    /**
     * Find one record by conditions
     */
    public function findOne($conditions) {
        $results = $this->findAll($conditions, null, 1);
        return !empty($results) ? $results[0] : null;
    }
    
    /**
     * Begin transaction
     */
    public function beginTransaction() {
        return $this->conn->beginTransaction();
    }
    
    /**
     * Commit transaction
     */
    public function commit() {
        return $this->conn->commit();
    }
    
    /**
     * Rollback transaction
     */
    public function rollback() {
        return $this->conn->rollback();
    }
}
