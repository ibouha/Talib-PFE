import api, { ApiResponse } from './api';

export interface ImageUploadResponse {
  success: boolean;
  data?: {
    filename: string;
    path: string;
    url: string;
  };
  message?: string;
}

class ImageService {
  /**
   * Upload a single image
   */
  async uploadImage(file: File, type: 'item' | 'housing' | 'profile' = 'item'): Promise<ImageUploadResponse> {
    try {
      console.log(`Uploading file: ${file.name}, size: ${file.size}, type: ${file.type}`);

      const formData = new FormData();
      formData.append('image', file);
      formData.append('type', type);

      const response = await api.post('/upload_image.php', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log(`Upload response for ${file.name}:`, response.data);
      return response.data;
    } catch (error: any) {
      console.error(`Upload error for ${file.name}:`, error);
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });

      const errorMessage = error.response?.data?.message ||
                          error.response?.statusText ||
                          error.message ||
                          'Failed to upload image';

      return {
        success: false,
        message: `${file.name}: ${errorMessage}`
      };
    }
  }

  /**
   * Upload multiple images
   */
  async uploadImages(files: File[], type: 'item' | 'housing' | 'profile' = 'item'): Promise<ImageUploadResponse[]> {
    const uploadPromises = Array.from(files).map(file => this.uploadImage(file, type));
    return Promise.all(uploadPromises);
  }

  /**
   * Delete an image
   */
  async deleteImage(filename: string): Promise<ApiResponse<null>> {
    try {
      const response = await api.delete(`/delete_image.php?filename=${encodeURIComponent(filename)}`);
      return response.data;
    } catch (error: any) {
      console.error('Image delete error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete image'
      };
    }
  }

  /**
   * Get image URL
   */
  getImageUrl(filename: string): string {
    if (!filename) return '';
    
    // If it's already a full URL, return as is
    if (filename.startsWith('http')) {
      return filename;
    }
    
    // Construct URL from filename
    return `${api.defaults.baseURL}/uploads/${filename}`;
  }

  /**
   * Validate image file
   */
  validateImage(file: File): { valid: boolean; error?: string } {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Invalid file type. Please upload JPG, PNG, GIF, or WebP images.'
      };
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'File size too large. Please upload images smaller than 5MB.'
      };
    }

    return { valid: true };
  }

  /**
   * Validate multiple images
   */
  validateImages(files: FileList | File[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const fileArray = Array.from(files);

    if (fileArray.length > 10) {
      errors.push('Too many files. Maximum 10 images allowed.');
    }

    fileArray.forEach((file, index) => {
      const validation = this.validateImage(file);
      if (!validation.valid) {
        errors.push(`File ${index + 1}: ${validation.error}`);
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

export default new ImageService();
