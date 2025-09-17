-- Convert breed_legislation table from integer ID to UUID
-- This makes the schema consistent and better for distributed systems

-- First, let's create a new UUID column
ALTER TABLE public.breed_legislation 
ADD COLUMN new_id UUID DEFAULT gen_random_uuid();

-- Update all records to have UUIDs
UPDATE public.breed_legislation 
SET new_id = gen_random_uuid() 
WHERE new_id IS NULL;

-- Make the new UUID column NOT NULL
ALTER TABLE public.breed_legislation 
ALTER COLUMN new_id SET NOT NULL;

-- Drop the old primary key constraint
ALTER TABLE public.breed_legislation 
DROP CONSTRAINT breed_legislation_pkey;

-- Drop the old id column
ALTER TABLE public.breed_legislation 
DROP COLUMN id;

-- Rename new_id to id
ALTER TABLE public.breed_legislation 
RENAME COLUMN new_id TO id;

-- Add the new primary key constraint
ALTER TABLE public.breed_legislation 
ADD CONSTRAINT breed_legislation_pkey PRIMARY KEY (id);

-- Update any existing foreign key references in submissions table
-- (This should be safe since we haven't deployed submissions yet, but good to be explicit)
ALTER TABLE public.submissions 
ALTER COLUMN original_record_id TYPE UUID USING original_record_id::UUID;

-- Add comment for documentation
COMMENT ON COLUMN public.breed_legislation.id IS 'UUID primary key for breed legislation records';