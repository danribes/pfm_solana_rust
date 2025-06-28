import React from 'react';
import { Community, MembershipStatus } from '../../types/community';
import { useWallet } from '../WalletConnection';
import { useMembership } from '../../hooks/useCommunities';
import {
  formatMemberCount,
  formatGrowthRate,
  formatRating,
  formatRelativeTime,
  getCategoryIcon,
  getCategoryColor,
  getHealthStatus,
  getJoinButtonState,
  getCommunityUrl
} from '../../utils/community';

interface CommunityCardProps {
  community: Community;
  variant?: 'grid' | 'list';
  onJoinClick?: (community: Community) => void;
  className?: string;
}

const CommunityCard: React.FC<CommunityCardProps> = ({
  community,
  variant = 'grid',
  onJoinClick,
  className = ''
}) => {
  const { connected } = useWallet();
  const { requestMembership, leaveCommunity, actionLoading } = useMembership();
  
  const healthStatus = getHealthStatus(community);
  const joinButtonState = getJoinButtonState(community);
  const categoryIcon = getCategoryIcon(community.category);
  const categoryColor = getCategoryColor(community.category);

  const handleJoinClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!connected) {
      // Could trigger wallet connection modal
      return;
    }

    if (onJoinClick) {
      onJoinClick(community);
      return;
    }

    try {
      if (community.membership_status === MembershipStatus.ACTIVE) {
        await leaveCommunity(community.id);
      } else {
        await requestMembership({
          community_id: community.id,
          wallet_address: '', // This would come from wallet context
          message: ''
        });
      }
    } catch (error) {
      console.error('Membership action failed:', error);
    }
  };

  const handleCardClick = () => {
    // Navigate to community details
    window.location.href = getCommunityUrl(community);
  };

  if (variant === 'list') {
    return (
      <div 
        className={`bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 cursor-pointer ${className}`}
        onClick={handleCardClick}
      >
        <div className="p-6">
          <div className="flex items-start justify-between">
            {/* Left section */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center mb-2">
                <span className="text-lg mr-2">{categoryIcon}</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryColor}`}>
                  {community.category}
                </span>
                {community.featured && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    ⭐ Featured
                  </span>
                )}
                {community.verified && (
                  <span className="ml-2 inline-flex items-center px-1 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    ✓
                  </span>
                )}
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">
                {community.name}
              </h3>
              
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {community.description}
              </p>

              {/* Stats */}
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>{formatMemberCount(community.member_count)} members</span>
                </div>
                
                {community.active_votes_count > 0 && (
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    <span>{community.active_votes_count} active votes</span>
                  </div>
                )}

                <div className="flex items-center">
                  <span className={`w-2 h-2 rounded-full mr-1 ${
                    healthStatus.status === 'healthy' ? 'bg-green-400' :
                    healthStatus.status === 'warning' ? 'bg-yellow-400' : 'bg-red-400'
                  }`}></span>
                  <span className={healthStatus.color}>{healthStatus.label}</span>
                </div>

                {community.growth_rate !== 0 && (
                  <div className="flex items-center">
                    <span className={`text-xs font-medium ${
                      community.growth_rate > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatGrowthRate(community.growth_rate)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Right section */}
            <div className="ml-6 flex flex-col items-end">
              <div className="flex items-center mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(community.average_rating) ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <span className="ml-1 text-sm text-gray-500">
                  {formatRating(community.average_rating)}
                </span>
              </div>

              <button
                onClick={handleJoinClick}
                disabled={joinButtonState.disabled || actionLoading || !connected}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  joinButtonState.variant === 'primary'
                    ? 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400'
                    : joinButtonState.variant === 'outline'
                    ? 'border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:text-gray-400'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:text-gray-400'
                } disabled:cursor-not-allowed`}
              >
                {actionLoading ? 'Loading...' : joinButtonState.text}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid variant
  return (
    <div 
      className={`bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 cursor-pointer ${className}`}
      onClick={handleCardClick}
    >
      {/* Header with category and status */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <span className="text-lg mr-2">{categoryIcon}</span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryColor}`}>
              {community.category}
            </span>
          </div>
          
          <div className="flex items-center space-x-1">
            {community.featured && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                ⭐
              </span>
            )}
            {community.verified && (
              <span className="inline-flex items-center px-1 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                ✓
              </span>
            )}
          </div>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
          {community.name}
        </h3>

        <p className="text-gray-600 text-sm line-clamp-3 mb-3">
          {community.description}
        </p>

        {/* Quick stats */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center text-gray-500">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 515.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>{formatMemberCount(community.member_count)}</span>
          </div>

          {community.active_votes_count > 0 && (
            <div className="flex items-center text-blue-600">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <span>{community.active_votes_count}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer with rating and join button */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            {Array.from({ length: 5 }).map((_, i) => (
              <svg
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(community.average_rating) ? 'text-yellow-400' : 'text-gray-300'
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
            <span className="ml-1 text-sm text-gray-500">
              {formatRating(community.average_rating)}
            </span>
          </div>

          <div className="flex items-center text-xs text-gray-500">
            <span className={`w-2 h-2 rounded-full mr-1 ${
              healthStatus.status === 'healthy' ? 'bg-green-400' :
              healthStatus.status === 'warning' ? 'bg-yellow-400' : 'bg-red-400'
            }`}></span>
            <span>{healthStatus.label}</span>
          </div>
        </div>

        <button
          onClick={handleJoinClick}
          disabled={joinButtonState.disabled || actionLoading || !connected}
          className={`w-full px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
            joinButtonState.variant === 'primary'
              ? 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400'
              : joinButtonState.variant === 'outline'
              ? 'border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:text-gray-400'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:text-gray-400'
          } disabled:cursor-not-allowed`}
        >
          {actionLoading ? 'Loading...' : joinButtonState.text}
        </button>

        {/* Last activity */}
        <div className="mt-2 text-xs text-gray-400 text-center">
          Last activity {formatRelativeTime(community.last_activity)}
        </div>
      </div>
    </div>
  );
};

export default CommunityCard; 