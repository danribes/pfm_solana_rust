// Task 7.2.2: Community Join Request Interface
// Join request button component for initiating community membership requests

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/router';
import {
  JoinRequestButtonProps,
  JoinRequest,
  JoinRequestError
} from '../../../shared/types/joinRequest';
import { useJoinRequests } from '../../../shared/hooks/useJoinRequests';

export default function JoinRequestButton({
  communityId,
  communityName,
  disabled = false,
  variant = 'primary',
  size = 'medium',
  onSuccess,
  onError
}: JoinRequestButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Get current user ID - in real app, this would come from auth context
  const userId = 'current-user-id'; // TODO: Get from auth context

  const handleClick = async () => {
    if (disabled || isLoading) return;

    // Navigate to the full application form
    router.push(`/communities/${communityId}/application`);
  };

  const handleQuickJoin = async () => {
    setIsLoading(true);
    setShowModal(false);

    try {
      // For communities that allow quick join (minimal requirements)
      const quickApplicationData = {
        formId: `quick-${communityId}`,
        responses: [
          {
            questionId: 'quick-interest',
            questionType: 'text' as const,
            answer: 'I am interested in joining this community',
            isRequired: true
          }
        ],
        completedSections: ['quick-join'],
        submissionAttempts: 1,
        validationErrors: [],
        attachments: []
      };

      // This would normally use the join request service
      console.log('Quick join request:', { userId, communityId, quickApplicationData });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockRequest: JoinRequest = {
        id: `req-${Date.now()}`,
        userId,
        communityId,
        status: 'submitted',
        priority: 'medium',
        submittedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        applicationData: quickApplicationData,
        statusHistory: [],
        metadata: {
          source: 'web',
          sessionId: `session-${Date.now()}`,
          attempts: 1,
          lastModified: new Date().toISOString(),
          version: 1
        }
      };

      onSuccess?.(mockRequest);
      
      // Show success message and redirect
      router.push(`/requests/${mockRequest.id}/status`);
    } catch (error) {
      const joinRequestError: JoinRequestError = {
        code: 'SUBMISSION_FAILED',
        message: error instanceof Error ? error.message : 'Failed to submit join request',
        retryable: true
      };
      
      onError?.(joinRequestError);
      console.error('Join request failed:', joinRequestError);
    } finally {
      setIsLoading(false);
    }
  };

  // Button styling based on variant and size
  const getButtonClasses = () => {
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variantClasses = {
      primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
      secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900 focus:ring-gray-500',
      outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500'
    };
    
    const sizeClasses = {
      small: 'px-3 py-1.5 text-sm',
      medium: 'px-4 py-2 text-sm',
      large: 'px-6 py-3 text-base'
    };
    
    return `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`;
  };

  return (
    <>
      <button
        onClick={handleClick}
        disabled={disabled || isLoading}
        className={getButtonClasses()}
        type="button"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Submitting...
          </>
        ) : (
          <>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Request to Join
          </>
        )}
      </button>

      {/* Quick Join Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowModal(false)} />

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Join {communityName}
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        You can either submit a quick join request or complete a full application form with more details.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleClick}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Full Application
                </button>
                <button
                  type="button"
                  onClick={handleQuickJoin}
                  disabled={isLoading}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  {isLoading ? 'Submitting...' : 'Quick Join'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 