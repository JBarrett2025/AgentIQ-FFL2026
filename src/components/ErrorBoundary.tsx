import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

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
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to the console for debugging purposes.
    // In a production environment, you could send this to an error reporting service.
    console.error("Uncaught error in React component:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      // Render a user-friendly fallback UI when an error is caught.
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 text-red-800 p-4" role="alert">
          <h1 className="text-2xl font-bold mb-4">Something went wrong.</h1>
          <p className="mb-2">The application has encountered an error and cannot continue.</p>
          <p className="mb-6">Please try refreshing the page. We have logged the error for our developers.</p>
          {this.state.error && (
            <pre className="bg-red-100 p-4 rounded-md text-sm w-full max-w-2xl overflow-x-auto">
              {this.state.error.toString()}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;