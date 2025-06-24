import api, { API_ENDPOINTS, ApiResponse, PaginatedResponse, Item } from './api';

export interface ItemFilters {
  category?: string;
  condition_status?: string;
  is_free?: boolean;
  min_price?: number;
  max_price?: number;
  location?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateItemData {
  title: string;
  description: string;
  price: number;
  category: string;
  condition_status?: string;
  is_free: boolean;
  location: string;
}

export interface UpdateItemData extends Partial<CreateItemData> {
  status?: string;
}

class ItemsService {
  async getAll(filters: ItemFilters = {}): Promise<ApiResponse<PaginatedResponse<Item>>> {
    const response = await api.get(API_ENDPOINTS.ITEMS.GET_ALL, { params: filters });
    return response.data;
  }

  async getById(id: string): Promise<ApiResponse<Item>> {
    const response = await api.get(API_ENDPOINTS.ITEMS.GET_BY_ID(id));
    return response.data;
  }

  async create(itemData: CreateItemData): Promise<ApiResponse<Item>> {
    const response = await api.post(API_ENDPOINTS.ITEMS.CREATE, itemData);
    return response.data;
  }

  async update(id: string, itemData: UpdateItemData): Promise<ApiResponse<Item>> {
    const response = await api.put(API_ENDPOINTS.ITEMS.UPDATE(id), itemData);
    return response.data;
  }

  async delete(id: string): Promise<ApiResponse<null>> {
    const response = await api.delete(API_ENDPOINTS.ITEMS.DELETE(id));
    return response.data;
  }

  async getCategories(): Promise<ApiResponse<string[]>> {
    const response = await api.get(API_ENDPOINTS.ITEMS.CATEGORIES);
    return response.data;
  }

  // Helper methods for filtering
  async getByCategory(category: string, limit: number = 20): Promise<ApiResponse<PaginatedResponse<Item>>> {
    return this.getAll({ category, limit });
  }

  async getFreeItems(limit: number = 20): Promise<ApiResponse<PaginatedResponse<Item>>> {
    return this.getAll({ is_free: true, limit });
  }

  async getByLocation(location: string, limit: number = 20): Promise<ApiResponse<PaginatedResponse<Item>>> {
    return this.getAll({ location, limit });
  }

  async getByPriceRange(min_price: number, max_price: number, limit: number = 20): Promise<ApiResponse<PaginatedResponse<Item>>> {
    return this.getAll({ min_price, max_price, limit });
  }

  async search(query: string, limit: number = 20): Promise<ApiResponse<PaginatedResponse<Item>>> {
    return this.getAll({ search: query, limit });
  }

  // Get featured/recent items
  async getFeatured(limit: number = 6): Promise<ApiResponse<PaginatedResponse<Item>>> {
    return this.getAll({ limit, page: 1 });
  }

  // Get items by condition
  async getByCondition(condition: string, limit: number = 20): Promise<ApiResponse<PaginatedResponse<Item>>> {
    return this.getAll({ condition_status: condition, limit });
  }
}

export const itemsService = new ItemsService();
export default itemsService;
