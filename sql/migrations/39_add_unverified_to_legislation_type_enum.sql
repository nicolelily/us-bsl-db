-- Migration: Add 'unverified' to legislation_type enum
ALTER TYPE legislation_type ADD VALUE IF NOT EXISTS 'unverified';
-- If your enum is in a specific schema, prefix with schema name, e.g. public.legislation_type
