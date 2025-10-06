-- Fix RLS policies to allow proper admin access
-- This addresses the "Unable to verify admin privileges" error

-- First, let's make sure the is_admin_user function works correctly
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if current user has admin role
  RETURN EXISTS (
    SELECT 1 
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role = 'admin'::public.app_role
  );
EXCEPTION
  WHEN OTHERS THEN
    -- If any error occurs (like RLS blocking), return false
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Recreate the get_current_user_role function to be more robust
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS public.app_role AS $$
DECLARE
  user_role public.app_role;
BEGIN
  SELECT ur.role INTO user_role
  FROM public.user_roles ur
  WHERE ur.user_id = auth.uid()
  LIMIT 1;
  
  -- Return the role, defaulting to 'user' if none found
  RETURN COALESCE(user_role, 'user'::public.app_role);
EXCEPTION
  WHEN OTHERS THEN
    -- If any error occurs, default to 'user'
    RETURN 'user'::public.app_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create a more robust has_role function
CREATE OR REPLACE FUNCTION public.has_role(_role public.app_role, _user_id UUID DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Use provided user_id or current user
  target_user_id := COALESCE(_user_id, auth.uid());
  
  -- Check if user has the specified role
  RETURN EXISTS (
    SELECT 1 
    FROM public.user_roles ur
    WHERE ur.user_id = target_user_id
    AND ur.role = _role
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Now let's fix the RLS policies for user_roles table
-- First, drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert user roles" ON public.user_roles;
DROP POLICY IF EXISTS "System can insert roles on signup" ON public.user_roles;

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can view their own roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT
  USING (user_id = auth.uid());

-- Policy 2: Admins can view all user roles
CREATE POLICY "Admins can view all user roles" ON public.user_roles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles admin_check
      WHERE admin_check.user_id = auth.uid() 
      AND admin_check.role = 'admin'::public.app_role
    )
  );

-- Policy 3: Admins can update user roles
CREATE POLICY "Admins can update user roles" ON public.user_roles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles admin_check
      WHERE admin_check.user_id = auth.uid() 
      AND admin_check.role = 'admin'::public.app_role
    )
  );

-- Policy 4: Admins can insert user roles
CREATE POLICY "Admins can insert user roles" ON public.user_roles
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles admin_check
      WHERE admin_check.user_id = auth.uid() 
      AND admin_check.role = 'admin'::public.app_role
    )
  );

-- Policy 5: System can insert roles on signup (for triggers)
CREATE POLICY "System can insert roles on signup" ON public.user_roles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id AND role = 'user'::public.app_role);

-- Fix RLS policies for profiles table to allow admin access
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "System can insert profiles" ON public.profiles;

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can view and update their own profile
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE
  USING (id = auth.uid());

-- Policy 2: Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() 
      AND role = 'admin'::public.app_role
    )
  );

-- Policy 3: System can insert profiles (for triggers)
CREATE POLICY "System can insert profiles" ON public.profiles
  FOR INSERT
  WITH CHECK (id = auth.uid());

-- Grant necessary permissions
GRANT SELECT ON public.user_roles TO authenticated;
GRANT SELECT, UPDATE, INSERT ON public.user_roles TO authenticated;
GRANT SELECT ON public.profiles TO authenticated;
GRANT SELECT, UPDATE, INSERT ON public.profiles TO authenticated;

-- Test the functions work
SELECT 'Admin check result: ' || COALESCE(public.is_admin_user()::text, 'NULL');
SELECT 'Current user role: ' || COALESCE(public.get_current_user_role()::text, 'NULL');