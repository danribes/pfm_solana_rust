import React, { useState } from 'react';
import { Member, MemberFilters, MemberRole, MemberStatus } from '../../types/member';
import { useMembers, useMemberActions } from '../../hooks/useMembers';
import LoadingSpinner from '../UI/LoadingSpinner';
import EmptyState from '../UI/EmptyState';
import Pagination from '../Communities/Pagination';

interface MemberListProps {
  communityId: string;
}

const MemberList: React.FC<MemberListProps> = ({ communityId }) => {
  const [filters, setFilters] = useState<MemberFilters>({
    status: MemberStatus.APPROVED,
    page: 1,
    limit: 25,
    sort_by: 'joined_at',
    sort_order: 'desc'
  });

  const {
    members,
    pagination,
    loading,
    error,
    updateFilters,
    changePage,
    refreshMembers
  } = useMembers(communityId, filters);

  const {
    removeMember,
    updateRole,
    exportMembers,
    loading: actionLoading,
    error: actionError
  } = useMemberActions(communityId);

  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [showMemberModal, setShowMemberModal] = useState<string | null>(null);

  const handleFilterChange = (key: keyof MemberFilters, value: any) => {
    updateFilters({ [key]: value });
  };

  const handleSelectMember = (memberId: string) => {
    setSelectedMembers(prev => 
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleSelectAll = () => {
    setSelectedMembers(
      selectedMembers.length === members.length 
        ? [] 
        : members.map(member => member.id)
    );
  };

  const handleExport = async (format: 'csv' | 'json' = 'csv') => {
    await exportMembers(filters, format);
  };

  const getStatusColor = (status: MemberStatus) => {
    switch (status) {
      case MemberStatus.APPROVED: return 'text-green-600 bg-green-100';
      case MemberStatus.PENDING: return 'text-yellow-600 bg-yellow-100';
      case MemberStatus.REJECTED: return 'text-red-600 bg-red-100';
      case MemberStatus.BANNED: return 'text-red-800 bg-red-200';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRoleColor = (role: MemberRole) => {
    switch (role) {
      case MemberRole.ADMIN: return 'text-purple-600 bg-purple-100';
      case MemberRole.MODERATOR: return 'text-blue-600 bg-blue-100';
      case MemberRole.MEMBER: return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRoleIcon = (role: MemberRole) => {
    switch (role) {
      case MemberRole.ADMIN: return '👑';
      case MemberRole.MODERATOR: return '🛡️';
      case MemberRole.MEMBER: return '👤';
      default: return '❓';
    }
  };

  if (loading && members.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="text-red-400">⚠️</div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <EmptyState
        title="No Members Found"
        description="No members match your current filters. Try adjusting your search criteria."
        action={{
          label: "Clear Filters",
          onClick: () => updateFilters({ search: '', status: MemberStatus.APPROVED, role: undefined })
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-medium text-gray-900">
              All Members ({pagination.total})
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Manage community members and their roles
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => handleExport('csv')}
              disabled={actionLoading}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              📤 Export
            </button>
            <button
              onClick={refreshMembers}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? <LoadingSpinner size="sm" /> : '🔄'}
              <span className="ml-2">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value || undefined)}
              placeholder="Search members..."
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.status || 'all'}
              onChange={(e) => handleFilterChange('status', e.target.value === 'all' ? undefined : e.target.value)}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="all">All</option>
              <option value={MemberStatus.APPROVED}>Approved</option>
              <option value={MemberStatus.PENDING}>Pending</option>
              <option value={MemberStatus.REJECTED}>Rejected</option>
              <option value={MemberStatus.BANNED}>Banned</option>
            </select>
          </div>

          {/* Role Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              value={filters.role || 'all'}
              onChange={(e) => handleFilterChange('role', e.target.value === 'all' ? undefined : e.target.value)}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="all">All</option>
              <option value={MemberRole.ADMIN}>Admin</option>
              <option value={MemberRole.MODERATOR}>Moderator</option>
              <option value={MemberRole.MEMBER}>Member</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sort By
            </label>
            <select
              value={filters.sort_by || 'joined_at'}
              onChange={(e) => handleFilterChange('sort_by', e.target.value)}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="joined_at">Join Date</option>
              <option value="updated_at">Last Updated</option>
              <option value="username">Username</option>
              <option value="role">Role</option>
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Order
            </label>
            <select
              value={filters.sort_order || 'desc'}
              onChange={(e) => handleFilterChange('sort_order', e.target.value as 'asc' | 'desc')}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedMembers.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-blue-700">
              {selectedMembers.length} member(s) selected
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setSelectedMembers([])}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Clear selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Members List */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={selectedMembers.length === members.length}
              onChange={handleSelectAll}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label className="ml-3 text-sm font-medium text-gray-700">
              Select All
            </label>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {members.map((member) => (
            <div key={member.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedMembers.includes(member.id)}
                    onChange={() => handleSelectMember(member.id)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  
                  <div className="ml-4 flex items-center">
                    <div className="text-2xl mr-3">
                      {getRoleIcon(member.role)}
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        {member.User?.username || 'Anonymous'}
                      </h3>
                      <p className="text-xs text-gray-500 font-mono">
                        {member.User?.wallet_address?.slice(0, 8)}...{member.User?.wallet_address?.slice(-6)}
                      </p>
                      <div className="mt-1 flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(member.status)}`}>
                          {member.status}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs ${getRoleColor(member.role)}`}>
                          {member.role}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="text-right mr-4">
                    <div className="text-sm text-gray-900">
                      Joined {new Date(member.joined_at).toLocaleDateString()}
                    </div>
                    {member.approved_at && (
                      <div className="text-xs text-gray-500">
                        Approved {new Date(member.approved_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setShowMemberModal(member.id)}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      👁️ View
                    </button>
                    <button
                      onClick={() => {
                        // Handle role change
                      }}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      🏷️ Role
                    </button>
                    <div className="relative">
                      <button className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        ⚙️ More
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.pages}
        totalItems={pagination.total}
        itemsPerPage={pagination.limit}
        onPageChange={changePage}
      />

      {/* Action Error */}
      {actionError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="text-red-400">⚠️</div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Action Error</h3>
              <div className="mt-2 text-sm text-red-700">{actionError}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberList; 