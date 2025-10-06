import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  updated_at: string;
}

export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        // If profile doesn't exist, try to create one
        if (error.code === 'PGRST116') {
          try {
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert({
                id: user.id,
                email: user.email || '',
                full_name: user.user_metadata?.full_name || null
              })
              .select()
              .single();

            if (createError) {
              console.error('Error creating profile:', createError);
              setError(`Failed to create profile: ${createError.message}`);
            } else {
              setProfile(newProfile);
              setError(null);
            }
          } catch (createErr) {
            console.error('Error creating profile:', createErr);
            setError('Failed to create user profile');
          }
        } else {
          console.error('Error fetching profile:', error);
          setError(error.message);
        }
      } else {
        setProfile(data);
        setError(null);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: { full_name?: string; email?: string }) => {
    if (!user) {
      throw new Error('User must be authenticated to update profile');
    }

    try {
      // Update the profiles table
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Update local state
      setProfile(data);

      // Also update auth metadata if full_name is being updated
      if (updates.full_name !== undefined) {
        await supabase.auth.updateUser({
          data: {
            full_name: updates.full_name
          }
        });
      }

      return data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  return {
    profile,
    loading,
    error,
    updateProfile,
    refetch: fetchProfile
  };
};