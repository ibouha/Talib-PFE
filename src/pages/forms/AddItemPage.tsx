import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import ItemForm from '../../components/forms/ItemForm';
import { useAuth } from '../../contexts/AuthContext';
import itemsService from '../../services/itemsService';

const AddItemPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: any) => {
    if (!user) {
      alert('Please login to add items');
      navigate('/login');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const itemData = {
        title: data.title,
        description: data.description,
        price: data.is_free ? 0 : (parseFloat(data.price) || 0),
        category: data.category,
        condition_status: data.condition_status || 'good',
        is_free: data.is_free || false,
        location: data.location,
        // Note: Image URLs are uploaded separately by the form
        // The backend will need to be updated to handle image associations
        images: data.imageUrls || []
      };

      console.log('User data:', user);
      console.log('Submitting item with data:', itemData);
      console.log('Data being sent to API:', JSON.stringify(itemData, null, 2));

      const response = await itemsService.create(itemData);
      console.log('API Response:', response);

      if (response.success) {
        alert('Item listed successfully!');
        // Navigate to the items page to see the new item
        navigate('/items');
      } else {
        console.error('API Error Response:', response);
        setError(response.message || 'Failed to create item');
      }
    } catch (err: any) {
      console.error('Caught error:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });

      // Check if the error response indicates success despite the error
      if (err.response?.data?.success) {
        console.log('Operation succeeded despite error - redirecting');
        alert('Item listed successfully!');
        navigate('/items');
      } else {
        setError(err.response?.data?.message || err.message || 'Failed to create item');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}
      <ItemForm onSubmit={handleSubmit} loading={loading} />
    </div>
  );
};

export default AddItemPage;