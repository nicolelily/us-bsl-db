-- Enable and Configure Slow Query Logging in Supabase
-- Run these in the Supabase SQL Editor

-- =====================================================
-- 1. ENABLE SLOW QUERY LOGGING
-- Logs queries taking longer than specified threshold
-- =====================================================

-- Set minimum duration to log (in milliseconds)
-- Queries taking longer than this will be logged
ALTER DATABASE postgres SET log_min_duration_statement = 500;

-- Alternative: Set for current session only (for testing)
-- SET log_min_duration_statement = 500;

-- =====================================================
-- 2. CONFIGURE LOGGING DETAIL
-- =====================================================

-- Log query parameters (helpful for debugging)
ALTER DATABASE postgres SET log_statement = 'mod';  -- Log all DDL and DML

-- Log duration of all statements
ALTER DATABASE postgres SET log_duration = on;

-- =====================================================
-- 3. CREATE CUSTOM LOGGING TABLE
-- Track slow queries in your own table
-- =====================================================

-- Create table to store query performance metrics
CREATE TABLE IF NOT EXISTS public.query_performance_log (
    id BIGSERIAL PRIMARY KEY,
    query_text TEXT NOT NULL,
    execution_time_ms NUMERIC NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    table_name TEXT,
    operation TEXT CHECK (operation IN ('SELECT', 'INSERT', 'UPDATE', 'DELETE')),
    row_count INTEGER,
    created_at TIMESTAMPTZ DEFAULT now(),
    metadata JSONB
);

-- Create index for fast queries
CREATE INDEX IF NOT EXISTS idx_query_perf_created_at 
    ON public.query_performance_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_query_perf_execution_time 
    ON public.query_performance_log(execution_time_ms DESC);
CREATE INDEX IF NOT EXISTS idx_query_perf_user 
    ON public.query_performance_log(user_id);

-- Enable RLS
ALTER TABLE public.query_performance_log ENABLE ROW LEVEL SECURITY;

-- Admin-only access
CREATE POLICY "Admins can view query logs" ON public.query_performance_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = (select auth.uid()) 
            AND role = 'admin'::public.app_role
        )
    );

-- =====================================================
-- 4. FUNCTION TO LOG SLOW QUERIES
-- Call this from your application code
-- =====================================================

CREATE OR REPLACE FUNCTION public.log_query_performance(
    p_query_text TEXT,
    p_execution_time_ms NUMERIC,
    p_table_name TEXT DEFAULT NULL,
    p_operation TEXT DEFAULT NULL,
    p_row_count INTEGER DEFAULT NULL,
    p_metadata JSONB DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Only log if execution time exceeds threshold (500ms)
    IF p_execution_time_ms > 500 THEN
        INSERT INTO public.query_performance_log (
            query_text,
            execution_time_ms,
            user_id,
            table_name,
            operation,
            row_count,
            metadata
        ) VALUES (
            p_query_text,
            p_execution_time_ms,
            auth.uid(),
            p_table_name,
            p_operation,
            p_row_count,
            p_metadata
        );
    END IF;
END;
$$;

-- =====================================================
-- 5. QUERIES TO ANALYZE LOGGED DATA
-- =====================================================

-- View slowest queries in last 24 hours
SELECT
    query_text,
    execution_time_ms,
    table_name,
    operation,
    user_id,
    created_at
FROM public.query_performance_log
WHERE created_at > now() - interval '24 hours'
ORDER BY execution_time_ms DESC
LIMIT 20;

-- Average execution time by table
SELECT
    table_name,
    operation,
    COUNT(*) as query_count,
    ROUND(AVG(execution_time_ms)::numeric, 2) as avg_time_ms,
    ROUND(MAX(execution_time_ms)::numeric, 2) as max_time_ms,
    ROUND(MIN(execution_time_ms)::numeric, 2) as min_time_ms
FROM public.query_performance_log
WHERE created_at > now() - interval '7 days'
    AND table_name IS NOT NULL
GROUP BY table_name, operation
ORDER BY avg_time_ms DESC;

-- Slow queries by user
SELECT
    user_id,
    COUNT(*) as slow_query_count,
    ROUND(AVG(execution_time_ms)::numeric, 2) as avg_time_ms
FROM public.query_performance_log
WHERE created_at > now() - interval '7 days'
GROUP BY user_id
ORDER BY slow_query_count DESC
LIMIT 10;

-- Query performance trends over time
SELECT
    DATE_TRUNC('hour', created_at) as hour,
    COUNT(*) as query_count,
    ROUND(AVG(execution_time_ms)::numeric, 2) as avg_time_ms,
    ROUND(MAX(execution_time_ms)::numeric, 2) as max_time_ms
FROM public.query_performance_log
WHERE created_at > now() - interval '24 hours'
GROUP BY DATE_TRUNC('hour', created_at)
ORDER BY hour DESC;

-- =====================================================
-- 6. AUTOMATIC CLEANUP
-- Remove old logs to prevent table bloat
-- =====================================================

-- Create function to clean up old logs
CREATE OR REPLACE FUNCTION public.cleanup_old_query_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Delete logs older than 30 days
    DELETE FROM public.query_performance_log
    WHERE created_at < now() - interval '30 days';
END;
$$;

-- Note: Set up a cron job in Supabase to run this weekly
-- Go to: Database > Cron Jobs (if available in your plan)
-- Or run manually once a week

-- =====================================================
-- 7. VIEW FOR QUICK MONITORING
-- =====================================================

CREATE OR REPLACE VIEW public.query_performance_summary AS
SELECT
    COUNT(*) FILTER (WHERE execution_time_ms > 1000) as queries_over_1s,
    COUNT(*) FILTER (WHERE execution_time_ms > 500) as queries_over_500ms,
    COUNT(*) as total_slow_queries,
    ROUND(AVG(execution_time_ms)::numeric, 2) as avg_execution_time_ms,
    ROUND(MAX(execution_time_ms)::numeric, 2) as max_execution_time_ms,
    MIN(created_at) as oldest_log,
    MAX(created_at) as newest_log
FROM public.query_performance_log
WHERE created_at > now() - interval '24 hours';

-- Quick check
SELECT * FROM public.query_performance_summary;

-- =====================================================
-- NOTES
-- =====================================================

-- To check if slow query logging is enabled:
-- SHOW log_min_duration_statement;

-- To disable slow query logging:
-- ALTER DATABASE postgres SET log_min_duration_statement = -1;

-- View logs in Supabase Dashboard:
-- Go to: Logs > Postgres Logs
-- Filter by: log_min_duration_statement

-- Recommended thresholds:
-- - Development: 200-500ms
-- - Production: 500-1000ms
-- - Critical endpoints: 100ms
