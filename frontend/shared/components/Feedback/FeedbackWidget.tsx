import React, { useState, useCallback } from 'react';
import UserFeedbackForm from '../../../../testing/uat/user-feedback-form';

interface FeedbackWidgetProps {
  taskName?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  showOnPages?: string[];
  hideOnPages?: string[];
  sessionId?: string;
  userId?: string;
}

const FeedbackWidget: React.FC<FeedbackWidgetProps> = ({
  taskName = 'General Usage',
  position = 'bottom-right',
  showOnPages = [],
  hideOnPages = [],
  sessionId,
  userId
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Check if widget should be shown on current page
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
  const shouldShow = showOnPages.length === 0 || showOnPages.some(page => currentPath.includes(page));
  const shouldHide = hideOnPages.some(page => currentPath.includes(page));

  if (!shouldShow || shouldHide) {
    return null;
  }

  const handleFeedbackSubmit = useCallback(async (feedbackData: any) => {
    try {
      // Submit feedback to backend API
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...feedbackData,
          userId,
          sessionId,
          url: currentPath,
          timestamp: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        setFeedbackSubmitted(true);
        setTimeout(() => {
          setIsOpen(false);
          setFeedbackSubmitted(false);
        }, 2000);
      } else {
        throw new Error('Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      throw error;
    }
  }, [userId, sessionId, currentPath]);

  const getPositionClasses = () => {
    const baseClasses = 'fixed z-50 transition-all duration-300';
    
    switch (position) {
      case 'bottom-right':
        return `${baseClasses} bottom-4 right-4`;
      case 'bottom-left':
        return `${baseClasses} bottom-4 left-4`;
      case 'top-right':
        return `${baseClasses} top-4 right-4`;
      case 'top-left':
        return `${baseClasses} top-4 left-4`;
      default:
        return `${baseClasses} bottom-4 right-4`;
    }
  };

  if (feedbackSubmitted) {
    return (
      <div className={getPositionClasses()}>
        <div className="bg-green-500 text-white p-4 rounded-lg shadow-lg max-w-sm">
          <div className="flex items-center">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium">Thank you for your feedback!</span>
          </div>
        </div>
      </div>
    );
  }

  if (!isOpen) {
    return (
      <div className={getPositionClasses()}>
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 group"
          aria-label="Give Feedback"
        >
          <svg 
            className="w-6 h-6 group-hover:scale-110 transition-transform" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M7 8h10m0 0V6a2 2 0 00-2-2H9a2 2 0 00-2 2v2m10 0v10a2 2 0 01-2 2H9a2 2 0 01-2-2V8m10 0H7m0 0h10M9 12h6m-6 4h6" 
            />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className={getPositionClasses()}>
      <div className="bg-white rounded-lg shadow-2xl border border-gray-200 max-w-2xl w-screen max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10m0 0V6a2 2 0 00-2-2H9a2 2 0 00-2 2v2m10 0v10a2 2 0 01-2 2H9a2 2 0 01-2-2V8m10 0H7m0 0h10M9 12h6m-6 4h6" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900">Share Your Feedback</h3>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-gray-400 hover:text-gray-600 p-1 rounded"
              aria-label={isMinimized ? "Expand" : "Minimize"}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMinimized ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                )}
              </svg>
            </button>
            
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 p-1 rounded"
              aria-label="Close"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        {!isMinimized && (
          <div className="max-h-[calc(90vh-60px)] overflow-y-auto">
            <UserFeedbackForm
              taskName={taskName}
              onSubmit={handleFeedbackSubmit}
              onCancel={() => setIsOpen(false)}
              sessionId={sessionId}
            />
          </div>
        )}

        {isMinimized && (
          <div className="p-4 text-center">
            <p className="text-gray-600 text-sm">
              Click to expand feedback form
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackWidget;