import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Building, ShoppingBag, Users, Heart } from 'lucide-react';
import HousingCard, { HousingListing } from '../components/housing/HousingCard';
import ItemCard, { ItemListing } from '../components/items/ItemCard';
import RoommateCard, { RoommateProfile } from '../components/roommates/RoommateCard';
import { useFavorites } from '../contexts/FavoritesContext';
import { useAuth } from '../contexts/AuthContext';
import favoritesService from '../services/favoritesService';
import itemsService from '../services/itemsService';
import housingService from '../services/housingService';
import roommateService from '../services/roommateService';
import { Item, Housing, RoommateProfile as BackendRoommateProfile } from '../services/api';

const Favorites = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('housing');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for actual favorite data with details
  const [favoriteHousingListings, setFavoriteHousingListings] = useState<HousingListing[]>([]);
  const [favoriteItemListings, setFavoriteItemListings] = useState<ItemListing[]>([]);
  const [favoriteRoommateProfiles, setFavoriteRoommateProfiles] = useState<RoommateProfile[]>([]);

  const {
    toggleHousingFavorite,
    toggleItemFavorite,
    toggleRoommateFavorite,
  } = useFavorites();

  // Handle favorite toggle with refresh
  const handleToggleHousingFavorite = async (id: string) => {
    await toggleHousingFavorite(id);
    // Remove from local state immediately for better UX
    setFavoriteHousingListings(prev => prev.filter(h => h.id !== id));
  };

  const handleToggleItemFavorite = async (id: string) => {
    await toggleItemFavorite(id);
    // Remove from local state immediately for better UX
    setFavoriteItemListings(prev => prev.filter(i => i.id !== id));
  };

  const handleToggleRoommateFavorite = async (id: string) => {
    await toggleRoommateFavorite(id);
    // Remove from local state immediately for better UX
    setFavoriteRoommateProfiles(prev => prev.filter(r => r.id !== id));
  };

  // Convert backend data to frontend format
  const convertToHousingListing = (housing: Housing): HousingListing => ({
    id: housing.id,
    title: housing.title,
    description: housing.description,
    price: housing.price,
    location: housing.city,
    type: housing.type,
    bedrooms: housing.bedrooms,
    bathrooms: housing.bathrooms,
    area: housing.area,
    amenities: housing.amenities ? housing.amenities.split(',').map(a => a.trim()) : [],
    images: ['/placeholder-housing.jpg'],
    available: housing.status === 'available',
    postedDate: housing.created_at
  });

  const convertToItemListing = (item: Item): ItemListing => ({
    id: item.id,
    title: item.title,
    description: item.description,
    price: item.price,
    category: item.category,
    condition: item.condition_status || 'good',
    location: item.location,
    images: ['/placeholder-item.jpg'],
    sellerId: item.student_id,
    postedDate: item.created_at,
    available: item.status === 'available'
  });

  const convertToRoommateProfile = (profile: BackendRoommateProfile): RoommateProfile => ({
    id: profile.id,
    userId: profile.student_id,
    name: profile.headline,
    age: 22,
    gender: 'not-specified',
    university: 'University',
    program: 'Student',
    year: 3,
    bio: profile.description,
    interests: [],
    lifestyle: [],
    preferences: {
      smoking: false,
      pets: false,
      gender: 'any',
      studyHabits: profile.preferences || 'Flexible'
    },
    budget: profile.monthly_budget,
    lookingFor: profile.duration?.toString() || 'roommate',
    location: profile.location_preference || 'Not specified',
    avatar: '/placeholder-avatar.jpg',
    postedDate: profile.created_at
  });

  // Fetch favorites data from backend
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log('Fetching favorites for user:', user.id);

        // Get all favorites for the user
        console.log('Calling favoritesService.getAll with user ID:', user.id);
        const favoritesResponse = await favoritesService.getAll(user.id);
        console.log('Favorites API response:', favoritesResponse);

        if (!favoritesResponse.success) {
          console.error('Favorites API error:', favoritesResponse);
          throw new Error(favoritesResponse.message || 'Failed to fetch favorites');
        }

        const favorites = (favoritesResponse.data as any)?.data || favoritesResponse.data || [];
        console.log('Fetched favorites:', favorites);

        // Separate favorites by type and get detailed data
        const housingFavorites = favorites.filter((fav: any) => fav.type === 'Housing');
        const itemFavorites = favorites.filter((fav: any) => fav.type === 'Item');
        const roommateFavorites = favorites.filter((fav: any) => fav.type === 'RoommateProfile');

        // Fetch detailed housing data
        const housingPromises = housingFavorites.map(async (fav: any) => {
          try {
            const response = await housingService.getById(fav.housing_id);
            return response.success ? convertToHousingListing(response.data) : null;
          } catch (err) {
            console.error('Error fetching housing:', err);
            return null;
          }
        });

        // Fetch detailed item data
        const itemPromises = itemFavorites.map(async (fav: any) => {
          try {
            const response = await itemsService.getById(fav.item_id);
            return response.success ? convertToItemListing(response.data) : null;
          } catch (err) {
            console.error('Error fetching item:', err);
            return null;
          }
        });

        // Fetch detailed roommate data
        const roommatePromises = roommateFavorites.map(async (fav: any) => {
          try {
            const response = await roommateService.getById(fav.roommateProfile_id);
            return response.success ? convertToRoommateProfile(response.data) : null;
          } catch (err) {
            console.error('Error fetching roommate:', err);
            return null;
          }
        });

        // Wait for all data to be fetched
        const [housingResults, itemResults, roommateResults] = await Promise.all([
          Promise.all(housingPromises),
          Promise.all(itemPromises),
          Promise.all(roommatePromises)
        ]);

        // Filter out null results and update state
        setFavoriteHousingListings(housingResults.filter((h): h is HousingListing => h !== null));
        setFavoriteItemListings(itemResults.filter((i): i is ItemListing => i !== null));
        setFavoriteRoommateProfiles(roommateResults.filter((r): r is RoommateProfile => r !== null));

        console.log('Processed favorites:', {
          housing: housingResults.filter(h => h !== null).length,
          items: itemResults.filter(i => i !== null).length,
          roommates: roommateResults.filter(r => r !== null).length
        });

      } catch (err: any) {
        console.error('Error fetching favorites:', err);
        setError(err.message || 'Failed to load favorites');
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [user]);

  // Update document title
  useEffect(() => {
    document.title = `${t('favorites.title')} | ${t('app.name')}`;
  }, [t]);
  
  // Show login prompt if not authenticated
  if (!user) {
    return (
      <div className="container-custom py-8">
        <div className="flex items-center mb-8">
          <Heart className="h-8 w-8 text-primary-500 mr-3" />
          <h1 className="text-3xl font-bold">{t('favorites.title')}</h1>
        </div>
        <div className="text-center py-16 bg-gray-50 rounded-xl">
          <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-600 mb-2">Login Required</h3>
          <p className="text-gray-500 mb-6">Please login to view your favorites</p>
          <Link to="/login" className="btn-primary">
            Login
          </Link>
        </div>
      </div>
    );
  }

  // Show access denied for non-students
  if (user.role !== 'student') {
    return (
      <div className="container-custom py-8">
        <div className="flex items-center mb-8">
          <Heart className="h-8 w-8 text-primary-500 mr-3" />
          <h1 className="text-3xl font-bold">{t('favorites.title')}</h1>
        </div>
        <div className="text-center py-16 bg-gray-50 rounded-xl">
          <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-600 mb-2">Access Restricted</h3>
          <p className="text-gray-500 mb-6">
            Favorites are only available for student accounts.
            {user.role === 'owner' && ' As a property owner, you can manage your properties from your dashboard.'}
            {user.role === 'admin' && ' As an admin, you can manage the platform from your admin dashboard.'}
          </p>
          <Link
            to={user.role === 'admin' ? '/dashboard/admin' : user.role === 'owner' ? '/dashboard/owner' : '/dashboard'}
            className="btn-primary"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div className="container-custom py-8">
        <div className="flex items-center mb-8">
          <Heart className="h-8 w-8 text-primary-500 mr-3" />
          <h1 className="text-3xl font-bold">{t('favorites.title')}</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="container-custom py-8">
        <div className="flex items-center mb-8">
          <Heart className="h-8 w-8 text-primary-500 mr-3" />
          <h1 className="text-3xl font-bold">{t('favorites.title')}</h1>
        </div>
        <div className="text-center py-16 bg-red-50 rounded-xl">
          <Heart className="h-16 w-16 text-red-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-red-600 mb-2">Error Loading Favorites</h3>
          <p className="text-red-500 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <div className="flex items-center mb-8">
        <Heart className="h-8 w-8 text-primary-500 mr-3" />
        <h1 className="text-3xl font-bold">{t('favorites.title')}</h1>
      </div>
      
      {/* Tabs */}
      <div className="flex border-b mb-8 overflow-x-auto">
        <button
          onClick={() => setActiveTab('housing')}
          className={`flex items-center px-6 py-3 border-b-2 font-medium whitespace-nowrap ${
            activeTab === 'housing'
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Building size={20} className="mr-2" />
          {t('favorites.housing')}
          <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-sm">
            {favoriteHousingListings.length}
          </span>
        </button>
        
        <button
          onClick={() => setActiveTab('items')}
          className={`flex items-center px-6 py-3 border-b-2 font-medium whitespace-nowrap ${
            activeTab === 'items'
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <ShoppingBag size={20} className="mr-2" />
          {t('favorites.items')}
          <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-sm">
            {favoriteItemListings.length}
          </span>
        </button>
        
        <button
          onClick={() => setActiveTab('roommates')}
          className={`flex items-center px-6 py-3 border-b-2 font-medium whitespace-nowrap ${
            activeTab === 'roommates'
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Users size={20} className="mr-2" />
          {t('favorites.roommates')}
          <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-sm">
            {favoriteRoommateProfiles.length}
          </span>
        </button>
      </div>
      
      {/* Content */}
      <div>
        {/* Housing Tab */}
        {activeTab === 'housing' && (
          <div>
            {favoriteHousingListings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favoriteHousingListings.map(housing => (
                  <HousingCard
                    key={housing.id}
                    housing={housing}
                    isFavorited={true}
                    onToggleFavorite={handleToggleHousingFavorite}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-gray-50 rounded-xl">
                <Building className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-600 mb-2">{t('favorites.empty')}</h3>
                <p className="text-gray-500 mb-6">Browse housing listings to add some to your favorites</p>
                <Link to="/housing" className="btn-primary">
                  Browse Housing
                </Link>
              </div>
            )}
          </div>
        )}
        
        {/* Items Tab */}
        {activeTab === 'items' && (
          <div>
            {favoriteItemListings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favoriteItemListings.map(item => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    isFavorited={true}
                    onToggleFavorite={handleToggleItemFavorite}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-gray-50 rounded-xl">
                <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-600 mb-2">{t('favorites.empty')}</h3>
                <p className="text-gray-500 mb-6">Browse items to add some to your favorites</p>
                <Link to="/items" className="btn-primary">
                  Browse Items
                </Link>
              </div>
            )}
          </div>
        )}
        
        {/* Roommates Tab */}
        {activeTab === 'roommates' && (
          <div>
            {favoriteRoommateProfiles.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {favoriteRoommateProfiles.map(profile => (
                  <RoommateCard
                    key={profile.id}
                    roommate={profile}
                    isFavorited={true}
                    onToggleFavorite={handleToggleRoommateFavorite}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-gray-50 rounded-xl">
                <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-600 mb-2">{t('favorites.empty')}</h3>
                <p className="text-gray-500 mb-6">Browse roommate profiles to add some to your favorites</p>
                <Link to="/roommates" className="btn-primary">
                  Browse Roommates
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;