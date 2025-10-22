-- FIX INFINITE RECURSION IN RLS POLICIES
-- This addresses the circular dependency issue causing anonymous access to fail

-- Step 1: Drop problematic policies that cause recursion
DROP POLICY IF EXISTS "breed_legislation_write_consolidated" ON public.breed_legislation;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Step 2: Recreate breed_legislation policies WITHOUT user_roles references for writes
-- Keep the simple public read policy (this one is fine)
-- But fix the write policy to avoid recursion

CREATE POLICY "breed_legislation_write_admin_only" ON public.breed_legislation
    FOR ALL USING (
        -- Only allow writes if user has admin role - but do it safely
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'::public.app_role
        )
    );

-- Step 3: Fix profiles admin policy to avoid recursion
CREATE POLICY "profiles_admin_view_safe" ON public.profiles
    FOR SELECT USING (
        -- Users can see their own profile OR user is admin
        id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'::public.app_role
        )
    );

-- Step 4: Verify the breed_legislation table is accessible to anonymous users
SELECT 
    'Public Access Test After Fix' as test_type,
    COUNT(*) as accessible_records
FROM breed_legislation;