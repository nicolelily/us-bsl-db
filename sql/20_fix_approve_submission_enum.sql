-- Fix the approve_submission function to use proper enum schema prefix

-- Check current function first
SELECT pg_get_functiondef(p.oid) as current_function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
AND p.proname = 'approve_submission';

-- Create the fixed version of approve_submission function
-- The issue is missing 'public.' schema prefix for municipality_type enum
CREATE OR REPLACE FUNCTION public.approve_submission(
    submission_id uuid,
    admin_user_id uuid
)
RETURNS boolean AS $$
DECLARE
    legislation_id uuid;
BEGIN
    -- Insert approved submission data into breed_legislation table
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
        repeal_date,
        created_at,
        updated_at
    )
    SELECT 
        (submitted_data->>'municipality')::TEXT,
        (submitted_data->>'state')::TEXT,
        (submitted_data->>'municipality_type')::public.municipality_type,  -- FIXED: Added public. prefix
        (submitted_data->'banned_breeds')::JSONB,
        (submitted_data->>'ordinance')::TEXT,
        (submitted_data->>'population')::INTEGER,
        (submitted_data->>'lat')::NUMERIC,
        (submitted_data->>'lng')::NUMERIC,
        (submitted_data->>'verification_date')::DATE,
        (submitted_data->>'ordinance_url')::TEXT,
        COALESCE((submitted_data->>'legislation_type')::public.legislation_type, 'ban'::public.legislation_type),  -- FIXED: Added public. prefix
        (submitted_data->>'repeal_date')::DATE,
        NOW(),
        NOW()
    FROM public.submissions
    WHERE id = submission_id
    RETURNING id INTO legislation_id;

    -- Update submission status to approved
    UPDATE public.submissions
    SET 
        status = 'approved'::public.submission_status,  -- FIXED: Added public. prefix
        reviewed_by = admin_user_id,
        reviewed_at = NOW(),
        updated_at = NOW()
    WHERE id = submission_id;

    -- Update user contribution stats
    INSERT INTO public.user_contributions (user_id, approved_count, submission_count, reputation_score, created_at, updated_at)
    SELECT 
        s.user_id,
        1,
        1,
        10,
        NOW(),
        NOW()
    FROM public.submissions s
    WHERE s.id = submission_id
    ON CONFLICT (user_id) 
    DO UPDATE SET
        approved_count = user_contributions.approved_count + 1,
        reputation_score = user_contributions.reputation_score + 10,
        updated_at = NOW();

    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error and return false
        RAISE LOG 'Error in approve_submission: % %', SQLSTATE, SQLERRM;
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Test the fixed function
SELECT 'Fixed approve_submission function - now testing...' as status;

SELECT public.approve_submission(
    '70d575fb-7197-4670-821f-e79a5b455562'::uuid,
    (SELECT id FROM public.profiles WHERE email = 'nicolelily@me.com')
) as test_result;