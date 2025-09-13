import { useState, useCallback, useRef } from 'react';
import { AxiosError } from 'axios';

interface ErrorState {
  hasError: boolean;
  error: string | null;
  errorCode?: string | number;
  retryCount: number;
}

interface UseErrorHandlerOptions {
  maxRetries?: number;
  retryDelay?: number;
  onError?: (error: Error) => void;
  onRetry?: (retryCount: number) => void;
}

/**
 * Hook para tratamento centralizado de erros de API
 */
export const useErrorHandler = (options: UseErrorHandlerOptions = {}) => {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    onError,
    onRetry
  } = options;

  const [errorState, setErrorState] = useState<ErrorState>({
    hasError: false,
    error: null,
    retryCount: 0
  });

  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearError = useCallback(() => {
    setErrorState({
      hasError: false,
      error: null,
      retryCount: 0
    });
  }, []);

  const handleError = useCallback((error: unknown) => {
    let errorMessage = 'Ocorreu um erro inesperado';
    let errorCode: string | number | undefined;

    if (error instanceof AxiosError) {
      // Erro de API
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;

        switch (status) {
          case 400:
            errorMessage = data?.message || 'Dados inválidos';
            break;
          case 401:
            errorMessage = 'Sessão expirada. Faça login novamente.';
            errorCode = 'UNAUTHORIZED';
            break;
          case 403:
            errorMessage = 'Não tem permissão para realizar esta ação';
            errorCode = 'FORBIDDEN';
            break;
          case 404:
            errorMessage = 'Recurso não encontrado';
            errorCode = 'NOT_FOUND';
            break;
          case 422:
            errorMessage = data?.message || 'Dados de validação inválidos';
            break;
          case 429:
            errorMessage = 'Muitas tentativas. Tente novamente em alguns minutos';
            errorCode = 'RATE_LIMITED';
            break;
          case 500:
            errorMessage = 'Erro interno do servidor';
            errorCode = 'SERVER_ERROR';
            break;
          case 503:
            errorMessage = 'Serviço temporariamente indisponível';
            errorCode = 'SERVICE_UNAVAILABLE';
            break;
          default:
            errorMessage = data?.message || `Erro ${status}`;
        }
      } else if (error.request) {
        errorMessage = 'Erro de conexão. Verifique sua internet';
        errorCode = 'NETWORK_ERROR';
      } else {
        errorMessage = 'Erro de configuração da requisição';
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    setErrorState(prev => ({
      hasError: true,
      error: errorMessage,
      errorCode,
      retryCount: prev.retryCount
    }));

    // Callback para logging externo
    if (onError) {
      onError(error instanceof Error ? error : new Error(errorMessage));
    }
  }, [onError]);

  const retry = useCallback(async <T>(
    operation: () => Promise<T>
  ): Promise<T | null> => {
    if (errorState.retryCount >= maxRetries) {
      return null;
    }

    const newRetryCount = errorState.retryCount + 1;
    
    setErrorState(prev => ({
      ...prev,
      retryCount: newRetryCount
    }));

    if (onRetry) {
      onRetry(newRetryCount);
    }

    // Delay antes de tentar novamente
    await new Promise(resolve => {
      retryTimeoutRef.current = setTimeout(resolve, retryDelay * newRetryCount);
    });

    try {
      const result = await operation();
      clearError();
      return result;
    } catch (error) {
      handleError(error);
      return null;
    }
  }, [errorState.retryCount, maxRetries, retryDelay, onRetry, clearError, handleError]);

  const executeWithErrorHandling = useCallback(async <T>(
    operation: () => Promise<T>
  ): Promise<T | null> => {
    try {
      clearError();
      const result = await operation();
      return result;
    } catch (error) {
      handleError(error);
      return null;
    }
  }, [clearError, handleError]);

  // Cleanup timeout on unmount
  const cleanup = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
  }, []);

  return {
    ...errorState,
    clearError,
    handleError,
    retry,
    executeWithErrorHandling,
    cleanup,
    canRetry: errorState.retryCount < maxRetries
  };
};

/**
 * Hook para tratamento de erros de formulário
 */
export const useFormErrorHandler = () => {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);

  const setFieldError = useCallback((field: string, error: string) => {
    setFieldErrors(prev => ({
      ...prev,
      [field]: error
    }));
  }, []);

  const clearFieldError = useCallback((field: string) => {
    setFieldErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setFieldErrors({});
    setGlobalError(null);
  }, []);

  const setGlobalErrorCallback = useCallback((error: string) => {
    setGlobalError(error);
  }, []);

  const hasErrors = Object.keys(fieldErrors).length > 0 || !!globalError;

  return {
    fieldErrors,
    globalError,
    setFieldError,
    clearFieldError,
    clearAllErrors,
    setGlobalError: setGlobalErrorCallback,
    hasErrors
  };
};
