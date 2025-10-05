-- Drop triggers if they exist, then create triggers (Postgres doesn't support IF NOT EXISTS on CREATE TRIGGER)
DROP TRIGGER IF EXISTS on_auth_user_created_create_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_create_profile
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user_signup();

DROP TRIGGER IF EXISTS on_profile_created_initialize_contributions ON public.profiles;
CREATE TRIGGER on_profile_created_initialize_contributions
    AFTER INSERT ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.initialize_user_contributions();

DROP TRIGGER IF EXISTS on_profile_created_initialize_preferences ON public.profiles;
CREATE TRIGGER on_profile_created_initialize_preferences
    AFTER INSERT ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.initialize_user_preferences();

DROP TRIGGER IF EXISTS on_submission_stats_update ON public.submissions;
CREATE TRIGGER on_submission_stats_update
    AFTER INSERT OR UPDATE ON public.submissions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_user_contribution_stats();

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.breed_legislation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submission_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all user roles" ON public.user_roles;

DROP POLICY IF EXISTS "Public can read breed legislation" ON public.breed_legislation;
DROP POLICY IF EXISTS "Admins can manage breed legislation" ON public.breed_legislation;

DROP POLICY IF EXISTS "Users can view their own submissions" ON public.submissions;
DROP POLICY IF EXISTS "Admins can view all submissions" ON public.submissions;
DROP POLICY IF EXISTS "Users can create submissions" ON public.submissions;
DROP POLICY IF EXISTS "Users can update their own submissions" ON public.submissions;
DROP POLICY IF EXISTS "Admins can manage all submissions" ON public.submissions;

DROP POLICY IF EXISTS "Users can view their own submission documents" ON public.submission_documents;
DROP POLICY IF EXISTS "Admins can view all submission documents" ON public.submission_documents;
DROP POLICY IF EXISTS "Users can manage their own submission documents" ON public.submission_documents;

DROP POLICY IF EXISTS "Users can view their own contributions" ON public.user_contributions;
DROP POLICY IF EXISTS "Admins can view all contributions" ON public.user_contributions;

DROP POLICY IF EXISTS "Users can view their own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can update their own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Admins can view all preferences" ON public.user_preferences;

DROP POLICY IF EXISTS "Admins can view email logs" ON public.email_logs;
DROP POLICY IF EXISTS "System can insert email logs" ON public.email_logs;

DROP POLICY IF EXISTS "Admins can manage newsletter campaigns" ON public.newsletter_campaigns;

DROP POLICY IF EXISTS "Public can create contact submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Admins can view contact submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Admins can manage contact submissions" ON public.contact_submissions;

DROP POLICY IF EXISTS "Admins can view all audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;

-- PROFILES TABLE POLICIES
CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  USING ((SELECT auth.uid()) = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING ((SELECT auth.uid()) = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles
  FOR SELECT
  USING (public.has_role((SELECT auth.uid()), 'admin'));

CREATE POLICY "Admins can update all profiles"
  ON public.profiles
  FOR UPDATE
  USING (public.has_role((SELECT auth.uid()), 'admin'));

-- USER_ROLES TABLE POLICIES
CREATE POLICY "Users can view their own roles"
  ON public.user_roles
  FOR SELECT
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Admins can view all user roles"
  ON public.user_roles
  FOR SELECT
  USING (public.has_role((SELECT auth.uid()), 'admin'));

CREATE POLICY "Admins can manage all user roles"
  ON public.user_roles
  FOR ALL
  USING (public.has_role((SELECT auth.uid()), 'admin'));

-- BREED_LEGISLATION TABLE POLICIES
-- Public can read breed legislation data (this is public information)
CREATE POLICY "Public can read breed legislation"
  ON public.breed_legislation
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- Only admins can manage breed legislation data
CREATE POLICY "Admins can manage breed legislation"
  ON public.breed_legislation
  FOR ALL
  USING (public.has_role((SELECT auth.uid()), 'admin'));

-- SUBMISSIONS TABLE POLICIES
CREATE POLICY "Users can view their own submissions"
  ON public.submissions
  FOR SELECT
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can create submissions"
  ON public.submissions
  FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update their own submissions"
  ON public.submissions
  FOR UPDATE
  USING ((SELECT auth.uid()) = user_id AND status = 'pending');

CREATE POLICY "Admins can view all submissions"
  ON public.submissions
  FOR SELECT
  USING (public.has_role((SELECT auth.uid()), 'admin') OR public.has_role((SELECT auth.uid()), 'moderator'));

CREATE POLICY "Admins can manage all submissions"
  ON public.submissions
  FOR ALL
  USING (public.has_role((SELECT auth.uid()), 'admin') OR public.has_role((SELECT auth.uid()), 'moderator'));

-- SUBMISSION_DOCUMENTS TABLE POLICIES
CREATE POLICY "Users can view their own submission documents"
  ON public.submission_documents
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.submissions 
    WHERE submissions.id = submission_documents.submission_id 
    AND submissions.user_id = (SELECT auth.uid())
  ));

CREATE POLICY "Users can manage their own submission documents"
  ON public.submission_documents
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.submissions 
    WHERE submissions.id = submission_documents.submission_id 
    AND submissions.user_id = (SELECT auth.uid())
  ));

CREATE POLICY "Admins can view all submission documents"
  ON public.submission_documents
  FOR SELECT
  USING (public.has_role((SELECT auth.uid()), 'admin') OR public.has_role((SELECT auth.uid()), 'moderator'));

-- USER_CONTRIBUTIONS TABLE POLICIES
CREATE POLICY "Users can view their own contributions"
  ON public.user_contributions
  FOR SELECT
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Admins can view all contributions"
  ON public.user_contributions
  FOR SELECT
  USING (public.has_role((SELECT auth.uid()), 'admin'));

-- USER_PREFERENCES TABLE POLICIES
CREATE POLICY "Users can view their own preferences"
  ON public.user_preferences
  FOR SELECT
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update their own preferences"
  ON public.user_preferences
  FOR UPDATE
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert their own preferences"
  ON public.user_preferences
  FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Admins can view all preferences"
  ON public.user_preferences
  FOR SELECT
  USING (public.has_role((SELECT auth.uid()), 'admin'));

-- EMAIL_LOGS TABLE POLICIES
CREATE POLICY "Admins can view email logs"
  ON public.email_logs
  FOR SELECT
  USING (public.has_role((SELECT auth.uid()), 'admin'));

CREATE POLICY "System can insert email logs"
  ON public.email_logs
  FOR INSERT
  WITH CHECK (true);

-- NEWSLETTER_CAMPAIGNS TABLE POLICIES
CREATE POLICY "Admins can manage newsletter campaigns"
  ON public.newsletter_campaigns
  FOR ALL
  USING (public.has_role((SELECT auth.uid()), 'admin'));

-- CONTACT_SUBMISSIONS TABLE POLICIES
-- Anyone (including anonymous users) can create contact submissions
CREATE POLICY "Public can create contact submissions"
  ON public.contact_submissions
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- Only admins can view and manage contact submissions
CREATE POLICY "Admins can view contact submissions"
  ON public.contact_submissions
  FOR SELECT
  USING (public.has_role((SELECT auth.uid()), 'admin'));

CREATE POLICY "Admins can manage contact submissions"
  ON public.contact_submissions
  FOR ALL
  USING (public.has_role((SELECT auth.uid()), 'admin'));

-- AUDIT_LOGS TABLE POLICIES
-- Only admins can view audit logs (sensitive information)
CREATE POLICY "Admins can view all audit logs"
  ON public.audit_logs
  FOR SELECT
  USING (public.has_role((SELECT auth.uid()), 'admin'));

-- System functions can insert audit logs (handled by triggers and functions)
CREATE POLICY "System can insert audit logs"
  ON public.audit_logs
  FOR INSERT
  WITH CHECK (true);

-- Grant appropriate permissions to roles
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant table permissions
GRANT SELECT ON public.breed_legislation TO anon, authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.user_roles TO authenticated;
GRANT ALL ON public.submissions TO authenticated;
GRANT ALL ON public.submission_documents TO authenticated;
GRANT ALL ON public.user_contributions TO authenticated;
GRANT ALL ON public.user_preferences TO authenticated;
GRANT ALL ON public.email_logs TO authenticated;
GRANT ALL ON public.newsletter_campaigns TO authenticated;
GRANT INSERT ON public.contact_submissions TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.contact_submissions TO authenticated;
GRANT INSERT ON public.audit_logs TO authenticated;
GRANT SELECT ON public.audit_logs TO authenticated;

-- Grant sequence permissions
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant function permissions
GRANT EXECUTE ON FUNCTION public.create_audit_log(text, text, text, jsonb, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_has_role_or_higher(uuid, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_current_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.approve_submission(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reject_submission(UUID, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_submission_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_legislation_repealed(UUID, DATE, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_email_send(UUID, email_type, TEXT, TEXT, TEXT, email_status) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_newsletter_subscription(UUID, BOOLEAN, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_welcome_email_sent(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_newsletter_subscribers() TO authenticated;