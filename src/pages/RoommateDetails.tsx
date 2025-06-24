 import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Calendar,
  Heart,
  Share,
  MessageSquare,
  User,
  GraduationCap,
  MapPin,
  DollarSign,
  Home
} from 'lucide-react';
import { RoommateProfile } from '../services/api';
import roommateService from '../services/roommateService';
import ReportButton from '../components/common/ReportButton';

const RoommateDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<RoommateProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);

  // Fetch roommate profile from backend
  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);
        console.log('Fetching roommate profile for ID:', id);
        const response = await roommateService.getById(id);

        if (response.success) {
          setProfile(response.data);
          console.log('Roommate profile fetched:', response.data);
        } else {
          setError(response.message || 'Profile not found');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch profile details');
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  // Update document title
  useEffect(() => {
    if (profile) {
      document.title = `${profile.headline} | ${t('app.name')}`;
    }
  }, [profile, t]);

  // If profile not found after loading, redirect to roommates page
  useEffect(() => {
    if (!loading && error) {
      navigate('/roommates');
    }
  }, [loading, error, navigate]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Profile Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The roommate profile you are looking for does not exist.'}</p>
          <Link to="/roommates" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Back to Roommates
          </Link>
        </div>
      </div>
    );
  }
  
  const toggleFavorite = () => {
    setIsFavorited(!isFavorited);
  };
  
  // Format date
  const formattedDate = new Date(profile.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  

  
  return (
    <div className="container-custom py-8">
      {/* Back Button and Title */}
      <div className="mb-8">
        <Link to="/roommates" className="flex items-center text-gray-600 hover:text-primary-600 mb-4">
          <ArrowLeft size={20} className="mr-2" />
          {t('common.back')}
        </Link>
      </div>
      
      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar */}
        <div className="lg:order-1 order-2">
          {/* Profile Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex flex-col items-center">
              {/* Avatar */}
              <div className="h-32 w-32 rounded-full bg-gray-200 flex items-center justify-center mb-4 border-4 border-primary-100 overflow-hidden">
                {profile.avatar ? (
                  <img
                    src={profile.avatar.startsWith('http') ? profile.avatar : `http://localhost/Talib-PFE/api/uploads/${profile.avatar}`}
                    alt={profile.headline || 'Profile'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to initials if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                ) : (
                  <User size={48} className="text-gray-400" />
                )}
              </div>
              <h2 className="text-2xl font-bold mb-1">{profile.headline}</h2>
              <p className="text-gray-600 flex items-center mb-3">
                <GraduationCap size={16} className="mr-1" />
                Student Profile
              </p>
              
              <div className="mt-4 w-full">
                <button className="btn-primary w-full mb-2 flex items-center justify-center">
                  <MessageSquare size={18} className="mr-2" />
                  Contact
                </button>
                
                <div className="flex space-x-3 mt-4">
                  <button
                    onClick={toggleFavorite}
                    className={`flex-1 btn border flex items-center justify-center ${isFavorited ? 'text-primary-600 border-primary-500' : 'text-gray-700 border-gray-300'}`}
                  >
                    <Heart size={18} className={`mr-2 ${isFavorited ? 'fill-primary-500' : ''}`} />
                    {isFavorited ? 'Saved' : 'Save'}
                  </button>
                  <button className="flex-1 btn border text-gray-700 border-gray-300 flex items-center justify-center">
                    <Share size={18} className="mr-2" />
                    Share
                  </button>
                </div>

                <div className="mt-3">
                  <ReportButton
                    contentType="roommate_profile"
                    contentId={profile.id.toString()}
                    contentTitle={profile.headline}
                    className="w-full btn border border-gray-300 text-gray-700 hover:text-red-600 hover:border-red-300 justify-center"
                    variant="button"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Key Info Card */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-lg mb-4">Key Information</h3>
            <ul className="space-y-3">
              <li className="flex items-center justify-between">
                <div className="flex items-center">
                  <MapPin size={18} className="mr-2 text-gray-500" />
                  <span>Location Preference</span>
                </div>
                <span className="font-medium">{profile.location_preference || 'Not specified'}</span>
              </li>
              <li className="flex items-center justify-between">
                <div className="flex items-center">
                  <DollarSign size={18} className="mr-2 text-gray-500" />
                  <span>Budget</span>
                </div>
                <span className="font-medium">{profile.monthly_budget} MAD/month</span>
              </li>
              <li className="flex items-center justify-between">
                <div className="flex items-center">
                  <Calendar size={18} className="mr-2 text-gray-500" />
                  <span>Move-in Date</span>
                </div>
                <span className="font-medium">{new Date(profile.move_in_date).toLocaleDateString()}</span>
              </li>
              <li className="flex items-center justify-between">
                <div className="flex items-center">
                  <Home size={18} className="mr-2 text-gray-500" />
                  <span>Duration</span>
                </div>
                <span className="font-medium capitalize">{profile.duration || 'Not specified'}</span>
              </li>
              <li className="flex items-center justify-between">
                <div className="flex items-center">
                  <Calendar size={18} className="mr-2 text-gray-500" />
                  <span>Posted</span>
                </div>
                <span className="font-medium">{formattedDate}</span>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="lg:col-span-2 lg:order-2 order-1">
          {/* About Me */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">About</h2>
            <p className="text-gray-700 mb-6">{profile.description}</p>

            {/* Preferences */}
            {profile.preferences && (
              <>
                <h3 className="font-semibold mb-3">Preferences</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  {typeof profile.preferences === 'string' ? (
                    <p className="text-gray-700">{profile.preferences}</p>
                  ) : (
                    <div className="space-y-2">
                      {profile.preferences.smoking !== undefined && (
                        <p className="text-gray-700">
                          <span className="font-medium">Smoking:</span> {profile.preferences.smoking ? 'Yes' : 'No'}
                        </p>
                      )}
                      {profile.preferences.pets !== undefined && (
                        <p className="text-gray-700">
                          <span className="font-medium">Pets:</span> {profile.preferences.pets ? 'Yes' : 'No'}
                        </p>
                      )}
                      {profile.preferences.gender && (
                        <p className="text-gray-700">
                          <span className="font-medium">Gender Preference:</span> {profile.preferences.gender}
                        </p>
                      )}
                      {profile.preferences.studyHabits && (
                        <p className="text-gray-700">
                          <span className="font-medium">Study Habits:</span> {profile.preferences.studyHabits}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
          
          {/* Additional Info */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Additional Information</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Move-in Date</h3>
                <p className="text-gray-700">{new Date(profile.move_in_date).toLocaleDateString()}</p>
              </div>

              {profile.duration && (
                <div>
                  <h3 className="font-semibold mb-2">Duration</h3>
                  <p className="text-gray-700">{profile.duration}</p>
                </div>
              )}

              {profile.location_preference && (
                <div>
                  <h3 className="font-semibold mb-2">Location Preference</h3>
                  <p className="text-gray-700">{profile.location_preference}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoommateDetails;