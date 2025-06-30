// Campaign Analytics Component
import React, { useState, useEffect } from 'react';
import { Campaign } from '../../types/campaign';

interface CampaignAnalyticsProps {
  campaign: Campaign;
}

interface AnalyticsData {
  participationOverTime: { date: string; participants: number; votes: number }[];
  demographicBreakdown: { category: string; count: number; percentage: number }[];
  questionAnalytics: { 
    questionId: string; 
    title: string; 
    responses: number; 
    skipRate: number;
    optionBreakdown: { option: string; votes: number; percentage: number }[];
  }[];
}

export const CampaignAnalytics: React.FC<CampaignAnalyticsProps> = ({ campaign }) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | 'all'>('7d');

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        // Simulate API call - replace with actual API integration
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock analytics data
        const mockData: AnalyticsData = {
          participationOverTime: [
            { date: '2024-01-01', participants: 12, votes: 15 },
            { date: '2024-01-02', participants: 18, votes: 22 },
            { date: '2024-01-03', participants: 24, votes: 31 },
            { date: '2024-01-04', participants: 31, votes: 38 },
            { date: '2024-01-05', participants: 37, votes: 45 },
          ],
          demographicBreakdown: [
            { category: 'Age 18-25', count: 25, percentage: 35 },
            { category: 'Age 26-35', count: 30, percentage: 42 },
            { category: 'Age 36-45', count: 12, percentage: 17 },
            { category: 'Age 46+', count: 4, percentage: 6 },
          ],
          questionAnalytics: campaign.questions.map((q, index) => ({
            questionId: q.id,
            title: q.title,
            responses: 45 - index * 5,
            skipRate: index * 2,
            optionBreakdown: q.options.map((option, optIndex) => ({
              option: option.text,
              votes: Math.floor(Math.random() * 20) + 5,
              percentage: Math.floor(Math.random() * 30) + 10,
            }))
          }))
        };
        
        setAnalytics(mockData);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [campaign.id, timeRange]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Failed to load analytics data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{campaign.title}</h2>
          <p className="text-gray-600">Campaign Analytics</p>
        </div>
        
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as any)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="all">All Time</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-3xl font-bold text-blue-600">{campaign.totalParticipants}</div>
          <div className="text-sm text-gray-500">Total Participants</div>
          <div className="text-xs text-green-600 mt-1">↑ 12% from last week</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-3xl font-bold text-green-600">{campaign.totalVotes}</div>
          <div className="text-sm text-gray-500">Total Votes</div>
          <div className="text-xs text-green-600 mt-1">↑ 8% from last week</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-3xl font-bold text-purple-600">{Math.round(campaign.participationRate)}%</div>
          <div className="text-sm text-gray-500">Participation Rate</div>
          <div className="text-xs text-red-600 mt-1">↓ 3% from last week</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-3xl font-bold text-orange-600">
            {Math.round((campaign.totalVotes / campaign.totalParticipants) * 100) / 100}
          </div>
          <div className="text-sm text-gray-500">Avg. Votes per Participant</div>
          <div className="text-xs text-green-600 mt-1">↑ 5% from last week</div>
        </div>
      </div>

      {/* Participation Over Time Chart */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Participation Over Time</h3>
        <div className="h-64 flex items-end justify-between space-x-2">
          {analytics.participationOverTime.map((data, index) => (
            <div key={index} className="flex flex-col items-center flex-1">
              <div 
                className="bg-blue-500 w-full rounded-t-sm"
                style={{ 
                  height: `${(data.participants / Math.max(...analytics.participationOverTime.map(d => d.participants))) * 200}px`,
                  minHeight: '4px'
                }}
              ></div>
              <div className="text-xs text-gray-500 mt-2 transform -rotate-45">
                {new Date(data.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Demographics and Question Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Demographics */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Participant Demographics</h3>
          <div className="space-y-3">
            {analytics.demographicBreakdown.map((demo, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{demo.category}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${demo.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-500 w-12 text-right">{demo.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Question Performance */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Question Performance</h3>
          <div className="space-y-4">
            {analytics.questionAnalytics.map((qa, index) => (
              <div key={index} className="border-b border-gray-100 pb-3 last:border-b-0">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-medium text-gray-700">{qa.title}</span>
                  <span className="text-xs text-gray-500">{qa.responses} responses</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Skip rate: {qa.skipRate}%</span>
                  <span>Response rate: {100 - qa.skipRate}%</span>
                </div>
                <div className="mt-2 space-y-1">
                  {qa.optionBreakdown.map((option, optIndex) => (
                    <div key={optIndex} className="flex items-center justify-between text-xs">
                      <span className="text-gray-600 truncate">{option.option}</span>
                      <span className="text-gray-500">{option.votes} votes ({option.percentage}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Export Data</h3>
        <div className="flex gap-4">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Export CSV
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            Export PDF Report
          </button>
          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
            Export JSON
          </button>
        </div>
      </div>
    </div>
  );
};
