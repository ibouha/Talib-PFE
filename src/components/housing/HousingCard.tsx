import { Link } from 'react-router-dom';

import { MapPin, Bed, Bath, Home, Heart } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

// Type for housing listing data (matches backend Housing type)
export type HousingListing = {
  id: string;
  title: string;
  description: string;
  price: number;
  city: string;
  address: string;
  type: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  furnished: boolean;
  amenities: string[];
  images?: string[];
  ownerId: string;
  postedDate: string;
  available: boolean;
};

interface HousingCardProps {
  housing: HousingListing;
  isFavorited?: boolean;
  onToggleFavorite?: (id: string) => void;
}

const HousingCard = ({ housing, isFavorited = false, onToggleFavorite }: HousingCardProps) => {
    const { showToast } = useToast();
  
  
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(housing.id);
      showToast('Housing added to favorite successfully!', 'success');

    }
  };
  
  return (
    <Link to={`/housing/${housing.id}`} className="card group h-full flex flex-col">
      {/* Housing Image */}
      <div className="relative h-56 overflow-hidden bg-gray-200">
        {housing.images && housing.images.length > 0 ? (
          <img
            src={housing.images[0]}
            alt={housing.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNzUgMTIwSDIyNVYxODBIMTc1VjEyMFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHN2ZyB4PSIxODAiIHk9IjE0MCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjIwIj4KPHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCA0MCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIwIDEwTDE1IDVMMjUgNUwyMCAxMFoiIGZpbGw9IiM2QjcyODAiLz4KPC9zdmc+Cjwvc3ZnPgo8dGV4dCB4PSIyMDAiIHk9IjE5MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNkI3MjgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5ObyBJbWFnZTwvdGV4dD4KPC9zdmc+';
            }}
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <Home size={48} className="text-gray-400" />
          </div>
        )}
        
        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-md hover:scale-110 transition-transform duration-200"
          aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart size={20} className={isFavorited ? 'fill-primary-500 text-primary-500' : 'text-gray-400'} />
        </button>
        
        {/* Type Badge */}
        <div className="absolute top-3 left-3">
          <span className="badge-primary">
            {housing.type}
          </span>
        </div>
      </div>
      
      {/* Housing Details */}
      <div className="p-5 flex-grow flex flex-col">
        <div className="flex items-start justify-between">
          <h3 className="text-xl font-semibold mb-2 flex-grow">{housing.title}</h3>
          <p className="text-primary-600 font-bold whitespace-nowrap">
            {housing.price.toLocaleString()} <br /> MAD/month
          </p>
        </div>
        
        <div className="flex items-center text-gray-500 text-sm mb-3">
          <MapPin size={16} className="mr-1" />
          <span>{housing.city}, Morocco</span>
        </div>
        
        <p className="text-gray-600 mb-4 line-clamp-2">{housing.description}</p>
        
        {/* Property features */}
        <div className="flex flex-wrap gap-2 mt-auto mb-4">
          <div className="flex items-center text-sm text-gray-600 bg-gray-100 rounded-full px-3 py-1">
            <Bed size={16} className="mr-1" />
            <span>{housing.bedrooms} {housing.bedrooms === 1 ? 'Bedroom' : 'Bedrooms'}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600 bg-gray-100 rounded-full px-3 py-1">
            <Bath size={16} className="mr-1" />
            <span>{housing.bathrooms} {housing.bathrooms === 1 ? 'Bathroom' : 'Bathrooms'}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600 bg-gray-100 rounded-full px-3 py-1">
            <Home size={16} className="mr-1" />
            <span>{housing.area} m²</span>
          </div>
        </div>
        
        {/* Date and View Details */}
        <div className="flex justify-between items-center mt-auto">
          <span className="text-sm text-gray-500">
            {new Date(housing.postedDate).toLocaleDateString()}
          </span>
          <span className="text-primary-600 group-hover:underline font-medium">
            View Details
          </span>
        </div>
      </div>
    </Link>
  );
};

export default HousingCard;