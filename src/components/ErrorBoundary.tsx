
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    console.error('ErrorBoundary caught an error:', error);
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary details:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center">
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
              <div className="w-16 h-16 bg-red-500/20 border border-red-500/30 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-red-400 text-2xl">⚠️</span>
              </div>
              
              <h1 className="text-xl font-bold text-white mb-2">
                Algo deu errado
              </h1>
              
              <p className="text-gray-400 mb-6">
                Ocorreu um erro inesperado no Alex iA. Você pode tentar recarregar a página ou continuar usando o sistema.
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={this.handleReload}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Recarregar Página
                </button>
                
                <button
                  onClick={this.handleReset}
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Tentar Novamente
                </button>
              </div>
              
              {this.state.error && (
                <details className="mt-4 text-left">
                  <summary className="text-gray-500 text-sm cursor-pointer">
                    Detalhes técnicos
                  </summary>
                  <pre className="mt-2 text-xs text-red-400 bg-gray-800 p-2 rounded overflow-auto">
                    {this.state.error.message}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
