import api, { ApiResponse } from './api';

export interface AddHousingImageData {
  housing_id: number;
  path: string;
}

class HousingImageService {
  async addImage(data: AddHousingImageData): Promise<ApiResponse<null>> {
    // Assumes you have an endpoint like /api/endpoints/housingimage.php
    const response = await api.post('/endpoints/housingimage.php', data);
    return response.data;
  }
}

export default new HousingImageService();
