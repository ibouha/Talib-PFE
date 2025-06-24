<?php
/**
 * Admin Statistics API Endpoint
 * Provides real data for admin dashboard
 */

error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../auth.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../config/database.php';

try {
    // Authenticate admin
    $currentUser = authenticateUser();
    if ($currentUser['role'] !== 'admin') {
        Response::forbidden('Admin access required');
    }

    $database = new Database();
    $conn = $database->getConnection();

    $method = $_SERVER['REQUEST_METHOD'];
    $queryParams = [];
    if (isset($_SERVER['QUERY_STRING'])) {
        parse_str($_SERVER['QUERY_STRING'], $queryParams);
    }

    switch ($method) {
        case 'GET':
            $action = $queryParams['action'] ?? 'overview';
            
            switch ($action) {
                case 'overview':
                    getOverviewStats($conn);
                    break;
                case 'user-growth':
                    getUserGrowthData($conn);
                    break;
                case 'recent-users':
                    getRecentUsers($conn);
                    break;
                case 'verification-requests':
                    getVerificationRequests($conn);
                    break;
                default:
                    Response::error('Invalid action', 400);
            }
            break;

        default:
            Response::error('Method not allowed', 405);
            break;
    }

} catch (Exception $e) {
    Response::serverError('Server error: ' . $e->getMessage());
}

function getOverviewStats($conn) {
    try {
        // Total users (students + owners)
        $stmt = $conn->prepare("
            SELECT
                (SELECT COUNT(*) FROM student) + (SELECT COUNT(*) FROM owner) as total_users,
                (SELECT COUNT(*) FROM student WHERE status = 'verified') + (SELECT COUNT(*) FROM owner WHERE status = 'verified') as verified_users,
                (SELECT COUNT(*) FROM housing WHERE status = 'available') as active_housing,
                (SELECT COUNT(*) FROM item WHERE status = 'available') as active_items,
                (SELECT COUNT(*) FROM roommateprofile) as roommate_profiles,
                (SELECT COUNT(*) FROM reports WHERE status = 'pending') as pending_reports
        ");
        $stmt->execute();
        $stats = $stmt->fetch();

        $totalActiveListings = $stats['active_housing'] + $stats['active_items'] + $stats['roommate_profiles'];

        Response::success([
            'total_users' => (int)$stats['total_users'],
            'verified_users' => (int)$stats['verified_users'],
            'active_listings' => (int)$totalActiveListings,
            'pending_reports' => (int)$stats['pending_reports'],
            'verification_rate' => $stats['total_users'] > 0 ? round(($stats['verified_users'] / $stats['total_users']) * 100, 1) : 0
        ]);

    } catch (Exception $e) {
        Response::serverError('Failed to fetch overview stats: ' . $e->getMessage());
    }
}

function getUserGrowthData($conn) {
    try {
        // Get user registration data for the last 30 days
        $stmt = $conn->prepare("
            SELECT 
                DATE(created_at) as date,
                COUNT(*) as students,
                0 as owners
            FROM student 
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            GROUP BY DATE(created_at)
            
            UNION ALL
            
            SELECT 
                DATE(created_at) as date,
                0 as students,
                COUNT(*) as owners
            FROM owner 
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            GROUP BY DATE(created_at)
            
            ORDER BY date ASC
        ");
        $stmt->execute();
        $rawData = $stmt->fetchAll();

        // Process data to combine students and owners by date
        $processedData = [];
        foreach ($rawData as $row) {
            $date = $row['date'];
            if (!isset($processedData[$date])) {
                $processedData[$date] = [
                    'date' => $date,
                    'students' => 0,
                    'owners' => 0
                ];
            }
            $processedData[$date]['students'] += (int)$row['students'];
            $processedData[$date]['owners'] += (int)$row['owners'];
        }

        // Convert to array and ensure we have data for the last 30 days
        $result = [];
        for ($i = 29; $i >= 0; $i--) {
            $date = date('Y-m-d', strtotime("-$i days"));
            $result[] = [
                'date' => date('M j', strtotime($date)),
                'students' => $processedData[$date]['students'] ?? 0,
                'owners' => $processedData[$date]['owners'] ?? 0
            ];
        }

        Response::success($result);

    } catch (Exception $e) {
        Response::serverError('Failed to fetch user growth data: ' . $e->getMessage());
    }
}

function getRecentUsers($conn) {
    try {
        $stmt = $conn->prepare("
            SELECT
                s.id,
                s.name,
                s.email,
                'student' as role,
                CASE WHEN s.status = 'verified' THEN 1 ELSE 0 END as is_verified,
                s.university,
                s.created_at,
                NULL as properties_count
            FROM student s
            ORDER BY s.created_at DESC
            LIMIT 5

            UNION ALL

            SELECT
                o.id,
                o.name,
                o.email,
                'owner' as role,
                CASE WHEN o.status = 'verified' THEN 1 ELSE 0 END as is_verified,
                NULL as university,
                o.created_at,
                (SELECT COUNT(*) FROM housing WHERE owner_id = o.id) as properties_count
            FROM owner o
            ORDER BY o.created_at DESC
            LIMIT 5
        ");
        $stmt->execute();
        $users = $stmt->fetchAll();

        // Sort by created_at and limit to 10 most recent
        usort($users, function($a, $b) {
            return strtotime($b['created_at']) - strtotime($a['created_at']);
        });

        $recentUsers = array_slice($users, 0, 10);

        Response::success($recentUsers);

    } catch (Exception $e) {
        Response::serverError('Failed to fetch recent users: ' . $e->getMessage());
    }
}

function getVerificationRequests($conn) {
    try {
        $stmt = $conn->prepare("
            SELECT
                s.id,
                s.name,
                s.email,
                'student' as type,
                s.university,
                s.created_at
            FROM student s
            WHERE s.status = 'not_verified'
            ORDER BY s.created_at DESC
            LIMIT 10

            UNION ALL

            SELECT
                o.id,
                o.name,
                o.email,
                'owner' as type,
                NULL as university,
                o.created_at
            FROM owner o
            WHERE o.status = 'not_verified'
            ORDER BY o.created_at DESC
            LIMIT 10
        ");
        $stmt->execute();
        $requests = $stmt->fetchAll();

        // Sort by created_at
        usort($requests, function($a, $b) {
            return strtotime($b['created_at']) - strtotime($a['created_at']);
        });

        $verificationRequests = array_slice($requests, 0, 20);

        Response::success($verificationRequests);

    } catch (Exception $e) {
        Response::serverError('Failed to fetch verification requests: ' . $e->getMessage());
    }
}
