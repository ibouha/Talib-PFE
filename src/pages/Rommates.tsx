import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, SlidersHorizontal } from 'lucide-react';
import { roommateProfiles, moroccanCities, moroccanUniversities } from '../data/mockData';
import RoommateCard, { RoommateProfile } from '../components/roommates/RoommateCard';

const Roommates = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProfiles, setFilteredProfiles] = useState<RoommateProfile[]>(roommateProfiles);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [selectedGender, setSelectedGender] = useState<string>('');
  const [ageRange, setAgeRange] = useState<[number, number]>([18, 40]);
  const [selectedUniversity, setSelectedUniversity] = useState<string>('');
  const [selectedLifestyles, setSelectedLifestyles] = useState<string[]>([]);
  
  // Update document title
  useEffect(() => {
    document.title = `${t('roommates.title')} | ${t('app.name')}`;
  }, [t]);
  
  // Filter roommate profiles based on search and filters
  useEffect(() => {
    let results = roommateProfiles;
    
    // Apply search term
    if (searchTerm) {
      results = results.filter(
        profile => 
          profile.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
          profile.bio.toLowerCase().includes(searchTerm.toLowerCase()) ||
          profile.university.toLowerCase().includes(searchTerm.toLowerCase()) ||
          profile.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply gender filter
    if (selectedGender) {
      results = results.filter(profile => profile.gender === selectedGender);
    }
    
    // Apply age filter
    results = results.filter(profile => 
      profile.age >= ageRange[0] && profile.age <= ageRange[1]
    );
    
    // Apply university filter
    if (selectedUniversity) {
      results = results.filter(profile => profile.university === selectedUniversity);
    }
    
    // Apply lifestyle filters
    if (selectedLifestyles.length > 0) {
      results = results.filter(profile => 
        selectedLifestyles.some(lifestyle => profile.lifestyle.includes(lifestyle))
      );
    }
    
    setFilteredProfiles(results);
  }, [searchTerm, selectedGender, ageRange, selectedUniversity, selectedLifestyles]);
  
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
    setSelectedGender('');
    setAgeRange([18, 40]);
    setSelectedUniversity('');
    setSelectedLifestyles([]);
    setSearchTerm('');
  };
  
  // Toggle lifestyle filter
  const toggleLifestyle = (lifestyle: string) => {
    setSelectedLifestyles(prev => 
      prev.includes(lifestyle)
        ? prev.filter(l => l !== lifestyle)
        : [...prev, lifestyle]
    );
  };
  
  // Lifestyle options
  const lifestyleOptions = [
    { value: 'early', label: t('roommates.lifestyle.early') },
    { value: 'night', label: t('roommates.lifestyle.night') },
    { value: 'quiet', label: t('roommates.lifestyle.quiet') },
    { value: 'social', label: t('roommates.lifestyle.social') },
    { value: 'clean', label: t('roommates.lifestyle.clean') }
  ];
  
  return (
    <div className="container-custom py-8">
      <h1 className="text-3xl font-bold mb-6">{t('roommates.title')}</h1>
      
      {/* Top Search and Filter Bar */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
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
        
        {/* Mobile Filter Toggle */}
        <button
          onClick={toggleFilters}
          className="md:hidden btn flex items-center space-x-2 border border-gray-300"
        >
          <SlidersHorizontal size={18} />
          <span>{t('common.filter')}</span>
        </button>
      </div>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters Panel */}
        <div className={`w-full md:w-64 md:block ${showFilters ? 'block' : 'hidden'}`}>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold text-lg">{t('roommates.filters.title')}</h3>
              <button 
                onClick={resetFilters}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                {t('roommates.filters.clear')}
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Gender Filter */}
              <div>
                <h4 className="font-medium mb-2">{t('roommates.filters.gender')}</h4>
                <select
                  className="form-input w-full"
                  value={selectedGender}
                  onChange={(e) => setSelectedGender(e.target.value)}
                >
                  <option value="">All Genders</option>
                  <option value="male">{t('roommates.gender.male')}</option>
                  <option value="female">{t('roommates.gender.female')}</option>
                  <option value="other">{t('roommates.gender.other')}</option>
                </select>
              </div>
              
              <hr />
              
              {/* Age Range Filter */}
              <div>
                <h4 className="font-medium mb-2">{t('roommates.filters.age')}</h4>
                <div className="flex items-center mb-1 justify-between">
                  <span className="text-sm text-gray-500">{ageRange[0]}</span>
                  <span className="text-sm text-gray-500">{ageRange[1]}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="range"
                    min="18"
                    max="40"
                    value={ageRange[0]}
                    onChange={(e) => setAgeRange([parseInt(e.target.value), ageRange[1]])}
                    className="w-full"
                  />
                  <input
                    type="range"
                    min="18"
                    max="40"
                    value={ageRange[1]}
                    onChange={(e) => setAgeRange([ageRange[0], parseInt(e.target.value)])}
                    className="w-full"
                  />
                </div>
              </div>
              
              <hr />
              
              {/* University Filter */}
              <div>
                <h4 className="font-medium mb-2">{t('roommates.filters.university')}</h4>
                <select
                  className="form-input w-full"
                  value={selectedUniversity}
                  onChange={(e) => setSelectedUniversity(e.target.value)}
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
              
              {/* Lifestyle Filter */}
              <div>
                <h4 className="font-medium mb-2">{t('roommates.filters.lifestyle')}</h4>
                <div className="flex flex-wrap gap-2">
                  {lifestyleOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => toggleLifestyle(option.value)}
                      className={`px-3 py-1.5 text-sm rounded-full border ${
                        selectedLifestyles.includes(option.value)
                          ? 'bg-primary-50 border-primary-500 text-primary-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Roommate Profiles Grid */}
        <div className="flex-grow">
          {/* Results Count */}
          <p className="mb-6 text-gray-600">
            {t('common.results', { count: filteredProfiles.length })}
          </p>
          
          {filteredProfiles.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredProfiles.map(profile => (
                <RoommateCard 
                  key={profile.id} 
                  roommate={profile}
                  isFavorited={favoriteIds.includes(profile.id)}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-medium text-gray-600 mb-2">{t('roommates.noResults')}</h3>
              <p className="text-gray-500 mb-6">Try adjusting your filters or search terms</p>
              <button
                onClick={resetFilters}
                className="btn-primary"
              >
                {t('roommates.filters.clear')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Roommates;