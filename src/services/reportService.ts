import api from './api';
import { ApiResponse } from './api';

export interface Report {
  id: string;
  reporter_id: string;
  reporter_type: 'student' | 'owner';
  reporter_name: string;
  reporter_email: string;
  content_type: 'housing' | 'item' | 'roommate_profile' | 'user';
  content_id: string;
  content_title: string;
  content_price?: number;
  content_location?: string;
  reason: string;
  description?: string;
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ReportStats {
  total_reports: number;
  pending_reports: number;
  investigating_reports: number;
  resolved_reports: number;
  dismissed_reports: number;
}

export interface CreateReportData {
  content_type: 'housing' | 'item' | 'roommate_profile' | 'user';
  content_id: string;
  reason: string;
  description?: string;
}

class ReportService {
  /**
   * Create a new report
   */
  async createReport(data: CreateReportData): Promise<ApiResponse<{ report_id: string }>> {
    const response = await api.post('/endpoints/reports.php', data);
    return response.data;
  }

  /**
   * Get all reports (admin only)
   */
  async getAllReports(): Promise<ApiResponse<Report[]>> {
    const response = await api.get('/endpoints/reports.php?action=all');
    return response.data;
  }

  /**
   * Update report status (admin only)
   */
  async updateReportStatus(reportId: string, status: string, adminNotes?: string): Promise<ApiResponse<null>> {
    const response = await api.put('/endpoints/reports.php?action=status', {
      report_id: reportId,
      status: status,
      admin_notes: adminNotes
    });
    return response.data;
  }

  /**
   * Get report statistics (admin only)
   */
  async getReportStats(): Promise<ApiResponse<ReportStats>> {
    const response = await api.get('/endpoints/reports.php?action=stats');
    return response.data;
  }

  /**
   * Check if current user has reported content
   */
  async checkUserReport(contentType: string, contentId: string): Promise<ApiResponse<{ has_reported: boolean }>> {
    const response = await api.get(`/endpoints/reports.php?action=check&content_type=${contentType}&content_id=${contentId}`);
    return response.data;
  }

  /**
   * Get reports count for content
   */
  async getContentReportsCount(contentType: string, contentId: string): Promise<ApiResponse<{ reports_count: number }>> {
    const response = await api.get(`/endpoints/reports.php?action=count&content_type=${contentType}&content_id=${contentId}`);
    return response.data;
  }

  /**
   * Get available report reasons
   */
  getReportReasons(): string[] {
    return [
      'Inappropriate content',
      'Fraudulent listing',
      'Spam',
      'Fake profile',
      'Harassment',
      'Scam',
      'Duplicate listing',
      'Other'
    ];
  }
}

export default new ReportService();
