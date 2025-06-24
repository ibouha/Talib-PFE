import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { Building, MapPin, DollarSign, Home, Upload, X, Plus } from 'lucide-react';
import imageService from '../../services/imageService';
// Moroccan cities list
const moroccanCities = [
  'Casablanca', 'Rabat', 'Marrakech', 'Fes', 'Tangier', 'Agadir',
  'Meknes', 'Oujda', 'Kenitra', 'Tetouan'
];

type PropertyFormData = {
  title: string;
  description: string;
  price: number;
  city: string;
  address: string;
  type: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  is_furnished: boolean;
  amenities: string[];
  images: FileList;
  available_from: string;
  available_to: string;
};

interface PropertyFormProps {
  onSubmit: (data: PropertyFormData & { imageUrls?: string[] }) => void;
  initialData?: Partial<PropertyFormData>;
  isEditing?: boolean;
  loading?: boolean;
}

const PropertyForm = ({ onSubmit, initialData, isEditing = false, loading = false }: PropertyFormProps) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(initialData?.amenities || []);
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  const { 
    register, 
    handleSubmit, 
    watch,
    formState: { errors } 
  } = useForm<PropertyFormData>({
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      price: initialData?.price || 0,
      city: initialData?.city || '',
      address: initialData?.address || '',
      type: initialData?.type || 'apartment',
      bedrooms: initialData?.bedrooms || 1,
      bathrooms: initialData?.bathrooms || 1,
      area: initialData?.area || 0,
      is_furnished: false,
      available_from: new Date().toISOString().split('T')[0], // Today's date
      available_to: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // One year from today
    }
  });

  const propertyTypes = [
    { value: 'apartment', label: t('housing.types.apartment') },
    { value: 'house', label: t('housing.types.house') },
    { value: 'studio', label: t('housing.types.studio') },
    { value: 'dormitory', label: t('housing.types.dormitory') },
    { value: 'shared', label: t('housing.types.shared') }
  ];

  const availableAmenities = [
    'WiFi', 'Air Conditioning', 'Heating', 'Washing Machine', 'Dryer',
    'Refrigerator', 'Microwave', 'Dishwasher', 'TV', 'Balcony',
    'Garden', 'Parking', 'Elevator', 'Security', 'Gym Access',
    'Pool', 'Study Room', 'Laundry Room', 'Kitchen', 'Furnished'
  ];

  const handleFormSubmit = async (data: PropertyFormData) => {
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
        const uploadResults = await imageService.uploadImages(imageFiles, 'housing');

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

      // Submit form data with image URLs and amenities
      const formData = {
        ...data,
        amenities: selectedAmenities,
        imageUrls
      };

      await onSubmit(formData);

    } catch (error: any) {
      console.error('Form submission error:', error);
      alert('Failed to submit form: ' + (error.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
      setUploadingImages(false);
    }
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity)
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
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
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm p-8">
        <div className="flex items-center mb-8">
          <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center mr-4">
            <Building className="h-6 w-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {isEditing ? 'Edit Property' : 'Add New Property'}
            </h1>
            <p className="text-gray-600">
              {isEditing ? 'Update your property details' : 'List your property for students'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
          {/* Basic Information */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Title *
                </label>
                <input
                  type="text"
                  {...register('title', { required: 'Title is required' })}
                  className="form-input"
                  placeholder="e.g., Modern Studio Near University"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-error-600">{errors.title.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  {...register('description', { required: 'Description is required' })}
                  rows={4}
                  className="form-input"
                  placeholder="Describe your property, its features, and what makes it special..."
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-error-600">{errors.description.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monthly Rent (MAD) *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    {...register('price', { required: 'Price is required', min: 1 })}
                    className="form-input pl-10"
                    placeholder="2500"
                  />
                </div>
                {errors.price && (
                  <p className="mt-1 text-sm text-error-600">{errors.price.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Type *
                </label>
                <select
                  {...register('type', { required: 'Property type is required' })}
                  className="form-input"
                >
                  {propertyTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                {errors.type && (
                  <p className="mt-1 text-sm text-error-600">{errors.type.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Location</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <select
                  {...register('city', { required: 'City is required' })}
                  className="form-input"
                >
                  <option value="">Select City</option>
                  {moroccanCities.map((city, index) => (
                    <option key={index} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
                {errors.city && (
                  <p className="mt-1 text-sm text-error-600">{errors.city.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Address *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    {...register('address', { required: 'Address is required' })}
                    className="form-input pl-10"
                    placeholder="123 University Street, Agdal"
                  />
                </div>
                {errors.address && (
                  <p className="mt-1 text-sm text-error-600">{errors.address.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Property Details */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Property Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bedrooms *
                </label>
                <input
                  type="number"
                  {...register('bedrooms', { required: 'Bedrooms is required', min: 1 })}
                  className="form-input"
                  min="1"
                  max="10"
                />
                {errors.bedrooms && (
                  <p className="mt-1 text-sm text-error-600">{errors.bedrooms.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bathrooms *
                </label>
                <input
                  type="number"
                  {...register('bathrooms', { required: 'Bathrooms is required', min: 1 })}
                  className="form-input"
                  min="1"
                  max="10"
                />
                {errors.bathrooms && (
                  <p className="mt-1 text-sm text-error-600">{errors.bathrooms.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Area (m²) *
                </label>
                <div className="relative">
                  <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    {...register('area', { required: 'Area is required', min: 1 })}
                    className="form-input pl-10"
                    placeholder="50"
                  />
                </div>
                {errors.area && (
                  <p className="mt-1 text-sm text-error-600">{errors.area.message}</p>
                )}
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  {...register('is_furnished')}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Property is furnished
                </label>
              </div>
            </div>
          </div>

          {/* Availability */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Availability</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available From *
                </label>
                <input
                  type="date"
                  {...register('available_from', { required: 'Available from date is required' })}
                  className="form-input"
                />
                {errors.available_from && (
                  <p className="mt-1 text-sm text-error-600">{errors.available_from.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available To *
                </label>
                <input
                  type="date"
                  {...register('available_to', { required: 'Available to date is required' })}
                  className="form-input"
                />
                {errors.available_to && (
                  <p className="mt-1 text-sm text-error-600">{errors.available_to.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Amenities</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {availableAmenities.map(amenity => (
                <button
                  key={amenity}
                  type="button"
                  onClick={() => toggleAmenity(amenity)}
                  className={`p-3 text-sm rounded-lg border transition-colors ${
                    selectedAmenities.includes(amenity)
                      ? 'bg-primary-50 border-primary-500 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {amenity}
                </button>
              ))}
            </div>
          </div>

          {/* Images */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Property Images</h2>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <label htmlFor="images" className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      Upload property images
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
                  {isEditing ? 'Update Property' : 'Publish Property'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PropertyForm;