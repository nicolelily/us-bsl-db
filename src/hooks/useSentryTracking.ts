import * as Sentry from '@sentry/react';

/**
 * Custom hook for tracking errors and events in Sentry
 */
export const useSentryTracking = () => {
  /**
   * Capture an exception with additional context
   */
  const captureException = (
    error: Error,
    context?: Record<string, any>,
    level: 'error' | 'warning' | 'info' = 'error'
  ) => {
    Sentry.captureException(error, {
      level,
      extra: context,
    });
  };

  /**
   * Capture a custom message
   */
  const captureMessage = (
    message: string,
    context?: Record<string, any>,
    level: 'error' | 'warning' | 'info' = 'info'
  ) => {
    Sentry.captureMessage(message, {
      level,
      extra: context,
    });
  };

  /**
   * Track a custom event (for analytics)
   */
  const trackEvent = (eventName: string, data?: Record<string, any>) => {
    Sentry.addBreadcrumb({
      category: 'custom-event',
      message: eventName,
      level: 'info',
      data,
    });
  };

  /**
   * Track a user action (for session replay context)
   */
  const trackAction = (action: string, data?: Record<string, any>) => {
    Sentry.addBreadcrumb({
      category: 'user-action',
      message: action,
      level: 'info',
      data,
    });
  };

  /**
   * Start a performance transaction
   */
  const startTransaction = (name: string, op: string = 'custom') => {
    return Sentry.startTransaction({ name, op });
  };

  /**
   * Set custom context for debugging
   */
  const setContext = (key: string, context: Record<string, any>) => {
    Sentry.setContext(key, context);
  };

  /**
   * Add tags for filtering in Sentry
   */
  const setTag = (key: string, value: string) => {
    Sentry.setTag(key, value);
  };

  return {
    captureException,
    captureMessage,
    trackEvent,
    trackAction,
    startTransaction,
    setContext,
    setTag,
  };
};

/**
 * Wrapper for async functions to automatically capture errors
 */
export const withSentryErrorTracking = async <T,>(
  fn: () => Promise<T>,
  errorContext?: Record<string, any>
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    Sentry.captureException(error, {
      extra: errorContext,
    });
    throw error;
  }
};
