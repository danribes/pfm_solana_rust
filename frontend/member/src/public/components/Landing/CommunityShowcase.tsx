// Task 4.5.2: Community Showcase Component
// Displays featured communities on the landing page

import React, { useState, useEffect } from "react";
import { PublicCommunity } from "../../types/public";
import { useComponentAnalytics, useConversionAnalytics } from "../../hooks/useAnalytics";
import { useFeaturedCommunities } from "../../hooks/useCommunityDiscovery";
import { getCategoryInfo, formatTimeAgo } from "../../services/discovery";

// ============================================================================
// COMMUNITY SHOWCASE COMPONENT
// ============================================================================

export interface CommunityShowcaseProps {
  title?: string;
  subtitle?: string;
  limit?: number;
  showStats?: boolean;
  showActivity?: boolean;
  layout?: "grid" | "carousel";
  className?: string;
  onCommunityClick?: (community: PublicCommunity) => void;
  onViewAll?: () => void;
}

const CommunityShowcase: React.FC<CommunityShowcaseProps> = ({
  title = "Featured Communities",
  subtitle = "Discover active communities making decisions together",
  limit = 6,
  showStats = true,
  showActivity = true,
  layout = "grid",
  className = "",
  onCommunityClick,
  onViewAll,
}) => {
  // ========================================================================
  // HOOKS
  // ========================================================================

  const { trackClick, trackHover } = useComponentAnalytics("CommunityShowcase");
  const { trackCommunityJoin } = useConversionAnalytics();
  const { communities, isLoading, error, refresh } = useFeaturedCommunities(limit);

  // ========================================================================
  // STATE
  // ========================================================================

  const [hoveredCommunity, setHoveredCommunity] = useState<string | null>(null);

  // ========================================================================
  // EVENT HANDLERS
  // ========================================================================

  const handleCommunityClick = (community: PublicCommunity) => {
    trackClick("community_card", {
      communityId: community.id,
      communityName: community.name,
      category: community.category,
      memberCount: community.memberCount,
    });
    onCommunityClick?.(community);
  };

  const handleJoinClick = (community: PublicCommunity, event: React.MouseEvent) => {
    event.stopPropagation();
    trackCommunityJoin(community.id, community.name, "showcase");
    trackClick("join_community", {
      communityId: community.id,
      source: "showcase",
    });
  };

  const handleViewAllClick = () => {
    trackClick("view_all_communities", { source: "showcase" });
    onViewAll?.();
  };

  const handleCommunityHover = (communityId: string) => {
    setHoveredCommunity(communityId);
    trackHover(`community_${communityId}`);
  };

  // ========================================================================
  // RENDER HELPERS
  // ========================================================================

  const renderCommunityCard = (community: PublicCommunity) => {
    const categoryInfo = getCategoryInfo(community.category);
    const isHovered = hoveredCommunity === community.id;

    return (
      <div
        key={community.id}
        className="group bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 transform hover:-translate-y-2 cursor-pointer overflow-hidden"
        onClick={() => handleCommunityClick(community)}
        onMouseEnter={() => handleCommunityHover(community.id)}
        onMouseLeave={() => setHoveredCommunity(null)}
        role="button"
        tabIndex={0}
        aria-label={`View ${community.name} community`}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            handleCommunityClick(community);
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
          
          {/* Category Badge */}
          <div className="absolute top-4 left-4">
            <span 
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${categoryInfo.color}-100 text-${categoryInfo.color}-800 dark:bg-${categoryInfo.color}-900 dark:text-${categoryInfo.color}-200`}
            >
              <span className="mr-1">{categoryInfo.icon}</span>
              {categoryInfo.label}
            </span>
          </div>
          
          {/* Verified Badge */}
          {community.isVerified && (
            <div className="absolute top-4 right-4">
              <div className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-1 rounded-full text-xs font-medium">
                ✓ Verified
              </div>
            </div>
          )}
          
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
            {community.isTrending && (
              <span className="ml-2 text-orange-500 text-sm">🔥</span>
            )}
          </div>
          
          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4 line-clamp-3">
            {community.shortDescription}
          </p>
          
          {/* Stats */}
          {showStats && (
            <div className="grid grid-cols-3 gap-4 mb-4 text-center">
              <div>
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {formatMemberCount(community.memberCount)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Members
                </div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-600 dark:text-green-400">
                  {community.stats.activeCampaigns}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Active Votes
                </div>
              </div>
              <div>
                <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                  {Math.round(community.stats.participationRate * 100)}%
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Participation
                </div>
              </div>
            </div>
          )}
          
          {/* Recent Activity */}
          {showActivity && community.preview.recentActivity.length > 0 && (
            <div className="mb-4">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                Recent Activity
              </div>
              <div className="space-y-1">
                {community.preview.recentActivity.slice(0, 2).map((activity) => (
                  <div key={activity.id} className="text-sm text-gray-600 dark:text-gray-300 flex items-center">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2 flex-shrink-0"></div>
                    <span className="truncate">{activity.title}</span>
                    <span className="ml-auto text-xs text-gray-400 flex-shrink-0">
                      {formatTimeAgo(activity.timestamp)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={(e) => handleJoinClick(community, e)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label={`Join ${community.name}`}
            >
              Join Community
            </button>
            <button
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
              aria-label={`Preview ${community.name}`}
            >
              Preview
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderLoadingState = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: limit }).map((_, index) => (
        <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden animate-pulse">
          <div className="h-48 bg-gray-300 dark:bg-gray-600"></div>
          <div className="p-6">
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-3"></div>
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-4"></div>
            <div className="grid grid-cols-3 gap-4 mb-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="text-center">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-1"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded"></div>
                </div>
              ))}
            </div>
            <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderErrorState = () => (
    <div className="text-center py-12">
      <div className="text-gray-500 dark:text-gray-400 mb-4">
        Failed to load communities
      </div>
      <button
        onClick={refresh}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
      >
        Try Again
      </button>
    </div>
  );

  // ========================================================================
  // MAIN RENDER
  // ========================================================================

  return (
    <section className={`py-16 md:py-24 bg-white dark:bg-gray-800 ${className}`}>
      <div className="container mx-auto px-4">
        
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            {title}
          </h2>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        </div>
        
        {/* Communities Grid */}
        {isLoading && renderLoadingState()}
        {error && renderErrorState()}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {communities.map(renderCommunityCard)}
          </div>
        )}
        
        {/* View All Button */}
        {!isLoading && !error && communities.length > 0 && (
          <div className="text-center mt-12 md:mt-16">
            <button
              onClick={handleViewAllClick}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800"
            >
              Explore All Communities
            </button>
          </div>
        )}
      </div>
    </section>
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

export default CommunityShowcase;
