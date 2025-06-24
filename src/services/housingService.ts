import api, { API_ENDPOINTS, ApiResponse, PaginatedResponse, Housing } from './api';

export interface HousingFilters {
  city?: string;
  type?: string;
  min_price?: number;
  max_price?: number;
  bedrooms?: number;
  bathrooms?: number;
  is_furnished?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateHousingData {
  title: string;
  description: string;
  address: string;
  city: string;
  price: number;
  type: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  available_from: string;
  available_to: string;
  is_furnished: boolean;
  amenities: string;
  images?: string[]; // Array of image URLs
}

export interface UpdateHousingData extends Partial<CreateHousingData> {
  status?: string;
}

export interface ContactOwnerData {
  student_id: string;
  message: string;
}

class HousingService {
  async getAll(filters: HousingFilters = {}): Promise<ApiResponse<PaginatedResponse<Housing>>> {
    const response = await api.get(API_ENDPOINTS.HOUSING.GET_ALL, { params: filters });
    return response.data;
  }

  async getById(id: string): Promise<ApiResponse<Housing>> {
    const response = await api.get(API_ENDPOINTS.HOUSING.GET_BY_ID(id));
    return response.data;
  }

  async create(housingData: CreateHousingData): Promise<ApiResponse<Housing>> {
    console.log('Housing data being sent:', housingData);
    const response = await api.post(API_ENDPOINTS.HOUSING.CREATE, housingData);
    console.log('Housing creation response:', response.data);
    return response.data;
  }

  async update(id: string, housingData: UpdateHousingData): Promise<ApiResponse<Housing>> {
    const response = await api.put(API_ENDPOINTS.HOUSING.UPDATE(id), housingData);
    return response.data;
  }

  async delete(id: string): Promise<ApiResponse<null>> {
    const response = await api.delete(API_ENDPOINTS.HOUSING.DELETE(id));
    return response.data;
  }

  async contactOwner(id: string, contactData: ContactOwnerData): Promise<ApiResponse<any>> {
    const response = await api.post(API_ENDPOINTS.HOUSING.CONTACT(id), contactData);
    return response.data;
  }

  // Helper methods for filtering
  async getByCity(city: string, limit: number = 20): Promise<ApiResponse<PaginatedResponse<Housing>>> {
    return this.getAll({ city, limit });
  }

  async getByType(type: string, limit: number = 20): Promise<ApiResponse<PaginatedResponse<Housing>>> {
    return this.getAll({ type, limit });
  }

  async getByPriceRange(min_price: number, max_price: number, limit: number = 20): Promise<ApiResponse<PaginatedResponse<Housing>>> {
    return this.getAll({ min_price, max_price, limit });
  }

  async search(query: string, limit: number = 20): Promise<ApiResponse<PaginatedResponse<Housing>>> {
    return this.getAll({ search: query, limit });
  }

  // Get featured/recent housing
  async getFeatured(limit: number = 6): Promise<ApiResponse<PaginatedResponse<Housing>>> {
    return this.getAll({ limit, page: 1 });
  }
}

export const housingService = new HousingService();
export default housingService;
