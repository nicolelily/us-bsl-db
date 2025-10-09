import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useEmailService } from './useEmailService';
import { useUserPreferences } from './useUserPreferences';

export function useWelcomeFlow() {
  const { user } = useAuth();
  const { sendWelcomeEmail } = useEmailService();
  const { preferences, subscribeToNewsletter } = useUserPreferences();
  const [hasTriggeredWelcome, setHasTriggeredWelcome] = useState(false);

  useEffect(() => {
    // Temporarily disabled - custom welcome emails to be implemented later
    // const triggerWelcomeFlow = async () => {
    //   // Only trigger for authenticated users who haven't received welcome email
    //   if (!user || !user.email || hasTriggeredWelcome) {
    //     return;
    //   }

    //   // Wait for preferences to load
    //   if (!preferences) {
    //     return;
    //   }

    //   // Check if welcome email was already sent
    //   if (preferences.welcomeEmailSent) {
    //     return;
    //   }

    //   // Check if user just verified their email (email_confirmed_at exists and is recent)
    //   const emailConfirmedAt = user.email_confirmed_at;
    //   if (!emailConfirmedAt) {
    //     return;
    //   }

    //   // Check if email was confirmed recently (within last 5 minutes)
    //   const confirmedTime = new Date(emailConfirmedAt).getTime();
    //   const now = new Date().getTime();
    //   const fiveMinutesAgo = now - (5 * 60 * 1000);

    //   if (confirmedTime < fiveMinutesAgo) {
    //     return;
    //   }

    //   try {
    //     setHasTriggeredWelcome(true);

    //     // Get user's display name
    //     const displayName = user.user_metadata?.full_name || user.user_metadata?.display_name;

    //     // Check if user opted into newsletter during signup
    //     // This would need to be stored somewhere during signup - for now we'll default to false
    //     const newsletterOptIn = false;

    //     // Send welcome email
    //     await sendWelcomeEmail(user.email, displayName, newsletterOptIn);

    //     console.log('Welcome email sent successfully');
    //   } catch (error) {
    //     console.error('Failed to send welcome email:', error);
    //     setHasTriggeredWelcome(false); // Allow retry
    //   }
    // };

    // triggerWelcomeFlow();
  }, [user, preferences, sendWelcomeEmail, hasTriggeredWelcome]);

  const manuallyTriggerWelcome = async (newsletterOptIn: boolean = false) => {
    if (!user || !user.email) {
      throw new Error('No authenticated user');
    }

    const displayName = user.user_metadata?.full_name || user.user_metadata?.display_name;
    
    try {
      await sendWelcomeEmail(user.email, displayName, newsletterOptIn);
      
      if (newsletterOptIn) {
        await subscribeToNewsletter(true);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Manual welcome email failed:', error);
      throw error;
    }
  };

  return {
    manuallyTriggerWelcome
  };
}