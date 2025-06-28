import React from 'react';
import { 
  UsersIcon, 
  PencilIcon, 
  TrashIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import type { Community } from '../../types/community';

interface CommunityCardProps {
  community: Community;
  onEdit?: () => void;
  onDelete?: () => void;
  onView?: () => void;
}

const CommunityCard: React.FC<CommunityCardProps> = ({
  community,
  onEdit,
  onDelete,
  onView,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatWalletAddress = (address: string) => {
    if (address.length <= 8) return address;
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-medium text-gray-900 truncate">
              {community.name}
            </h3>
            <p className="mt-1 text-sm text-gray-500 line-clamp-2">
              {community.description}
            </p>
          </div>
          
          <div className="ml-4 flex-shrink-0">
            {community.is_active ? (
              <CheckCircleIcon className="h-5 w-5 text-green-500" title="Active" />
            ) : (
              <XCircleIcon className="h-5 w-5 text-red-500" title="Inactive" />
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 flex items-center text-sm text-gray-500">
          <UsersIcon className="h-4 w-4 mr-1" />
          <span>{community.member_count} members</span>
          <span className="mx-2">•</span>
          <span>Created {formatDate(community.created_at)}</span>
        </div>
      </div>

      {/* Details */}
      <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
        <div className="space-y-2 text-xs text-gray-600">
          <div className="flex justify-between">
            <span>Admin:</span>
            <span className="font-mono">{formatWalletAddress(community.admin_address)}</span>
          </div>
          <div className="flex justify-between">
            <span>Voting Threshold:</span>
            <span>{community.voting_threshold}%</span>
          </div>
          <div className="flex justify-between">
            <span>Wallet:</span>
            <span className="font-mono">{formatWalletAddress(community.wallet_address)}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-6 py-4 border-t border-gray-100">
        <div className="flex justify-end space-x-2">
          {onView && (
            <button
              onClick={onView}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <EyeIcon className="h-3 w-3 mr-1" />
              View
            </button>
          )}
          
          {onEdit && (
            <button
              onClick={onEdit}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <PencilIcon className="h-3 w-3 mr-1" />
              Edit
            </button>
          )}
          
          {onDelete && (
            <button
              onClick={onDelete}
              className="inline-flex items-center px-3 py-1.5 border border-red-300 text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <TrashIcon className="h-3 w-3 mr-1" />
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Status Badge */}
      <div className="absolute top-4 right-4">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            community.is_active
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {community.is_active ? 'Active' : 'Inactive'}
        </span>
      </div>
    </div>
  );
};

export default CommunityCard; 