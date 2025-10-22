'use client';

import React, { Component, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Log to analytics (if available)
    if (typeof window !== 'undefined' && (window as any).blinkClient) {
      (window as any).blinkClient.analytics.log('error_boundary', {
        error: error.message,
        stack: error.stack,
      });
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center p-8">
          <div className="bg-[#1e1e1e] rounded-lg border border-[#dc3545] p-8 max-w-lg w-full">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-8 h-8 text-[#dc3545]" />
              <h1 className="text-2xl font-bold text-white">Something went wrong</h1>
            </div>

            <p className="text-[#b0b0b0] mb-4">
              An unexpected error occurred. Please try reloading the page.
            </p>

            {this.state.error && (
              <details className="mb-6">
                <summary className="cursor-pointer text-sm text-[#808080] hover:text-white transition-colors mb-2">
                  Error details
                </summary>
                <div className="bg-[#252525] rounded p-3 text-xs text-[#dc3545] font-mono overflow-auto">
                  <p className="mb-2 font-semibold">{this.state.error.message}</p>
                  {this.state.error.stack && (
                    <pre className="text-[#808080] whitespace-pre-wrap">
                      {this.state.error.stack}
                    </pre>
                  )}
                </div>
              </details>
            )}

            <button
              onClick={() => window.location.reload()}
              className="w-full px-6 py-3 bg-[#0078d4] text-white rounded-lg hover:bg-[#005a9e] transition-colors font-medium"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
