-- Add additional indexes and views for repeal tracking
-- This is a separate migration due to PostgreSQL enum value restrictions

-- Add index for active legislation (not repealed)
CREATE INDEX idx_breed_legislation_active ON public.breed_legislation(legislation_type) 
WHERE legislation_type != 'repealed';

-- Create a view for active legislation (not repealed)
CREATE OR REPLACE VIEW public.active_breed_legislation AS
SELECT *
FROM public.breed_legislation
WHERE legislation_type != 'repealed' OR legislation_type IS NULL;

-- Create a view for repealed legislation
CREATE OR REPLACE VIEW public.repealed_breed_legislation AS
SELECT *
FROM public.breed_legislation
WHERE legislation_type = 'repealed';

-- Grant permissions on views
GRANT SELECT ON public.active_breed_legislation TO authenticated;
GRANT SELECT ON public.repealed_breed_legislation TO authenticated;

-- Add comments for the views
COMMENT ON VIEW public.active_breed_legislation IS 'View of all active (non-repealed) breed legislation';
COMMENT ON VIEW public.repealed_breed_legislation IS 'View of all repealed breed legislation';