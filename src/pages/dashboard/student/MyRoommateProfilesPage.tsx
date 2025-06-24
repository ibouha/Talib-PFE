import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus, Edit, Trash2, Eye, Users, MapPin, Calendar, DollarSign } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import roommateService from '../../../services/roommateService';
import { RoommateProfile } from '../../../services/api';
import ProfileAvatar from '../../../components/common/ProfileAvatar';

const MyRoommateProfilesPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<RoommateProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMyProfiles();
  }, []);

  const fetchMyProfiles = async () => {
    try {
      setLoading(true);
      // Get only current user's profiles using backend filtering
      const userId = (user as any)?.user_id || user?.id;
      const response = await roommateService.getAll({ student_id: userId });

      if (response.success) {
        const profiles = response.data.data || response.data.profiles || [];
        setProfiles(profiles);
      } else {
        setError('Failed to fetch profiles');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch profiles');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (profileId: string) => {
    if (!confirm('Are you sure you want to delete this roommate profile?')) {
      return;
    }

    try {
      const response = await roommateService.delete(profileId);
      if (response.success) {
        setProfiles(profiles.filter(profile => profile.id !== profileId));
        alert('Roommate profile deleted successfully!');
      } else {
        alert('Failed to delete profile: ' + response.message);
      }
    } catch (err: any) {
      alert('Failed to delete profile: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Roommate Profiles</h1>
          <p className="text-gray-600">Manage your roommate search profiles</p>
        </div>
        <Link
          to="/create-roommate-profile"
          className="btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create New Profile
        </Link>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Profiles Grid */}
      {profiles.length === 0 ? (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No roommate profiles</h3>
          <p className="mt-1 text-sm text-gray-500">Create your first profile to find compatible roommates.</p>
          <div className="mt-6">
            <Link
              to="/create-roommate-profile"
              className="btn-primary inline-flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Profile
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profiles.map((profile) => (
            <div key={profile.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Profile Header with Avatar */}
              <div className="bg-gradient-to-r from-primary-500 to-secondary-500 p-4 text-white">
                <div className="flex items-center">
                  {/* Avatar */}
                  <ProfileAvatar
                    imageUrl={(profile as any).avatar}
                    name={(profile as any).name || profile.headline || profile.student_name}
                    size="lg"
                    className="mr-3 h-12 w-12 border-2 border-white/20"
                    showBorder={false}
                  />

                  {/* Profile Info */}
                  <div className="flex-grow">
                    <h3 className="font-semibold text-lg">
                      {(profile as any).name || profile.headline || 'Roommate Profile'}
                    </h3>
                    <p className="text-primary-100 text-sm mt-1">
                      {profile.student_name || (profile as any).university || 'Student Profile'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Profile Details */}
              <div className="p-4 space-y-3">
                <p className="text-sm text-gray-600 line-clamp-3">
                  {(profile as any).bio || profile.description || 'No description available'}
                </p>

                {/* Budget */}
                <div className="flex items-center text-sm text-gray-600">
                  <DollarSign className="h-4 w-4 mr-2 text-green-500" />
                  <span>Budget: {(profile as any).budget || profile.monthly_budget} MAD/month</span>
                </div>

                {/* Move-in Date */}
                {((profile as any).move_in_date || profile.move_in_date) && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                    <span>Move-in: {new Date((profile as any).move_in_date || profile.move_in_date).toLocaleDateString()}</span>
                  </div>
                )}

                {/* Duration */}
                {((profile as any).lookingFor || profile.duration) && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2 text-purple-500" />
                    <span>Looking for: {(profile as any).lookingFor || profile.duration}</span>
                  </div>
                )}

                {/* Location Preference */}
                {((profile as any).location || profile.location_preference) && (
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2 text-red-500" />
                    <span>Location: {(profile as any).location || profile.location_preference}</span>
                  </div>
                )}

                {/* Preferences */}
                {profile.preferences && (
                  <div className="text-sm">
                    <span className="font-medium text-gray-700">Preferences:</span>
                    <div className="text-gray-600 mt-1 line-clamp-2">
                      {typeof profile.preferences === 'string' ? (
                        profile.preferences
                      ) : (
                        <div className="space-y-1">
                          {(profile.preferences as any).smoking !== undefined && (
                            <span className="inline-block mr-2 text-xs bg-gray-100 px-2 py-1 rounded">
                              Smoking: {(profile.preferences as any).smoking ? 'Yes' : 'No'}
                            </span>
                          )}
                          {(profile.preferences as any).pets !== undefined && (
                            <span className="inline-block mr-2 text-xs bg-gray-100 px-2 py-1 rounded">
                              Pets: {(profile.preferences as any).pets ? 'Yes' : 'No'}
                            </span>
                          )}
                          {(profile.preferences as any).gender && (
                            <span className="inline-block mr-2 text-xs bg-gray-100 px-2 py-1 rounded">
                              Gender: {(profile.preferences as any).gender}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-2 pt-3 border-t">
                  <Link
                    to={`/roommates/${profile.id}`}
                    className="flex-1 btn border border-gray-300 text-gray-700 hover:bg-gray-50 text-center text-sm py-2"
                  >
                    <Eye className="h-4 w-4 inline mr-1" />
                    View
                  </Link>
                  <Link
                    to={`/edit-roommate-profile/${profile.id}`}
                    className="flex-1 btn border border-primary-300 text-primary-700 hover:bg-primary-50 text-center text-sm py-2"
                  >
                    <Edit className="h-4 w-4 inline mr-1" />
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(profile.id)}
                    className="flex-1 btn border border-red-300 text-red-700 hover:bg-red-50 text-sm py-2"
                  >
                    <Trash2 className="h-4 w-4 inline mr-1" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyRoommateProfilesPage;
