import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { Housing as HousingType } from '../services/api';
import housingService from '../services/housingService';
import { useAuth } from '../contexts/AuthContext';
import { useFavorites } from '../contexts/FavoritesContext';
import HousingCard, { HousingListing } from '../components/housing/HousingCard';
import HousingFilters from '../components/housing/HousingFilters';

const Housing = () => {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const { favoriteHousing, toggleHousingFavorite } = useFavorites();
  const [searchTerm, setSearchTerm] = useState('');
  const [housingListings, setHousingListings] = useState<HousingListing[]>([]);
  const [filteredListings, setFilteredListings] = useState<HousingListing[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [sortOption, setSortOption] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    priceRange: [0, 0] as [number, number],
    city: null as string | null,
    type: null as string | null,
    bedrooms: null as number | null,
    bathrooms: null as number | null,
    furnished: null as boolean | null,
  });

  // Update document title
  useEffect(() => {
    document.title = `${t('housing.title')} | ${t('app.name')}`;
  }, [t]);

  // Fetch housing data from backend
  useEffect(() => {
    fetchHousingData();
  }, []);



  // Convert backend Housing to HousingListing format
  const convertToHousingListing = (housing: HousingType): HousingListing => {
    return {
      id: housing.id,
      title: housing.title,
      description: housing.description,
      price: housing.price,
      city: housing.city,
      address: housing.address,
      type: housing.type,
      bedrooms: housing.bedrooms,
      bathrooms: housing.bathrooms,
      area: housing.area,
      furnished: housing.is_furnished,
      amenities: housing.amenities ? housing.amenities.split(',').map(a => a.trim()) : [],
      images: housing.images && housing.images.length > 0 ? housing.images : [],
      ownerId: housing.owner_id,
      postedDate: housing.created_at,
      available: housing.status !== 'rented'
    };
  };

  const fetchHousingData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching housing from API...');
      const response = await housingService.getAll({ limit: 100 }); // Get all housing

      console.log('Housing API response:', response);

      if (response.success) {
        // Backend returns data in response.data.data format
        const housing = response.data.data || response.data.housing || [];
        console.log('Parsed housing data:', housing);
        const convertedHousing = housing.map(convertToHousingListing);
        console.log('Converted housing listings:', convertedHousing);
        setHousingListings(convertedHousing);
        setFilteredListings(convertedHousing);
      } else {
        console.error('Housing API failed:', response.message);
        setError(response.message || 'Failed to fetch housing data');
      }
    } catch (err: any) {
      console.error('Housing API error:', err);
      setError(err.message || 'Failed to fetch housing data');
    } finally {
      setLoading(false);
    }
  };


  
  // Filter housing listings based on search term and filters
  useEffect(() => {
    let results = housingListings;
    
    // Apply search term
    if (searchTerm) {
      results = results.filter(
        housing => 
          housing.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
          housing.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          housing.city.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply filters
    if (filters.priceRange[0] > 0) {
      results = results.filter(housing => housing.price >= filters.priceRange[0]);
    }
    
    if (filters.priceRange[1] > 0) {
      results = results.filter(housing => housing.price <= filters.priceRange[1]);
    }
    
    if (filters.city) {
      results = results.filter(housing => housing.city === filters.city);
    }
    
    if (filters.type) {
      results = results.filter(housing => housing.type === filters.type);
    }
    
    if (filters.bedrooms) {
      results = results.filter(housing => 
        filters.bedrooms === 5 ? housing.bedrooms >= 5 : housing.bedrooms === filters.bedrooms
      );
    }
    
    if (filters.bathrooms) {
      results = results.filter(housing => 
        filters.bathrooms === 4 ? housing.bathrooms >= 4 : housing.bathrooms === filters.bathrooms
      );
    }
    
    if (filters.furnished !== null) {
      results = results.filter(housing => housing.furnished === filters.furnished);
    }

    // Apply sorting
    results = [...results].sort((a, b) => {
      switch (sortOption) {
        case 'priceAsc':
          return a.price - b.price;
        case 'priceDesc':
          return b.price - a.price;
        case 'newest':
        default:
          return new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime();
      }
    });
    
    setFilteredListings(results);
  }, [searchTerm, filters, sortOption]);
  

  
  // Toggle filters panel on mobile
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };
  
  // Reset all filters
  const resetFilters = () => {
    setFilters({
      priceRange: [0, 0],
      city: null,
      type: null,
      bedrooms: null,
      bathrooms: null,
      furnished: null,
    });
    setSearchTerm('');
    setSortOption('newest');
  };
  
  return (
    <div className="container-custom py-8">
      <h1 className="text-3xl font-bold mb-6">{t('housing.title')}</h1>
      
      {/* Top Search and Sort Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0 mb-6">
        {/* Search */}
        <div className="relative flex-grow max-w-md">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search size={20} className="text-gray-400" />
          </div>
          <input
            type="text"
            className="form-input pl-10"
            placeholder={t('common.search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {/* Sort and Filter Controls */}
        <div className="flex items-center space-x-3">
          {/* Mobile Filter Toggle */}
          <button
            onClick={toggleFilters}
            className="md:hidden btn flex items-center space-x-2 border border-gray-300"
          >
            <SlidersHorizontal size={18} />
            <span>{t('common.filter')}</span>
          </button>
          
          {/* Sort Dropdown */}
          <div className="relative">
            <div className="flex items-center space-x-1">
              <ArrowUpDown size={18} className="text-gray-500" />
              <select
                className="form-input py-2 pr-8 appearance-none bg-transparent border-none focus:ring-0"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="newest">{t('housing.sort.newest')}</option>
                <option value="priceAsc">{t('housing.sort.priceAsc')}</option>
                <option value="priceDesc">{t('housing.sort.priceDesc')}</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {/* Results Count */}
      <p className="mb-6 text-gray-600">
        {t('common.results', { count: filteredListings.length })}
      </p>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className={`w-full md:w-64 md:block ${showFilters ? 'block' : 'hidden'}`}>
          <HousingFilters 
            filters={filters} 
            onFilterChange={setFilters}
            onFilterReset={resetFilters}
          />
        </div>
        
        {/* Housing Listings Grid */}
        <div className="flex-grow">
          {filteredListings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredListings.map(housing => (
                <HousingCard
                  key={housing.id}
                  housing={housing}
                  isFavorited={favoriteHousing.includes(housing.id)}
                  onToggleFavorite={toggleHousingFavorite}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-medium text-gray-600 mb-2">{t('housing.noResults')}</h3>
              <p className="text-gray-500 mb-6">Try adjusting your filters or search terms</p>
              <button
                onClick={resetFilters}
                className="btn-primary"
              >
                {t('housing.filters.clear')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Housing;