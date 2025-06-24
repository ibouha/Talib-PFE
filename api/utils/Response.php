<?php

// Simple response functions

function sendResponse($data, $statusCode = 200, $message = null) {
    http_response_code($statusCode);
    header('Content-Type: application/json');

    $response = array(
        'success' => $statusCode >= 200 && $statusCode < 300,
        'status_code' => $statusCode,
        'data' => $data
    );

    if ($message) {
        $response['message'] = $message;
    }

    echo json_encode($response);
    exit;
}

function sendSuccess($data = null, $message = null, $statusCode = 200) {
    sendResponse($data, $statusCode, $message);
}

function sendError($message, $statusCode = 400, $data = null) {
    sendResponse($data, $statusCode, $message);
}

function sendValidationError($errors, $message = 'Validation failed') {
    sendResponse(array('errors' => $errors), 422, $message);
}

function sendUnauthorized($message = 'Unauthorized') {
    sendResponse(null, 401, $message);
}

function sendForbidden($message = 'Forbidden') {
    sendResponse(null, 403, $message);
}

function sendNotFound($message = 'Resource not found') {
    sendResponse(null, 404, $message);
}

function sendServerError($message = 'Internal server error') {
    sendResponse(null, 500, $message);
}

function sendCreated($data = null, $message = 'Resource created successfully') {
    sendResponse($data, 201, $message);
}

function sendPaginated($data, $pagination, $message = null) {
    $response = array(
        'data' => $data,
        'pagination' => $pagination
    );

    sendSuccess($response, $message);
}

// Keep the old class for backward compatibility
class Response {
    public static function json($data, $statusCode = 200, $message = null) {
        sendResponse($data, $statusCode, $message);
    }

    public static function success($data = null, $message = null, $statusCode = 200) {
        sendSuccess($data, $message, $statusCode);
    }

    public static function error($message, $statusCode = 400, $data = null) {
        sendError($message, $statusCode, $data);
    }

    public static function validationError($errors, $message = 'Validation failed') {
        sendValidationError($errors, $message);
    }

    public static function unauthorized($message = 'Unauthorized') {
        sendUnauthorized($message);
    }

    public static function forbidden($message = 'Forbidden') {
        sendForbidden($message);
    }

    public static function notFound($message = 'Resource not found') {
        sendNotFound($message);
    }

    public static function serverError($message = 'Internal server error') {
        sendServerError($message);
    }

    public static function created($data = null, $message = 'Resource created successfully') {
        sendCreated($data, $message);
    }

    public static function paginated($data, $pagination, $message = null) {
        sendPaginated($data, $pagination, $message);
    }
}
