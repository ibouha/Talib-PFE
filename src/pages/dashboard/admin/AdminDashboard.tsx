import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Users,
  Building,
  TrendingUp,
  UserCheck,
  
  AlertTriangle
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import adminService, { AdminOverviewStats, UserGrowthData } from '../../../services/adminService';

const AdminDashboard = () => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [overviewStats, setOverviewStats] = useState<AdminOverviewStats | null>(null);
  const [userGrowthData, setUserGrowthData] = useState<UserGrowthData[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch overview stats
      const statsResponse = await adminService.getOverviewStats();
      if (statsResponse.success) {
        setOverviewStats(statsResponse.data);
      } else {
        throw new Error(statsResponse.message || 'Failed to fetch overview stats');
      }

      // Fetch user growth data
      const growthResponse = await adminService.getUserGrowthData();
      if (growthResponse.success) {
        setUserGrowthData(growthResponse.data);
      } else {
        console.warn('Failed to fetch user growth data:', growthResponse.message);
        // Don't throw error for growth data, just use empty array
      }

    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load Dashboard</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
              <Users className="h-6 w-6 text-primary-600" />
            </div>
            <span className="text-2xl font-bold">{overviewStats?.total_users || 0}</span>
          </div>
          <h3 className="text-gray-600">{t('Total Users')}</h3>
          <p className="text-sm text-gray-500 mt-2">
            {overviewStats?.verification_rate ? `${overviewStats.verification_rate.toFixed(1)}% verified` : 'Loading...'}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-full bg-accent-100 flex items-center justify-center">
              <Building className="h-6 w-6 text-accent-600" />
            </div>
            <span className="text-2xl font-bold">{overviewStats?.active_listings || 0}</span>
          </div>
          <h3 className="text-gray-600">{t('Active Listings')}</h3>
          <p className="text-sm text-gray-500 mt-2">
            {overviewStats ? 'Properties available' : 'Loading...'}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-full bg-success-100 flex items-center justify-center">
              <UserCheck className="h-6 w-6 text-success-600" />
            </div>
            <span className="text-2xl font-bold">{overviewStats?.verified_users || 0}</span>
          </div>
          <h3 className="text-gray-600">{t('Verified Users')}</h3>
          <p className="text-sm text-success-600 mt-2">
            {overviewStats && overviewStats.total_users > 0 ? `${((overviewStats.verified_users / overviewStats.total_users) * 100).toFixed(1)}% of total` : 'Loading...'}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-full bg-warning-100 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-warning-600" />
            </div>
            <span className="text-2xl font-bold">{overviewStats?.pending_reports || 0}</span>
          </div>
          <h3 className="text-gray-600">{t('Pending Reports')}</h3>
          <p className="text-sm text-warning-600 mt-2">
            {overviewStats?.pending_reports ? 'Require attention' : 'No pending reports'}
          </p>
        </div>
      </div>

      {/* Users Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-6">{t('User Growth')}</h2>
        <div className="h-80">
          {userGrowthData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="students" stroke="#FFC107" strokeWidth={2} name="Students" />
                <Line type="monotone" dataKey="owners" stroke="#4CAF50" strokeWidth={2} name="Owners" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">{t('No growth data available')}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      


    </div>
  );
};

export default AdminDashboard;