import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Filter, X, Check } from 'lucide-react';
// Moroccan cities list
const moroccanCities = [
  'Casablanca', 'Rabat', 'Marrakech', 'Fes', 'Tangier', 'Agadir',
  'Meknes', 'Oujda', 'Kenitra', 'Tetouan'
];

export type HousingFilters = {
  priceRange: [number, number];
  city: string | null;
  type: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  furnished: boolean | null;
};

interface HousingFiltersProps {
  filters: HousingFilters;
  onFilterChange: (filters: HousingFilters) => void;
  onFilterReset: () => void;
}

const HousingFilters = ({ filters, onFilterChange, onFilterReset }: HousingFiltersProps) => {
  const { t } = useTranslation();
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  
  // Housing types from translations
  const housingTypes = [
    { value: 'apartment', label: t('housing.types.apartment') },
    { value: 'house', label: t('housing.types.house') },
    { value: 'studio', label: t('housing.types.studio') },
    { value: 'dormitory', label: t('housing.types.dormitory') },
    { value: 'shared', label: t('housing.types.shared') }
  ];
  
  const handlePriceChange = (min: number, max: number) => {
    onFilterChange({ ...filters, priceRange: [min, max] });
  };
  
  const handleCityChange = (city: string) => {
    onFilterChange({ ...filters, city: city || null });
  };
  
  const handleTypeChange = (type: string) => {
    onFilterChange({ ...filters, type: type || null });
  };
  
  const handleBedroomChange = (bedrooms: number) => {
    onFilterChange({ ...filters, bedrooms: bedrooms || null });
  };
  
  const handleBathroomChange = (bathrooms: number) => {
    onFilterChange({ ...filters, bathrooms: bathrooms || null });
  };
  
  const handleFurnishedChange = (furnished: boolean | null) => {
    onFilterChange({ ...filters, furnished });
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
            <h3 className="font-semibold text-lg">{t('housing.filters.title')}</h3>
            <button onClick={toggleMobileFilters} className="p-2 rounded-full hover:bg-gray-100">
              <X size={20} />
            </button>
          </div>
          
          <div className="p-4 overflow-y-auto h-full pb-32">
            {/* Mobile filter content - same as desktop but in a column */}
            <div className="space-y-6">
              {/* Price Range Filter */}
              <div>
                <h4 className="font-medium mb-2">{t('housing.filters.price')}</h4>
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
              
              {/* City Filter */}
              <div>
                <h4 className="font-medium mb-2">{t('housing.filters.location')}</h4>
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
              
              {/* Property Type Filter */}
              <div>
                <h4 className="font-medium mb-2">{t('housing.filters.type')}</h4>
                <div className="grid grid-cols-2 gap-2">
                  {housingTypes.map(type => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => handleTypeChange(filters.type === type.value ? '' : type.value)}
                      className={`px-3 py-2 text-sm rounded-lg border ${
                        filters.type === type.value
                          ? 'bg-primary-50 border-primary-500 text-primary-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Bedrooms Filter */}
              <div>
                <h4 className="font-medium mb-2">{t('housing.filters.bedrooms')}</h4>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, '5+'].map((num, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleBedroomChange(num === '5+' ? 5 : (filters.bedrooms === Number(num) ? 0 : Number(num)))}
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        filters.bedrooms === (num === '5+' ? 5 : Number(num))
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Bathrooms Filter */}
              <div>
                <h4 className="font-medium mb-2">{t('housing.filters.bathrooms')}</h4>
                <div className="flex space-x-2">
                  {[1, 2, 3, '4+'].map((num, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleBathroomChange(num === '4+' ? 4 : (filters.bathrooms === Number(num) ? 0 : Number(num)))}
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        filters.bathrooms === (num === '4+' ? 4 : Number(num))
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Furnished Filter */}
              <div>
                <h4 className="font-medium mb-2">{t('housing.filters.furnished')}</h4>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => handleFurnishedChange(filters.furnished === true ? null : true)}
                    className={`px-4 py-2 rounded-lg border flex items-center ${
                      filters.furnished === true
                        ? 'bg-primary-50 border-primary-500 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {filters.furnished === true && <Check size={16} className="mr-1" />}
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFurnishedChange(filters.furnished === false ? null : false)}
                    className={`px-4 py-2 rounded-lg border flex items-center ${
                      filters.furnished === false
                        ? 'bg-primary-50 border-primary-500 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {filters.furnished === false && <Check size={16} className="mr-1" />}
                    No
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
              {t('housing.filters.clear')}
            </button>
            <button
              onClick={toggleMobileFilters}
              className="flex-1 btn-primary"
            >
              {t('housing.filters.apply')}
            </button>
          </div>
        </div>
      </div>
      
      {/* Desktop Filter Sidebar */}
      <div className="hidden md:block bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-semibold text-lg">{t('housing.filters.title')}</h3>
          <button 
            onClick={onFilterReset}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            {t('housing.filters.clear')}
          </button>
        </div>
        
        <div className="space-y-6">
          {/* Price Range Filter */}
          <div>
            <h4 className="font-medium mb-2">{t('housing.filters.price')}</h4>
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
          
          {/* City Filter */}
          <div>
            <h4 className="font-medium mb-2">{t('housing.filters.location')}</h4>
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
          
          {/* Property Type Filter */}
          <div>
            <h4 className="font-medium mb-2">{t('housing.filters.type')}</h4>
            <div className="space-y-2">
              {housingTypes.map(type => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => handleTypeChange(filters.type === type.value ? '' : type.value)}
                  className={`px-3 py-2 text-sm w-full text-left rounded-lg border ${
                    filters.type === type.value
                      ? 'bg-primary-50 border-primary-500 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>
          
          <hr />
          
          {/* Bedrooms Filter */}
          <div>
            <h4 className="font-medium mb-2">{t('housing.filters.bedrooms')}</h4>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, '5+'].map((num, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleBedroomChange(num === '5+' ? 5 : (filters.bedrooms === Number(num) ? 0 : Number(num)))}
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    filters.bedrooms === (num === '5+' ? 5 : Number(num))
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
          
          <hr />
          
          {/* Bathrooms Filter */}
          <div>
            <h4 className="font-medium mb-2">{t('housing.filters.bathrooms')}</h4>
            <div className="flex space-x-2">
              {[1, 2, 3, '4+'].map((num, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleBathroomChange(num === '4+' ? 4 : (filters.bathrooms === Number(num) ? 0 : Number(num)))}
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    filters.bathrooms === (num === '4+' ? 4 : Number(num))
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
          
          <hr />
          
          {/* Furnished Filter */}
          <div>
            <h4 className="font-medium mb-2">{t('housing.filters.furnished')}</h4>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => handleFurnishedChange(filters.furnished === true ? null : true)}
                className={`px-4 py-2 rounded-lg border flex items-center ${
                  filters.furnished === true
                    ? 'bg-primary-50 border-primary-500 text-primary-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {filters.furnished === true && <Check size={16} className="mr-1" />}
                Yes
              </button>
              <button
                type="button"
                onClick={() => handleFurnishedChange(filters.furnished === false ? null : false)}
                className={`px-4 py-2 rounded-lg border flex items-center ${
                  filters.furnished === false
                    ? 'bg-primary-50 border-primary-500 text-primary-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {filters.furnished === false && <Check size={16} className="mr-1" />}
                No
              </button>
            </div>
          </div>
          
          {/* Apply Filters Button - Only needed on mobile */}
          <button
            className="btn-primary w-full mt-6 md:hidden"
            onClick={toggleMobileFilters}
          >
            {t('housing.filters.apply')}
          </button>
        </div>
      </div>
    </>
  );
};

export default HousingFilters;