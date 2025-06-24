<?php
/**
 * ReportController - Handles content reporting functionality
 */

require_once __DIR__ . '/../models/Report.php';
require_once __DIR__ . '/../auth.php';
require_once __DIR__ . '/../utils/Response.php';

class ReportController {
    private $reportModel;

    public function __construct() {
        $this->reportModel = new Report();
    }

    /**
     * Create a new report
     */
    public function createReport() {
        try {
            // Authenticate user
            $currentUser = authenticateUser();
            
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($input['content_type']) || !isset($input['content_id']) || !isset($input['reason'])) {
                Response::error('content_type, content_id, and reason are required', 400);
            }

            // Add reporter info from authenticated user
            $input['reporter_id'] = $currentUser['user_id'];
            $input['reporter_type'] = $currentUser['role'];

            $reportId = $this->reportModel->createReport($input);

            if ($reportId) {
                Response::success(['report_id' => $reportId], 'Report submitted successfully');
            } else {
                Response::serverError('Failed to create report');
            }

        } catch (Exception $e) {
            Response::error($e->getMessage(), 400);
        }
    }

    /**
     * Get all reports for admin
     */
    public function getAllReports() {
        try {
            // Authenticate admin
            $currentUser = authenticateUser();
            if ($currentUser['role'] !== 'admin') {
                Response::forbidden('Admin access required');
            }

            $reports = $this->reportModel->getAllReportsWithDetails();
            Response::success($reports, 'Reports retrieved successfully');

        } catch (Exception $e) {
            Response::serverError($e->getMessage());
        }
    }

    /**
     * Update report status (admin only)
     */
    public function updateReportStatus() {
        try {
            // Authenticate admin
            $currentUser = authenticateUser();
            if ($currentUser['role'] !== 'admin') {
                Response::forbidden('Admin access required');
            }

            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($input['report_id']) || !isset($input['status'])) {
                Response::error('report_id and status are required', 400);
            }

            $success = $this->reportModel->updateStatus(
                $input['report_id'], 
                $input['status'], 
                isset($input['admin_notes']) ? $input['admin_notes'] : null
            );

            if ($success) {
                Response::success(null, 'Report status updated successfully');
            } else {
                Response::serverError('Failed to update report status');
            }

        } catch (Exception $e) {
            Response::error($e->getMessage(), 400);
        }
    }

    /**
     * Get report statistics (admin only)
     */
    public function getReportStats() {
        try {
            // Authenticate admin
            $currentUser = authenticateUser();
            if ($currentUser['role'] !== 'admin') {
                Response::forbidden('Admin access required');
            }

            $stats = $this->reportModel->getReportStats();
            Response::success($stats, 'Report statistics retrieved successfully');

        } catch (Exception $e) {
            Response::serverError($e->getMessage());
        }
    }

    /**
     * Check if user has reported content
     */
    public function checkUserReport() {
        try {
            // Authenticate user
            $currentUser = authenticateUser();
            
            $contentType = $_GET['content_type'] ?? null;
            $contentId = $_GET['content_id'] ?? null;

            if (!$contentType || !$contentId) {
                Response::error('content_type and content_id are required', 400);
            }

            $hasReported = $this->reportModel->hasUserReported(
                $currentUser['user_id'],
                $currentUser['role'],
                $contentType,
                $contentId
            );

            Response::success(['has_reported' => $hasReported], 'Report status checked');

        } catch (Exception $e) {
            Response::serverError($e->getMessage());
        }
    }

    /**
     * Get content reports count
     */
    public function getContentReportsCount() {
        try {
            $contentType = $_GET['content_type'] ?? null;
            $contentId = $_GET['content_id'] ?? null;

            if (!$contentType || !$contentId) {
                Response::error('content_type and content_id are required', 400);
            }

            $count = $this->reportModel->getContentReportsCount($contentType, $contentId);
            Response::success(['reports_count' => $count], 'Reports count retrieved');

        } catch (Exception $e) {
            Response::serverError($e->getMessage());
        }
    }
}
?>
