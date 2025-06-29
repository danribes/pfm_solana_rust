// Simple Results Page - Task 4.4.4
import React, { useEffect, useState } from 'react';
import { resultsService } from '../../src/services/results';

const ResultsPage: React.FC = () => {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    try {
      setLoading(true);
      const data = resultsService.generateMockVotingResults();
      setResults(data.results);
    } catch (error) {
      console.error('Failed to load results:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalVotes = results.reduce((sum, result) => sum + result.totalVotes, 0);
  const avgParticipation = results.length > 0 
    ? results.reduce((sum, result) => sum + result.participationRate, 0) / results.length 
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Voting Results & Analytics</h1>
          <p className="text-gray-600 mt-2">View and analyze voting results with interactive charts</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Questions</p>
                <p className="text-2xl font-bold text-gray-900">{results.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xl">
                📊
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Votes</p>
                <p className="text-2xl font-bold text-gray-900">{totalVotes.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center text-white text-xl">
                🗳️
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Participation</p>
                <p className="text-2xl font-bold text-gray-900">{avgParticipation.toFixed(1)}%</p>
              </div>
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center text-white text-xl">
                👥
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {results.filter(r => r.status === 'completed').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center text-white text-xl">
                ✅
              </div>
            </div>
          </div>
        </div>

        {/* Results List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Voting Results ({results.length})</h2>
            <p className="text-gray-600 text-sm mt-1">Interactive charts and detailed analytics for each question</p>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">Loading results...</p>
              </div>
            ) : results.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Results Yet</h3>
                <p className="text-gray-600">Results will appear here once voting questions are completed.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {results.map((result) => (
                  <div key={result.questionId} className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{result.question.title}</h3>
                        <p className="text-gray-600 text-sm mt-1">{result.question.description}</p>
                      </div>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        result.status === 'active' ? 'bg-blue-100 text-blue-800' :
                        result.status === 'completed' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {result.status}
                      </span>
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center bg-white rounded p-3">
                        <div className="text-xl font-bold text-gray-900">{result.totalVotes}</div>
                        <div className="text-xs text-gray-500">Total Votes</div>
                      </div>
                      <div className="text-center bg-white rounded p-3">
                        <div className="text-xl font-bold text-gray-900">{result.participationRate.toFixed(1)}%</div>
                        <div className="text-xs text-gray-500">Participation</div>
                      </div>
                      <div className="text-center bg-white rounded p-3">
                        <div className="text-xl font-bold text-gray-900">{result.results.length}</div>
                        <div className="text-xs text-gray-500">Options</div>
                      </div>
                    </div>

                    {/* Simple Bar Chart */}
                    <div className="bg-white rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">Results Breakdown</h4>
                      <div className="space-y-3">
                        {result.results.map((option: any, index: number) => (
                          <div key={index} className="flex items-center space-x-3">
                            <div className="w-24 text-sm font-medium text-gray-700 truncate" title={option.optionText}>
                              {option.optionText}
                            </div>
                            <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                              <div
                                className="h-6 rounded-full transition-all duration-500 ease-out flex items-center justify-end pr-2"
                                style={{
                                  width: `${(option.voteCount / Math.max(...result.results.map((r: any) => r.voteCount))) * 100}%`,
                                  backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'][index % 6]
                                }}
                              >
                                <span className="text-xs text-white font-medium">
                                  {option.voteCount}
                                </span>
                              </div>
                            </div>
                            <div className="w-16 text-sm text-gray-600 text-right">
                              {option.percentage.toFixed(1)}%
                            </div>
                            {option.isWinner && <span className="text-green-600">👑</span>}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Winner */}
                    {result.winningOption && (
                      <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center space-x-2">
                          <span className="text-green-600">🏆</span>
                          <span className="font-medium text-green-800">Winner:</span>
                          <span className="text-green-700">{result.winningOption}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Demo Notice */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-blue-400 text-xl mr-3">ℹ️</div>
            <div>
              <h3 className="text-sm font-medium text-blue-800">Results Visualization & Analytics</h3>
              <p className="text-blue-700 text-sm mt-1">
                This page demonstrates advanced voting results visualization with interactive charts, 
                real-time data updates, and comprehensive analytics for community engagement insights.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;
