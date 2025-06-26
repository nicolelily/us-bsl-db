
-- Enable RLS on all core tables that don't have it yet
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.breed_legislation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all user roles" ON public.user_roles;

DROP POLICY IF EXISTS "Public can read breed legislation" ON public.breed_legislation;
DROP POLICY IF EXISTS "Admins can manage breed legislation" ON public.breed_legislation;

DROP POLICY IF EXISTS "Admins can view contact submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Admins can manage contact submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Public can create contact submissions" ON public.contact_submissions;

DROP POLICY IF EXISTS "Admins can view all audit logs" ON public.audit_logs;

-- PROFILES TABLE POLICIES
-- Users can view and update their own profile
CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Admins can view and update all profiles
CREATE POLICY "Admins can view all profiles"
  ON public.profiles
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all profiles"
  ON public.profiles
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- USER_ROLES TABLE POLICIES
-- Users can view their own roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all user roles
CREATE POLICY "Admins can view all user roles"
  ON public.user_roles
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins can manage all user roles (insert, update, delete)
CREATE POLICY "Admins can manage all user roles"
  ON public.user_roles
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

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
  USING (public.has_role(auth.uid(), 'admin'));

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
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage contact submissions"
  ON public.contact_submissions
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- AUDIT_LOGS TABLE POLICIES
-- Only admins can view audit logs (sensitive information)
CREATE POLICY "Admins can view all audit logs"
  ON public.audit_logs
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- System functions can insert audit logs (handled by triggers and functions)
CREATE POLICY "System can insert audit logs"
  ON public.audit_logs
  FOR INSERT
  WITH CHECK (true);
