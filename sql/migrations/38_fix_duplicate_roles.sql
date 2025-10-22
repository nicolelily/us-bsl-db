-- FIX DUPLICATE ROLES AND PREVENT FUTURE DUPLICATES
-- This will clean up multiple roles and add proper constraints

-- Step 1: Show current duplicate roles problem
SELECT 
    'Current Roles Issue' as check_type,
    p.email,
    ur.user_id,
    ur.role,
    ur.created_at,
    '⚠️ Multiple roles detected' as issue_status
FROM profiles p
JOIN user_roles ur ON p.id = ur.user_id
WHERE p.email = 'nicolelily@me.com'
ORDER BY ur.created_at;

-- Step 2: Show all users with multiple roles
SELECT 
    'Users With Multiple Roles' as check_type,
    p.email,
    COUNT(ur.role) as role_count,
    STRING_AGG(ur.role::text, ', ' ORDER BY ur.role) as all_roles,
    CASE 
        WHEN COUNT(ur.role) > 1 THEN '❌ Has duplicate roles'
        ELSE '✅ Single role only'
    END as status
FROM profiles p
JOIN user_roles ur ON p.id = ur.user_id
GROUP BY p.email, p.id
ORDER BY role_count DESC;

-- Step 3: Delete the 'user' role, keep only 'admin' for your email
-- This removes the duplicate and keeps the admin role
DELETE FROM user_roles 
WHERE user_id = (SELECT id FROM profiles WHERE email = 'nicolelily@me.com')
AND role = 'user'::public.app_role;

-- Step 4: Verify cleanup - should show only admin role now
SELECT 
    'After Cleanup Verification' as check_type,
    p.email,
    ur.role,
    ur.created_at,
    '✅ Should show only admin role' as expected_result
FROM profiles p
JOIN user_roles ur ON p.id = ur.user_id
WHERE p.email = 'nicolelily@me.com';

-- Step 5: Add unique constraint to prevent future duplicates
-- This ensures one user can only have one role
ALTER TABLE user_roles 
ADD CONSTRAINT user_roles_user_id_unique 
UNIQUE (user_id);

-- Step 6: Verify constraint was added
SELECT 
    'Constraint Verification' as check_type,
    constraint_name,
    constraint_type,
    table_name,
    '✅ Unique constraint prevents duplicate roles' as status
FROM information_schema.table_constraints
WHERE table_name = 'user_roles' 
AND constraint_type = 'UNIQUE'
AND table_schema = 'public';

-- Step 7: Final verification - show all user roles
SELECT 
    'Final User Roles Status' as check_type,
    p.email,
    ur.role,
    ur.created_at,
    '✅ Clean single role per user' as status
FROM profiles p
JOIN user_roles ur ON p.id = ur.user_id
ORDER BY p.email, ur.created_at;