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
  User 
} from 'lucide-react';
import { itemListings, users } from '../data/mockData';

const ItemDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [item, setItem] = useState(itemListings.find(i => i.id === id));
  const [seller, setSeller] = useState(users.find(u => u.id === item?.sellerId));
  const [isFavorited, setIsFavorited] = useState(false);
  
  // Update document title
  useEffect(() => {
    if (item) {
      document.title = `${item.title} | ${t('app.name')}`;
    }
  }, [item, t]);
  
  // If item not found, redirect to items page
  useEffect(() => {
    if (!item) {
      navigate('/items');
    }
  }, [item, navigate]);
  
  if (!item || !seller) {
    return null;
  }
  
  const toggleFavorite = () => {
    setIsFavorited(!isFavorited);
  };
  
  // Format date
  const formattedDate = new Date(item.postedDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Format condition
  const getConditionLabel = (condition: string) => {
    return t(`items.conditions.${condition}`);
  };
  
  // Format category
  const getCategoryLabel = (category: string) => {
    return t(`items.categories.${category}`);
  };
  
  return (
    <div className="container-custom py-8">
      {/* Back Button and Title */}
      <div className="mb-6">
        <Link to="/items" className="flex items-center text-gray-600 hover:text-primary-600 mb-4">
          <ArrowLeft size={20} className="mr-2" />
          {t('common.back')}
        </Link>
        <h1 className="text-3xl font-bold">{item.title}</h1>
        <div className="flex items-center mt-2 text-gray-600">
          <MapPin size={18} className="mr-1" />
          <span>{item.city}, Morocco</span>
        </div>
      </div>
      
      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Item Image */}
          <div className="mb-8 rounded-xl overflow-hidden">
            <img 
              src={item.images[0]} 
              alt={item.title} 
              className="w-full h-auto"
            />
          </div>
          
          {/* Price and Actions */}
          <div className="flex flex-wrap items-center justify-between mb-6">
            <div>
              <p className="text-3xl font-bold text-primary-600">{t('common.price', { price: item.price })}</p>
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
          
          {/* Item Details */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Item Details</h2>
            
            <div className="grid grid-cols-2 gap-y-4 mb-6">
              <div className="flex flex-col">
                <span className="text-gray-500 text-sm">Category</span>
                <span className="font-medium">{getCategoryLabel(item.category)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500 text-sm">Condition</span>
                <span className="font-medium">{getConditionLabel(item.condition)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500 text-sm">Location</span>
                <span className="font-medium">{item.city}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500 text-sm">Available</span>
                <span className="font-medium">{item.available ? 'Yes' : 'No'}</span>
              </div>
            </div>
            
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-gray-700">{item.description}</p>
          </div>
        </div>
        
        {/* Sidebar */}
        <div>
          {/* Seller Info */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="h-14 w-14 rounded-full overflow-hidden mr-4">
                <img 
                  src={seller.avatar} 
                  alt={seller.name} 
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-semibold">{seller.name}</h3>
                <p className="text-gray-600 text-sm">{seller.university || seller.city}</p>
              </div>
            </div>
            
            <div className="mt-6">
              <button className="btn-primary w-full mb-2 flex items-center justify-center">
                <MessageSquare size={18} className="mr-2" />
                Contact Seller
              </button>
              <button className="btn-outline w-full flex items-center justify-center">
                <User size={18} className="mr-2" />
                View Profile
              </button>
            </div>
            
            {/* Safety Tips */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-2">Safety Tips</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Meet in a public place</li>
                <li>• Verify the item before paying</li>
                <li>• Never share personal financial information</li>
                <li>• Consider using university exchange points</li>
              </ul>
            </div>
          </div>
          
          {/* Similar Items Placeholder */}
          <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
            <h3 className="font-semibold mb-4">Similar Items</h3>
            <p className="text-gray-500 text-sm">
              Similar items would be displayed here
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetails;