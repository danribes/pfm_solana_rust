// Task 7.1.2: Community Discovery & Browse Interface
// Community Grid component for displaying communities in grid/list layout

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Grid, 
  List, 
  Loader2, 
  AlertCircle, 
  RefreshCw,
  Search,
  Filter
} from 'lucide-react';
import { CommunityGridProps } from '@/types/communityDiscovery';
import CommunityCard from './CommunityCard';

const CommunityGrid: React.FC<CommunityGridProps> = ({
  communities,
  loading = false,
  error = null,
  variant = 'grid',
  showLoadMore = false,
  onLoadMore,
  onCommunityClick,
  onJoinCommunity
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(variant);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!showLoadMore || !onLoadMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [showLoadMore, onLoadMore, loading]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  // Loading skeleton component
  const LoadingSkeleton = () => {
    const skeletonItems = Array.from({ length: viewMode === 'grid' ? 12 : 6 }, (_, i) => i);

    return (
      <div className={viewMode === 'grid' 
        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        : "space-y-4"
      }>
        {skeletonItems.map((index) => (
          <div 
            key={index}
            className={`bg-white rounded-lg shadow-sm border border-gray-200 animate-pulse ${
              viewMode === 'list' ? 'p-6' : 'overflow-hidden'
            }`}
          >
            {viewMode === 'grid' ? (
              <>
                <div className="p-6 pb-4">
                  <div className="flex items-start space-x-3 mb-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg" />
                    <div className="flex-1">
                      <div className="h-5 bg-gray-200 rounded mb-2" />
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                    </div>
                    <div className="w-16 h-6 bg-gray-200 rounded-full" />
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="h-4 bg-gray-200 rounded" />
                    <div className="h-4 bg-gray-200 rounded w-5/6" />
                    <div className="h-4 bg-gray-200 rounded w-4/6" />
                  </div>
                  <div className="flex space-x-2 mb-4">
                    <div className="w-16 h-6 bg-gray-200 rounded-full" />
                    <div className="w-20 h-6 bg-gray-200 rounded-full" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="h-6 bg-gray-200 rounded mb-1" />
                      <div className="h-3 bg-gray-200 rounded" />
                    </div>
                    <div className="text-center">
                      <div className="h-6 bg-gray-200 rounded mb-1" />
                      <div className="h-3 bg-gray-200 rounded" />
                    </div>
                  </div>
                </div>
                <div className="px-6 py-4 bg-gray-50">
                  <div className="h-10 bg-gray-200 rounded-lg" />
                </div>
              </>
            ) : (
              <div className="flex space-x-4">
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0" />
                <div className="flex-1">
                  <div className="h-6 bg-gray-200 rounded mb-2" />
                  <div className="h-4 bg-gray-200 rounded mb-4 w-3/4" />
                  <div className="flex space-x-2 mb-3">
                    <div className="w-16 h-6 bg-gray-200 rounded-full" />
                    <div className="w-20 h-6 bg-gray-200 rounded-full" />
                  </div>
                  <div className="flex space-x-6">
                    <div className="h-4 bg-gray-200 rounded w-20" />
                    <div className="h-4 bg-gray-200 rounded w-16" />
                    <div className="h-4 bg-gray-200 rounded w-24" />
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <div className="w-20 h-6 bg-gray-200 rounded-full" />
                  <div className="w-16 h-8 bg-gray-200 rounded-lg" />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Error state component
  const ErrorState = () => (
    <div className="text-center py-12">
      <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Something went wrong
      </h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        {error || 'We encountered an error while loading communities. Please try again.'}
      </p>
      <button
        onClick={() => window.location.reload()}
        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        Try Again
      </button>
    </div>
  );

  // Empty state component
  const EmptyState = () => (
    <div className="text-center py-12">
      <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        No communities found
      </h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        We couldn't find any communities matching your criteria. Try adjusting your search or filters.
      </p>
      <button
        onClick={() => window.location.href = '/discover'}
        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Filter className="h-4 w-4 mr-2" />
        Clear Filters
      </button>
    </div>
  );

  // View mode toggle
  const ViewModeToggle = () => (
    <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
      <button
        onClick={() => setViewMode('grid')}
        className={`p-2 rounded-md transition-colors ${
          viewMode === 'grid'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        <Grid className="h-4 w-4" />
      </button>
      <button
        onClick={() => setViewMode('list')}
        className={`p-2 rounded-md transition-colors ${
          viewMode === 'list'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        <List className="h-4 w-4" />
      </button>
    </div>
  );

  // Render error state
  if (error && !loading) {
    return <ErrorState />;
  }

  // Render empty state
  if (!loading && communities.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-6">
      {/* Header with view mode toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {communities.length > 0 && (
              <span className="text-gray-500 font-normal">
                {communities.length} communities
              </span>
            )}
          </h2>
        </div>
        <ViewModeToggle />
      </div>

      {/* Community Grid/List */}
      <AnimatePresence mode="wait">
        {loading && communities.length === 0 ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <LoadingSkeleton />
          </motion.div>
        ) : (
          <motion.div
            key={`${viewMode}-${communities.length}`}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={
              viewMode === 'grid'
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "space-y-4"
            }
          >
            {communities.map((community) => (
              <motion.div
                key={community.id}
                variants={itemVariants}
                layout
              >
                <CommunityCard
                  community={community}
                  variant={viewMode}
                  showStats={true}
                  showJoinButton={true}
                  onClick={onCommunityClick}
                  onJoin={onJoinCommunity}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Load More / Infinite Scroll Trigger */}
      {showLoadMore && (
        <div ref={loadMoreRef} className="text-center py-8">
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              <span className="text-gray-600">Loading more communities...</span>
            </div>
          ) : (
            <button
              onClick={onLoadMore}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Load More Communities
            </button>
          )}
        </div>
      )}

      {/* Loading overlay for subsequent loads */}
      {loading && communities.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-4"
        >
          <div className="inline-flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            <span className="text-gray-600">Loading...</span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default CommunityGrid; 