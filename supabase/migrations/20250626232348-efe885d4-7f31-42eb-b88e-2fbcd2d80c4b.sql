
-- Remove duplicate records from breed_legislation table
-- This will keep only one record for each unique combination of municipality, state, type, and ordinance
WITH duplicates AS (
  SELECT id,
         ROW_NUMBER() OVER (
           PARTITION BY municipality, state, type, ordinance, banned_breeds::text
           ORDER BY id
         ) as row_num
  FROM breed_legislation
)
DELETE FROM breed_legislation 
WHERE id IN (
  SELECT id 
  FROM duplicates 
  WHERE row_num > 1
);
