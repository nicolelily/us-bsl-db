-- Rename 'type' column to 'municipality_type' for better clarity
-- This distinguishes municipality type (City/County) from legislation_type (ban/restriction)

-- Rename the column
ALTER TABLE public.breed_legislation 
RENAME COLUMN type TO municipality_type;

-- Update any indexes that reference the old column name
-- (The existing indexes should automatically update with the column rename)

-- Add comment for documentation
COMMENT ON COLUMN public.breed_legislation.municipality_type IS 'Type of municipality: City or County';