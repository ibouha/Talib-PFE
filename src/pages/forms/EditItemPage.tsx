import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Loader } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import itemsService from '../../services/itemsService';
import { Item } from '../../services/api';
import ItemForm from '../../components/forms/ItemForm';

const EditItemPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [item, setItem] = useState<Item | null>(null);
  const [initialData, setInitialData] = useState<any>(null);

  useEffect(() => {
    if (id) {
      fetchItem();
    }
  }, [id]);

  const fetchItem = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await itemsService.getById(id!);
      
      if (response.success && response.data) {
        const itemData = response.data;
        
        // Check if current user owns this item
        const userId = (user as any)?.user_id || user?.id;
        if (itemData.student_id !== userId) {
          setError('You can only edit your own items');
          return;
        }
        
        setItem(itemData);
        
        // Prepare initial data for ItemForm
        setInitialData({
          title: itemData.title || '',
          description: itemData.description || '',
          price: itemData.price || 0,
          category: itemData.category || '',
          condition_status: itemData.condition_status || '',
          location: itemData.location || '',
          is_free: itemData.is_free || false,
          imageUrls: itemData.images || [] // Include existing images
        });
      } else {
        setError('Item not found');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load item');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      setSaving(true);
      setError(null);

      const updateData = {
        title: data.title,
        description: data.description,
        price: data.is_free ? 0 : parseFloat(data.price),
        category: data.category,
        condition_status: data.condition_status,
        location: data.location,
        is_free: data.is_free,
        images: data.imageUrls || []
      };

      const response = await itemsService.update(id!, updateData);
      
      if (response.success) {
        alert('Item updated successfully!');
        navigate('/dashboard/my-items');
      } else {
        setError(response.message || 'Failed to update item');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update item');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <Loader className="h-6 w-6 animate-spin text-primary-600" />
          <span>Loading item...</span>
        </div>
      </div>
    );
  }

  if (error && !item) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error</h3>
          <p className="text-red-700 mt-1">{error}</p>
          <button
            onClick={() => navigate('/dashboard/my-items')}
            className="mt-3 btn-outline text-red-700 border-red-300 hover:bg-red-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to My Items
          </button>
        </div>
      </div>
    );
  }

  if (!initialData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <Loader className="h-6 w-6 animate-spin text-primary-600" />
          <span>Preparing form...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/dashboard/my-items')}
            className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Item</h1>
            <p className="text-gray-600">Update your item listing</p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* ItemForm Component with Image Upload */}
      <ItemForm 
        onSubmit={handleSubmit}
        initialData={initialData}
        isEditing={true}
        loading={saving}
        submitButtonText="Update Item"
      />
    </div>
  );
};

export default EditItemPage;
