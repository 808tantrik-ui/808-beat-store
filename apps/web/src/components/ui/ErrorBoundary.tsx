import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="min-h-[260px] flex flex-col items-center justify-center p-6 text-center bg-surface/50 rounded-2xl border border-white/10 m-4">
          <p className="text-sm font-semibold text-white">Something went wrong loading this component.</p>
          {this.state.error?.message && (
            <p className="mt-2 text-xs font-mono text-rose-400 bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-500/20 max-w-lg break-words">
              {this.state.error.message}
            </p>
          )}
          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={() => this.setState({ hasError: false })}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-electric-blue text-white shadow-glow-blue active:scale-95 transition-all cursor-pointer"
            >
              Retry
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-surface-lighter text-slate-200 hover:text-white border border-white/10 transition-all cursor-pointer"
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
