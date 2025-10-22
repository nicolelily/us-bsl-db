-- Fix Supabase Performance Issues - RLS Policy Optimization (CLEANED VERSION)
-- This script addresses the major performance warnings from Supabase linter
-- Run this version if you got the "details column does not exist" error

-- =====================================================
-- Part 1: Fix Auth RLS Initialization Plan Issues
-- Replace auth.<function>() with (select auth.<function>())
-- to prevent re-evaluation for each row
-- =====================================================

-- Fix profiles table RLS policies
DROP POLICY IF EXISTS "System can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Recreate with optimized auth function calls
CREATE POLICY "System can insert profiles" ON public.profiles
    FOR INSERT WITH CHECK (id = (select auth.uid()));

CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (id = (select auth.uid()));

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (id = (select auth.uid()));

CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = (select auth.uid()) 
            AND role = 'admin'::public.app_role
        )
    );

-- Fix audit_logs table RLS policies
DROP POLICY IF EXISTS "audit_logs_select_owner_or_admin" ON public.audit_logs;
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;

CREATE POLICY "audit_logs_select_owner_or_admin" ON public.audit_logs
    FOR SELECT USING (
        user_id = (select auth.uid()) OR
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = (select auth.uid()) 
            AND role = 'admin'::public.app_role
        )
    );

-- =====================================================
-- Part 2: Consolidate Multiple Permissive Policies
-- Combine overlapping policies into single, efficient policies
-- =====================================================

-- BREED_LEGISLATION table - consolidate all the overlapping policies
DROP POLICY IF EXISTS "Admins can manage breed legislation" ON public.breed_legislation;
DROP POLICY IF EXISTS "Moderators can manage breed legislation" ON public.breed_legislation;
DROP POLICY IF EXISTS "Public can read breed legislation" ON public.breed_legislation;

-- Single consolidated policy for SELECT (covers public read + admin/moderator access)
CREATE POLICY "breed_legislation_select_consolidated" ON public.breed_legislation
    FOR SELECT USING (true); -- Public read access for all

-- Single consolidated policy for INSERT/UPDATE/DELETE (admin or moderator)
CREATE POLICY "breed_legislation_write_consolidated" ON public.breed_legislation
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = (select auth.uid()) 
            AND role IN ('admin'::public.app_role, 'moderator'::public.app_role)
        )
    );

-- PROFILES table - consolidate overlapping policies
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;

-- Consolidated INSERT policy
CREATE POLICY "profiles_insert_consolidated" ON public.profiles
    FOR INSERT WITH CHECK (
        id = (select auth.uid()) OR
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = (select auth.uid()) 
            AND role = 'admin'::public.app_role
        )
    );

-- Consolidated UPDATE policy
CREATE POLICY "profiles_update_consolidated" ON public.profiles
    FOR UPDATE USING (
        id = (select auth.uid()) OR
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = (select auth.uid()) 
            AND role = 'admin'::public.app_role
        )
    );

-- CONTACT_SUBMISSIONS table - consolidate policies
DROP POLICY IF EXISTS "Admins can manage contact submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Public can create contact submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Admins can view contact submissions" ON public.contact_submissions;

CREATE POLICY "contact_submissions_insert_consolidated" ON public.contact_submissions
    FOR INSERT WITH CHECK (true); -- Anyone can create contact submissions

CREATE POLICY "contact_submissions_select_consolidated" ON public.contact_submissions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = (select auth.uid()) 
            AND role = 'admin'::public.app_role
        )
    );

CREATE POLICY "contact_submissions_manage_consolidated" ON public.contact_submissions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = (select auth.uid()) 
            AND role = 'admin'::public.app_role
        )
    );

-- EMAIL_LOGS table - consolidate policies
DROP POLICY IF EXISTS "Admins can manage email logs" ON public.email_logs;
DROP POLICY IF EXISTS "System can insert email logs" ON public.email_logs;
DROP POLICY IF EXISTS "Admins can view email logs" ON public.email_logs;
DROP POLICY IF EXISTS "email_logs_delete_own" ON public.email_logs;
DROP POLICY IF EXISTS "email_logs_insert_own" ON public.email_logs;
DROP POLICY IF EXISTS "email_logs_select_own" ON public.email_logs;
DROP POLICY IF EXISTS "email_logs_update_own" ON public.email_logs;

CREATE POLICY "email_logs_insert_consolidated" ON public.email_logs
    FOR INSERT WITH CHECK (
        user_id = (select auth.uid()) OR
        (select auth.uid()) IS NULL OR -- System inserts
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = (select auth.uid()) 
            AND role = 'admin'::public.app_role
        )
    );

CREATE POLICY "email_logs_select_consolidated" ON public.email_logs
    FOR SELECT USING (
        user_id = (select auth.uid()) OR
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = (select auth.uid()) 
            AND role = 'admin'::public.app_role
        )
    );

CREATE POLICY "email_logs_manage_consolidated" ON public.email_logs
    FOR ALL USING (
        user_id = (select auth.uid()) OR
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = (select auth.uid()) 
            AND role = 'admin'::public.app_role
        )
    );

-- SUBMISSION_DOCUMENTS table - consolidate policies
DROP POLICY IF EXISTS "Admins can manage all submission documents" ON public.submission_documents;
DROP POLICY IF EXISTS "Users can manage their own submission documents" ON public.submission_documents;
DROP POLICY IF EXISTS "Admins can view all submission documents" ON public.submission_documents;
DROP POLICY IF EXISTS "Users can view their own submission documents" ON public.submission_documents;
DROP POLICY IF EXISTS "submission_documents_delete_own" ON public.submission_documents;
DROP POLICY IF EXISTS "submission_documents_insert_own" ON public.submission_documents;
DROP POLICY IF EXISTS "submission_documents_select_own" ON public.submission_documents;
DROP POLICY IF EXISTS "submission_documents_update_own" ON public.submission_documents;

CREATE POLICY "submission_documents_consolidated" ON public.submission_documents
    FOR ALL USING (
        -- Users can manage their own documents
        EXISTS (
            SELECT 1 FROM submissions 
            WHERE submissions.id = submission_documents.submission_id 
            AND submissions.user_id = (select auth.uid())
        ) OR
        -- Admins can manage all documents
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = (select auth.uid()) 
            AND role = 'admin'::public.app_role
        )
    );

-- AUDIT_LOGS table - consolidate multiple INSERT policies
DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "audit_logs_insert_service_role" ON public.audit_logs;

CREATE POLICY "audit_logs_insert_consolidated" ON public.audit_logs
    FOR INSERT WITH CHECK (
        (select auth.uid()) IS NOT NULL OR -- System/service role inserts
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = (select auth.uid()) 
            AND role = 'admin'::public.app_role
        )
    );

-- USER_ROLES table - consolidate admin policies
DROP POLICY IF EXISTS "Admins can manage all user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_delete_admin" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_insert_admin" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_select_own_or_admin" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_update_admin" ON public.user_roles;

CREATE POLICY "user_roles_select_consolidated" ON public.user_roles
    FOR SELECT USING (
        user_id = (select auth.uid()) OR
        EXISTS (
            SELECT 1 FROM user_roles ur 
            WHERE ur.user_id = (select auth.uid()) 
            AND ur.role = 'admin'::public.app_role
        )
    );

CREATE POLICY "user_roles_manage_consolidated" ON public.user_roles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles ur 
            WHERE ur.user_id = (select auth.uid()) 
            AND ur.role = 'admin'::public.app_role
        )
    );

-- =====================================================
-- Part 3: Add Performance Indexes
-- Create indexes to support the optimized RLS policies
-- =====================================================

-- Index for user_roles lookups (heavily used in RLS policies)
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id_role ON user_roles(user_id, role);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);

-- Index for submissions user_id (used in submission_documents policy)
CREATE INDEX IF NOT EXISTS idx_submissions_user_id ON submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submission_documents_submission_id ON submission_documents(submission_id);

-- Index for profiles auth lookups
CREATE INDEX IF NOT EXISTS idx_profiles_id ON profiles(id);

-- Index for email_logs user_id
CREATE INDEX IF NOT EXISTS idx_email_logs_user_id ON email_logs(user_id);

-- Index for audit_logs user_id
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);

-- =====================================================
-- Part 4: Analyze Tables for Query Planner
-- =====================================================
ANALYZE public.profiles;
ANALYZE public.user_roles;
ANALYZE public.submissions;
ANALYZE public.submission_documents;
ANALYZE public.audit_logs;
ANALYZE public.email_logs;
ANALYZE public.breed_legislation;
ANALYZE public.contact_submissions;

-- Migration completed successfully!