<?php
// Housing Image endpoint
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
    require_once __DIR__ . '/../models/Housing.php';
    require_once __DIR__ . '/../utils/Response.php';
    require_once __DIR__ . '/../auth.php';

    // Get request details
    $method = $_SERVER['REQUEST_METHOD'];
    $id = $_GET['id'] ?? null;

    // Create housing model (which has image methods)
    $housingModel = new Housing();

    // Handle requests
    if ($method === 'POST') {
        // Add housing image
        
        // Authenticate user
        $currentUser = requireAuth();
        
        // Get input data
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            Response::error('Invalid JSON data', 400);
        }
        
        // Validate required fields
        if (!isset($input['housing_id']) || !isset($input['path'])) {
            Response::error('housing_id and path are required', 400);
        }
        
        $housingId = intval($input['housing_id']);
        $imagePath = $input['path'];
        
        // Verify housing exists and user owns it (or is admin)
        $housing = $housingModel->findById($housingId);
        if (!$housing) {
            Response::notFound('Housing not found');
        }
        
        // Check ownership
        if ($currentUser['role'] !== 'admin' && $housing['owner_id'] != $currentUser['user_id']) {
            Response::forbidden('You can only add images to your own housing listings');
        }
        
        // Add the image
        $success = $housingModel->addHousingImage($housingId, $imagePath);
        
        if ($success) {
            Response::success(null, 'Housing image added successfully', 201);
        } else {
            Response::serverError('Failed to add housing image');
        }
        
    } elseif ($method === 'DELETE') {
        // Delete housing image
        
        // Authenticate user
        $currentUser = requireAuth();
        
        if (!$id) {
            Response::error('Image ID is required', 400);
        }
        
        // For deletion, we need to check ownership through the housing
        // First get the image to find the housing_id
        $pdo = getConnection();
        $stmt = $pdo->prepare("SELECT hi.*, h.owner_id FROM housingimage hi 
                              JOIN housing h ON hi.housing_id = h.id 
                              WHERE hi.id = ?");
        $stmt->execute([$id]);
        $imageData = $stmt->fetch();
        
        if (!$imageData) {
            Response::notFound('Image not found');
        }
        
        // Check ownership
        if ($currentUser['role'] !== 'admin' && $imageData['owner_id'] != $currentUser['user_id']) {
            Response::forbidden('You can only delete images from your own housing listings');
        }
        
        // Delete the image
        $success = $housingModel->removeHousingImage($id);
        
        if ($success) {
            Response::success(null, 'Housing image deleted successfully');
        } else {
            Response::serverError('Failed to delete housing image');
        }
        
    } elseif ($method === 'GET') {
        // Get housing images
        
        if (!$id) {
            Response::error('Housing ID is required', 400);
        }
        
        $images = $housingModel->getHousingImages($id);
        Response::success($images, 'Housing images retrieved successfully');
        
    } else {
        Response::error('Method not allowed', 405);
    }

} catch (Exception $e) {
    error_log('Housing Image endpoint error: ' . $e->getMessage());
    Response::serverError('Server error: ' . $e->getMessage());
}
?>
