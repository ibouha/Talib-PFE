import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapPin, GraduationCap, Clock, Heart } from 'lucide-react';

// Type for roommate profile data
export type RoommateProfile = {
  id: string;
  userId: string;
  name: string;
  age: number;
  gender: string;
  university: string;
  program: string;
  year: number;
  bio: string;
  interests: string[];
  lifestyle: string[];
  preferences: {
    smoking: boolean;
    pets: boolean;
    gender: string;
    studyHabits: string;
  };
  budget: number;
  lookingFor: string;
  location: string;
  avatar: string;
  postedDate: string;
};

interface RoommateCardProps {
  roommate: RoommateProfile;
  isFavorited?: boolean;
  onToggleFavorite?: (id: string) => void;
}

const RoommateCard = ({ roommate, isFavorited = false, onToggleFavorite }: RoommateCardProps) => {
  const { t } = useTranslation();
  
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(roommate.id);
    }
  };
  
  // Get lifestyle labels
  const getLifestyleLabel = (lifestyle: string) => {
    return t(`roommates.lifestyle.${lifestyle}`);
  };
  
  return (
    <Link to={`/roommates/${roommate.id}`} className="card group h-full flex flex-col">
      <div className="p-6">
        <div className="flex items-center">
          {/* Avatar */}
          <div className="h-20 w-20 rounded-full overflow-hidden mr-4 border-2 border-primary-100">
            <img 
              src={roommate.avatar} 
              alt={roommate.name} 
              className="h-full w-full object-cover"
            />
          </div>
          
          {/* Basic Info */}
          <div className="flex-grow">
            <div className="flex items-start justify-between">
              <h3 className="text-xl font-semibold">{roommate.name}</h3>
              <button
                onClick={handleFavoriteClick}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Heart size={20} className={isFavorited ? 'fill-primary-500 text-primary-500' : 'text-gray-400'} />
              </button>
            </div>
            <p className="text-gray-600 flex items-center text-sm">
              <Clock size={16} className="mr-1" />
              <span>{roommate.age} years old</span>
            </p>
            <div className="flex items-center text-gray-600 text-sm">
              <MapPin size={16} className="mr-1" />
              <span>{roommate.location}</span>
            </div>
            <div className="flex items-center text-gray-600 text-sm mt-1">
              <GraduationCap size={16} className="mr-1" />
              <span>{roommate.university}</span>
            </div>
          </div>
        </div>
        
        {/* Budget */}
        <div className="mt-4">
          <p className="text-sm text-gray-600">Budget</p>
          <p className="font-medium text-primary-600">{t('common.price', { price: roommate.budget })}/month</p>
        </div>
        
        {/* Bio */}
        <div className="mt-4">
          <p className="text-gray-700 line-clamp-3">{roommate.bio}</p>
        </div>
        
        {/* Lifestyle */}
        <div className="mt-4 flex flex-wrap gap-2">
          {roommate.lifestyle.map((style, index) => (
            <span key={index} className="badge-secondary">
              {getLifestyleLabel(style)}
            </span>
          ))}
        </div>
        
        {/* Interests */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {roommate.interests.slice(0, 3).map((interest, index) => (
            <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
              {interest}
            </span>
          ))}
          {roommate.interests.length > 3 && (
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
              +{roommate.interests.length - 3}
            </span>
          )}
        </div>
        
        {/* View Profile Link */}
        <div className="mt-4 pt-4 border-t">
          <span className="text-primary-600 font-medium group-hover:underline">
            View Full Profile
          </span>
        </div>
      </div>
    </Link>
  );
};

export default RoommateCard;