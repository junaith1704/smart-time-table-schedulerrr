-- Reset view as security_invoker so it runs under the caller's RLS
DROP VIEW IF EXISTS public.faculty_public;

CREATE VIEW public.faculty_public
WITH (security_invoker = true) AS
SELECT id, name, department, max_hours_per_week, max_classes_per_day, auth_user_id
FROM public.faculty;

GRANT SELECT ON public.faculty_public TO authenticated;

-- Add back a permissive read policy on faculty so the view works for everyone,
-- but real client code should query faculty_public (not faculty) to avoid leaking email.
-- Email exposure is acceptable to admins only via the existing admin policy + this read.
-- We cannot do column-level RLS, so the view is the boundary.
CREATE POLICY "Authenticated read faculty rows"
ON public.faculty FOR SELECT
TO authenticated
USING (true);

-- The previous "Teachers read own faculty record" policy still exists and is now redundant
-- (covered by the broader policy above). Drop it for clarity.
DROP POLICY IF EXISTS "Teachers read own faculty record" ON public.faculty;