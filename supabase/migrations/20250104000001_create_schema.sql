-- Complete schema recreation for BSL Database

-- Create all enum types first
CREATE TYPE IF NOT EXISTS app_role AS ENUM ('admin', 'moderator', 'user');
CREATE TYPE IF NOT EXISTS submission_type AS ENUM ('new_legislation', 'update_existing');
CREATE TYPE IF NOT EXISTS submission_status AS ENUM ('pending', 'approved', 'rejected', 'needs_changes');
CREATE TYPE IF NOT EXISTS legislation_type AS ENUM ('ban', 'restriction', 'repealed');
CREATE TYPE IF NOT EXISTS email_type AS ENUM (
    'welcome', 
    'newsletter', 
    'submission_update', 
    'admin_notification',
    'newsletter_confirmation'
);
CREATE TYPE IF NOT EXISTS email_status AS ENUM ('sent', 'failed', 'bounced', 'delivered', 'opened');
CREATE TYPE IF NOT EXISTS municipality_type AS ENUM ('city', 'county');

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. PROFILES TABLE (User profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 2. USER_ROLES TABLE (User permission system)
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role app_role DEFAULT 'user' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 3. BREED_LEGISLATION TABLE (Main legislation data)
CREATE TABLE IF NOT EXISTS public.breed_legislation (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    municipality TEXT NOT NULL,
    state TEXT NOT NULL,
    municipality_type municipality_type,
    banned_breeds JSONB,
    ordinance TEXT,
    legislation_type legislation_type DEFAULT 'ban' NOT NULL,
    population INTEGER,
    lat NUMERIC,
    lng NUMERIC,
    verification_date DATE,
    ordinance_url TEXT,
    repeal_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 4. SUBMISSIONS TABLE (User-contributed legislation data)
CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type submission_type NOT NULL,
    status submission_status DEFAULT 'pending' NOT NULL,
    original_record_id UUID REFERENCES public.breed_legislation(id) ON DELETE SET NULL,
    submitted_data JSONB NOT NULL,
    admin_feedback TEXT,
    reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 5. SUBMISSION_DOCUMENTS TABLE (File attachments for submissions)
CREATE TABLE IF NOT EXISTS public.submission_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 6. USER_CONTRIBUTIONS TABLE (User statistics tracking)
CREATE TABLE IF NOT EXISTS public.user_contributions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    submission_count INTEGER DEFAULT 0 NOT NULL,
    approved_count INTEGER DEFAULT 0 NOT NULL,
    rejected_count INTEGER DEFAULT 0 NOT NULL,
    reputation_score INTEGER DEFAULT 0 NOT NULL,
    last_contribution TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 7. USER_PREFERENCES TABLE (User communication preferences)
CREATE TABLE IF NOT EXISTS public.user_preferences (
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

-- 8. EMAIL_LOGS TABLE (Email delivery tracking)
CREATE TABLE IF NOT EXISTS public.email_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    email_type email_type NOT NULL,
    subject TEXT NOT NULL,
    recipient_email TEXT NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    status email_status DEFAULT 'sent' NOT NULL,
    provider_id TEXT,
    error_message TEXT,
    opened_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE
);

-- 9. NEWSLETTER_CAMPAIGNS TABLE (Newsletter management)
CREATE TABLE IF NOT EXISTS public.newsletter_campaigns (
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

-- 10. CONTACT_SUBMISSIONS TABLE (Contact form submissions)
CREATE TABLE IF NOT EXISTS public.contact_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 11. AUDIT_LOGS TABLE (System audit trail)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id TEXT,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create all indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

CREATE INDEX IF NOT EXISTS idx_breed_legislation_state ON public.breed_legislation(state);
CREATE INDEX IF NOT EXISTS idx_breed_legislation_type ON public.breed_legislation(legislation_type);
CREATE INDEX IF NOT EXISTS idx_breed_legislation_repeal_date ON public.breed_legislation(repeal_date);
CREATE INDEX IF NOT EXISTS idx_breed_legislation_municipality ON public.breed_legislation(municipality);

CREATE INDEX IF NOT EXISTS idx_submissions_user_id ON public.submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON public.submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_type ON public.submissions(type);
CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON public.submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_submissions_original_record ON public.submissions(original_record_id);

CREATE INDEX IF NOT EXISTS idx_submission_documents_submission_id ON public.submission_documents(submission_id);

CREATE INDEX IF NOT EXISTS idx_user_contributions_user_id ON public.user_contributions(user_id);

CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_newsletter ON public.user_preferences(newsletter_subscribed) WHERE newsletter_subscribed = true;

CREATE INDEX IF NOT EXISTS idx_email_logs_user_id ON public.email_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_type ON public.email_logs(email_type);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON public.email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON public.email_logs(sent_at DESC);

CREATE INDEX IF NOT EXISTS idx_newsletter_campaigns_sent_at ON public.newsletter_campaigns(sent_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON public.audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- Add updated_at triggers for all tables that need them
CREATE TRIGGER IF NOT EXISTS handle_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER IF NOT EXISTS handle_user_roles_updated_at
    BEFORE UPDATE ON public.user_roles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER IF NOT EXISTS handle_breed_legislation_updated_at
    BEFORE UPDATE ON public.breed_legislation
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER IF NOT EXISTS handle_submissions_updated_at
    BEFORE UPDATE ON public.submissions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER IF NOT EXISTS handle_user_contributions_updated_at
    BEFORE UPDATE ON public.user_contributions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER IF NOT EXISTS handle_user_preferences_updated_at
    BEFORE UPDATE ON public.user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER IF NOT EXISTS handle_newsletter_campaigns_updated_at
    BEFORE UPDATE ON public.newsletter_campaigns
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER IF NOT EXISTS handle_contact_submissions_updated_at
    BEFORE UPDATE ON public.contact_submissions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Add table comments for documentation
COMMENT ON TABLE public.profiles IS 'User profile information linked to auth.users';
COMMENT ON TABLE public.user_roles IS 'User role assignments for permission system';
COMMENT ON TABLE public.breed_legislation IS 'Main breed-specific legislation database';
COMMENT ON TABLE public.submissions IS 'User-submitted breed legislation records and updates';
COMMENT ON TABLE public.submission_documents IS 'File attachments for submissions (ordinance PDFs, etc.)';
COMMENT ON TABLE public.user_contributions IS 'User contribution statistics and reputation tracking';
COMMENT ON TABLE public.user_preferences IS 'User communication preferences and onboarding tracking';
COMMENT ON TABLE public.email_logs IS 'Log of all emails sent to users with delivery tracking';
COMMENT ON TABLE public.newsletter_campaigns IS 'Newsletter campaigns and their performance metrics';
COMMENT ON TABLE public.contact_submissions IS 'Contact form submissions from website';
COMMENT ON TABLE public.audit_logs IS 'System audit trail for all important actions';

-- Add column comments for key fields
COMMENT ON COLUMN public.breed_legislation.legislation_type IS 'Type of breed-specific legislation: ban (breed prohibition), restriction (additional requirements), or repealed';
COMMENT ON COLUMN public.breed_legislation.repeal_date IS 'Date when the legislation was repealed (NULL if still active)';
COMMENT ON COLUMN public.submissions.submitted_data IS 'JSON containing the legislation data (municipality, state, banned_breeds, etc.)';
COMMENT ON COLUMN public.submissions.original_record_id IS 'For updates: references the existing breed_legislation record being updated';
COMMENT ON COLUMN public.user_contributions.reputation_score IS 'Calculated score based on submission quality and approval rate';
COMMENT ON COLUMN public.user_preferences.newsletter_subscribed IS 'User opted into newsletter';
COMMENT ON COLUMN public.user_preferences.newsletter_confirmed IS 'User confirmed newsletter subscription via email';
COMMENT ON COLUMN public.user_preferences.welcome_email_sent IS 'Welcome email has been sent to this user';
COMMENT ON COLUMN public.email_logs.provider_id IS 'External email service provider message ID';
COMMENT ON COLUMN public.email_logs.opened_at IS 'Timestamp when email was opened (if tracked)';
COMMENT ON COLUMN public.email_logs.clicked_at IS 'Timestamp when email link was clicked (if tracked)';