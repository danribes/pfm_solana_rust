import React, { useState, useEffect } from 'react';

interface User {
  id: string;
  displayName: string;
  email: string;
  joinedAt: string;
  lastActiveAt: string;
  status: 'active' | 'inactive' | 'suspended' | 'banned';
  verificationLevel: 'unverified' | 'basic' | 'enhanced' | 'premium';
  membershipTier: string;
  votingStats: {
    totalVotes: number;
    pollsParticipated: number;
    votingStreak: number;
    accuracy: number;
  };
  reputation: number;
  trustScore: number;
  restrictions: Array<{
    type: string;
    reason: string;
    startDate: string;
    endDate?: string;
    isActive: boolean;
  }>;
  location?: string;
  avatar?: string;
}

interface UserFilters {
  search: string;
  status: string;
  verificationLevel: string;
  membershipTier: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionType, setActionType] = useState<'view' | 'edit' | 'suspend' | 'ban' | 'verify'>('view');
  
  const [filters, setFilters] = useState<UserFilters>({
    search: '',
    status: 'all',
    verificationLevel: 'all',
    membershipTier: 'all',
    sortBy: 'joinedAt',
    sortOrder: 'desc'
  });

  const [bulkAction, setBulkAction] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockUsers: User[] = [
      {
        id: '1',
        displayName: 'Alice Johnson',
        email: 'alice@example.com',
        joinedAt: '2024-01-15T10:00:00Z',
        lastActiveAt: '2024-12-18T14:30:00Z',
        status: 'active',
        verificationLevel: 'enhanced',
        membershipTier: 'premium',
        votingStats: {
          totalVotes: 87,
          pollsParticipated: 45,
          votingStreak: 23,
          accuracy: 78
        },
        reputation: 1250,
        trustScore: 92,
        restrictions: [],
        location: 'San Francisco, CA',
        avatar: '/avatars/alice.jpg'
      },
      {
        id: '2',
        displayName: 'Bob Smith',
        email: 'bob@example.com',
        joinedAt: '2024-03-20T09:15:00Z',
        lastActiveAt: '2024-12-17T11:20:00Z',
        status: 'active',
        verificationLevel: 'basic',
        membershipTier: 'standard',
        votingStats: {
          totalVotes: 34,
          pollsParticipated: 28,
          votingStreak: 5,
          accuracy: 65
        },
        reputation: 680,
        trustScore: 75,
        restrictions: [],
        location: 'New York, NY'
      },
      {
        id: '3',
        displayName: 'Charlie Brown',
        email: 'charlie@example.com',
        joinedAt: '2024-06-10T16:45:00Z',
        lastActiveAt: '2024-12-10T08:30:00Z',
        status: 'suspended',
        verificationLevel: 'unverified',
        membershipTier: 'basic',
        votingStats: {
          totalVotes: 12,
          pollsParticipated: 10,
          votingStreak: 0,
          accuracy: 45
        },
        reputation: 150,
        trustScore: 30,
        restrictions: [
          {
            type: 'temporary_ban',
            reason: 'Spam voting detected',
            startDate: '2024-12-08T00:00:00Z',
            endDate: '2024-12-22T23:59:59Z',
            isActive: true
          }
        ],
        location: 'Austin, TX'
      }
    ];

    setTimeout(() => {
      setUsers(mockUsers);
      setFilteredUsers(mockUsers);
      setIsLoading(false);
    }, 1000);
  }, []);

  // Filter and sort users
  useEffect(() => {
    let filtered = [...users];

    // Apply search filter
    if (filters.search) {
      filtered = filtered.filter(user =>
        user.displayName.toLowerCase().includes(filters.search.toLowerCase()) ||
        user.email.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Apply status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(user => user.status === filters.status);
    }

    // Apply verification level filter
    if (filters.verificationLevel !== 'all') {
      filtered = filtered.filter(user => user.verificationLevel === filters.verificationLevel);
    }

    // Apply membership tier filter
    if (filters.membershipTier !== 'all') {
      filtered = filtered.filter(user => user.membershipTier === filters.membershipTier);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (filters.sortBy) {
        case 'displayName':
          aValue = a.displayName;
          bValue = b.displayName;
          break;
        case 'joinedAt':
          aValue = new Date(a.joinedAt);
          bValue = new Date(b.joinedAt);
          break;
        case 'lastActiveAt':
          aValue = new Date(a.lastActiveAt);
          bValue = new Date(b.lastActiveAt);
          break;
        case 'reputation':
          aValue = a.reputation;
          bValue = b.reputation;
          break;
        case 'totalVotes':
          aValue = a.votingStats.totalVotes;
          bValue = b.votingStats.totalVotes;
          break;
        default:
          aValue = a.joinedAt;
          bValue = b.joinedAt;
      }

      if (filters.sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [users, filters]);

  const handleUserAction = (user: User, action: string) => {
    setSelectedUser(user);
    setActionType(action as any);
    setShowUserModal(true);
  };

  const handleBulkAction = () => {
    if (!bulkAction || selectedUsers.size === 0) return;
    
    console.log(`Performing ${bulkAction} on users:`, Array.from(selectedUsers));
    // Implement bulk actions here
    setBulkAction('');
    setSelectedUsers(new Set());
  };

  const toggleUserSelection = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const selectAllUsers = () => {
    const currentPageUsers = getCurrentPageUsers();
    const allSelected = currentPageUsers.every(user => selectedUsers.has(user.id));
    
    if (allSelected) {
      // Deselect all on current page
      const newSelected = new Set(selectedUsers);
      currentPageUsers.forEach(user => newSelected.delete(user.id));
      setSelectedUsers(newSelected);
    } else {
      // Select all on current page
      const newSelected = new Set(selectedUsers);
      currentPageUsers.forEach(user => newSelected.add(user.id));
      setSelectedUsers(newSelected);
    }
  };

  const getCurrentPageUsers = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredUsers.slice(startIndex, endIndex);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-yellow-100 text-yellow-800';
      case 'banned': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getVerificationColor = (level: string) => {
    switch (level) {
      case 'premium': return 'bg-purple-100 text-purple-800';
      case 'enhanced': return 'bg-blue-100 text-blue-800';
      case 'basic': return 'bg-green-100 text-green-800';
      case 'unverified': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderUserModal = () => {
    if (!selectedUser) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {actionType === 'view' ? 'User Details' : 
                 actionType === 'edit' ? 'Edit User' :
                 actionType === 'suspend' ? 'Suspend User' :
                 actionType === 'ban' ? 'Ban User' : 'Verify User'}
              </h2>
              <button
                onClick={() => setShowUserModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* User Basic Info */}
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                  {selectedUser.avatar ? (
                    <img src={selectedUser.avatar} alt={selectedUser.displayName} className="w-16 h-16 rounded-full" />
                  ) : (
                    <span className="text-2xl font-semibold text-gray-600">
                      {selectedUser.displayName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedUser.displayName}</h3>
                  <p className="text-gray-600">{selectedUser.email}</p>
                  <div className="flex space-x-2 mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedUser.status)}`}>
                      {selectedUser.status}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getVerificationColor(selectedUser.verificationLevel)}`}>
                      {selectedUser.verificationLevel}
                    </span>
                  </div>
                </div>
              </div>

              {/* User Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{selectedUser.votingStats.totalVotes}</div>
                  <div className="text-sm text-gray-600">Total Votes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{selectedUser.reputation}</div>
                  <div className="text-sm text-gray-600">Reputation</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{selectedUser.trustScore}</div>
                  <div className="text-sm text-gray-600">Trust Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{selectedUser.votingStats.votingStreak}</div>
                  <div className="text-sm text-gray-600">Streak Days</div>
                </div>
              </div>

              {/* Member Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Joined</label>
                  <p className="text-sm text-gray-900">{new Date(selectedUser.joinedAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Active</label>
                  <p className="text-sm text-gray-900">{new Date(selectedUser.lastActiveAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Membership Tier</label>
                  <p className="text-sm text-gray-900 capitalize">{selectedUser.membershipTier}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Location</label>
                  <p className="text-sm text-gray-900">{selectedUser.location || 'Not specified'}</p>
                </div>
              </div>

              {/* Restrictions */}
              {selectedUser.restrictions.length > 0 && (
                <div className="pt-4 border-t">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Active Restrictions</label>
                  <div className="space-y-2">
                    {selectedUser.restrictions.filter(r => r.isActive).map((restriction, index) => (
                      <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-md">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-red-800 capitalize">
                              {restriction.type.replace('_', ' ')}
                            </p>
                            <p className="text-sm text-red-600">{restriction.reason}</p>
                            <p className="text-xs text-red-500">
                              From {new Date(restriction.startDate).toLocaleDateString()}
                              {restriction.endDate && ` to ${new Date(restriction.endDate).toLocaleDateString()}`}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-6 border-t">
                <button
                  onClick={() => setShowUserModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
                
                {actionType === 'view' && selectedUser.status === 'active' && (
                  <>
                    <button
                      onClick={() => handleUserAction(selectedUser, 'suspend')}
                      className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
                    >
                      Suspend
                    </button>
                    <button
                      onClick={() => handleUserAction(selectedUser, 'ban')}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      Ban
                    </button>
                  </>
                )}
                
                {actionType === 'view' && selectedUser.verificationLevel === 'unverified' && (
                  <button
                    onClick={() => handleUserAction(selectedUser, 'verify')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Verify
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const currentPageUsers = getCurrentPageUsers();

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
        <p className="text-gray-600">Manage community members, monitor activity, and maintain security</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Total Users</p>
              <p className="text-2xl font-semibold text-gray-900">{users.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Active Users</p>
              <p className="text-2xl font-semibold text-gray-900">
                {users.filter(u => u.status === 'active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Verified Users</p>
              <p className="text-2xl font-semibold text-gray-900">
                {users.filter(u => u.verificationLevel !== 'unverified').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Restricted Users</p>
              <p className="text-2xl font-semibold text-gray-900">
                {users.filter(u => u.status === 'suspended' || u.status === 'banned').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search Users</label>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
              <option value="banned">Banned</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Verification</label>
            <select
              value={filters.verificationLevel}
              onChange={(e) => setFilters({ ...filters, verificationLevel: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Levels</option>
              <option value="unverified">Unverified</option>
              <option value="basic">Basic</option>
              <option value="enhanced">Enhanced</option>
              <option value="premium">Premium</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="joinedAt">Join Date</option>
              <option value="lastActiveAt">Last Active</option>
              <option value="displayName">Name</option>
              <option value="reputation">Reputation</option>
              <option value="totalVotes">Total Votes</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
            <select
              value={filters.sortOrder}
              onChange={(e) => setFilters({ ...filters, sortOrder: e.target.value as 'asc' | 'desc' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedUsers.size > 0 && (
          <div className="flex items-center justify-between bg-blue-50 p-3 rounded-md">
            <span className="text-sm text-blue-700">
              {selectedUsers.size} user(s) selected
            </span>
            <div className="flex items-center space-x-2">
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select action...</option>
                <option value="verify">Verify Users</option>
                <option value="suspend">Suspend Users</option>
                <option value="export">Export Data</option>
                <option value="send_message">Send Message</option>
              </select>
              <button
                onClick={handleBulkAction}
                disabled={!bulkAction}
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
              >
                Apply
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={currentPageUsers.length > 0 && currentPageUsers.every(user => selectedUsers.has(user.id))}
                    onChange={selectAllUsers}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Verification
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stats
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Active
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="animate-pulse bg-gray-200 h-4 w-4 rounded"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="animate-pulse">
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                          <div className="ml-4">
                            <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                            <div className="h-3 bg-gray-200 rounded w-32"></div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="animate-pulse h-4 bg-gray-200 rounded w-16"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="animate-pulse h-4 bg-gray-200 rounded w-20"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="animate-pulse h-4 bg-gray-200 rounded w-24"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="animate-pulse h-4 bg-gray-200 rounded w-20"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="animate-pulse h-4 bg-gray-200 rounded w-16"></div>
                    </td>
                  </tr>
                ))
              ) : (
                currentPageUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedUsers.has(user.id)}
                        onChange={() => toggleUserSelection(user.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.displayName} className="h-10 w-10 rounded-full" />
                          ) : (
                            <span className="text-sm font-medium text-gray-600">
                              {user.displayName.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.displayName}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(user.status)}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getVerificationColor(user.verificationLevel)}`}>
                        {user.verificationLevel}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="space-y-1">
                        <div>{user.votingStats.totalVotes} votes</div>
                        <div className="text-xs text-gray-500">{user.reputation} rep</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.lastActiveAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleUserAction(user, 'view')}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleUserAction(user, 'edit')}
                        className="text-green-600 hover:text-green-900"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{' '}
                  <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span>
                  {' '}to{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * itemsPerPage, filteredUsers.length)}
                  </span>
                  {' '}of{' '}
                  <span className="font-medium">{filteredUsers.length}</span>
                  {' '}results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === pageNum
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* User Modal */}
      {showUserModal && renderUserModal()}
    </div>
  );
};

export default UserManagement; 