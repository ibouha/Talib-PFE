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
  Home,
  Check,
  X,
  Clock
} from 'lucide-react';
import { roommateProfiles } from '../data/mockData';

const RoommateDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState(roommateProfiles.find(p => p.id === id));
  const [isFavorited, setIsFavorited] = useState(false);
  
  // Update document title
  useEffect(() => {
    if (profile) {
      document.title = `${profile.name} | ${t('app.name')}`;
    }
  }, [profile, t]);
  
  // If profile not found, redirect to roommates page
  useEffect(() => {
    if (!profile) {
      navigate('/roommates');
    }
  }, [profile, navigate]);
  
  if (!profile) {
    return null;
  }
  
  const toggleFavorite = () => {
    setIsFavorited(!isFavorited);
  };
  
  // Format date
  const formattedDate = new Date(profile.postedDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Get lifestyle labels
  const getLifestyleLabel = (lifestyle: string) => {
    return t(`roommates.lifestyle.${lifestyle}`);
  };
  
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
              <div className="h-32 w-32 rounded-full overflow-hidden mb-4 border-4 border-primary-100">
                <img 
                  src={profile.avatar} 
                  alt={profile.name} 
                  className="h-full w-full object-cover"
                />
              </div>
              <h2 className="text-2xl font-bold mb-1">{profile.name}</h2>
              <p className="text-gray-600 flex items-center mb-1">
                <Clock size={16} className="mr-1" />
                {profile.age} years old
              </p>
              <p className="text-gray-600 flex items-center mb-3">
                <GraduationCap size={16} className="mr-1" />
                {profile.program}, Year {profile.year}
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
                  <span>Location</span>
                </div>
                <span className="font-medium">{profile.location}</span>
              </li>
              <li className="flex items-center justify-between">
                <div className="flex items-center">
                  <GraduationCap size={18} className="mr-2 text-gray-500" />
                  <span>University</span>
                </div>
                <span className="font-medium text-right flex-grow">{profile.university}</span>
              </li>
              <li className="flex items-center justify-between">
                <div className="flex items-center">
                  <DollarSign size={18} className="mr-2 text-gray-500" />
                  <span>Budget</span>
                </div>
                <span className="font-medium">{t('common.price', { price: profile.budget })}/month</span>
              </li>
              <li className="flex items-center justify-between">
                <div className="flex items-center">
                  <Home size={18} className="mr-2 text-gray-500" />
                  <span>Looking for</span>
                </div>
                <span className="font-medium capitalize">{profile.lookingFor}</span>
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
            <h2 className="text-xl font-semibold mb-4">About Me</h2>
            <p className="text-gray-700 mb-6">{profile.bio}</p>
            
            {/* Lifestyle */}
            <h3 className="font-semibold mb-3">My Lifestyle</h3>
            <div className="flex flex-wrap gap-2 mb-6">
              {profile.lifestyle.map((style, index) => (
                <span key={index} className="badge-primary px-3 py-1">
                  {getLifestyleLabel(style)}
                </span>
              ))}
            </div>
            
            {/* Interests */}
            <h3 className="font-semibold mb-3">Interests</h3>
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((interest, index) => (
                <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                  {interest}
                </span>
              ))}
            </div>
          </div>
          
          {/* Preferences */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Roommate Preferences</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">Living Preferences</h3>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <span className="mr-2">{profile.preferences.smoking ? <Check size={18} className="text-success-500" /> : <X size={18} className="text-error-500" />}</span>
                    <span>Smoking allowed</span>
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">{profile.preferences.pets ? <Check size={18} className="text-success-500" /> : <X size={18} className="text-error-500" />}</span>
                    <span>Pets allowed</span>
                  </li>
                  <li className="flex items-center">
                    <span className="w-5 h-5 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mr-2">
                      <User size={14} />
                    </span>
                    <span>Preferred roommate gender: {t(`roommates.gender.${profile.preferences.gender}`)}</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-3">Study Habits</h3>
                <p className="text-gray-700">{profile.preferences.studyHabits}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoommateDetails;