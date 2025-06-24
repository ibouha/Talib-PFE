import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import RoommateProfileForm from '../../components/forms/RoommateProfileForm';
import { useAuth } from '../../contexts/AuthContext';
import roommateService from '../../services/roommateService';

const CreateRoommateProfilePage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: any) => {
    if (!user) {
      alert('Please login to create roommate profile');
      navigate('/login');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Map the form data to match the backend expectations
      const roommateData = {
        student_id: user.id,
        name: data.name,
        age: data.age,
        gender: data.gender,
        university: data.university,
        program: data.program,
        year: data.year,
        bio: data.bio,
        interests: data.interests || [],
        lifestyle: data.lifestyle || [],
        preferences: data.preferences || {
          smoking: false,
          pets: false,
          gender: 'noPreference',
          studyHabits: ''
        },
        budget: parseFloat(data.budget) || 0,
        lookingFor: data.lookingFor,
        location: data.location,
        avatar: data.avatar?.[0] || null // Handle file upload
      };

      // If there's an avatar file, we need to use FormData for multipart upload
      let response;
      if (roommateData.avatar) {
        const formData = new FormData();
        
        // Add all the fields to FormData
        Object.keys(roommateData).forEach(key => {
          if (key === 'avatar') {
            formData.append('avatar', roommateData.avatar);
          } else if (key === 'interests' || key === 'lifestyle' || key === 'preferences') {
            formData.append(key, JSON.stringify(roommateData[key]));
          } else {
            formData.append(key, roommateData[key].toString());
          }
        });

        response = await roommateService.createWithFormData(formData);
      } else {
        response = await roommateService.create(roommateData);
      }

      if (response.success) {
        alert('Roommate profile created successfully!');
        navigate('/roommates');
      } else {
        setError(response.message || 'Failed to create roommate profile');
      }
    } catch (err: any) {
      console.error('Error creating roommate profile:', err);
      setError(err.response?.data?.message || err.message || 'Failed to create roommate profile');
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
      <RoommateProfileForm onSubmit={handleSubmit} loading={loading} />
    </div>
  );
};

export default CreateRoommateProfilePage;