// Results API Service
// Task 4.4.4 - Comprehensive service for results visualization and analytics

import {
  VotingResult,
  VotingResultsResponse,
  CommunityAnalytics,
  PersonalAnalytics,
  ResultsFilter,
  AnalyticsQuery,
  ResultsError,
  ChartData,
  TimeSeriesData
} from '../types/results';

// ============================================================================
// RESULTS API SERVICE
// ============================================================================

export class ResultsService {
  
  // ========================================================================
  // MOCK DATA GENERATION (FOR DEMO PURPOSES)
  // ========================================================================

  /**
   * Generate mock voting results for demonstration
   */
  generateMockVotingResults(): VotingResultsResponse {
    const mockResults: VotingResult[] = [
      {
        questionId: '1',
        question: {
          id: '1',
          title: 'Should we implement staking rewards?',
          description: 'Proposal to add staking rewards for community token holders',
          options: [
            { id: '1a', text: 'Yes, implement staking rewards' },
            { id: '1b', text: 'No, keep current system' },
            { id: '1c', text: 'Need more information' }
          ],
          type: 'single_choice',
          status: 'completed',
          createdAt: '2024-12-01T10:00:00Z',
          deadline: '2024-12-07T10:00:00Z',
          communityId: 'community-1',
          createdBy: 'user-1'
        },
        totalVotes: 156,
        results: [
          { optionId: '1a', optionText: 'Yes, implement staking rewards', voteCount: 89, percentage: 57.1, isWinner: true },
          { optionId: '1b', optionText: 'No, keep current system', voteCount: 45, percentage: 28.8 },
          { optionId: '1c', optionText: 'Need more information', voteCount: 22, percentage: 14.1 }
        ],
        status: 'completed',
        startDate: '2024-12-01T10:00:00Z',
        endDate: '2024-12-07T10:00:00Z',
        lastUpdated: '2024-12-07T10:00:00Z',
        participationRate: 78.0,
        winningOption: 'Yes, implement staking rewards',
        chartData: {
          labels: ['Yes, implement staking rewards', 'No, keep current system', 'Need more information'],
          datasets: [{
            label: 'Votes',
            data: [89, 45, 22],
            backgroundColor: ['#10B981', '#EF4444', '#F59E0B']
          }]
        }
      },
      {
        questionId: '2',
        question: {
          id: '2',
          title: 'New fee structure proposal',
          description: 'Proposal to reduce platform fees by 50%',
          options: [
            { id: '2a', text: 'Approve fee reduction' },
            { id: '2b', text: 'Reject proposal' },
            { id: '2c', text: 'Propose alternative' }
          ],
          type: 'single_choice',
          status: 'completed',
          createdAt: '2024-11-25T15:00:00Z',
          deadline: '2024-12-01T15:00:00Z',
          communityId: 'community-1',
          createdBy: 'user-2'
        },
        totalVotes: 203,
        results: [
          { optionId: '2a', optionText: 'Approve fee reduction', voteCount: 134, percentage: 66.0, isWinner: true },
          { optionId: '2b', optionText: 'Reject proposal', voteCount: 41, percentage: 20.2 },
          { optionId: '2c', optionText: 'Propose alternative', voteCount: 28, percentage: 13.8 }
        ],
        status: 'completed',
        startDate: '2024-11-25T15:00:00Z',
        endDate: '2024-12-01T15:00:00Z',
        lastUpdated: '2024-12-01T15:00:00Z',
        participationRate: 85.3,
        winningOption: 'Approve fee reduction',
        chartData: {
          labels: ['Approve fee reduction', 'Reject proposal', 'Propose alternative'],
          datasets: [{
            label: 'Votes',
            data: [134, 41, 28],
            backgroundColor: ['#10B981', '#EF4444', '#F59E0B']
          }]
        }
      },
      {
        questionId: '3',
        question: {
          id: '3',
          title: 'Community treasury allocation',
          description: 'How should we allocate the community treasury funds?',
          options: [
            { id: '3a', text: 'Development (60%)' },
            { id: '3b', text: 'Marketing (30%)' },
            { id: '3c', text: 'Reserve (10%)' }
          ],
          type: 'single_choice',
          status: 'active',
          createdAt: '2024-12-08T09:00:00Z',
          deadline: '2024-12-14T09:00:00Z',
          communityId: 'community-1',
          createdBy: 'user-3'
        },
        totalVotes: 89,
        results: [
          { optionId: '3a', optionText: 'Development (60%)', voteCount: 52, percentage: 58.4, isWinner: true },
          { optionId: '3b', optionText: 'Marketing (30%)', voteCount: 25, percentage: 28.1 },
          { optionId: '3c', optionText: 'Reserve (10%)', voteCount: 12, percentage: 13.5 }
        ],
        status: 'active',
        startDate: '2024-12-08T09:00:00Z',
        lastUpdated: '2024-12-08T12:00:00Z',
        participationRate: 62.7,
        chartData: {
          labels: ['Development (60%)', 'Marketing (30%)', 'Reserve (10%)'],
          datasets: [{
            label: 'Votes',
            data: [52, 25, 12],
            backgroundColor: ['#3B82F6', '#8B5CF6', '#06B6D4']
          }]
        }
      }
    ];

    return {
      results: mockResults,
      totalQuestions: 3,
      totalVotes: 448,
      averageParticipation: 75.3,
      page: 1,
      limit: 20,
      hasMore: false
    };
  }

  /**
   * Fetch voting results with filtering and pagination
   */
  async getVotingResults(
    filters: ResultsFilter = {},
    page: number = 1,
    limit: number = 20
  ): Promise<VotingResultsResponse> {
    try {
      // For demo purposes, return mock data
      const mockData = this.generateMockVotingResults();
      
      // Apply filters to mock data
      let filteredResults = mockData.results;
      
      if (filters.status?.length) {
        filteredResults = filteredResults.filter(result => 
          filters.status!.includes(result.status)
        );
      }
      
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        filteredResults = filteredResults.filter(result =>
          result.question.title.toLowerCase().includes(query) ||
          result.question.description.toLowerCase().includes(query)
        );
      }

      const response = {
        ...mockData,
        results: filteredResults,
        totalQuestions: filteredResults.length
      };
      
      console.log(`[ResultsService] Loaded ${response.results.length} voting results`);
      return response;

    } catch (error) {
      console.error('[ResultsService] Failed to fetch voting results:', error);
      throw error;
    }
  }

  /**
   * Get detailed results for a specific voting question
   */
  async getVotingResultById(questionId: string): Promise<VotingResult> {
    try {
      // Get mock data and find the specific result
      const mockData = this.generateMockVotingResults();
      const result = mockData.results.find(r => r.questionId === questionId);
      
      if (!result) {
        throw new Error(`Voting result not found for question ${questionId}`);
      }

      console.log(`[ResultsService] Loaded result for question ${questionId}`);
      return result;

    } catch (error) {
      console.error(`[ResultsService] Failed to fetch result for question ${questionId}:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const resultsService = new ResultsService();
export default resultsService;
