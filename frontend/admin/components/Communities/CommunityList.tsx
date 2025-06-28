import React, { useState } from 'react';
import { MagnifyingGlassIcon, PlusIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { useCommunityList } from '../../hooks/useCommunities';
import type { CommunityFilters as CommunityFiltersType } from '../../types/community';
import CommunityCard from './CommunityCard';
import CommunityFilters from './CommunityFilters';
import Pagination from './Pagination';
import LoadingSpinner from '../UI/LoadingSpinner';
import EmptyState from '../UI/EmptyState';

interface CommunityListProps {
  onCreateCommunity?: () => void;
  onEditCommunity?: (id: string) => void;
  onDeleteCommunity?: (id: string) => void;
}

const CommunityList: React.FC<CommunityListProps> = ({
  onCreateCommunity,
  onEditCommunity,
  onDeleteCommunity,
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const {
    communities,
    loading,
    error,
    pagination,
    setPage,
    setFilters,
    refreshCommunities,
  } = useCommunityList();

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setFilters({ search: value || undefined });
  };

  const handleFilterApply = (filters: CommunityFiltersType) => {
    setFilters({ ...filters, search: searchTerm || undefined });
    setShowFilters(false);
  };

  const handleRefresh = () => {
    refreshCommunities();
  };

  if (loading && communities.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Communities</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage and monitor your communities
          </p>
        </div>
        
        {onCreateCommunity && (
          <button
            onClick={onCreateCommunity}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Create Community
          </button>
        )}
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search communities..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Filter Button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <FunnelIcon className="h-4 w-4 mr-2" />
          Filters
        </button>

        {/* Refresh Button */}
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          Refresh
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
          <CommunityFilters
            onApply={handleFilterApply}
            onCancel={() => setShowFilters(false)}
          />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error loading communities
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={handleRefresh}
                  className="text-sm bg-red-100 text-red-800 rounded-md px-3 py-1 hover:bg-red-200"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {!error && (
        <>
          {/* Loading overlay */}
          {loading && communities.length > 0 && (
            <div className="relative">
              <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                <LoadingSpinner />
              </div>
            </div>
          )}

          {/* Communities Grid */}
          {communities.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {communities.map((community) => (
                <CommunityCard
                  key={community.id}
                  community={community}
                  onEdit={onEditCommunity ? () => onEditCommunity(community.id) : undefined}
                  onDelete={onDeleteCommunity ? () => onDeleteCommunity(community.id) : undefined}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No communities found"
              description="Get started by creating your first community."
              action={
                onCreateCommunity && {
                  label: "Create Community",
                  onClick: onCreateCommunity,
                }
              }
            />
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-8">
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={setPage}
                totalItems={pagination.total}
                itemsPerPage={pagination.limit}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CommunityList; 