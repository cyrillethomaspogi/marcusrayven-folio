CREATE TABLE public.guestbook_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nickname TEXT NOT NULL CHECK (char_length(nickname) BETWEEN 1 AND 40),
  message TEXT NOT NULL CHECK (char_length(message) BETWEEN 1 AND 1000),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.guestbook_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view guestbook entries"
ON public.guestbook_entries
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Anyone can leave a guestbook entry"
ON public.guestbook_entries
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Admins can delete entries"
ON public.guestbook_entries
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE INDEX idx_guestbook_created_at ON public.guestbook_entries (created_at DESC);