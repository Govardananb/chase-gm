import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', background: '#0f172a', color: 'red', minHeight: '100vh', fontFamily: 'monospace' }}>
          <h2 style={{ marginBottom: '16px' }}>⚠ Application Error</h2>
          <pre style={{ background: '#1e293b', padding: '16px', borderRadius: '8px', whiteSpace: 'pre-wrap' }}>
            {this.state.error?.message}
          </pre>
          <pre style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '16px', whiteSpace: 'pre-wrap' }}>
            {this.state.error?.stack}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}
