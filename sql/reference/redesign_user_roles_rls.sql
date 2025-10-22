-- THOUGHTFUL USER_ROLES RLS REDESIGN
-- This creates a clean, non-recursive RLS setup for user_roles

-- =================================================================
-- STEP 1: Clean slate - remove all existing user_roles policies
-- =================================================================
DROP POLICY IF EXISTS "user_roles_manage_consolidated" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_select_consolidated" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_delete_owner_or_admin" ON public.user_roles;
DROP POLICY IF EXISTS "System can insert roles on signup" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert user roles" ON public.user_roles;
DROP POLICY IF EXISTS "System can insert user roles" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_insert_owner_or_admin" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_select_owner_or_admin" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_update_owner_or_admin" ON public.user_roles;

-- =================================================================
-- STEP 2: Create simple, non-recursive policies
-- =================================================================

-- Policy 1: Users can view their own role (no recursion)
CREATE POLICY "user_roles_select_own" ON public.user_roles
    FOR SELECT USING (user_id = auth.uid());

-- Policy 2: System can insert roles during signup (no recursion)
CREATE POLICY "user_roles_insert_system" ON public.user_roles
    FOR INSERT WITH CHECK (
        -- Allow insert if the user_id matches current user (self-assignment)
        -- This happens during user signup via triggers
        user_id = auth.uid()
    );

-- Policy 3: Enable updates only for the user's own record (no admin checks)
CREATE POLICY "user_roles_update_own" ON public.user_roles
    FOR UPDATE USING (user_id = auth.uid());

-- =================================================================
-- STEP 3: Create separate admin access policies WITHOUT recursion
-- We'll handle admin access through functions, not RLS policies
-- =================================================================

-- Create a simple function to check if someone is admin WITHOUT using RLS
CREATE OR REPLACE FUNCTION public.is_user_admin(check_user_id UUID DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
    target_user_id UUID;
    user_role_count INTEGER;
BEGIN
    -- Use provided user_id or current user
    target_user_id := COALESCE(check_user_id, auth.uid());
    
    -- Return false if no user
    IF target_user_id IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Direct count query without RLS recursion
    SELECT COUNT(*)::INTEGER INTO user_role_count
    FROM user_roles 
    WHERE user_id = target_user_id 
    AND role = 'admin'::public.app_role;
    
    RETURN user_role_count > 0;
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policy 4: Admins can view all roles (using the safe function)
CREATE POLICY "user_roles_select_admin" ON public.user_roles
    FOR SELECT USING (public.is_user_admin());

-- Policy 5: Admins can manage all roles (using the safe function)
CREATE POLICY "user_roles_manage_admin" ON public.user_roles
    FOR ALL USING (public.is_user_admin());

-- =================================================================
-- STEP 4: Test the new setup
-- =================================================================
SELECT 'RLS Policy Redesign Complete' as status;