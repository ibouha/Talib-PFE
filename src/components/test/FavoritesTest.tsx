import { useFavorites } from '../../contexts/FavoritesContext';
import { useAuth } from '../../contexts/AuthContext';

const FavoritesTest = () => {
  const { user } = useAuth();
  const { 
    favoriteItems, 
    favoriteHousing, 
    favoriteRoommates, 
    toggleItemFavorite, 
    toggleHousingFavorite, 
    toggleRoommateFavorite,
    loading 
  } = useFavorites();

  if (!user) {
    return (
      <div className="p-4 bg-yellow-100 border border-yellow-400 rounded">
        <p>Please login to test favorites functionality</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Favorites System Test</h2>
      
      {loading && (
        <div className="mb-4 p-2 bg-blue-100 rounded">
          Loading favorites...
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Items */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Items ({favoriteItems.length})</h3>
          <div className="space-y-2">
            {favoriteItems.map(id => (
              <div key={id} className="flex items-center justify-between p-2 bg-gray-100 rounded">
                <span>Item {id}</span>
                <button
                  onClick={() => toggleItemFavorite(id)}
                  className="text-red-500 hover:text-red-700"
                >
                  ❤️ Remove
                </button>
              </div>
            ))}
            <button
              onClick={() => toggleItemFavorite('1')}
              className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Add Item #1 (Economics Textbook)
            </button>
            <button
              onClick={() => toggleItemFavorite('2')}
              className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Add Item #2 (Table Manger)
            </button>
          </div>
        </div>

        {/* Housing */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Housing ({favoriteHousing.length})</h3>
          <div className="space-y-2">
            {favoriteHousing.map(id => (
              <div key={id} className="flex items-center justify-between p-2 bg-gray-100 rounded">
                <span>Housing {id}</span>
                <button
                  onClick={() => toggleHousingFavorite(id)}
                  className="text-red-500 hover:text-red-700"
                >
                  ❤️ Remove
                </button>
              </div>
            ))}
            <button
              onClick={() => toggleHousingFavorite('1')}
              className="w-full p-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Add Housing #1 (Modern Studio)
            </button>
          </div>
        </div>

        {/* Roommates */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Roommates ({favoriteRoommates.length})</h3>
          <div className="space-y-2">
            {favoriteRoommates.map(id => (
              <div key={id} className="flex items-center justify-between p-2 bg-gray-100 rounded">
                <span>Roommate {id}</span>
                <button
                  onClick={() => toggleRoommateFavorite(id)}
                  className="text-red-500 hover:text-red-700"
                >
                  ❤️ Remove
                </button>
              </div>
            ))}
            <p className="text-sm text-gray-500 mb-2">
              No roommate profiles in database yet. Run the fix SQL to add sample data.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded">
        <h4 className="font-semibold mb-2">Debug Info:</h4>
        <pre className="text-sm">
          {JSON.stringify({ 
            user: user?.id, 
            favoriteItems, 
            favoriteHousing, 
            favoriteRoommates,
            loading 
          }, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default FavoritesTest;
