import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Loader } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import roommateService from '../../services/roommateService';
import { RoommateProfile } from '../../services/api';
import RoommateProfileForm from '../../components/forms/RoommateProfileForm';

const EditRoommateProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<RoommateProfile | null>(null);
  const [initialData, setInitialData] = useState<any>(null);

  useEffect(() => {
    if (id) {
      fetchProfile();
    }
  }, [id]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await roommateService.getById(id!);
      
      if (response.success && response.data) {
        const profileData = response.data;
        
        // Check if current user owns this profile
        const userId = (user as any)?.user_id || user?.id;
        if (profileData.student_id !== userId) {
          setError('You can only edit your own roommate profiles');
          return;
        }
        
        setProfile(profileData);
        
        // Prepare initial data for RoommateProfileForm
        setInitialData({
          headline: profileData.headline || '',
          description: profileData.description || '',
          monthly_budget: profileData.monthly_budget || 0,
          move_in_date: profileData.move_in_date || '',
          duration: profileData.duration || '',
          preferences: profileData.preferences || '',
          location_preference: profileData.location_preference || ''
        });
      } else {
        setError('Roommate profile not found');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load roommate profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      setSaving(true);
      setError(null);

      const updateData = {
        headline: data.headline,
        description: data.description,
        monthly_budget: parseFloat(data.monthly_budget) || 0,
        move_in_date: data.move_in_date,
        duration: data.duration,
        preferences: data.preferences || '',
        location_preference: data.location_preference
      };

      const response = await roommateService.update(id!, updateData);
      
      if (response.success) {
        alert('Roommate profile updated successfully!');
        navigate('/dashboard/my-roommate-profiles');
      } else {
        setError(response.message || 'Failed to update roommate profile');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update roommate profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <Loader className="h-6 w-6 animate-spin text-primary-600" />
          <span>Loading profile...</span>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error</h3>
          <p className="text-red-700 mt-1">{error}</p>
          <button
            onClick={() => navigate('/dashboard/my-roommate-profiles')}
            className="mt-3 btn-outline text-red-700 border-red-300 hover:bg-red-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to My Profiles
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
            onClick={() => navigate('/dashboard/my-roommate-profiles')}
            className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Roommate Profile</h1>
            <p className="text-gray-600">Update your roommate search preferences</p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* RoommateProfileForm Component */}
      <RoommateProfileForm 
        onSubmit={handleSubmit}
        initialData={initialData}
        isEditing={true}
        loading={saving}
      />
    </div>
  );
};

export default EditRoommateProfilePage;
