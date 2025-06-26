
-- Drop the duplicate create_audit_log function that has 6 parameters
DROP FUNCTION IF EXISTS public.create_audit_log(text, text, text, jsonb, jsonb, timestamp with time zone);

-- Ensure we have only one version of the function with 5 parameters
CREATE OR REPLACE FUNCTION public.create_audit_log(
    _action text, 
    _table_name text, 
    _record_id text DEFAULT NULL, 
    _old_values jsonb DEFAULT NULL, 
    _new_values jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.audit_logs (user_id, action, table_name, record_id, old_values, new_values, created_at)
    VALUES (auth.uid(), _action, _table_name, _record_id, _old_values, _new_values, now());
END;
$$;

-- Recreate the audit trigger function to be more explicit
CREATE OR REPLACE FUNCTION public.audit_trigger_function()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM public.create_audit_log(
            'DELETE'::text,
            TG_TABLE_NAME::text,
            OLD.id::text,
            row_to_json(OLD)::jsonb,
            NULL::jsonb
        );
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        PERFORM public.create_audit_log(
            'UPDATE'::text,
            TG_TABLE_NAME::text,
            NEW.id::text,
            row_to_json(OLD)::jsonb,
            row_to_json(NEW)::jsonb
        );
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        PERFORM public.create_audit_log(
            'INSERT'::text,
            TG_TABLE_NAME::text,
            NEW.id::text,
            NULL::jsonb,
            row_to_json(NEW)::jsonb
        );
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$;
