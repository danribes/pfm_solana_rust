/**
 * Error Handling Hook
 * React hook for blockchain error handling and recovery
 */

import { useState, useEffect, useCallback } from 'react';
import {
  BlockchainError,
  NetworkError,
  TransactionError,
  ErrorState,
  NetworkErrorCode,
  TransactionErrorCode,
  ErrorContext
} from '../types/errors';

import { errorHandlingService } from '../services/errorHandling';

export interface UseErrorHandlingReturn {
  errorState: ErrorState;
  handleNetworkError: (code: NetworkErrorCode, context: ErrorContext, originalError?: any) => Promise<NetworkError>;
  handleTransactionError: (code: TransactionErrorCode, context: ErrorContext, originalError?: any) => Promise<TransactionError>;
  dismissError: (errorId: string) => void;
  clearAllErrors: () => void;
  hasErrors: boolean;
  lastError: BlockchainError | undefined;
}

export function useErrorHandling(): UseErrorHandlingReturn {
  const [errorState, setErrorState] = useState<ErrorState>(() => 
    errorHandlingService.getErrorState()
  );

  const handleErrorEvent = useCallback((error: BlockchainError) => {
    setErrorState(errorHandlingService.getErrorState());
  }, []);

  useEffect(() => {
    errorHandlingService.addEventListener('error', handleErrorEvent);
    
    return () => {
      errorHandlingService.removeEventListener('error', handleErrorEvent);
    };
  }, [handleErrorEvent]);

  const handleNetworkError = useCallback(
    async (code: NetworkErrorCode, context: ErrorContext, originalError?: any): Promise<NetworkError> => {
      return errorHandlingService.handleNetworkError(code, context, originalError);
    },
    []
  );

  const handleTransactionError = useCallback(
    async (code: TransactionErrorCode, context: ErrorContext, originalError?: any): Promise<TransactionError> => {
      return errorHandlingService.handleTransactionError(code, context, originalError);
    },
    []
  );

  const dismissError = useCallback((errorId: string): void => {
    errorHandlingService.dismissError(errorId);
  }, []);

  const clearAllErrors = useCallback((): void => {
    errorHandlingService.clearAllErrors();
  }, []);

  const hasErrors = errorState.errors.length > 0;
  const lastError = errorState.lastError;

  return {
    errorState,
    handleNetworkError,
    handleTransactionError,
    dismissError,
    clearAllErrors,
    hasErrors,
    lastError
  };
} 