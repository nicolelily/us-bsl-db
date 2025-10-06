-- Script to create the first admin user
-- Replace 'YOUR_USER_EMAIL' with your actual email address

-- This script finds a user by email and promotes them to admin
-- Run this in Supabase SQL Editor after creating your account

DO $$
DECLARE
    user_uuid UUID;
    user_email TEXT := 'YOUR_USER_EMAIL'; -- REPLACE THIS WITH YOUR EMAIL
BEGIN
    -- Find the user ID from auth.users by email
    SELECT id INTO user_uuid 
    FROM auth.users 
    WHERE email = user_email;
    
    -- Check if user exists
    IF user_uuid IS NULL THEN
        RAISE EXCEPTION 'User with email % not found', user_email;
    END IF;
    
    -- Check if user already has a role
    IF EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = user_uuid) THEN
        -- Update existing role to admin
        UPDATE public.user_roles 
        SET role = 'admin'::public.app_role, updated_at = NOW()
        WHERE user_id = user_uuid;
        
        RAISE NOTICE 'Updated user % (%) to admin role', user_email, user_uuid;
    ELSE
        -- Insert new admin role
        INSERT INTO public.user_roles (user_id, role, created_at, updated_at)
        VALUES (user_uuid, 'admin'::public.app_role, NOW(), NOW());
        
        RAISE NOTICE 'Created admin role for user % (%)', user_email, user_uuid;
    END IF;
    
    -- Verify the role was set correctly
    IF EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = user_uuid AND role = 'admin') THEN
        RAISE NOTICE 'SUCCESS: User % is now an admin!', user_email;
    ELSE
        RAISE EXCEPTION 'FAILED: Unable to set admin role for user %', user_email;
    END IF;
    
END $$;

-- Optional: View all users and their roles to verify
-- Uncomment the lines below if you want to see all users after running the script

/*
SELECT 
    p.email,
    p.full_name,
    ur.role,
    ur.created_at as role_created_at
FROM public.profiles p
LEFT JOIN public.user_roles ur ON p.id = ur.user_id
ORDER BY ur.role DESC, p.created_at;
*/