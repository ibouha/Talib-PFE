import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapPin, Heart } from 'lucide-react';

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

const ItemCard = ({ item, isFavorited = false, onToggleFavorite }: ItemCardProps) => {
  const { t } = useTranslation();
  
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(item.id);
    }
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
      <div className="relative h-48 overflow-hidden">
        <img
          src={item.images[0]}
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-md hover:scale-110 transition-transform duration-200"
          aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart size={20} className={isFavorited ? 'fill-primary-500 text-primary-500' : 'text-gray-400'} />
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