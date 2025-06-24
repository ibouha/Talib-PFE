<?php
/**
 * Report Model - Handles content reporting functionality
 */

require_once __DIR__ . '/BaseModel.php';

class Report extends BaseModel {
    protected $table = 'reports';

    /**
     * Create a new report
     */
    public function createReport($data) {
        // Validate required fields
        $required = ['reporter_id', 'reporter_type', 'content_type', 'content_id', 'reason'];
        foreach ($required as $field) {
            if (!isset($data[$field]) || $data[$field] === '') {
                throw new Exception("Field '$field' is required");
            }
        }

        // Validate enums
        $validReporterTypes = ['student', 'owner'];
        $validContentTypes = ['housing', 'item', 'roommate_profile', 'user'];
        $validReasons = [
            'Inappropriate content',
            'Fraudulent listing', 
            'Spam',
            'Fake profile',
            'Harassment',
            'Scam',
            'Duplicate listing',
            'Other'
        ];

        if (!in_array($data['reporter_type'], $validReporterTypes)) {
            throw new Exception("Invalid reporter type");
        }

        if (!in_array($data['content_type'], $validContentTypes)) {
            throw new Exception("Invalid content type");
        }

        if (!in_array($data['reason'], $validReasons)) {
            throw new Exception("Invalid report reason");
        }

        // Check if user already reported this content
        if ($this->hasUserReported($data['reporter_id'], $data['reporter_type'], $data['content_type'], $data['content_id'])) {
            throw new Exception("You have already reported this content");
        }

        $reportData = [
            'reporter_id' => (int)$data['reporter_id'],
            'reporter_type' => $data['reporter_type'],
            'content_type' => $data['content_type'],
            'content_id' => (int)$data['content_id'],
            'reason' => $data['reason'],
            'description' => isset($data['description']) ? trim($data['description']) : null,
            'status' => 'pending',
            'created_at' => date('Y-m-d H:i:s'),
            'updated_at' => date('Y-m-d H:i:s')
        ];

        return $this->create($reportData);
    }

    /**
     * Check if user has already reported this content
     */
    public function hasUserReported($reporterId, $reporterType, $contentType, $contentId) {
        $query = "SELECT COUNT(*) as count FROM {$this->table} 
                  WHERE reporter_id = :reporter_id 
                  AND reporter_type = :reporter_type 
                  AND content_type = :content_type 
                  AND content_id = :content_id";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':reporter_id', $reporterId);
        $stmt->bindParam(':reporter_type', $reporterType);
        $stmt->bindParam(':content_type', $contentType);
        $stmt->bindParam(':content_id', $contentId);
        $stmt->execute();
        
        return $stmt->fetch()['count'] > 0;
    }

    /**
     * Get all reports with content details for admin
     */
    public function getAllReportsWithDetails() {
        // First get basic reports with reporter info
        $query = "SELECT r.*,
                         CASE
                             WHEN r.reporter_type = 'student' THEN s.name
                             WHEN r.reporter_type = 'owner' THEN o.name
                         END as reporter_name,
                         CASE
                             WHEN r.reporter_type = 'student' THEN s.email
                             WHEN r.reporter_type = 'owner' THEN o.email
                         END as reporter_email
                  FROM {$this->table} r
                  LEFT JOIN student s ON r.reporter_type = 'student' AND r.reporter_id = s.id
                  LEFT JOIN owner o ON r.reporter_type = 'owner' AND r.reporter_id = o.id
                  ORDER BY r.created_at DESC";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $reports = $stmt->fetchAll();

        // Enhance each report with content details
        foreach ($reports as &$report) {
            $contentDetails = $this->getContentDetails($report['content_type'], $report['content_id']);
            $report['content_title'] = $contentDetails['title'] ?? 'Unknown Content';
            $report['content_price'] = $contentDetails['price'] ?? null;
            $report['content_location'] = $contentDetails['location'] ?? null;
        }

        return $reports;
    }

    /**
     * Get content details based on type and ID
     */
    private function getContentDetails($contentType, $contentId) {
        try {
            switch ($contentType) {
                case 'housing':
                    $stmt = $this->conn->prepare("SELECT title, price, CONCAT(address, ', ', city) as location FROM housing WHERE id = ?");
                    break;
                case 'item':
                    $stmt = $this->conn->prepare("SELECT title, price, location FROM item WHERE id = ?");
                    break;
                case 'roommate_profile':
                    $stmt = $this->conn->prepare("SELECT name as title, location FROM roommateprofile WHERE id = ?");
                    break;
                case 'user':
                    // Try both student and owner tables
                    $stmt = $this->conn->prepare("SELECT name as title FROM student WHERE id = ? UNION SELECT name as title FROM owner WHERE id = ?");
                    $stmt->execute([$contentId, $contentId]);
                    return $stmt->fetch() ?: ['title' => 'Unknown User'];
                default:
                    return ['title' => 'Unknown Content'];
            }

            $stmt->execute([$contentId]);
            return $stmt->fetch() ?: ['title' => 'Content Not Found'];

        } catch (Exception $e) {
            error_log("Error getting content details: " . $e->getMessage());
            return ['title' => 'Error Loading Content: ' . $e->getMessage()];
        }
    }

    /**
     * Update report status
     */
    public function updateStatus($id, $status, $adminNotes = null) {
        $validStatuses = ['pending', 'investigating', 'resolved', 'dismissed'];
        
        if (!in_array($status, $validStatuses)) {
            throw new Exception("Invalid status");
        }

        $data = [
            'status' => $status,
            'updated_at' => date('Y-m-d H:i:s')
        ];

        if ($adminNotes !== null) {
            $data['admin_notes'] = $adminNotes;
        }

        return $this->update($id, $data);
    }

    /**
     * Get report counts by status
     */
    public function getReportStats() {
        $query = "SELECT 
                    COUNT(*) as total_reports,
                    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_reports,
                    SUM(CASE WHEN status = 'investigating' THEN 1 ELSE 0 END) as investigating_reports,
                    SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved_reports,
                    SUM(CASE WHEN status = 'dismissed' THEN 1 ELSE 0 END) as dismissed_reports
                  FROM {$this->table}";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        
        return $stmt->fetch();
    }

    /**
     * Get reports count for specific content
     */
    public function getContentReportsCount($contentType, $contentId) {
        $query = "SELECT COUNT(*) as count FROM {$this->table} 
                  WHERE content_type = :content_type 
                  AND content_id = :content_id 
                  AND status != 'dismissed'";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':content_type', $contentType);
        $stmt->bindParam(':content_id', $contentId);
        $stmt->execute();
        
        return $stmt->fetch()['count'];
    }
}
