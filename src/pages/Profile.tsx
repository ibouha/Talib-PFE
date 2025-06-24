import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { User, Mail, MapPin, GraduationCap, Loader, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import profileService from '../services/profileService';
import ProfileAvatar from '../components/common/ProfileAvatar';
import { useToast } from '../contexts/ToastContext';


const Profile = () => {
  const { t } = useTranslation();
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    university: '',
    bio: '',
    gender: '',
    username: '' // For admin users
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Initialize form data when user data is available
  useEffect(() => {
    if (user) {
      // Handle nested user structure - the auth context might have user.user
      const userData = (user as any).user || user;
      const baseFormData = {
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        university: userData.university || '',
        bio: userData.bio || '',
        gender: userData.gender || '',
        username: userData.username || '' // For admin users
      };

      setFormData(baseFormData);
      setProfileImage(userData.image || null);
    }
  }, [user]);
  
  // Update document title
  useEffect(() => {
    document.title = `${t('profile.title')} | ${t('app.name')}`;
  }, [t]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log('Selected file:', {
      name: file.name,
      type: file.type,
      size: file.size
    });

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError(`Invalid file type: ${file.type}. Only JPEG, PNG, GIF, and WebP are allowed.`);
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError(`File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum size is 5MB.`);
      return;
    }

    // Set selected file and create preview
    setSelectedImage(file);
    setError(null);

    // Create image preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    try {
      setSaving(true);
      setError(null);

      const userId = (user as any)?.user_id || user?.id;

      // Upload image first if selected
      let imageUrl = profileImage;
      if (selectedImage) {
        setUploadingImage(true);
        try {
          const imageResponse = await profileService.uploadProfileImage(selectedImage);
          if (imageResponse.success && imageResponse.data) {
            imageUrl = imageResponse.data.url;
            setProfileImage(imageUrl);
          } else {
            throw new Error(imageResponse.message || 'Failed to upload image');
          }
        } catch (imageErr: any) {
          setError(`Image upload failed: ${imageErr.message}`);
          return;
        } finally {
          setUploadingImage(false);
        }
      }

      // Update profile data
      const updateData: any = {
        name: formData.name,
        phone: formData.phone
      };

      // Add role-specific fields
      if (user.role === 'student') {
        updateData.university = formData.university;
        updateData.bio = formData.bio;
        updateData.gender = formData.gender;
      } else if (user.role === 'admin') {
        updateData.username = formData.username;
      }

      console.log('Sending update data:', updateData);
      console.log('User ID:', userId, 'User Role:', user.role);

      const response = await profileService.updateProfile(userId, user.role, updateData);
      console.log('Update response:', response);

      if (response.success) {
        showToast('Profile updated successfully!', 'success');
        setIsEditing(false);
        setSelectedImage(null);
        setImagePreview(null);

        // Update user data in auth context to reflect changes throughout the app
        if (response.data) {
          const updatedUser = { ...user, ...response.data };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          refreshUser();
        }
      } else {
        setError(response.message || 'Failed to update profile');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Login</h2>
          <p className="text-gray-600 mb-4">You need to be logged in to view your profile</p>
          <Link
            to="/login"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 inline-block"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }



  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">{t('profile.title')}</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex flex-col items-center">
              {/* Avatar */}
              <div className="flex justify-center mb-6">
                {imagePreview ? (
                  <div className="h-32 w-32 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                    <img
                      src={imagePreview}
                      alt="Profile Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <ProfileAvatar
                    imageUrl={profileImage}
                    name={((user as any)?.user || user)?.name}
                    size="2xl"
                    className="h-32 w-32"
                  />
                )}
              </div>
              
              <h2 className="text-2xl font-bold mb-1">
                {((user as any).user || user).name || ((user as any).user || user).username}
              </h2>
              {user.role !== 'admin' && (
                <p className="text-gray-600 flex items-center mb-4">
                  <GraduationCap size={16} className="mr-1" />
                  {((user as any).user || user).university || 'No university'}
                </p>
              )}
              {user.role === 'admin' && (
                <p className="text-gray-600 flex items-center mb-4">
                  <Shield size={16} className="mr-1" />
                  System Administrator
                </p>
              )}

              {/* Quick Info */}
              <div className="w-full space-y-3">
                <div className="flex items-center text-gray-600">
                  <Mail size={16} className="mr-2" />
                  <span>{((user as any).user || user).email}</span>
                </div>
                {((user as any).user || user).phone && (
                  <div className="flex items-center text-gray-600">
                    <MapPin size={16} className="mr-2" />
                    <span>{((user as any).user || user).phone}</span>
                  </div>
                )}
                <div className="flex items-center text-gray-600">
                  <User size={16} className="mr-2" />
                  <span className="capitalize">{user.role}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Profile Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">{t('profile.personal')}</h3>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="btn-outline"
              >
                {isEditing ? t('forms.cancel') : 'Edit Profile'}
              </button>
            </div>
            
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="form-input"
                  value={isEditing ? formData.name : ((user as any).user || user).name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-input"
                  value={isEditing ? formData.email : ((user as any).user || user).email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className="form-input"
                  value={isEditing ? formData.phone : (((user as any).user || user).phone || '')}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>

              {/* Username - Only for Admin */}
              {user.role === 'admin' && (
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    className="form-input"
                    value={isEditing ? formData.username : (((user as any).user || user).username || '')}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
              )}

              {/* University */}
              {user.role === 'student' && (
                <div>
                  <label htmlFor="university" className="block text-sm font-medium text-gray-700 mb-1">
                    University
                  </label>
                  <input
                    type="text"
                    id="university"
                    name="university"
                    className="form-input"
                    value={isEditing ? formData.university : (((user as any).user || user).university || '')}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
              )}

              {/* Profile Image Upload */}
              {isEditing && (
                <div>
                  <label htmlFor="profileImage" className="block text-sm font-medium text-gray-700 mb-1">
                    Profile Image
                  </label>
                  <input
                    type="file"
                    id="profileImage"
                    name="profileImage"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="form-input file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                  />
                  {selectedImage && (
                    <p className="text-sm text-gray-600 mt-1">
                      Selected: {selectedImage.name} ({(selectedImage.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Supported formats: JPEG, PNG, GIF, WebP. Max size: 5MB
                  </p>
                </div>
              )}

              {/* Bio - Only for Students */}
              {user?.role === 'student' && (
                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    rows={4}
                    className="form-input"
                    value={isEditing ? formData.bio : (((user as any).user || user).bio || '')}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="Tell us about yourself..."
                  />
                </div>
              )}

              {/* Gender - Only for Students */}
              {user?.role === 'student' && (
                <div>
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                    Gender
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    className="form-input"
                    value={isEditing ? formData.gender : (((user as any).user || user).gender || '')}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              )}

              {/* Save Button */}
              {isEditing && (
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn-primary flex items-center"
                  >
                    {saving ? (
                      <>
                        <Loader className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      t('profile.save')
                    )}
                  </button>
                </div>
              )}
            </form>
          </div>
          
          {/* Activity Section */}
          <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
            <h3 className="text-xl font-semibold mb-6">
              {user.role === 'admin' ? 'Admin Information' : 'Recent Activity'}
            </h3>
            <div className="space-y-4">
              {user.role === 'admin' ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Account Type</span>
                    <span className="text-sm text-gray-600">System Administrator</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Access Level</span>
                    <span className="text-sm text-gray-600">Full System Access</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Permissions</span>
                    <span className="text-sm text-gray-600">User Management, Content Moderation</span>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600">Your recent activity will appear here</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;