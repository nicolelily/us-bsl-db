import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface UserSubmission {
  id: string;
  title: string;
  status: 'pending' | 'approved' | 'rejected' | 'needs_changes';
  submittedAt: string;
  reviewedAt?: string;
  adminFeedback?: string;
  legislationType: string;
  municipality: string;
  state: string;
  breedRestrictions?: string[];
  documentCount: number;
}

export interface UseUserSubmissionsResult {
  submissions: UserSubmission[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  totalCount: number;
  statusCounts: {
    pending: number;
    approved: number;
    rejected: number;
    needs_changes: number;
  };
}

export function useUserSubmissions(): UseUserSubmissionsResult {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<UserSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubmissions = async () => {
    if (!user) {
      setSubmissions([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('submissions')
        .select(`
          id,
          type,
          status,
          created_at,
          reviewed_at,
          admin_feedback,
          submitted_data,
          submission_documents (count)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      const formattedSubmissions: UserSubmission[] = (data || []).map(submission => {
        const submittedData = submission.submitted_data || {};
        const municipality = submittedData.municipality || 'Unknown';
        const state = submittedData.state || 'Unknown';
        const legislationType = submittedData.legislation_type || submission.type || 'new_legislation';
        
        return {
          id: submission.id,
          title: `${legislationType} - ${municipality}, ${state}`,
          status: submission.status,
          submittedAt: submission.created_at,
          reviewedAt: submission.reviewed_at,
          adminFeedback: submission.admin_feedback,
          legislationType: legislationType,
          municipality: municipality,
          state: state,
          breedRestrictions: submittedData.banned_breeds || [],
          documentCount: submission.submission_documents?.[0]?.count || 0
        };
      });

      setSubmissions(formattedSubmissions);
    } catch (err) {
      console.error('Error fetching user submissions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch submissions');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [user]);

  // Calculate status counts
  const statusCounts = submissions.reduce(
    (counts, submission) => {
      counts[submission.status]++;
      return counts;
    },
    { pending: 0, approved: 0, rejected: 0, needs_changes: 0 }
  );

  return {
    submissions,
    isLoading,
    error,
    refetch: fetchSubmissions,
    totalCount: submissions.length,
    statusCounts
  };
}