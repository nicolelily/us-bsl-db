import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface UserContributions {
  submission_count: number;
  approved_count: number;
  rejected_count: number;
  reputation_score: number;
  last_contribution?: string;
}

export const useUserContributions = () => {
  const { user } = useAuth();
  const [contributions, setContributions] = useState<UserContributions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setContributions(null);
      setLoading(false);
      return;
    }

    const fetchContributions = async () => {
      try {
        setLoading(true);
        setError(null);

        // Try to get existing user contributions record
        const { data: existingContributions, error: fetchError } = await supabase
          .from('user_contributions')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (fetchError && fetchError.code !== 'PGRST116') {
          throw fetchError;
        }

        if (existingContributions) {
          setContributions(existingContributions);
        } else {
          // Create initial contributions record if it doesn't exist
          const { data: newContributions, error: createError } = await supabase
            .from('user_contributions')
            .insert({
              user_id: user.id,
              submission_count: 0,
              approved_count: 0,
              rejected_count: 0,
              reputation_score: 0
            })
            .select()
            .single();

          if (createError) {
            throw createError;
          }

          setContributions(newContributions);
        }
      } catch (err) {
        console.error('Error fetching user contributions:', err);
        setError(err instanceof Error ? err.message : 'Failed to load contributions');
        // Set default values on error
        setContributions({
          submission_count: 0,
          approved_count: 0,
          rejected_count: 0,
          reputation_score: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchContributions();
  }, [user]);

  const refreshContributions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_contributions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setContributions(data);
    } catch (err) {
      console.error('Error refreshing contributions:', err);
    }
  };

  return {
    contributions,
    loading,
    error,
    refreshContributions
  };
};