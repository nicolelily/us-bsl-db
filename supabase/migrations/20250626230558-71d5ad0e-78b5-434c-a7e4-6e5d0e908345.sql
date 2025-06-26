
-- Reset the sequence for breed_legislation table to avoid duplicate key errors
SELECT setval('breed_legislation_id_seq', (SELECT MAX(id) FROM breed_legislation) + 1);
