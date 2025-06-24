import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import PropertyForm from '../../components/forms/PropertyForm';
import { useAuth } from '../../contexts/AuthContext';
import housingService from '../../services/housingService';

const AddPropertyPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debug: Log current user info
  console.log('AddPropertyPage - Current user:', user);
  console.log('AddPropertyPage - User role:', user?.role);
  console.log('AddPropertyPage - Token:', localStorage.getItem('token'));

  const handleSubmit = async (data: any) => {
    if (!user) {
      alert('Please login to add properties');
      navigate('/login');
      return;
    }

    // Check if user is an owner
    if (user.role !== 'owner') {
      setError(`Only property owners can create housing listings. Your current role is: ${user.role}`);
      alert(`Access denied: Only property owners can create housing listings.\nYour current role: ${user.role}\n\nPlease contact support if you need to become a property owner.`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Remove images from property creation payload
      const housingData = {
        title: data.title,
        description: data.description,
        address: data.address,
        city: data.city,
        price: parseFloat(data.price) || 0,
        type: data.type,
        bedrooms: parseInt(data.bedrooms) || 1,
        bathrooms: parseInt(data.bathrooms) || 1,
        area: parseFloat(data.area) || 0,
        available_from: data.available_from,
        available_to: data.available_to,
        is_furnished: data.is_furnished || false,
        amenities: Array.isArray(data.amenities) ? data.amenities.join(', ') : data.amenities || '',
        owner_id: user.id // Add owner_id as required by backend
      };

      console.log('Submitting property with data:', housingData);
      console.log('Property data JSON:', JSON.stringify(housingData, null, 2));

      const response = await housingService.create(housingData);
      console.log('Full response:', response);

      // After property creation, associate images
      if (response.success && response.data && data.imageUrls && data.imageUrls.length > 0) {
        const housingId = Number(response.data.id);
        console.log('Associating images with housing ID:', housingId);
        console.log('Image URLs to associate:', data.imageUrls);

        let successCount = 0;
        let errorCount = 0;

        for (const imageUrl of data.imageUrls) {
          try {
            console.log('Adding image:', imageUrl);
            const imageResponse = await (await import('../../services/housingImageService')).default.addImage({
              housing_id: housingId,
              path: imageUrl
            });
            console.log('Image association response:', imageResponse);
            successCount++;
          } catch (imgErr: any) {
            console.error('Failed to associate image:', imageUrl, imgErr);
            console.error('Image error details:', imgErr.response?.data);
            errorCount++;
          }
        }

        console.log(`Image association complete: ${successCount} success, ${errorCount} errors`);

        if (errorCount > 0) {
          alert(`Property created successfully!\nNote: ${errorCount} out of ${data.imageUrls.length} images failed to upload.`);
        }
      } else {
        console.log('No images to associate or property creation failed');
        console.log('Response success:', response.success);
        console.log('Response data:', response.data);
        console.log('Image URLs:', data.imageUrls);
      }

      if (response.success) {
        alert('Property listed successfully!');
        navigate('/dashboard');
      } else {
        console.error('Property creation failed:', response);
        setError(response.message || 'Failed to create property');
      }
    } catch (err: any) {
      console.error('Property creation error:', err);
      console.error('Error response:', err.response?.data);

      // Show detailed validation errors
      const errorData = err.response?.data;
      let errorMessage = 'Failed to create property';

      if (errorData) {
        console.log('Full error data:', errorData);
        console.log('Error data.data:', errorData.data);
        console.log('Error data.data.errors:', errorData.data?.errors);

        if (errorData.data && errorData.data.errors) {
          // Show validation errors
          const validationErrors = Object.entries(errorData.data.errors)
            .map(([field, error]) => `${field}: ${error}`)
            .join('\n');
          errorMessage = `Validation errors:\n${validationErrors}`;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }

        // Also log the raw error for debugging
        console.log('Raw error object:', JSON.stringify(errorData, null, 2));
      }

      setError(errorMessage);
      alert(`Error creating property:\n${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PropertyForm onSubmit={handleSubmit} loading={loading} />
    </div>
  );
};

export default AddPropertyPage;