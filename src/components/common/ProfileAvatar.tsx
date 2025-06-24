import React from 'react';
import { User } from 'lucide-react';

interface ProfileAvatarProps {
  imageUrl?: string | null;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  showBorder?: boolean;
}

const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
  imageUrl,
  name,
  size = 'md',
  className = '',
  showBorder = false
}) => {
  // Size configurations
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
    '2xl': 'w-20 h-20'
  };

  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
    '2xl': 'w-10 h-10'
  };

  // Build CSS classes
  const baseClasses = `${sizeClasses[size]} rounded-full flex items-center justify-center overflow-hidden bg-primary-600`;
  const borderClasses = showBorder ? 'ring-2 ring-white ring-offset-2' : '';
  const finalClasses = `${baseClasses} ${borderClasses} ${className}`;

  // Generate initials from name if no image
  const getInitials = (name?: string) => {
    if (!name) return '';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const initials = getInitials(name);

  // Helper function to construct the correct image URL
  const getImageUrl = (imageUrl: string) => {
    // If it's already a full HTTP URL, use it as is
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }

    // If it starts with /Talib-PFE, it's a user profile image with full path
    if (imageUrl.startsWith('/Talib-PFE')) {
      return `http://localhost${imageUrl}`;
    }

    // If it starts with roommateProfileImages/, it's a roommate avatar
    if (imageUrl.startsWith('roommateProfileImages/')) {
      return `http://localhost/Talib-PFE/api/uploads/${imageUrl}`;
    }

    // If it starts with profiles/, it's a user profile image (relative path)
    if (imageUrl.startsWith('profiles/')) {
      return `http://localhost/Talib-PFE/api/uploads/${imageUrl}`;
    }

    // Fallback: assume it's a relative path and add full upload directory
    return `http://localhost/Talib-PFE/api/uploads/${imageUrl}`;
  };

  return (
    <div className={finalClasses}>
      {imageUrl ? (
        <img
          src={getImageUrl(imageUrl)}
          alt={name || 'Profile'}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback to initials/icon if image fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
          }}
        />
      ) : initials ? (
        <span className="text-white font-medium text-sm">
          {initials}
        </span>
      ) : (
        <User className={`${iconSizes[size]} text-white`} />
      )}
    </div>
  );
};

export default ProfileAvatar;
