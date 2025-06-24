import { useAuth } from '../contexts/AuthContext';
import authService from '../services/authService';

const AuthDebug = () => {
  const { user, isAuthenticated, loading } = useAuth();

  const localStorageUser = authService.getUser();
  const localStorageToken = authService.getToken();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Authentication Debug</h1>
      
      <div className="space-y-6">
        {/* Auth Context State */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Auth Context State</h2>
          <div className="space-y-2">
            <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
            <p><strong>Is Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
            <p><strong>User Object:</strong></p>
            <pre className="bg-white p-2 rounded text-sm overflow-auto">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
        </div>

        {/* Local Storage State */}
        <div className="bg-green-50 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Local Storage State</h2>
          <div className="space-y-2">
            <p><strong>Stored User:</strong></p>
            <pre className="bg-white p-2 rounded text-sm overflow-auto">
              {JSON.stringify(localStorageUser, null, 2)}
            </pre>
            <p><strong>Stored Token:</strong> {localStorageToken || 'None'}</p>
          </div>
        </div>

        {/* Auth Service Methods */}
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Auth Service Methods</h2>
          <div className="space-y-2">
            <p><strong>authService.isAuthenticated():</strong> {authService.isAuthenticated() ? 'Yes' : 'No'}</p>
            <p><strong>authService.isStudent():</strong> {authService.isStudent() ? 'Yes' : 'No'}</p>
            <p><strong>authService.isOwner():</strong> {authService.isOwner() ? 'Yes' : 'No'}</p>
            <p><strong>authService.isAdmin():</strong> {authService.isAdmin() ? 'Yes' : 'No'}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Actions</h2>
          <div className="space-x-4">
            <button
              onClick={() => {
                console.log('Current auth state:', { user, isAuthenticated, loading });
                console.log('LocalStorage user:', localStorageUser);
                console.log('LocalStorage token:', localStorageToken);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Log to Console
            </button>
            
            <button
              onClick={() => {
                authService.logout();
                window.location.reload();
              }}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Clear Auth & Reload
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthDebug;
