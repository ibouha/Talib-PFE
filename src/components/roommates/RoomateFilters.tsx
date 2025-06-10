import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Filter, X, Check } from 'lucide-react';
import { moroccanCities, moroccanUniversities } from '../../data/mockData';

export type RoommateFilters = {
  ageRange: [number, number];
  gender: string | null;
  university: string | null;
  city: string | null;
  budgetRange: [number, number];
  lookingFor: string | null;
  lifestyle: string[];
  preferences: {
    smoking: boolean | null;
    pets: boolean | null;
  };
};

interface RoommateFiltersProps {
  filters: RoommateFilters;
  onFilterChange: (filters: RoommateFilters) => void;
  onFilterReset: () => void;
}

const RoommateFilters = ({ filters, onFilterChange, onFilterReset }: RoommateFiltersProps) => {
  const { t } = useTranslation();
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  
  // Gender options
  const genderOptions = [
    { value: 'male', label: t('roommates.gender.male') },
    { value: 'female', label: t('roommates.gender.female') },
    { value: 'other', label: t('roommates.gender.other') }
  ];
  
  // Lifestyle options
  const lifestyleOptions = [
    { value: 'early', label: t('roommates.lifestyle.early') },
    { value: 'night', label: t('roommates.lifestyle.night') },
    { value: 'quiet', label: t('roommates.lifestyle.quiet') },
    { value: 'social', label: t('roommates.lifestyle.social') },
    { value: 'clean', label: t('roommates.lifestyle.clean') }
  ];
  
  // Looking for options
  const lookingForOptions = [
    { value: 'apartment', label: 'Apartment' },
    { value: 'house', label: 'House' },
    { value: 'studio', label: 'Studio' },
    { value: 'shared', label: 'Shared Room' }
  ];
  
  const handleAgeChange = (min: number, max: number) => {
    onFilterChange({ ...filters, ageRange: [min, max] });
  };
  
  const handleBudgetChange = (min: number, max: number) => {
    onFilterChange({ ...filters, budgetRange: [min, max] });
  };
  
  const handleGenderChange = (gender: string) => {
    onFilterChange({ ...filters, gender: gender || null });
  };
  
  const handleUniversityChange = (university: string) => {
    onFilterChange({ ...filters, university: university || null });
  };
  
  const handleCityChange = (city: string) => {
    onFilterChange({ ...filters, city: city || null });
  };
  
  const handleLookingForChange = (lookingFor: string) => {
    onFilterChange({ ...filters, lookingFor: lookingFor || null });
  };
  
  const handleLifestyleChange = (lifestyle: string) => {
    const newLifestyle = filters.lifestyle.includes(lifestyle)
      ? filters.lifestyle.filter(l => l !== lifestyle)
      : [...filters.lifestyle, lifestyle];
    onFilterChange({ ...filters, lifestyle: newLifestyle });
  };
  
  const handlePreferenceChange = (key: 'smoking' | 'pets', value: boolean | null) => {
    onFilterChange({ 
      ...filters, 
      preferences: { ...filters.preferences, [key]: value }
    });
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
            <h3 className="font-semibold text-lg">{t('roommates.filters.title')}</h3>
            <button onClick={toggleMobileFilters} className="p-2 rounded-full hover:bg-gray-100">
              <X size={20} />
            </button>
          </div>
          
          <div className="p-4 overflow-y-auto h-full pb-32">
            {/* Mobile filter content - same as desktop but in a column */}
            <div className="space-y-6">
              {/* Age Range Filter */}
              <div>
                <h4 className="font-medium mb-2">{t('roommates.filters.age')}</h4>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="18"
                    max="50"
                    placeholder="Min"
                    className="form-input w-full"
                    value={filters.ageRange[0] || ''}
                    onChange={(e) => handleAgeChange(Number(e.target.value), filters.ageRange[1])}
                  />
                  <span>-</span>
                  <input
                    type="number"
                    min="18"
                    max="50"
                    placeholder="Max"
                    className="form-input w-full"
                    value={filters.ageRange[1] || ''}
                    onChange={(e) => handleAgeChange(filters.ageRange[0], Number(e.target.value))}
                  />
                </div>
              </div>
              
              {/* Gender Filter */}
              <div>
                <h4 className="font-medium mb-2">{t('roommates.filters.gender')}</h4>
                <select
                  className="form-input w-full"
                  value={filters.gender || ''}
                  onChange={(e) => handleGenderChange(e.target.value)}
                >
                  <option value="">All Genders</option>
                  {genderOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* University Filter */}
              <div>
                <h4 className="font-medium mb-2">{t('roommates.filters.university')}</h4>
                <select
                  className="form-input w-full"
                  value={filters.university || ''}
                  onChange={(e) => handleUniversityChange(e.target.value)}
                >
                  <option value="">All Universities</option>
                  {moroccanUniversities.map((university, index) => (
                    <option key={index} value={university}>
                      {university}
                    </option>
                  ))}
                </select>
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
              
              {/* Budget Range Filter */}
              <div>
                <h4 className="font-medium mb-2">Budget Range (MAD)</h4>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="0"
                    placeholder="Min"
                    className="form-input w-full"
                    value={filters.budgetRange[0] || ''}
                    onChange={(e) => handleBudgetChange(Number(e.target.value), filters.budgetRange[1])}
                  />
                  <span>-</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="Max"
                    className="form-input w-full"
                    value={filters.budgetRange[1] || ''}
                    onChange={(e) => handleBudgetChange(filters.budgetRange[0], Number(e.target.value))}
                  />
                </div>
              </div>
              
              {/* Looking For Filter */}
              <div>
                <h4 className="font-medium mb-2">Looking For</h4>
                <select
                  className="form-input w-full"
                  value={filters.lookingFor || ''}
                  onChange={(e) => handleLookingForChange(e.target.value)}
                >
                  <option value="">Any Type</option>
                  {lookingForOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Lifestyle Filter */}
              <div>
                <h4 className="font-medium mb-2">{t('roommates.filters.lifestyle')}</h4>
                <div className="grid grid-cols-2 gap-2">
                  {lifestyleOptions.map(option => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleLifestyleChange(option.value)}
                      className={`px-3 py-2 text-sm rounded-lg border ${
                        filters.lifestyle.includes(option.value)
                          ? 'bg-primary-50 border-primary-500 text-primary-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Preferences Filter */}
              <div>
                <h4 className="font-medium mb-2">Preferences</h4>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-700 mb-2 block">Smoking</span>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => handlePreferenceChange('smoking', filters.preferences.smoking === true ? null : true)}
                        className={`px-3 py-1 rounded-lg border text-sm flex items-center ${
                          filters.preferences.smoking === true
                            ? 'bg-primary-50 border-primary-500 text-primary-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {filters.preferences.smoking === true && <Check size={14} className="mr-1" />}
                        OK
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePreferenceChange('smoking', filters.preferences.smoking === false ? null : false)}
                        className={`px-3 py-1 rounded-lg border text-sm flex items-center ${
                          filters.preferences.smoking === false
                            ? 'bg-primary-50 border-primary-500 text-primary-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {filters.preferences.smoking === false && <Check size={14} className="mr-1" />}
                        Not OK
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-sm text-gray-700 mb-2 block">Pets</span>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => handlePreferenceChange('pets', filters.preferences.pets === true ? null : true)}
                        className={`px-3 py-1 rounded-lg border text-sm flex items-center ${
                          filters.preferences.pets === true
                            ? 'bg-primary-50 border-primary-500 text-primary-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {filters.preferences.pets === true && <Check size={14} className="mr-1" />}
                        OK
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePreferenceChange('pets', filters.preferences.pets === false ? null : false)}
                        className={`px-3 py-1 rounded-lg border text-sm flex items-center ${
                          filters.preferences.pets === false
                            ? 'bg-primary-50 border-primary-500 text-primary-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {filters.preferences.pets === false && <Check size={14} className="mr-1" />}
                        Not OK
                      </button>
                    </div>
                  </div>
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
              {t('roommates.filters.clear')}
            </button>
            <button
              onClick={toggleMobileFilters}
              className="flex-1 btn-primary"
            >
              {t('roommates.filters.apply')}
            </button>
          </div>
        </div>
      </div>
      
      {/* Desktop Filter Sidebar */}
      <div className="hidden md:block bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-semibold text-lg">{t('roommates.filters.title')}</h3>
          <button 
            onClick={onFilterReset}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            {t('roommates.filters.clear')}
          </button>
        </div>
        
        <div className="space-y-6">
          {/* Age Range Filter */}
          <div>
            <h4 className="font-medium mb-2">{t('roommates.filters.age')}</h4>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="18"
                max="50"
                placeholder="Min"
                className="form-input w-full"
                value={filters.ageRange[0] || ''}
                onChange={(e) => handleAgeChange(Number(e.target.value), filters.ageRange[1])}
              />
              <span>-</span>
              <input
                type="number"
                min="18"
                max="50"
                placeholder="Max"
                className="form-input w-full"
                value={filters.ageRange[1] || ''}
                onChange={(e) => handleAgeChange(filters.ageRange[0], Number(e.target.value))}
              />
            </div>
          </div>
          
          <hr />
          
          {/* Gender Filter */}
          <div>
            <h4 className="font-medium mb-2">{t('roommates.filters.gender')}</h4>
            <select
              className="form-input w-full"
              value={filters.gender || ''}
              onChange={(e) => handleGenderChange(e.target.value)}
            >
              <option value="">All Genders</option>
              {genderOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <hr />
          
          {/* University Filter */}
          <div>
            <h4 className="font-medium mb-2">{t('roommates.filters.university')}</h4>
            <select
              className="form-input w-full"
              value={filters.university || ''}
              onChange={(e) => handleUniversityChange(e.target.value)}
            >
              <option value="">All Universities</option>
              {moroccanUniversities.map((university, index) => (
                <option key={index} value={university}>
                  {university}
                </option>
              ))}
            </select>
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
          
          {/* Budget Range Filter */}
          <div>
            <h4 className="font-medium mb-2">Budget Range (MAD)</h4>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="0"
                placeholder="Min"
                className="form-input w-full"
                value={filters.budgetRange[0] || ''}
                onChange={(e) => handleBudgetChange(Number(e.target.value), filters.budgetRange[1])}
              />
              <span>-</span>
              <input
                type="number"
                min="0"
                placeholder="Max"
                className="form-input w-full"
                value={filters.budgetRange[1] || ''}
                onChange={(e) => handleBudgetChange(filters.budgetRange[0], Number(e.target.value))}
              />
            </div>
          </div>
          
          <hr />
          
          {/* Looking For Filter */}
          <div>
            <h4 className="font-medium mb-2">Looking For</h4>
            <select
              className="form-input w-full"
              value={filters.lookingFor || ''}
              onChange={(e) => handleLookingForChange(e.target.value)}
            >
              <option value="">Any Type</option>
              {lookingForOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <hr />
          
          {/* Lifestyle Filter */}
          <div>
            <h4 className="font-medium mb-2">{t('roommates.filters.lifestyle')}</h4>
            <div className="space-y-2">
              {lifestyleOptions.map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleLifestyleChange(option.value)}
                  className={`px-3 py-2 text-sm w-full text-left rounded-lg border flex items-center ${
                    filters.lifestyle.includes(option.value)
                      ? 'bg-primary-50 border-primary-500 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {filters.lifestyle.includes(option.value) && <Check size={16} className="mr-2" />}
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          
          <hr />
          
          {/* Preferences Filter */}
          <div>
            <h4 className="font-medium mb-2">Preferences</h4>
            <div className="space-y-4">
              <div>
                <span className="text-sm text-gray-700 mb-2 block">Smoking</span>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => handlePreferenceChange('smoking', filters.preferences.smoking === true ? null : true)}
                    className={`px-3 py-2 rounded-lg border text-sm flex items-center ${
                      filters.preferences.smoking === true
                        ? 'bg-primary-50 border-primary-500 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {filters.preferences.smoking === true && <Check size={14} className="mr-1" />}
                    OK
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePreferenceChange('smoking', filters.preferences.smoking === false ? null : false)}
                    className={`px-3 py-2 rounded-lg border text-sm flex items-center ${
                      filters.preferences.smoking === false
                        ? 'bg-primary-50 border-primary-500 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {filters.preferences.smoking === false && <Check size={14} className="mr-1" />}
                    Not OK
                  </button>
                </div>
              </div>
              
              <div>
                <span className="text-sm text-gray-700 mb-2 block">Pets</span>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => handlePreferenceChange('pets', filters.preferences.pets === true ? null : true)}
                    className={`px-3 py-2 rounded-lg border text-sm flex items-center ${
                      filters.preferences.pets === true
                        ? 'bg-primary-50 border-primary-500 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {filters.preferences.pets === true && <Check size={14} className="mr-1" />}
                    OK
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePreferenceChange('pets', filters.preferences.pets === false ? null : false)}
                    className={`px-3 py-2 rounded-lg border text-sm flex items-center ${
                      filters.preferences.pets === false
                        ? 'bg-primary-50 border-primary-500 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {filters.preferences.pets === false && <Check size={14} className="mr-1" />}
                    Not OK
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RoommateFilters;

export { RoommateFilters }