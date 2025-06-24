import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Menu,
  X,
  LayoutDashboard,
  User,
  Building,
  ShoppingBag,
  Users,
  Heart,
  Bell,
  Settings,
  LogOut,
  Plus,
  Shield,
  AlertTriangle,
  GraduationCap
} from 'lucide-react';
import LanguageSwitcher from '../components/common/LanguageSwitcher';
import { useAuth } from '../contexts/AuthContext';
import ProfileAvatar from '../components/common/ProfileAvatar';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, logout } = useAuth();

  // Get user role from auth context
  const userRole = user?.role || 'student';
  
  // Toggle sidebar for mobile
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  // Close sidebar when route changes on mobile
  useEffect(() => {
    setSidebarOpen(false);
  }, [location]);
  
  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r shadow-sm transition-all duration-300 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-auto`}>
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b">
        <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-primary-600">{t('app.name')}</span>
            </Link>          <button className="lg:hidden" onClick={toggleSidebar}>
            <X size={24} className="text-gray-500" />
          </button>
        </div>
        
        {/* Sidebar Navigation */}
        <nav className="p-4 space-y-1">
          {/* Role-specific dashboards at the top */}
          {userRole === 'student' && (
            <Link
              to="/dashboard/student"
              className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                location.pathname === '/dashboard/student' ? 'bg-primary-50 text-primary-600' : 'hover:bg-gray-100'
              }`}
            >
              <LayoutDashboard size={20} className="mr-3" />
              <span>Student Dashboard</span>
            </Link>
          )}

          {userRole === 'owner' && (
            <Link
              to="/dashboard/owner"
              className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                location.pathname === '/dashboard/owner' ? 'bg-primary-50 text-primary-600' : 'hover:bg-gray-100'
              }`}
            >
              <LayoutDashboard size={20} className="mr-3" />
              <span>Owner Dashboard</span>
            </Link>
          )}

          {userRole === 'admin' && (
            <Link
              to="/dashboard/admin"
              className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                location.pathname === '/dashboard/admin' ? 'bg-primary-50 text-primary-600' : 'hover:bg-gray-100'
              }`}
            >
              <LayoutDashboard size={20} className="mr-3" />
              <span>Admin Dashboard</span>
            </Link>
          )}

          {/* Quick Actions */}
          <div className="pt-4 pb-2">
            <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              QUICK ACTIONS
            </p>
          </div>
          
          {userRole === 'owner' && (
            <Link
              to="/add-property"
              className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                location.pathname === '/add-property' ? 'bg-primary-50 text-primary-600' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Plus size={20} className="mr-3" />
              <span>Add Property</span>
            </Link>
          )}
          
          {/* Student-only quick actions */}
          {userRole === 'student' && (
            <>
              <Link
                to="/add-item"
                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                  location.pathname === '/add-item' ? 'bg-primary-50 text-primary-600' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Plus size={20} className="mr-3" />
                <span>List Item</span>
              </Link>

              <Link
                to="/create-roommate-profile"
                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                  location.pathname === '/create-roommate-profile' ? 'bg-primary-50 text-primary-600' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Plus size={20} className="mr-3" />
                <span>Create Roommate Profile</span>
              </Link>
            </>
          )}
          
          {/* Main Navigation */}
          <div className="pt-4 pb-2">
            <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              NAVIGATION
            </p>
          </div>
          
          <Link 
            to="/housing" 
            className="flex items-center px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <Building size={20} className="mr-3" />
            <span>{t('nav.housing')}</span>
          </Link>
          
          <Link 
            to="/items" 
            className="flex items-center px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <ShoppingBag size={20} className="mr-3" />
            <span>{t('nav.items')}</span>
          </Link>
          
          <Link 
            to="/roommates" 
            className="flex items-center px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <Users size={20} className="mr-3" />
            <span>{t('nav.roommates')}</span>
          </Link>
          
          {/* User Section */}
          <div className="pt-4 pb-2">
            <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              USER
            </p>
          </div>
          
          {/* Student-only favorites */}
          {userRole === 'student' && (
            <Link
              to="/favorites"
              className="flex items-center px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <Heart size={20} className="mr-3" />
              <span>{t('nav.favorites')}</span>
            </Link>
          )}
          
          {/* Profile - Available for all users */}
          <Link
            to="/profile"
            className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
              location.pathname === '/profile' ? 'bg-primary-50 text-primary-600' : 'hover:bg-gray-100'
            }`}
          >
            <User size={20} className="mr-3" />
            <span>{t('nav.profile')}</span>
          </Link>
          


          {/* Management Section */}
          <div className="pt-4 pb-2">
            <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              MANAGE
            </p>
          </div>

          {/* Student Management Links */}
          {userRole === 'student' && (
            <>
              <Link
                to="/dashboard/my-items"
                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                  location.pathname === '/dashboard/my-items' ? 'bg-primary-50 text-primary-600' : 'hover:bg-gray-100'
                }`}
              >
                <ShoppingBag size={20} className="mr-3" />
                <span>My Items</span>
              </Link>

              <Link
                to="/dashboard/my-roommate-profiles"
                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                  location.pathname === '/dashboard/my-roommate-profiles' ? 'bg-primary-50 text-primary-600' : 'hover:bg-gray-100'
                }`}
              >
                <Users size={20} className="mr-3" />
                <span>My Roommate Profiles</span>
              </Link>
            </>
          )}

          {/* Owner Management Links */}
          {userRole === 'owner' && (
            <Link
              to="/dashboard/my-properties"
              className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                location.pathname === '/dashboard/my-properties' ? 'bg-primary-50 text-primary-600' : 'hover:bg-gray-100'
              }`}
            >
              <Building size={20} className="mr-3" />
              <span>My Properties</span>
            </Link>
          )}

          {/* Admin Management Links */}
          {userRole === 'admin' && (
            <>
              <Link
                to="/dashboard/admin-users"
                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                  location.pathname === '/dashboard/admin-users' ? 'bg-primary-50 text-primary-600' : 'hover:bg-gray-100'
                }`}
              >
                <Users size={20} className="mr-3" />
                <span>Manage Users</span>
              </Link>

              <Link
                to="/dashboard/admin-content"
                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                  location.pathname === '/dashboard/admin-content' ? 'bg-primary-50 text-primary-600' : 'hover:bg-gray-100'
                }`}
              >
                <ShoppingBag size={20} className="mr-3" />
                <span>Manage Content</span>
              </Link>
            </>
          )}
        </nav>
        
        {/* Logout at bottom */}
        <div className="mt-auto p-4 border-t">
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="flex items-center px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors w-full text-left"
          >
            <LogOut size={20} className="mr-3" />
            <span>{t('nav.logout')}</span>
          </button>
        </div>
      </aside>
      
      {/* Main Content */}
      <div className="flex-1">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b shadow-sm flex items-center justify-between px-4">
          <button className="lg:hidden" onClick={toggleSidebar}>
            <Menu size={24} className="text-gray-500" />
          </button>
          
          <div className="flex items-center ml-auto space-x-4">
            <LanguageSwitcher />
            
         
            
            {/* Profile */}
            <div className="flex items-center">
              <ProfileAvatar
                imageUrl={((user as any)?.user || user)?.image}
                name={((user as any)?.user || user)?.name}
                size="sm"
                className="mr-2"
              />
              <div className="flex flex-col">
                <span className="font-medium text-sm">{((user as any)?.user || user)?.name || 'User'}</span>
                <span className="text-xs text-gray-500 capitalize">{user?.role}</span>
              </div>
            </div>
          </div>
        </header>
        
        {/* Dashboard Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;