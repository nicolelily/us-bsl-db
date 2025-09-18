-- Row Level Security policies for user onboarding system

-- Enable RLS on new tables
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_campaigns ENABLE ROW LEVEL SECURITY;

-- USER_PREFERENCES TABLE POLICIES

-- Users can view and update their own preferences
CREATE POLICY "Users can view own preferences"
ON public.user_preferences
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
ON public.user_preferences
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Admins can view all preferences
CREATE POLICY "Admins can view all preferences"
ON public.user_preferences
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- System can insert preferences (for new user initialization)
CREATE POLICY "System can insert preferences"
ON public.user_preferences
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- EMAIL_LOGS TABLE POLICIES

-- Users can view their own email logs
CREATE POLICY "Users can view own email logs"
ON public.email_logs
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can view all email logs
CREATE POLICY "Admins can view all email logs"
ON public.email_logs
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- System/admins can insert email logs
CREATE POLICY "System can insert email logs"
ON public.email_logs
FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() = user_id OR 
    public.has_role(auth.uid(), 'admin')
);

-- Admins can update email logs (for delivery status updates)
CREATE POLICY "Admins can update email logs"
ON public.email_logs
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- NEWSLETTER_CAMPAIGNS TABLE POLICIES

-- Admins can manage newsletter campaigns
CREATE POLICY "Admins can manage newsletter campaigns"
ON public.newsletter_campaigns
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Users can view published campaigns (for newsletter archive)
CREATE POLICY "Users can view sent campaigns"
ON public.newsletter_campaigns
FOR SELECT
TO authenticated
USING (sent_at IS NOT NULL);

-- Grant execute permissions for new functions
GRANT EXECUTE ON FUNCTION public.log_email_send(UUID, email_type, TEXT, TEXT, TEXT, email_status) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_newsletter_subscription(UUID, BOOLEAN, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_welcome_email_sent(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_newsletter_subscribers() TO authenticated;