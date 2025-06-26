
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface UseSecureDataFetchOptions<T> {
  fetchFn: () => Promise<T>;
  requiresAuth?: boolean;
  requiredRole?: 'admin' | 'moderator' | 'user';
  onError?: (error: any) => void;
  enableRetry?: boolean;
}

export const useSecureDataFetch = <T>({
  fetchFn,
  requiresAuth = true,
  onError,
  enableRetry = true
}: UseSecureDataFetchOptions<T>) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    if (requiresAuth && !user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('Fetching data with secure fetch...');
      
      const result = await fetchFn();
      setData(result);
      console.log('Data fetched successfully');
    } catch (err: any) {
      console.error('Secure fetch error:', err);
      setError(err);
      
      if (onError) {
        onError(err);
      }

      // Handle specific error types
      const isRLSError = err.message?.includes('row-level security') ||
                        err.message?.includes('permission denied') ||
                        err.code === 'PGRST116' || 
                        err.code === '42501';

      if (isRLSError) {
        console.warn('RLS policy blocked data access');
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch data. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  }, [fetchFn, requiresAuth, user, onError, toast]);

  const retry = useCallback(() => {
    if (enableRetry) {
      fetchData();
    }
  }, [fetchData, enableRetry]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, retry, refetch: fetchData };
};
