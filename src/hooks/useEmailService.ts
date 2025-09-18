import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface SendEmailRequest {
  to: string;
  subject?: string;
  template: 'welcome' | 'newsletter' | 'submission_update';
  data?: Record<string, any>;
  userId?: string;
}

export interface UseEmailServiceResult {
  sendEmail: (request: SendEmailRequest) => Promise<{ success: boolean; messageId?: string }>;
  sendWelcomeEmail: (userEmail: string, userName?: string, newsletterOptIn?: boolean) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export function useEmailService(): UseEmailServiceResult {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendEmail = async (request: SendEmailRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('send-email', {
        body: {
          to: request.to,
          subject: request.subject,
          template: request.template,
          data: request.data || {},
          userId: request.userId || user?.id
        }
      });

      if (functionError) {
        throw new Error(functionError.message || 'Failed to send email');
      }

      if (!data.success) {
        throw new Error(data.error || 'Email sending failed');
      }

      return {
        success: true,
        messageId: data.messageId
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send email';
      setError(errorMessage);
      console.error('Email service error:', err);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const sendWelcomeEmail = async (
    userEmail: string, 
    userName?: string, 
    newsletterOptIn: boolean = false
  ) => {
    if (!user) {
      throw new Error('User must be authenticated to send welcome email');
    }

    try {
      // Check if welcome email was already sent
      const { data: preferences } = await supabase
        .from('user_preferences')
        .select('welcome_email_sent')
        .eq('user_id', user.id)
        .single();

      if (preferences?.welcome_email_sent) {
        console.log('Welcome email already sent to user');
        return;
      }

      // Send the welcome email
      await sendEmail({
        to: userEmail,
        template: 'welcome',
        data: {
          userName: userName || userEmail.split('@')[0],
          userEmail,
          newsletterOptIn
        },
        userId: user.id
      });

      // Mark welcome email as sent
      await supabase.rpc('mark_welcome_email_sent', {
        p_user_id: user.id
      });

      console.log('Welcome email sent successfully');
    } catch (err) {
      console.error('Failed to send welcome email:', err);
      throw err;
    }
  };

  return {
    sendEmail,
    sendWelcomeEmail,
    isLoading,
    error
  };
}