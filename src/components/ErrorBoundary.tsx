import * as Sentry from '@sentry/react';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

const ErrorFallback = ({ error, resetError }: ErrorFallbackProps) => {
  useEffect(() => {
    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('Error Boundary caught:', error);
    }
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
          <svg
            className="w-6 h-6 text-red-600"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
          Something went wrong
        </h1>
        <p className="text-center text-gray-600 mb-6">
          We're sorry for the inconvenience. An error occurred while loading this page.
        </p>
        {import.meta.env.DEV && (
          <div className="bg-gray-100 rounded p-4 mb-4 overflow-auto">
            <p className="text-xs font-mono text-red-600 break-words">
              {error.message}
            </p>
          </div>
        )}
        <div className="flex flex-col gap-2">
          <Button onClick={resetError} className="w-full">
            Try Again
          </Button>
          <Button
            variant="outline"
            onClick={() => window.location.href = '/'}
            className="w-full"
          >
            Go to Home Page
          </Button>
        </div>
      </div>
    </div>
  );
};

// Create error boundary with Sentry integration
export const ErrorBoundary = Sentry.withErrorBoundary(
  ({ children }: { children: React.ReactNode }) => <>{children}</>,
  {
    fallback: ErrorFallback,
    showDialog: false,
  }
);
