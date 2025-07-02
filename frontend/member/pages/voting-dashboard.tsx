import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { WalletConnectionProvider } from '../src/components/WalletConnection/WalletConnectionProvider';
import { AppLayout } from '../src/components/Layout';
import PollDashboard from '../components/Voting/PollDashboard';
import VotingProfileManager from '../components/Profile/VotingProfileManager';

interface UserStats {
  totalVotes: number;
  pollsParticipated: number;
  votingStreak: number;
  reputation: number;
  level: number;
  achievements: number;
}

interface RecentActivity {
  id: string;
  type: 'vote' | 'poll_created' | 'achievement' | 'level_up';
  title: string;
  description: string;
  timestamp: string;
  icon: string;
}

const VotingDashboard: React.FC = () => {
  const [activeView, setActiveView] = useState<'overview' | 'polls' | 'profile' | 'achievements'>('overview');
  const [isClient, setIsClient] = useState(false);
  const [userStats, setUserStats] = useState<UserStats>({
    totalVotes: 47,
    pollsParticipated: 23,
    votingStreak: 12,
    reputation: 850,
    level: 5,
    achievements: 8
  });
  
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([
    {
      id: '1',
      type: 'vote',
      title: 'Voted on Governance Token Proposal',
      description: 'You participated in the community governance vote',
      timestamp: '2024-12-18T10:30:00Z',
      icon: '🗳️'
    },
    {
      id: '2',
      type: 'achievement',
      title: 'Consistency Badge Earned',
      description: 'Voted in 10 consecutive polls',
      timestamp: '2024-12-17T15:20:00Z',
      icon: '🏆'
    },
    {
      id: '3',
      type: 'vote',
      title: 'Voted on Feature Prioritization',
      description: 'Helped decide the next platform features',
      timestamp: '2024-12-16T09:45:00Z',
      icon: '✅'
    }
  ]);

  const [upcomingPolls, setUpcomingPolls] = useState([
    {
      id: '1',
      title: 'Q1 2025 Budget Allocation',
      category: 'Finance',
      endsAt: '2024-12-25T12:00:00Z',
      participation: 45
    },
    {
      id: '2',
      title: 'Community Event Planning',
      category: 'Community',
      endsAt: '2024-12-23T18:00:00Z',
      participation: 67
    }
  ]);

  // Handle client-side hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  const getTimeUntilPollEnds = (endDate: string) => {
    if (!isClient) return 'Loading...';
    
    const now = new Date();
    const end = new Date(endDate);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
            <p className="text-blue-100 mb-4">
              You're an active member of our voting community. Keep up the great participation!
            </p>
            <div className="flex items-center space-x-4 text-sm">
              <span className="bg-white/20 px-3 py-1 rounded-full">Level {userStats.level}</span>
              <span className="bg-white/20 px-3 py-1 rounded-full">{userStats.votingStreak} day streak</span>
              <span className="bg-white/20 px-3 py-1 rounded-full">{userStats.reputation} reputation</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold">{userStats.totalVotes}</div>
            <div className="text-blue-100">Total Votes Cast</div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">{userStats.pollsParticipated}</div>
          <div className="text-sm text-gray-600">Polls Participated</div>
          <div className="text-xs text-green-600 mt-1">+3 this week</div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">{userStats.votingStreak}</div>
          <div className="text-sm text-gray-600">Day Voting Streak</div>
          <div className="text-xs text-green-600 mt-1">Personal best!</div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">{userStats.achievements}</div>
          <div className="text-sm text-gray-600">Achievements</div>
          <div className="text-xs text-purple-600 mt-1">2 unlocked recently</div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-3xl font-bold text-orange-600 mb-2">78%</div>
          <div className="text-sm text-gray-600">Participation Rate</div>
          <div className="text-xs text-orange-600 mt-1">Above average</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Urgent Polls */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">🚨 Urgent Votes Needed</h2>
            <button 
              onClick={() => setActiveView('polls')}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View All Polls →
            </button>
          </div>
          
          <div className="space-y-4">
            {upcomingPolls.map((poll) => (
              <div key={poll.id} className="border border-red-200 rounded-lg p-4 bg-red-50">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{poll.title}</h3>
                  <span className="text-sm font-medium text-red-600">
                    {getTimeUntilPollEnds(poll.endsAt)} left
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                    {poll.category}
                  </span>
                  <div className="flex items-center space-x-2">
                    <div className="text-sm text-gray-600">{poll.participation}% participated</div>
                    <button className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700">
                      Vote Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
          
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-lg">{activity.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.description}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {isClient ? new Date(activity.timestamp).toLocaleDateString() : 'Loading...'}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <button className="w-full mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium">
            View All Activity
          </button>
        </div>
      </div>

      {/* Achievement Progress */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Achievement Progress</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-900">Voting Veteran</h3>
              <span className="text-2xl">🎖️</span>
            </div>
            <p className="text-sm text-gray-600 mb-3">Cast 100 votes</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '47%' }}></div>
            </div>
            <p className="text-xs text-gray-500">47/100 votes</p>
          </div>
          
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-900">Consistency King</h3>
              <span className="text-2xl">🔥</span>
            </div>
            <p className="text-sm text-gray-600 mb-3">30-day voting streak</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div className="bg-orange-600 h-2 rounded-full" style={{ width: '40%' }}></div>
            </div>
            <p className="text-xs text-gray-500">12/30 days</p>
          </div>
          
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-900">Community Leader</h3>
              <span className="text-2xl">👑</span>
            </div>
            <p className="text-sm text-gray-600 mb-3">Create 10 proposals</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div className="bg-purple-600 h-2 rounded-full" style={{ width: '20%' }}></div>
            </div>
            <p className="text-xs text-gray-500">2/10 proposals</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => setActiveView('polls')}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <div className="font-medium text-gray-900">View All Polls</div>
                <div className="text-sm text-gray-500">Browse active and closed polls</div>
              </div>
            </div>
          </button>
          
          <button 
            onClick={() => setActiveView('profile')}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <div className="font-medium text-gray-900">Manage Profile</div>
                <div className="text-sm text-gray-500">Update your information and preferences</div>
              </div>
            </div>
          </button>
          
          <button 
            onClick={() => setActiveView('achievements')}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <div className="font-medium text-gray-900">View Achievements</div>
                <div className="text-sm text-gray-500">See your badges and progress</div>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  const renderAchievements = () => (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Your Achievements</h1>
        <p className="text-gray-600 mb-6">
          Track your progress and unlock new badges by participating in the community
        </p>

        {/* Achievement Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{userStats.achievements}</div>
            <div className="text-sm text-gray-600">Achievements Unlocked</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{userStats.level}</div>
            <div className="text-sm text-gray-600">Current Level</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">{userStats.reputation}</div>
            <div className="text-sm text-gray-600">Reputation Points</div>
          </div>
        </div>

        {/* Unlocked Achievements */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Unlocked Achievements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: 'First Vote', icon: '🗳️', description: 'Cast your first vote', rarity: 'common' },
              { name: 'Active Participant', icon: '⚡', description: 'Voted in 10 polls', rarity: 'uncommon' },
              { name: 'Consistency Badge', icon: '🔥', description: '7-day voting streak', rarity: 'rare' },
              { name: 'Community Voice', icon: '📢', description: 'Created first proposal', rarity: 'uncommon' }
            ].map((achievement, index) => (
              <div key={index} className="border rounded-lg p-4 text-center bg-green-50 border-green-200">
                <div className="text-4xl mb-2">{achievement.icon}</div>
                <h3 className="font-medium text-gray-900 mb-1">{achievement.name}</h3>
                <p className="text-xs text-gray-600 mb-2">{achievement.description}</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  achievement.rarity === 'rare' ? 'bg-purple-100 text-purple-800' :
                  achievement.rarity === 'uncommon' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {achievement.rarity}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Progress Towards Next Achievements */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">In Progress</h2>
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🎖️</span>
                  <div>
                    <h3 className="font-medium text-gray-900">Voting Veteran</h3>
                    <p className="text-sm text-gray-600">Cast 100 votes</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-600">47/100</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '47%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Mock user data for VotingProfileManager
  const mockUser = {
    id: '1',
    profile: {
      personalInfo: {
        displayName: 'John Doe',
        firstName: 'John',
        lastName: 'Doe',
        bio: 'Active community member interested in governance and technology.',
        avatar: {
          id: '1',
          url: '/avatars/john.jpg',
          thumbnailUrl: '/avatars/john-thumb.jpg',
          fileSize: 1024,
          mimeType: 'image/jpeg',
          uploadedAt: '2024-01-01T00:00:00Z',
          isDefault: false,
          source: 'upload' as const
        },
        location: {
          country: 'US',
          state: 'CA',
          city: 'San Francisco',
          isPublic: true,
          precision: 'city' as const
        },
        dateOfBirth: '1990-01-01',
        timezone: 'UTC-8',
        languages: ['English', 'Spanish'],
        pronouns: 'he/him',
        website: 'https://johndoe.com',
        tagline: 'Building the future of decentralized communities'
      }
    },
    votingStats: {
      totalPolls: 15,
      totalVotes: 47,
      votingStreak: 12,
      longestStreak: 25,
      averageParticipation: 78.5,
      pollsCreated: 2,
      pollsWon: 28,
      accuracyScore: 73.2,
      engagementScore: 8.4,
      lastVotedAt: '2024-12-17T14:30:00Z',
      memberSince: '2024-01-15T00:00:00Z'
    },
    eligibilityStatus: {
      isEligible: true,
      verificationLevel: 'enhanced' as const,
      trustScore: 85,
      membershipTier: 'premium',
      membershipDuration: 337,
      restrictions: [],
      lastUpdated: '2024-12-18T00:00:00Z'
    },
    reputation: {
      overall: 850,
      breakdown: {
        participation: 92,
        consistency: 88,
        thoughtfulness: 76,
        leadership: 65
      },
      badges: [],
      level: 5,
      nextLevelThreshold: 1000,
      trend: 'rising' as const
    },
    achievements: [],
    preferences: {
      defaultVotePrivacy: 'public' as const,
      emailNotifications: true,
      pushNotifications: true,
      reminderFrequency: 'daily' as const,
      showResultsImmediately: true,
      preferredPollTypes: ['single_choice', 'multiple_choice'],
      blockedCategories: [],
      language: 'en',
      timezone: 'UTC-8'
    },
    privacy: {
      defaultVoteVisibility: 'public' as const,
      showVotingHistory: true,
      showStatistics: true,
      allowVoteTracking: true,
      shareDataForResearch: false,
      profileVisibility: 'public' as const
    },
    notifications: {
      pollStarted: true,
      pollReminder: true,
      pollEnding: true,
      resultsAvailable: true,
      newPollInCategory: true,
      achievementUnlocked: true,
      reputationChanged: false,
      systemUpdates: true,
      preferredDelivery: ['email', 'push'],
      quietHours: {
        enabled: true,
        start: '22:00',
        end: '08:00'
      }
    }
  };

  const handleSaveProfile = async (updates: any) => {
    console.log('Saving profile updates:', updates);
    alert('Profile updated successfully!');
  };

  return (
    <>
      <Head>
        <title>Voting Dashboard - PFM Member Portal</title>
        <meta name="description" content="Participate in community polls and governance decisions" />
      </Head>

      <WalletConnectionProvider
        network="devnet"
        autoConnect={true}
        onConnect={(publicKey) => {
          console.log('Member wallet connected for voting:', publicKey);
        }}
        onDisconnect={() => {
          console.log('Member wallet disconnected');
        }}
        onError={(error) => {
          console.error('Member wallet error:', error);
        }}
      >
        <AppLayout 
          title="Voting Community"
          description="Participate in community polls and governance decisions"
          showSidebar={false}
        >
          <div className="min-h-screen bg-gray-50">
            {/* Navigation Header */}
            <div className="bg-white shadow-sm border-b">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <nav className="flex space-x-8 py-4">
                  {[
                    { id: 'overview', label: 'Overview', icon: <span className="text-base">🏠</span> },
                    { id: 'polls', label: 'Polls', icon: <span className="text-base">🗳️</span> },
                    { id: 'profile', label: 'Profile', icon: <span className="text-base">👤</span> },
                    { id: 'achievements', label: 'Achievements', icon: <span className="text-base">🏆</span> }
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveView(item.id as any)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        activeView === item.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {activeView === 'overview' && renderOverview()}
              {activeView === 'polls' && <PollDashboard />}
              {activeView === 'profile' && (
                <VotingProfileManager 
                  user={mockUser as any}
                  onSave={handleSaveProfile}
                />
              )}
              {activeView === 'achievements' && renderAchievements()}
            </div>
          </div>
        </AppLayout>
      </WalletConnectionProvider>
    </>
  );
};

export default VotingDashboard; 