<?php
// Simple Roommate endpoints using MVC structure
require_once __DIR__ . '/../controllers/RoommateController.php';

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
$action = $_GET['action'] ?? '';
$student_id = $_GET['student_id'] ?? null;

// Create controller
$roommateController = new RoommateController();

// Handle requests
if ($method === 'GET') {
    if ($action === 'compatible' && $id) {
        $roommateController->getCompatible($id);
    } elseif ($action === 'by-student' && $student_id) {
        $roommateController->getByStudentId($student_id);
    } elseif ($id) {
        $roommateController->getById($id);
    } else {
        $roommateController->getAll();
    }
} elseif ($method === 'POST') {
    $roommateController->create();
} elseif ($method === 'PUT') {
    $roommateController->update($id);
} elseif ($method === 'DELETE') {
    $roommateController->delete($id);
} else {
    Response::error('Method not allowed');
}
?>
