-- Add repeal tracking to breed legislation
-- This allows tracking when legislation has been repealed

-- Add 'repealed' to the legislation_type enum
ALTER TYPE legislation_type ADD VALUE 'repealed';

-- Add repeal_date column to breed_legislation table
ALTER TABLE public.breed_legislation 
ADD COLUMN repeal_date DATE;

-- Add index for filtering by repeal status
CREATE INDEX idx_breed_legislation_repeal_date ON public.breed_legislation(repeal_date);

-- Add comments for documentation
COMMENT ON COLUMN public.breed_legislation.repeal_date IS 'Date when the legislation was repealed (NULL if still active)';

-- Update the approve_submission function to handle repeal_date
CREATE OR REPLACE FUNCTION public.approve_submission(
    submission_id UUID,
    admin_user_id UUID
)
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = ''
AS $$
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
            municipality_type,
            banned_breeds,
            ordinance,
            population,
            lat,
            lng,
            verification_date,
            ordinance_url,
            legislation_type,
            repeal_date
        )
        SELECT 
            (submitted_data->>'municipality')::TEXT,
            (submitted_data->>'state')::TEXT,
            (submitted_data->>'municipality_type')::TEXT,
            (submitted_data->'banned_breeds')::JSONB,
            (submitted_data->>'ordinance')::TEXT,
            (submitted_data->>'population')::INTEGER,
            (submitted_data->>'lat')::NUMERIC,
            (submitted_data->>'lng')::NUMERIC,
            (submitted_data->>'verification_date')::DATE,
            (submitted_data->>'ordinance_url')::TEXT,
            COALESCE((submitted_data->>'legislation_type')::legislation_type, 'ban'),
            (submitted_data->>'repeal_date')::DATE
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
            municipality_type = COALESCE((submission_record.submitted_data->>'municipality_type')::TEXT, municipality_type),
            banned_breeds = COALESCE((submission_record.submitted_data->'banned_breeds')::JSONB, banned_breeds),
            ordinance = COALESCE((submission_record.submitted_data->>'ordinance')::TEXT, ordinance),
            population = COALESCE((submission_record.submitted_data->>'population')::INTEGER, population),
            lat = COALESCE((submission_record.submitted_data->>'lat')::NUMERIC, lat),
            lng = COALESCE((submission_record.submitted_data->>'lng')::NUMERIC, lng),
            verification_date = COALESCE((submission_record.submitted_data->>'verification_date')::DATE, verification_date),
            ordinance_url = COALESCE((submission_record.submitted_data->>'ordinance_url')::TEXT, ordinance_url),
            legislation_type = COALESCE((submission_record.submitted_data->>'legislation_type')::legislation_type, legislation_type),
            repeal_date = COALESCE((submitted_data->>'repeal_date')::DATE, repeal_date),
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
$$;

-- Create a helper function to mark legislation as repealed
CREATE OR REPLACE FUNCTION public.mark_legislation_repealed(
    legislation_id BIGINT,
    repeal_date_param DATE,
    admin_user_id UUID
)
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    -- Check if user has admin/moderator role
    IF NOT (public.has_role(admin_user_id, 'admin') OR public.has_role(admin_user_id, 'moderator')) THEN
        RAISE EXCEPTION 'Insufficient permissions';
    END IF;

    -- Update the legislation record
    UPDATE public.breed_legislation
    SET 
        legislation_type = 'repealed',
        repeal_date = repeal_date_param,
        updated_at = NOW()
    WHERE id = legislation_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Legislation record not found';
    END IF;

    -- Log the repeal
    PERFORM public.create_audit_log(
        'mark_legislation_repealed',
        'breed_legislation',
        legislation_id::TEXT,
        NULL,
        jsonb_build_object('repeal_date', repeal_date_param, 'admin_id', admin_user_id)
    );

    RETURN TRUE;
END;
$$;

-- Note: Additional indexes and views will be created in a follow-up migration
-- due to PostgreSQL enum value restrictions

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.mark_legislation_repealed(BIGINT, DATE, UUID) TO authenticated;