import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapPin, Heart } from 'lucide-react';
import { useFavorites } from '../../contexts/FavoritesContext';
import { useToast } from '../../contexts/ToastContext';


// Type for item listing data
export type ItemListing = {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  images: string[];
  sellerId: string;
  city: string;
  postedDate: string;
  available: boolean;
};

interface ItemCardProps {
  item: ItemListing;
  isFavorited?: boolean;
  onToggleFavorite?: (id: string) => void;
}

const ItemCard = ({ item, isFavorited, onToggleFavorite }: ItemCardProps) => {
  const { showToast } = useToast();
  const { t } = useTranslation();
  const { isItemFavorited, toggleItemFavorite } = useFavorites();
  
  // Use context if no props provided
  const favorited = isFavorited !== undefined ? isFavorited : isItemFavorited(item.id);
  const toggleFavorite = onToggleFavorite || toggleItemFavorite;
  
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(item.id);
    showToast('Item added to favorite successfully!', 'success');
  };
  
  // Format condition
  const getConditionLabel = (condition: string) => {
    return t(`items.conditions.${condition}`);
  };
  
  // Format category
  const getCategoryLabel = (category: string) => {
    return t(`items.categories.${category}`);
  };
  
  return (
    <Link to={`/items/${item.id}`} className="card group h-full flex flex-col">
      {/* Item Image */}
      <div className="relative h-48 overflow-hidden bg-gray-200">
        <img
          src={item.images && item.images.length > 0 ? item.images[0] : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNzUgMTIwSDIyNVYxODBIMTc1VjEyMFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHN2ZyB4PSIxODAiIHk9IjE0MCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjIwIj4KPHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCA0MCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIwIDEwTDE1IDVMMjUgNUwyMCAxMFoiIGZpbGw9IiM2QjcyODAiLz4KPC9zdmc+Cjwvc3ZnPgo8dGV4dCB4PSIyMDAiIHk9IjE5MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNkI3MjgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5ObyBJbWFnZTwvdGV4dD4KPC9zdmc+'}
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNzUgMTIwSDIyNVYxODBIMTc1VjEyMFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHN2ZyB4PSIxODAiIHk9IjE0MCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjIwIj4KPHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCA0MCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIwIDEwTDE1IDVMMjUgNUwyMCAxMFoiIGZpbGw9IiM2QjcyODAiLz4KPC9zdmc+Cjwvc3ZnPgo8dGV4dCB4PSIyMDAiIHk9IjE5MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNkI3MjgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5ObyBJbWFnZTwvdGV4dD4KPC9zdmc+';
          }}
        />
        
        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-md hover:scale-110 transition-transform duration-200"
          aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart size={20} className={favorited ? 'fill-primary-500 text-primary-500' : 'text-gray-400'} />
        </button>
        
        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className="badge-primary">
            {getCategoryLabel(item.category)}
          </span>
        </div>
      </div>
      
      {/* Item Details */}
      <div className="p-5 flex-grow flex flex-col">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold mb-2 flex-grow">{item.title}</h3>
          <p className="text-primary-600 font-bold whitespace-nowrap">
            {t('common.price', { price: item.price })}
          </p>
        </div>
        
        <div className="flex items-center text-gray-500 text-sm mb-3">
          <MapPin size={16} className="mr-1" />
          <span>{item.city}</span>
        </div>
        
        <p className="text-gray-600 mb-4 line-clamp-2">{item.description}</p>
        
        {/* Item condition */}
        <div className="mt-auto">
          <span className={`inline-block px-3 py-1 text-sm rounded-full ${
            item.condition === 'new' || item.condition === 'likeNew' 
              ? 'bg-success-100 text-success-800'
              : item.condition === 'good'
                ? 'bg-primary-100 text-primary-800'
                : 'bg-warning-100 text-warning-800'
          }`}>
            {getConditionLabel(item.condition)}
          </span>
        </div>
        
        {/* Date and View Details */}
        <div className="flex justify-between items-center mt-4">
          <span className="text-sm text-gray-500">
            {t('common.date', { date: new Date(item.postedDate).toLocaleDateString() })}
          </span>
          <span className="text-primary-600 group-hover:underline font-medium">
            View Details
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ItemCard;