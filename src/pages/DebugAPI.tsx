import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import favoritesService from '../services/favoritesService';
import roommateService from '../services/roommateService';

const DebugAPI = () => {
  const { user } = useAuth();
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const testFavoritesAPI = async () => {
    if (!user) {
      alert('Please login first');
      return;
    }

    setLoading(true);
    try {
      console.log('Testing favorites API...');
      
      // Test basic API call
      const response = await favoritesService.getAll(user.id);
      console.log('Favorites API response:', response);
      
      setResults(prev => ({
        ...prev,
        favorites: {
          success: response.success,
          data: response.data,
          message: response.message || 'No message'
        }
      }));
      
    } catch (error: any) {
      console.error('Favorites API error:', error);
      setResults(prev => ({
        ...prev,
        favorites: {
          success: false,
          error: error.message,
          details: error
        }
      }));
    } finally {
      setLoading(false);
    }
  };

  const testRoommatesAPI = async () => {
    setLoading(true);
    try {
      console.log('Testing roommates API...');
      
      const response = await roommateService.getAll({ limit: 10 });
      console.log('Roommates API response:', response);
      
      setResults(prev => ({
        ...prev,
        roommates: {
          success: response.success,
          data: response.data,
          message: response.message || 'No message'
        }
      }));
      
    } catch (error: any) {
      console.error('Roommates API error:', error);
      setResults(prev => ({
        ...prev,
        roommates: {
          success: false,
          error: error.message,
          details: error
        }
      }));
    } finally {
      setLoading(false);
    }
  };

  const testBackendConnection = async () => {
    setLoading(true);
    try {
      // Test basic backend connection
      const response = await fetch('http://localhost/Talib-PFE/api/test_favorites.php');
      const data = await response.json();
      
      setResults(prev => ({
        ...prev,
        backend: {
          success: response.ok,
          status: response.status,
          data: data
        }
      }));
      
    } catch (error: any) {
      setResults(prev => ({
        ...prev,
        backend: {
          success: false,
          error: error.message
        }
      }));
    } finally {
      setLoading(false);
    }
  };

  const testDatabaseConnection = async () => {
    setLoading(true);
    try {
      // Test database connection
      const response = await fetch('http://localhost/Talib-PFE/api/debug_favorites.php');
      const data = await response.json();
      
      setResults(prev => ({
        ...prev,
        database: {
          success: response.ok,
          status: response.status,
          data: data
        }
      }));
      
    } catch (error: any) {
      setResults(prev => ({
        ...prev,
        database: {
          success: false,
          error: error.message
        }
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-custom py-8">
      <h1 className="text-3xl font-bold mb-8">API Debug Page</h1>
      
      {!user && (
        <div className="bg-yellow-100 border border-yellow-400 rounded p-4 mb-6">
          <p>Please login to test user-specific APIs</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <button
          onClick={testBackendConnection}
          disabled={loading}
          className="bg-blue-500 text-white p-4 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Test Backend Connection
        </button>
        
        <button
          onClick={testDatabaseConnection}
          disabled={loading}
          className="bg-green-500 text-white p-4 rounded hover:bg-green-600 disabled:opacity-50"
        >
          Test Database Connection
        </button>
        
        <button
          onClick={testFavoritesAPI}
          disabled={loading || !user}
          className="bg-purple-500 text-white p-4 rounded hover:bg-purple-600 disabled:opacity-50"
        >
          Test Favorites API
        </button>
        
        <button
          onClick={testRoommatesAPI}
          disabled={loading}
          className="bg-orange-500 text-white p-4 rounded hover:bg-orange-600 disabled:opacity-50"
        >
          Test Roommates API
        </button>
      </div>
      
      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      )}
      
      <div className="space-y-6">
        {Object.entries(results).map(([key, result]: [string, any]) => (
          <div key={key} className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-4 capitalize">{key} Test Results</h3>
            <div className={`p-4 rounded ${result.success ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className="mb-2">
                <strong>Status:</strong> {result.success ? '✅ Success' : '❌ Failed'}
              </div>
              {result.error && (
                <div className="mb-2">
                  <strong>Error:</strong> {result.error}
                </div>
              )}
              {result.message && (
                <div className="mb-2">
                  <strong>Message:</strong> {result.message}
                </div>
              )}
              <details className="mt-4">
                <summary className="cursor-pointer font-medium">Raw Data</summary>
                <pre className="mt-2 p-2 bg-gray-100 rounded text-sm overflow-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </details>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Instructions</h3>
        <ol className="list-decimal list-inside space-y-2">
          <li>First, test Backend Connection to ensure PHP is working</li>
          <li>Then test Database Connection to check database and favorites table</li>
          <li>Login as a user, then test Favorites API</li>
          <li>Test Roommates API to check if profiles are loading</li>
          <li>Check the console for detailed error messages</li>
        </ol>
      </div>
    </div>
  );
};

export default DebugAPI;
