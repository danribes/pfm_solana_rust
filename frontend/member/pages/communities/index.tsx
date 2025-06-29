import React, { useState } from 'react';

// Community Card Component
const CommunityCard: React.FC<{ community: any }> = ({ community }) => (
  <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
    <div className="flex items-center space-x-4 mb-4">
      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
        <span className="text-blue-600 font-semibold text-lg">
          {community.name.charAt(0)}
        </span>
      </div>
      <div>
        <h3 className="text-lg font-semibold">{community.name}</h3>
        <p className="text-gray-600 text-sm">{community.members} members</p>
      </div>
    </div>
    
    <p className="text-gray-700 mb-4 text-sm">{community.description}</p>
    
    <div className="flex items-center justify-between">
      <span className={`px-2 py-1 text-xs rounded-full ${
        community.status === 'Active' 
          ? 'bg-green-100 text-green-800' 
          : 'bg-yellow-100 text-yellow-800'
      }`}>
        {community.status}
      </span>
      <button className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700">
        {community.joined ? 'View' : 'Join'}
      </button>
    </div>
  </div>
);

const CommunitiesPage: React.FC = () => {
  const [mockCommunities] = useState([
    {
      id: '1',
      name: 'DeFi Governance',
      description: 'Community focused on decentralized finance governance and protocol management.',
      members: 1234,
      status: 'Active',
      joined: false
    },
    {
      id: '2',
      name: 'NFT Collectors',
      description: 'A vibrant community of NFT enthusiasts and collectors sharing insights.',
      members: 567,
      status: 'Active',
      joined: true
    },
    {
      id: '3',
      name: 'Gaming Community',
      description: 'Blockchain gaming community with focus on play-to-earn mechanics.',
      members: 890,
      status: 'Pending Approval',
      joined: false
    },
    {
      id: '4',
      name: 'Developer Hub',
      description: 'Technical community for blockchain developers and smart contract engineers.',
      members: 456,
      status: 'Active',
      joined: false
    }
  ]);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Communities</h1>
            <p className="text-gray-600 mt-2">
              Discover and join PFM communities that match your interests
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Community Browser
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>
                    Browse available communities. Connect your wallet to join and participate in governance.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockCommunities.map((community) => (
              <CommunityCard key={community.id} community={community} />
            ))}
          </div>

          {mockCommunities.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500">
                No communities found.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunitiesPage; 