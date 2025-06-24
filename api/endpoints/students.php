<?php
// Simple Students endpoint using existing MVC structure
require_once __DIR__ . '/../controllers/StudentController.php';

// Handle CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Get request details
$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;

// Create controller
$studentController = new StudentController();

// Handle requests
if ($method === 'GET') {
    if ($id) {
        $studentController->getById($id);
    } else {
        $studentController->getAll();
    }
} elseif ($method === 'PUT') {
    $studentController->update($id);
} else {
    Response::error('Method not allowed');
}
?>
