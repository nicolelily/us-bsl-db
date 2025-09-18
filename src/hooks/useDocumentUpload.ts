import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { uploadFile, deleteFile, validateFile } from '@/utils/storageUtils';
import { useToast } from '@/hooks/use-toast';

export interface DocumentMetadata {
  id: string;
  submissionId?: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  filePath: string;
  fileUrl: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface UseDocumentUploadResult {
  documents: DocumentMetadata[];
  isUploading: boolean;
  uploadProgress: Record<string, number>;
  uploadDocument: (file: File, submissionId?: string) => Promise<DocumentMetadata>;
  removeDocument: (documentId: string) => Promise<void>;
  getDocumentUrl: (documentId: string) => Promise<string | null>;
  clearDocuments: () => void;
  error: string | null;
}

export function useDocumentUpload(): UseDocumentUploadResult {
  const { user } = useAuth();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);

  const uploadDocument = useCallback(async (file: File, submissionId?: string): Promise<DocumentMetadata> => {
    if (!user) {
      throw new Error('User must be authenticated to upload documents');
    }

    setError(null);
    setIsUploading(true);

    try {
      // Validate file
      const validation = validateFile(file);
      if (!validation.isValid) {
        throw new Error(validation.error || 'File validation failed');
      }

      const documentId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Track upload progress
      const onProgress = (progress: number) => {
        setUploadProgress(prev => ({ ...prev, [documentId]: progress }));
      };

      // Upload to Supabase Storage
      const uploadResult = await uploadFile(file, user.id, onProgress);

      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Upload failed');
      }

      // Create document metadata
      const documentMetadata: DocumentMetadata = {
        id: documentId,
        submissionId,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        filePath: uploadResult.path!,
        fileUrl: uploadResult.url!,
        uploadedAt: new Date().toISOString(),
        uploadedBy: user.id
      };

      // If this is for a specific submission, save to database
      if (submissionId) {
        const { error: dbError } = await supabase
          .from('submission_documents')
          .insert({
            submission_id: submissionId,
            file_name: file.name,
            file_url: uploadResult.url!,
            file_type: file.type,
            file_size: file.size
          });

        if (dbError) {
          console.error('Failed to save document metadata:', dbError);
          // Don't throw here - file is uploaded, just metadata save failed
        }
      }

      // Add to local state
      setDocuments(prev => [...prev, documentMetadata]);

      // Clear progress
      setUploadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[documentId];
        return newProgress;
      });

      toast({
        title: 'Upload Successful',
        description: `${file.name} has been uploaded successfully.`
      });

      return documentMetadata;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setError(errorMessage);
      
      toast({
        title: 'Upload Failed',
        description: errorMessage,
        variant: 'destructive'
      });

      throw error;
    } finally {
      setIsUploading(false);
    }
  }, [user, toast]);

  const removeDocument = useCallback(async (documentId: string): Promise<void> => {
    const document = documents.find(doc => doc.id === documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    try {
      // Delete from storage
      const deleteSuccess = await deleteFile(document.filePath);
      if (!deleteSuccess) {
        console.warn('Failed to delete file from storage, continuing with metadata removal');
      }

      // Remove from database if it was saved there
      if (document.submissionId) {
        const { error: dbError } = await supabase
          .from('submission_documents')
          .delete()
          .eq('submission_id', document.submissionId)
          .eq('file_name', document.fileName);

        if (dbError) {
          console.error('Failed to remove document from database:', dbError);
        }
      }

      // Remove from local state
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));

      toast({
        title: 'Document Removed',
        description: `${document.fileName} has been removed.`
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove document';
      setError(errorMessage);
      
      toast({
        title: 'Removal Failed',
        description: errorMessage,
        variant: 'destructive'
      });

      throw error;
    }
  }, [documents, toast]);

  const getDocumentUrl = useCallback(async (documentId: string): Promise<string | null> => {
    const document = documents.find(doc => doc.id === documentId);
    if (!document) {
      return null;
    }

    // For now, return the stored URL
    // In production, you might want to generate signed URLs for private access
    return document.fileUrl;
  }, [documents]);

  const clearDocuments = useCallback(() => {
    setDocuments([]);
    setUploadProgress({});
    setError(null);
  }, []);

  return {
    documents,
    isUploading,
    uploadProgress,
    uploadDocument,
    removeDocument,
    getDocumentUrl,
    clearDocuments,
    error
  };
}