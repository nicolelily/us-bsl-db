
-- Fix the profiles table RLS policy performance issue by optimizing auth.uid() calls
-- This prevents re-evaluation of auth.uid() for each row, improving query performance

-- Drop existing policies that use auth.uid() directly
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Recreate policies with optimized auth.uid() calls using subqueries
CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  USING ((SELECT auth.uid()) = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING ((SELECT auth.uid()) = id);

-- Recreate admin policies with optimized auth.uid() calls
CREATE POLICY "Admins can view all profiles"
  ON public.profiles
  FOR SELECT
  USING (public.has_role((SELECT auth.uid()), 'admin'));

CREATE POLICY "Admins can update all profiles"
  ON public.profiles
  FOR UPDATE
  USING (public.has_role((SELECT auth.uid()), 'admin'));
