import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Heart, 
  Share, 
  MessageSquare, 
  Bed, 
  Bath, 
  Home, 
  Check, 
  User 
} from 'lucide-react';
import { housingListings, users } from '../data/mockData';

const HousingDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [housing, setHousing] = useState(housingListings.find(h => h.id === id));
  const [owner, setOwner] = useState(users.find(u => u.id === housing?.ownerId));
  const [activeImage, setActiveImage] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  
  // Update document title
  useEffect(() => {
    if (housing) {
      document.title = `${housing.title} | ${t('app.name')}`;
    }
  }, [housing, t]);
  
  // If housing not found, redirect to housing page
  useEffect(() => {
    if (!housing) {
      navigate('/housing');
    }
  }, [housing, navigate]);
  
  if (!housing || !owner) {
    return null;
  }
  
  const toggleFavorite = () => {
    setIsFavorited(!isFavorited);
  };
  
  // Format date
  const formattedDate = new Date(housing.postedDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  return (
    <div className="container-custom py-8">
      {/* Back Button and Title */}
      <div className="mb-6">
        <Link to="/housing" className="flex items-center text-gray-600 hover:text-primary-600 mb-4">
          <ArrowLeft size={20} className="mr-2" />
          {t('common.back')}
        </Link>
        <h1 className="text-3xl font-bold">{housing.title}</h1>
        <div className="flex items-center mt-2 text-gray-600">
          <MapPin size={18} className="mr-1" />
          <span>{housing.address}, {housing.city}</span>
        </div>
      </div>
      
      {/* Image Gallery */}
      <div className="mb-8">
        <div className="h-96 rounded-xl overflow-hidden mb-2">
          <img 
            src={housing.images[activeImage]} 
            alt={housing.title} 
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Thumbnail Gallery */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {housing.images.map((image, index) => (
            <button
              key={index}
              onClick={() => setActiveImage(index)}
              className={`h-20 w-32 flex-shrink-0 rounded-lg overflow-hidden border-2 transition ${
                index === activeImage 
                  ? 'border-primary-500 opacity-100' 
                  : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <img 
                src={image} 
                alt={`${housing.title} ${index + 1}`} 
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>
      
      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Price and Actions */}
          <div className="flex flex-wrap items-center justify-between mb-6">
            <div>
              <p className="text-3xl font-bold text-primary-600">{t('common.price', { price: housing.price })}</p>
              <p className="text-gray-500 text-sm flex items-center">
                <Calendar size={16} className="mr-1" />
                {t('common.date', { date: formattedDate })}
              </p>
            </div>
            
            <div className="flex space-x-3 mt-4 sm:mt-0">
              <button 
                onClick={toggleFavorite}
                className={`btn border flex items-center ${isFavorited ? 'text-primary-600 border-primary-500' : 'text-gray-700 border-gray-300'}`}
              >
                <Heart size={18} className={`mr-2 ${isFavorited ? 'fill-primary-500' : ''}`} />
                {isFavorited ? 'Saved' : 'Save'}
              </button>
              <button className="btn border text-gray-700 border-gray-300 flex items-center">
                <Share size={18} className="mr-2" />
                Share
              </button>
            </div>
          </div>
          
          {/* Property Details */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Property Details</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-y-4 mb-6">
              <div className="flex flex-col">
                <span className="text-gray-500 text-sm">Type</span>
                <span className="font-medium capitalize">{housing.type}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500 text-sm">Bedrooms</span>
                <span className="font-medium">{housing.bedrooms}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500 text-sm">Bathrooms</span>
                <span className="font-medium">{housing.bathrooms}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500 text-sm">Area</span>
                <span className="font-medium">{housing.area} m²</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500 text-sm">Furnished</span>
                <span className="font-medium">{housing.furnished ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500 text-sm">Available</span>
                <span className="font-medium">{housing.available ? 'Yes' : 'No'}</span>
              </div>
            </div>
            
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-gray-700 mb-6">{housing.description}</p>
            
            <h3 className="font-semibold mb-2">Amenities</h3>
            <div className="grid grid-cols-2 gap-2">
              {housing.amenities.map((amenity, index) => (
                <div key={index} className="flex items-center">
                  <Check size={18} className="text-primary-500 mr-2" />
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Sidebar */}
        <div>
          {/* Owner Info */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center">
              <div className="h-14 w-14 rounded-full overflow-hidden mr-4">
                <img 
                  src={owner.avatar} 
                  alt={owner.name} 
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-semibold">{owner.name}</h3>
                <p className="text-gray-600 text-sm">{owner.role === 'owner' ? 'Property Owner' : 'Student'}</p>
              </div>
            </div>
            
            <div className="mt-6">
              <button className="btn-primary w-full mb-2 flex items-center justify-center">
                <MessageSquare size={18} className="mr-2" />
                Contact Owner
              </button>
              <button className="btn-outline w-full flex items-center justify-center">
                <User size={18} className="mr-2" />
                View Profile
              </button>
            </div>
          </div>
          
          {/* Location Map Placeholder */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold mb-4">Location</h3>
            <div className="bg-gray-200 h-48 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Map would be displayed here</p>
            </div>
            <p className="mt-4 text-gray-600">
              {housing.address}, {housing.city}, Morocco
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HousingDetails;