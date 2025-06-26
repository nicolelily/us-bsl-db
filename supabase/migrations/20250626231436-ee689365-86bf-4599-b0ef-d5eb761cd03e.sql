
-- Fix the create_audit_log function to have a secure search path
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
SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.audit_logs (user_id, action, table_name, record_id, old_values, new_values, created_at)
    VALUES (auth.uid(), _action, _table_name, _record_id, _old_values, _new_values, now());
END;
$$;
