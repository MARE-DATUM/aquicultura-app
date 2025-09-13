import { useState, useCallback, useRef, useEffect } from 'react';

interface LoadingState {
  isLoading: boolean;
  isRefreshing: boolean;
  isInitialLoad: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

interface UseLoadingStatesOptions {
  initialLoading?: boolean;
  onError?: (error: string) => void;
  onSuccess?: () => void;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

/**
 * Hook para gerenciar estados de loading de forma otimizada
 */
export const useLoadingStates = (options: UseLoadingStatesOptions = {}) => {
  const {
    initialLoading = false,
    onError,
    onSuccess,
    autoRefresh = false,
    refreshInterval = 30000 // 30 segundos
  } = options;

  const [state, setState] = useState<LoadingState>({
    isLoading: initialLoading,
    isRefreshing: false,
    isInitialLoad: initialLoading,
    error: null,
    lastUpdated: null
  });

  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  // Auto refresh setup
  useEffect(() => {
    if (autoRefresh && !state.isLoading && !state.error) {
      refreshTimeoutRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          setState(prev => ({ ...prev, isRefreshing: true }));
        }
      }, refreshInterval);
    }

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [autoRefresh, refreshInterval, state.isLoading, state.error]);

  const setLoading = useCallback((loading: boolean) => {
    if (!isMountedRef.current) return;
    
    setState(prev => ({
      ...prev,
      isLoading: loading,
      isInitialLoad: loading && prev.isInitialLoad
    }));
  }, []);

  const setRefreshing = useCallback((refreshing: boolean) => {
    if (!isMountedRef.current) return;
    
    setState(prev => ({
      ...prev,
      isRefreshing: refreshing
    }));
  }, []);

  const setError = useCallback((error: string | null) => {
    if (!isMountedRef.current) return;
    
    setState(prev => ({
      ...prev,
      error,
      isLoading: false,
      isRefreshing: false,
      isInitialLoad: false
    }));

    if (error && onError) {
      onError(error);
    }
  }, [onError]);

  const setSuccess = useCallback(() => {
    if (!isMountedRef.current) return;
    
    setState(prev => ({
      ...prev,
      error: null,
      isLoading: false,
      isRefreshing: false,
      isInitialLoad: false,
      lastUpdated: new Date()
    }));

    if (onSuccess) {
      onSuccess();
    }
  }, [onSuccess]);

  const executeWithLoading = useCallback(async <T>(
    operation: () => Promise<T>,
    options: { isRefresh?: boolean } = {}
  ): Promise<T | null> => {
    const { isRefresh = false } = options;

    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const result = await operation();
      setSuccess();
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setError(errorMessage);
      return null;
    }
  }, [setLoading, setRefreshing, setError, setSuccess]);

  const retry = useCallback(async <T>(
    operation: () => Promise<T>
  ): Promise<T | null> => {
    return executeWithLoading(operation, { isRefresh: false });
  }, [executeWithLoading]);

  const refresh = useCallback(async <T>(
    operation: () => Promise<T>
  ): Promise<T | null> => {
    return executeWithLoading(operation, { isRefresh: true });
  }, [executeWithLoading]);

  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      isRefreshing: false,
      isInitialLoad: false,
      error: null,
      lastUpdated: null
    });
  }, []);

  return {
    ...state,
    setLoading,
    setRefreshing,
    setError,
    setSuccess,
    executeWithLoading,
    retry,
    refresh,
    clearError,
    reset
  };
};

/**
 * Hook para loading de operações específicas
 */
export const useOperationLoading = () => {
  const [operations, setOperations] = useState<Set<string>>(new Set());

  const setOperationLoading = useCallback((operation: string, loading: boolean) => {
    setOperations(prev => {
      const newSet = new Set(prev);
      if (loading) {
        newSet.add(operation);
      } else {
        newSet.delete(operation);
      }
      return newSet;
    });
  }, []);

  const isOperationLoading = useCallback((operation: string) => {
    return operations.has(operation);
  }, [operations]);

  const executeOperation = useCallback(async <T>(
    operation: string,
    fn: () => Promise<T>
  ): Promise<T | null> => {
    try {
      setOperationLoading(operation, true);
      const result = await fn();
      return result;
    } catch (error) {
      console.error(`Error in operation ${operation}:`, error);
      return null;
    } finally {
      setOperationLoading(operation, false);
    }
  }, [setOperationLoading]);

  return {
    operations: Array.from(operations),
    setOperationLoading,
    isOperationLoading,
    executeOperation,
    hasAnyLoading: operations.size > 0
  };
};

/**
 * Hook para debounce de loading states
 */
export const useDebouncedLoading = (delay: number = 300) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isDebouncedLoading, setIsDebouncedLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const setLoading = useCallback((loading: boolean) => {
    setIsLoading(loading);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (loading) {
      // Mostrar loading imediatamente
      setIsDebouncedLoading(true);
    } else {
      // Esconder loading com delay
      timeoutRef.current = setTimeout(() => {
        setIsDebouncedLoading(false);
      }, delay);
    }
  }, [delay]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    isLoading,
    isDebouncedLoading,
    setLoading
  };
};
