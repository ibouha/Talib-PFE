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
  User,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Item } from '../services/api';
import itemsService from '../services/itemsService';
import ReportButton from '../components/common/ReportButton';

const ItemDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Fetch item details from backend
  useEffect(() => {
    const fetchItem = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);
        console.log('Fetching item details for ID:', id);
        const response = await itemsService.getById(id);

        if (response.success) {
          setItem(response.data);
          console.log('Item details fetched:', response.data);
        } else {
          setError(response.message || 'Item not found');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch item details');
        console.error('Error fetching item:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  // Update document title
  useEffect(() => {
    if (item) {
      document.title = `${item.title} | ${t('app.name')}`;
    }
  }, [item, t]);

  // If item not found after loading, redirect to items page
  useEffect(() => {
    if (!loading && error) {
      navigate('/items');
    }
  }, [loading, error, navigate]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Item Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The item you are looking for does not exist.'}</p>
          <Link to="/items" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Back to Items
          </Link>
        </div>
      </div>
    );
  }
  
  const toggleFavorite = () => {
    setIsFavorited(!isFavorited);
  };

  // Image navigation functions
  const nextImage = () => {
    if (item?.images && item.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % item.images.length);
    }
  };

  const prevImage = () => {
    if (item?.images && item.images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + item.images.length) % item.images.length);
    }
  };

  // Get placeholder image
  const getPlaceholderImage = () => {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNzUgMTIwSDIyNVYxODBIMTc1VjEyMFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHN2ZyB4PSIxODAiIHk9IjE0MCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjIwIj4KPHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCA0MCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIwIDEwTDE1IDVMMjUgNUwyMCAxMFoiIGZpbGw9IiM2QjcyODAiLz4KPC9zdmc+Cjwvc3ZnPgo8dGV4dCB4PSIyMDAiIHk9IjE5MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNkI3MjgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5ObyBJbWFnZTwvdGV4dD4KPC9zdmc+';
  };
  
  // Format date
  const formattedDate = new Date(item.created_at).toLocaleDateString('en-US', {
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
          <span>{item.location}, Morocco</span>
        </div>
      </div>
      
      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Item Images */}
          <div className="mb-8 rounded-xl overflow-hidden bg-gray-200 h-96 relative">
            {item.images && item.images.length > 0 ? (
              <>
                {/* Main Image */}
                <img
                  src={item.images[currentImageIndex]}
                  alt={`${item.title} - Image ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = getPlaceholderImage();
                  }}
                />

                {/* Navigation Arrows - Only show if multiple images */}
                {item.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                    >
                      <ChevronRight size={24} />
                    </button>
                  </>
                )}

                {/* Image Counter */}
                {item.images.length > 1 && (
                  <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                    {currentImageIndex + 1} / {item.images.length}
                  </div>
                )}

                {/* Image Thumbnails - Only show if multiple images */}
                {item.images.length > 1 && (
                  <div className="absolute bottom-4 left-4 flex space-x-2">
                    {item.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                          index === currentImageIndex ? 'border-white' : 'border-transparent opacity-70'
                        }`}
                      >
                        <img
                          src={image}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = getPlaceholderImage();
                          }}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              /* No Image Placeholder */
              <div className="w-full h-full flex items-center justify-center">
                <img
                  src={getPlaceholderImage()}
                  alt="No image available"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
          
          {/* Price and Actions */}
          <div className="flex flex-wrap items-center justify-between mb-6">
            <div>
              {item.is_free ? (
                <p className="text-3xl font-bold text-green-600">FREE</p>
              ) : (
                <p className="text-3xl font-bold text-primary-600">{item.price} MAD</p>
              )}
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
                contentType="item"
                contentId={item.id.toString()}
                contentTitle={item.title}
                className="btn border border-gray-300 text-gray-700 hover:text-red-600 hover:border-red-300"
                variant="button"
              />
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
                <span className="font-medium">{getConditionLabel(item.condition_status || 'good')}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500 text-sm">Location</span>
                <span className="font-medium">{item.location}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500 text-sm">Available</span>
                <span className="font-medium">{item.status === 'available' ? 'Yes' : 'No'}</span>
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
              <div className="h-14 w-14 rounded-full bg-primary-100 flex items-center justify-center mr-4">
                {item.seller_name ? (
                  <span className="text-primary-600 font-semibold text-lg">
                    {item.seller_name.charAt(0).toUpperCase()}
                  </span>
                ) : (
                  <User size={24} className="text-gray-400" />
                )}
              </div>
              <div>
                <h3 className="font-semibold">
                  {item.seller_name || 'Item Seller'}
                </h3>
                <p className="text-gray-600 text-sm">
                  {item.seller_university || 'Student'}
                </p>
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



