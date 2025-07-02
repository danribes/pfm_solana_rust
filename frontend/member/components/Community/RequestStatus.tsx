// Task 7.2.2: Community Join Request Interface
// Request status component for displaying join request status

'use client';

import React from 'react';
import {
  RequestStatusProps,
  JoinRequestStatus,
  JOIN_REQUEST_STATUS_LABELS
} from '../../../shared/types/joinRequest';
import { useJoinRequest } from '../../../shared/hooks/useJoinRequests';
import { getRequestStatusColor } from '../../../shared/services/joinRequests';

export default function RequestStatus({
  requestId,
  showHistory = true,
  compact = false
}: RequestStatusProps) {
  const { request, isLoading, error } = useJoinRequest(requestId);

  if (isLoading) {
    return (
      <div className="animate-pulse bg-gray-200 rounded-lg h-20"></div>
    );
  }

  if (error || !request) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <span className="text-red-800">
          {error?.message || 'Failed to load request status'}
        </span>
      </div>
    );
  }

  const getStatusIcon = (status: JoinRequestStatus) => {
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

  const getStatusMessage = (status: JoinRequestStatus) => {
    switch (status) {
      case 'submitted':
        return 'Your application has been submitted and is awaiting review.';
      case 'under_review':
        return 'Your application is currently being reviewed by community administrators.';
      case 'approved':
        return 'Congratulations! Your application has been approved.';
      case 'rejected':
        return 'Your application was not approved at this time.';
      default:
        return 'Status information available.';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="request-status">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {getStatusIcon(request.status)}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {JOIN_REQUEST_STATUS_LABELS[request.status]}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {getStatusMessage(request.status)}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Last updated: {formatDate(request.updatedAt)}
              </p>
            </div>
          </div>
          
          <div className={`px-3 py-1 rounded-full text-xs font-medium bg-${getRequestStatusColor(request.status)}-100 text-${getRequestStatusColor(request.status)}-800`}>
            {request.priority} priority
          </div>
        </div>

        {/* Status History */}
        {showHistory && !compact && request.statusHistory && request.statusHistory.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Status History</h4>
            <div className="space-y-3">
              {request.statusHistory.slice(0, 3).map((historyItem) => (
                <div key={historyItem.id} className="flex items-center space-x-3 text-sm">
                  <div className={`w-2 h-2 rounded-full bg-${getRequestStatusColor(historyItem.status)}-500`} />
                  <span className="font-medium">{JOIN_REQUEST_STATUS_LABELS[historyItem.status]}</span>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-500">{formatDate(historyItem.changedAt)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 