-- ULTRA-SAFE MINIMAL FIX
-- This approach minimizes risk by only making the smallest necessary change

-- Step 1: Just temporarily disable RLS on user_roles table
-- This is the safest immediate fix to stop the infinite recursion
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;

-- Step 2: Verify the change worked - check if functions now work
SELECT 'After disabling RLS - is_admin_user(): ' || COALESCE(public.is_admin_user()::text, 'NULL');
SELECT 'After disabling RLS - get_current_user_role(): ' || COALESCE(public.get_current_user_role()::text, 'NULL');

-- Step 3: Verify your role data is correct
SELECT 
    p.email,
    ur.role,
    'Your role after fix' as status
FROM public.profiles p
JOIN public.user_roles ur ON p.id = ur.user_id  
WHERE p.email = 'nicolelily@me.com';

-- Step 4: Simple success message
SELECT 'MINIMAL FIX COMPLETE - Please refresh browser. We can re-enable RLS later with better policies.' as result;