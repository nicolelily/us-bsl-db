-- RLS Policy Performance Monitoring
-- Check if Row Level Security policies are causing performance issues

-- =====================================================
-- 1. IDENTIFY TABLES WITH RLS
-- =====================================================

SELECT
    schemaname,
    tablename,
    rowsecurity AS rls_enabled,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS table_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- =====================================================
-- 2. COUNT POLICIES PER TABLE
-- Too many policies can slow down queries
-- =====================================================

SELECT
    schemaname,
    tablename,
    COUNT(*) as policy_count,
    string_agg(policyname, ', ') as policy_names
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY schemaname, tablename
ORDER BY policy_count DESC;

-- =====================================================
-- 3. DETAILED POLICY INFORMATION
-- View all RLS policies and their complexity
-- =====================================================

SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,  -- Command: SELECT, INSERT, UPDATE, DELETE, ALL
    qual,  -- USING clause (SELECT/DELETE)
    with_check  -- WITH CHECK clause (INSERT/UPDATE)
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- =====================================================
-- 4. DETECT PROBLEMATIC RLS PATTERNS
-- =====================================================

-- A. Policies using auth.uid() without subquery optimization
-- (These can cause performance issues)
SELECT
    schemaname,
    tablename,
    policyname,
    cmd,
    qual
FROM pg_policies
WHERE schemaname = 'public'
    AND (
        qual LIKE '%auth.uid()%' 
        AND qual NOT LIKE '%(select auth.uid())%'
        AND qual NOT LIKE '%(SELECT auth.uid())%'
    )
ORDER BY tablename;

-- B. Policies with subqueries (can be slow on large tables)
SELECT
    schemaname,
    tablename,
    policyname,
    cmd,
    CASE 
        WHEN qual LIKE '%EXISTS%' THEN 'Uses EXISTS'
        WHEN qual LIKE '%SELECT%FROM%' THEN 'Uses subquery'
        ELSE 'Simple check'
    END as complexity_type
FROM pg_policies
WHERE schemaname = 'public'
    AND (qual LIKE '%EXISTS%' OR qual LIKE '%SELECT%FROM%')
ORDER BY tablename;

-- =====================================================
-- 5. TEST RLS POLICY PERFORMANCE
-- =====================================================

-- Create a function to test query performance with/without RLS
CREATE OR REPLACE FUNCTION public.test_rls_performance(
    p_table_name TEXT,
    p_test_query TEXT
) RETURNS TABLE (
    scenario TEXT,
    execution_time_ms NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_start_time TIMESTAMP;
    v_end_time TIMESTAMP;
    v_rls_enabled BOOLEAN;
BEGIN
    -- Check if RLS is enabled
    SELECT rowsecurity INTO v_rls_enabled
    FROM pg_tables
    WHERE schemaname = 'public' AND tablename = p_table_name;

    IF NOT v_rls_enabled THEN
        RETURN QUERY SELECT 'RLS not enabled'::TEXT, 0::NUMERIC;
        RETURN;
    END IF;

    -- Test WITH RLS
    v_start_time := clock_timestamp();
    EXECUTE p_test_query;
    v_end_time := clock_timestamp();
    
    RETURN QUERY SELECT 
        'WITH RLS'::TEXT,
        EXTRACT(MILLISECOND FROM (v_end_time - v_start_time))::NUMERIC;

    -- Test WITHOUT RLS (admin only)
    IF EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() 
        AND role = 'admin'::public.app_role
    ) THEN
        EXECUTE 'SET LOCAL row_security = OFF';
        
        v_start_time := clock_timestamp();
        EXECUTE p_test_query;
        v_end_time := clock_timestamp();
        
        RETURN QUERY SELECT 
            'WITHOUT RLS'::TEXT,
            EXTRACT(MILLISECOND FROM (v_end_time - v_start_time))::NUMERIC;
        
        EXECUTE 'SET LOCAL row_security = ON';
    END IF;
END;
$$;

-- Example usage (admin only):
-- SELECT * FROM public.test_rls_performance(
--     'community_submissions',
--     'SELECT COUNT(*) FROM public.community_submissions'
-- );

-- =====================================================
-- 6. MONITOR RLS IMPACT ON SPECIFIC TABLES
-- =====================================================

-- Check query patterns on tables with RLS
SELECT
    t.schemaname,
    t.tablename,
    t.seq_scan + t.idx_scan AS total_queries,
    t.seq_scan AS sequential_scans,
    t.idx_scan AS index_scans,
    pg_size_pretty(pg_total_relation_size(t.schemaname||'.'||t.tablename)) AS table_size,
    t.n_live_tup AS row_count,
    p.policy_count
FROM pg_stat_user_tables t
LEFT JOIN (
    SELECT tablename, COUNT(*) as policy_count
    FROM pg_policies
    WHERE schemaname = 'public'
    GROUP BY tablename
) p ON t.tablename = p.tablename
JOIN pg_tables pt ON pt.schemaname = t.schemaname AND pt.tablename = t.tablename
WHERE t.schemaname = 'public'
    AND pt.rowsecurity = true  -- Only tables with RLS enabled
ORDER BY total_queries DESC;

-- =====================================================
-- 7. FIND MISSING INDEXES FOR RLS POLICIES
-- =====================================================

-- Common pattern: RLS policies often filter by user_id or created_by
-- Check if these columns are indexed

SELECT
    t.tablename,
    a.attname as column_name,
    pg_size_pretty(pg_total_relation_size('public.'||t.tablename)) AS table_size,
    t.n_live_tup AS row_count,
    CASE 
        WHEN i.indexname IS NULL THEN '⚠️  No index'
        ELSE '✓ Indexed: ' || i.indexname
    END as index_status
FROM pg_tables t
JOIN pg_attribute a ON a.attrelid = ('public.'||t.tablename)::regclass
LEFT JOIN (
    SELECT 
        schemaname,
        tablename,
        indexname,
        string_agg(attname, ', ') as indexed_columns
    FROM pg_indexes
    JOIN pg_attribute ON attrelid = (schemaname||'.'||tablename)::regclass
    WHERE schemaname = 'public'
    GROUP BY schemaname, tablename, indexname
) i ON i.tablename = t.tablename 
    AND i.indexed_columns LIKE '%'||a.attname||'%'
WHERE t.schemaname = 'public'
    AND t.rowsecurity = true
    AND a.attname IN ('user_id', 'created_by', 'author_id', 'owner_id', 'submitted_by')
    AND a.attnum > 0  -- Exclude system columns
    AND NOT a.attisdropped
ORDER BY t.tablename, a.attname;

-- =====================================================
-- 8. RLS POLICY RECOMMENDATIONS
-- =====================================================

-- Create view with actionable recommendations
CREATE OR REPLACE VIEW public.rls_performance_recommendations AS
WITH table_stats AS (
    SELECT
        t.schemaname,
        t.tablename,
        pt.rowsecurity as rls_enabled,
        COUNT(p.policyname) as policy_count,
        t.n_live_tup as row_count,
        t.seq_scan + t.idx_scan as total_queries,
        pg_total_relation_size(t.schemaname||'.'||t.tablename) as table_size_bytes
    FROM pg_stat_user_tables t
    JOIN pg_tables pt ON pt.schemaname = t.schemaname AND pt.tablename = t.tablename
    LEFT JOIN pg_policies p ON p.tablename = t.tablename AND p.schemaname = t.schemaname
    WHERE t.schemaname = 'public'
    GROUP BY t.schemaname, t.tablename, pt.rowsecurity, t.n_live_tup, 
             t.seq_scan, t.idx_scan, t.schemaname, t.tablename
)
SELECT
    tablename,
    rls_enabled,
    policy_count,
    row_count,
    total_queries,
    pg_size_pretty(table_size_bytes) as table_size,
    CASE
        WHEN NOT rls_enabled THEN '✓ RLS not needed'
        WHEN policy_count = 0 THEN '⚠️  RLS enabled but no policies'
        WHEN policy_count > 5 THEN '⚠️  Too many policies (' || policy_count || ')'
        WHEN row_count > 10000 AND total_queries > 1000 THEN '⚠️  High traffic table - optimize policies'
        ELSE '✓ Looks good'
    END as recommendation
FROM table_stats
ORDER BY total_queries DESC;

-- View recommendations
SELECT * FROM public.rls_performance_recommendations;

-- =====================================================
-- 9. BENCHMARK SPECIFIC RLS POLICIES
-- =====================================================

-- Example: Test a specific query pattern
EXPLAIN (ANALYZE, BUFFERS, VERBOSE)
SELECT * FROM public.community_submissions
WHERE status = 'approved'
LIMIT 10;

-- Compare with RLS disabled (admin only, for testing)
-- SET LOCAL row_security = OFF;
-- EXPLAIN (ANALYZE, BUFFERS, VERBOSE)
-- SELECT * FROM public.community_submissions
-- WHERE status = 'approved'
-- LIMIT 10;
-- SET LOCAL row_security = ON;

-- =====================================================
-- 10. AUTOMATED RLS HEALTH CHECK
-- =====================================================

CREATE OR REPLACE FUNCTION public.rls_health_check()
RETURNS TABLE (
    check_name TEXT,
    status TEXT,
    details TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check 1: Tables with RLS but no policies
    RETURN QUERY
    SELECT
        'Tables with RLS but no policies'::TEXT as check_name,
        CASE WHEN COUNT(*) = 0 THEN '✓ PASS' ELSE '✗ FAIL' END as status,
        string_agg(tablename, ', ') as details
    FROM pg_tables
    WHERE schemaname = 'public'
        AND rowsecurity = true
        AND tablename NOT IN (
            SELECT DISTINCT tablename 
            FROM pg_policies 
            WHERE schemaname = 'public'
        )
    GROUP BY check_name;

    -- Check 2: Policies without subquery optimization
    RETURN QUERY
    SELECT
        'Policies needing optimization'::TEXT as check_name,
        CASE WHEN COUNT(*) = 0 THEN '✓ PASS' ELSE '⚠️  WARNING' END as status,
        COUNT(*)::TEXT || ' policies using auth.uid() without subquery' as details
    FROM pg_policies
    WHERE schemaname = 'public'
        AND qual LIKE '%auth.uid()%'
        AND qual NOT LIKE '%(select auth.uid())%'
        AND qual NOT LIKE '%(SELECT auth.uid())%'
    GROUP BY check_name;

    -- Check 3: Large tables with many policies
    RETURN QUERY
    SELECT
        'Large tables with complex RLS'::TEXT as check_name,
        CASE WHEN COUNT(*) = 0 THEN '✓ PASS' ELSE '⚠️  WARNING' END as status,
        string_agg(tablename || ' (' || policy_count || ' policies)', ', ') as details
    FROM (
        SELECT
            t.tablename,
            COUNT(p.policyname) as policy_count,
            t.n_live_tup
        FROM pg_stat_user_tables t
        JOIN pg_policies p ON p.tablename = t.tablename
        WHERE t.schemaname = 'public'
            AND t.n_live_tup > 1000
        GROUP BY t.tablename, t.n_live_tup
        HAVING COUNT(p.policyname) > 3
    ) sub
    GROUP BY check_name;
END;
$$;

-- Run health check
SELECT * FROM public.rls_health_check();

-- =====================================================
-- RECOMMENDATIONS FOR YOUR APP
-- =====================================================

-- Based on your RLS fixes (from migration 21_fix_performance_rls_policies.sql):
-- ✓ You've already optimized auth.uid() calls with subqueries
-- ✓ Your policies use EXISTS for efficient lookups

-- Additional recommendations:
-- 1. Monitor query_performance_log for slow RLS queries
-- 2. Run rls_health_check() weekly
-- 3. Check rls_performance_recommendations view
-- 4. Ensure user_id columns are indexed on all tables with RLS
-- 5. Consider denormalizing user roles if queries are slow
