<?php
/**
 * Routes:
 * - /auth/* - Authentication (login, register)
 * - /students/* - Student management
 * - /housing/* - Housing listings
 * - /items/* - Marketplace items
 * - /roommates/* - Roommate profiles
 * - /favorites/* - User favorites
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set timezone for Morocco
date_default_timezone_set('Africa/Casablanca');

// Include required files
require_once __DIR__ . '/config/Config.php';
require_once __DIR__ . '/utils/Response.php';
require_once __DIR__ . '/middleware/CORS.php';

// Handle CORS (Cross-Origin Resource Sharing) for React frontend
handleCORS();
setSecurityHeaders();

// Set content type to JSON (all responses are JSON)
header('Content-Type: application/json');

// Get request method and URI
$method = $_SERVER['REQUEST_METHOD'];
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Remove base path if exists
$basePath = '/Talib-PFE/api';
if (strpos($uri, $basePath) === 0) {
    $uri = substr($uri, strlen($basePath));
}

// Remove leading slash
$uri = ltrim($uri, '/');

// Split URI into segments
$segments = explode('/', $uri);

// Route the request
try {
    // Handle empty URI
    if (empty($uri) || $uri === 'index.php') {
        Response::success([
            'message' => 'Talib API ',
            'version' => $api_version,
            'endpoints' => [
                'auth' => [
                    'POST /auth/login' => 'Student/Owner login',
                    'POST /auth/register' => 'Student/Owner registration',
                    'POST /auth/admin-login' => 'Admin login'
                ],
                'students' => [
                    'GET /students' => 'Get all students',
                    'GET /students/{id}' => 'Get student by ID',
                    'PUT /students/{id}' => 'Update student profile'
                ],
                'housing' => [
                    'GET /housing' => 'Get all housing listings',
                    'GET /housing/{id}' => 'Get housing by ID',
                    'POST /housing' => 'Create housing listing (owners only)',
                    'PUT /housing/{id}' => 'Update housing listing',
                    'DELETE /housing/{id}' => 'Delete housing listing'
                ],
                'items' => [
                    'GET /items' => 'Get all items with filters',
                    'GET /items/categories' => 'Get popular categories',
                    'GET /items/{id}' => 'Get item by ID',
                    'POST /items' => 'Create item listing (students only)',
                    'PUT /items/{id}' => 'Update item listing',
                    'PUT /items/{id}/sold' => 'Mark item as sold',
                    'DELETE /items/{id}' => 'Delete item listing'
                ],
                'housing' => [
                    'GET /housing' => 'Get all housing with filters',
                    'GET /housing/{id}' => 'Get housing by ID',
                    'POST /housing' => 'Create housing listing (owners only)',
                    'POST /housing/{id}/contact' => 'Contact housing owner (students only)',
                    'PUT /housing/{id}' => 'Update housing listing',
                    'DELETE /housing/{id}' => 'Delete housing listing'
                ],
                'roommates' => [
                    'GET /roommates' => 'Get all roommate profiles',
                    'GET /roommates/{id}' => 'Get roommate profile by ID',
                    'POST /roommates' => 'Create roommate profile (students only)',
                    'PUT /roommates/{id}' => 'Update roommate profile',
                    'DELETE /roommates/{id}' => 'Delete roommate profile'
                ],
                'favorites' => [
                    'status' => 'Not yet implemented'
                ]
            ]
        ]);
    }

    // Get the main route
    $route = $segments[0] ?? '';
    $id = $segments[1] ?? null;

    // Route to appropriate controller
    switch ($route) {
        case 'auth':
            require_once __DIR__ . '/controllers/AuthController.php';
            $controller = new AuthController();
            
            $action = $id; // For auth, the second segment is the action
            switch ($action) {
                case 'login':
                    if ($method === 'POST') {
                        $controller->login();
                    } else {
                        Response::error('Method not allowed', 405);
                    }
                    break;
                    
                case 'register':
                    if ($method === 'POST') {
                        $controller->register();
                    } else {
                        Response::error('Method not allowed', 405);
                    }
                    break;
                    
                case 'admin-login':
                    if ($method === 'POST') {
                        $controller->adminLogin();
                    } else {
                        Response::error('Method not allowed', 405);
                    }
                    break;
                    
                default:
                    Response::notFound('Auth endpoint not found');
            }
            break;

        case 'students':
            require_once __DIR__ . '/controllers/StudentController.php';
            $controller = new StudentController();
            
            switch ($method) {
                case 'GET':
                    if ($id) {
                        $controller->getById($id);
                    } else {
                        $controller->getAll();
                    }
                    break;
                    
                case 'PUT':
                    if ($id) {
                        $controller->update($id);
                    } else {
                        Response::error('Student ID required', 400);
                    }
                    break;
                    
                default:
                    Response::error('Method not allowed', 405);
            }
            break;

        case 'housing':
            require_once __DIR__ . '/controllers/HousingController.php';
            $controller = new HousingController();

            // Check for special actions
            $action = $segments[2] ?? null;

            if ($id && $action === 'contact' && $method === 'POST') {
                $controller->contact($id);
                break;
            }

            switch ($method) {
                case 'GET':
                    if ($id) {
                        $controller->getById($id);
                    } else {
                        $controller->getAll();
                    }
                    break;

                case 'POST':
                    $controller->create();
                    break;

                case 'PUT':
                    if ($id) {
                        $controller->update($id);
                    } else {
                        Response::error('Housing ID required', 400);
                    }
                    break;

                case 'DELETE':
                    if ($id) {
                        $controller->delete($id);
                    } else {
                        Response::error('Housing ID required', 400);
                    }
                    break;

                default:
                    Response::error('Method not allowed', 405);
            }
            break;

        case 'items':
            require_once __DIR__ . '/controllers/ItemController.php';
            $controller = new ItemController();

            // Check for special endpoints first
            if ($id === 'categories' && $method === 'GET') {
                $controller->getCategories();
                break;
            }

            // Check for special actions
            $action = $segments[2] ?? null;

            if ($id && $action === 'sold' && $method === 'PUT') {
                $controller->markAsSold($id);
                break;
            }

            switch ($method) {
                case 'GET':
                    if ($id) {
                        $controller->getById($id);
                    } else {
                        $controller->getAll();
                    }
                    break;

                case 'POST':
                    $controller->create();
                    break;

                case 'PUT':
                    if ($id) {
                        $controller->update($id);
                    } else {
                        Response::error('Item ID required', 400);
                    }
                    break;

                case 'DELETE':
                    if ($id) {
                        $controller->delete($id);
                    } else {
                        Response::error('Item ID required', 400);
                    }
                    break;

                default:
                    Response::error('Method not allowed', 405);
            }
            break;

        case 'roommates':
            require_once __DIR__ . '/controllers/RoommateController.php';
            $controller = new RoommateController();

            switch ($method) {
                case 'GET':
                    if ($id) {
                        $controller->getById($id);
                    } else {
                        $controller->getAll();
                    }
                    break;

                case 'POST':
                    $controller->create();
                    break;

                case 'PUT':
                    if ($id) {
                        $controller->update($id);
                    } else {
                        Response::error('Roommate profile ID required', 400);
                    }
                    break;

                case 'DELETE':
                    if ($id) {
                        $controller->delete($id);
                    } else {
                        Response::error('Roommate profile ID required', 400);
                    }
                    break;

                default:
                    Response::error('Method not allowed', 405);
            }
            break;

        case 'favorites':
            // TODO: Implement FavoriteController
            Response::error('Favorites endpoint not yet implemented', 501);
            break;

        default:
            Response::notFound('Endpoint not found');
    }

} catch (Exception $e) {
    // Log error
    error_log("API Error: " . $e->getMessage());
    
    // Return error response
    if (isDevelopment()) {
        Response::serverError($e->getMessage());
    } else {
        Response::serverError('An error occurred while processing your request');
    }
}
