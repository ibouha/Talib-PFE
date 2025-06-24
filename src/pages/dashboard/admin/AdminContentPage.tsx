import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Building, 
  ShoppingBag, 
  Users, 
  Search, 
  Filter, 
  MoreVertical, 
  Eye, 
  Trash2, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Calendar,
  MapPin,
  DollarSign,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';
import reportService, { Report } from '../../../services/reportService';

interface ContentItem {
  id: string;
  title: string;
  type: 'housing' | 'item' | 'roommate_profile';
  author: string;
  author_email: string;
  status: 'active' | 'reported' | 'suspended';
  created_at: string;
  price?: number;
  location?: string;
  reports_count: number;
}

const AdminContentPage = () => {
  const { t } = useTranslation();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await reportService.getAllReports();

      if (response.success) {
        setReports(response.data);
      } else {
        console.error('Failed to fetch reports:', response.message);
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReportAction = async (reportId: string, action: 'investigate' | 'resolve' | 'dismiss') => {
    try {
      setActionLoading(`${action}-${reportId}`);

      const response = await reportService.updateReportStatus(reportId, action === 'investigate' ? 'investigating' : action === 'resolve' ? 'resolved' : 'dismissed');

      if (response.success) {
        // Refresh reports
        await fetchReports();
        alert(`Report ${action}d successfully`);
      } else {
        alert(response.message || `Failed to ${action} report`);
      }
    } catch (error) {
      console.error(`Failed to ${action} report:`, error);
      alert(`Failed to ${action} report`);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.content_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.reporter_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.reason?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || report.content_type === typeFilter;
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'housing': return <Building className="h-4 w-4" />;
      case 'item': return <ShoppingBag className="h-4 w-4" />;
      case 'roommate_profile': return <Users className="h-4 w-4" />;
      default: return null;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'housing': return 'bg-blue-100 text-blue-800';
      case 'item': return 'bg-green-100 text-green-800';
      case 'roommate_profile': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content Reports</h1>
          <p className="text-gray-600">Review and moderate reported content</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            <span className="text-red-600 font-medium">{reports.filter(r => r.status === 'pending').length}</span> pending reports
          </div>
          <div className="text-sm text-gray-500">
            Total: {reports.length} reports
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search reports by content, reporter, or reason..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Type Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Types</option>
              <option value="housing">Housing</option>
              <option value="item">Items</option>
              <option value="roommate_profile">Roommate Profiles</option>
            </select>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="investigating">Investigating</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
          </select>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reported Content
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reporter
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reason
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{report.content_title || 'Unknown Content'}</div>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                        {report.content_price && (
                          <div className="flex items-center">
                            <DollarSign className="h-3 w-3 mr-1" />
                            {report.content_price} MAD
                          </div>
                        )}
                        {report.content_location && (
                          <div className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {report.content_location}
                          </div>
                        )}
                      </div>
                      {report.description && (
                        <div className="text-xs text-gray-400 mt-1 line-clamp-2">
                          {report.description}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(report.content_type)}`}>
                      {getTypeIcon(report.content_type)}
                      <span className="ml-1 capitalize">{report.content_type.replace('_', ' ')}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{report.reporter_name}</div>
                      <div className="text-sm text-gray-500">{report.reporter_email}</div>
                      <div className="text-xs text-gray-400 capitalize">{report.reporter_type}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{report.reason}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                      report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      report.status === 'investigating' ? 'bg-blue-100 text-blue-800' :
                      report.status === 'resolved' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {report.status === 'pending' && <AlertTriangle className="h-3 w-3 mr-1" />}
                      {report.status === 'investigating' && <Eye className="h-3 w-3 mr-1" />}
                      {report.status === 'resolved' && <CheckCircle className="h-3 w-3 mr-1" />}
                      {report.status === 'dismissed' && <XCircle className="h-3 w-3 mr-1" />}
                      {report.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(report.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      {report.status === 'pending' && (
                        <button
                          onClick={() => handleReportAction(report.id, 'investigate')}
                          disabled={actionLoading === `investigate-${report.id}`}
                          className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                          title="Start Investigation"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      )}
                      {(report.status === 'pending' || report.status === 'investigating') && (
                        <button
                          onClick={() => handleReportAction(report.id, 'resolve')}
                          disabled={actionLoading === `resolve-${report.id}`}
                          className="text-green-600 hover:text-green-900 disabled:opacity-50"
                          title="Resolve Report"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      )}
                      {(report.status === 'pending' || report.status === 'investigating') && (
                        <button
                          onClick={() => handleReportAction(report.id, 'dismiss')}
                          disabled={actionLoading === `dismiss-${report.id}`}
                          className="text-gray-600 hover:text-gray-900 disabled:opacity-50"
                          title="Dismiss Report"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      )}
                      <Link
                        to={`/${
                          report.content_type === 'item' ? 'items' :
                          report.content_type === 'housing' ? 'housing' :
                          report.content_type === 'roommate_profile' ? 'roommates' :
                          ''
                        }/${report.content_id}`}
                        className="text-primary-500 hover:text-primary-700"
                        title="View Reported Content"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredReports.length === 0 && (
        <div className="text-center py-12">
          <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No reports found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || typeFilter !== 'all' || statusFilter !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'No content has been reported yet.'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminContentPage;
