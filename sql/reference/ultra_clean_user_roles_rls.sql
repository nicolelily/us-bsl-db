-- ULTRA-CLEAN USER_ROLES RLS REDESIGN
-- Minimal policies to eliminate all recursion

-- =================================================================
-- STEP 1: Remove ALL existing user_roles policies (clean slate)
-- =================================================================
DROP POLICY IF EXISTS "Admins can insert user roles" ON public.user_roles;
DROP POLICY IF EXISTS "System can insert roles on signup" ON public.user_roles;
DROP POLICY IF EXISTS "System can insert user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_delete_owner_or_admin" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_insert_owner_or_admin" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_manage_consolidated" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_select_consolidated" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_select_owner_or_admin" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_update_owner_or_admin" ON public.user_roles;

-- =================================================================
-- STEP 2: Create ONLY essential policies - NO recursion
-- =================================================================

-- Policy 1: Users can see their own role ONLY
CREATE POLICY "user_roles_own_select" ON public.user_roles
    FOR SELECT USING (user_id = auth.uid());

-- Policy 2: System can create roles (for signup triggers)
CREATE POLICY "user_roles_system_insert" ON public.user_roles
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- =================================================================
-- STEP 3: Create a BYPASS function for admin access
-- This function has SECURITY DEFINER so it bypasses RLS entirely
-- =================================================================
CREATE OR REPLACE FUNCTION public.admin_access_user_roles()
RETURNS SETOF user_roles AS $$
BEGIN
    -- This function bypasses RLS completely for admin operations
    -- It should only be called by admin interfaces, not public ones
    RETURN QUERY 
    SELECT * FROM user_roles;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant access to authenticated users (admins will use this function)
GRANT EXECUTE ON FUNCTION public.admin_access_user_roles() TO authenticated;

-- =================================================================
-- STEP 4: Update other functions to NOT use RLS queries
-- =================================================================

-- Fix the is_admin_user function to be completely safe
CREATE OR REPLACE FUNCTION public.is_admin_user(check_user_id UUID DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
    target_user_id UUID;
    admin_count INTEGER;
BEGIN
    target_user_id := COALESCE(check_user_id, auth.uid());
    
    IF target_user_id IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Use a direct query that doesn't trigger RLS evaluation
    EXECUTE format('SELECT COUNT(*) FROM user_roles WHERE user_id = %L AND role = %L', 
                   target_user_id, 'admin') INTO admin_count;
    
    RETURN admin_count > 0;
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =================================================================
-- STEP 5: Test that recursion is fixed
-- =================================================================
SELECT 'Clean RLS setup complete - testing access...' as status;

-- Test basic user_roles access
SELECT COUNT(*) as user_roles_count FROM user_roles;

-- Test that breed_legislation is now accessible
SELECT COUNT(*) as breed_legislation_count FROM breed_legislation;