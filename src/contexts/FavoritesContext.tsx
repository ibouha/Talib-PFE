import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import favoritesService from '../services/favoritesService';

interface FavoritesContextType {
  isItemFavorited: (id: string) => boolean;
  toggleItemFavorite: (id: string) => void;
  isHousingFavorited: (id: string) => boolean;
  toggleHousingFavorite: (id: string) => void;
  isRoommateFavorited: (id: string) => boolean;
  toggleRoommateFavorite: (id: string) => void;
  favoriteItems: string[];
  favoriteHousing: string[];
  favoriteRoommates: string[];
  loading: boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

interface FavoritesProviderProps {
  children: ReactNode;
}

export const FavoritesProvider: React.FC<FavoritesProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [favoriteItems, setFavoriteItems] = useState<string[]>([]);
  const [favoriteHousing, setFavoriteHousing] = useState<string[]>([]);
  const [favoriteRoommates, setFavoriteRoommates] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Load favorites when user logs in
  useEffect(() => {
    if (user) {
      loadFavorites();
    } else {
      // Clear favorites when user logs out
      setFavoriteItems([]);
      setFavoriteHousing([]);
      setFavoriteRoommates([]);
    }
  }, [user]);

  const loadFavorites = async () => {
    if (!user) return;

    try {
      setLoading(true);
      console.log('Loading favorites for user:', user.id);
      const response = await favoritesService.getAll(user.id);

      console.log('Favorites response:', response);

      if (response.success && response.data) {
        // Handle both paginated and direct array responses
        const favoritesArray = response.data.data || response.data;

        if (Array.isArray(favoritesArray)) {
          // Group favorites by type and extract the correct ID
          const items = favoritesArray
            .filter((fav: any) => fav.type === 'Item')
            .map((fav: any) => fav.item_id)
            .filter((id: any) => id);

          const housing = favoritesArray
            .filter((fav: any) => fav.type === 'Housing')
            .map((fav: any) => fav.housing_id)
            .filter((id: any) => id);

          const roommates = favoritesArray
            .filter((fav: any) => fav.type === 'RoommateProfile')
            .map((fav: any) => fav.roommateProfile_id)
            .filter((id: any) => id);

          console.log('Parsed favorites:', { items, housing, roommates });

          setFavoriteItems(items);
          setFavoriteHousing(housing);
          setFavoriteRoommates(roommates);
        }
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const isItemFavorited = (id: string) => favoriteItems.includes(id);
  const isHousingFavorited = (id: string) => favoriteHousing.includes(id);
  const isRoommateFavorited = (id: string) => favoriteRoommates.includes(id);

  const toggleItemFavorite = async (id: string) => {
    if (!user) {
      alert('Please login to save favorites');
      return;
    }

    try {
      const isFavorited = isItemFavorited(id);
      console.log('Toggling item favorite:', { id, isFavorited });

      if (isFavorited) {
        // Find the favorite to remove
        const response = await favoritesService.getAll(user.id, { type: 'Item' });
        if (response.success && response.data) {
          const favoritesArray = (response.data as any).data || response.data;
          if (Array.isArray(favoritesArray)) {
            const favorite = favoritesArray.find((fav: any) => fav.item_id === id);
            if (favorite) {
              console.log('Removing favorite:', favorite);
              await favoritesService.remove(favorite.id);
              setFavoriteItems(prev => prev.filter(itemId => itemId !== id));
            }
          }
        }
      } else {
        console.log('Adding item to favorites:', id);
        const response = await favoritesService.addItemToFavorites(user.id, id);
        if (response.success) {
          setFavoriteItems(prev => [...prev, id]);
        }
      }
    } catch (error) {
      console.error('Error toggling item favorite:', error);
      alert('Failed to update favorites. Please try again.');
    }
  };

  const toggleHousingFavorite = async (id: string) => {
    if (!user) {
      alert('Please login to save favorites');
      return;
    }

    try {
      const isFavorited = isHousingFavorited(id);
      console.log('Toggling housing favorite:', { id, isFavorited });

      if (isFavorited) {
        // Find the favorite to remove
        const response = await favoritesService.getAll(user.id, { type: 'Housing' });
        if (response.success && response.data) {
          const favoritesArray = (response.data as any).data || response.data;
          if (Array.isArray(favoritesArray)) {
            const favorite = favoritesArray.find((fav: any) => fav.housing_id === id);
            if (favorite) {
              console.log('Removing housing favorite:', favorite);
              await favoritesService.remove(favorite.id);
              setFavoriteHousing(prev => prev.filter(housingId => housingId !== id));
            }
          }
        }
      } else {
        console.log('Adding housing to favorites:', id);
        const response = await favoritesService.addHousingToFavorites(user.id, id);
        if (response.success) {
          setFavoriteHousing(prev => [...prev, id]);
        }
      }
    } catch (error) {
      console.error('Error toggling housing favorite:', error);
      alert('Failed to update favorites. Please try again.');
    }
  };

  const toggleRoommateFavorite = async (id: string) => {
    if (!user) {
      alert('Please login to save favorites');
      return;
    }

    try {
      const isFavorited = isRoommateFavorited(id);
      console.log('Toggling roommate favorite:', { id, isFavorited });

      if (isFavorited) {
        // Find the favorite to remove
        const response = await favoritesService.getAll(user.id, { type: 'RoommateProfile' });
        if (response.success && response.data) {
          const favoritesArray = (response.data as any).data || response.data;
          if (Array.isArray(favoritesArray)) {
            const favorite = favoritesArray.find((fav: any) => fav.roommateProfile_id === id);
            if (favorite) {
              console.log('Removing roommate favorite:', favorite);
              await favoritesService.remove(favorite.id);
              setFavoriteRoommates(prev => prev.filter(roommateId => roommateId !== id));
            }
          }
        }
      } else {
        console.log('Adding roommate to favorites:', id);
        const response = await favoritesService.addRoommateToFavorites(user.id, id);
        if (response.success) {
          setFavoriteRoommates(prev => [...prev, id]);
        }
      }
    } catch (error) {
      console.error('Error toggling roommate favorite:', error);
      alert('Failed to update favorites. Please try again.');
    }
  };

  const value: FavoritesContextType = {
    isItemFavorited,
    toggleItemFavorite,
    isHousingFavorited,
    toggleHousingFavorite,
    isRoommateFavorited,
    toggleRoommateFavorite,
    favoriteItems,
    favoriteHousing,
    favoriteRoommates,
    loading,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = (): FavoritesContextType => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
