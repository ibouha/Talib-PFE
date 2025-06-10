import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, ArrowUpDown } from 'lucide-react';
import { roommateProfiles } from '../data/mockData';
import RoommateCard, { RoommateProfile } from '../components/roommates/RoommateCard';
import RoommateFilters, { RoommateFilters as RoommateFiltersType } from '../components/roommates/RoomateFilters';

const Roommates = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProfiles, setFilteredProfiles] = useState<RoommateProfile[]>(roommateProfiles);
  const [sortOption, setSortOption] = useState('newest');
  const [filters, setFilters] = useState<RoommateFiltersType>({
    ageRange: [18, 40],
    gender: null,
    university: null,
    city: null,
    budgetRange: [0, 0],
    lookingFor: null,
    lifestyle: [],
    preferences: {
      smoking: null,
      pets: null,
    },
  });
  
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
    
    // Apply age filter
    results = results.filter(profile => 
      profile.age >= filters.ageRange[0] && profile.age <= filters.ageRange[1]
    );
    
    // Apply gender filter
    if (filters.gender) {
      results = results.filter(profile => profile.gender === filters.gender);
    }
    
    // Apply university filter
    if (filters.university) {
      results = results.filter(profile => profile.university === filters.university);
    }
    
    // Apply city filter
    if (filters.city) {
      results = results.filter(profile => profile.location.includes(filters.city as string));
    }
    
    // Apply budget filter
    if (filters.budgetRange[0] > 0) {
      results = results.filter(profile => profile.budget >= filters.budgetRange[0]);
    }
    
    if (filters.budgetRange[1] > 0) {
      results = results.filter(profile => profile.budget <= filters.budgetRange[1]);
    }
    
    // Apply looking for filter
    if (filters.lookingFor) {
      results = results.filter(profile => profile.lookingFor === filters.lookingFor);
    }
    
    // Apply lifestyle filters
    if (filters.lifestyle.length > 0) {
      results = results.filter(profile => 
        filters.lifestyle.some(lifestyle => profile.lifestyle.includes(lifestyle))
      );
    }
    
    // Apply preference filters
    if (filters.preferences.smoking !== null) {
      results = results.filter(profile => profile.preferences.smoking === filters.preferences.smoking);
    }
    
    if (filters.preferences.pets !== null) {
      results = results.filter(profile => profile.preferences.pets === filters.preferences.pets);
    }
    
    // Apply sorting
    results = [...results].sort((a, b) => {
      switch (sortOption) {
        case 'budgetAsc':
          return a.budget - b.budget;
        case 'budgetDesc':
          return b.budget - a.budget;
        case 'ageAsc':
          return a.age - b.age;
        case 'ageDesc':
          return b.age - a.age;
        case 'newest':
        default:
          return new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime();
      }
    });
    
    setFilteredProfiles(results);
  }, [searchTerm, filters, sortOption]);
  
  // Reset all filters
  const resetFilters = () => {
    setFilters({
      ageRange: [18, 40],
      gender: null,
      university: null,
      city: null,
      budgetRange: [0, 0],
      lookingFor: null,
      lifestyle: [],
      preferences: {
        smoking: null,
        pets: null,
      },
    });
    setSearchTerm('');
    setSortOption('newest');
  };
  
  return (
    <div className="container-custom py-8">
      <h1 className="text-3xl font-bold mb-6">{t('roommates.title')}</h1>
      
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
        
        {/* Sort Dropdown */}
        <div className="relative">
          <div className="flex items-center space-x-1">
            <ArrowUpDown size={18} className="text-gray-500" />
            <select
              className="form-input py-2 pr-8 appearance-none bg-transparent border-none focus:ring-0"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="newest">Newest</option>
              <option value="budgetAsc">Budget (Low to High)</option>
              <option value="budgetDesc">Budget (High to Low)</option>
              <option value="ageAsc">Age (Young to Old)</option>
              <option value="ageDesc">Age (Old to Young)</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Results Count */}
      <p className="mb-6 text-gray-600">
        {t('common.results', { count: filteredProfiles.length })}
      </p>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className="w-full md:w-64">
          <RoommateFilters 
            filters={filters} 
            onFilterChange={setFilters}
            onFilterReset={resetFilters}
          />
        </div>
        
        {/* Roommate Profiles Grid */}
        <div className="flex-grow">
          {filteredProfiles.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredProfiles.map(profile => (
                <RoommateCard 
                  key={profile.id} 
                  roommate={profile}
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