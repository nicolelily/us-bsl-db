-- Storage setup for submission documents
-- This migration recreates the storage bucket and policies for file uploads

-- Create the submission-documents bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'submission-documents',
  'submission-documents',
  false,
  52428800, -- 50MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for submission-documents bucket
-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload submission documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'submission-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to view their own uploaded files
CREATE POLICY "Users can view their own submission documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'submission-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own files
CREATE POLICY "Users can delete their own submission documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'submission-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow admins to view all submission documents
CREATE POLICY "Admins can view all submission documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'submission-documents' AND
  public.has_role(auth.uid(), 'admin')
);

-- Allow admins to delete any submission documents
CREATE POLICY "Admins can delete any submission documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'submission-documents' AND
  public.has_role(auth.uid(), 'admin')
);