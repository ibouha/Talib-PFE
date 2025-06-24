import { useState, useEffect } from 'react';
import { Flag, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import reportService, { CreateReportData } from '../../services/reportService';

interface ReportButtonProps {
  contentType: 'housing' | 'item' | 'roommate_profile' | 'user';
  contentId: string;
  contentTitle?: string;
  className?: string;
  variant?: 'button' | 'icon';
}

const ReportButton: React.FC<ReportButtonProps> = ({
  contentType,
  contentId,
  contentTitle = 'this content',
  className = '',
  variant = 'button'
}) => {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [hasReported, setHasReported] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (user) {
      checkIfReported();
    }
  }, [user, contentType, contentId]);

  const checkIfReported = async () => {
    try {
      setLoading(true);
      const response = await reportService.checkUserReport(contentType, contentId);
      if (response.success) {
        setHasReported(response.data.has_reported);
      }
    } catch (error) {
      console.error('Error checking report status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reason) {
      alert('Please select a reason for reporting');
      return;
    }

    try {
      setSubmitting(true);
      
      const reportData: CreateReportData = {
        content_type: contentType,
        content_id: contentId,
        reason: reason,
        description: description.trim() || undefined
      };

      const response = await reportService.createReport(reportData);
      
      if (response.success) {
        setHasReported(true);
        setShowModal(false);
        setReason('');
        setDescription('');
        alert('Report submitted successfully. Thank you for helping keep our platform safe.');
      } else {
        alert(response.message || 'Failed to submit report');
      }
    } catch (error: any) {
      console.error('Error submitting report:', error);
      alert(error.response?.data?.message || 'Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return null; // Don't show report button for non-authenticated users
  }

  if (hasReported) {
    return (
      <div className={`text-sm text-gray-500 ${className}`}>
        <Flag className="h-4 w-4 inline mr-1" />
        Reported
      </div>
    );
  }

  const buttonContent = variant === 'icon' ? (
    <Flag className="h-4 w-4" />
  ) : (
    <>
      <Flag className="h-4 w-4 mr-2" />
      Report
    </>
  );

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        disabled={loading}
        className={`flex items-center text-gray-600 hover:text-red-600 transition-colors ${className}`}
        title="Report this content"
      >
        {buttonContent}
      </button>

      {/* Report Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Report Content</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-4">
                  You are reporting: <span className="font-medium">{contentTitle}</span>
                </p>
                <p className="text-sm text-gray-500">
                  Please help us understand what's wrong with this content. Your report will be reviewed by our moderation team.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmitReport}>
                {/* Reason */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for reporting *
                  </label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select a reason</option>
                    {reportService.getReportReasons().map((reasonOption) => (
                      <option key={reasonOption} value={reasonOption}>
                        {reasonOption}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional details (optional)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Please provide more details about the issue..."
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {description.length}/500 characters
                  </p>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !reason}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {submitting ? 'Submitting...' : 'Submit Report'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ReportButton;
