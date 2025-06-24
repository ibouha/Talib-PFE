import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { ShoppingBag, DollarSign, Upload, X, Plus } from 'lucide-react';
import imageService from '../../services/imageService';
// Moroccan cities list
const moroccanCities = [
  'Casablanca', 'Rabat', 'Marrakech', 'Fes', 'Tangier', 'Agadir',
  'Meknes', 'Oujda', 'Kenitra', 'Tetouan'
];

type ItemFormData = {
  title: string;
  description: string;
  price: number;
  category: string;
  condition_status: string;
  location: string;
  is_free: boolean;
  images: FileList;
};

interface ItemFormProps {
  onSubmit: (data: ItemFormData & { imageUrls?: string[] }) => void;
  initialData?: Partial<ItemFormData>;
  isEditing?: boolean;
  loading?: boolean;
}



const ItemForm = ({ onSubmit, initialData, isEditing = false, loading = false }: ItemFormProps) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<ItemFormData>({
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      price: initialData?.price || 0,
      category: initialData?.category || 'textbooks',
      condition_status: initialData?.condition_status || 'good',
      location: initialData?.location || '',
      is_free: initialData?.is_free || false
    }
  });

  // Watch the is_free field to disable price when checked
  const isFree = watch('is_free');

  // Reset price to 0 when item is marked as free
  useEffect(() => {
    if (isFree) {
      setValue('price', 0);
    }
  }, [isFree, setValue]);

  const categories = [
    { value: 'textbooks', label: t('items.categories.textbooks') },
    { value: 'furniture', label: t('items.categories.furniture') },
    { value: 'electronics', label: t('items.categories.electronics') },
    { value: 'clothing', label: t('items.categories.clothing') },
    { value: 'kitchenware', label: t('items.categories.kitchenware') },
    { value: 'other', label: t('items.categories.other') }
  ];

  const conditions = [
    { value: 'new', label: t('items.conditions.new') },
    { value: 'like_new', label: t('items.conditions.likeNew') },
    { value: 'good', label: t('items.conditions.good') },
    { value: 'fair', label: t('items.conditions.fair') },
    { value: 'poor', label: t('items.conditions.poor') }
  ];

  const handleFormSubmit = async (data: ItemFormData) => {
    setIsLoading(true);
    setUploadingImages(true);

    try {
      let imageUrls: string[] = [];

      // Upload images if any are selected
      if (data.images && data.images.length > 0) {
        const imageFiles = Array.from(data.images);

        // Validate images
        const validation = imageService.validateImages(imageFiles);
        if (!validation.valid) {
          alert('Image validation failed:\n' + validation.errors.join('\n'));
          return;
        }

        // Upload images
        const uploadResults = await imageService.uploadImages(imageFiles, 'item');

        // Check for upload failures
        const failedUploads = uploadResults.filter(result => !result.success);
        if (failedUploads.length > 0) {
          alert('Some images failed to upload:\n' + failedUploads.map(r => r.message).join('\n'));
        }

        // Get successful upload URLs
        imageUrls = uploadResults
          .filter(result => result.success && result.data)
          .map(result => result.data!.url);

        setUploadedImages(imageUrls);
      }

      // Submit form data with image URLs
      // Ensure price is 0 if item is free
      const formData = {
        ...data,
        price: data.is_free ? 0 : data.price,
        imageUrls
      };

      console.log('Final form data being submitted:', formData);
      await onSubmit(formData);

    } catch (error: any) {
      console.error('Form submission error:', error);
      alert('Failed to submit form: ' + (error.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
      setUploadingImages(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // Validate images first
      const validation = imageService.validateImages(files);
      if (!validation.valid) {
        alert('Image validation failed:\n' + validation.errors.join('\n'));
        e.target.value = ''; // Clear the input
        return;
      }

      // Generate previews
      const previews: string[] = [];
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            previews.push(e.target.result as string);
            if (previews.length === files.length) {
              setImagePreview(previews);
            }
          }
        };
        reader.readAsDataURL(file);
      });
    } else {
      setImagePreview([]);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm p-8">
        <div className="flex items-center mb-8">
          <div className="h-12 w-12 rounded-full bg-accent-100 flex items-center justify-center mr-4">
            <ShoppingBag className="h-6 w-6 text-accent-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {isEditing ? 'Edit Item' : 'List New Item'}
            </h1>
            <p className="text-gray-600">
              {isEditing ? 'Update your item details' : 'Sell or exchange your item with other students'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Item Title *
            </label>
            <input
              type="text"
              {...register('title', { required: 'Title is required' })}
              className="form-input"
              placeholder="e.g., Economics Textbook - 3rd Edition"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-error-600">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              {...register('description', { required: 'Description is required' })}
              rows={4}
              className="form-input"
              placeholder="Describe your item, its condition, and any important details..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-error-600">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price (MAD) {!isFree && '*'}
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  {...register('price', {
                    required: !isFree ? 'Price is required' : false,
                    min: 0,
                    valueAsNumber: true
                  })}
                  className={`form-input pl-10 ${isFree ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  placeholder={isFree ? "0 (Free item)" : "150"}
                  disabled={isFree}
                  defaultValue={isFree ? 0 : undefined}
                />
              </div>
              {errors.price && !isFree && (
                <p className="mt-1 text-sm text-error-600">{errors.price.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <select
                {...register('location', { required: 'Location is required' })}
                className="form-input"
              >
                <option value="">Select City</option>
                {moroccanCities.map((city, index) => (
                  <option key={index} value={city}>
                    {city}
                  </option>
                ))}
              </select>
              {errors.location && (
                <p className="mt-1 text-sm text-error-600">{errors.location.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                {...register('category', { required: 'Category is required' })}
                className="form-input"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-error-600">{errors.category.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Condition *
              </label>
              <select
                {...register('condition_status', { required: 'Condition is required' })}
                className="form-input"
              >
                {conditions.map(condition => (
                  <option key={condition.value} value={condition.value}>
                    {condition.label}
                  </option>
                ))}
              </select>
              {errors.condition_status && (
                <p className="mt-1 text-sm text-error-600">{errors.condition_status.message}</p>
              )}
            </div>
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Item Images
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <label htmlFor="images" className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      Upload item images
                    </span>
                    <span className="mt-1 block text-sm text-gray-500">
                      PNG, JPG, GIF up to 10MB each
                    </span>
                  </label>
                  <input
                    id="images"
                    type="file"
                    multiple
                    accept="image/*"
                    {...register('images')}
                    onChange={handleImageChange}
                    className="sr-only"
                  />
                </div>
              </div>
            </div>

            {imagePreview.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                {imagePreview.map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="h-24 w-full object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setImagePreview(prev => prev.filter((_, i) => i !== index))}
                      className="absolute -top-2 -right-2 bg-error-500 text-white rounded-full p-1 hover:bg-error-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Free Item */}
          <div className="flex items-center">
            <input
              type="checkbox"
              {...register('is_free')}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700">
              This item is free (no payment required)
            </label>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              className="btn border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || uploadingImages}
              className="btn-primary flex items-center"
            >
              {isLoading || uploadingImages ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {uploadingImages ? 'Uploading images...' :
                   isEditing ? 'Updating...' : 'Publishing...'}
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  {isEditing ? 'Update Item' : 'List Item'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ItemForm;