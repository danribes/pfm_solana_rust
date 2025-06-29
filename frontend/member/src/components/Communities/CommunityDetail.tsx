import React, { useState } from 'react';
import { Tab } from '@headlessui/react';
import { 
  UsersIcon, 
  DocumentTextIcon, 
  ClockIcon, 
  StarIcon,
  ShieldCheckIcon,
  CalendarIcon,
  ChatBubbleLeftEllipsisIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { Community, CommunityDetails } from '../../types/community';
import { useMembership } from '../../hooks/useCommunities';
import { useWalletContext } from '../../contexts/WalletContext';
import MembershipModal from './MembershipModal';
import { formatDate, formatMemberCount, getCategoryIcon } from '../../utils/community';

interface CommunityDetailProps {
  community: CommunityDetails;
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

const CommunityDetail: React.FC<CommunityDetailProps> = ({ community }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showMembershipModal, setShowMembershipModal] = useState(false);
  const { connected } = useWalletContext();
  const { membershipStatus, joinCommunity, leaveCommunity, loading, actionLoading } = useMembership(community.id);

  const tabs = [
    {
      name: 'Overview',
      icon: DocumentTextIcon,
      content: <OverviewTab community={community} />
    },
    {
      name: 'Members',
      icon: UsersIcon,
      count: community.member_count,
      content: <MembersTab community={community} />
    },
    {
      name: 'Rules',
      icon: ShieldCheckIcon,
      content: <RulesTab community={community} />
    },
    {
      name: 'Activity',
      icon: ClockIcon,
      content: <ActivityTab community={community} />
    }
  ];

  const handleJoinClick = () => {
    if (!connected) {
      alert('Please connect your wallet to join communities');
      return;
    }
    
    if (community.membership_type === 'approval_required') {
      setShowMembershipModal(true);
    } else {
      joinCommunity();
    }
  };

  const handleLeave = () => {
    if (confirm('Are you sure you want to leave this community?')) {
      leaveCommunity(community.id);
    }
  };

  const getMembershipButton = () => {
    if (!connected) {
      return (
        <button
          disabled
          className="px-6 py-2 bg-gray-300 text-gray-500 rounded-md font-medium cursor-not-allowed"
        >
          Connect Wallet to Join
        </button>
      );
    }

    switch (membershipStatus) {
      case 'member':
        return (
          <button
            onClick={handleLeave}
            disabled={loading}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white rounded-md font-medium"
          >
            {loading ? 'Processing...' : 'Leave Community'}
          </button>
        );
      case 'pending':
        return (
          <button
            disabled
            className="px-6 py-2 bg-yellow-500 text-white rounded-md font-medium cursor-not-allowed"
          >
            Request Pending
          </button>
        );
      case 'rejected':
        return (
          <button
            disabled
            className="px-6 py-2 bg-gray-400 text-white rounded-md font-medium cursor-not-allowed"
          >
            Request Denied
          </button>
        );
      default:
        return (
          <button
            onClick={handleJoinClick}
            disabled={loading}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-md font-medium"
          >
            {loading ? 'Processing...' : 'Join Community'}
          </button>
        );
    }
  };

  const renderRating = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, index) => (
          index < Math.floor(rating) ? (
            <StarIconSolid key={index} className="h-4 w-4 text-yellow-400" />
          ) : (
            <StarIcon key={index} className="h-4 w-4 text-gray-300" />
          )
        ))}
        <span className="ml-1 text-sm text-gray-600">({rating.toFixed(1)})</span>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Section */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="relative h-48 sm:h-64 bg-gradient-to-r from-indigo-500 to-purple-600">
          <div className="absolute inset-0 bg-black bg-opacity-20" />
          <div className="absolute bottom-6 left-6 text-white">
            <div className="flex items-center space-x-3 mb-2">
              <div className="text-3xl">
                {getCategoryIcon(community.category)}
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">{community.name}</h1>
                <p className="text-indigo-100 capitalize">{community.category.replace('_', ' ')}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1">
              <p className="text-gray-700 text-lg mb-3">{community.description}</p>
              
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <UsersIcon className="h-4 w-4 mr-1" />
                  {formatMemberCount(community.member_count)} members
                </div>
                <div className="flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  Created {formatDate(community.created_at)}
                </div>
                <div className="flex items-center">
                  {renderRating(community.rating || 0)}
                </div>
                {community.verified && (
                  <div className="flex items-center text-green-600">
                    <ShieldCheckIcon className="h-4 w-4 mr-1" />
                    Verified
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-4 sm:mt-0 sm:ml-6">
              {getMembershipButton()}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="mt-8">
        <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
          <div className="bg-white shadow-sm rounded-lg">
            <Tab.List className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
                {tabs.map((tab, index) => (
                  <Tab
                    key={tab.name}
                    className={({ selected }) =>
                      classNames(
                        selected
                          ? 'border-indigo-500 text-indigo-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                        'group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm focus:outline-none'
                      )
                    }
                  >
                    <tab.icon
                      className={classNames(
                        selectedIndex === index ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500',
                        '-ml-0.5 mr-2 h-5 w-5'
                      )}
                      aria-hidden="true"
                    />
                    <span>{tab.name}</span>
                    {tab.count !== undefined && (
                      <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2.5 rounded-full text-xs">
                        {tab.count}
                      </span>
                    )}
                  </Tab>
                ))}
              </nav>
            </Tab.List>
            
            <Tab.Panels>
              {tabs.map((tab, index) => (
                <Tab.Panel key={index} className="p-6">
                  {tab.content}
                </Tab.Panel>
              ))}
            </Tab.Panels>
          </div>
        </Tab.Group>
      </div>

      {/* Membership Modal */}
      {showMembershipModal && (
        <MembershipModal
          community={community}
          onClose={() => setShowMembershipModal(false)}
        />
      )}
    </div>
  );
};

// Tab Components
const OverviewTab: React.FC<{ community: CommunityDetails }> = ({ community }) => (
  <div className="space-y-6">
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-3">About this Community</h3>
      <div className="prose prose-indigo max-w-none">
        <p className="text-gray-700">{community.long_description || community.description}</p>
      </div>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h4 className="text-md font-medium text-gray-900 mb-3">Community Stats</h4>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Total Members:</span>
            <span className="font-medium">{formatMemberCount(community.member_count)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Active Votes:</span>
            <span className="font-medium">{community.active_votes || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Last Activity:</span>
            <span className="font-medium">{formatDate(community.last_activity)}</span>
          </div>
        </div>
      </div>
      
      <div>
        <h4 className="text-md font-medium text-gray-900 mb-3">Membership Info</h4>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Type:</span>
            <span className="font-medium capitalize">
              {community.membership_type.replace('_', ' ')}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Status:</span>
            <span className="font-medium capitalize">{community.status}</span>
          </div>
          {community.verified && (
            <div className="flex justify-between">
              <span className="text-gray-600">Verified:</span>
              <span className="font-medium text-green-600">Yes</span>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);

const MembersTab: React.FC<{ community: CommunityDetails }> = ({ community }) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-medium text-gray-900">Community Members</h3>
      <span className="text-sm text-gray-500">
        {formatMemberCount(community.member_count)} total
      </span>
    </div>
    
    <div className="bg-gray-50 rounded-lg p-6 text-center">
      <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
      <h4 className="text-lg font-medium text-gray-900 mb-2">Member List</h4>
      <p className="text-gray-500">
        Member directory and management features are coming soon.
      </p>
    </div>
  </div>
);

const RulesTab: React.FC<{ community: CommunityDetails }> = ({ community }) => (
  <div className="space-y-6">
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">Community Rules & Guidelines</h3>
      
      {community.rules && community.rules.length > 0 ? (
        <div className="space-y-4">
          {community.rules.map((rule, index) => (
            <div key={index} className="border-l-4 border-indigo-500 pl-4">
              <h4 className="font-medium text-gray-900">Rule {index + 1}</h4>
              <p className="text-gray-700 mt-1">{rule}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No Rules Defined</h4>
          <p className="text-gray-500">
            This community hasn't set up specific rules yet.
          </p>
        </div>
      )}
    </div>
    
    {community.guidelines && (
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">Guidelines</h3>
        <div className="prose prose-indigo max-w-none">
          <p className="text-gray-700">{community.guidelines}</p>
        </div>
      </div>
    )}
  </div>
);

const ActivityTab: React.FC<{ community: CommunityDetails }> = ({ community }) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
    </div>
    
    <div className="bg-gray-50 rounded-lg p-6 text-center">
      <ChatBubbleLeftEllipsisIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
      <h4 className="text-lg font-medium text-gray-900 mb-2">Activity Feed</h4>
      <p className="text-gray-500">
        Community activity feed is coming soon. This will show recent votes, discussions, and member activity.
      </p>
    </div>
  </div>
);

export default CommunityDetail; 