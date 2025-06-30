// Voting Service for Task 4.4.6
// Active Polls & Voting Campaigns Display

import {
  Campaign,
  VoteSubmissionRequest,
  VoteSubmissionResponse,
  UserVotingStatus,
  VoteData,
  VotePreview,
  VotingQuestion,
  VotingOption
} from "../types/campaign";

export class VotingService {
  private baseUrl: string;
  private apiKey?: string;

  constructor(baseUrl: string = "/api", apiKey?: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  /**
   * Get headers for API requests
   */
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (this.apiKey) {
      headers["Authorization"] = `Bearer ${this.apiKey}`;
    }

    // Get token from localStorage if available
    const token = localStorage.getItem("authToken");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Handle API errors with detailed error messages
   */
  private async handleApiError(response: Response): Promise<never> {
    const contentType = response.headers.get("content-type");
    let errorMessage = `Voting API Error: ${response.status} ${response.statusText}`;

    try {
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } else {
        const errorText = await response.text();
        errorMessage = errorText || errorMessage;
      }
    } catch (parseError) {
      console.error("Error parsing voting API error response:", parseError);
    }

    throw new Error(errorMessage);
  }

  /**
   * Make authenticated API request with error handling
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const requestOptions: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, requestOptions);

      if (!response.ok) {
        await this.handleApiError(response);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Voting API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // ===========================
  // VOTE SUBMISSION METHODS
  // ===========================

  /**
   * Submit votes for a campaign
   */
  async submitVotes(request: VoteSubmissionRequest): Promise<VoteSubmissionResponse> {
    return this.makeRequest<VoteSubmissionResponse>("/votes/submit", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  /**
   * Submit single vote for a question
   */
  async submitSingleVote(
    campaignId: string,
    questionId: string,
    optionId: string,
    stakingAmount?: number,
    metadata?: Record<string, any>
  ): Promise<VoteSubmissionResponse> {
    const request: VoteSubmissionRequest = {
      campaignId,
      votes: [
        {
          questionId,
          optionId,
          stakingAmount,
          metadata,
        },
      ],
      metadata: {
        singleVote: true,
        timestamp: new Date().toISOString(),
      },
    };

    return this.submitVotes(request);
  }

  /**
   * Update existing vote (if allowed by campaign configuration)
   */
  async updateVote(
    voteId: string,
    newOptionId: string,
    metadata?: Record<string, any>
  ): Promise<VoteSubmissionResponse> {
    return this.makeRequest<VoteSubmissionResponse>(`/votes/${voteId}`, {
      method: "PUT",
      body: JSON.stringify({
        optionId: newOptionId,
        metadata: {
          ...metadata,
          updated: true,
          updatedAt: new Date().toISOString(),
        },
      }),
    });
  }

  /**
   * Delete vote (if allowed by campaign configuration)
   */
  async deleteVote(voteId: string): Promise<void> {
    await this.makeRequest<void>(`/votes/${voteId}`, {
      method: "DELETE",
    });
  }

  // ===========================
  // VOTE VALIDATION METHODS
  // ===========================

  /**
   * Validate votes before submission
   */
  async validateVotes(
    campaignId: string,
    votes: VoteData[]
  ): Promise<{
    isValid: boolean;
    errors: Record<string, string>;
    warnings: Record<string, string>;
  }> {
    const response = await this.makeRequest<{
      isValid: boolean;
      errors: Record<string, string>;
      warnings: Record<string, string>;
    }>("/votes/validate", {
      method: "POST",
      body: JSON.stringify({
        campaignId,
        votes,
      }),
    });

    return response;
  }

  /**
   * Check eligibility to vote in campaign
   */
  async checkVotingEligibility(campaignId: string, userId?: string): Promise<{
    isEligible: boolean;
    reasons: string[];
    missingRequirements: string[];
  }> {
    const endpoint = userId
      ? `/campaigns/${campaignId}/eligibility?userId=${userId}`
      : `/campaigns/${campaignId}/eligibility`;

    return this.makeRequest<{
      isEligible: boolean;
      reasons: string[];
      missingRequirements: string[];
    }>(endpoint);
  }

  // ===========================
  // VOTE PREVIEW METHODS
  // ===========================

  /**
   * Generate vote preview before submission
   */
  generateVotePreview(
    campaign: Campaign,
    selectedVotes: Record<string, string>
  ): VotePreview[] {
    const previews: VotePreview[] = [];

    campaign.questions.forEach((question) => {
      const selectedOptionId = selectedVotes[question.id];
      if (selectedOptionId) {
        const selectedOption = question.options.find(
          (option) => option.id === selectedOptionId
        );

        if (selectedOption) {
          const preview: VotePreview = {
            question,
            selectedOption,
            isValid: this.validateSingleVote(question, selectedOption),
            warnings: this.getVoteWarnings(question, selectedOption),
          };
          previews.push(preview);
        }
      } else if (question.isRequired) {
        previews.push({
          question,
          selectedOption: {} as VotingOption,
          isValid: false,
          warnings: ["This question is required but no option has been selected"],
        });
      }
    });

    return previews;
  }

  /**
   * Validate a single vote selection
   */
  private validateSingleVote(question: VotingQuestion, option: VotingOption): boolean {
    // Check if option belongs to question
    const optionExists = question.options.some((q) => q.id === option.id);
    if (!optionExists) {
      return false;
    }

    // Add more validation logic based on question type
    switch (question.questionType) {
      case "single_choice":
      case "yes_no":
        return true;
      case "multiple_choice":
        // For multiple choice, check if within allowed selections
        return true;
      default:
        return true;
    }
  }

  /**
   * Get warnings for vote selection
   */
  private getVoteWarnings(question: VotingQuestion, option: VotingOption): string[] {
    const warnings: string[] = [];

    // Check for low vote count on option
    if (option.voteCount === 0) {
      warnings.push("This option has not received any votes yet");
    }

    // Check for controversial options (high vote count but low percentage)
    if (option.voteCount > 10 && option.percentage < 5) {
      warnings.push("This appears to be a minority choice");
    }

    return warnings;
  }

  // ===========================
  // VOTING STATISTICS METHODS
  // ===========================

  /**
   * Get voting statistics for campaign
   */
  async getVotingStatistics(campaignId: string): Promise<{
    totalVotes: number;
    uniqueVoters: number;
    participationRate: number;
    questionStats: Record<string, {
      totalVotes: number;
      optionBreakdown: Record<string, number>;
    }>;
  }> {
    return this.makeRequest<{
      totalVotes: number;
      uniqueVoters: number;
      participationRate: number;
      questionStats: Record<string, {
        totalVotes: number;
        optionBreakdown: Record<string, number>;
      }>;
    }>(`/campaigns/${campaignId}/statistics`);
  }

  /**
   * Get user voting history
   */
  async getUserVotingHistory(userId?: string): Promise<{
    votes: Array<{
      campaignId: string;
      campaignTitle: string;
      questionId: string;
      questionTitle: string;
      optionId: string;
      optionText: string;
      votedAt: string;
    }>;
    totalVotes: number;
    campaignsParticipated: number;
  }> {
    const endpoint = userId
      ? `/votes/history?userId=${userId}`
      : "/votes/history";

    return this.makeRequest<{
      votes: Array<{
        campaignId: string;
        campaignTitle: string;
        questionId: string;
        questionTitle: string;
        optionId: string;
        optionText: string;
        votedAt: string;
      }>;
      totalVotes: number;
      campaignsParticipated: number;
    }>(endpoint);
  }

  // ===========================
  // REAL-TIME VOTING METHODS
  // ===========================

  /**
   * Subscribe to real-time voting updates for campaign
   */
  subscribeToVotingUpdates(
    campaignId: string,
    onUpdate: (data: {
      questionId: string;
      optionId: string;
      newVoteCount: number;
      newPercentage: number;
    }) => void,
    onError?: (error: Error) => void
  ): () => void {
    const wsUrl = `ws://localhost:3000/ws/voting/${campaignId}`;
    let ws: WebSocket;

    try {
      ws = new WebSocket(wsUrl);

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "vote_update") {
            onUpdate(data);
          }
        } catch (error) {
          console.error("Error parsing voting WebSocket message:", error);
          onError?.(error as Error);
        }
      };

      ws.onerror = (event) => {
        console.error("Voting WebSocket error:", event);
        onError?.(new Error("Voting WebSocket connection error"));
      };

      ws.onclose = () => {
        console.log("Voting WebSocket connection closed");
      };

    } catch (error) {
      console.error("Error creating voting WebSocket connection:", error);
      onError?.(error as Error);
    }

    return () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }

  // ===========================
  // UTILITY METHODS
  // ===========================

  /**
   * Calculate voting power for user in campaign
   */
  async calculateVotingPower(
    campaignId: string,
    userId?: string
  ): Promise<{
    basePower: number;
    stakingBonus: number;
    roleBonus: number;
    totalPower: number;
    maxPossiblePower: number;
  }> {
    const endpoint = userId
      ? `/campaigns/${campaignId}/voting-power?userId=${userId}`
      : `/campaigns/${campaignId}/voting-power`;

    return this.makeRequest<{
      basePower: number;
      stakingBonus: number;
      roleBonus: number;
      totalPower: number;
      maxPossiblePower: number;
    }>(endpoint);
  }

  /**
   * Estimate gas cost for vote submission (for blockchain voting)
   */
  async estimateVotingCost(campaignId: string, votes: VoteData[]): Promise<{
    estimatedGas: number;
    gasPriceGwei: number;
    estimatedCostEth: number;
    estimatedCostUsd: number;
  }> {
    return this.makeRequest<{
      estimatedGas: number;
      gasPriceGwei: number;
      estimatedCostEth: number;
      estimatedCostUsd: number;
    }>("/votes/estimate-cost", {
      method: "POST",
      body: JSON.stringify({
        campaignId,
        votes,
      }),
    });
  }
}

// Create and export singleton instance
export const votingService = new VotingService();
export default votingService;
