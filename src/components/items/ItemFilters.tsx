import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Filter, X, Check } from 'lucide-react';
import { moroccanCities } from '../../data/mockData';

export type ItemFilters = {
  priceRange: [number, number];
  category: string | null;
  condition: string | null;
  city: string | null;
  isFree: boolean | null;
};

interface ItemFiltersProps {
  filters: ItemFilters;
  onFilterChange: (filters: ItemFilters) => void;
  onFilterReset: () => void;
}

const ItemFilters = ({ filters, onFilterChange, onFilterReset }: ItemFiltersProps) => {
  const { t } = useTranslation();
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  
  // Categories and conditions from translations
  const categories = [
    { value: 'textbooks', label: t('items.categories.textbooks') },
    { value: 'furniture', label: t('items.categories.furniture') },
    { value: 'electronics', label: t('items.categories.electronics') },
    { value: 'clothing', label: t('items.categories.clothing') },
    { value: 'kitchenware', label: t('items.categories.kitchenware') },
    { value: 'other', label: t('items.categories.other') }
  ];
  
  const conditions = [
    { value: 'new', label: t('items.conditions.new') },
    { value: 'like_new', label: t('items.conditions.likeNew') },
    { value: 'good', label: t('items.conditions.good') },
    { value: 'fair', label: t('items.conditions.fair') },
    { value: 'poor', label: t('items.conditions.poor') }
  ];
  
  const handlePriceChange = (min: number, max: number) => {
    onFilterChange({ ...filters, priceRange: [min, max] });
  };
  
  const handleCategoryChange = (category: string) => {
    onFilterChange({ ...filters, category: category === filters.category ? null : category });
  };
  
  const handleConditionChange = (condition: string) => {
    onFilterChange({ ...filters, condition: condition === filters.condition ? null : condition });
  };
  
  const handleCityChange = (city: string) => {
    onFilterChange({ ...filters, city: city || null });
  };
  
  const handleFreeChange = (isFree: boolean | null) => {
    onFilterChange({ ...filters, isFree });
  };
  
  const toggleMobileFilters = () => {
    setIsMobileFiltersOpen(!isMobileFiltersOpen);
  };
  
  return (
    <>
      {/* Mobile Filter Button */}
      <div className="md:hidden mb-4">
        <button
          onClick={toggleMobileFilters}
          className="w-full btn flex items-center justify-center space-x-2 border border-gray-300"
        >
          <Filter size={18} />
          <span>{t('common.filter')}</span>
        </button>
      </div>
      
      {/* Mobile Filter Drawer */}
      <div className={`fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300 md:hidden ${
        isMobileFiltersOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}>
        <div className={`fixed inset-y-0 right-0 max-w-xs w-full bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
          isMobileFiltersOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold text-lg">{t('items.filters.title')}</h3>
            <button onClick={toggleMobileFilters} className="p-2 rounded-full hover:bg-gray-100">
              <X size={20} />
            </button>
          </div>
          
          <div className="p-4 overflow-y-auto h-full pb-32">
            {/* Mobile filter content - same as desktop but in a column */}
            <div className="space-y-6">
              {/* Price Range Filter */}
              <div>
                <h4 className="font-medium mb-2">{t('items.filters.price')}</h4>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="0"
                    placeholder="Min"
                    className="form-input w-full"
                    value={filters.priceRange[0] || ''}
                    onChange={(e) => handlePriceChange(Number(e.target.value), filters.priceRange[1])}
                  />
                  <span>-</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="Max"
                    className="form-input w-full"
                    value={filters.priceRange[1] || ''}
                    onChange={(e) => handlePriceChange(filters.priceRange[0], Number(e.target.value))}
                  />
                </div>
              </div>
              
              {/* Category Filter */}
              <div>
                <h4 className="font-medium mb-2">{t('items.filters.category')}</h4>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map(category => (
                    <button
                      key={category.value}
                      type="button"
                      onClick={() => handleCategoryChange(category.value)}
                      className={`px-3 py-2 text-sm rounded-lg border ${
                        filters.category === category.value
                          ? 'bg-primary-50 border-primary-500 text-primary-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {category.label}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Condition Filter */}
              <div>
                <h4 className="font-medium mb-2">{t('items.filters.condition')}</h4>
                <div className="space-y-2">
                  {conditions.map(condition => (
                    <button
                      key={condition.value}
                      type="button"
                      onClick={() => handleConditionChange(condition.value)}
                      className={`px-3 py-2 text-sm w-full text-left rounded-lg border flex items-center ${
                        filters.condition === condition.value
                          ? 'bg-primary-50 border-primary-500 text-primary-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {filters.condition === condition.value && <Check size={16} className="mr-2" />}
                      {condition.label}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* City Filter */}
              <div>
                <h4 className="font-medium mb-2">City</h4>
                <select
                  className="form-input w-full"
                  value={filters.city || ''}
                  onChange={(e) => handleCityChange(e.target.value)}
                >
                  <option value="">All Cities</option>
                  {moroccanCities.map((city, index) => (
                    <option key={index} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Free Items Filter */}
              <div>
                <h4 className="font-medium mb-2">Price Type</h4>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => handleFreeChange(filters.isFree === false ? null : false)}
                    className={`px-4 py-2 rounded-lg border flex items-center ${
                      filters.isFree === false
                        ? 'bg-primary-50 border-primary-500 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {filters.isFree === false && <Check size={16} className="mr-1" />}
                    Paid
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFreeChange(filters.isFree === true ? null : true)}
                    className={`px-4 py-2 rounded-lg border flex items-center ${
                      filters.isFree === true
                        ? 'bg-primary-50 border-primary-500 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {filters.isFree === true && <Check size={16} className="mr-1" />}
                    Free
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Mobile Filter Action Buttons */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t flex space-x-4">
            <button
              onClick={onFilterReset}
              className="flex-1 btn border border-gray-300"
            >
              {t('items.filters.clear')}
            </button>
            <button
              onClick={toggleMobileFilters}
              className="flex-1 btn-primary"
            >
              {t('items.filters.apply')}
            </button>
          </div>
        </div>
      </div>
      
      {/* Desktop Filter Sidebar */}
      <div className="hidden md:block bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-semibold text-lg">{t('items.filters.title')}</h3>
          <button 
            onClick={onFilterReset}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            {t('items.filters.clear')}
          </button>
        </div>
        
        <div className="space-y-6">
          {/* Price Range Filter */}
          <div>
            <h4 className="font-medium mb-2">{t('items.filters.price')}</h4>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="0"
                placeholder="Min"
                className="form-input w-full"
                value={filters.priceRange[0] || ''}
                onChange={(e) => handlePriceChange(Number(e.target.value), filters.priceRange[1])}
              />
              <span>-</span>
              <input
                type="number"
                min="0"
                placeholder="Max"
                className="form-input w-full"
                value={filters.priceRange[1] || ''}
                onChange={(e) => handlePriceChange(filters.priceRange[0], Number(e.target.value))}
              />
            </div>
          </div>
          
          <hr />
          
          {/* Category Filter */}
          <div>
            <h4 className="font-medium mb-2">{t('items.filters.category')}</h4>
            <div className="space-y-2">
              {categories.map(category => (
                <button
                  key={category.value}
                  type="button"
                  onClick={() => handleCategoryChange(category.value)}
                  className={`px-3 py-2 text-sm w-full text-left rounded-lg border flex items-center ${
                    filters.category === category.value
                      ? 'bg-primary-50 border-primary-500 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {filters.category === category.value && <Check size={16} className="mr-2" />}
                  {category.label}
                </button>
              ))}
            </div>
          </div>
          
          <hr />
          
          {/* Condition Filter */}
          <div>
            <h4 className="font-medium mb-2">{t('items.filters.condition')}</h4>
            <div className="space-y-2">
              {conditions.map(condition => (
                <button
                  key={condition.value}
                  type="button"
                  onClick={() => handleConditionChange(condition.value)}
                  className={`px-3 py-2 text-sm w-full text-left rounded-lg border flex items-center ${
                    filters.condition === condition.value
                      ? 'bg-primary-50 border-primary-500 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {filters.condition === condition.value && <Check size={16} className="mr-2" />}
                  {condition.label}
                </button>
              ))}
            </div>
          </div>
          
          <hr />
          
          {/* City Filter */}
          <div>
            <h4 className="font-medium mb-2">City</h4>
            <select
              className="form-input w-full"
              value={filters.city || ''}
              onChange={(e) => handleCityChange(e.target.value)}
            >
              <option value="">All Cities</option>
              {moroccanCities.map((city, index) => (
                <option key={index} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
          
          <hr />
          
          {/* Free Items Filter */}
          <div>
            <h4 className="font-medium mb-2">Price Type</h4>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => handleFreeChange(filters.isFree === false ? null : false)}
                className={`px-4 py-2 rounded-lg border flex items-center ${
                  filters.isFree === false
                    ? 'bg-primary-50 border-primary-500 text-primary-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {filters.isFree === false && <Check size={16} className="mr-1" />}
                Paid
              </button>
              <button
                type="button"
                onClick={() => handleFreeChange(filters.isFree === true ? null : true)}
                className={`px-4 py-2 rounded-lg border flex items-center ${
                  filters.isFree === true
                    ? 'bg-primary-50 border-primary-500 text-primary-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {filters.isFree === true && <Check size={16} className="mr-1" />}
                Free
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ItemFilters;

export { ItemFilters }