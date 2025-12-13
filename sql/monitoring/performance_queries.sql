-- Supabase Performance Monitoring Queries
-- Run these queries in the Supabase SQL Editor to monitor database health

-- =====================================================
-- 1. SLOW QUERY MONITORING
-- Find queries taking longer than 500ms
-- =====================================================

-- View current slow queries
SELECT 
    pid,
    now() - pg_stat_activity.query_start AS duration,
    query,
    state,
    wait_event_type,
    wait_event
FROM pg_stat_activity
WHERE (now() - pg_stat_activity.query_start) > interval '500 milliseconds'
    AND state != 'idle'
    AND query NOT ILIKE '%pg_stat_activity%'
ORDER BY duration DESC;

-- =====================================================
-- 2. TABLE STATISTICS
-- Monitor table sizes and row counts
-- =====================================================

SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
    pg_total_relation_size(schemaname||'.'||tablename) AS size_bytes,
    n_live_tup AS row_count,
    n_dead_tup AS dead_rows,
    last_vacuum,
    last_autovacuum,
    last_analyze,
    last_autoanalyze
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- =====================================================
-- 3. INDEX USAGE STATISTICS
-- Find unused or rarely used indexes
-- =====================================================

SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan AS index_scans,
    idx_tup_read AS tuples_read,
    idx_tup_fetch AS tuples_fetched,
    pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan ASC, pg_relation_size(indexrelid) DESC;

-- =====================================================
-- 4. MISSING INDEXES
-- Find sequential scans that might benefit from indexes
-- =====================================================

SELECT
    schemaname,
    tablename,
    seq_scan AS sequential_scans,
    seq_tup_read AS rows_read_sequentially,
    idx_scan AS index_scans,
    seq_tup_read / seq_scan AS avg_rows_per_scan,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS table_size
FROM pg_stat_user_tables
WHERE schemaname = 'public'
    AND seq_scan > 0
    AND seq_tup_read / seq_scan > 1000  -- More than 1000 rows per scan
ORDER BY seq_tup_read DESC;

-- =====================================================
-- 5. DATABASE CONNECTION STATS
-- Monitor connection pool usage
-- =====================================================

SELECT
    state,
    COUNT(*) as connections,
    MAX(now() - state_change) as max_time_in_state
FROM pg_stat_activity
WHERE datname = current_database()
GROUP BY state
ORDER BY connections DESC;

-- =====================================================
-- 6. CACHE HIT RATIO
-- Should be > 99% for good performance
-- =====================================================

SELECT
    'cache hit rate' AS metric,
    sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read)) AS ratio,
    CASE 
        WHEN sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read)) > 0.99 
        THEN '✓ Good' 
        ELSE '✗ Needs attention' 
    END AS status
FROM pg_statio_user_tables
WHERE schemaname = 'public';

-- =====================================================
-- 7. RLS POLICY PERFORMANCE
-- Check if RLS policies are causing performance issues
-- =====================================================

-- List all tables with RLS enabled
SELECT
    schemaname,
    tablename,
    rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
    AND rowsecurity = true;

-- Count policies per table
SELECT
    schemaname,
    tablename,
    COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY schemaname, tablename
ORDER BY policy_count DESC;

-- =====================================================
-- 8. LOCK MONITORING
-- Find queries waiting on locks
-- =====================================================

SELECT
    blocked_locks.pid AS blocked_pid,
    blocked_activity.usename AS blocked_user,
    blocking_locks.pid AS blocking_pid,
    blocking_activity.usename AS blocking_user,
    blocked_activity.query AS blocked_statement,
    blocking_activity.query AS blocking_statement,
    blocked_activity.application_name AS blocked_application
FROM pg_catalog.pg_locks blocked_locks
JOIN pg_catalog.pg_stat_activity blocked_activity ON blocked_activity.pid = blocked_locks.pid
JOIN pg_catalog.pg_locks blocking_locks 
    ON blocking_locks.locktype = blocked_locks.locktype
    AND blocking_locks.database IS NOT DISTINCT FROM blocked_locks.database
    AND blocking_locks.relation IS NOT DISTINCT FROM blocked_locks.relation
    AND blocking_locks.page IS NOT DISTINCT FROM blocked_locks.page
    AND blocking_locks.tuple IS NOT DISTINCT FROM blocked_locks.tuple
    AND blocking_locks.virtualxid IS NOT DISTINCT FROM blocked_locks.virtualxid
    AND blocking_locks.transactionid IS NOT DISTINCT FROM blocked_locks.transactionid
    AND blocking_locks.classid IS NOT DISTINCT FROM blocked_locks.classid
    AND blocking_locks.objid IS NOT DISTINCT FROM blocked_locks.objid
    AND blocking_locks.objsubid IS NOT DISTINCT FROM blocked_locks.objsubid
    AND blocking_locks.pid != blocked_locks.pid
JOIN pg_catalog.pg_stat_activity blocking_activity ON blocking_activity.pid = blocking_locks.pid
WHERE NOT blocked_locks.granted;

-- =====================================================
-- 9. STORAGE API USAGE
-- Monitor storage bucket sizes (if using Supabase storage)
-- =====================================================

-- Note: Run this in Supabase dashboard's Storage section or API
-- SELECT 
--     buckets.name,
--     COUNT(objects.id) as file_count,
--     SUM(objects.metadata->>'size')::bigint as total_size_bytes,
--     pg_size_pretty(SUM(objects.metadata->>'size')::bigint) as total_size
-- FROM storage.buckets
-- LEFT JOIN storage.objects ON buckets.id = objects.bucket_id
-- GROUP BY buckets.name;

-- =====================================================
-- 10. API REQUEST PATTERNS
-- Monitor which tables get the most queries
-- =====================================================

SELECT
    schemaname,
    tablename,
    seq_scan + idx_scan AS total_scans,
    seq_scan AS sequential_scans,
    idx_scan AS index_scans,
    n_tup_ins AS inserts,
    n_tup_upd AS updates,
    n_tup_del AS deletes,
    n_live_tup AS live_rows
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY (seq_scan + idx_scan) DESC
LIMIT 20;

-- =====================================================
-- RECOMMENDATIONS
-- =====================================================

-- Run these queries weekly to:
-- 1. Identify slow queries that need optimization
-- 2. Find tables that need indexes
-- 3. Monitor connection pool usage
-- 4. Check cache hit ratios
-- 5. Identify unused indexes to remove
-- 6. Monitor RLS policy impact
-- 7. Watch for locking issues
-- 8. Track storage growth
-- 9. Analyze query patterns

-- Set up alerts in Supabase dashboard for:
-- - Cache hit ratio < 99%
-- - Connection pool > 80% utilized
-- - Queries taking > 1s
-- - Dead tuple ratio > 20%
