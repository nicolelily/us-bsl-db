import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface UserPreferences {
  id: string;
  userId: string;
  newsletterSubscribed: boolean;
  emailNotifications: boolean;
  marketingEmails: boolean;
  welcomeEmailSent: boolean;
  newsletterConfirmed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UseUserPreferencesResult {
  preferences: UserPreferences | null;
  isLoading: boolean;
  error: string | null;
  updatePreferences: (updates: Partial<UserPreferences>) => Promise<void>;
  subscribeToNewsletter: (subscribe: boolean) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useUserPreferences(): UseUserPreferencesResult {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPreferences = async () => {
    if (!user) {
      setPreferences(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (fetchError) {
        // If no preferences exist, create default ones
        if (fetchError.code === 'PGRST116') {
          const { data: newPrefs, error: createError } = await supabase
            .from('user_preferences')
            .insert({
              user_id: user.id,
              newsletter_subscribed: false,
              email_notifications: true,
              marketing_emails: false,
              welcome_email_sent: false,
              newsletter_confirmed: false
            })
            .select()
            .single();

          if (createError) {
            throw createError;
          }

          setPreferences({
            id: newPrefs.id,
            userId: newPrefs.user_id,
            newsletterSubscribed: newPrefs.newsletter_subscribed,
            emailNotifications: newPrefs.email_notifications,
            marketingEmails: newPrefs.marketing_emails,
            welcomeEmailSent: newPrefs.welcome_email_sent,
            newsletterConfirmed: newPrefs.newsletter_confirmed,
            createdAt: newPrefs.created_at,
            updatedAt: newPrefs.updated_at
          });
        } else {
          throw fetchError;
        }
      } else {
        setPreferences({
          id: data.id,
          userId: data.user_id,
          newsletterSubscribed: data.newsletter_subscribed,
          emailNotifications: data.email_notifications,
          marketingEmails: data.marketing_emails,
          welcomeEmailSent: data.welcome_email_sent,
          newsletterConfirmed: data.newsletter_confirmed,
          createdAt: data.created_at,
          updatedAt: data.updated_at
        });
      }
    } catch (err) {
      console.error('Error fetching user preferences:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch preferences');
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreferences = async (updates: Partial<UserPreferences>) => {
    if (!user || !preferences) {
      throw new Error('No user or preferences available');
    }

    try {
      setError(null);

      const { error: updateError } = await supabase
        .from('user_preferences')
        .update({
          newsletter_subscribed: updates.newsletterSubscribed,
          email_notifications: updates.emailNotifications,
          marketing_emails: updates.marketingEmails,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (updateError) {
        throw updateError;
      }

      // Update local state
      setPreferences(prev => prev ? { ...prev, ...updates } : null);
    } catch (err) {
      console.error('Error updating preferences:', err);
      setError(err instanceof Error ? err.message : 'Failed to update preferences');
      throw err;
    }
  };

  const subscribeToNewsletter = async (subscribe: boolean) => {
    if (!user) {
      throw new Error('No user available');
    }

    try {
      setError(null);

      const { error: updateError } = await supabase.rpc('update_newsletter_subscription', {
        p_user_id: user.id,
        p_subscribed: subscribe,
        p_confirmed: subscribe // Auto-confirm for now, could require email confirmation later
      });

      if (updateError) {
        throw updateError;
      }

      // Refetch preferences to get updated state
      await fetchPreferences();
    } catch (err) {
      console.error('Error updating newsletter subscription:', err);
      setError(err instanceof Error ? err.message : 'Failed to update newsletter subscription');
      throw err;
    }
  };

  useEffect(() => {
    fetchPreferences();
  }, [user]);

  return {
    preferences,
    isLoading,
    error,
    updatePreferences,
    subscribeToNewsletter,
    refetch: fetchPreferences
  };
}