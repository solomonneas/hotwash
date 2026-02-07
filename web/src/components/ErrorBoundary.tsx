/**
 * ErrorBoundary Component
 *
 * React class component that catches JavaScript errors in its child component tree,
 * logs them, and displays a fallback UI instead of crashing the whole app.
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Optional fallback UI to render on error */
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          style={{
            padding: '40px',
            textAlign: 'center',
            backgroundColor: '#0d1117',
            color: '#c9d1d9',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          }}
        >
          <h1 style={{ color: '#f85149', marginBottom: '16px', fontSize: '24px' }}>
            Something went wrong
          </h1>
          <p style={{ color: '#8b949e', marginBottom: '24px', maxWidth: '500px' }}>
            An unexpected error occurred in the application. You can try reloading the page
            or click the button below to reset.
          </p>
          {this.state.error && (
            <pre
              style={{
                backgroundColor: '#161b22',
                border: '1px solid #30363d',
                borderRadius: '8px',
                padding: '16px',
                maxWidth: '600px',
                overflow: 'auto',
                fontSize: '13px',
                color: '#ffa657',
                textAlign: 'left',
                marginBottom: '24px',
              }}
            >
              {this.state.error.toString()}
            </pre>
          )}
          <button
            onClick={this.handleReset}
            style={{
              backgroundColor: '#238636',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '10px 24px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
