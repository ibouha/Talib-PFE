import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Building,
  Users,
  MessageSquare,
  Eye,
  TrendingUp,
  Calendar,
  Edit,
  Trash2,
  MoreVertical,
  Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock data for the views chart
const viewsData = [
  { month: 'Jan', views: 120 },
  { month: 'Feb', views: 180 },
  { month: 'Mar', views: 150 },
  { month: 'Apr', views: 220 },
  { month: 'May', views: 280 },
  { month: 'Jun', views: 250 }
];

const OwnerDashboard = () => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  // Mock owner data
  const ownerData = {
    name: 'Omar El Fassi',
    joinDate: '2023-06-15',
    stats: {
      activeListings: 8,
      totalInquiries: 45,
      activeApplications: 12,
      totalViews: 890
    },
    properties: [
      {
        id: 1,
        title: 'Modern Studio Near University',
        type: 'Studio',
        location: 'Agdal, Rabat',
        price: 2500,
        status: 'Available',
        views: 156,
        inquiries: 8,
        image: 'https://images.pexels.com/photos/1669799/pexels-photo-1669799.jpeg'
      },
      {
        id: 2,
        title: 'Shared Apartment in City Center',
        type: 'Apartment',
        location: 'Hassan, Rabat',
        price: 3200,
        status: 'Rented',
        views: 234,
        inquiries: 12,
        image: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg'
      },
      {
        id: 3,
        title: 'Student House with Garden',
        type: 'House',
        location: 'Hay Riad, Rabat',
        price: 4500,
        status: 'Available',
        views: 189,
        inquiries: 6,
        image: 'https://images.pexels.com/photos/2082087/pexels-photo-2082087.jpeg'
      }
    ],
    recentInquiries: [
      {
        id: 1,
        student: 'Amal Benmoussa',
        property: 'Modern Studio Near University',
        date: '2024-03-10T14:30:00',
        status: 'New',
        avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg'
      },
      {
        id: 2,
        student: 'Youssef Mansouri',
        property: 'Shared Apartment in City Center',
        date: '2024-03-09T09:15:00',
        status: 'Replied',
        avatar: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg'
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
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-16 w-16 rounded-full overflow-hidden mr-4 border-2 border-primary-100">
              <img
                src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg"
                alt={ownerData.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Welcome back, {ownerData.name}!</h1>
              <p className="text-gray-600">
                Member since {new Date(ownerData.joinDate).toLocaleDateString()}
              </p>
            </div>
          </div>
          <Link
            to="/add-property"
            className="btn-primary flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Property
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
              <Building className="h-6 w-6 text-primary-600" />
            </div>
            <span className="text-2xl font-bold">{ownerData.stats.activeListings}</span>
          </div>
          <h3 className="text-gray-600">Active Listings</h3>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-full bg-accent-100 flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-accent-600" />
            </div>
            <span className="text-2xl font-bold">{ownerData.stats.totalInquiries}</span>
          </div>
          <h3 className="text-gray-600">Total Inquiries</h3>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-full bg-secondary-100 flex items-center justify-center">
              <Users className="h-6 w-6 text-secondary-600" />
            </div>
            <span className="text-2xl font-bold">{ownerData.stats.activeApplications}</span>
          </div>
          <h3 className="text-gray-600">Active Applications</h3>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-full bg-success-100 flex items-center justify-center">
              <Eye className="h-6 w-6 text-success-600" />
            </div>
            <span className="text-2xl font-bold">{ownerData.stats.totalViews}</span>
          </div>
          <h3 className="text-gray-600">Total Views</h3>
        </div>
      </div>

      {/* Properties List and Views Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Properties List */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Your Properties</h2>
            <Link
              to="/dashboard/properties"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {ownerData.properties.map((property) => (
              <div key={property.id} className="flex items-center p-4 border rounded-lg hover:bg-gray-50">
                <img
                  src={property.image}
                  alt={property.title}
                  className="h-16 w-16 rounded-lg object-cover mr-4"
                />
                <div className="flex-grow">
                  <h3 className="font-medium">{property.title}</h3>
                  <p className="text-sm text-gray-500">{property.location}</p>
                  <div className="flex items-center mt-1">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      property.status === 'Available' 
                        ? 'bg-success-100 text-success-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {property.status}
                    </span>
                    <span className="text-sm text-gray-500 ml-3">
                      {property.views} views
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 hover:bg-gray-100 rounded-full">
                    <Edit className="h-4 w-4 text-gray-500" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-full">
                    <MoreVertical className="h-4 w-4 text-gray-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Views Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-6">Property Views</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={viewsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="views" fill="#FFC107" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Inquiries */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Recent Inquiries</h2>
          <Link
            to="/dashboard/inquiries"
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            View All
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Student</th>
                <th className="text-left py-3 px-4">Property</th>
                <th className="text-left py-3 px-4">Date</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {ownerData.recentInquiries.map((inquiry) => (
                <tr key={inquiry.id} className="border-b">
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <img
                        src={inquiry.avatar}
                        alt={inquiry.student}
                        className="h-8 w-8 rounded-full mr-3"
                      />
                      <span>{inquiry.student}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">{inquiry.property}</td>
                  <td className="py-3 px-4">
                    {new Date(inquiry.date).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      inquiry.status === 'New'
                        ? 'bg-primary-100 text-primary-700'
                        : 'bg-success-100 text-success-700'
                    }`}>
                      {inquiry.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <button className="p-1.5 text-gray-500 hover:text-primary-600 rounded-full hover:bg-gray-100">
                        <MessageSquare className="h-4 w-4" />
                      </button>
                      <button className="p-1.5 text-gray-500 hover:text-error-600 rounded-full hover:bg-gray-100">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;