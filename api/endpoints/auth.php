<?php
// Authentication endpoint using existing MVC structure
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
    require_once __DIR__ . '/../controllers/AuthController.php';
    require_once __DIR__ . '/../utils/Response.php';

    // Get request details
    $method = $_SERVER['REQUEST_METHOD'];
    $action = $_GET['action'] ?? '';

    // Create controller
    $authController = new AuthController();

    // Handle requests
    if ($method === 'POST') {
        if ($action === 'register') {
            $authController->register();
        } elseif ($action === 'login') {
            $authController->login();
        } elseif ($action === 'admin-login') {
            $authController->adminLogin();
        } else {
            Response::error('Invalid action. Use register, login, or admin-login', 400);
        }
    } else {
        Response::error('Only POST method allowed', 405);
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