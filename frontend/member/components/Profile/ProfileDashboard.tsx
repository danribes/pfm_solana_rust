'use client';

import React, { useState } from 'react';
import { 
  UserIcon, 
  PencilIcon, 
  CogIcon, 
  ChartBarIcon,
  UserGroupIcon,
  WalletIcon,
  CalendarIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';
import { useProfile } from '../../hooks/useProfile';

interface ProfileDashboardProps {
  onEditProfile?: () => void;
  onSettings?: () => void;
}

const ProfileDashboard: React.FC<ProfileDashboardProps> = ({
  onEditProfile,
  onSettings
}) => {
  const { profile, loading, error } = useProfile();
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'communities'>('overview');

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="bg-gray-200 h-48 rounded-lg"></div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-200 h-20 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="text-center py-12">
        <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Profile not found</h3>
        <p className="mt-1 text-sm text-gray-500">{error || 'Unable to load profile'}</p>
      </div>
    );
  }

  const stats = [
    {
      name: 'Total Votes',
      value: profile.activityStats.totalVotes,
      icon: ChartBarIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      name: 'Communities',
      value: profile.activityStats.communitiesJoined,
      icon: UserGroupIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      name: 'Proposals Created',
      value: profile.activityStats.proposalsCreated,
      icon: TrophyIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      name: 'Reputation',
      value: profile.activityStats.reputationScore,
      icon: TrophyIcon,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600"></div>
        <div className="relative px-6 pb-6">
          <div className="flex items-end space-x-5 -mt-12">
            <div className="relative">
              <img
                className="h-24 w-24 rounded-full ring-4 ring-white bg-white object-cover"
                src={profile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.displayName || profile.username || 'User')}&size=96&background=f3f4f6&color=374151`}
                alt={profile.displayName || profile.username}
              />
              {profile.isVerified && (
                <div className="absolute bottom-1 right-1 bg-blue-600 rounded-full p-1">
                  <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            <div className="pt-1.5 pb-1 flex-1">
              <h1 className="text-2xl font-bold text-gray-900">
                {profile.displayName || profile.username || 'Anonymous User'}
              </h1>
              {profile.username && profile.displayName && (
                <p className="text-sm text-gray-600">@{profile.username}</p>
              )}
              {profile.bio && (
                <p className="mt-2 text-gray-700">{profile.bio}</p>
              )}
              <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  Joined {new Date(profile.joinedAt).toLocaleDateString()}
                </div>
                <div className="flex items-center">
                  <WalletIcon className="h-4 w-4 mr-1" />
                  {profile.walletAddress.slice(0, 8)}...{profile.walletAddress.slice(-6)}
                </div>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="mt-4 flex space-x-3">
            <button
              onClick={onEditProfile}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PencilIcon className="-ml-1 mr-2 h-4 w-4" />
              Edit Profile
            </button>
            <button
              onClick={onSettings}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <CogIcon className="-ml-1 mr-2 h-4 w-4" />
              Settings
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {stat.name}
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tab Navigation */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'overview', name: 'Overview', icon: UserIcon },
              { id: 'activity', name: 'Activity', icon: ChartBarIcon },
              { id: 'communities', name: 'Communities', icon: UserGroupIcon }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`
                    flex items-center py-4 px-1 border-b-2 font-medium text-sm
                    ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Quick Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Information</h3>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Email</dt>
                      <dd className="text-sm text-gray-900">{profile.email || 'Not provided'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Location</dt>
                      <dd className="text-sm text-gray-900">{profile.location || 'Not provided'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Website</dt>
                      <dd className="text-sm text-gray-900">
                        {profile.website ? (
                          <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-500">
                            {profile.website}
                          </a>
                        ) : 'Not provided'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Last Active</dt>
                      <dd className="text-sm text-gray-900">
                        {new Date(profile.lastActiveAt).toLocaleDateString()}
                      </dd>
                    </div>
                  </dl>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Verification Status</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <div className={`h-2 w-2 rounded-full mr-3 ${profile.isVerified ? 'bg-green-400' : 'bg-gray-300'}`}></div>
                      <span className="text-sm text-gray-900">Profile Verified</span>
                    </div>
                    <div className="flex items-center">
                      <div className="h-2 w-2 bg-green-400 rounded-full mr-3"></div>
                      <span className="text-sm text-gray-900">Wallet Connected</span>
                    </div>
                    <div className="flex items-center">
                      <div className={`h-2 w-2 rounded-full mr-3 ${profile.email ? 'bg-green-400' : 'bg-gray-300'}`}></div>
                      <span className="text-sm text-gray-900">Email Verified</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              {profile.socialLinks && profile.socialLinks.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Social Links</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {profile.socialLinks.map((link, index) => (
                      <a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-sm font-medium text-gray-600">
                            {link.platform.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 capitalize">
                            {link.platform}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {link.displayName || link.url}
                          </p>
                        </div>
                        {link.verified && (
                          <div className="flex-shrink-0">
                            <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-6">
              <div className="text-center py-12">
                <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Activity Dashboard</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Detailed activity tracking coming soon
                </p>
              </div>
            </div>
          )}

          {activeTab === 'communities' && (
            <div className="space-y-6">
              <div className="grid gap-4">
                {profile.communityMemberships.map((membership) => (
                  <div
                    key={membership.communityId}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                        <UserGroupIcon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          {membership.communityName}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {membership.role} • Joined {new Date(membership.joinedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`
                        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${membership.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                      `}>
                        {membership.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileDashboard;
