import React, { useState, useMemo } from 'react';
import RealTimeChartWrapper from '../src/components/Charts/RealTimeChartWrapper';
import { ChartData } from '../src/types/results';

const RealTimeResultsPage: React.FC = () => {
  const [selectedQuestion, setSelectedQuestion] = useState<string>('all');

  // Handle data updates
  const handleDataUpdate = (type: string) => (data: ChartData) => {
    console.log(`Real-time update for ${type}:`, data);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Real-Time Results
                </h1>
                <p className="mt-2 text-gray-600">
                  Live voting data and community analytics
                </p>
              </div>
              
              {/* Live indicator */}
              <div className="flex items-center space-x-2 bg-red-50 px-3 py-2 rounded-full">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-red-700 text-sm font-medium">LIVE</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Section */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">View Options</h3>
            <div className="flex flex-wrap gap-3">
              {[
                { value: 'all', label: 'All Questions' },
                { value: 'current', label: 'Current Vote' },
                { value: 'recent', label: 'Recent Results' },
                { value: 'trending', label: 'Trending Topics' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedQuestion(option.value)}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    selectedQuestion === option.value
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Real-Time Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {/* Live Voting Results */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Live Voting Results</h3>
                <p className="text-sm text-gray-600">Updates every 2 seconds</p>
              </div>
              <div className="p-6">
                <RealTimeChartWrapper
                  endpoint="/api/demo/voting-results"
                  type="bar"
                  height={300}
                  refreshInterval={2000}
                  onDataUpdate={handleDataUpdate('voting')}
                  interactive={true}
                />
              </div>
            </div>
          </div>

          {/* Participation Distribution */}
          <div>
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Vote Distribution</h3>
                <p className="text-sm text-gray-600">Real-time breakdown</p>
              </div>
              <div className="p-6">
                <RealTimeChartWrapper
                  endpoint="/api/demo/vote-distribution"
                  type="pie"
                  height={300}
                  refreshInterval={3000}
                  onDataUpdate={handleDataUpdate('distribution')}
                />
              </div>
            </div>
          </div>

          {/* Participation Trends */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Participation Trends</h3>
                <p className="text-sm text-gray-600">Member activity over time</p>
              </div>
              <div className="p-6">
                <RealTimeChartWrapper
                  endpoint="/api/demo/participation-trends"
                  type="area"
                  height={250}
                  refreshInterval={5000}
                  onDataUpdate={handleDataUpdate('participation')}
                />
              </div>
            </div>
          </div>

          {/* Community Activity */}
          <div>
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Live Activity</h3>
                <p className="text-sm text-gray-600">Actions per minute</p>
              </div>
              <div className="p-6">
                <RealTimeChartWrapper
                  endpoint="/api/demo/community-activity"
                  type="line"
                  height={200}
                  refreshInterval={1000}
                  onDataUpdate={handleDataUpdate('activity')}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Panel */}
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Live Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">1,247</div>
                <div className="text-sm text-gray-600">Total Votes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">189</div>
                <div className="text-sm text-gray-600">Active Voters</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">12</div>
                <div className="text-sm text-gray-600">Votes/Minute</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">3</div>
                <div className="text-sm text-gray-600">Active Questions</div>
              </div>
            </div>
          </div>
        </div>

        {/* Real-Time Feed */}
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Real-Time Activity Feed</h3>
            </div>
            <div className="p-6">
              <div className="space-y-3 max-h-48 overflow-y-auto">
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600">User voted on "Budget Allocation 2025"</span>
                  <span className="text-gray-400">2s ago</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-600">New voting question published</span>
                  <span className="text-gray-400">15s ago</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600">User voted on "Community Guidelines Update"</span>
                  <span className="text-gray-400">23s ago</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-gray-600">Question deadline approaching</span>
                  <span className="text-gray-400">45s ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealTimeResultsPage;
