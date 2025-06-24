<?php
// Check what content exists in database
require_once __DIR__ . '/config/database.php';

try {
    $database = new Database();
    $conn = $database->getConnection();
    
    echo "=== HOUSING TABLE STRUCTURE ===\n";
    $stmt = $conn->prepare("DESCRIBE housing");
    $stmt->execute();
    $columns = $stmt->fetchAll();
    foreach ($columns as $col) {
        echo "Column: {$col['Field']}, Type: {$col['Type']}\n";
    }

    echo "\n=== HOUSING CONTENT ===\n";
    $stmt = $conn->prepare("SELECT id, title, price FROM housing LIMIT 5");
    $stmt->execute();
    $housing = $stmt->fetchAll();
    foreach ($housing as $h) {
        echo "ID: {$h['id']}, Title: {$h['title']}, Price: {$h['price']}\n";
    }

    echo "\n=== ITEM TABLE STRUCTURE ===\n";
    $stmt = $conn->prepare("DESCRIBE item");
    $stmt->execute();
    $columns = $stmt->fetchAll();
    foreach ($columns as $col) {
        echo "Column: {$col['Field']}, Type: {$col['Type']}\n";
    }

    echo "\n=== ITEM CONTENT ===\n";
    $stmt = $conn->prepare("SELECT id, title, price FROM item LIMIT 5");
    $stmt->execute();
    $items = $stmt->fetchAll();
    foreach ($items as $i) {
        echo "ID: {$i['id']}, Title: {$i['title']}, Price: {$i['price']}\n";
    }
    
    echo "\n=== REPORTS ===\n";
    $stmt = $conn->prepare("SELECT id, content_type, content_id, reason FROM reports");
    $stmt->execute();
    $reports = $stmt->fetchAll();
    foreach ($reports as $r) {
        echo "Report ID: {$r['id']}, Content Type: {$r['content_type']}, Content ID: {$r['content_id']}, Reason: {$r['reason']}\n";
    }

    echo "\n=== UPDATING REPORTS TO REFERENCE EXISTING CONTENT ===\n";
    // Update reports to reference existing content
    if (count($housing) > 0) {
        $housingId = $housing[0]['id'];
        $stmt = $conn->prepare("UPDATE reports SET content_id = ? WHERE content_type = 'housing'");
        $stmt->execute([$housingId]);
        echo "Updated housing reports to reference housing ID: $housingId\n";
    }

    if (count($items) > 0) {
        $itemId = $items[0]['id'];
        $stmt = $conn->prepare("UPDATE reports SET content_id = ? WHERE content_type = 'item'");
        $stmt->execute([$itemId]);
        echo "Updated item reports to reference item ID: $itemId\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
