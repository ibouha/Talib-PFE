import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, SlidersHorizontal, ArrowUpDown, X } from 'lucide-react';
import { Item } from '../services/api';
import itemsService from '../services/itemsService';
import { useAuth } from '../contexts/AuthContext';
import { useFavorites } from '../contexts/FavoritesContext';
import ItemCard, { ItemListing } from '../components/items/ItemCard';

const Items = () => {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const { favoriteItems, toggleItemFavorite } = useFavorites();
  const [searchTerm, setSearchTerm] = useState('');
  const [items, setItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [sortOption, setSortOption] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    category: '',
    condition: '',
    priceRange: [0, 1000] as [number, number],
    location: '',
    isFree: false,
  });

  // Update document title
  useEffect(() => {
    document.title = `${t('items.title')} | ${t('app.name')}`;
  }, [t]);

  // Fetch items data from backend
  useEffect(() => {
    fetchItemsData();
  }, []);





  // Convert backend Item to ItemListing format
  const convertToItemListing = (item: Item): ItemListing => {
    return {
      id: item.id,
      title: item.title,
      description: item.description,
      price: item.is_free ? 0 : Number(item.price),
      category: item.category,
      condition: item.condition_status || 'good',
      images: item.images && item.images.length > 0 ? item.images : ['data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNzUgMTIwSDIyNVYxODBIMTc1VjEyMFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHN2ZyB4PSIxODAiIHk9IjE0MCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjIwIj4KPHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCA0MCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIwIDEwTDE1IDVMMjUgNUwyMCAxMFoiIGZpbGw9IiM2QjcyODAiLz4KPC9zdmc+Cjwvc3ZnPgo8dGV4dCB4PSIyMDAiIHk9IjE5MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNkI3MjgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5ObyBJbWFnZTwvdGV4dD4KPC9zdmc+'],
      sellerId: item.student_id,
      city: item.location,
      postedDate: item.created_at,
      available: item.status === 'available'
    };
  };

  const fetchItemsData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching items from API...');
      const response = await itemsService.getAll({ limit: 100 });

      console.log('Items API response:', response);

      if (response.success) {
        // Backend returns data in response.data.data format
        const itemsData = response.data.data || response.data.items || [];
        console.log('Parsed items data:', itemsData);
        setItems(itemsData);
      } else {
        console.error('Items API failed:', response.message);
        setError(response.message || 'Failed to fetch items');
      }
    } catch (err: any) {
      console.error('Items API error:', err);
      setError(err.message || 'Failed to fetch items');
    } finally {
      setLoading(false);
    }
  };



  const applyFiltersAndSearch = useCallback(() => {
    let results = [...items];

    // Apply search
    if (searchTerm) {
      results = results.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply filters
    if (filters.category) {
      results = results.filter(item => item.category === filters.category);
    }

    if (filters.condition) {
      results = results.filter(item => item.condition_status === filters.condition);
    }

    if (filters.location) {
      results = results.filter(item =>
        item.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.isFree) {
      results = results.filter(item => item.is_free);
    } else {
      // Apply price range for non-free items
      results = results.filter(item =>
        item.is_free || (item.price >= filters.priceRange[0] && item.price <= filters.priceRange[1])
      );
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
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    setFilteredItems(results);
  }, [items, searchTerm, filters, sortOption]);

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      category: '',
      condition: '',
      priceRange: [0, 1000],
      location: '',
      isFree: false,
    });
    setSearchTerm('');
    setSortOption('newest');
  };

  // Apply filters and search
  useEffect(() => {
    applyFiltersAndSearch();
  }, [applyFiltersAndSearch]);



  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Items</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchItemsData}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <h1 className="text-3xl font-bold mb-6">Student Marketplace</h1>

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
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Sort and Filter Controls */}
        <div className="flex items-center space-x-3">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden btn flex items-center space-x-2 border border-gray-300"
          >
            <SlidersHorizontal size={18} />
            <span>Filters</span>
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
                <option value="newest">Newest First</option>
                <option value="priceAsc">Price: Low to High</option>
                <option value="priceDesc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <p className="mb-6 text-gray-600">
        Showing {filteredItems.length} of {items.length} items
      </p>

      {/* Mobile Filter Drawer */}
      <div className={`fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300 md:hidden ${
        showFilters ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}>
        <div className={`fixed inset-y-0 right-0 max-w-xs w-full bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
          showFilters ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold text-lg">{t('items.filters.title') || 'Filters'}</h3>
            <button onClick={() => setShowFilters(false)} className="p-2 rounded-full hover:bg-gray-100">
              <X size={20} />
            </button>
          </div>

          <div className="p-4 overflow-y-auto h-full pb-32">
            <div className="space-y-6">
              {/* Mobile filter content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">All Categories</option>
                  <option value="textbooks">Textbooks</option>
                  <option value="electronics">Electronics</option>
                  <option value="furniture">Furniture</option>
                  <option value="clothing">Clothing</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Condition</label>
                <select
                  value={filters.condition}
                  onChange={(e) => setFilters(prev => ({ ...prev, condition: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">All Conditions</option>
                  <option value="new">New</option>
                  <option value="like_new">Like New</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="poor">Poor</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  placeholder="Enter location"
                  value={filters.location}
                  onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.isFree}
                    onChange={(e) => setFilters(prev => ({ ...prev, isFree: e.target.checked }))}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">Free items only</span>
                </label>
              </div>
            </div>
          </div>

          {/* Mobile Filter Action Buttons */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t flex space-x-4">
            <button
              onClick={resetFilters}
              className="flex-1 btn border border-gray-300"
            >
              {t('items.filters.clear') || 'Clear'}
            </button>
            <button
              onClick={() => setShowFilters(false)}
              className="flex-1 btn-primary"
            >
              {t('items.filters.apply') || 'Apply'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Desktop Filters Sidebar */}
        <div className="hidden md:block w-64">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold text-lg">{t('items.filters.title') || 'Filters'}</h3>
              <button
                onClick={resetFilters}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                {t('items.filters.clear') || 'Clear'}
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">All Categories</option>
                  <option value="textbooks">Textbooks</option>
                  <option value="electronics">Electronics</option>
                  <option value="furniture">Furniture</option>
                  <option value="clothing">Clothing</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Condition</label>
                <select
                  value={filters.condition}
                  onChange={(e) => setFilters(prev => ({ ...prev, condition: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">All Conditions</option>
                  <option value="new">New</option>
                  <option value="like_new">Like New</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="poor">Poor</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  placeholder="Enter location"
                  value={filters.location}
                  onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.isFree}
                    onChange={(e) => setFilters(prev => ({ ...prev, isFree: e.target.checked }))}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">Free items only</span>
                </label>
              </div>


            </div>
          </div>
        </div>

        {/* Items Grid */}
        <div className="flex-grow">
          {filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <ItemCard
                  key={item.id}
                  item={convertToItemListing(item)}
                  isFavorited={favoriteItems.includes(item.id)}
                  onToggleFavorite={toggleItemFavorite}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-medium text-gray-600 mb-2">{t('items.noResults') || 'No items found'}</h3>
              <p className="text-gray-500 mb-6">Try adjusting your filters or search terms</p>
              <button
                onClick={resetFilters}
                className="btn-primary"
              >
                {t('items.filters.clear') || 'Clear Filters'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Items;
