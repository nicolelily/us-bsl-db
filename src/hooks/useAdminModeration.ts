import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { SubmissionWithDetails, SubmissionStatus } from '@/types/submissions';

export interface ModerationSubmission extends SubmissionWithDetails {
  confidence_score?: number;
  priority_score?: number;
  days_pending: number;
  submitter_name?: string;
  submitter_reputation?: number;
}

export interface ModerationStats {
  total_pending: number;
  total_reviewed_today: number;
  avg_review_time_hours: number;
  high_priority_count: number;
}

export interface UseModerationResult {
  submissions: ModerationSubmission[];
  stats: ModerationStats;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  approveSubmission: (submissionId: string, feedback?: string) => Promise<void>;
  rejectSubmission: (submissionId: string, feedback: string) => Promise<void>;
  bulkApprove: (submissionIds: string[], feedback?: string) => Promise<void>;
  bulkReject: (submissionIds: string[], feedback: string) => Promise<void>;
  requestChanges: (submissionId: string, feedback: string) => Promise<void>;
}

export function useAdminModeration(): UseModerationResult {
  const { user } = useAuth();
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<ModerationSubmission[]>([]);
  const [stats, setStats] = useState<ModerationStats>({
    total_pending: 0,
    total_reviewed_today: 0,
    avg_review_time_hours: 0,
    high_priority_count: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubmissions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch all pending submissions with related data
      const { data: submissionsData, error: submissionsError } = await supabase
        .from('submissions' as any)
        .select(`
          id,
          user_id,
          type,
          status,
          original_record_id,
          submitted_data,
          admin_feedback,
          reviewed_by,
          reviewed_at,
          created_at,
          updated_at,
          user_profile:profiles!submissions_user_id_fkey (
            id,
            full_name,
            email
          ),
          reviewer_profile:profiles!submissions_reviewed_by_fkey (
            id,
            full_name,
            email
          ),
          submission_documents (
            id,
            file_name,
            file_url,
            file_type,
            file_size,
            uploaded_at
          )
        `)
        .in('status', ['pending', 'needs_changes'])
        .order('created_at', { ascending: true });

      if (submissionsError) {
        throw submissionsError;
      }

      // Get user contributions for reputation scores
      const userIds = submissionsData?.map(s => s.user_id).filter(Boolean) || [];
      const { data: contributionsData } = await supabase
        .from('user_contributions')
        .select('user_id, reputation_score, approved_count, rejected_count')
        .in('user_id', userIds);

      const contributionsMap = new Map(
        contributionsData?.map(c => [c.user_id, c]) || []
      );

      // Format submissions with calculated fields
      const formattedSubmissions: ModerationSubmission[] = (submissionsData || []).map((submission: any) => {
        const submittedData = submission.submitted_data || {};
        const userContrib = contributionsMap.get(submission.user_id);
        const daysPending = Math.floor(
          (Date.now() - new Date(submission.created_at).getTime()) / (1000 * 60 * 60 * 24)
        );

        // Calculate priority score (higher = more urgent)
        let priorityScore = 0;
        priorityScore += Math.min(daysPending * 10, 50); // Days pending (max 50 points)
        priorityScore += (userContrib?.reputation_score || 0) * 0.1; // User reputation
        if (submittedData.banned_breeds?.length > 3) priorityScore += 10; // Complex legislation
        if (submittedData.ordinance_url) priorityScore += 5; // Has source URL
        if (submission.submission_documents?.length > 0) priorityScore += 5; // Has documents

        return {
          ...submission,
          submitted_data: submittedData,
          documents: submission.submission_documents || [],
          user_profile: submission.user_profile,
          reviewer_profile: submission.reviewer_profile,
          days_pending: daysPending,
          priority_score: priorityScore,
          submitter_name: submission.user_profile?.full_name || 'Anonymous',
          submitter_reputation: userContrib?.reputation_score || 0,
        };
      });

      // Sort by priority score descending
      formattedSubmissions.sort((a, b) => (b.priority_score || 0) - (a.priority_score || 0));

      setSubmissions(formattedSubmissions);

      // Calculate stats
      const pendingCount = formattedSubmissions.filter(s => s.status === 'pending').length;
      const highPriorityCount = formattedSubmissions.filter(s => (s.priority_score || 0) > 30).length;

      // Get today's review stats
      const today = new Date().toISOString().split('T')[0];
      const { data: reviewStats } = await supabase
        .from('submissions' as any)
        .select('reviewed_at')
        .in('status', ['approved', 'rejected'])
        .gte('reviewed_at', `${today}T00:00:00`)
        .lt('reviewed_at', `${today}T23:59:59`);

      setStats({
        total_pending: pendingCount,
        total_reviewed_today: reviewStats?.length || 0,
        avg_review_time_hours: 0, // TODO: Calculate from historical data
        high_priority_count: highPriorityCount,
      });

    } catch (err) {
      console.error('Error fetching moderation data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch submissions');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const approveSubmission = async (submissionId: string, feedback?: string) => {
    try {
      console.log('Approving submission:', { submissionId, userId: user?.id, feedback });
      
      // First, let's get the submission data to debug what we're working with
      const { data: submissionData, error: fetchError } = await supabase
        .from('submissions' as any)
        .select('*')
        .eq('id', submissionId)
        .single();
      
      console.log('Submission data before approval:', { submissionData, fetchError });
      
      if (fetchError) {
        throw fetchError;
      }
      
      // Call the approve_submission function (note: it only takes submission_id and admin_user_id)
      const { data, error } = await supabase.rpc('approve_submission', {
        submission_id: submissionId,
        admin_user_id: user?.id
      });

      console.log('Approve submission result:', { data, error });

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      // If there's feedback, we need to update it separately since the function doesn't take feedback
      if (feedback) {
        const { error: updateError } = await supabase
          .from('submissions' as any)
          .update({ admin_feedback: feedback })
          .eq('id', submissionId);
        
        if (updateError) {
          console.warn('Failed to update feedback:', updateError);
        }
      }

      toast({
        title: 'Submission Approved',
        description: 'The submission has been approved and added to the database.',
        variant: 'default',
      });

      await refetch();
    } catch (err) {
      console.error('Approval error:', err);
      toast({
        title: 'Approval Failed',
        description: err instanceof Error ? err.message : 'Failed to approve submission',
        variant: 'destructive',
      });
    }
  };

  const rejectSubmission = async (submissionId: string, feedback: string) => {
    try {
      const { error } = await supabase.rpc('reject_submission', {
        submission_id: submissionId,
        admin_user_id: user?.id,
        admin_feedback: feedback
      });

      if (error) throw error;

      toast({
        title: 'Submission Rejected',
        description: 'The submission has been rejected with feedback.',
        variant: 'default',
      });

      await refetch();
    } catch (err) {
      toast({
        title: 'Rejection Failed',
        description: err instanceof Error ? err.message : 'Failed to reject submission',
        variant: 'destructive',
      });
    }
  };

  const requestChanges = async (submissionId: string, feedback: string) => {
    try {
      const { error } = await supabase
        .from('submissions' as any)
        .update({
          status: 'needs_changes',
          admin_feedback: feedback,
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', submissionId);

      if (error) throw error;

      toast({
        title: 'Changes Requested',
        description: 'The submitter will be notified about the requested changes.',
        variant: 'default',
      });

      await refetch();
    } catch (err) {
      toast({
        title: 'Request Failed',
        description: err instanceof Error ? err.message : 'Failed to request changes',
        variant: 'destructive',
      });
    }
  };

  const bulkApprove = async (submissionIds: string[], feedback?: string) => {
    try {
      const promises = submissionIds.map(id => 
        supabase.rpc('approve_submission', {
          submission_id: id,
          admin_user_id: user?.id
        })
      );

      const results = await Promise.allSettled(promises);
      const failures = results.filter(r => r.status === 'rejected').length;

      if (failures > 0) {
        toast({
          title: 'Partial Success',
          description: `${submissionIds.length - failures} submissions approved, ${failures} failed.`,
          variant: 'default',
        });
      } else {
        toast({
          title: 'Bulk Approval Complete',
          description: `${submissionIds.length} submissions approved successfully.`,
          variant: 'default',
        });
      }

      await refetch();
    } catch (err) {
      toast({
        title: 'Bulk Approval Failed',
        description: err instanceof Error ? err.message : 'Failed to approve submissions',
        variant: 'destructive',
      });
    }
  };

  const bulkReject = async (submissionIds: string[], feedback: string) => {
    try {
      const promises = submissionIds.map(id => 
        supabase.rpc('reject_submission', {
          submission_id: id,
          admin_user_id: user?.id,
          admin_feedback: feedback
        })
      );

      const results = await Promise.allSettled(promises);
      const failures = results.filter(r => r.status === 'rejected').length;

      if (failures > 0) {
        toast({
          title: 'Partial Success',
          description: `${submissionIds.length - failures} submissions rejected, ${failures} failed.`,
          variant: 'default',
        });
      } else {
        toast({
          title: 'Bulk Rejection Complete',
          description: `${submissionIds.length} submissions rejected successfully.`,
          variant: 'default',
        });
      }

      await refetch();
    } catch (err) {
      toast({
        title: 'Bulk Rejection Failed',
        description: err instanceof Error ? err.message : 'Failed to reject submissions',
        variant: 'destructive',
      });
    }
  };

  const refetch = useCallback(async () => {
    await fetchSubmissions();
  }, [fetchSubmissions]);

  useEffect(() => {
    if (user) {
      fetchSubmissions();
    }
  }, [user, fetchSubmissions]);

  return {
    submissions,
    stats,
    isLoading,
    error,
    refetch,
    approveSubmission,
    rejectSubmission,
    bulkApprove,
    bulkReject,
    requestChanges,
  };
}