<?php
/**
 * Admin Users API Endpoint
 * Handles admin operations for user management
 */

// Disable error display for clean JSON responses
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../controllers/AdminController.php';

try {
    $adminController = new AdminController();
    $method = $_SERVER['REQUEST_METHOD'];
    $path = $_SERVER['REQUEST_URI'];
    
    // Parse query parameters
    $queryParams = [];
    if (isset($_SERVER['QUERY_STRING'])) {
        parse_str($_SERVER['QUERY_STRING'], $queryParams);
    }

    switch ($method) {
        case 'GET':
            if (isset($queryParams['action'])) {
                switch ($queryParams['action']) {
                    case 'stats':
                        $adminController->getUserStats();
                        break;
                    case 'users':
                    default:
                        $adminController->getAllUsers();
                        break;
                }
            } else {
                $adminController->getAllUsers();
            }
            break;

        case 'PUT':
            if (isset($queryParams['action']) && $queryParams['action'] === 'status') {
                $adminController->updateUserStatus();
            } else {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Invalid action for PUT request']);
            }
            break;

        case 'DELETE':
            $adminController->deleteUser();
            break;

        default:
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'Method not allowed']);
            break;
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage()
    ]);
}
?>
