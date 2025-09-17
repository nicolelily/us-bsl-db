-- Add legislation_type column to breed_legislation table
-- This distinguishes between bans and restrictions

-- Create enum for legislation types
CREATE TYPE legislation_type AS ENUM ('ban', 'restriction');

-- Add the legislation_type column to breed_legislation table
ALTER TABLE public.breed_legislation 
ADD COLUMN legislation_type legislation_type;

-- Set all existing records to 'ban' since current data are all bans
UPDATE public.breed_legislation 
SET legislation_type = 'ban' 
WHERE legislation_type IS NULL;

-- Make the column NOT NULL now that all records have values
ALTER TABLE public.breed_legislation 
ALTER COLUMN legislation_type SET NOT NULL;

-- Set default value for new records
ALTER TABLE public.breed_legislation 
ALTER COLUMN legislation_type SET DEFAULT 'ban';

-- Add index for filtering by legislation type (if it doesn't exist)
CREATE INDEX IF NOT EXISTS idx_breed_legislation_type ON public.breed_legislation(legislation_type);

-- Add comment for documentation
COMMENT ON COLUMN public.breed_legislation.legislation_type IS 'Type of breed-specific legislation: ban (breed prohibition) or restriction (additional requirements like insurance)';

-- Update the approve_submission function to handle legislation_type
CREATE OR REPLACE FUNCTION public.approve_submission(
    submission_id UUID,
    admin_user_id UUID
)
RETURNS BOOLEAN AS $$$
DECLARE
    submission_record RECORD;
    new_legislation_id BIGINT;
BEGIN
    -- Get the submission
    SELECT * INTO submission_record
    FROM public.submissions
    WHERE id = submission_id AND status = 'pending';

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Submission not found or not pending';
    END IF;

    -- Check if user has admin/moderator role
    IF NOT (public.has_role(admin_user_id, 'admin') OR public.has_role(admin_user_id, 'moderator')) THEN
        RAISE EXCEPTION 'Insufficient permissions';
    END IF;

    -- Handle new legislation submission
    IF submission_record.type = 'new_legislation' THEN
        INSERT INTO public.breed_legislation (
            municipality,
            state,
            type,
            banned_breeds,
            ordinance,
            population,
            lat,
            lng,
            verification_date,
            ordinance_url,
            legislation_type
        )
        SELECT 
            (submitted_data->>'municipality')::TEXT,
            (submitted_data->>'state')::TEXT,
            (submitted_data->>'type')::TEXT,
            (submitted_data->'banned_breeds')::JSONB,
            (submitted_data->>'ordinance')::TEXT,
            (submitted_data->>'population')::INTEGER,
            (submitted_data->>'lat')::NUMERIC,
            (submitted_data->>'lng')::NUMERIC,
            (submitted_data->>'verification_date')::DATE,
            (submitted_data->>'ordinance_url')::TEXT,
            COALESCE((submitted_data->>'legislation_type')::legislation_type, 'ban')
        FROM public.submissions
        WHERE id = submission_id
        RETURNING id INTO new_legislation_id;

        -- Log the creation
        PERFORM public.create_audit_log(
            'approve_new_legislation',
            'submissions',
            submission_id::TEXT,
            NULL,
            row_to_json(submission_record)::JSONB
        );

    -- Handle update to existing legislation
    ELSIF submission_record.type = 'update_existing' AND submission_record.original_record_id IS NOT NULL THEN
        UPDATE public.breed_legislation
        SET 
            municipality = COALESCE((submission_record.submitted_data->>'municipality')::TEXT, municipality),
            state = COALESCE((submission_record.submitted_data->>'state')::TEXT, state),
            type = COALESCE((submission_record.submitted_data->>'type')::TEXT, type),
            banned_breeds = COALESCE((submission_record.submitted_data->'banned_breeds')::JSONB, banned_breeds),
            ordinance = COALESCE((submission_record.submitted_data->>'ordinance')::TEXT, ordinance),
            population = COALESCE((submission_record.submitted_data->>'population')::INTEGER, population),
            lat = COALESCE((submission_record.submitted_data->>'lat')::NUMERIC, lat),
            lng = COALESCE((submission_record.submitted_data->>'lng')::NUMERIC, lng),
            verification_date = COALESCE((submission_record.submitted_data->>'verification_date')::DATE, verification_date),
            ordinance_url = COALESCE((submission_record.submitted_data->>'ordinance_url')::TEXT, ordinance_url),
            legislation_type = COALESCE((submission_record.submitted_data->>'legislation_type')::legislation_type, legislation_type),
            updated_at = NOW()
        WHERE id = submission_record.original_record_id;

        -- Log the update
        PERFORM public.create_audit_log(
            'approve_legislation_update',
            'breed_legislation',
            submission_record.original_record_id::TEXT,
            NULL,
            submission_record.submitted_data
        );
    END IF;

    -- Update submission status
    UPDATE public.submissions
    SET 
        status = 'approved',
        reviewed_by = admin_user_id,
        reviewed_at = NOW(),
        updated_at = NOW()
    WHERE id = submission_id;

    RETURN TRUE;
END;
$$$ LANGUAGE plpgsql SECURITY DEFINER;