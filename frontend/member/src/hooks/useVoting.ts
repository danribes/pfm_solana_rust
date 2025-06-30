// Voting Management Hook for Task 4.4.6
// Active Polls & Voting Campaigns Display

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Campaign,
  UserVotingStatus,
  VoteSubmissionResponse,
  UseVotingResult,
  VotePreview,
  VoteData
} from "../types/campaign";
import { votingService } from "../services/voting";
import { campaignService } from "../services/campaigns";

export function useVoting(campaignId: string | null): UseVotingResult {
  // State management
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [userStatus, setUserStatus] = useState<UserVotingStatus | null>(null);
  const [selectedVotes, setSelectedVotes] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [lastSubmission, setLastSubmission] = useState<VoteSubmissionResponse | null>(null);

  // Refs for cleanup
  const abortControllerRef = useRef<AbortController | null>(null);
  const votingSubscriptionRef = useRef<(() => void) | null>(null);

  /**
   * Load campaign data and user status
   */
  const loadCampaignData = useCallback(async () => {
    if (!campaignId) {
      setCampaign(null);
      setUserStatus(null);
      return;
    }

    try {
      // Cancel previous request if still pending
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      // Load campaign and user status in parallel
      const [campaignData, statusData] = await Promise.all([
        campaignService.getCampaignById(campaignId),
        campaignService.getUserVotingStatus(campaignId),
      ]);

      setCampaign(campaignData);
      setUserStatus(statusData);

      // Initialize selected votes from existing user votes
      if (statusData.votes.length > 0) {
        const existingVotes: Record<string, string> = {};
        statusData.votes.forEach(vote => {
          existingVotes[vote.questionId] = vote.optionId;
        });
        setSelectedVotes(existingVotes);
      }

    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        console.error("Error loading campaign data:", err);
      }
    }
  }, [campaignId]);

  /**
   * Set vote for a specific question
   */
  const setVote = useCallback((questionId: string, optionId: string) => {
    setSelectedVotes(prev => ({
      ...prev,
      [questionId]: optionId,
    }));

    // Clear validation error for this question
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[questionId];
      return newErrors;
    });
  }, []);

  /**
   * Clear vote for a specific question
   */
  const clearVote = useCallback((questionId: string) => {
    setSelectedVotes(prev => {
      const newVotes = { ...prev };
      delete newVotes[questionId];
      return newVotes;
    });
  }, []);

  /**
   * Validate all selected votes
   */
  const validateVotes = useCallback(async (): Promise<boolean> => {
    if (!campaign || !campaignId) return false;

    const errors: Record<string, string> = {};

    // Check required questions
    campaign.questions.forEach(question => {
      if (question.isRequired && !selectedVotes[question.id]) {
        errors[question.id] = "This question is required";
      }
    });

    // Validate with backend if we have votes to submit
    const votesToSubmit = Object.entries(selectedVotes).map(([questionId, optionId]) => ({
      questionId,
      optionId,
    }));

    if (votesToSubmit.length > 0) {
      try {
        const validation = await votingService.validateVotes(campaignId, votesToSubmit);
        
        if (!validation.isValid) {
          Object.assign(errors, validation.errors);
        }
      } catch (err) {
        console.error("Backend validation failed:", err);
        errors.general = "Unable to validate votes. Please try again.";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [campaign, campaignId, selectedVotes]);

  /**
   * Check if user can submit votes
   */
  const canSubmit = useCallback((): boolean => {
    if (!campaign || !userStatus || isSubmitting) return false;
    
    // Check if user is eligible to vote
    if (!userStatus.eligibilityStatus.isEligible) return false;
    
    // Check if campaign is active
    if (campaign.status !== "active" && campaign.status !== "ending_soon") return false;
    
    // Check if user has selected any votes
    if (Object.keys(selectedVotes).length === 0) return false;
    
    // Check if all required questions are answered
    const requiredQuestions = campaign.questions.filter(q => q.isRequired);
    const answeredRequired = requiredQuestions.every(q => selectedVotes[q.id]);
    
    return answeredRequired;
  }, [campaign, userStatus, selectedVotes, isSubmitting]);

  /**
   * Submit votes to backend
   */
  const submitVotes = useCallback(async (): Promise<VoteSubmissionResponse> => {
    if (!campaign || !campaignId || !canSubmit()) {
      throw new Error("Cannot submit votes in current state");
    }

    setIsSubmitting(true);
    
    try {
      // Validate votes first
      const isValid = await validateVotes();
      if (!isValid) {
        throw new Error("Vote validation failed");
      }

      // Prepare vote data
      const votes: VoteData[] = Object.entries(selectedVotes).map(([questionId, optionId]) => ({
        questionId,
        optionId,
        metadata: {
          submittedAt: new Date().toISOString(),
          userAgent: navigator.userAgent,
        },
      }));

      // Submit votes
      const response = await votingService.submitVotes({
        campaignId,
        votes,
        metadata: {
          totalQuestions: campaign.questions.length,
          answeredQuestions: votes.length,
        },
      });

      // Update user status with response
      if (response.success) {
        setUserStatus(response.updatedStatus);
        setLastSubmission(response);
        
        // Clear selected votes if submission was successful
        setSelectedVotes({});
      }

      return response;

    } catch (err) {
      console.error("Error submitting votes:", err);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, [campaign, campaignId, canSubmit, validateVotes, selectedVotes]);

  /**
   * Generate preview of votes before submission
   */
  const previewVotes = useCallback((): VotePreview[] => {
    if (!campaign) return [];
    
    return votingService.generateVotePreview(campaign, selectedVotes);
  }, [campaign, selectedVotes]);

  /**
   * Reset voting state
   */
  const resetVoting = useCallback(() => {
    setSelectedVotes({});
    setValidationErrors({});
    setLastSubmission(null);
  }, []);

  /**
   * Subscribe to real-time voting updates
   */
  const subscribeToVotingUpdates = useCallback(() => {
    if (!campaignId) return;

    // Clean up existing subscription
    if (votingSubscriptionRef.current) {
      votingSubscriptionRef.current();
    }

    const cleanup = votingService.subscribeToVotingUpdates(
      campaignId,
      (updateData) => {
        // Update campaign data with new vote counts
        setCampaign(prev => {
          if (!prev) return prev;
          
          const updatedQuestions = prev.questions.map(question => {
            if (question.id === updateData.questionId) {
              const updatedOptions = question.options.map(option => {
                if (option.id === updateData.optionId) {
                  return {
                    ...option,
                    voteCount: updateData.newVoteCount,
                    percentage: updateData.newPercentage,
                  };
                }
                return option;
              });
              
              return { ...question, options: updatedOptions };
            }
            return question;
          });
          
          return { ...prev, questions: updatedQuestions };
        });
      },
      (error) => {
        console.error("Voting update subscription error:", error);
      }
    );

    votingSubscriptionRef.current = cleanup;
  }, [campaignId]);

  // Effects

  /**
   * Load campaign data when campaignId changes
   */
  useEffect(() => {
    loadCampaignData();
  }, [loadCampaignData]);

  /**
   * Subscribe to voting updates when campaign is loaded
   */
  useEffect(() => {
    if (campaign && (campaign.status === "active" || campaign.status === "ending_soon")) {
      subscribeToVotingUpdates();
    }
    
    return () => {
      if (votingSubscriptionRef.current) {
        votingSubscriptionRef.current();
      }
    };
  }, [campaign, subscribeToVotingUpdates]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      // Cancel any pending requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Clean up voting subscription
      if (votingSubscriptionRef.current) {
        votingSubscriptionRef.current();
      }
    };
  }, []);

  return {
    campaign,
    userStatus,
    selectedVotes,
    setVote,
    clearVote,
    submitVotes,
    isSubmitting,
    canSubmit: canSubmit(),
    validationErrors,
    previewVotes,
    resetVoting,
  };
}

export default useVoting;
