import api, { API_ENDPOINTS, ApiResponse, PaginatedResponse, Favorite } from './api';

export interface FavoriteFilters {
  type?: 'Item' | 'Housing' | 'RoommateProfile';
  page?: number;
  limit?: number;
}

export interface AddFavoriteData {
  student_id: string;
  type: 'Item' | 'Housing' | 'RoommateProfile';
  item_id?: string;
  housing_id?: string;
  roommateProfile_id?: string;
}

export interface FavoriteStats {
  item_count: number;
  housing_count: number;
  roommateprofile_count: number;
  total_favorites: number;
}

class FavoritesService {
  async getAll(studentId: string, filters: FavoriteFilters = {}): Promise<ApiResponse<PaginatedResponse<Favorite>>> {
    const params = { ...filters };
    const response = await api.get(API_ENDPOINTS.FAVORITES.GET_ALL(studentId), { params });
    return response.data;
  }

  async add(favoriteData: AddFavoriteData): Promise<ApiResponse<Favorite>> {
    const response = await api.post(API_ENDPOINTS.FAVORITES.CREATE, favoriteData);
    return response.data;
  }

  async remove(id: string): Promise<ApiResponse<null>> {
    const response = await api.delete(API_ENDPOINTS.FAVORITES.DELETE(id));
    return response.data;
  }

  async getStats(studentId: string): Promise<ApiResponse<FavoriteStats>> {
    const response = await api.get(API_ENDPOINTS.FAVORITES.STATS(studentId));
    return response.data;
  }

  async checkFavorited(studentId: string, type: string, itemId: string): Promise<ApiResponse<{ is_favorited: boolean }>> {
    const response = await api.get(API_ENDPOINTS.FAVORITES.CHECK(studentId, type, itemId));
    return response.data;
  }

  // Helper methods for specific types
  async getItemFavorites(studentId: string, limit: number = 20): Promise<ApiResponse<PaginatedResponse<Favorite>>> {
    return this.getAll(studentId, { type: 'Item', limit });
  }

  async getHousingFavorites(studentId: string, limit: number = 20): Promise<ApiResponse<PaginatedResponse<Favorite>>> {
    return this.getAll(studentId, { type: 'Housing', limit });
  }

  async getRoommateFavorites(studentId: string, limit: number = 20): Promise<ApiResponse<PaginatedResponse<Favorite>>> {
    return this.getAll(studentId, { type: 'RoommateProfile', limit });
  }

  // Add specific item types to favorites
  async addItemToFavorites(studentId: string, itemId: string): Promise<ApiResponse<Favorite>> {
    return this.add({
      student_id: studentId,
      type: 'Item',
      item_id: itemId
    });
  }

  async addHousingToFavorites(studentId: string, housingId: string): Promise<ApiResponse<Favorite>> {
    return this.add({
      student_id: studentId,
      type: 'Housing',
      housing_id: housingId
    });
  }

  async addRoommateToFavorites(studentId: string, roommateProfileId: string): Promise<ApiResponse<Favorite>> {
    return this.add({
      student_id: studentId,
      type: 'RoommateProfile',
      roommateProfile_id: roommateProfileId
    });
  }

  // Check if specific items are favorited
  async isItemFavorited(studentId: string, itemId: string): Promise<boolean> {
    try {
      const response = await this.checkFavorited(studentId, 'Item', itemId);
      return response.data.is_favorited;
    } catch (error) {
      return false;
    }
  }

  async isHousingFavorited(studentId: string, housingId: string): Promise<boolean> {
    try {
      const response = await this.checkFavorited(studentId, 'Housing', housingId);
      return response.data.is_favorited;
    } catch (error) {
      return false;
    }
  }

  async isRoommateFavorited(studentId: string, roommateProfileId: string): Promise<boolean> {
    try {
      const response = await this.checkFavorited(studentId, 'RoommateProfile', roommateProfileId);
      return response.data.is_favorited;
    } catch (error) {
      return false;
    }
  }
}

export const favoritesService = new FavoritesService();
export default favoritesService;
