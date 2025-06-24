import api, { API_ENDPOINTS, ApiResponse, PaginatedResponse, RoommateProfile } from './api';

export interface RoommateFilters {
  budget_min?: number;
  budget_max?: number;
  location?: string;
  university?: string;
  duration?: string;
  move_in_from?: string;
  move_in_to?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// Updated interface to match the backend schema
export interface CreateRoommateData {
  student_id: string;
  name: string;
  age: number;
  gender: string;
  university: string;
  program: string;
  year: number;
  bio: string;
  interests?: string[];
  lifestyle?: string[];
  preferences?: {
    smoking: boolean;
    pets: boolean;
    gender: string;
    studyHabits: string;
  };
  budget: number;
  lookingFor: string;
  location: string;
  avatar?: File | null;
}

export interface UpdateRoommateData extends Partial<Omit<CreateRoommateData, 'student_id'>> {}

class RoommateService {
  async getAll(filters: RoommateFilters = {}): Promise<ApiResponse<PaginatedResponse<RoommateProfile>>> {
    const response = await api.get(API_ENDPOINTS.ROOMMATES.GET_ALL, { params: filters });
    return response.data;
  }

  async getById(id: string): Promise<ApiResponse<RoommateProfile>> {
    const response = await api.get(API_ENDPOINTS.ROOMMATES.GET_BY_ID(id));
    return response.data;
  }

  async create(roommateData: CreateRoommateData): Promise<ApiResponse<RoommateProfile>> {
    const response = await api.post(API_ENDPOINTS.ROOMMATES.CREATE, roommateData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  }

  // New method for handling FormData (with file uploads)
  async createWithFormData(formData: FormData): Promise<ApiResponse<RoommateProfile>> {
    const response = await api.post(API_ENDPOINTS.ROOMMATES.CREATE, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }

  async update(id: string, roommateData: UpdateRoommateData): Promise<ApiResponse<RoommateProfile>> {
    const response = await api.put(API_ENDPOINTS.ROOMMATES.UPDATE(id), roommateData);
    return response.data;
  }

  // New method for handling FormData updates (with file uploads)
  async updateWithFormData(id: string, formData: FormData): Promise<ApiResponse<RoommateProfile>> {
    const response = await api.put(API_ENDPOINTS.ROOMMATES.UPDATE(id), formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }

  async delete(id: string): Promise<ApiResponse<null>> {
    const response = await api.delete(API_ENDPOINTS.ROOMMATES.DELETE(id));
    return response.data;
  }

  async getByStudent(studentId: string): Promise<ApiResponse<RoommateProfile>> {
    const response = await api.get(API_ENDPOINTS.ROOMMATES.BY_STUDENT(studentId));
    return response.data;
  }

  async getCompatible(id: string, limit: number = 10): Promise<ApiResponse<RoommateProfile[]>> {
    const response = await api.get(API_ENDPOINTS.ROOMMATES.COMPATIBLE(id), { params: { limit } });
    return response.data;
  }

  // Helper methods for filtering
  async getByBudgetRange(budget_min: number, budget_max: number, limit: number = 20): Promise<ApiResponse<PaginatedResponse<RoommateProfile>>> {
    return this.getAll({ budget_min, budget_max, limit });
  }

  async getByLocation(location: string, limit: number = 20): Promise<ApiResponse<PaginatedResponse<RoommateProfile>>> {
    return this.getAll({ location, limit });
  }

  async getByUniversity(university: string, limit: number = 20): Promise<ApiResponse<PaginatedResponse<RoommateProfile>>> {
    return this.getAll({ university, limit });
  }

  async getByDuration(duration: string, limit: number = 20): Promise<ApiResponse<PaginatedResponse<RoommateProfile>>> {
    return this.getAll({ duration, limit });
  }

  async search(query: string, limit: number = 20): Promise<ApiResponse<PaginatedResponse<RoommateProfile>>> {
    return this.getAll({ search: query, limit });
  }

  // Get featured/recent roommate profiles
  async getFeatured(limit: number = 6): Promise<ApiResponse<PaginatedResponse<RoommateProfile>>> {
    return this.getAll({ limit, page: 1 });
  }

  // Get roommates moving in within a date range
  async getByMoveInDateRange(move_in_from: string, move_in_to: string, limit: number = 20): Promise<ApiResponse<PaginatedResponse<RoommateProfile>>> {
    return this.getAll({ move_in_from, move_in_to, limit });
  }
}

export const roommateService = new RoommateService();
export default roommateService;