import api from './api';
import { ApiResponse } from './api';

export interface UpdateProfileData {
  name?: string;
  phone?: string;
  university?: string;
  bio?: string;
  gender?: string;
  date_of_birth?: string;
  image?: string;
}

export interface ProfileData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  university?: string;
  bio?: string;
  gender?: string;
  date_of_birth?: string;
  image?: string;
  role: string;
  created_at: string;
  updated_at: string;
}

class ProfileService {
  // Update student profile
  async updateStudentProfile(id: string, profileData: UpdateProfileData): Promise<ApiResponse<ProfileData>> {
    const response = await api.put(`/endpoints/students.php?id=${id}`, profileData);
    return response.data;
  }

  // Update owner profile
  async updateOwnerProfile(id: string, profileData: UpdateProfileData): Promise<ApiResponse<ProfileData>> {
    const response = await api.put(`/endpoints/owners.php?id=${id}`, profileData);
    return response.data;
  }

  // Get student profile
  async getStudentProfile(id: string): Promise<ApiResponse<ProfileData>> {
    const response = await api.get(`/endpoints/students.php?id=${id}`);
    return response.data;
  }

  // Get owner profile
  async getOwnerProfile(id: string): Promise<ApiResponse<ProfileData>> {
    const response = await api.get(`/endpoints/owners.php?id=${id}`);
    return response.data;
  }

  // Upload profile image
  async uploadProfileImage(file: File): Promise<ApiResponse<{ url: string; filename: string }>> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await api.post('/upload_profile_image.php', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Update profile based on user role
  async updateProfile(userId: string, userRole: string, profileData: UpdateProfileData): Promise<ApiResponse<ProfileData>> {
    if (userRole === 'student') {
      return this.updateStudentProfile(userId, profileData);
    } else if (userRole === 'owner') {
      return this.updateOwnerProfile(userId, profileData);
    } else {
      throw new Error('Profile updates not supported for admin users');
    }
  }

  // Get profile based on user role
  async getProfile(userId: string, userRole: string): Promise<ApiResponse<ProfileData>> {
    if (userRole === 'student') {
      return this.getStudentProfile(userId);
    } else if (userRole === 'owner') {
      return this.getOwnerProfile(userId);
    } else {
      throw new Error('Profile retrieval not supported for admin users');
    }
  }
}

export default new ProfileService();
