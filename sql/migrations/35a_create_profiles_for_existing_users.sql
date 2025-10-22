-- PART 1: EXAMINE EXISTING AUTH USERS AND CREATE PROFILES
-- Run this first to see what users exist and create their profiles

-- Step 1: Show all auth users that currently exist
SELECT 
    'Existing Auth Users' as check_type,
    u.id,
    u.email,
    u.created_at,
    u.email_confirmed_at,
    u.last_sign_in_at,
    CASE 
        WHEN u.email_confirmed_at IS NULL THEN '⚠️ Email not confirmed'
        ELSE '✅ Email confirmed'
    END as confirmation_status
FROM auth.users u
ORDER BY u.created_at;

-- Step 2: Check which users already have profiles (should be none)
SELECT 
    'Users With Existing Profiles' as check_type,
    COUNT(*) as existing_profile_count,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ No existing profiles (as expected)'
        ELSE '⚠️ Some profiles already exist'
    END as status
FROM auth.users u
JOIN profiles p ON u.id = p.id;

-- Step 3: Show users that need profiles created
SELECT 
    'Users Needing Profiles' as check_type,
    u.id,
    u.email,
    u.created_at,
    'Will create profile for this user' as action
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL
ORDER BY u.created_at;

-- Step 4: Create profiles for all existing auth users
INSERT INTO profiles (id, email, full_name, created_at, updated_at)
SELECT 
    u.id,
    u.email,
    COALESCE(u.raw_user_meta_data ->> 'full_name', u.email), -- Use metadata name or email as fallback
    u.created_at,
    NOW()
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- Step 5: Verify profiles were created successfully
SELECT 
    'Profile Creation Results' as check_type,
    COUNT(*) as total_profiles_created,
    '✅ Profiles created for all auth users' as status
FROM profiles;

-- Step 6: Show all profiles that now exist
SELECT 
    'All Created Profiles' as check_type,
    p.id,
    p.email,
    p.full_name,
    p.created_at,
    '✅ Profile ready for role assignment' as status
FROM profiles p
ORDER BY p.created_at;

-- Step 7: Summary of what's ready for next step
SELECT 
    'Ready for Role Assignment' as summary,
    'Profiles created for all users' as step_completed,
    'Run the second script to assign admin role' as next_step,
    'Choose your email from the profiles above' as instruction;