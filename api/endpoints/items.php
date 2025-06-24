<?php
// Simple Items endpoint using existing MVC structure
require_once __DIR__ . '/../controllers/ItemController.php';

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
$itemController = new ItemController();

// Handle requests
if ($method === 'GET') {
    if ($id === 'categories') {
        $itemController->getCategories();
    } elseif ($id) {
        $itemController->getById($id);
    } else {
        $itemController->getAll();
    }
} elseif ($method === 'POST') {
    $itemController->create();
} elseif ($method === 'PUT') {
    $itemController->update($id);
} elseif ($method === 'DELETE') {
    $itemController->delete($id);
} else {
    Response::error('Method not allowed');
}
?>
