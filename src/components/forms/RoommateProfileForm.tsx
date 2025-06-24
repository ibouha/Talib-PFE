import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { Users, DollarSign, Upload, X, Plus, User } from 'lucide-react';
// Moroccan cities and universities lists
const moroccanCities = [
  'Casablanca', 'Rabat', 'Marrakech', 'Fes', 'Tangier', 'Agadir',
  'Meknes', 'Oujda', 'Kenitra', 'Tetouan'
];

const moroccanUniversities = [
  'Mohammed V University in Rabat',
  'Hassan II University of Casablanca',
  'Cadi Ayyad University',
  'Ibn Tofail University',
  'Abdelmalek Essaâdi University',
  'Mohammed First University',
  'Ibn Zohr University',
  'Moulay Ismail University',
  'International University of Rabat',
  'Al Akhawayn University'
];

type RoommateProfileData = {
  name: string;
  age: number;
  gender: string;
  university: string;
  program: string;
  year: number;
  bio: string;
  interests: string[];
  lifestyle: string[];
  preferences: {
    smoking: boolean;
    pets: boolean;
    gender: string;
    studyHabits: string;
  };
  budget: number;
  lookingFor: string;
  location: string;
  phone: string; 
  moveInDate: string; 
  avatar: FileList;
};

interface RoommateProfileFormProps {
  onSubmit: (data: RoommateProfileData) => void;
  initialData?: Partial<RoommateProfileData>;
  isEditing?: boolean;
}

const RoommateProfileForm = ({ onSubmit, initialData, isEditing = false }: RoommateProfileFormProps) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(initialData?.interests || []);
  const [selectedLifestyle, setSelectedLifestyle] = useState<string[]>(initialData?.lifestyle || []);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [newInterest, setNewInterest] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<RoommateProfileData>({
    defaultValues: {
      name: initialData?.name || '',
      age: initialData?.age || 18,
      gender: initialData?.gender || 'male',
      university: initialData?.university || '',
      program: initialData?.program || '',
      year: initialData?.year || 1,
      bio: initialData?.bio || '',
      budget: initialData?.budget || 0,
      lookingFor: initialData?.lookingFor || 'apartment',
      location: initialData?.location || '',
      phone: (initialData as any)?.phone || '', // Add phone default
      moveInDate: (initialData as any)?.moveInDate || '', // Add move-in date default
      preferences: {
        smoking: initialData?.preferences?.smoking || false,
        pets: initialData?.preferences?.pets || false,
        gender: initialData?.preferences?.gender || 'noPreference',
        studyHabits: initialData?.preferences?.studyHabits || ''
      }
    }
  });

  const genderOptions = [
    { value: 'male', label: t('roommates.gender.male') },
    { value: 'female', label: t('roommates.gender.female') },
    { value: 'other', label: t('roommates.gender.other') }
  ];

  const preferenceGenderOptions = [
    { value: 'noPreference', label: t('roommates.gender.noPreference') },
    { value: 'male', label: t('roommates.gender.male') },
    { value: 'female', label: t('roommates.gender.female') },
    { value: 'other', label: t('roommates.gender.other') }
  ];

  const lifestyleOptions = [
    { value: 'early', label: t('roommates.lifestyle.early') },
    { value: 'night', label: t('roommates.lifestyle.night') },
    { value: 'quiet', label: t('roommates.lifestyle.quiet') },
    { value: 'social', label: t('roommates.lifestyle.social') },
    { value: 'clean', label: t('roommates.lifestyle.clean') }
  ];

  const lookingForOptions = [
    { value: 'apartment', label: 'Apartment' },
    { value: 'house', label: 'House' },
    { value: 'studio', label: 'Studio' },
    { value: 'shared', label: 'Shared Room' }
  ];

  const commonInterests = [
    'Reading', 'Sports', 'Music', 'Movies', 'Gaming', 'Cooking', 'Travel',
    'Photography', 'Art', 'Dancing', 'Hiking', 'Swimming', 'Cycling',
    'Programming', 'Languages', 'Volunteering', 'Fitness', 'Yoga'
  ];

  const handleFormSubmit = async (data: RoommateProfileData) => {
    setIsLoading(true);
    try {
      const formData = {
        ...data,
        interests: selectedInterests,
        lifestyle: selectedLifestyle
      };
      await onSubmit(formData);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const addCustomInterest = () => {
    if (newInterest.trim() && !selectedInterests.includes(newInterest.trim())) {
      setSelectedInterests(prev => [...prev, newInterest.trim()]);
      setNewInterest('');
    }
  };

  const removeInterest = (interest: string) => {
    setSelectedInterests(prev => prev.filter(i => i !== interest));
  };

  const toggleLifestyle = (lifestyle: string) => {
    setSelectedLifestyle(prev => 
      prev.includes(lifestyle)
        ? prev.filter(l => l !== lifestyle)
        : [...prev, lifestyle]
    );
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setAvatarPreview(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm p-8">
        <div className="flex items-center mb-8">
          <div className="h-12 w-12 rounded-full bg-secondary-100 flex items-center justify-center mr-4">
            <Users className="h-6 w-6 text-secondary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {isEditing ? 'Edit Roommate Profile' : 'Create Roommate Profile'}
            </h1>
            <p className="text-gray-600">
              {isEditing ? 'Update your roommate preferences' : 'Find your perfect roommate match'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
          {/* Profile Picture */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Profile Picture</h2>
            <div className="flex items-center space-x-6">
              <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <User className="h-8 w-8 text-gray-400" />
                  </div>
                )}
              </div>
              <div>
                <label htmlFor="avatar" className="cursor-pointer btn-outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Photo
                </label>
                <input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  {...register('avatar')}
                  onChange={handleAvatarChange}
                  className="sr-only"
                />
                <p className="text-sm text-gray-500 mt-2">JPG, PNG up to 5MB</p>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  {...register('name', { required: 'Name is required' })}
                  className="form-input"
                  placeholder="Your full name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-error-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age *
                </label>
                <input
                  type="number"
                  {...register('age', { required: 'Age is required', min: 16, max: 50 })}
                  className="form-input"
                  min="16"
                  max="50"
                />
                {errors.age && (
                  <p className="mt-1 text-sm text-error-600">{errors.age.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender *
                </label>
                <select
                  {...register('gender', { required: 'Gender is required' })}
                  className="form-input"
                >
                  {genderOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.gender && (
                  <p className="mt-1 text-sm text-error-600">{errors.gender.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                <select
                  {...register('location', { required: 'Location is required' })}
                  className="form-input"
                >
                  <option value="">Select City</option>
                  {moroccanCities.map((city, index) => (
                    <option key={index} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
                {errors.location && (
                  <p className="mt-1 text-sm text-error-600">{errors.location.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  {...register('phone', {
                    required: 'Phone number is required',
                    pattern: {
                      value: /^(\+212|0)[5-7][0-9]{8}$/,
                      message: 'Please enter a valid Moroccan phone number (e.g., +212612345678 or 0612345678)'
                    }
                  })}
                  className="form-input"
                  placeholder="+212612345678 or 0612345678"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-error-600">{errors.phone.message}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  This phone will be used for roommate contact (can be different from your account phone)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Move-in Date *
                </label>
                <input
                  type="date"
                  {...register('moveInDate', {
                    required: 'Move-in date is required',
                    validate: (value) => {
                      const selectedDate = new Date(value);
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      if (selectedDate < today) {
                        return 'Move-in date cannot be in the past';
                      }
                      return true;
                    }
                  })}
                  className="form-input"
                  min={new Date().toISOString().split('T')[0]}
                />
                {errors.moveInDate && (
                  <p className="mt-1 text-sm text-error-600">{errors.moveInDate.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Academic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  University *
                </label>
                <select
                  {...register('university', { required: 'University is required' })}
                  className="form-input"
                >
                  <option value="">Select University</option>
                  {moroccanUniversities.map((university, index) => (
                    <option key={index} value={university}>
                      {university}
                    </option>
                  ))}
                </select>
                {errors.university && (
                  <p className="mt-1 text-sm text-error-600">{errors.university.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Program/Major *
                </label>
                <input
                  type="text"
                  {...register('program', { required: 'Program is required' })}
                  className="form-input"
                  placeholder="e.g., Computer Science"
                />
                {errors.program && (
                  <p className="mt-1 text-sm text-error-600">{errors.program.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year of Study *
                </label>
                <select
                  {...register('year', { required: 'Year is required' })}
                  className="form-input"
                >
                  <option value="">Select Year</option>
                  <option value={1}>1st Year</option>
                  <option value={2}>2nd Year</option>
                  <option value={3}>3rd Year</option>
                  <option value={4}>4th Year</option>
                  <option value={5}>5th Year</option>
                  <option value={6}>Graduate</option>
                </select>
                {errors.year && (
                  <p className="mt-1 text-sm text-error-600">{errors.year.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* About Me */}
          <div>
            <h2 className="text-xl font-semibold mb-4">About Me</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio *
              </label>
              <textarea
                {...register('bio', { required: 'Bio is required' })}
                rows={4}
                className="form-input"
                placeholder="Tell potential roommates about yourself, your habits, and what you're looking for..."
              />
              {errors.bio && (
                <p className="mt-1 text-sm text-error-600">{errors.bio.message}</p>
              )}
            </div>
          </div>

          {/* Interests */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Interests & Hobbies</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {commonInterests.map(interest => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`p-2 text-sm rounded-lg border transition-colors ${
                      selectedInterests.includes(interest)
                        ? 'bg-primary-50 border-primary-500 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>

              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  placeholder="Add custom interest"
                  className="form-input flex-grow"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomInterest())}
                />
                <button
                  type="button"
                  onClick={addCustomInterest}
                  className="btn-outline"
                >
                  Add
                </button>
              </div>

              {selectedInterests.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedInterests.map(interest => (
                    <span
                      key={interest}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800"
                    >
                      {interest}
                      <button
                        type="button"
                        onClick={() => removeInterest(interest)}
                        className="ml-2 text-primary-600 hover:text-primary-800"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Lifestyle */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Lifestyle</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {lifestyleOptions.map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => toggleLifestyle(option.value)}
                  className={`p-3 text-sm rounded-lg border transition-colors ${
                    selectedLifestyle.includes(option.value)
                      ? 'bg-secondary-50 border-secondary-500 text-secondary-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Housing Preferences */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Housing Preferences</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget (MAD/month) *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    {...register('budget', { required: 'Budget is required', min: 1 })}
                    className="form-input pl-10"
                    placeholder="2000"
                  />
                </div>
                {errors.budget && (
                  <p className="mt-1 text-sm text-error-600">{errors.budget.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Looking For *
                </label>
                <select
                  {...register('lookingFor', { required: 'Housing type is required' })}
                  className="form-input"
                >
                  {lookingForOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.lookingFor && (
                  <p className="mt-1 text-sm text-error-600">{errors.lookingFor.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Roommate Preferences */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Roommate Preferences</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Roommate Gender
                </label>
                <select
                  {...register('preferences.gender')}
                  className="form-input"
                >
                  {preferenceGenderOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    {...register('preferences.smoking')}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700">
                    Okay with smoking
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    {...register('preferences.pets')}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700">
                    Okay with pets
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Study Habits & Schedule
                </label>
                <textarea
                  {...register('preferences.studyHabits')}
                  rows={3}
                  className="form-input"
                  placeholder="Describe your study schedule, noise preferences, and any other relevant habits..."
                />
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              className="btn border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary flex items-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  {isEditing ? 'Update Profile' : 'Create Profile'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoommateProfileForm;