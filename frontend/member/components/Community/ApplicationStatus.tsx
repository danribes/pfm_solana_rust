import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../../shared/contexts/AuthContext';

interface ApplicationStatusProps {
  requestId: string;
  communityId?: string;
  showActions?: boolean;
}

interface ApplicationStatus {
  id: string;
  userId: string;
  communityId: string;
  communityName: string;
  status: 'draft' | 'submitted' | 'under_review' | 'additional_info_required' | 'approved' | 'rejected' | 'withdrawn' | 'expired';
  priority: 'high' | 'medium' | 'low';
  submittedAt: string;
  updatedAt: string;
  expiresAt?: string;
  reviewProgress: {
    totalSteps: number;
    currentStep: number;
    stepName: string;
    estimatedCompletion?: string;
  };
  adminFeedback?: {
    id: string;
    message: string;
    createdAt: string;
    adminName: string;
    requiresResponse: boolean;
    type: 'info' | 'warning' | 'action_required' | 'approval' | 'rejection';
  }[];
  timeline: {
    id: string;
    status: string;
    timestamp: string;
    description: string;
    adminName?: string;
  }[];
}

const ApplicationStatus: React.FC<ApplicationStatusProps> = ({
  requestId,
  communityId,
  showActions = true
}) => {
  const router = useRouter();
  const { authState } = useAuth();
  
  const [application, setApplication] = useState<ApplicationStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  useEffect(() => {
    const loadApplicationStatus = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock application data
        const mockApplication: ApplicationStatus = {
          id: requestId,
          userId: authState.user?.id || 'user-123',
          communityId: communityId || 'community-456',
          communityName: 'Web3 Developers Community',
          status: 'under_review',
          priority: 'medium',
          submittedAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-20T14:30:00Z',
          expiresAt: '2024-02-15T10:00:00Z',
          reviewProgress: {
            totalSteps: 3,
            currentStep: 2,
            stepName: 'Admin Review',
            estimatedCompletion: '2024-01-25T10:00:00Z'
          },
          adminFeedback: [
            {
              id: 'feedback-1',
              message: 'Thank you for your application! We are currently reviewing your Web3 experience and project history.',
              createdAt: '2024-01-18T09:00:00Z',
              adminName: 'Community Admin',
              requiresResponse: false,
              type: 'info'
            }
          ],
          timeline: [
            {
              id: 'timeline-1',
              status: 'submitted',
              timestamp: '2024-01-15T10:00:00Z',
              description: 'Application submitted successfully'
            },
            {
              id: 'timeline-2',
              status: 'under_review',
              timestamp: '2024-01-16T14:00:00Z',
              description: 'Application moved to review queue',
              adminName: 'Auto System'
            },
            {
              id: 'timeline-3',
              status: 'under_review',
              timestamp: '2024-01-18T09:00:00Z',
              description: 'Initial review completed, moving to admin review',
              adminName: 'Review Bot'
            }
          ]
        };
        
        setApplication(mockApplication);
      } catch (err) {
        setError('Failed to load application status');
        console.error('Error loading application:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadApplicationStatus();
  }, [requestId, communityId, authState.user?.id]);

  const handleWithdraw = async () => {
    if (!application) return;
    
    const confirmed = window.confirm(
      'Are you sure you want to withdraw your application? This action cannot be undone.'
    );
    
    if (!confirmed) return;

    setIsWithdrawing(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Application withdrawn:', requestId);
      
      // Update status
      setApplication(prev => prev ? {
        ...prev,
        status: 'withdrawn',
        updatedAt: new Date().toISOString(),
        timeline: [
          ...prev.timeline,
          {
            id: `timeline-${Date.now()}`,
            status: 'withdrawn',
            timestamp: new Date().toISOString(),
            description: 'Application withdrawn by applicant'
          }
        ]
      } : null);
      
      alert('Application withdrawn successfully');
    } catch (err) {
      console.error('Failed to withdraw application:', err);
      alert('Failed to withdraw application. Please try again.');
    } finally {
      setIsWithdrawing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'blue';
      case 'under_review': return 'yellow';
      case 'approved': return 'green';
      case 'rejected': return 'red';
      case 'withdrawn': return 'gray';
      case 'expired': return 'red';
      case 'additional_info_required': return 'orange';
      default: return 'gray';
    }
  };

  const getStatusIcon = (status: string) => {
    const iconClass = "w-5 h-5";
    
    switch (status) {
      case 'submitted':
        return (
          <svg className={`${iconClass} text-blue-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        );
      case 'under_review':
        return (
          <svg className={`${iconClass} text-yellow-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'approved':
        return (
          <svg className={`${iconClass} text-green-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'rejected':
      case 'withdrawn':
      case 'expired':
        return (
          <svg className={`${iconClass} text-red-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className={`${iconClass} text-gray-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusTitle = (status: string) => {
    switch (status) {
      case 'submitted': return 'Application Submitted';
      case 'under_review': return 'Under Review';
      case 'approved': return 'Application Approved';
      case 'rejected': return 'Application Rejected';
      case 'withdrawn': return 'Application Withdrawn';
      case 'expired': return 'Application Expired';
      case 'additional_info_required': return 'Additional Information Required';
      default: return 'Unknown Status';
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error || 'Failed to load application status'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        
        <h1 className="text-3xl font-bold text-gray-900">Application Status</h1>
        <p className="text-gray-600 mt-2">{application.communityName}</p>
      </div>

      {/* Status Card */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            {getStatusIcon(application.status)}
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {getStatusTitle(application.status)}
              </h2>
              <p className="text-gray-600 mt-1">
                Application ID: {application.id}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Submitted on {formatDate(application.submittedAt)}
              </p>
            </div>
          </div>
          
          <div className={`px-3 py-1 rounded-full text-xs font-medium bg-${getStatusColor(application.status)}-100 text-${getStatusColor(application.status)}-800`}>
            {application.priority} priority
          </div>
        </div>

        {/* Progress Bar for Under Review */}
        {application.status === 'under_review' && (
          <div className="mt-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>{application.reviewProgress.stepName}</span>
              <span>{application.reviewProgress.currentStep} of {application.reviewProgress.totalSteps} steps</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${(application.reviewProgress.currentStep / application.reviewProgress.totalSteps) * 100}%` }}
              ></div>
            </div>
            {application.reviewProgress.estimatedCompletion && (
              <p className="text-xs text-gray-500 mt-2">
                Estimated completion: {formatDate(application.reviewProgress.estimatedCompletion)}
              </p>
            )}
          </div>
        )}

        {/* Expiration Notice */}
        {application.expiresAt && application.status !== 'approved' && application.status !== 'rejected' && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              ⚠️ This application will expire on {formatDate(application.expiresAt)}
            </p>
          </div>
        )}
      </div>

      {/* Admin Feedback */}
      {application.adminFeedback && application.adminFeedback.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Feedback</h3>
          <div className="space-y-4">
            {application.adminFeedback.map((feedback) => (
              <div 
                key={feedback.id} 
                className={`p-4 rounded-md border-l-4 ${
                  feedback.type === 'action_required' ? 'bg-orange-50 border-orange-400' :
                  feedback.type === 'warning' ? 'bg-yellow-50 border-yellow-400' :
                  feedback.type === 'approval' ? 'bg-green-50 border-green-400' :
                  feedback.type === 'rejection' ? 'bg-red-50 border-red-400' :
                  'bg-blue-50 border-blue-400'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-gray-800">{feedback.message}</p>
                    {feedback.requiresResponse && (
                      <p className="text-sm font-medium text-orange-700 mt-2">
                        📝 Response required
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-3 text-xs text-gray-500">
                  {feedback.adminName} • {formatDate(feedback.createdAt)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Timeline</h3>
        <div className="space-y-4">
          {application.timeline.map((event, index) => (
            <div key={event.id} className="flex items-start space-x-3">
              <div className={`w-2 h-2 rounded-full mt-2 bg-${getStatusColor(event.status)}-500`}></div>
              <div className="flex-1">
                <p className="text-gray-900">{event.description}</p>
                <div className="text-xs text-gray-500 mt-1">
                  {formatDate(event.timestamp)}
                  {event.adminName && ` • by ${event.adminName}`}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      {showActions && application.status !== 'approved' && application.status !== 'rejected' && application.status !== 'withdrawn' && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
          <div className="flex space-x-4">
            <button
              onClick={() => router.push(`/communities/${application.communityId}/application/edit?requestId=${application.id}`)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Edit Application
            </button>
            
            <button
              onClick={handleWithdraw}
              disabled={isWithdrawing}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {isWithdrawing ? 'Withdrawing...' : 'Withdraw Application'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationStatus;