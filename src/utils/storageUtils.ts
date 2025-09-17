import { supabase } from '@/integrations/supabase/client';

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
  path?: string;
}

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

// File validation constants
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/gif',
  'image/webp'
];

const ALLOWED_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'webp'];

/**
 * Validate file before upload
 */
export const validateFile = (file: File): FileValidationResult => {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`
    };
  }

  // Check file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: 'Only PDF and image files (JPG, PNG, GIF, WebP) are allowed'
    };
  }

  // Check file extension as backup
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
    return {
      isValid: false,
      error: 'Invalid file extension. Only PDF and image files are allowed'
    };
  }

  return { isValid: true };
};

/**
 * Generate a unique file path for user uploads
 */
export const generateFilePath = (userId: string, fileName: string): string => {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 15);
  const extension = fileName.split('.').pop();
  const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  
  return `${userId}/${timestamp}_${randomId}_${sanitizedName}`;
};

/**
 * Upload file to Supabase Storage
 */
export const uploadFile = async (
  file: File, 
  userId: string,
  onProgress?: (progress: number) => void
): Promise<UploadResult> => {
  try {
    // Validate file first
    const validation = validateFile(file);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.error
      };
    }

    // Generate unique file path
    const filePath = generateFilePath(userId, file.name);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('submission-documents')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Upload error:', error);
      return {
        success: false,
        error: error.message
      };
    }

    // Get public URL (for private buckets, this creates a signed URL)
    const { data: urlData } = supabase.storage
      .from('submission-documents')
      .getPublicUrl(filePath);

    return {
      success: true,
      url: urlData.publicUrl,
      path: filePath
    };

  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: 'Failed to upload file'
    };
  }
};

/**
 * Delete file from Supabase Storage
 */
export const deleteFile = async (filePath: string): Promise<boolean> => {
  try {
    const { error } = await supabase.storage
      .from('submission-documents')
      .remove([filePath]);

    if (error) {
      console.error('Delete error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Delete error:', error);
    return false;
  }
};

/**
 * Get signed URL for private file access (valid for 1 hour)
 */
export const getSignedUrl = async (filePath: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase.storage
      .from('submission-documents')
      .createSignedUrl(filePath, 3600); // 1 hour

    if (error) {
      console.error('Signed URL error:', error);
      return null;
    }

    return data.signedUrl;
  } catch (error) {
    console.error('Signed URL error:', error);
    return null;
  }
};

/**
 * List files for a user
 */
export const listUserFiles = async (userId: string) => {
  try {
    const { data, error } = await supabase.storage
      .from('submission-documents')
      .list(userId, {
        limit: 100,
        offset: 0
      });

    if (error) {
      console.error('List files error:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('List files error:', error);
    return [];
  }
};