import React from 'react';
import { useWallet } from '../WalletConnection';

const DashboardOverview: React.FC = () => {
  const { connected, shortAddress } = useWallet();

  // Mock data for demonstration
  const mockCommunities = [
    { 
      id: '1', 
      name: 'DeFi Governance Hub', 
      members: 1234, 
      status: 'Active',
      role: 'Member',
      joined: '2024-01-15',
      activeVotes: 2
    },
    { 
      id: '2', 
      name: 'NFT Collectors United', 
      members: 567, 
      status: 'Active',
      role: 'Moderator',
      joined: '2024-02-01',
      activeVotes: 1
    },
    { 
      id: '3', 
      name: 'Gaming DAO', 
      members: 890, 
      status: 'Pending',
      role: 'Applicant',
      joined: '2024-02-10',
      activeVotes: 0
    }
  ];

  const mockActiveVotes = [
    {
      id: '1',
      title: 'DeFi Protocol Upgrade Proposal',
      community: 'DeFi Governance Hub',
      deadline: '2024-02-20T18:00:00Z',
      status: 'Active',
      participantCount: 89,
      totalEligible: 120,
      hasVoted: false
    },
    {
      id: '2',
      title: 'New Fee Structure Implementation',
      community: 'DeFi Governance Hub',
      deadline: '2024-02-25T15:00:00Z',
      status: 'Active',
      participantCount: 45,
      totalEligible: 120,
      hasVoted: true
    },
    {
      id: '3',
      title: 'Community Treasury Allocation',
      community: 'NFT Collectors United',
      deadline: '2024-02-18T20:00:00Z',
      status: 'Active',
      participantCount: 234,
      totalEligible: 300,
      hasVoted: false
    }
  ];

  const mockActivity = [
    {
      id: '1',
      type: 'vote',
      title: 'You voted on "DeFi Protocol Upgrade"',
      community: 'DeFi Governance Hub',
      time: '2 hours ago'
    },
    {
      id: '2',
      type: 'join',
      title: 'You joined "Gaming DAO"',
      community: 'Gaming DAO',
      time: '1 day ago'
    },
    {
      id: '3',
      type: 'invite',
      title: 'You were invited to "Web3 Developers"',
      community: 'Web3 Developers',
      time: '2 days ago'
    }
  ];

  const getTimeRemaining = (deadline: string) => {
    const now = new Date();
    const end = new Date(deadline);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h remaining`;
    return `${hours}h remaining`;
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">
                Welcome back{connected && shortAddress ? `, ${shortAddress}` : ''}!
              </h1>
              <p className="mt-2 text-blue-100">
                {connected ? 
                  "Here's what's happening in your communities" : 
                  "Connect your wallet to access your dashboard"
                }
              </p>
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center space-x-4 text-blue-100">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">
                    {connected ? mockCommunities.filter(c => c.status === 'Active').length : '0'}
                  </div>
                  <div className="text-sm">Communities</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">
                    {connected ? mockActiveVotes.filter(v => !v.hasVoted).length : '0'}
                  </div>
                  <div className="text-sm">Pending Votes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">8.4</div>
                  <div className="text-sm">Vote Power</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile stats */}
      <div className="sm:hidden grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4 text-center">
          <div className="text-xl font-bold text-gray-900">
            {connected ? mockCommunities.filter(c => c.status === 'Active').length : '0'}
          </div>
          <div className="text-sm text-gray-500">Communities</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 text-center">
          <div className="text-xl font-bold text-blue-600">
            {connected ? mockActiveVotes.filter(v => !v.hasVoted).length : '0'}
          </div>
          <div className="text-sm text-gray-500">Pending Votes</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 text-center">
          <div className="text-xl font-bold text-green-600">8.4</div>
          <div className="text-sm text-gray-500">Vote Power</div>
        </div>
      </div>

      {connected ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Votes */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow-sm rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900">Active Votes</h2>
                  <a href="/voting" className="text-sm text-blue-600 hover:text-blue-800">
                    View all
                  </a>
                </div>
              </div>
              <div className="p-6">
                {mockActiveVotes.length > 0 ? (
                  <div className="space-y-4">
                    {mockActiveVotes.slice(0, 3).map((vote) => (
                      <div key={vote.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-sm font-medium text-gray-900 mb-1">
                              {vote.title}
                            </h3>
                            <p className="text-sm text-gray-500 mb-2">
                              {vote.community}
                            </p>
                            <div className="flex items-center text-xs text-gray-500 space-x-4">
                              <span>{vote.participantCount}/{vote.totalEligible} participated</span>
                              <span>{getTimeRemaining(vote.deadline)}</span>
                            </div>
                          </div>
                          <div className="ml-4 flex-shrink-0">
                            {vote.hasVoted ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Voted
                              </span>
                            ) : (
                              <a
                                href={`/voting/${vote.id}`}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                              >
                                Vote Now
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <div className="text-gray-400 mb-2">📊</div>
                    <p className="text-sm text-gray-500">No active votes</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* My Communities */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow-sm rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900">My Communities</h2>
                  <a href="/communities" className="text-sm text-blue-600 hover:text-blue-800">
                    Browse
                  </a>
                </div>
              </div>
              <div className="p-6">
                {mockCommunities.length > 0 ? (
                  <div className="space-y-3">
                    {mockCommunities.map((community) => (
                      <div key={community.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{community.name}</p>
                          <div className="flex items-center text-xs text-gray-500 mt-1">
                            <span>{community.members} members</span>
                            <span className="mx-2">•</span>
                            <span>{community.role}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            community.status === 'Active' ? 'bg-green-100 text-green-800' :
                            community.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {community.status}
                          </span>
                          {community.activeVotes > 0 && (
                            <span className="text-xs text-blue-600 mt-1">
                              {community.activeVotes} votes
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <div className="text-gray-400 mb-2">🏘️</div>
                    <p className="text-sm text-gray-500">No communities yet</p>
                    <a
                      href="/communities"
                      className="mt-2 inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                    >
                      Browse communities
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Not connected state */
        <div className="bg-white shadow-sm rounded-lg p-6 text-center">
          <div className="max-w-md mx-auto">
            <div className="text-6xl mb-4">🔗</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Connect Your Wallet
            </h3>
            <p className="text-gray-500 mb-6">
              Connect your wallet to access your communities, participate in voting, and view your personalized dashboard.
            </p>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <span className="text-blue-500 mr-2">✓</span>
                  Join communities
                </div>
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Vote on proposals
                </div>
                <div className="flex items-center">
                  <span className="text-purple-500 mr-2">✓</span>
                  View results
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {connected && (
        <div className="bg-white shadow-sm rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
          </div>
          <div className="p-6">
            {mockActivity.length > 0 ? (
              <div className="space-y-4">
                {mockActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm ${
                      activity.type === 'vote' ? 'bg-blue-500' :
                      activity.type === 'join' ? 'bg-green-500' :
                      'bg-purple-500'
                    }`}>
                      {activity.type === 'vote' ? '🗳️' :
                       activity.type === 'join' ? '👋' : '📧'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <span>{activity.community}</span>
                        <span className="mx-2">•</span>
                        <span>{activity.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="text-gray-400 mb-2">📝</div>
                <p className="text-sm text-gray-500">No recent activity</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardOverview; 