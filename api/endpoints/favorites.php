<?php
// Favorites endpoint using existing MVC structure
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
    require_once __DIR__ . '/../controllers/FavoriteController.php';
    require_once __DIR__ . '/../utils/Response.php';

    // Get request details
    $method = $_SERVER['REQUEST_METHOD'];
    $id = $_GET['id'] ?? null;
    $action = $_GET['action'] ?? null;
    $studentId = $_GET['student_id'] ?? null;

    // Create controller
    $favoriteController = new FavoriteController();

    // Handle requests
    if ($method === 'GET') {
        if ($action === 'stats' && $studentId) {
            $favoriteController->getFavoriteStats();
        } elseif ($action === 'check' && $studentId) {
            $favoriteController->checkFavorited();
        } elseif ($studentId) {
            $favoriteController->getUserFavorites();
        } else {
            $favoriteController->getUserFavorites();
        }
    } elseif ($method === 'POST') {
        $favoriteController->addToFavorites();
    } elseif ($method === 'DELETE') {
        if ($id) {
            $favoriteController->removeFromFavorites($id);
        } else {
            Response::error('Favorite ID is required for deletion', 400);
        }
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
