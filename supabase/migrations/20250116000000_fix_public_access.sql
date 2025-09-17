-- Fix public access to breed_legislation table
-- This migration ensures the breed_legislation table is publicly readable
-- even when legacy API keys are disabled

-- Drop the existing policy that might be causing issues
DROP POLICY IF EXISTS "Public can read breed legislation" ON public.breed_legislation;

-- Create a new policy that allows public read access (if it doesn't exist)
-- This policy should work regardless of authentication status
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'breed_legislation' 
        AND policyname = 'Allow public read access to breed legislation'
    ) THEN
        CREATE POLICY "Allow public read access to breed legislation"
          ON public.breed_legislation
          FOR SELECT
          TO public
          USING (true);
    END IF;
END $$;

-- Also ensure anonymous users can access the table
GRANT SELECT ON public.breed_legislation TO anon;
GRANT SELECT ON public.breed_legislation TO authenticated;

-- Make sure RLS is enabled but allows public access
ALTER TABLE public.breed_legislation ENABLE ROW LEVEL SECURITY;