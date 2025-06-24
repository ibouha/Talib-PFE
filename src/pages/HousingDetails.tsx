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
import { Housing } from '../services/api';
import housingService from '../services/housingService';
import ReportButton from '../components/common/ReportButton';

const HousingDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [housing, setHousing] = useState<Housing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);

  // Fetch housing details from backend
  useEffect(() => {
    const fetchHousing = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);
        const response = await housingService.getById(id);

        if (response.success) {
          setHousing(response.data);
        } else {
          setError(response.message || 'Housing not found');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch housing details');
        console.error('Error fetching housing:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHousing();
  }, [id]);
  
  // Update document title
  useEffect(() => {
    if (housing) {
      document.title = `${housing.title} | ${t('app.name')}`;
    }
  }, [housing, t]);

  // Log errors for debugging but don't auto-redirect
  useEffect(() => {
    if (!loading && error) {
      console.error('Housing details error:', error);
      // Don't auto-redirect, let user see the error and choose to go back
    }
  }, [loading, error]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !housing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Housing Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The housing listing you are looking for does not exist.'}</p>
          <Link to="/housing" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Back to Housing
          </Link>
        </div>
      </div>
    );
  }
  
  const toggleFavorite = () => {
    setIsFavorited(!isFavorited);
  };
  
  // Format date
  const formattedDate = new Date(housing.created_at).toLocaleDateString('en-US', {
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
          <span>{housing.city}</span>
        </div>
      </div>
      
      {/* Image Placeholder */}
      <div className="mb-8">
        {housing.images && housing.images.length > 0 ? (
          <div className="h-96 rounded-xl overflow-hidden mb-2 bg-gray-200 flex items-center justify-center">
            <img
              src={housing.images[activeImage]}
              alt={housing.title}
              className="object-cover w-full h-full"
              onError={e => (e.currentTarget.style.display = 'none')}
            />
          </div>
        ) : (
          <div className="h-96 rounded-xl overflow-hidden mb-2 bg-gray-200 flex items-center justify-center">
            <Home size={64} className="text-gray-400" />
          </div>
        )}
        {/* Thumbnails for multiple images */}
        {housing.images && housing.images.length > 1 && (
          <div className="flex space-x-2 mt-2 justify-center">
            {housing.images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`Thumbnail ${idx + 1}`}
                className={`w-20 h-20 object-cover rounded cursor-pointer border-2 ${activeImage === idx ? 'border-blue-500' : 'border-transparent'}`}
                onClick={() => setActiveImage(idx)}
                onError={e => (e.currentTarget.style.display = 'none')}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Price and Actions */}
          <div className="flex flex-wrap items-center justify-between mb-6">
            <div>
              <p className="text-3xl font-bold text-primary-600">{housing.price.toLocaleString()} MAD/month</p>
              <p className="text-gray-500 text-sm flex items-center">
                <Calendar size={16} className="mr-1" />
                Posted on {formattedDate}
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
              <ReportButton
                contentType="housing"
                contentId={housing.id.toString()}
                contentTitle={housing.title}
                className="btn border border-gray-300 text-gray-700 hover:text-red-600 hover:border-red-300"
                variant="button"
              />
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
                <span className="font-medium">{housing.is_furnished ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500 text-sm">Available</span>
                <span className="font-medium">{housing.is_available ? 'Yes' : 'No'}</span>
              </div>
            </div>
            
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-gray-700 mb-6">{housing.description}</p>
            
            {housing.amenities && housing.amenities.length > 0 && (
              <>
                <h3 className="font-semibold mb-2">Amenities</h3>
                <div className="grid grid-cols-2 gap-2">
                  {housing.amenities.split(',').map((amenity, index) => (
                    <div key={index} className="flex items-center">
                      <Check size={18} className="text-primary-500 mr-2" />
                      <span>{amenity.trim()}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* Sidebar */}
        <div>
          {/* Owner Info */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center">
              <div className="h-14 w-14 rounded-full bg-gray-200 flex items-center justify-center mr-4">
                <User size={24} className="text-gray-400" />
              </div>
              <div>
                <h3 className="font-semibold">{housing.owner_name || 'Property Owner'}</h3>
                <p className="text-gray-600 text-sm">Property Owner</p>
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
              {housing.city}, Morocco
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HousingDetails;