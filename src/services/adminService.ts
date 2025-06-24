import api from './api';
import { ApiResponse } from './api';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  university?: string;
  status: 'verified' | 'not_verified';
  role: 'student' | 'owner';
  created_at: string;
  updated_at: string;
  image?: string;
}

export interface UserStats {
  total_students: number;
  verified_students: number;
  total_owners: number;
  verified_owners: number;
  total_users: number;
  total_verified: number;
  total_unverified: number;
}

export interface AdminOverviewStats {
  total_users: number;
  verified_users: number;
  active_listings: number;
  pending_reports: number;
  verification_rate: number;
}

export interface UserGrowthData {
  date: string;
  students: number;
  owners: number;
}

export interface RecentUser {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'owner';
  is_verified: boolean;
  university?: string;
  properties_count?: number;
  created_at: string;
}

export interface VerificationRequest {
  id: string;
  name: string;
  email: string;
  type: 'student' | 'owner';
  university?: string;
  created_at: string;
}

class AdminService {
  /**
   * Get all users for admin dashboard
   */
  async getAllUsers(): Promise<ApiResponse<AdminUser[]>> {
    const response = await api.get('/endpoints/admin_users.php?action=users');
    return response.data;
  }

  /**
   * Get user statistics
   */
  async getUserStats(): Promise<ApiResponse<UserStats>> {
    const response = await api.get('/endpoints/admin_users.php?action=stats');
    return response.data;
  }

  /**
   * Update user verification status
   */
  async updateUserStatus(userId: string, role: 'student' | 'owner', status: 'verified' | 'not_verified'): Promise<ApiResponse<null>> {
    const response = await api.put('/endpoints/admin_users.php?action=status', {
      user_id: userId,
      role: role,
      status: status
    });
    return response.data;
  }

  /**
   * Delete user account
   */
  async deleteUser(userId: string, role: 'student' | 'owner'): Promise<ApiResponse<null>> {
    const response = await api.delete('/endpoints/admin_users.php', {
      data: {
        user_id: userId,
        role: role
      }
    });
    return response.data;
  }

  /**
   * Verify user account
   */
  async verifyUser(userId: string, role: 'student' | 'owner'): Promise<ApiResponse<null>> {
    return this.updateUserStatus(userId, role, 'verified');
  }

  /**
   * Unverify user account
   */
  async unverifyUser(userId: string, role: 'student' | 'owner'): Promise<ApiResponse<null>> {
    return this.updateUserStatus(userId, role, 'not_verified');
  }

  // Dashboard Statistics Methods

  /**
   * Get overview statistics for admin dashboard
   */
  async getOverviewStats(): Promise<ApiResponse<AdminOverviewStats>> {
    const response = await api.get('/endpoints/admin-stats.php?action=overview');
    return response.data;
  }

  /**
   * Get user growth data for charts
   */
  async getUserGrowthData(): Promise<ApiResponse<UserGrowthData[]>> {
    const response = await api.get('/endpoints/admin-stats.php?action=user-growth');
    return response.data;
  }

  /**
   * Get recent users
   */
  async getRecentUsers(): Promise<ApiResponse<RecentUser[]>> {
    const response = await api.get('/endpoints/admin-stats.php?action=recent-users');
    return response.data;
  }

  /**
   * Get verification requests
   */
  async getVerificationRequests(): Promise<ApiResponse<VerificationRequest[]>> {
    const response = await api.get('/endpoints/admin-stats.php?action=verification-requests');
    return response.data;
  }
}

export default new AdminService();
