// Simple Analytics Page - Task 4.4.4
import React, { useEffect, useState } from 'react';
import { resultsService } from '../../src/services/results';

const AnalyticsPage: React.FC = () => {
  const [communityAnalytics, setCommunityAnalytics] = useState<any>(null);
  const [personalAnalytics, setPersonalAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'community' | 'personal'>('community');

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const communityData = resultsService.generateMockCommunityAnalytics();
      const personalData = resultsService.generateMockPersonalAnalytics();
      setCommunityAnalytics(communityData);
      setPersonalAnalytics(personalData);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderCommunityTab = () => {
    if (!communityAnalytics) return null;

    return (
      <div className="space-y-6">
        {/* Community Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Members</p>
                <p className="text-2xl font-bold text-gray-900">{communityAnalytics.totalMembers}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xl">
                👥
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Members</p>
                <p className="text-2xl font-bold text-gray-900">{communityAnalytics.activeMembers}</p>
              </div>
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center text-white text-xl">
                ⚡
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Participation</p>
                <p className="text-2xl font-bold text-gray-900">{communityAnalytics.averageParticipationRate.toFixed(1)}%</p>
              </div>
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center text-white text-xl">
                📊
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Questions</p>
                <p className="text-2xl font-bold text-gray-900">{communityAnalytics.totalVotingQuestions}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center text-white text-xl">
                🗳️
              </div>
            </div>
          </div>
        </div>

        {/* Active vs Inactive Members Chart */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Member Activity</h3>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-center space-x-8">
              {/* Simple Pie Chart representation */}
              <div className="relative w-48 h-48">
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                  <circle
                    cx="50" cy="50" r="40"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="20"
                    strokeDasharray="157 94"
                    strokeDashoffset="0"
                  />
                  <circle
                    cx="50" cy="50" r="40"
                    fill="none"
                    stroke="#EF4444"
                    strokeWidth="20"
                    strokeDasharray="94 157"
                    strokeDashoffset="-157"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{communityAnalytics.totalMembers}</div>
                    <div className="text-sm text-gray-600">Total</div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-sm text-gray-700">Active Members</span>
                  <span className="font-semibold text-gray-900">{communityAnalytics.activeMembers}</span>
                  <span className="text-sm text-gray-500">
                    ({((communityAnalytics.activeMembers / communityAnalytics.totalMembers) * 100).toFixed(1)}%)
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span className="text-sm text-gray-700">Inactive Members</span>
                  <span className="font-semibold text-gray-900">{communityAnalytics.totalMembers - communityAnalytics.activeMembers}</span>
                  <span className="text-sm text-gray-500">
                    ({(((communityAnalytics.totalMembers - communityAnalytics.activeMembers) / communityAnalytics.totalMembers) * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Voters */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Most Active Voters</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {communityAnalytics.mostActiveVoters.slice(0, 5).map((voter: any, index: number) => (
                <div key={voter.memberId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{voter.memberName}</p>
                      <p className="text-xs text-gray-500">
                        {voter.memberAddress.slice(0, 6)}...{voter.memberAddress.slice(-4)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{voter.totalVotes} votes</p>
                    <p className="text-xs text-gray-500">{voter.participationRate.toFixed(1)}% participation</p>
                    <p className="text-xs text-blue-600">🔥 {voter.votingStreak} streak</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Engagement Metrics */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Engagement Metrics</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{communityAnalytics.engagementMetrics.dailyActiveUsers}</div>
                <div className="text-sm text-gray-600">Daily Active</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{communityAnalytics.engagementMetrics.weeklyActiveUsers}</div>
                <div className="text-sm text-gray-600">Weekly Active</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{(communityAnalytics.engagementMetrics.retentionRate * 100).toFixed(1)}%</div>
                <div className="text-sm text-gray-600">Retention Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{Math.round(communityAnalytics.engagementMetrics.averageSessionDuration / 60)}m</div>
                <div className="text-sm text-gray-600">Avg Session</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPersonalTab = () => {
    if (!personalAnalytics) return null;

    return (
      <div className="space-y-6">
        {/* Personal Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Votes</p>
                <p className="text-2xl font-bold text-gray-900">{personalAnalytics.totalVotes}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xl">
                🗳️
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Participation Rate</p>
                <p className="text-2xl font-bold text-gray-900">{personalAnalytics.participationRate.toFixed(1)}%</p>
              </div>
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center text-white text-xl">
                📈
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Voting Streak</p>
                <p className="text-2xl font-bold text-gray-900">{personalAnalytics.votingStreak}</p>
              </div>
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center text-white text-xl">
                ��
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ranking</p>
                <p className="text-2xl font-bold text-gray-900">#{personalAnalytics.rankingPosition}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center text-white text-xl">
                👑
              </div>
            </div>
          </div>
        </div>

        {/* Community Contributions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Community Contributions</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {personalAnalytics.communityContributions.map((contribution: any, index: number) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-20 text-sm font-medium text-gray-700 truncate" title={contribution.communityName}>
                      {contribution.communityName}
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                      <div
                        className="h-6 rounded-full transition-all duration-500 ease-out flex items-center justify-end pr-2"
                        style={{
                          width: `${(contribution.votesInCommunity / Math.max(...personalAnalytics.communityContributions.map((c: any) => c.votesInCommunity))) * 100}%`,
                          backgroundColor: ['#3B82F6', '#10B981', '#F59E0B'][index % 3]
                        }}
                      >
                        <span className="text-xs text-white font-medium">
                          {contribution.votesInCommunity}
                        </span>
                      </div>
                    </div>
                    <div className="w-16 text-sm text-gray-600 text-right">
                      {contribution.participationRate.toFixed(1)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Achievements</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {personalAnalytics.achievements.map((achievement: any) => (
                  <div key={achievement.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{achievement.title}</h4>
                      <p className="text-sm text-gray-600">{achievement.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-blue-600">{achievement.points} pts</div>
                      <div className="text-xs text-gray-500 capitalize">{achievement.category}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Voting History Timeline */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Voting History</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {personalAnalytics.votingHistory.slice(0, 5).map((vote: any, index: number) => (
                <div key={index} className="flex items-start space-x-4 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{vote.questionTitle}</h4>
                    <p className="text-sm text-gray-600">Community: {vote.communityName}</p>
                    <p className="text-sm text-gray-600">Your choice: <span className="font-medium">{vote.votedOption}</span></p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="text-xs text-gray-500">
                        {new Date(vote.voteDate).toLocaleDateString()}
                      </span>
                      {vote.wasWinningVote && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          ✓ Winning choice
                        </span>
                      )}
                      <span className="text-xs text-gray-500">
                        Rank #{vote.participationRank}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600 mt-2">
                Insights and metrics for community engagement and personal performance
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('community')}
              className={`flex-1 py-4 px-6 text-sm font-medium text-center ${
                activeTab === 'community'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              📊 Community Analytics
            </button>
            <button
              onClick={() => setActiveTab('personal')}
              className={`flex-1 py-4 px-6 text-sm font-medium text-center ${
                activeTab === 'personal'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              👤 Personal Analytics
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading analytics...</p>
          </div>
        ) : (
          <div>
            {activeTab === 'community' ? renderCommunityTab() : renderPersonalTab()}
          </div>
        )}

        {/* Demo Notice */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-blue-400 text-xl mr-3">📈</div>
            <div>
              <h3 className="text-sm font-medium text-blue-800">Analytics & Data Visualization</h3>
              <p className="text-blue-700 text-sm mt-1">
                This dashboard provides comprehensive analytics for community engagement, 
                voting patterns, personal performance metrics, and interactive data visualization 
                to help understand participation trends and improve governance outcomes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
