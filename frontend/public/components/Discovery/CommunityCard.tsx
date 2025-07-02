// Task 7.1.2: Community Discovery & Browse Interface
// Community Card component for displaying community information

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Vote,
  MapPin,
  Calendar,
  CheckCircle,
  Shield,
  ExternalLink,
  Heart,
  TrendingUp,
  Clock
} from 'lucide-react';
import { CommunityCardProps, COMMUNITY_CATEGORIES, COMMUNITY_TYPES } from '@/types/communityDiscovery';

const CommunityCard: React.FC<CommunityCardProps> = ({
  community,
  variant = 'grid',
  showStats = true,
  showJoinButton = true,
  onClick,
  onJoin
}) => {
  const categoryConfig = COMMUNITY_CATEGORIES.find(cat => cat.category === community.category);
  const typeConfig = COMMUNITY_TYPES.find(type => type.type === community.type);

  const handleCardClick = () => {
    if (onClick) {
      onClick(community);
    }
  };

  const handleJoinClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onJoin) {
      onJoin(community.id);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getActivityLevelColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getJoinRequirementText = (requirement: string) => {
    switch (requirement) {
      case 'open': return 'Open to all';
      case 'approval': return 'Requires approval';
      case 'invitation': return 'Invitation only';
      default: return requirement;
    }
  };

  const getJoinRequirementColor = (requirement: string) => {
    switch (requirement) {
      case 'open': return 'text-green-600 bg-green-100';
      case 'approval': return 'text-yellow-600 bg-yellow-100';
      case 'invitation': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (variant === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer p-6"
        onClick={handleCardClick}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4 flex-1">
            {/* Logo */}
            <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
              {community.logo ? (
                <img
                  src={community.logo}
                  alt={community.name}
                  className="w-full h-full rounded-lg object-cover"
                />
              ) : (
                <Users className="h-8 w-8 text-gray-400" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 truncate flex items-center">
                    {community.name}
                    {community.isVerified && (
                      <CheckCircle className="h-5 w-5 text-blue-500 ml-2" />
                    )}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                    {community.description}
                  </p>
                </div>
              </div>

              {/* Tags and Category */}
              <div className="flex items-center space-x-2 mb-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${categoryConfig?.color}-100 text-${categoryConfig?.color}-700`}>
                  {categoryConfig?.label}
                </span>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                  {typeConfig?.label}
                </span>
                {community.tags.slice(0, 2).map((tag, index) => (
                  <span key={index} className="px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Stats */}
              {showStats && (
                <div className="flex items-center space-x-6 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {formatNumber(community.memberCount)} members
                  </div>
                  <div className="flex items-center">
                    <Vote className="h-4 w-4 mr-1" />
                    {community.totalVotes} votes
                  </div>
                  <div className="flex items-center">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    {Math.round(community.stats.engagementScore)}% engagement
                  </div>
                  {community.location && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {community.location}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-3 ml-4">
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${getActivityLevelColor(community.activityLevel)}`}>
              {community.activityLevel} activity
            </div>
            
            {showJoinButton && (
              <button
                onClick={handleJoinClick}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Join
              </button>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  if (variant === 'featured') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.02, y: -5 }}
        transition={{ duration: 0.3 }}
        className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-lg border border-blue-200 hover:shadow-xl transition-all cursor-pointer overflow-hidden"
        onClick={handleCardClick}
      >
        {/* Banner Image */}
        {community.bannerImage && (
          <div className="h-32 bg-gradient-to-r from-blue-400 to-purple-500 relative">
            <img
              src={community.bannerImage}
              alt={community.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-20" />
          </div>
        )}

        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start space-x-3">
              <div className="w-16 h-16 rounded-xl bg-white shadow-md flex items-center justify-center flex-shrink-0">
                {community.logo ? (
                  <img
                    src={community.logo}
                    alt={community.name}
                    className="w-full h-full rounded-xl object-cover"
                  />
                ) : (
                  <Users className="h-8 w-8 text-blue-500" />
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  {community.name}
                  {community.isVerified && (
                    <CheckCircle className="h-5 w-5 text-blue-500 ml-2" />
                  )}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {community.purpose}
                </p>
              </div>
            </div>
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
              Featured
            </span>
          </div>

          {/* Description */}
          <p className="text-gray-700 mb-4 line-clamp-3">
            {community.description}
          </p>

          {/* Stats Grid */}
          {showStats && (
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-white rounded-lg p-3 text-center">
                <div className="text-lg font-semibold text-gray-900">
                  {formatNumber(community.memberCount)}
                </div>
                <div className="text-sm text-gray-500">Members</div>
              </div>
              <div className="bg-white rounded-lg p-3 text-center">
                <div className="text-lg font-semibold text-gray-900">
                  {community.totalVotes}
                </div>
                <div className="text-sm text-gray-500">Votes</div>
              </div>
              <div className="bg-white rounded-lg p-3 text-center">
                <div className="text-lg font-semibold text-gray-900">
                  {Math.round(community.stats.engagementScore)}%
                </div>
                <div className="text-sm text-gray-500">Engagement</div>
              </div>
              <div className="bg-white rounded-lg p-3 text-center">
                <div className="text-lg font-semibold text-gray-900">
                  {community.activeVotes}
                </div>
                <div className="text-sm text-gray-500">Active Votes</div>
              </div>
            </div>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${categoryConfig?.color}-100 text-${categoryConfig?.color}-700`}>
              {categoryConfig?.label}
            </span>
            {community.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                {tag}
              </span>
            ))}
          </div>

          {/* Action button */}
          {showJoinButton && (
            <button
              onClick={handleJoinClick}
              className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105"
            >
              Join Community
            </button>
          )}
        </div>
      </motion.div>
    );
  }

  // Default grid variant
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.03, y: -5 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-lg transition-all cursor-pointer overflow-hidden"
      onClick={handleCardClick}
    >
      {/* Card Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start space-x-3">
            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
              {community.logo ? (
                <img
                  src={community.logo}
                  alt={community.name}
                  className="w-full h-full rounded-lg object-cover"
                />
              ) : (
                <Users className="h-6 w-6 text-gray-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 truncate flex items-center">
                {community.name}
                {community.isVerified && (
                  <CheckCircle className="h-4 w-4 text-blue-500 ml-1" />
                )}
              </h3>
              <p className="text-sm text-gray-500">
                {typeConfig?.label}
              </p>
            </div>
          </div>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${getActivityLevelColor(community.activityLevel)}`}>
            {community.activityLevel}
          </div>
        </div>

        <p className="text-gray-600 text-sm line-clamp-3 mb-4">
          {community.description}
        </p>

        {/* Category and Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${categoryConfig?.color}-100 text-${categoryConfig?.color}-700`}>
            {categoryConfig?.label}
          </span>
          {community.tags.slice(0, 2).map((tag, index) => (
            <span key={index} className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
              {tag}
            </span>
          ))}
        </div>

        {/* Stats */}
        {showStats && (
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">
                {formatNumber(community.memberCount)}
              </div>
              <div className="text-xs text-gray-500">Members</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">
                {community.totalVotes}
              </div>
              <div className="text-xs text-gray-500">Votes</div>
            </div>
          </div>
        )}

        {/* Additional Info */}
        <div className="space-y-2 text-xs text-gray-500">
          <div className="flex items-center justify-between">
            <span>Join Requirement:</span>
            <span className={`px-2 py-1 rounded-full font-medium ${getJoinRequirementColor(community.joinRequirement)}`}>
              {getJoinRequirementText(community.joinRequirement)}
            </span>
          </div>
          {community.location && (
            <div className="flex items-center">
              <MapPin className="h-3 w-3 mr-1" />
              {community.location}
            </div>
          )}
          <div className="flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            Last active {new Date(community.stats.lastActivity).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Card Footer */}
      {showJoinButton && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
          <button
            onClick={handleJoinClick}
            className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Join Community
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default CommunityCard; 