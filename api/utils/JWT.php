<?php

// Simple JWT functions

function base64UrlEncode($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function base64UrlDecode($data) {
    return base64_decode(str_pad(strtr($data, '-_', '+/'), strlen($data) % 4, '=', STR_PAD_RIGHT));
}

function createJWT($payload) {
    global $jwt_secret, $jwt_expiration;

    $header = json_encode(array('typ' => 'JWT', 'alg' => 'HS256'));
    $payload['exp'] = time() + $jwt_expiration;
    $payload['iat'] = time();
    $payload = json_encode($payload);

    $headerEncoded = base64UrlEncode($header);
    $payloadEncoded = base64UrlEncode($payload);

    $signature = hash_hmac('sha256', $headerEncoded . "." . $payloadEncoded, $jwt_secret, true);
    $signatureEncoded = base64UrlEncode($signature);

    return $headerEncoded . "." . $payloadEncoded . "." . $signatureEncoded;
}

function decodeJWT($jwt) {
    global $jwt_secret;

    $parts = explode('.', $jwt);

    if (count($parts) !== 3) {
        throw new Exception('Invalid token format');
    }

    list($headerEncoded, $payloadEncoded, $signatureEncoded) = $parts;

    $header = json_decode(base64UrlDecode($headerEncoded), true);
    $payload = json_decode(base64UrlDecode($payloadEncoded), true);
    $signature = base64UrlDecode($signatureEncoded);

    // Verify signature
    $expectedSignature = hash_hmac('sha256', $headerEncoded . "." . $payloadEncoded, $jwt_secret, true);

    if (!hash_equals($signature, $expectedSignature)) {
        throw new Exception('Invalid token signature');
    }

    // Check expiration
    if (isset($payload['exp']) && $payload['exp'] < time()) {
        throw new Exception('Token has expired');
    }

    return $payload;
}

function validateJWT($jwt) {
    try {
        decodeJWT($jwt);
        return true;
    } catch (Exception $e) {
        return false;
    }
}

function getUserFromToken($jwt) {
    try {
        $payload = decodeJWT($jwt);
        return array(
            'id' => $payload['user_id'],
            'email' => $payload['email'],
            'role' => $payload['role']
        );
    } catch (Exception $e) {
        return null;
    }
}

// Keep the old class for backward compatibility
class JWT {
    public static function encode($payload) {
        return createJWT($payload);
    }

    public static function decode($jwt) {
        return decodeJWT($jwt);
    }

    public static function validate($jwt) {
        return validateJWT($jwt);
    }

    public static function getUserFromToken($jwt) {
        return getUserFromToken($jwt);
    }
}
