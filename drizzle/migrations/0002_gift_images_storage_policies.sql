CREATE POLICY "Admins read gift images"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'gift-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins upload gift images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'gift-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update gift images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'gift-images' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'gift-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete gift images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'gift-images' AND public.has_role(auth.uid(), 'admin'));