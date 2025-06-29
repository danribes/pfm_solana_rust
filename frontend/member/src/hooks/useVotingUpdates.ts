// Real-time Voting Updates Hook for Member Portal
// React hook for WebSocket-based real-time voting updates

import { useState, useEffect, useCallback, useRef } from 'react';
import votingService from '../services/voting';
import {
  VotingUpdatePayload,
  VotingUpdateType,
  VoteCountUpdate,
  VotingQuestion
} from '../types/voting';

export interface UseVotingUpdatesReturn {
  connected: boolean;
  connecting: boolean;
  error: Error | null;
  lastUpdate: VotingUpdatePayload | null;
  connectionAttempts: number;
  connect: () => void;
  disconnect: () => void;
  reconnect: () => void;
}

export const useVotingUpdates = (
  onVoteCountUpdate?: (update: VoteCountUpdate) => void,
  onQuestionUpdate?: (question: VotingQuestion) => void,
  onNewQuestion?: (question: VotingQuestion) => void,
  onQuestionClosed?: (questionId: string) => void,
  autoConnect: boolean = true
): UseVotingUpdatesReturn => {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdate, setLastUpdate] = useState<VotingUpdatePayload | null>(null);
  const [connectionAttempts, setConnectionAttempts] = useState(0);

  const disconnectFunctionRef = useRef<(() => void) | null>(null);
  const mountedRef = useRef(true);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 2000; // 2 seconds base delay

  const isMounted = () => mountedRef.current;

  const handleUpdate = useCallback((payload: VotingUpdatePayload) => {
    if (!isMounted()) return;

    setLastUpdate(payload);
    setError(null);

    try {
      switch (payload.type) {
        case VotingUpdateType.VOTE_CAST:
          if (onVoteCountUpdate && payload.data) {
            const update: VoteCountUpdate = {
              questionId: payload.questionId,
              optionId: payload.data.optionId,
              newCount: payload.data.newCount,
              newPercentage: payload.data.newPercentage,
              totalVotes: payload.data.totalVotes
            };
            onVoteCountUpdate(update);
          }
          break;

        case VotingUpdateType.QUESTION_UPDATED:
          if (onQuestionUpdate && payload.data) {
            onQuestionUpdate(payload.data as VotingQuestion);
          }
          break;

        case VotingUpdateType.NEW_QUESTION:
          if (onNewQuestion && payload.data) {
            onNewQuestion(payload.data as VotingQuestion);
          }
          break;

        case VotingUpdateType.QUESTION_CLOSED:
          if (onQuestionClosed) {
            onQuestionClosed(payload.questionId);
          }
          break;

        default:
          console.log('Received unknown voting update type:', payload.type);
      }
    } catch (err) {
      console.error('Error handling voting update:', err);
    }
  }, [onVoteCountUpdate, onQuestionUpdate, onNewQuestion, onQuestionClosed]);

  const handleError = useCallback((error: Error) => {
    if (!isMounted()) return;

    console.error('WebSocket voting updates error:', error);
    setError(error);
    setConnected(false);
    setConnecting(false);
  }, []);

  const connect = useCallback(() => {
    if (!isMounted() || connected || connecting) return;

    try {
      setConnecting(true);
      setError(null);
      setConnectionAttempts(prev => prev + 1);

      const disconnect = votingService.connectToVotingUpdates(
        (payload) => {
          if (isMounted()) {
            setConnected(true);
            setConnecting(false);
            setConnectionAttempts(0);
            handleUpdate(payload);
          }
        },
        (error) => {
          if (isMounted()) {
            handleError(error);
            scheduleReconnect();
          }
        }
      );

      disconnectFunctionRef.current = disconnect;

      // Set connection timeout
      const connectionTimeout = setTimeout(() => {
        if (isMounted() && connecting) {
          setConnecting(false);
          setError(new Error('Connection timeout'));
          scheduleReconnect();
        }
      }, 10000); // 10 seconds timeout

      // Cleanup timeout when connection is established
      const originalDisconnect = disconnect;
      disconnectFunctionRef.current = () => {
        clearTimeout(connectionTimeout);
        originalDisconnect();
      };

    } catch (err) {
      if (isMounted()) {
        const error = err instanceof Error ? err : new Error('Connection failed');
        handleError(error);
        scheduleReconnect();
      }
    }
  }, [connected, connecting, handleUpdate, handleError]);

  const scheduleReconnect = useCallback(() => {
    if (!isMounted() || connectionAttempts >= maxReconnectAttempts) {
      console.log('Max reconnection attempts reached');
      return;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    const delay = reconnectDelay * Math.pow(2, Math.min(connectionAttempts, 5));
    console.log(`Scheduling reconnect in ${delay}ms (attempt ${connectionAttempts + 1})`);

    reconnectTimeoutRef.current = setTimeout(() => {
      if (isMounted()) {
        console.log('Attempting to reconnect...');
        connect();
      }
    }, delay);
  }, [connectionAttempts, connect]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (disconnectFunctionRef.current) {
      disconnectFunctionRef.current();
      disconnectFunctionRef.current = null;
    }

    if (isMounted()) {
      setConnected(false);
      setConnecting(false);
      setError(null);
      setConnectionAttempts(0);
    }
  }, []);

  const reconnect = useCallback(() => {
    disconnect();
    if (isMounted()) {
      setConnectionAttempts(0);
      setTimeout(() => {
        if (isMounted()) {
          connect();
        }
      }, 1000);
    }
  }, [disconnect, connect]);

  // Auto-connect on mount if enabled
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect]); // eslint-disable-line react-hooks/exhaustive-deps

  // Component mount/unmount tracking
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      // Cleanup on unmount
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (disconnectFunctionRef.current) {
        disconnectFunctionRef.current();
      }
    };
  }, []);

  // Connection health check
  useEffect(() => {
    if (!connected || !autoConnect) return;

    const healthCheckInterval = setInterval(() => {
      if (!connected && isMounted() && connectionAttempts < maxReconnectAttempts) {
        console.log('Connection lost, attempting to reconnect...');
        connect();
      }
    }, 30000); // Check every 30 seconds

    return () => {
      clearInterval(healthCheckInterval);
    };
  }, [connected, autoConnect, connectionAttempts, connect]);

  return {
    connected,
    connecting,
    error,
    lastUpdate,
    connectionAttempts,
    connect,
    disconnect,
    reconnect
  };
};

// Hook for subscribing to specific question updates
export const useQuestionUpdates = (
  questionId: string | null,
  onUpdate?: (question: VotingQuestion) => void,
  onVoteCountChange?: (update: VoteCountUpdate) => void
) => {
  const [questionState, setQuestionState] = useState<{
    question: VotingQuestion | null;
    lastUpdateTime: Date | null;
  }>({
    question: null,
    lastUpdateTime: null
  });

  const handleVoteCountUpdate = useCallback((update: VoteCountUpdate) => {
    if (update.questionId === questionId) {
      setQuestionState(prev => ({
        ...prev,
        lastUpdateTime: new Date()
      }));
      
      if (onVoteCountChange) {
        onVoteCountChange(update);
      }
    }
  }, [questionId, onVoteCountChange]);

  const handleQuestionUpdate = useCallback((question: VotingQuestion) => {
    if (question.id === questionId) {
      setQuestionState({
        question,
        lastUpdateTime: new Date()
      });
      
      if (onUpdate) {
        onUpdate(question);
      }
    }
  }, [questionId, onUpdate]);

  const votingUpdates = useVotingUpdates(
    handleVoteCountUpdate,
    handleQuestionUpdate,
    undefined,
    undefined,
    !!questionId
  );

  return {
    ...votingUpdates,
    questionState,
    isQuestionActive: questionId === votingUpdates.lastUpdate?.questionId
  };
};

export default useVotingUpdates; 