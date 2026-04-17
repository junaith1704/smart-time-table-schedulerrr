-- Replace overly-broad faculty read policy
DROP POLICY IF EXISTS "Auth users read faculty" ON public.faculty;

CREATE POLICY "Teachers read own faculty record"
ON public.faculty FOR SELECT
TO authenticated
USING (auth_user_id = auth.uid());

-- Admins already have full access via "Admins manage faculty" (FOR ALL)

-- Safe view exposing non-sensitive faculty fields to all authenticated users
CREATE OR REPLACE VIEW public.faculty_public
WITH (security_invoker = true) AS
SELECT id, name, department, max_hours_per_week, max_classes_per_day, auth_user_id
FROM public.faculty;

-- Grant read on view; underlying table RLS still applies via security_invoker
GRANT SELECT ON public.faculty_public TO authenticated;

-- Allow authenticated users to bypass RLS for the view by adding a permissive
-- read-only policy that omits the email column. We do this by creating a second
-- policy on faculty for SELECT that is gated to non-email columns through the view.
-- Since RLS is row-level (not column-level), we instead make the view bypass RLS
-- by making it SECURITY DEFINER-style via a function. Simpler: drop security_invoker
-- and let the view be owned by postgres so it bypasses faculty RLS.

ALTER VIEW public.faculty_public SET (security_invoker = false);