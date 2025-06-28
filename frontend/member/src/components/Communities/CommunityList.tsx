import React from 'react';
import { Community } from '../../types/community';
import CommunityCard from './CommunityCard';

interface CommunityListProps {
  communities: Community[];
  loading?: boolean;
  error?: string | null;
  onCommunityClick?: (community: Community) => void;
  onJoinClick?: (community: Community) => void;
  className?: string;
  showLoadMore?: boolean;
  onLoadMore?: () => void;
  loadMoreLoading?: boolean;
  emptyMessage?: string;
  emptyDescription?: string;
}

const CommunityList: React.FC<CommunityListProps> = ({
  communities,
  loading = false,
  error = null,
  onCommunityClick,
  onJoinClick,
  className = '',
  showLoadMore = false,
  onLoadMore,
  loadMoreLoading = false,
  emptyMessage = "No communities found",
  emptyDescription = "Try adjusting your search or filters to find communities."
}) => {
  // Loading skeleton for list view
  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 animate-pulse">
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center mb-2">
                  <div className="w-6 h-6 bg-gray-200 rounded mr-2"></div>
                  <div className="w-16 h-4 bg-gray-200 rounded"></div>
                  <div className="w-20 h-4 bg-gray-200 rounded ml-2"></div>
                </div>
                <div className="w-1/2 h-6 bg-gray-200 rounded mb-2"></div>
                <div className="space-y-1 mb-3">
                  <div className="w-full h-4 bg-gray-200 rounded"></div>
                  <div className="w-3/4 h-4 bg-gray-200 rounded"></div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-4 bg-gray-200 rounded"></div>
                  <div className="w-16 h-4 bg-gray-200 rounded"></div>
                  <div className="w-12 h-4 bg-gray-200 rounded"></div>
                </div>
              </div>
              <div className="ml-6 flex flex-col items-end">
                <div className="flex items-center mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="w-4 h-4 bg-gray-200 rounded mr-1"></div>
                  ))}
                </div>
                <div className="w-24 h-8 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Error state
  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading communities</h3>
          <p className="mt-1 text-sm text-gray-500">{error}</p>
          <div className="mt-6">
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading && communities.length === 0) {
    return (
      <div className={className}>
        <LoadingSkeleton />
      </div>
    );
  }

  // Empty state
  if (!loading && communities.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">{emptyMessage}</h3>
          <p className="mt-1 text-sm text-gray-500">{emptyDescription}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Community List */}
      <div className="space-y-4">
        {communities.map((community) => (
          <CommunityCard
            key={community.id}
            community={community}
            variant="list"
            onJoinClick={onJoinClick}
          />
        ))}
      </div>

      {/* Load More Button */}
      {showLoadMore && onLoadMore && (
        <div className="mt-8 text-center">
          <button
            onClick={onLoadMore}
            disabled={loadMoreLoading}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadMoreLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </>
            ) : (
              'Load More Communities'
            )}
          </button>
        </div>
      )}

      {/* Loading overlay for additional content */}
      {loading && communities.length > 0 && (
        <div className="mt-4">
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={`loading-${index}`} className="bg-white rounded-lg shadow-sm border border-gray-200 animate-pulse">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center mb-2">
                        <div className="w-6 h-6 bg-gray-200 rounded mr-2"></div>
                        <div className="w-16 h-4 bg-gray-200 rounded"></div>
                        <div className="w-20 h-4 bg-gray-200 rounded ml-2"></div>
                      </div>
                      <div className="w-1/2 h-6 bg-gray-200 rounded mb-2"></div>
                      <div className="space-y-1 mb-3">
                        <div className="w-full h-4 bg-gray-200 rounded"></div>
                        <div className="w-3/4 h-4 bg-gray-200 rounded"></div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="w-20 h-4 bg-gray-200 rounded"></div>
                        <div className="w-16 h-4 bg-gray-200 rounded"></div>
                        <div className="w-12 h-4 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                    <div className="ml-6 flex flex-col items-end">
                      <div className="flex items-center mb-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div key={i} className="w-4 h-4 bg-gray-200 rounded mr-1"></div>
                        ))}
                      </div>
                      <div className="w-24 h-8 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityList; 