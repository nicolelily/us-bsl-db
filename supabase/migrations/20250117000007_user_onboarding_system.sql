-- User Onboarding and Communication System
-- This migration adds tables and functions for welcome emails and newsletter management

-- Create enum for email types
CREATE TYPE email_type AS ENUM (
    'welcome', 
    'newsletter', 
    'submission_update', 
    'admin_notification',
    'newsletter_confirmation'
);

-- Create enum for email status
CREATE TYPE email_status AS ENUM ('sent', 'failed', 'bounced', 'delivered', 'opened');

-- Create user_preferences table
CREATE TABLE public.user_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    newsletter_subscribed BOOLEAN DEFAULT false NOT NULL,
    email_notifications BOOLEAN DEFAULT true NOT NULL,
    marketing_emails BOOLEAN DEFAULT false NOT NULL,
    welcome_email_sent BOOLEAN DEFAULT false NOT NULL,
    newsletter_confirmed BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create email_logs table for tracking email delivery
CREATE TABLE public.email_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    email_type email_type NOT NULL,
    subject TEXT NOT NULL,
    recipient_email TEXT NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    status email_status DEFAULT 'sent' NOT NULL,
    provider_id TEXT, -- External email service ID
    error_message TEXT,
    opened_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE
);

-- Create newsletter_campaigns table for managing newsletter sends
CREATE TABLE public.newsletter_campaigns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    html_content TEXT,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    recipient_count INTEGER DEFAULT 0,
    delivered_count INTEGER DEFAULT 0,
    opened_count INTEGER DEFAULT 0,
    clicked_count INTEGER DEFAULT 0,
    created_by UUID NOT NULL REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_user_preferences_user_id ON public.user_preferences(user_id);
CREATE INDEX idx_user_preferences_newsletter ON public.user_preferences(newsletter_subscribed) WHERE newsletter_subscribed = true;
CREATE INDEX idx_email_logs_user_id ON public.email_logs(user_id);
CREATE INDEX idx_email_logs_type ON public.email_logs(email_type);
CREATE INDEX idx_email_logs_status ON public.email_logs(status);
CREATE INDEX idx_email_logs_sent_at ON public.email_logs(sent_at DESC);
CREATE INDEX idx_newsletter_campaigns_sent_at ON public.newsletter_campaigns(sent_at DESC);

-- Add updated_at triggers
CREATE TRIGGER handle_user_preferences_updated_at
    BEFORE UPDATE ON public.user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_newsletter_campaigns_updated_at
    BEFORE UPDATE ON public.newsletter_campaigns
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Function to initialize user preferences when profile is created
CREATE OR REPLACE FUNCTION public.initialize_user_preferences()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_preferences (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user_preferences record when profile is created
CREATE TRIGGER on_profile_created_initialize_preferences
    AFTER INSERT ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.initialize_user_preferences();

-- Function to log email sends
CREATE OR REPLACE FUNCTION public.log_email_send(
    p_user_id UUID,
    p_email_type email_type,
    p_subject TEXT,
    p_recipient_email TEXT,
    p_provider_id TEXT DEFAULT NULL,
    p_status email_status DEFAULT 'sent'
)
RETURNS UUID AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO public.email_logs (
        user_id,
        email_type,
        subject,
        recipient_email,
        provider_id,
        status
    )
    VALUES (
        p_user_id,
        p_email_type,
        p_subject,
        p_recipient_email,
        p_provider_id,
        p_status
    )
    RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update newsletter subscription
CREATE OR REPLACE FUNCTION public.update_newsletter_subscription(
    p_user_id UUID,
    p_subscribed BOOLEAN,
    p_confirmed BOOLEAN DEFAULT false
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE public.user_preferences
    SET 
        newsletter_subscribed = p_subscribed,
        newsletter_confirmed = CASE 
            WHEN p_subscribed THEN p_confirmed 
            ELSE false 
        END,
        updated_at = NOW()
    WHERE user_id = p_user_id;
    
    IF NOT FOUND THEN
        INSERT INTO public.user_preferences (
            user_id, 
            newsletter_subscribed, 
            newsletter_confirmed
        )
        VALUES (p_user_id, p_subscribed, p_confirmed);
    END IF;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark welcome email as sent
CREATE OR REPLACE FUNCTION public.mark_welcome_email_sent(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE public.user_preferences
    SET 
        welcome_email_sent = true,
        updated_at = NOW()
    WHERE user_id = p_user_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get newsletter subscribers
CREATE OR REPLACE FUNCTION public.get_newsletter_subscribers()
RETURNS TABLE (
    user_id UUID,
    email TEXT,
    display_name TEXT,
    subscribed_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id as user_id,
        p.email,
        COALESCE(p.display_name, p.email) as display_name,
        up.created_at as subscribed_at
    FROM public.profiles p
    JOIN public.user_preferences up ON p.id = up.user_id
    WHERE up.newsletter_subscribed = true 
    AND up.newsletter_confirmed = true
    AND p.email IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments for documentation
COMMENT ON TABLE public.user_preferences IS 'User communication preferences and onboarding tracking';
COMMENT ON TABLE public.email_logs IS 'Log of all emails sent to users with delivery tracking';
COMMENT ON TABLE public.newsletter_campaigns IS 'Newsletter campaigns and their performance metrics';

COMMENT ON COLUMN public.user_preferences.newsletter_subscribed IS 'User opted into newsletter';
COMMENT ON COLUMN public.user_preferences.newsletter_confirmed IS 'User confirmed newsletter subscription via email';
COMMENT ON COLUMN public.user_preferences.welcome_email_sent IS 'Welcome email has been sent to this user';
COMMENT ON COLUMN public.email_logs.provider_id IS 'External email service provider message ID';
COMMENT ON COLUMN public.email_logs.opened_at IS 'Timestamp when email was opened (if tracked)';
COMMENT ON COLUMN public.email_logs.clicked_at IS 'Timestamp when email link was clicked (if tracked)';