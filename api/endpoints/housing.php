<?php
// Housing endpoint using existing MVC structure
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Handle CORS first
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    require_once __DIR__ . '/../controllers/HousingController.php';
    require_once __DIR__ . '/../utils/Response.php';

// Get request details
$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;
$action = $_GET['action'] ?? '';

// Create controller
$housingController = new HousingController();

// Handle requests
if ($method === 'GET') {
    if ($id) {
        $housingController->getById($id);
    } else {
        $housingController->getAll();
    }
} elseif ($method === 'POST') {
    if ($action === 'contact' && $id) {
        $housingController->contactOwner($id);
    } else {
        $housingController->create();
    }
} elseif ($method === 'PUT') {
    $housingController->update($id);
} elseif ($method === 'DELETE') {
    $housingController->delete($id);
} else {
    Response::error('Method not allowed', 405);
}

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
}
?>
