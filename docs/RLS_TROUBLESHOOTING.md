# RLS Troubleshooting Guide

## Common RLS Issues and Solutions

This guide documents common Row Level Security (RLS) issues encountered in Supabase/PostgreSQL and their solutions, based on real troubleshooting experience.

## Issue 1: RLS Enabled But No Policies

### Symptoms
```
Error: Row security is enabled for table "user_roles" but no policies exist
```
- Supabase Security Advisor warnings
- Table access denied for all users

### Diagnosis
```sql
-- Check RLS status
SELECT schemaname, tablename, rowsecurity, forcerowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'user_roles';

-- Check existing policies
SELECT * FROM pg_policies WHERE tablename = 'user_roles';
```

### Solution
Enable RLS and create appropriate policies:
```sql
-- Enable RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Create basic policies
CREATE POLICY "users_view_own_roles" ON user_roles
FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "admins_manage_all_roles" ON user_roles
FOR ALL TO authenticated
USING (is_admin_user());
```

## Issue 2: Infinite RLS Recursion

### Symptoms
```
Error: infinite recursion in RLS policy
```
- App shows no data despite data existing
- Queries hang or timeout
- Anonymous access fails even for public data

### Diagnosis
```sql
-- Test anonymous access
SET LOCAL role = 'anon';
SELECT COUNT(*) FROM breed_legislation; -- Should work for public data
RESET role;

-- Check policy complexity
SELECT policyname, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'user_roles';
```

### Root Cause
RLS policy calls a function that queries the same table:
```sql
-- PROBLEMATIC PATTERN
CREATE POLICY "admin_access" ON user_roles
FOR ALL TO authenticated
USING (is_admin_user()); -- Function queries user_roles → infinite loop
```

### Solution
Use `SECURITY DEFINER` functions that bypass RLS:
```sql
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN AS $$
DECLARE
    admin_count INTEGER;
BEGIN
    IF auth.uid() IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Direct query bypasses RLS
    EXECUTE format('SELECT COUNT(*) FROM user_roles WHERE user_id = %L AND role = %L', 
                   auth.uid(), 'admin') INTO admin_count;
    
    RETURN admin_count > 0;
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; -- This is crucial!
```

## Issue 3: Missing User Profiles

### Symptoms
- Authentication works but user data queries fail
- "User not found" errors despite successful login
- Profile-related features broken

### Diagnosis
```sql
-- Check for missing profiles
SELECT 
    au.id,
    au.email,
    p.id as profile_id
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL;
```

### Solution
Create profiles for existing users:
```sql
-- Create missing profiles
INSERT INTO profiles (id, email, created_at, updated_at)
SELECT 
    au.id,
    au.email,
    au.created_at,
    NOW()
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL;
```

## Issue 4: Duplicate User Roles

### Symptoms
- Multiple role entries for same user
- Inconsistent permission behavior
- Constraint violation errors

### Diagnosis
```sql
-- Find duplicate roles
SELECT user_id, COUNT(*) as role_count
FROM user_roles
GROUP BY user_id
HAVING COUNT(*) > 1;
```

### Solution
```sql
-- Remove duplicates, keeping most recent
DELETE FROM user_roles 
WHERE id NOT IN (
    SELECT DISTINCT ON (user_id) id
    FROM user_roles
    ORDER BY user_id, created_at DESC
);

-- Add unique constraint to prevent future duplicates
ALTER TABLE user_roles 
ADD CONSTRAINT unique_user_role UNIQUE (user_id);
```

## Issue 5: Performance Problems

### Symptoms
- Slow query response times
- High CPU usage in database
- Timeouts on data loading

### Diagnosis
```sql
-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM breed_legislation;

-- Check for missing indexes
SELECT schemaname, tablename, attname, n_distinct, correlation
FROM pg_stats
WHERE schemaname = 'public' AND tablename = 'user_roles';
```

### Solution
Optimize policies and add indexes:
```sql
-- Add performance indexes
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role);

-- Simplify complex policies
-- Replace complex USING clauses with simpler conditions
```

## Issue 6: Anonymous Access Blocked

### Symptoms
- Public data not accessible without login
- "Permission denied" for intended public endpoints
- SEO/crawling issues

### Diagnosis
```sql
-- Test anonymous access
SET LOCAL role = 'anon';
SELECT COUNT(*) FROM breed_legislation;
RESET role;

-- Check for overly restrictive policies
SELECT * FROM pg_policies WHERE tablename = 'breed_legislation';
```

### Solution
Create explicit public access policies:
```sql
CREATE POLICY "public_breed_legislation_access" ON breed_legislation
FOR SELECT TO anon
USING (true); -- Allow all anonymous users to read
```

## Diagnostic Tools

### Quick Health Check
```sql
-- 1. Check RLS status for all tables
SELECT 
    schemaname, 
    tablename, 
    rowsecurity,
    (SELECT COUNT(*) FROM pg_policies WHERE pg_policies.tablename = pg_tables.tablename) as policy_count
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- 2. Test basic access patterns
SELECT 'Anonymous breed_legislation access' as test, COUNT(*) FROM breed_legislation;
SELECT 'User roles count' as test, COUNT(*) FROM user_roles;

-- 3. Check for recursion issues
SELECT 'Admin function test' as test, is_admin_user() as result;
```

### Performance Analysis
```sql
-- Check query performance
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM breed_legislation LIMIT 10;

-- Check policy overhead
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    LENGTH(qual) as policy_complexity
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY policy_complexity DESC;
```

## Prevention Best Practices

### 1. Design Principles
- Keep policies simple and direct
- Avoid circular dependencies in functions
- Use `SECURITY DEFINER` for admin functions
- Test anonymous access explicitly

### 2. Development Workflow
```sql
-- Always test RLS changes with different roles
SET LOCAL role = 'anon';
-- Test queries
RESET role;

SET LOCAL role = 'authenticated';
-- Test queries  
RESET role;
```

### 3. Migration Safety
- Test RLS changes in staging first
- Have rollback scripts ready
- Monitor performance after policy changes
- Document all security decisions

### 4. Monitoring
- Set up alerts for RLS policy errors
- Monitor query performance regularly
- Log admin function usage
- Regular security audits

## Emergency Recovery

### Quick Disable (Emergency Only)
```sql
-- DANGER: Removes all security - use only in emergencies
ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
-- Remember to re-enable and fix the underlying issue!
```

### Safe Recovery Process
1. Identify the specific failing query
2. Test the query in isolation
3. Check related policies and functions
4. Create minimal reproduction case
5. Implement targeted fix
6. Test thoroughly before deploying

## Useful Queries

### Policy Information
```sql
-- List all policies with details
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    roles,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### Function Dependencies
```sql
-- Find functions used in policies
SELECT DISTINCT 
    tablename,
    policyname,
    regexp_matches(qual, 'is_\w+\(\)', 'g') as functions_used
FROM pg_policies 
WHERE qual ~ 'is_\w+\(\)';
```

### User Role Analysis
```sql
-- Current user role distribution
SELECT role, COUNT(*) as user_count
FROM user_roles
GROUP BY role
ORDER BY user_count DESC;
```

---

**Last Updated**: October 2025  
**Based on**: Real troubleshooting session fixing RLS recursion issues  
**Status**: Field-tested ✅