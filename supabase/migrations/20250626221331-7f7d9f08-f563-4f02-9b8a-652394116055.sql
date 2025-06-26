
-- Fix the has_role function to have a secure search path
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Also fix the user_has_role_or_higher function if it exists
CREATE OR REPLACE FUNCTION public.user_has_role_or_higher(_user_id uuid, _required_role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT CASE 
    WHEN _required_role = 'user' THEN 
      EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id)
    WHEN _required_role = 'moderator' THEN 
      EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('moderator', 'admin'))
    WHEN _required_role = 'admin' THEN 
      EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'admin')
    ELSE false
  END
$$;

-- Fix the get_current_user_role function as well
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS app_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = auth.uid()
  ORDER BY 
    CASE role
      WHEN 'admin' THEN 1
      WHEN 'moderator' THEN 2
      WHEN 'user' THEN 3
    END
  LIMIT 1
$$;
