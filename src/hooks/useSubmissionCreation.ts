import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SubmissionFormData } from '@/types/submissions';
import { useAuth } from '@/contexts/AuthContext';

export interface UseSubmissionCreationResult {
  createSubmission: (formData: SubmissionFormData) => Promise<string>;
  isCreating: boolean;
  error: string | null;
}

export function useSubmissionCreation(): UseSubmissionCreationResult {
  const { user } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSubmission = useCallback(async (formData: SubmissionFormData): Promise<string> => {
    if (!user) {
      throw new Error('User must be authenticated to create submissions');
    }

    try {
      setIsCreating(true);
      setError(null);

      // Prepare the submission data according to the SubmissionData interface
      const submissionData = {
        municipality: formData.municipality,
        state: formData.state,
        municipality_type: formData.municipality_type,
        banned_breeds: formData.banned_breeds,
        ordinance: formData.ordinance,
        legislation_type: formData.legislation_type,
        population: formData.population,
        lat: formData.coordinates?.lat,
        lng: formData.coordinates?.lng,
        verification_date: formData.verification_date,
        ordinance_url: formData.ordinance_url
      };

      // Create the submission in the database
      const { data, error: insertError } = await supabase
        .from('submissions' as any)
        .insert({
          user_id: user.id,
          type: formData.type || 'new_legislation',
          status: 'pending',
          submitted_data: submissionData
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      const submissionId = data.id;

      // Handle document uploads if any
      if (formData.documents && formData.documents.length > 0) {
        await handleDocumentUploads(submissionId, formData.documents);
      }

      return submissionId;

    } catch (err) {
      console.error('Error creating submission:', err);
      setError(err instanceof Error ? err.message : 'Failed to create submission');
      throw err;
    } finally {
      setIsCreating(false);
    }
  }, [user]);

  const handleDocumentUploads = async (submissionId: string, documents: any[]) => {
    // Note: This assumes documents are File objects, but the type definition 
    // shows they might be a different structure. Adapting based on actual usage.
    for (const document of documents) {
      let file: File;
      let fileName: string;
      
      // Handle different document formats
      if (document instanceof File) {
        file = document;
        fileName = document.name;
      } else if (document.file && document.fileName) {
        file = document.file;
        fileName = document.fileName;
      } else {
        console.warn('Unknown document format, skipping:', document);
        continue;
      }

      const fileExt = fileName.split('.').pop();
      const storagePath = `${submissionId}/${Date.now()}.${fileExt}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('submission-documents')
        .upload(storagePath, file);

      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        throw uploadError;
      }

      // Create document record
      const { error: recordError } = await supabase
        .from('submission_documents' as any)
        .insert({
          submission_id: submissionId,
          file_name: fileName,
          file_url: storagePath,
          file_type: file.type,
          file_size: file.size
        });

      if (recordError) {
        console.error('Error creating document record:', recordError);
        throw recordError;
      }
    }
  };

  return {
    createSubmission,
    isCreating,
    error
  };
}