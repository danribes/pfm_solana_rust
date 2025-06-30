// Task 4.5.2: Community Card Component
// Individual community display card for discovery

import React from "react";
import { PublicCommunity } from "../../types/public";
import { useComponentAnalytics, useConversionAnalytics } from "../../hooks/useAnalytics";
import { getCategoryInfo, formatTimeAgo } from "../../services/discovery";

// ============================================================================
// COMMUNITY CARD COMPONENT
// ============================================================================

export interface CommunityCardProps {
  community: PublicCommunity;
  viewMode?: "grid" | "list";
  showStats?: boolean;
  showActivity?: boolean;
  showPreview?: boolean;
  className?: string;
  onClick?: () => void;
  onJoin?: () => void;
  onPreview?: () => void;
}

const CommunityCard: React.FC<CommunityCardProps> = ({
  community,
  viewMode = "grid",
  showStats = true,
  showActivity = true,
  showPreview = true,
  className = "",
  onClick,
  onJoin,
  onPreview,
}) => {
  // ========================================================================
  // HOOKS
  // ========================================================================

  const { trackClick, trackHover } = useComponentAnalytics("CommunityCard");
  const { trackCommunityJoin } = useConversionAnalytics();

  // ========================================================================
  // COMPUTED VALUES
  // ========================================================================

  const categoryInfo = getCategoryInfo(community.category);

  // ========================================================================
  // EVENT HANDLERS
  // ========================================================================

  const handleCardClick = () => {
    trackClick("community_view", {
      communityId: community.id,
      communityName: community.name,
      source: "discovery_card",
    });
    onClick?.();
  };

  const handleJoinClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    trackCommunityJoin(community.id, community.name, "discovery_card");
    onJoin?.();
  };

  const handlePreviewClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    trackClick("community_preview", {
      communityId: community.id,
      source: "discovery_card",
    });
    onPreview?.();
  };

  const handleCardHover = () => {
    trackHover(`community_${community.id}`);
  };

  // ========================================================================
  // RENDER HELPERS
  // ========================================================================

  const renderBadges = () => (
    <div className="flex flex-wrap gap-2">
      {/* Category Badge */}
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${categoryInfo.color}-100 text-${categoryInfo.color}-800 dark:bg-${categoryInfo.color}-900 dark:text-${categoryInfo.color}-200`}>
        <span className="mr-1">{categoryInfo.icon}</span>
        {categoryInfo.label}
      </span>
      
      {/* Verified Badge */}
      {community.isVerified && (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          ✓ Verified
        </span>
      )}
      
      {/* Trending Badge */}
      {community.isTrending && (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
          🔥 Trending
        </span>
      )}
    </div>
  );

  const renderStats = () => {
    if (!showStats) return null;

    const stats = [
      {
        label: "Members",
        value: formatMemberCount(community.memberCount),
        color: "blue",
      },
      {
        label: "Active Votes",
        value: community.stats.activeCampaigns,
        color: "green",
      },
      {
        label: "Participation",
        value: `${Math.round(community.stats.participationRate * 100)}%`,
        color: "purple",
      },
    ];

    return (
      <div className="grid grid-cols-3 gap-4 text-center">
        {stats.map((stat, index) => (
          <div key={index}>
            <div className={`text-lg font-bold text-${stat.color}-600 dark:text-${stat.color}-400`}>
              {stat.value}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderActivity = () => {
    if (!showActivity || !community.preview.recentActivity.length) return null;

    return (
      <div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          Recent Activity
        </div>
        <div className="space-y-1">
          {community.preview.recentActivity.slice(0, 3).map((activity) => (
            <div key={activity.id} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2 flex-shrink-0"></div>
              <span className="truncate flex-1">{activity.title}</span>
              <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
                {formatTimeAgo(activity.timestamp)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderActions = () => (
    <div className="flex gap-2">
      <button
        onClick={handleJoinClick}
        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label={`Join ${community.name}`}
      >
        Join Community
      </button>
      
      {showPreview && (
        <button
          onClick={handlePreviewClick}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
          aria-label={`Preview ${community.name}`}
        >
          Preview
        </button>
      )}
    </div>
  );

  // ========================================================================
  // LAYOUT VARIANTS
  // ========================================================================

  if (viewMode === "list") {
    return (
      <div
        className={`group bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 cursor-pointer overflow-hidden ${className}`}
        onClick={handleCardClick}
        onMouseEnter={handleCardHover}
        role="button"
        tabIndex={0}
        aria-label={`View ${community.name} community`}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            handleCardClick();
          }
        }}
      >
        <div className="flex">
          {/* Image */}
          <div className="relative w-48 h-32 flex-shrink-0">
            <img
              src={community.coverImage || "/images/default-community-cover.jpg"}
              alt={`${community.name} cover`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/30"></div>
            <img
              src={community.logo || "/images/default-community-logo.png"}
              alt={`${community.name} logo`}
              className="absolute bottom-2 right-2 w-8 h-8 rounded-full border border-white shadow-sm"
            />
          </div>
          
          {/* Content */}
          <div className="flex-1 p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1 mb-2">
                  {community.name}
                </h3>
                {renderBadges()}
              </div>
            </div>
            
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4 line-clamp-2">
              {community.shortDescription}
            </p>
            
            <div className="flex items-center justify-between">
              {showStats && (
                <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                  <span>{formatMemberCount(community.memberCount)} members</span>
                  <span>{community.stats.activeCampaigns} active votes</span>
                  <span>{Math.round(community.stats.participationRate * 100)}% participation</span>
                </div>
              )}
              
              <div className="flex gap-2 ml-4">
                <button
                  onClick={handleJoinClick}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded text-sm font-medium transition-colors duration-200"
                >
                  Join
                </button>
                {showPreview && (
                  <button
                    onClick={handlePreviewClick}
                    className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-1 px-3 rounded text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    Preview
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid view (default)
  return (
    <div
      className={`group bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 transform hover:-translate-y-2 cursor-pointer overflow-hidden ${className}`}
      onClick={handleCardClick}
      onMouseEnter={handleCardHover}
      role="button"
      tabIndex={0}
      aria-label={`View ${community.name} community`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          handleCardClick();
        }
      }}
    >
      {/* Cover Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={community.coverImage || "/images/default-community-cover.jpg"}
          alt={`${community.name} cover`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        
        {/* Top Badges */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
          <div className="flex flex-wrap gap-1">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${categoryInfo.color}-100 text-${categoryInfo.color}-800 dark:bg-${categoryInfo.color}-900 dark:text-${categoryInfo.color}-200`}>
              <span className="mr-1">{categoryInfo.icon}</span>
              {categoryInfo.label}
            </span>
          </div>
          
          <div className="flex flex-col gap-1">
            {community.isVerified && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                ✓ Verified
              </span>
            )}
            {community.isTrending && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                🔥
              </span>
            )}
          </div>
        </div>
        
        {/* Logo */}
        <div className="absolute bottom-4 left-4">
          <img
            src={community.logo || "/images/default-community-logo.png"}
            alt={`${community.name} logo`}
            className="w-12 h-12 rounded-full border-2 border-white shadow-lg"
          />
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2 flex-1">
            {community.name}
          </h3>
        </div>
        
        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4 line-clamp-3">
          {community.shortDescription}
        </p>
        
        {/* Stats */}
        {showStats && (
          <div className="mb-4">
            {renderStats()}
          </div>
        )}
        
        {/* Recent Activity */}
        {showActivity && community.preview.recentActivity.length > 0 && (
          <div className="mb-4">
            {renderActivity()}
          </div>
        )}
        
        {/* Actions */}
        {renderActions()}
      </div>
    </div>
  );
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function formatMemberCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}

export default CommunityCard;
