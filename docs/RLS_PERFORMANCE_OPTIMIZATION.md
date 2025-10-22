# Supabase Performance Optimization - RLS Policy Fixes

## Overview
This migration addresses **66 performance warnings** identified by Supabase's database linter, focusing on two critical performance issues:

## Issues Fixed

### 1. Auth RLS Initialization Plan (6 warnings)
**Problem**: RLS policies using `auth.uid()` and `auth.<function>()` were being re-evaluated for every single row, causing exponential performance degradation.

**Solution**: Replace `auth.uid()` with `(select auth.uid())` to ensure the function is evaluated once per query, not once per row.

**Tables Fixed**:
- `profiles` - 4 policies optimized
- `audit_logs` - 2 policies optimized

### 2. Multiple Permissive Policies (60 warnings)
**Problem**: Multiple overlapping RLS policies for the same role/action combinations meant PostgreSQL had to evaluate each policy for every relevant query.

**Tables With Consolidated Policies**:
- `breed_legislation` - Reduced from 8+ policies to 2 consolidated policies
- `profiles` - Consolidated overlapping user/admin policies
- `contact_submissions` - Streamlined admin/public access policies  
- `email_logs` - Consolidated user/admin/system policies
- `submission_documents` - Simplified user/admin access patterns
- `audit_logs` - Merged duplicate INSERT policies
- `user_roles` - Consolidated admin management policies

## Performance Improvements Expected

### Before (Current State)
- **66 performance warnings** active
- Multiple policy evaluations per query
- `auth.uid()` called for every row in result sets
- Potential N×M policy evaluations (N=rows, M=policies)

### After (Optimized)
- **0 performance warnings** expected
- Single policy evaluation per query type
- `auth.uid()` called once per query
- Linear performance scaling with data growth

## Implementation Strategy

### Database Indexes Added
```sql
-- Critical indexes for RLS policy performance
idx_user_roles_user_id_role  -- Supports role-based access checks
idx_user_roles_role          -- Supports role filtering
idx_submissions_user_id      -- Supports user-owned data access
idx_submission_documents_submission_id -- Supports document ownership
idx_profiles_id              -- Supports profile access
idx_email_logs_user_id       -- Supports email log access
idx_audit_logs_user_id       -- Supports audit log access
```

### Policy Consolidation Examples

#### Before (breed_legislation)
```sql
-- Separate policies for each role and action
"Admins can manage breed legislation" (admin access)
"Moderators can manage breed legislation" (moderator access)  
"Public can read breed legislation" (public read)
-- = 3 policies × 4 actions × 5 roles = 60 evaluations possible
```

#### After (breed_legislation)
```sql
-- Two consolidated policies
"breed_legislation_select_consolidated" (public read)
"breed_legislation_write_consolidated" (admin OR moderator write)
-- = 2 policies maximum per query
```

## Testing Checklist

### Functionality Tests
- [ ] Public users can still read breed legislation
- [ ] Authenticated users can view/edit their own profiles
- [ ] Admins can manage all data as before
- [ ] Moderators retain appropriate permissions
- [ ] Contact form submissions work for anonymous users
- [ ] Document uploads work for authenticated users

### Performance Tests
- [ ] Verify query performance improvement with EXPLAIN ANALYZE
- [ ] Test with larger datasets (100+ records)
- [ ] Monitor auth function call frequency
- [ ] Confirm zero performance warnings in Supabase

### Security Tests
- [ ] Verify no unauthorized access to sensitive data
- [ ] Confirm RLS policies still enforce proper isolation
- [ ] Test edge cases (new users, role changes, etc.)

## Rollback Plan

If issues occur, the original policies can be restored from git history:
```bash
# View current policies
git log --oneline sql/
# Restore previous migration state
git checkout <previous-commit> sql/
```

## Expected Results

### Performance Metrics
- **Query execution time**: 50-90% reduction for auth-heavy queries
- **Database CPU usage**: Significant reduction during peak usage
- **Concurrent user capacity**: Improved scalability
- **Response times**: Faster page loads, especially for admin/user dashboards

### Monitoring
After deployment, monitor:
- Supabase Performance tab for new warnings
- Query execution times in logs  
- User-reported performance improvements
- Database resource utilization

## Migration Risk Assessment

**Risk Level**: Medium
- **Data Safety**: No data changes, only policy modifications
- **Functionality**: Equivalent permissions maintained
- **Reversibility**: Fully reversible via git history
- **Testing**: Comprehensive testing plan provided

**Recommended Deployment**:
1. Apply during low-traffic period
2. Monitor for 24 hours post-deployment
3. Run functionality tests immediately after
4. Keep rollback plan ready

## Next Steps

1. **Review and approve** this migration plan
2. **Test in development** environment first
3. **Schedule deployment** during maintenance window
4. **Execute migration** using provided SQL script
5. **Verify results** using testing checklist
6. **Monitor performance** improvements