-- Fix function search paths for security
-- This migration adds SET search_path = '' to all functions to prevent schema manipulation attacks

-- Fix handle_updated_at function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Fix initialize_user_contributions function
CREATE OR REPLACE FUNCTION public.initialize_user_contributions()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.user_contributions (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$;

-- Fix update_user_contribution_stats function
CREATE OR REPLACE FUNCTION public.update_user_contribution_stats()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    -- If this is a new submission
    IF TG_OP = 'INSERT' THEN
        UPDATE public.user_contributions
        SET 
            submission_count = submission_count + 1,
            last_contribution = NEW.created_at,
            updated_at = NOW()
        WHERE user_id = NEW.user_id;
        RETURN NEW;
    END IF;

    -- If submission status is being updated
    IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
        -- Handle approval
        IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
            UPDATE public.user_contributions
            SET 
                approved_count = approved_count + 1,
                reputation_score = reputation_score + 10, -- +10 points for approval
                updated_at = NOW()
            WHERE user_id = NEW.user_id;
        END IF;

        -- Handle rejection
        IF NEW.status = 'rejected' AND OLD.status != 'rejected' THEN
            UPDATE public.user_contributions
            SET 
                rejected_count = rejected_count + 1,
                reputation_score = GREATEST(reputation_score - 2, 0), -- -2 points for rejection, min 0
                updated_at = NOW()
            WHERE user_id = NEW.user_id;
        END IF;

        -- Handle moving from approved back to pending (rare case)
        IF OLD.status = 'approved' AND NEW.status != 'approved' THEN
            UPDATE public.user_contributions
            SET 
                approved_count = GREATEST(approved_count - 1, 0),
                reputation_score = GREATEST(reputation_score - 10, 0),
                updated_at = NOW()
            WHERE user_id = NEW.user_id;
        END IF;

        -- Handle moving from rejected back to pending
        IF OLD.status = 'rejected' AND NEW.status != 'rejected' THEN
            UPDATE public.user_contributions
            SET 
                rejected_count = GREATEST(rejected_count - 1, 0),
                reputation_score = reputation_score + 2,
                updated_at = NOW()
            WHERE user_id = NEW.user_id;
        END IF;

        RETURN NEW;
    END IF;

    RETURN NEW;
END;
$$;

-- Fix approve_submission function
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
    new_legislation_id UUID;
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
            ordinance_url
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
            (submitted_data->>'ordinance_url')::TEXT
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

-- Fix reject_submission function
CREATE OR REPLACE FUNCTION public.reject_submission(
    submission_id UUID,
    admin_user_id UUID,
    feedback_text TEXT
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

    -- Update submission status
    UPDATE public.submissions
    SET 
        status = 'rejected',
        admin_feedback = feedback_text,
        reviewed_by = admin_user_id,
        reviewed_at = NOW(),
        updated_at = NOW()
    WHERE id = submission_id AND status = 'pending';

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Submission not found or not pending';
    END IF;

    -- Log the rejection
    PERFORM public.create_audit_log(
        'reject_submission',
        'submissions',
        submission_id::TEXT,
        NULL,
        jsonb_build_object('feedback', feedback_text, 'admin_id', admin_user_id)
    );

    RETURN TRUE;
END;
$$;

-- Fix get_submission_stats function
CREATE OR REPLACE FUNCTION public.get_submission_stats()
RETURNS TABLE (
    total_submissions BIGINT,
    pending_submissions BIGINT,
    approved_submissions BIGINT,
    rejected_submissions BIGINT,
    needs_changes_submissions BIGINT,
    avg_review_time_hours NUMERIC
) 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_submissions,
        COUNT(*) FILTER (WHERE status = 'pending') as pending_submissions,
        COUNT(*) FILTER (WHERE status = 'approved') as approved_submissions,
        COUNT(*) FILTER (WHERE status = 'rejected') as rejected_submissions,
        COUNT(*) FILTER (WHERE status = 'needs_changes') as needs_changes_submissions,
        AVG(EXTRACT(EPOCH FROM (reviewed_at - created_at)) / 3600) FILTER (WHERE reviewed_at IS NOT NULL) as avg_review_time_hours
    FROM public.submissions;
END;
$$;

-- Fix initialize_user_preferences function
CREATE OR REPLACE FUNCTION public.initialize_user_preferences()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.user_preferences (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$;

-- Fix log_email_send function
CREATE OR REPLACE FUNCTION public.log_email_send(
    p_user_id UUID,
    p_email_type email_type,
    p_subject TEXT,
    p_recipient_email TEXT,
    p_provider_id TEXT DEFAULT NULL,
    p_status email_status DEFAULT 'sent'
)
RETURNS UUID 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO public.email_logs (
        user_id,
        email_type,
        subject,
        recipient_email,
        provider_id,
        status
    )
    VALUES (
        p_user_id,
        p_email_type,
        p_subject,
        p_recipient_email,
        p_provider_id,
        p_status
    )
    RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$;

-- Fix update_newsletter_subscription function
CREATE OR REPLACE FUNCTION public.update_newsletter_subscription(
    p_user_id UUID,
    p_subscribed BOOLEAN,
    p_confirmed BOOLEAN DEFAULT false
)
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    UPDATE public.user_preferences
    SET 
        newsletter_subscribed = p_subscribed,
        newsletter_confirmed = CASE 
            WHEN p_subscribed THEN p_confirmed 
            ELSE false 
        END,
        updated_at = NOW()
    WHERE user_id = p_user_id;
    
    IF NOT FOUND THEN
        INSERT INTO public.user_preferences (
            user_id, 
            newsletter_subscribed, 
            newsletter_confirmed
        )
        VALUES (p_user_id, p_subscribed, p_confirmed);
    END IF;
    
    RETURN true;
END;
$$;

-- Fix mark_welcome_email_sent function
CREATE OR REPLACE FUNCTION public.mark_welcome_email_sent(p_user_id UUID)
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    UPDATE public.user_preferences
    SET 
        welcome_email_sent = true,
        updated_at = NOW()
    WHERE user_id = p_user_id;
    
    RETURN FOUND;
END;
$$;

-- Fix get_newsletter_subscribers function
CREATE OR REPLACE FUNCTION public.get_newsletter_subscribers()
RETURNS TABLE (
    user_id UUID,
    email TEXT,
    display_name TEXT,
    subscribed_at TIMESTAMP WITH TIME ZONE
) 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id as user_id,
        p.email,
        COALESCE(p.display_name, p.email) as display_name,
        up.created_at as subscribed_at
    FROM public.profiles p
    JOIN public.user_preferences up ON p.id = up.user_id
    WHERE up.newsletter_subscribed = true 
    AND up.newsletter_confirmed = true
    AND p.email IS NOT NULL;
END;
$$;