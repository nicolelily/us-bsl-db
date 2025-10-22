# SQL Scripts Organization

This directory contains database scripts organized into two main categories:

## Directory Structure

### `/migrations/`
Production migration scripts that have been applied to the database:

- `01_create_profile_trigger.sql` - Automatic profile creation trigger
- `02_create_user_role_trigger.sql` - User role management trigger  
- `03_fix_function_security.sql` - Security function improvements
- `20_fix_approve_submission_enum.sql` - Enum type fixes for submissions
- `21_fix_performance_rls_policies.sql` - RLS performance optimizations
- `35a_create_profiles_for_existing_users.sql` - Backfill missing profiles
- `38_fix_duplicate_roles.sql` - Remove duplicate user role entries

### `/reference/`
Important solution scripts kept for reference and documentation:

- `ultra_clean_user_roles_rls.sql` - **Main RLS fix** - Resolves infinite recursion issues
- `redesign_user_roles_rls.sql` - Alternative RLS approach (not used)
- `fix_rls_infinite_recursion.sql` - Original recursion fix attempt

## Key Solutions

### RLS Infinite Recursion Fix
The main breakthrough was in `ultra_clean_user_roles_rls.sql`, which resolved the circular dependency issue by:

1. **Removing circular policies** that called functions querying the same table
2. **Using SECURITY DEFINER functions** to bypass RLS in admin checks
3. **Simplifying policy structure** to avoid complex interdependencies

### Performance Improvements
- Added proper indexes on frequently queried columns
- Simplified RLS policy conditions
- Optimized admin function queries

## Usage Notes

- **Never run migration scripts twice** - they contain one-time fixes
- **Reference scripts are for study only** - the database already contains their fixes
- **Always test in staging** before applying any new database changes

## Related Documentation

- [`/docs/USER_ROLE_POLICIES.md`](../docs/USER_ROLE_POLICIES.md) - Current RLS policy documentation
- [`/docs/RLS_TROUBLESHOOTING.md`](../docs/RLS_TROUBLESHOOTING.md) - Troubleshooting guide based on real issues

## Database Schema

The main tables affected by these scripts:

```
auth.users (Supabase managed)
├── profiles (1:1)
└── user_roles (1:1)

breed_legislation (public data)
```

All tables have appropriate RLS policies enabling:
- Anonymous read access to public data
- User access to own data  
- Admin access to all data for management

---

**Last Updated**: October 2025  
**Status**: Production Ready ✅