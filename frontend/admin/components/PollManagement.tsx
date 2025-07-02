import React, { useState, useEffect } from 'react';

interface Poll {
  id: string;
  title: string;
  description: string;
  category: string;
  creator: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  startsAt: string;
  endsAt: string;
  status: 'draft' | 'scheduled' | 'active' | 'paused' | 'ended' | 'cancelled';
  type: 'single_choice' | 'multiple_choice' | 'ranked_choice' | 'approval';
  visibility: 'public' | 'members_only' | 'restricted' | 'private';
  options: Array<{
    id: string;
    text: string;
    description?: string;
  }>;
  results: {
    totalVotes: number;
    totalEligibleVoters: number;
    participationRate: number;
  };
  settings: {
    allowChangeVote: boolean;
    showRealTimeResults: boolean;
    requireReason: boolean;
    anonymousVoting: boolean;
  };
  isOfficial: boolean;
  isFeatured: boolean;
  tags: string[];
}

interface PollFilters {
  search: string;
  status: string;
  category: string;
  creator: string;
  visibility: string;
  type: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  dateRange: {
    start: string;
    end: string;
  };
}

const PollManagement: React.FC = () => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [filteredPolls, setFilteredPolls] = useState<Poll[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPolls, setSelectedPolls] = useState<Set<string>>(new Set());
  const [showPollModal, setShowPollModal] = useState(false);
  const [selectedPoll, setSelectedPoll] = useState<Poll | null>(null);
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'create' | 'results'>('view');
  
  const [filters, setFilters] = useState<PollFilters>({
    search: '',
    status: 'all',
    category: 'all',
    creator: 'all',
    visibility: 'all',
    type: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    dateRange: {
      start: '',
      end: ''
    }
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);
  const [bulkAction, setBulkAction] = useState('');

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockPolls: Poll[] = [
      {
        id: '1',
        title: 'Should we implement a new governance token?',
        description: 'A proposal to introduce a governance token for community voting and decision making.',
        category: 'Governance',
        creator: {
          id: '1',
          name: 'Alice Johnson',
          email: 'alice@example.com'
        },
        createdAt: '2024-12-15T10:00:00Z',
        startsAt: '2024-12-16T00:00:00Z',
        endsAt: '2024-12-25T23:59:59Z',
        status: 'active',
        type: 'single_choice',
        visibility: 'public',
        options: [
          { id: '1', text: 'Yes, implement governance token', description: 'Full governance implementation' },
          { id: '2', text: 'No, keep current system', description: 'Maintain status quo' },
          { id: '3', text: 'Need more discussion', description: 'Postpone decision' }
        ],
        results: {
          totalVotes: 156,
          totalEligibleVoters: 320,
          participationRate: 48.75
        },
        settings: {
          allowChangeVote: true,
          showRealTimeResults: false,
          requireReason: false,
          anonymousVoting: false
        },
        isOfficial: true,
        isFeatured: true,
        tags: ['governance', 'token', 'voting']
      },
      {
        id: '2',
        title: 'Community event planning for 2025',
        description: 'Vote on the types of events you would like to see in our community next year.',
        category: 'Community',
        creator: {
          id: '2',
          name: 'Bob Smith',
          email: 'bob@example.com'
        },
        createdAt: '2024-12-10T14:30:00Z',
        startsAt: '2024-12-12T00:00:00Z',
        endsAt: '2024-12-20T23:59:59Z',
        status: 'active',
        type: 'multiple_choice',
        visibility: 'members_only',
        options: [
          { id: '1', text: 'Online workshops', description: 'Virtual learning sessions' },
          { id: '2', text: 'In-person meetups', description: 'Local gatherings' },
          { id: '3', text: 'Hackathons', description: 'Development competitions' },
          { id: '4', text: 'Social events', description: 'Networking and fun' },
          { id: '5', text: 'Conferences', description: 'Large-scale events' }
        ],
        results: {
          totalVotes: 89,
          totalEligibleVoters: 280,
          participationRate: 31.79
        },
        settings: {
          allowChangeVote: true,
          showRealTimeResults: true,
          requireReason: false,
          anonymousVoting: true
        },
        isOfficial: false,
        isFeatured: false,
        tags: ['community', 'events', 'planning']
      },
      {
        id: '3',
        title: 'Platform feature prioritization',
        description: 'Help us decide which features to develop next.',
        category: 'Technology',
        creator: {
          id: '3',
          name: 'Charlie Brown',
          email: 'charlie@example.com'
        },
        createdAt: '2024-12-05T09:15:00Z',
        startsAt: '2024-12-06T00:00:00Z',
        endsAt: '2024-12-15T23:59:59Z',
        status: 'ended',
        type: 'ranked_choice',
        visibility: 'public',
        options: [
          { id: '1', text: 'Mobile app improvements', description: 'Better mobile experience' },
          { id: '2', text: 'Real-time notifications', description: 'Instant updates' },
          { id: '3', text: 'Advanced analytics', description: 'Better data insights' },
          { id: '4', text: 'Social features', description: 'Community interaction' }
        ],
        results: {
          totalVotes: 234,
          totalEligibleVoters: 300,
          participationRate: 78.0
        },
        settings: {
          allowChangeVote: false,
          showRealTimeResults: false,
          requireReason: true,
          anonymousVoting: false
        },
        isOfficial: true,
        isFeatured: false,
        tags: ['technology', 'features', 'development']
      }
    ];

    setTimeout(() => {
      setPolls(mockPolls);
      setFilteredPolls(mockPolls);
      setIsLoading(false);
    }, 1000);
  }, []);

  // Filter and sort polls
  useEffect(() => {
    let filtered = [...polls];

    // Apply search filter
    if (filters.search) {
      filtered = filtered.filter(poll =>
        poll.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        poll.description.toLowerCase().includes(filters.search.toLowerCase()) ||
        poll.creator.name.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Apply status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(poll => poll.status === filters.status);
    }

    // Apply category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(poll => poll.category === filters.category);
    }

    // Apply visibility filter
    if (filters.visibility !== 'all') {
      filtered = filtered.filter(poll => poll.visibility === filters.visibility);
    }

    // Apply type filter
    if (filters.type !== 'all') {
      filtered = filtered.filter(poll => poll.type === filters.type);
    }

    // Apply date range filter
    if (filters.dateRange.start) {
      filtered = filtered.filter(poll => 
        new Date(poll.createdAt) >= new Date(filters.dateRange.start)
      );
    }
    if (filters.dateRange.end) {
      filtered = filtered.filter(poll => 
        new Date(poll.createdAt) <= new Date(filters.dateRange.end)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (filters.sortBy) {
        case 'title':
          aValue = a.title;
          bValue = b.title;
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case 'endsAt':
          aValue = new Date(a.endsAt);
          bValue = new Date(b.endsAt);
          break;
        case 'participationRate':
          aValue = a.results.participationRate;
          bValue = b.results.participationRate;
          break;
        case 'totalVotes':
          aValue = a.results.totalVotes;
          bValue = b.results.totalVotes;
          break;
        default:
          aValue = a.createdAt;
          bValue = b.createdAt;
      }

      if (filters.sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    setFilteredPolls(filtered);
    setCurrentPage(1);
  }, [polls, filters]);

  const handlePollAction = (poll: Poll, action: string) => {
    setSelectedPoll(poll);
    setModalMode(action as any);
    setShowPollModal(true);
  };

  const handleCreatePoll = () => {
    setSelectedPoll(null);
    setModalMode('create');
    setShowPollModal(true);
  };

  const handleBulkAction = () => {
    if (!bulkAction || selectedPolls.size === 0) return;
    
    console.log(`Performing ${bulkAction} on polls:`, Array.from(selectedPolls));
    // Implement bulk actions here
    setBulkAction('');
    setSelectedPolls(new Set());
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'ended': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getVisibilityColor = (visibility: string) => {
    switch (visibility) {
      case 'public': return 'bg-green-100 text-green-800';
      case 'members_only': return 'bg-blue-100 text-blue-800';
      case 'restricted': return 'bg-yellow-100 text-yellow-800';
      case 'private': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCurrentPagePolls = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredPolls.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(filteredPolls.length / itemsPerPage);

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Poll Management</h1>
            <p className="text-gray-600">Create, manage, and monitor community polls</p>
          </div>
          <button
            onClick={handleCreatePoll}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Create Poll</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Total Polls</p>
              <p className="text-2xl font-semibold text-gray-900">{polls.length}</p>
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
              <p className="text-sm font-medium text-gray-500">Active Polls</p>
              <p className="text-2xl font-semibold text-gray-900">
                {polls.filter(p => p.status === 'active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Total Votes</p>
              <p className="text-2xl font-semibold text-gray-900">
                {polls.reduce((sum, poll) => sum + poll.results.totalVotes, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Avg Participation</p>
              <p className="text-2xl font-semibold text-gray-900">
                {Math.round(polls.reduce((sum, poll) => sum + poll.results.participationRate, 0) / polls.length)}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Ended Polls</p>
              <p className="text-2xl font-semibold text-gray-900">
                {polls.filter(p => p.status === 'ended').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search Polls</label>
            <input
              type="text"
              placeholder="Search by title, description, or creator..."
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
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="ended">Ended</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="Governance">Governance</option>
              <option value="Community">Community</option>
              <option value="Technology">Technology</option>
              <option value="Finance">Finance</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Visibility</label>
            <select
              value={filters.visibility}
              onChange={(e) => setFilters({ ...filters, visibility: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Visibility</option>
              <option value="public">Public</option>
              <option value="members_only">Members Only</option>
              <option value="restricted">Restricted</option>
              <option value="private">Private</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="single_choice">Single Choice</option>
              <option value="multiple_choice">Multiple Choice</option>
              <option value="ranked_choice">Ranked Choice</option>
              <option value="approval">Approval</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="createdAt">Created Date</option>
              <option value="title">Title</option>
              <option value="endsAt">End Date</option>
              <option value="participationRate">Participation</option>
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
        {selectedPolls.size > 0 && (
          <div className="flex items-center justify-between bg-blue-50 p-3 rounded-md mt-4">
            <span className="text-sm text-blue-700">
              {selectedPolls.size} poll(s) selected
            </span>
            <div className="flex items-center space-x-2">
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select action...</option>
                <option value="pause">Pause Polls</option>
                <option value="resume">Resume Polls</option>
                <option value="feature">Feature Polls</option>
                <option value="export">Export Data</option>
                <option value="delete">Delete Polls</option>
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

      {/* Polls Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Poll
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type & Visibility
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Participation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dates
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {getCurrentPagePolls().map((poll) => (
                <tr key={poll.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input type="checkbox" className="rounded border-gray-300" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900 flex items-center">
                          {poll.title}
                          {poll.isOfficial && (
                            <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                              Official
                            </span>
                          )}
                          {poll.isFeatured && (
                            <span className="ml-1 text-yellow-500">⭐</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          By {poll.creator.name} • {poll.category}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(poll.status)}`}>
                      {poll.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {poll.type.replace('_', ' ').toUpperCase()}
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getVisibilityColor(poll.visibility)}`}>
                      {poll.visibility.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {poll.results.totalVotes} votes
                    </div>
                    <div className="text-xs text-gray-500">
                      {poll.results.participationRate.toFixed(1)}% participation
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>Created: {new Date(poll.createdAt).toLocaleDateString()}</div>
                    <div>Ends: {new Date(poll.endsAt).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handlePollAction(poll, 'view')}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handlePollAction(poll, 'edit')}
                      className="text-green-600 hover:text-green-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handlePollAction(poll, 'results')}
                      className="text-purple-600 hover:text-purple-900"
                    >
                      Results
                    </button>
                  </td>
                </tr>
              ))}
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
                    {Math.min(currentPage * itemsPerPage, filteredPolls.length)}
                  </span>
                  {' '}of{' '}
                  <span className="font-medium">{filteredPolls.length}</span>
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
    </div>
  );
};

export default PollManagement; 