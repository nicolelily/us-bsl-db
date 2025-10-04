# Repeal Tracking Documentation

## Overview

The BSL database now supports tracking when breed-specific legislation has been repealed. This provides historical context and ensures accurate representation of current legal status.

## Database Changes

### New Fields

**breed_legislation table:**
- `repeal_date` (DATE, nullable) - Date when the legislation was repealed
- `legislation_type` enum now includes 'repealed' value

### Legislation Types

- `ban` - Breed prohibition legislation (default)
- `restriction` - Additional requirements (insurance, etc.)
- `repealed` - Previously active legislation that has been repealed

## Usage

### Marking Legislation as Repealed

**For Admins/Moderators:**
Use the `mark_legislation_repealed()` function:

```sql
SELECT public.mark_legislation_repealed(
    legislation_id := 123,
    repeal_date_param := '2024-03-15',
    admin_user_id := 'your-admin-uuid'
);
```

**Via User Submissions:**
Users can submit updates with:
- `legislation_type`: 'repealed'
- `repeal_date`: Date of repeal

### Querying Data

**Active legislation only:**
```sql
SELECT * FROM public.active_breed_legislation;
-- OR
SELECT * FROM public.breed_legislation 
WHERE legislation_type != 'repealed' OR legislation_type IS NULL;
```

**Repealed legislation only:**
```sql
SELECT * FROM public.repealed_breed_legislation;
-- OR
SELECT * FROM public.breed_legislation 
WHERE legislation_type = 'repealed';
```

**All legislation with repeal status:**
```sql
SELECT 
    municipality,
    state,
    legislation_type,
    repeal_date,
    CASE 
        WHEN legislation_type = 'repealed' THEN 'Repealed'
        ELSE 'Active'
    END as status
FROM public.breed_legislation;
```

## Frontend Integration

### Display Logic

**Status Display:**
- Show "Active" for ban/restriction types
- Show "Repealed" for repealed type
- Display repeal_date when legislation_type = 'repealed'

**Filtering:**
- Default view: Show only active legislation
- Add toggle/filter for "Include Repealed"
- Separate section for "Recently Repealed"

### Form Fields

**Submission Forms:**
- Add "Repeal Date" field (conditional on legislation_type = 'repealed')
- Update legislation_type dropdown to include "Repealed"

**Admin Interface:**
- Quick action to mark legislation as repealed
- Bulk operations for multiple repeals
- Audit trail showing who marked what as repealed

## API Considerations

### Default Behavior
- Most API endpoints should return only active legislation by default
- Provide explicit parameters to include repealed legislation

### Example Endpoints
```
GET /api/legislation              # Active only
GET /api/legislation?include=all  # Include repealed
GET /api/legislation/repealed     # Repealed only
```

## Data Migration

### Existing Data
- All existing records remain unchanged (legislation_type = 'ban' or 'restriction')
- repeal_date is NULL for all existing records
- No data migration needed

### Historical Updates
When updating historical data:
1. Set legislation_type = 'repealed'
2. Set repeal_date to the actual repeal date
3. Keep original ordinance/verification_date for historical reference

## Performance

### Indexes
- `idx_breed_legislation_repeal_date` - For filtering by repeal date
- `idx_breed_legislation_active` - Optimized for active legislation queries

### Views
- `active_breed_legislation` - Pre-filtered active legislation
- `repealed_breed_legislation` - Pre-filtered repealed legislation

## Security

### Permissions
- Only admins/moderators can use `mark_legislation_repealed()` function
- Regular users can submit repeal information via normal submission process
- All repeal actions are logged in audit_logs table

### Audit Trail
Every repeal action creates an audit log entry with:
- Action: 'mark_legislation_repealed'
- Admin user ID
- Repeal date
- Legislation ID

## Examples

### Common Queries

**Recently repealed legislation:**
```sql
SELECT municipality, state, repeal_date
FROM public.breed_legislation
WHERE legislation_type = 'repealed'
AND repeal_date >= CURRENT_DATE - INTERVAL '1 year'
ORDER BY repeal_date DESC;
```

**States with most repeals:**
```sql
SELECT state, COUNT(*) as repeal_count
FROM public.breed_legislation
WHERE legislation_type = 'repealed'
GROUP BY state
ORDER BY repeal_count DESC;
```

**Timeline of legislation changes:**
```sql
SELECT 
    municipality,
    state,
    verification_date as enacted_date,
    repeal_date,
    CASE 
        WHEN repeal_date IS NOT NULL 
        THEN repeal_date - verification_date 
        ELSE CURRENT_DATE - verification_date 
    END as duration_days
FROM public.breed_legislation
ORDER BY verification_date DESC;
```

## Future Enhancements

### Potential Features
- Repeal reason tracking
- Replacement legislation linking
- Notification system for repeals
- Statistical analysis of repeal trends
- Geographic visualization of repeals over time

---

*Last updated: October 4, 2025*