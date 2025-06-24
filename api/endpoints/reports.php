<?php
/**
 * Reports API Endpoint
 * Handles content reporting functionality
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

require_once __DIR__ . '/../controllers/ReportController.php';

try {
    $reportController = new ReportController();
    $method = $_SERVER['REQUEST_METHOD'];
    
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
                        $reportController->getReportStats();
                        break;
                    case 'check':
                        $reportController->checkUserReport();
                        break;
                    case 'count':
                        $reportController->getContentReportsCount();
                        break;
                    case 'all':
                    default:
                        $reportController->getAllReports();
                        break;
                }
            } else {
                $reportController->getAllReports();
            }
            break;

        case 'POST':
            $reportController->createReport();
            break;

        case 'PUT':
            if (isset($queryParams['action']) && $queryParams['action'] === 'status') {
                $reportController->updateReportStatus();
            } else {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Invalid action for PUT request']);
            }
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
