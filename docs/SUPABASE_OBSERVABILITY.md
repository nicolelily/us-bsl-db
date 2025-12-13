# Supabase Observability Guide

This guide covers how to monitor and optimize your Supabase database performance for the US BSL Database application.

## Overview

Supabase provides built-in monitoring tools plus custom queries to track:
- Database performance and slow queries
- API usage and rate limits
- Authentication metrics
- Storage usage
- RLS policy performance
- Connection pool utilization

## Quick Start

### 1. Access Supabase Dashboard

Go to your Supabase project dashboard: `https://supabase.com/dashboard/project/[your-project-id]`

### 2. Key Sections to Monitor

#### **Reports Tab** (Most Important)
- **Database Health**: Query performance, connection pool, cache hit ratio
- **API Usage**: Request counts, error rates, bandwidth
- **Database Size**: Table sizes, row counts, storage usage
- **Auth**: Sign-ups, logins, active users

#### **Database Tab → Query Editor**
- Run custom monitoring queries (see `sql/monitoring/` directory)
- Execute performance analysis scripts

#### **Logs Tab**
- **Postgres Logs**: SQL errors, slow queries, connection issues
- **API Logs**: HTTP requests, response times, errors
- **Function Logs**: Edge function execution (if used)

## Monitoring Queries

We've created SQL scripts in `/sql/monitoring/` to help you monitor performance:

### 1. General Performance (`performance_queries.sql`)

Run these queries regularly to check database health:

```sql
-- Find slow queries (> 500ms)
-- Copy from: sql/monitoring/performance_queries.sql - Section 1

-- Check cache hit ratio (should be > 99%)
-- Copy from: sql/monitoring/performance_queries.sql - Section 6

-- Monitor table sizes and growth
-- Copy from: sql/monitoring/performance_queries.sql - Section 2
```

**When to run**: Weekly or after deployments

### 2. Slow Query Logging (`slow_query_logging.sql`)

Set up automatic logging of slow queries:

```sql
-- Enable slow query logging (queries > 500ms)
ALTER DATABASE postgres SET log_min_duration_statement = 500;

-- Create custom logging table
-- Run full script: sql/monitoring/slow_query_logging.sql
```

**Benefits**:
- Track query performance over time
- Identify problematic queries
- Monitor trends and regressions

### 3. RLS Performance (`rls_performance.sql`)

Your app heavily uses Row Level Security (RLS). Monitor its impact:

```sql
-- Run RLS health check
SELECT * FROM public.rls_health_check();

-- View recommendations
SELECT * FROM public.rls_performance_recommendations;

-- Find missing indexes on filtered columns
-- Run: sql/monitoring/rls_performance.sql - Section 7
```

**When to run**: After adding new RLS policies or if queries are slow

## Key Metrics to Track

### Database Performance

| Metric | Target | Warning Level | Action |
|--------|--------|---------------|--------|
| Cache Hit Ratio | > 99% | < 95% | Review indexes, increase memory |
| Slow Queries (>500ms) | < 10/day | > 50/day | Optimize queries, add indexes |
| Connection Pool | < 60% | > 80% | Review connection usage, optimize pooling |
| Dead Tuples | < 10% | > 20% | Run VACUUM, check autovacuum settings |
| Table Size Growth | Steady | Sudden spike | Check for data issues, orphaned records |

### API Performance

| Metric | Target | Warning Level | Action |
|--------|--------|---------------|--------|
| Avg Response Time | < 200ms | > 500ms | Optimize queries, check RLS policies |
| Error Rate | < 1% | > 5% | Review logs, check data validation |
| Bandwidth Usage | Steady | Spike | Check for data leaks, optimize payloads |
| Requests/min | Expected load | 2x normal | Scale up or investigate abuse |

### Authentication

| Metric | Monitor For | Action |
|--------|-------------|--------|
| Failed Logins | Sudden spike | Security issue, investigate |
| New Signups | Growth trends | Capacity planning |
| Active Users | Daily/weekly active | Product metrics |
| Auth Errors | Rate limit hits | Review client code |

## Monitoring Schedule

### Daily (Automated Alerts)
- [ ] Error rate > 5%
- [ ] Slow queries > 1s
- [ ] Connection pool > 80%
- [ ] Failed auth attempts spike

### Weekly (Manual Review)
- [ ] Run `performance_queries.sql` - Sections 1, 2, 6
- [ ] Check Reports → Database Health
- [ ] Review top 10 slowest queries
- [ ] Check table size growth
- [ ] Monitor API usage trends

### Monthly (Deep Dive)
- [ ] Run full RLS performance analysis
- [ ] Review query_performance_log trends
- [ ] Analyze user activity patterns
- [ ] Check for unused indexes
- [ ] Review storage usage and cleanup

## Setting Up Alerts

### Supabase Dashboard Alerts

Currently limited in free tier. Available alerts:
1. Database size approaching limit
2. Bandwidth usage warnings
3. Project approaching rate limits

### Custom Alerting (Recommended)

Since Supabase alerts are limited, use Sentry and external monitoring:

1. **Sentry** (already configured):
   - Captures database errors in application
   - Tracks API performance
   - Monitors user-facing issues

2. **Email Notifications** (manual):
   - Run monitoring queries weekly
   - Set calendar reminder
   - Review dashboard metrics

3. **Future: Supabase Edge Functions** (optional):
   - Create function to check metrics
   - Run on schedule
   - Send alerts via email/webhook

## Common Issues & Solutions

### Issue: Slow Queries

**Symptoms**: Reports show queries > 500ms, API feels sluggish

**Diagnosis**:
```sql
-- Find slow queries
SELECT * FROM query_performance_log 
WHERE execution_time_ms > 500 
ORDER BY execution_time_ms DESC 
LIMIT 20;
```

**Solutions**:
1. Add indexes on frequently filtered columns
2. Optimize RLS policies (use subqueries)
3. Reduce data returned (add LIMIT, pagination)
4. Cache frequently accessed data

### Issue: High Connection Count

**Symptoms**: Connection pool warnings, "too many connections" errors

**Diagnosis**:
```sql
-- Check connection stats
SELECT state, COUNT(*) 
FROM pg_stat_activity 
WHERE datname = current_database() 
GROUP BY state;
```

**Solutions**:
1. Review React Query caching settings
2. Reduce simultaneous API calls
3. Implement connection pooling in client
4. Consider upgrading Supabase plan

### Issue: Cache Hit Ratio < 99%

**Symptoms**: Poor query performance, high database load

**Diagnosis**:
```sql
-- Check cache hit ratio
SELECT 'cache hit rate' AS metric,
    sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read)) AS ratio
FROM pg_statio_user_tables;
```

**Solutions**:
1. Add missing indexes
2. Upgrade database memory (higher tier)
3. Optimize large sequential scans
4. Review query patterns

### Issue: RLS Policies Slow

**Symptoms**: Queries fast in SQL editor but slow in app

**Diagnosis**:
```sql
-- Run RLS health check
SELECT * FROM rls_health_check();

-- Check for unoptimized policies
SELECT * FROM rls_performance_recommendations;
```

**Solutions**:
1. Ensure `auth.uid()` wrapped in subquery: `(select auth.uid())`
2. Add indexes on `user_id` columns
3. Simplify complex policy logic
4. Consider denormalizing user permissions

## Performance Optimization Checklist

### Indexes
- [ ] All foreign keys indexed
- [ ] Columns used in WHERE clauses indexed
- [ ] `user_id` columns indexed (for RLS)
- [ ] Composite indexes for common query patterns
- [ ] Remove unused indexes (check `performance_queries.sql` Section 3)

### Queries
- [ ] Use pagination (LIMIT/OFFSET)
- [ ] Only SELECT needed columns
- [ ] Use EXISTS instead of COUNT when checking existence
- [ ] Batch operations when possible
- [ ] Avoid N+1 queries (use JOINs or batch fetches)

### RLS Policies
- [ ] Auth functions use subqueries: `(select auth.uid())`
- [ ] Complex policies use indexed columns
- [ ] Avoid multiple EXISTS subqueries if possible
- [ ] Test policy performance with EXPLAIN ANALYZE

### Application Level
- [ ] React Query caching configured (already done ✓)
- [ ] Implement optimistic updates
- [ ] Debounce search queries
- [ ] Lazy load large datasets
- [ ] Compress API responses

## Database Maintenance

### Regular Tasks

**Weekly**:
```sql
-- Check for tables needing vacuum
SELECT schemaname, tablename, n_dead_tup, n_live_tup,
    ROUND(n_dead_tup::numeric / NULLIF(n_live_tup, 0) * 100, 2) as dead_ratio
FROM pg_stat_user_tables
WHERE n_dead_tup > 1000
ORDER BY dead_ratio DESC;
```

**Monthly**:
```sql
-- Cleanup old query logs (if enabled)
SELECT cleanup_old_query_logs();

-- Analyze tables for better query planning
ANALYZE;
```

**As Needed**:
```sql
-- Reindex if index bloat suspected
REINDEX TABLE table_name;

-- Manual vacuum if autovacuum not keeping up
VACUUM ANALYZE table_name;
```

## Capacity Planning

### Current Usage Tracking

Monitor these metrics for capacity planning:

1. **Database Size**: Reports → Database Size
   - Track growth rate
   - Free tier: 500MB limit
   - Pro tier: 8GB included

2. **Bandwidth**: Reports → API Usage
   - Track monthly bandwidth
   - Free tier: 5GB egress
   - Pro tier: 250GB included

3. **Monthly Active Users**: Reports → Auth
   - Track growth trends
   - Plan for 1000 MAU target

### Scaling Triggers

Consider upgrading to Pro plan ($25/mo) when:
- Database size > 400MB (80% of free tier)
- Bandwidth > 4GB/month
- Need better performance (more compute)
- Need additional features (point-in-time recovery, etc.)

## Integration with Sentry

Your Sentry setup (Step 1) already captures:
- Database errors in the application
- Query failures from React Query
- User context for error debugging

**Pro tip**: Add database context to Sentry errors:

```typescript
// In your Supabase client hooks
const { trackAction, setContext } = useSentryTracking();

// Before making query
setContext('database', {
  table: 'community_submissions',
  operation: 'SELECT',
});
trackAction('database_query', { table: 'community_submissions' });
```

## Resources

### Supabase Documentation
- [Performance Tuning](https://supabase.com/docs/guides/database/performance)
- [Database Monitoring](https://supabase.com/docs/guides/platform/metrics)
- [RLS Best Practices](https://supabase.com/docs/guides/auth/row-level-security)

### SQL Scripts
- `sql/monitoring/performance_queries.sql` - General performance monitoring
- `sql/monitoring/slow_query_logging.sql` - Set up query performance logging
- `sql/monitoring/rls_performance.sql` - RLS-specific monitoring

### Your Existing Docs
- `docs/RLS_PERFORMANCE_OPTIMIZATION.md` - RLS optimization guide
- `docs/RLS_TROUBLESHOOTING.md` - Troubleshooting RLS issues
- `sql/migrations/21_fix_performance_rls_policies.sql` - Your RLS optimizations

## Next Steps

1. ✅ Run initial performance audit:
   ```sql
   -- In Supabase SQL Editor, run:
   \i sql/monitoring/performance_queries.sql
   ```

2. ⬜ Enable slow query logging:
   ```sql
   -- Run sections 1-2 from:
   \i sql/monitoring/slow_query_logging.sql
   ```

3. ⬜ Set up weekly monitoring routine:
   - Add calendar reminder
   - Create checklist in your project management tool

4. ⬜ Review RLS health:
   ```sql
   \i sql/monitoring/rls_performance.sql
   SELECT * FROM rls_health_check();
   ```

5. ⬜ Configure Sentry database context (optional enhancement)
