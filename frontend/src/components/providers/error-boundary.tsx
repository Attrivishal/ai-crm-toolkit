import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Button } from '../ui/button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-background">
          <div className="text-center space-y-6 max-w-md px-4">
            <div className="relative">
              <div className="w-24 h-24 bg-red-100 rounded-2xl flex items-center justify-center mx-auto">
                <AlertCircle className="w-12 h-12 text-red-600" />
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-900">Something went wrong</h1>
              <p className="text-muted-foreground">
                We're sorry, but an unexpected error occurred. Our team has been notified.
              </p>
            </div>

            {this.state.error && import.meta.env.DEV && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left">
                <p className="text-sm font-mono text-red-700 break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex items-center justify-center space-x-4">
              <Button variant="outline" onClick={this.handleReset}>
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>
              <Button onClick={this.handleReload}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}