CREATE POLICY "First user can claim admin"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND role = 'admin'::public.app_role
  AND NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin'::public.app_role)
);