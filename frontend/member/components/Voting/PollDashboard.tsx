import React, { useState, useEffect } from 'react';

interface Poll {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'active' | 'closed' | 'scheduled';
  endsAt: string;
  totalVotes: number;
  totalOptions: number;
  userHasVoted: boolean;
  isPublic: boolean;
  results?: {
    options: Array<{
      id: string;
      text: string;
      voteCount: number;
      percentage: number;
    }>;
    participationRate: number;
  };
}

const PollDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'active' | 'closed' | 'results'>('active');
  const [polls, setPolls] = useState<Poll[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockPolls: Poll[] = [
      {
        id: '1',
        title: 'Should we implement a new governance token?',
        description: 'A proposal to introduce a governance token for community voting and decision making.',
        category: 'Governance',
        status: 'active',
        endsAt: '2024-12-25T12:00:00Z',
        totalVotes: 156,
        totalOptions: 3,
        userHasVoted: false,
        isPublic: true
      },
      {
        id: '2',
        title: 'Community event planning for 2025',
        description: 'Vote on the types of events you would like to see in our community next year.',
        category: 'Community',
        status: 'active',
        endsAt: '2024-12-20T18:00:00Z',
        totalVotes: 89,
        totalOptions: 5,
        userHasVoted: true,
        isPublic: true
      },
      {
        id: '3',
        title: 'Platform feature prioritization',
        description: 'Help us decide which features to develop next.',
        category: 'Technology',
        status: 'closed',
        endsAt: '2024-12-15T12:00:00Z',
        totalVotes: 234,
        totalOptions: 4,
        userHasVoted: true,
        isPublic: true,
        results: {
          options: [
            { id: '1', text: 'Mobile app improvements', voteCount: 89, percentage: 38 },
            { id: '2', text: 'Real-time notifications', voteCount: 67, percentage: 29 },
            { id: '3', text: 'Advanced analytics', voteCount: 45, percentage: 19 },
            { id: '4', text: 'Social features', voteCount: 33, percentage: 14 }
          ],
          participationRate: 78
        }
      },
      {
        id: '4',
        title: 'Budget allocation for Q1 2025',
        description: 'Allocate resources across different community initiatives.',
        category: 'Finance',
        status: 'closed',
        endsAt: '2024-12-10T15:00:00Z',
        totalVotes: 178,
        totalOptions: 6,
        userHasVoted: true,
        isPublic: false,
        results: {
          options: [
            { id: '1', text: 'Marketing & Outreach', voteCount: 45, percentage: 25 },
            { id: '2', text: 'Developer Tools', voteCount: 38, percentage: 21 },
            { id: '3', text: 'Community Events', voteCount: 32, percentage: 18 },
            { id: '4', text: 'Infrastructure', voteCount: 28, percentage: 16 },
            { id: '5', text: 'Education Programs', voteCount: 22, percentage: 12 },
            { id: '6', text: 'Legal & Compliance', voteCount: 13, percentage: 8 }
          ],
          participationRate: 89
        }
      }
    ];

    setTimeout(() => {
      setPolls(mockPolls);
      setIsLoading(false);
    }, 1000);
  }, []);

  const categories = ['all', ...Array.from(new Set(polls.map(poll => poll.category)))];

  const filteredPolls = polls.filter(poll => {
    const matchesTab = poll.status === activeTab || (activeTab === 'results' && poll.status === 'closed' && poll.results);
    const matchesCategory = selectedCategory === 'all' || poll.category === selectedCategory;
    return matchesTab && matchesCategory;
  });

  const getTimeRemaining = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h remaining`;
    return `${hours}h remaining`;
  };

  const getStatusColor = (status: string, userHasVoted: boolean) => {
    if (status === 'active' && !userHasVoted) return 'bg-red-100 text-red-800';
    if (status === 'active' && userHasVoted) return 'bg-green-100 text-green-800';
    if (status === 'closed') return 'bg-gray-100 text-gray-800';
    return 'bg-blue-100 text-blue-800';
  };

  const getStatusText = (status: string, userHasVoted: boolean) => {
    if (status === 'active' && !userHasVoted) return 'Vote Needed';
    if (status === 'active' && userHasVoted) return 'Voted';
    if (status === 'closed') return 'Closed';
    return 'Scheduled';
  };

  const renderPollCard = (poll: Poll) => (
    <div key={poll.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{poll.title}</h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{poll.description}</p>
          
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span className="bg-gray-100 px-2 py-1 rounded-full">{poll.category}</span>
            <span>{poll.totalVotes} votes</span>
            <span>{poll.totalOptions} options</span>
            {!poll.isPublic && <span className="text-orange-600">🔒 Private</span>}
          </div>
        </div>
        
        <div className="flex flex-col items-end space-y-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(poll.status, poll.userHasVoted)}`}>
            {getStatusText(poll.status, poll.userHasVoted)}
          </span>
          
          {poll.status === 'active' && (
            <div className="text-sm text-gray-500 text-right">
              <div>{getTimeRemaining(poll.endsAt)}</div>
              <div className="text-xs">Ends {new Date(poll.endsAt).toLocaleDateString()}</div>
            </div>
          )}
        </div>
      </div>

      {/* Poll Results Preview (for closed polls) */}
      {poll.results && activeTab === 'results' && (
        <div className="mt-4 border-t pt-4">
          <h4 className="font-medium text-gray-900 mb-3">Results</h4>
          <div className="space-y-2">
            {poll.results.options.slice(0, 3).map((option, index) => (
              <div key={option.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-2 flex-1">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                    index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-400'
                  }`}>
                    {index + 1}
                  </span>
                  <span className="text-sm text-gray-700 truncate">{option.text}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${option.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-8 text-right">
                    {option.percentage}%
                  </span>
                </div>
              </div>
            ))}
            {poll.results.options.length > 3 && (
              <div className="text-sm text-gray-500 text-center pt-2">
                +{poll.results.options.length - 3} more options
              </div>
            )}
          </div>
          
          <div className="flex justify-between items-center mt-4 pt-3 border-t">
            <span className="text-sm text-gray-600">
              Participation: {poll.results.participationRate}%
            </span>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View Full Results →
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between items-center mt-4 pt-4 border-t">
        {poll.status === 'active' && !poll.userHasVoted && (
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
            Vote Now
          </button>
        )}
        
        {poll.status === 'active' && poll.userHasVoted && (
          <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors">
            Change Vote
          </button>
        )}
        
        {poll.status === 'closed' && (
          <button className="bg-green-100 text-green-700 px-4 py-2 rounded-md hover:bg-green-200 transition-colors">
            View Results
          </button>
        )}
        
        <button className="text-gray-500 hover:text-gray-700 text-sm">
          View Details
        </button>
      </div>
    </div>
  );

  const renderEmptyState = () => (
    <div className="text-center py-12">
      <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        No {activeTab} polls found
      </h3>
      <p className="text-gray-500 mb-4">
        {activeTab === 'active' && "There are no active polls at the moment. Check back later!"}
        {activeTab === 'closed' && "No closed polls match your current filters."}
        {activeTab === 'results' && "No poll results available yet."}
      </p>
      {activeTab === 'active' && (
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
          Refresh
        </button>
      )}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Community Polls</h1>
        <p className="text-gray-600">
          Participate in community decisions and view voting results
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Total Participated</p>
              <p className="text-2xl font-semibold text-gray-900">
                {polls.filter(p => p.userHasVoted).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </div>
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
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Participation Rate</p>
              <p className="text-2xl font-semibold text-gray-900">
                {Math.round((polls.filter(p => p.userHasVoted).length / Math.max(polls.length, 1)) * 100)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          {/* Tab Navigation */}
          <nav className="flex space-x-4">
            {[
              { id: 'active', label: 'Active Polls', count: polls.filter(p => p.status === 'active').length },
              { id: 'closed', label: 'Closed Polls', count: polls.filter(p => p.status === 'closed').length },
              { id: 'results', label: 'Results', count: polls.filter(p => p.status === 'closed' && p.results).length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>

          {/* Category Filter */}
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Category:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Polls Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="space-y-2">
                <div className="h-2 bg-gray-200 rounded"></div>
                <div className="h-2 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredPolls.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPolls.map(renderPollCard)}
        </div>
      ) : (
        renderEmptyState()
      )}

      {/* Load More Button */}
      {filteredPolls.length > 0 && (
        <div className="text-center mt-8">
          <button className="bg-gray-100 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-200 transition-colors">
            Load More Polls
          </button>
        </div>
      )}
    </div>
  );
};

export default PollDashboard; 