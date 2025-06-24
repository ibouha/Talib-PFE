<?php
// Profile Image Upload Endpoint
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/config/Config.php';
require_once __DIR__ . '/utils/Response.php';
require_once __DIR__ . '/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

try {
    // Check authentication
    $currentUser = requireAuth();

    // Debug: Log upload attempt
    error_log('Profile image upload attempt by user: ' . json_encode($currentUser));

    // Check if file was uploaded
    if (!isset($_FILES['image'])) {
        echo json_encode(['success' => false, 'message' => 'No image file in request', 'debug' => $_FILES]);
        exit;
    }

    $file = $_FILES['image'];

    // Check for upload errors
    if ($file['error'] !== UPLOAD_ERR_OK) {
        $errorMessages = [
            UPLOAD_ERR_INI_SIZE => 'File too large (exceeds upload_max_filesize)',
            UPLOAD_ERR_FORM_SIZE => 'File too large (exceeds MAX_FILE_SIZE)',
            UPLOAD_ERR_PARTIAL => 'File was only partially uploaded',
            UPLOAD_ERR_NO_FILE => 'No file was uploaded',
            UPLOAD_ERR_NO_TMP_DIR => 'Missing temporary folder',
            UPLOAD_ERR_CANT_WRITE => 'Failed to write file to disk',
            UPLOAD_ERR_EXTENSION => 'File upload stopped by extension'
        ];

        $errorMessage = $errorMessages[$file['error']] ?? 'Unknown upload error';
        echo json_encode(['success' => false, 'message' => $errorMessage, 'error_code' => $file['error']]);
        exit;
    }

    // Debug: Log file info
    error_log('File info: ' . json_encode([
        'name' => $file['name'],
        'type' => $file['type'],
        'size' => $file['size'],
        'tmp_name' => $file['tmp_name']
    ]));

    // Validate file type
    $allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!in_array($file['type'], $allowedTypes)) {
        echo json_encode([
            'success' => false,
            'message' => 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed',
            'received_type' => $file['type']
        ]);
        exit;
    }

    // Validate file size (max 5MB)
    $maxSize = 5 * 1024 * 1024; // 5MB
    if ($file['size'] > $maxSize) {
        echo json_encode([
            'success' => false,
            'message' => 'File too large. Maximum size is 5MB',
            'file_size' => $file['size'],
            'max_size' => $maxSize
        ]);
        exit;
    }

    // Create uploads directory if it doesn't exist
    $uploadDir = __DIR__ . '/uploads/profiles/';
    if (!is_dir($uploadDir)) {
        if (!mkdir($uploadDir, 0755, true)) {
            echo json_encode(['success' => false, 'message' => 'Failed to create upload directory']);
            exit;
        }
    }

    // Check if directory is writable
    if (!is_writable($uploadDir)) {
        echo json_encode(['success' => false, 'message' => 'Upload directory is not writable']);
        exit;
    }
    
    // Generate unique filename
    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = 'profile_' . $currentUser['user_id'] . '_' . time() . '.' . $extension;
    $filepath = $uploadDir . $filename;
    
    // Move uploaded file
    if (!move_uploaded_file($file['tmp_name'], $filepath)) {
        echo json_encode(['success' => false, 'message' => 'Failed to save uploaded file']);
        exit;
    }
    
    // Generate URL for the uploaded image
    $imageUrl = '/Talib-PFE/api/uploads/profiles/' . $filename;
    
    // Update user profile with image URL
    $pdo = getConnection();
    
    // Determine which table to update based on user role
    if ($currentUser['role'] === 'student') {
        $stmt = $pdo->prepare("UPDATE Student SET image = ? WHERE id = ?");
    } elseif ($currentUser['role'] === 'owner') {
        $stmt = $pdo->prepare("UPDATE owner SET image = ? WHERE id = ?");
    } else {
        echo json_encode(['success' => false, 'message' => 'Profile images not supported for admin users']);
        exit;
    }
    
    $success = $stmt->execute([$imageUrl, $currentUser['user_id']]);
    
    if ($success) {
        echo json_encode([
            'success' => true,
            'message' => 'Profile image uploaded successfully',
            'data' => [
                'url' => $imageUrl,
                'filename' => $filename
            ]
        ]);
    } else {
        // Delete the uploaded file if database update failed
        unlink($filepath);
        echo json_encode(['success' => false, 'message' => 'Failed to update profile with image URL']);
    }
    
} catch (Exception $e) {
    error_log('Profile image upload error: ' . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Server error occurred']);
}
?>
