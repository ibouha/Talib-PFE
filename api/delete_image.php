<?php
// Image delete endpoint
require_once __DIR__ . '/config/Config.php';
require_once __DIR__ . '/middleware/CORS.php';
require_once __DIR__ . '/auth.php';

// Handle CORS
CORS::handle();

// Only allow DELETE requests
if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Authenticate user
try {
    $user = requireAuth();
} catch (Exception $e) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Authentication required']);
    exit;
}

// Get filename from query parameter
$filename = $_GET['filename'] ?? '';

if (empty($filename)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Filename is required']);
    exit;
}

// Validate filename to prevent directory traversal
if (strpos($filename, '..') !== false || strpos($filename, '/') === 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid filename']);
    exit;
}

// Construct file path
$uploadDir = __DIR__ . '/uploads/';
$filepath = $uploadDir . $filename;

// Check if file exists
if (!file_exists($filepath)) {
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'File not found']);
    exit;
}

// Delete the file
if (unlink($filepath)) {
    echo json_encode([
        'success' => true,
        'message' => 'Image deleted successfully'
    ]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to delete image']);
}
?>
