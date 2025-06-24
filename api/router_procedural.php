<?php
/**
 * Procedural Router - Routes requests to appropriate controller functions
 */

require_once __DIR__ . '/config/Config.php';
require_once __DIR__ . '/utils/Response.php';
require_once __DIR__ . '/middleware/CORS.php';

// Handle CORS
handleCORS();
setSecurityHeaders();

// Set content type to JSON
header('Content-Type: application/json');

/**
 * Parse the request URI and method
 */
function parse_request() {
    $method = $_SERVER['REQUEST_METHOD'];
    $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    
    // Remove base path if exists
    $basePath = '/Talib-PFE/api';
    if (strpos($uri, $basePath) === 0) {
        $uri = substr($uri, strlen($basePath));
    }
    
    // Remove leading slash and split into segments
    $uri = ltrim($uri, '/');
    $segments = explode('/', $uri);
    
    return [
        'method' => $method,
        'uri' => $uri,
        'segments' => $segments
    ];
}

/**
 * Route students requests
 */
function route_students($method, $segments) {
    require_once __DIR__ . '/controllers_procedural/student_controller.php';
    
    $id = isset($segments[1]) ? $segments[1] : null;
    $action = isset($segments[2]) ? $segments[2] : null;
    
    // Handle special actions
    if ($id && $action === 'status' && $method === 'PUT') {
        handle_update_student_status($id);
        return;
    }
    
    switch ($method) {
        case 'GET':
            if ($id) {
                handle_get_student($id);
            } else {
                handle_get_students();
            }
            break;
            
        case 'POST':
            handle_create_student();
            break;
            
        case 'PUT':
            if ($id) {
                handle_update_student($id);
            } else {
                Response::error('Student ID required for update', 400);
            }
            break;
            
        case 'DELETE':
            if ($id) {
                handle_delete_student($id);
            } else {
                Response::error('Student ID required for deletion', 400);
            }
            break;
            
        default:
            Response::error('Method not allowed', 405);
    }
}

/**
 * Route housing requests
 */
function route_housing($method, $segments) {
    require_once __DIR__ . '/controllers_procedural/housing_controller.php';
    
    $id = isset($segments[1]) ? $segments[1] : null;
    $action = isset($segments[2]) ? $segments[2] : null;
    
    // Handle special actions
    if ($id && $action === 'contact' && $method === 'POST') {
        handle_housing_contact($id);
        return;
    }
    
    switch ($method) {
        case 'GET':
            if ($id) {
                handle_get_housing($id);
            } else {
                handle_get_all_housing();
            }
            break;
            
        case 'POST':
            handle_create_housing();
            break;
            
        case 'PUT':
            if ($id) {
                handle_update_housing($id);
            } else {
                Response::error('Housing ID required for update', 400);
            }
            break;
            
        case 'DELETE':
            if ($id) {
                handle_delete_housing($id);
            } else {
                Response::error('Housing ID required for deletion', 400);
            }
            break;
            
        default:
            Response::error('Method not allowed', 405);
    }
}

/**
 * Route items requests
 */
function route_items($method, $segments) {
    require_once __DIR__ . '/controllers_procedural/item_controller.php';
    
    $id = isset($segments[1]) ? $segments[1] : null;
    $action = isset($segments[2]) ? $segments[2] : null;
    
    // Handle special endpoints
    if ($id === 'categories' && $method === 'GET') {
        handle_get_item_categories();
        return;
    }
    
    // Handle special actions
    if ($id && $action === 'sold' && $method === 'PUT') {
        handle_mark_item_sold($id);
        return;
    }
    
    switch ($method) {
        case 'GET':
            if ($id) {
                handle_get_item($id);
            } else {
                handle_get_all_items();
            }
            break;
            
        case 'POST':
            handle_create_item();
            break;
            
        case 'PUT':
            if ($id) {
                handle_update_item($id);
            } else {
                Response::error('Item ID required for update', 400);
            }
            break;
            
        case 'DELETE':
            if ($id) {
                handle_delete_item($id);
            } else {
                Response::error('Item ID required for deletion', 400);
            }
            break;
            
        default:
            Response::error('Method not allowed', 405);
    }
}

/**
 * Route roommates requests
 */
function route_roommates($method, $segments) {
    require_once __DIR__ . '/controllers_procedural/roommate_controller.php';
    
    $id = isset($segments[1]) ? $segments[1] : null;
    $action = isset($segments[2]) ? $segments[2] : null;
    
    // Handle special actions
    if ($id && $action === 'compatible' && $method === 'GET') {
        handle_get_compatible_roommates($id);
        return;
    }
    
    if ($id === 'by-student' && isset($segments[2]) && $method === 'GET') {
        handle_get_roommates_by_student($segments[2]);
        return;
    }
    
    switch ($method) {
        case 'GET':
            if ($id) {
                handle_get_roommate($id);
            } else {
                handle_get_all_roommates();
            }
            break;
            
        case 'POST':
            handle_create_roommate();
            break;
            
        case 'PUT':
            if ($id) {
                handle_update_roommate($id);
            } else {
                Response::error('Roommate profile ID required for update', 400);
            }
            break;
            
        case 'DELETE':
            if ($id) {
                handle_delete_roommate($id);
            } else {
                Response::error('Roommate profile ID required for deletion', 400);
            }
            break;
            
        default:
            Response::error('Method not allowed', 405);
    }
}

/**
 * Route admin requests
 */
function route_admin($method, $segments) {
    require_once __DIR__ . '/controllers_procedural/admin_controller.php';
    
    $action = isset($segments[1]) ? $segments[1] : null;
    
    switch ($action) {
        case 'users':
            if ($method === 'GET') {
                handle_get_all_users();
            } elseif ($method === 'DELETE') {
                handle_delete_user();
            } else {
                Response::error('Method not allowed', 405);
            }
            break;
            
        case 'stats':
            if ($method === 'GET') {
                handle_get_user_stats();
            } else {
                Response::error('Method not allowed', 405);
            }
            break;
            
        case 'platform-stats':
            if ($method === 'GET') {
                handle_get_platform_stats();
            } else {
                Response::error('Method not allowed', 405);
            }
            break;
            
        case 'recent-activity':
            if ($method === 'GET') {
                handle_get_recent_activity();
            } else {
                Response::error('Method not allowed', 405);
            }
            break;
            
        case 'user-status':
            if ($method === 'PUT') {
                handle_update_user_status();
            } else {
                Response::error('Method not allowed', 405);
            }
            break;
            
        case 'create-admin':
            if ($method === 'POST') {
                handle_create_admin();
            } else {
                Response::error('Method not allowed', 405);
            }
            break;
            
        case 'change-password':
            if ($method === 'PUT') {
                handle_change_admin_password();
            } else {
                Response::error('Method not allowed', 405);
            }
            break;
            
        default:
            Response::notFound('Admin endpoint not found');
    }
}

/**
 * Route authentication requests
 */
function route_auth($method, $segments) {
    require_once __DIR__ . '/controllers_procedural/auth_controller.php';
    
    $action = isset($segments[1]) ? $segments[1] : null;
    
    if ($method !== 'POST') {
        Response::error('Method not allowed', 405);
        return;
    }
    
    switch ($action) {
        case 'login':
            handle_login();
            break;
            
        case 'register':
            handle_register();
            break;
            
        case 'admin-login':
            handle_admin_login();
            break;
            
        default:
            Response::notFound('Auth endpoint not found');
    }
}

/**
 * Main routing function
 */
function route_request() {
    try {
        $request = parse_request();
        $method = $request['method'];
        $segments = $request['segments'];
        $route = $segments[0] ?? '';

        // Handle empty URI (API info)
        if (empty($request['uri']) || $request['uri'] === 'router_procedural.php') {
            global $api_version;
            Response::success([
                'message' => 'Talib API - Procedural Version',
                'version' => $api_version ?? 'v1',
                'endpoints' => [
                    'auth' => ['POST /auth/login', 'POST /auth/register', 'POST /auth/admin-login'],
                    'students' => ['GET /students', 'GET /students/{id}', 'POST /students', 'PUT /students/{id}', 'DELETE /students/{id}'],
                    'housing' => ['GET /housing', 'GET /housing/{id}', 'POST /housing', 'PUT /housing/{id}', 'DELETE /housing/{id}'],
                    'items' => ['GET /items', 'GET /items/{id}', 'POST /items', 'PUT /items/{id}', 'DELETE /items/{id}'],
                    'roommates' => ['GET /roommates', 'GET /roommates/{id}', 'POST /roommates', 'PUT /roommates/{id}', 'DELETE /roommates/{id}'],
                    'admin' => ['GET /admin/users', 'GET /admin/stats', 'PUT /admin/user-status', 'DELETE /admin/users']
                ]
            ]);
            return;
        }

        // Route to appropriate handler
        switch ($route) {
            case 'students':
                route_students($method, $segments);
                break;

            case 'housing':
                route_housing($method, $segments);
                break;

            case 'items':
                route_items($method, $segments);
                break;

            case 'roommates':
                route_roommates($method, $segments);
                break;

            case 'admin':
                route_admin($method, $segments);
                break;

            case 'auth':
                route_auth($method, $segments);
                break;

            default:
                Response::notFound('Endpoint not found');
        }

    } catch (Exception $e) {
        error_log("Router Error: " . $e->getMessage());

        if (isDevelopment()) {
            Response::serverError($e->getMessage());
        } else {
            Response::serverError('An error occurred while processing your request');
        }
    }
}

// Execute routing
route_request();
