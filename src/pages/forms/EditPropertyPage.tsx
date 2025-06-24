import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { Housing } from '../../services/api';
import housingService from '../../services/housingService';
import PropertyForm from '../../components/forms/PropertyForm';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const EditPropertyPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [property, setProperty] = useState<Housing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch property data
  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const response = await housingService.getById(id);

        if (response.success) {
          setProperty(response.data);
        } else {
          setError(response.message || 'Property not found');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch property');
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" color="primary" />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Property Not Found</h1>
        <p className="text-gray-600 mb-6">{error || "The property you're trying to edit doesn't exist."}</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="btn-primary"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const handleSubmit = async (data: any) => {
    if (!property) return;

    try {
      const response = await housingService.update(property.id, data);

      if (response.success) {
        alert('Property updated successfully!');
        navigate('/dashboard');
      } else {
        alert('Failed to update property: ' + response.message);
      }
    } catch (error: any) {
      alert('Failed to update property: ' + error.message);
    }
  };

  return (
    <div className="space-y-6">
      <PropertyForm
        onSubmit={handleSubmit}
        initialData={property}
        isEditing={true}
      />
    </div>
  );
};

export default EditPropertyPage;