import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Building,
  ShoppingBag,
  Users,
  Heart,
  Bell,
  MessageSquare,
  Eye,
  BookOpen,
  Calendar,
  GraduationCap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import ProfileAvatar from '../../../components/common/ProfileAvatar';
import favoritesService from '../../../services/favoritesService';
import itemsService from '../../../services/itemsService';

// Mock activity data
const activityData = [
  { month: 'Jan', views: 65 },
  { month: 'Feb', views: 85 },
  { month: 'Mar', views: 45 },
  { month: 'Apr', views: 90 },
  { month: 'May', views: 70 },
  { month: 'Jun', views: 120 }
];

const StudentDashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    savedHousing: 0,
    savedItems: 0,
    totalItems: 0,
    messages: 0,
    notifications: 3
  });

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      // Get the actual user ID from the nested user object
      const userId = user.user?.id || user.id;
      console.log('User object:', user);
      console.log('Using user ID:', userId);

      if (!userId) {
        console.error('No user ID found');
        return;
      }

      // Fetch favorites stats
      const favoritesResponse = await favoritesService.getStats(userId);
      if (favoritesResponse.success) {
        const favStats = favoritesResponse.data;
        setStats(prev => ({
          ...prev,
          savedHousing: favStats.housing_count || 0,
          savedItems: favStats.item_count || 0
        }));
      }

      // Fetch user's items count
      const itemsResponse = await itemsService.getAll({ student_id: userId });
      if (itemsResponse.success) {
        setStats(prev => ({
          ...prev,
          totalItems: itemsResponse.data.pagination?.total || 0
        }));
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Student data from auth context
  const studentData = {
    name: user?.user?.name || user?.name || 'Student',
    university: user?.user?.university || user?.university || 'University',
    program: 'Computer Science', // This could be added to user profile
    year: 3, // This could be added to user profile
    recentActivity: [
      {
        id: 1,
        type: 'housing',
        action: 'Saved a housing listing',
        date: '2024-03-10T14:30:00'
      },
      {
        id: 2,
        type: 'message',
        action: 'Received a new message',
        date: '2024-03-09T09:15:00'
      },
      {
        id: 3,
        type: 'item',
        action: 'Listed a textbook for sale',
        date: '2024-03-08T16:45:00'
      }
    ],
    upcomingEvents: [
      {
        id: 1,
        title: 'Housing Viewing',
        date: '2024-03-15T10:00:00',
        location: 'Agdal, Rabat'
      },
      {
        id: 2,
        title: 'Meet Potential Roommate',
        date: '2024-03-17T15:30:00',
        location: 'Campus Café'
      }
    ]
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center">
          <ProfileAvatar
            imageUrl={((user as any)?.user || user)?.image}
            name={studentData.name}
            size="xl"
            className="mr-4 border-2 border-primary-100"
            showBorder={true}
          />
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {studentData.name}!</h1>
            <p className="text-gray-600 flex items-center">
              <GraduationCap className="mr-2 h-4 w-4" />
              {studentData.university} • {studentData.program} • Year {studentData.year}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
              <Building className="h-6 w-6 text-primary-600" />
            </div>
            <span className="text-2xl font-bold">{stats.savedHousing}</span>
          </div>
          <h3 className="text-gray-600">Saved Housing</h3>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-full bg-accent-100 flex items-center justify-center">
              <ShoppingBag className="h-6 w-6 text-accent-600" />
            </div>
            <span className="text-2xl font-bold">{stats.savedItems}</span>
          </div>
          <h3 className="text-gray-600">Saved Items</h3>
        </div>

        

        
      </div>


      {/* Recent Activity and Upcoming Events */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {studentData.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center mr-3 ${
                  activity.type === 'housing' ? 'bg-primary-100 text-primary-600' :
                  activity.type === 'message' ? 'bg-secondary-100 text-secondary-600' :
                  'bg-accent-100 text-accent-600'
                }`}>
                  {activity.type === 'housing' ? <Building className="h-4 w-4" /> :
                   activity.type === 'message' ? <MessageSquare className="h-4 w-4" /> :
                   <ShoppingBag className="h-4 w-4" />}
                </div>
                <div className="flex-grow">
                  <p className="text-gray-800">{activity.action}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(activity.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/housing"
            className="flex items-center p-4 rounded-lg border hover:border-primary-500 hover:bg-primary-50 transition-colors group"
          >
            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center mr-3 group-hover:bg-primary-200">
              <Building className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <h3 className="font-medium">Find Housing</h3>
              <p className="text-sm text-gray-500">Browse available listings</p>
            </div>
          </Link>

          <Link
            to="/items"
            className="flex items-center p-4 rounded-lg border hover:border-accent-500 hover:bg-accent-50 transition-colors group"
          >
            <div className="h-10 w-10 rounded-full bg-accent-100 flex items-center justify-center mr-3 group-hover:bg-accent-200">
              <BookOpen className="h-5 w-5 text-accent-600" />
            </div>
            <div>
              <h3 className="font-medium">Buy/Sell Items</h3>
              <p className="text-sm text-gray-500">Textbooks and more</p>
            </div>
          </Link>

          <Link
            to="/roommates"
            className="flex items-center p-4 rounded-lg border hover:border-secondary-500 hover:bg-secondary-50 transition-colors group"
          >
            <div className="h-10 w-10 rounded-full bg-secondary-100 flex items-center justify-center mr-3 group-hover:bg-secondary-200">
              <Users className="h-5 w-5 text-secondary-600" />
            </div>
            <div>
              <h3 className="font-medium">Find Roommates</h3>
              <p className="text-sm text-gray-500">Connect with others</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;