import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Navigate } from 'react-router-dom';
import {
  PlusCircle,
  MessageSquare,
  Eye,
  ChevronRight,
  Building,
  ShoppingBag,
  UserCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import ProfileAvatar from '../../components/common/ProfileAvatar';
import gsap from 'gsap';

const Dashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const statsRef = useRef<HTMLDivElement>(null);

  // Redirect to role-specific dashboard
  if (user?.role === 'owner') {
    return <Navigate to="/dashboard/owner" replace />;
  }

  if (user?.role === 'admin') {
    return <Navigate to="/dashboard/admin" replace />;
  }

  if (user?.role === 'student') {
    return <Navigate to="/dashboard/student" replace />;
  }

  // Static statistics for demo
  const stats = {
    listings: 3,
    messages: 2,
    saved: 5,
    views: 24
  };
  
  // Set up animations
  useEffect(() => {
    gsap.fromTo(
      statsRef.current?.querySelectorAll('.stat-card'),
      { opacity: 0, y: 20 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 0.5,
        stagger: 0.1,
        ease: 'power2.out' 
      }
    );
  }, []);
  
  // Update document title
  useEffect(() => {
    document.title = `${t('nav.dashboard')} | ${t('app.name')}`;
  }, [t]);
  
  // Static recent listings for demo
  const recentListings = [
    {
      id: '1',
      title: 'Modern Studio Near University',
      city: 'Rabat',
      price: 2500,
      postedDate: '2023-08-15',
      type: 'housing'
    },
    {
      id: '2',
      title: 'Economics Textbook',
      city: 'Rabat',
      price: 150,
      postedDate: '2023-08-10',
      type: 'item'
    }
  ];
  
  return (
    <div>
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-2xl font-bold">Welcome back, {((user as any)?.user || user)?.name || 'User'}!</h1>
        <p className="text-gray-600 mt-2">
          {user?.role === 'student' ? 'Manage your student life and find what you need' :
           user?.role === 'owner' ? 'Manage your properties and connect with students' :
           'Manage the platform and oversee all activities'}
        </p>
        <p className="text-gray-600">Here's an overview of your account</p>
      </header>
      
      {/* User Info Card */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="flex items-center">
          <ProfileAvatar
            imageUrl={((user as any)?.user || user)?.image}
            name={((user as any)?.user || user)?.name}
            size="xl"
            className="mr-4"
          />
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900">{((user as any)?.user || user)?.name}</h2>
            <p className="text-gray-600">{((user as any)?.user || user)?.email}</p>
            <div className="flex items-center mt-1">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                {user?.role}
              </span>
              {((user as any)?.user || user)?.university && (
                <span className="ml-2 text-sm text-gray-500">{((user as any)?.user || user).university}</span>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Member since</p>
            <p className="text-sm font-medium text-gray-900">
              {((user as any)?.user || user)?.created_at ? new Date(((user as any)?.user || user).created_at).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div ref={statsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Listings Stat */}
        <div className="stat-card bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500">{t('dashboard.stats.listings')}</h3>
            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
              <Building size={20} className="text-primary-600" />
            </div>
          </div>
          <p className="text-3xl font-bold">{stats.listings}</p>
        </div>
        
        {/* Messages Stat */}
        <div className="stat-card bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500">{t('dashboard.stats.messages')}</h3>
            <div className="h-10 w-10 rounded-full bg-accent-100 flex items-center justify-center">
              <MessageSquare size={20} className="text-accent-600" />
            </div>
          </div>
          <p className="text-3xl font-bold">{stats.messages}</p>
        </div>
        
        {/* Saved Stat */}
        <div className="stat-card bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500">{t('dashboard.stats.saved')}</h3>
            <div className="h-10 w-10 rounded-full bg-secondary-100 flex items-center justify-center">
              <ShoppingBag size={20} className="text-secondary-600" />
            </div>
          </div>
          <p className="text-3xl font-bold">{stats.saved}</p>
        </div>
        
        {/* Views Stat */}
        <div className="stat-card bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500">{t('dashboard.stats.views')}</h3>
            <div className="h-10 w-10 rounded-full bg-success-100 flex items-center justify-center">
              <Eye size={20} className="text-success-600" />
            </div>
          </div>
          <p className="text-3xl font-bold">{stats.views}</p>
        </div>
      </div>
      
      {/* Quick Actions - Student Only */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">{t('dashboard.quickActions.title')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link to="/add-item" className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
            <div className="h-10 w-10 rounded-full bg-accent-100 flex items-center justify-center mr-4">
              <ShoppingBag size={20} className="text-accent-600" />
            </div>
            <div className="flex-grow">
              <h3 className="font-medium">List an Item</h3>
              <p className="text-sm text-gray-500">Sell or exchange an item</p>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </Link>

          <Link to="/create-roommate-profile" className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
            <div className="h-10 w-10 rounded-full bg-secondary-100 flex items-center justify-center mr-4">
              <UserCircle size={20} className="text-secondary-600" />
            </div>
            <div className="flex-grow">
              <h3 className="font-medium">Create Roommate Profile</h3>
              <p className="text-sm text-gray-500">Find compatible roommates</p>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </Link>

          <Link to="/profile" className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center mr-4">
              <UserCircle size={20} className="text-primary-600" />
            </div>
            <div className="flex-grow">
              <h3 className="font-medium">Update Profile</h3>
              <p className="text-sm text-gray-500">Edit your profile details</p>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </Link>
        </div>
      </div>
      
      {/* Recent Listings */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{t('dashboard.recentListings')}</h2>
          <Link to="/dashboard/listings" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            {t('common.seeAll')}
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Title</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Type</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Price</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Date</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Status</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentListings.map((listing) => (
                <tr key={`${listing.type}-${listing.id}`} className="border-b hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded overflow-hidden mr-3 flex-shrink-0 bg-gray-200 flex items-center justify-center">
                        {listing.type === 'housing' ? (
                          <Building size={20} className="text-gray-400" />
                        ) : (
                          <ShoppingBag size={20} className="text-gray-400" />
                        )}
                      </div>
                      <div className="truncate max-w-xs">
                        <p className="font-medium truncate">{listing.title}</p>
                        <p className="text-sm text-gray-500 truncate">{listing.city}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap capitalize">
                    {listing.type}
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    {listing.price.toLocaleString()} MAD
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    {new Date(listing.postedDate).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs rounded-full bg-success-100 text-success-800">
                      Active
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex space-x-2">
                      <Link to={`/${listing.type === 'housing' ? 'housing' : 'items'}/${listing.id}`} className="p-1.5 text-gray-500 hover:text-primary-600 rounded-full hover:bg-gray-100">
                        <Eye size={16} />
                      </Link>
                      <button className="p-1.5 text-gray-500 hover:text-accent-600 rounded-full hover:bg-gray-100">
                        <PlusCircle size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Recent Messages */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{t('dashboard.recentMessages')}</h2>
          <Link to="/dashboard/messages" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            {t('common.seeAll')}
          </Link>
        </div>
        
        <div className="space-y-4">
          <div className="text-center py-8 text-gray-500">
            <MessageSquare size={48} className="mx-auto mb-4 text-gray-300" />
            <p>No recent messages</p>
            <p className="text-sm">Messages will appear here when you start conversations</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;