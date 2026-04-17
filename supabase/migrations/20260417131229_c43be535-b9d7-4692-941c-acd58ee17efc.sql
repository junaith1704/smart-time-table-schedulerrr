DROP POLICY IF EXISTS "Authenticated read faculty rows" ON public.faculty;

CREATE POLICY "Teachers read own faculty record"
ON public.faculty FOR SELECT
TO authenticated
USING (auth_user_id = auth.uid());

-- Admin SELECT is already covered by "Admins manage faculty" (FOR ALL).