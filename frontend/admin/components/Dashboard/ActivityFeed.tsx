import React from 'react';
import { 
  UserPlusIcon, 
  BuildingOfficeIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface ActivityItem {
  id: string;
  type: 'member_joined' | 'community_created' | 'member_approved' | 'system_alert' | 'member_pending';
  title: string;
  description: string;
  timestamp: string;
  user?: {
    name: string;
    avatar?: string;
    wallet?: string;
  };
  metadata?: {
    communityName?: string;
    memberCount?: number;
  };
}

const ActivityFeed: React.FC = () => {
  // Mock activity data - this would come from your API
  const activities: ActivityItem[] = [
    {
      id: '1',
      type: 'member_joined',
      title: 'New member joined Web3 Developers',
      description: 'Alice Johnson has successfully joined the community',
      timestamp: '2 minutes ago',
      user: {
        name: 'Alice Johnson',
        wallet: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU'
      },
      metadata: {
        communityName: 'Web3 Developers',
        memberCount: 347
      }
    },
    {
      id: '2',
      type: 'member_approved',
      title: 'Member application approved',
      description: 'Bob Wilson\'s application for NFT Artists was approved by admin',
      timestamp: '15 minutes ago',
      user: {
        name: 'Bob Wilson',
        wallet: '4vJ9JU1bJJE96FWSJKvHsmmFADCg4gpZQff4P3bkLKi'
      },
      metadata: {
        communityName: 'NFT Artists'
      }
    },
    {
      id: '3',
      type: 'community_created',
      title: 'New community created',
      description: 'DeFi Trading Hub community was successfully created',
      timestamp: '1 hour ago',
      user: {
        name: 'System Admin',
      },
      metadata: {
        communityName: 'DeFi Trading Hub'
      }
    },
    {
      id: '4',
      type: 'member_pending',
      title: 'New membership application',
      description: 'Charlie Davis applied to join Solana Validators',
      timestamp: '2 hours ago',
      user: {
        name: 'Charlie Davis',
        wallet: '8RXqdSRQ6RYDKjMzBp1ue5rFyXrJWLrqhUxMUJjKyBnN'
      },
      metadata: {
        communityName: 'Solana Validators'
      }
    },
    {
      id: '5',
      type: 'system_alert',
      title: 'System maintenance completed',
      description: 'Scheduled maintenance for wallet integration service completed successfully',
      timestamp: '3 hours ago'
    }
  ];

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'member_joined':
        return UserPlusIcon;
      case 'community_created':
        return BuildingOfficeIcon;
      case 'member_approved':
        return CheckCircleIcon;
      case 'system_alert':
        return ExclamationTriangleIcon;
      case 'member_pending':
        return ClockIcon;
      default:
        return ClockIcon;
    }
  };

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'member_joined':
        return 'text-green-600 bg-green-50';
      case 'community_created':
        return 'text-blue-600 bg-blue-50';
      case 'member_approved':
        return 'text-green-600 bg-green-50';
      case 'system_alert':
        return 'text-yellow-600 bg-yellow-50';
      case 'member_pending':
        return 'text-orange-600 bg-orange-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const truncateWallet = (wallet: string) => {
    return `${wallet.slice(0, 4)}...${wallet.slice(-4)}`;
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
        <p className="mt-1 text-sm text-gray-600">
          Latest community actions and system events
        </p>
      </div>
      
      <div className="divide-y divide-gray-200">
        {activities.map((activity) => {
          const Icon = getActivityIcon(activity.type);
          const colorClass = getActivityColor(activity.type);
          
          return (
            <div key={activity.id} className="px-6 py-4 hover:bg-gray-50 transition-colors duration-150">
              <div className="flex space-x-3">
                <div className={`flex-shrink-0 p-2 rounded-full ${colorClass}`}>
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.title}
                    </p>
                    <p className="text-xs text-gray-500 flex-shrink-0">
                      {activity.timestamp}
                    </p>
                  </div>
                  
                  <p className="text-sm text-gray-600 mt-1">
                    {activity.description}
                  </p>
                  
                  {activity.user && (
                    <div className="mt-2 flex items-center space-x-2 text-xs text-gray-500">
                      <span className="font-medium">{activity.user.name}</span>
                      {activity.user.wallet && (
                        <>
                          <span>•</span>
                          <code className="bg-gray-100 px-1 py-0.5 rounded">
                            {truncateWallet(activity.user.wallet)}
                          </code>
                        </>
                      )}
                      {activity.metadata?.communityName && (
                        <>
                          <span>•</span>
                          <span className="text-indigo-600">
                            {activity.metadata.communityName}
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="px-6 py-3 bg-gray-50 text-right">
        <button className="text-sm text-indigo-600 hover:text-indigo-900 font-medium">
          View all activity →
        </button>
      </div>
    </div>
  );
};

export default ActivityFeed; 