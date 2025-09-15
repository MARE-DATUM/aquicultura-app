import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { CustomButton as Button, Card } from './ui';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

/**
 * ErrorBoundary para capturar erros de React e exibir fallback
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Callback para logging externo
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="max-w-md w-full text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Oops! Algo deu errado
                </h2>
                <p className="text-gray-600 mb-4">
                  Ocorreu um erro inesperado. Tente recarregar a página ou voltar ao início.
                </p>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="w-full text-left">
                  <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                    Detalhes do erro (desenvolvimento)
                  </summary>
                  <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono text-gray-700 overflow-auto max-h-32">
                    <div className="mb-2">
                      <strong>Erro:</strong> {this.state.error.message}
                    </div>
                    <div>
                      <strong>Stack:</strong>
                      <pre className="whitespace-pre-wrap">
                        {this.state.error.stack}
                      </pre>
                    </div>
                  </div>
                </details>
              )}

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={this.handleRetry}
                  icon={<RefreshCw className="h-4 w-4" />}
                >
                  Tentar Novamente
                </Button>
                <Button
                  variant="default"
                  onClick={this.handleGoHome}
                  icon={<Home className="h-4 w-4" />}
                >
                  Ir para Início
                </Button>
              </div>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;


