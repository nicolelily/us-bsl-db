import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SubmissionWithDetails, SubmissionFormData } from '@/types/submissions';
import { useAuth } from '@/contexts/AuthContext';

export interface UseSubmissionManagementResult {
  updateSubmission: (submissionId: string, formData: SubmissionFormData) => Promise<void>;
  deleteSubmission: (submissionId: string) => Promise<void>;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
}

export function useSubmissionManagement(): UseSubmissionManagementResult {
  const { user } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateSubmission = useCallback(async (submissionId: string, formData: SubmissionFormData) => {
    if (!user) {
      throw new Error('User must be authenticated to update submissions');
    }

    try {
      setIsUpdating(true);
      setError(null);

      // Prepare the submission data
      const submissionData = {
        municipality: formData.municipality,
        state: formData.state,
        municipality_type: formData.municipality_type,
        banned_breeds: formData.banned_breeds,
        ordinance: formData.ordinance_title,
        legislation_type: formData.legislation_type,
        population: formData.population,
        lat: formData.coordinates?.lat,
        lng: formData.coordinates?.lng,
        verification_date: formData.verification_date,
        ordinance_url: formData.ordinance_url
      };

      // Update the submission
      const { error: updateError } = await supabase
        .from('submissions' as any)
        .update({
          submitted_data: submissionData,
          updated_at: new Date().toISOString()
        })
        .eq('id', submissionId)
        .eq('user_id', user.id) // Ensure user can only update their own submissions
        .eq('status', 'pending'); // Only allow updates to pending submissions

      if (updateError) {
        throw updateError;
      }

      // Handle document uploads if any
      if (formData.documents && formData.documents.length > 0) {
        await handleDocumentUploads(submissionId, formData.documents);
      }

    } catch (err) {
      console.error('Error updating submission:', err);
      setError(err instanceof Error ? err.message : 'Failed to update submission');
      throw err;
    } finally {
      setIsUpdating(false);
    }
  }, [user]);

  const deleteSubmission = useCallback(async (submissionId: string) => {
    if (!user) {
      throw new Error('User must be authenticated to delete submissions');
    }

    try {
      setIsDeleting(true);
      setError(null);

      // First, delete associated documents from storage
      const { data: documents } = await supabase
        .from('submission_documents' as any)
        .select('file_url')
        .eq('submission_id', submissionId);

      if (documents && documents.length > 0) {
        const filePaths = documents.map(doc => doc.file_url);
        await supabase.storage
          .from('submission-documents')
          .remove(filePaths);
      }

      // Delete document records
      await supabase
        .from('submission_documents' as any)
        .delete()
        .eq('submission_id', submissionId);

      // Delete the submission
      const { error: deleteError } = await supabase
        .from('submissions' as any)
        .delete()
        .eq('id', submissionId)
        .eq('user_id', user.id) // Ensure user can only delete their own submissions
        .eq('status', 'pending'); // Only allow deletion of pending submissions

      if (deleteError) {
        throw deleteError;
      }

    } catch (err) {
      console.error('Error deleting submission:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete submission');
      throw err;
    } finally {
      setIsDeleting(false);
    }
  }, [user]);

  const handleDocumentUploads = async (submissionId: string, documents: File[]) => {
    for (const file of documents) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${submissionId}/${Date.now()}.${fileExt}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('submission-documents')
        .upload(fileName, file);

      if (uploadError) {
        throw uploadError;
      }

      // Create document record
      const { error: recordError } = await supabase
        .from('submission_documents' as any)
        .insert({
          submission_id: submissionId,
          file_name: file.name,
          file_url: fileName,
          file_type: file.type,
          file_size: file.size
        });

      if (recordError) {
        throw recordError;
      }
    }
  };

  return {
    updateSubmission,
    deleteSubmission,
    isUpdating,
    isDeleting,
    error
  };
}