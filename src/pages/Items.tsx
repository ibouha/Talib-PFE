import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { itemListings } from '../data/mockData';
import ItemCard, { ItemListing } from '../components/items/ItemsCard';
import ItemFilters from '../components/items/ItemFilters';

const Items = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredListings, setFilteredListings] = useState<ItemListing[]>(itemListings);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [sortOption, setSortOption] = useState('newest');
  const [filters, setFilters] = useState({
    priceRange: [0, 0] as [number, number],
    category: null as string | null,
    condition: null as string | null,
  });
  
  // Update document title
  useEffect(() => {
    document.title = `${t('items.title')} | ${t('app.name')}`;
  }, [t]);
  
  // Filter item listings based on search term and filters
  useEffect(() => {
    let results = itemListings;
    
    // Apply search term
    if (searchTerm) {
      results = results.filter(
        item => 
          item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
          item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply filters
    if (filters.priceRange[0] > 0) {
      results = results.filter(item => item.price >= filters.priceRange[0]);
    }
    
    if (filters.priceRange[1] > 0) {
      results = results.filter(item => item.price <= filters.priceRange[1]);
    }
    
    if (filters.category) {
      results = results.filter(item => item.category === filters.category);
    }
    
    if (filters.condition) {
      results = results.filter(item => item.condition === filters.condition);
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
  
  // Toggle favorite
  const toggleFavorite = (id: string) => {
    setFavoriteIds(prevIds => 
      prevIds.includes(id)
        ? prevIds.filter(prevId => prevId !== id)
        : [...prevIds, id]
    );
  };
  
  // Toggle filters panel on mobile
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };
  
  // Reset all filters
  const resetFilters = () => {
    setFilters({
      priceRange: [0, 0],
      category: null,
      condition: null,
    });
    setSearchTerm('');
    setSortOption('newest');
  };
  
  return (
    <div className="container-custom py-8">
      <h1 className="text-3xl font-bold mb-6">{t('items.title')}</h1>
      
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
                <option value="newest">{t('items.sort.newest')}</option>
                <option value="priceAsc">{t('items.sort.priceAsc')}</option>
                <option value="priceDesc">{t('items.sort.priceDesc')}</option>
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
          <ItemFilters 
            filters={filters} 
            onFilterChange={setFilters}
            onFilterReset={resetFilters}
          />
        </div>
        
        {/* Item Listings Grid */}
        <div className="flex-grow">
          {filteredListings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredListings.map(item => (
                <ItemCard 
                  key={item.id} 
                  item={item}
                  isFavorited={favoriteIds.includes(item.id)}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-medium text-gray-600 mb-2">{t('items.noResults')}</h3>
              <p className="text-gray-500 mb-6">Try adjusting your filters or search terms</p>
              <button
                onClick={resetFilters}
                className="btn-primary"
              >
                {t('items.filters.clear')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Items;