import React, { useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, 
  File, 
  X, 
  Eye, 
  Download, 
  AlertCircle, 
  CheckCircle,
  FileText,
  Image as ImageIcon
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { uploadFile as uploadToStorage, validateFile as validateFileStorage, deleteFile } from '@/utils/storageUtils';

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  uploadProgress?: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}

interface DocumentUploadProps {
  onFilesChange: (files: UploadedFile[]) => void;
  maxFiles?: number;
  maxFileSize?: number; // in MB
  acceptedTypes?: string[];
  existingFiles?: UploadedFile[];
  disabled?: boolean;
}

const DEFAULT_ACCEPTED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

const DEFAULT_MAX_FILE_SIZE = 10; // 10MB
const DEFAULT_MAX_FILES = 5;

export function DocumentUpload({
  onFilesChange,
  maxFiles = DEFAULT_MAX_FILES,
  maxFileSize = DEFAULT_MAX_FILE_SIZE,
  acceptedTypes = DEFAULT_ACCEPTED_TYPES,
  existingFiles = [],
  disabled = false
}: DocumentUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>(existingFiles);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const updateFiles = useCallback((newFiles: UploadedFile[]) => {
    setFiles(newFiles);
    onFilesChange(newFiles);
  }, [onFilesChange]);

  const validateFile = (file: File): string | null => {
    // Use storage validation first
    const storageValidation = validateFileStorage(file);
    if (!storageValidation.isValid) {
      return storageValidation.error || 'File validation failed';
    }

    // Check file type against accepted types
    if (!acceptedTypes.includes(file.type)) {
      return `File type ${file.type} is not supported. Please upload PDF, image, or document files.`;
    }

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxFileSize) {
      return `File size (${fileSizeMB.toFixed(1)}MB) exceeds the maximum limit of ${maxFileSize}MB.`;
    }

    // Check total files limit
    if (files.length >= maxFiles) {
      return `Maximum of ${maxFiles} files allowed. Please remove some files before adding new ones.`;
    }

    return null;
  };

  const uploadFileToStorage = async (file: File, fileId: string): Promise<UploadedFile> => {
    if (!user) {
      throw new Error('User must be authenticated to upload files');
    }

    // Create initial file object
    const uploadedFile: UploadedFile = {
      id: fileId,
      name: file.name,
      size: file.size,
      type: file.type,
      uploadProgress: 0,
      status: 'uploading'
    };

    try {
      // Upload to Supabase Storage with progress tracking
      const result = await uploadToStorage(file, user.id, (progress) => {
        uploadedFile.uploadProgress = progress;
        
        // Update the file in the list during upload
        setFiles(currentFiles => 
          currentFiles.map(f => f.id === fileId ? { ...uploadedFile } : f)
        );
      });

      if (!result.success) {
        throw new Error(result.error || 'Upload failed');
      }

      // Update with successful upload
      uploadedFile.status = 'completed';
      uploadedFile.url = result.url;
      delete uploadedFile.uploadProgress;

      return uploadedFile;
    } catch (error) {
      uploadedFile.status = 'error';
      uploadedFile.error = error instanceof Error ? error.message : 'Upload failed';
      throw error;
    }
  };

  const handleFiles = async (fileList: FileList) => {
    if (disabled || isUploading) return;

    const newFiles = Array.from(fileList);
    const validFiles: File[] = [];
    const errors: string[] = [];

    // Validate each file
    for (const file of newFiles) {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push(file);
      }
    }

    // Show validation errors
    if (errors.length > 0) {
      toast({
        title: 'File Validation Error',
        description: errors.join('\n'),
        variant: 'destructive'
      });
    }

    if (validFiles.length === 0) return;

    setIsUploading(true);

    try {
      // Add files to the list immediately with uploading status
      const initialFiles = validFiles.map(file => ({
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        size: file.size,
        type: file.type,
        uploadProgress: 0,
        status: 'uploading' as const
      }));

      const updatedFiles = [...files, ...initialFiles];
      setFiles(updatedFiles);

      // Upload files one by one
      const uploadPromises = validFiles.map(async (file, index) => {
        try {
          const uploadedFile = await uploadFileToStorage(file, initialFiles[index].id);
          return uploadedFile;
        } catch (error) {
          console.error(`Failed to upload ${file.name}:`, error);
          return {
            ...initialFiles[index],
            status: 'error' as const,
            error: error instanceof Error ? error.message : 'Upload failed'
          };
        }
      });

      const results = await Promise.all(uploadPromises);
      
      // Update files with final results
      const finalFiles = files.concat(results);
      updateFiles(finalFiles);

      const successCount = results.filter(f => f.status === 'completed').length;
      const errorCount = results.filter(f => f.status === 'error').length;

      if (successCount > 0) {
        toast({
          title: 'Upload Complete',
          description: `${successCount} file(s) uploaded successfully${errorCount > 0 ? `, ${errorCount} failed` : ''}.`
        });
      }

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload Failed',
        description: 'An error occurred while uploading files.',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = async (fileId: string) => {
    const fileToRemove = files.find(f => f.id === fileId);
    
    // If file was successfully uploaded, delete from storage
    if (fileToRemove?.status === 'completed' && fileToRemove.url) {
      try {
        // Extract file path from URL or use stored path
        // This is a simplified approach - in production you'd store the file path
        const urlParts = fileToRemove.url.split('/');
        const fileName = urlParts[urlParts.length - 1];
        const filePath = `${user?.id}/${fileName}`;
        
        await deleteFile(filePath);
      } catch (error) {
        console.error('Failed to delete file from storage:', error);
        // Continue with removal from UI even if storage deletion fails
      }
    }

    const updatedFiles = files.filter(f => f.id !== fileId);
    updateFiles(updatedFiles);
    
    toast({
      title: 'File Removed',
      description: 'File has been removed from the upload list.'
    });
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    if (disabled) return;
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFiles(droppedFiles);
    }
  }, [disabled, handleFiles]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      handleFiles(selectedFiles);
    }
    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openFileDialog = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <ImageIcon className="h-5 w-5" />;
    }
    if (fileType === 'application/pdf') {
      return <FileText className="h-5 w-5 text-red-500" />;
    }
    return <File className="h-5 w-5" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <Card 
        className={`border-2 border-dashed transition-colors ${
          isDragOver 
            ? 'border-primary bg-primary/5' 
            : disabled 
              ? 'border-gray-200 bg-gray-50' 
              : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <CardContent 
          className="p-8 text-center cursor-pointer"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={openFileDialog}
        >
          <Upload className={`mx-auto h-12 w-12 mb-4 ${disabled ? 'text-gray-400' : 'text-gray-500'}`} />
          <h3 className={`text-lg font-medium mb-2 ${disabled ? 'text-gray-400' : 'text-gray-900'}`}>
            {isDragOver ? 'Drop files here' : 'Upload Documents'}
          </h3>
          <p className={`text-sm mb-4 ${disabled ? 'text-gray-400' : 'text-gray-600'}`}>
            Drag and drop files here, or click to browse
          </p>
          <div className={`text-xs space-y-1 ${disabled ? 'text-gray-400' : 'text-gray-500'}`}>
            <p>Supported formats: PDF, Images, Word documents</p>
            <p>Maximum file size: {maxFileSize}MB</p>
            <p>Maximum files: {maxFiles}</p>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedTypes.join(',')}
            onChange={handleFileInputChange}
            className="hidden"
            disabled={disabled}
          />
        </CardContent>
      </Card>

      {/* File List */}
      {files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Uploaded Files ({files.length}/{maxFiles})</span>
              {isUploading && (
                <Badge variant="secondary">Uploading...</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {files.map((file) => (
              <div key={file.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                <div className="flex-shrink-0">
                  {getFileIcon(file.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  
                  {file.status === 'uploading' && file.uploadProgress !== undefined && (
                    <div className="mt-2">
                      <Progress value={file.uploadProgress} className="h-2" />
                      <p className="text-xs text-gray-500 mt-1">{file.uploadProgress}% uploaded</p>
                    </div>
                  )}
                  
                  {file.status === 'error' && (
                    <div className="mt-1 flex items-center space-x-1">
                      <AlertCircle className="h-3 w-3 text-red-500" />
                      <p className="text-xs text-red-600">{file.error || 'Upload failed'}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  {file.status === 'completed' && (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      {file.url && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(file.url, '_blank');
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                    </>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(file.id);
                    }}
                    disabled={file.status === 'uploading'}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Upload Guidelines */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Upload Guidelines:</strong> Please upload official ordinance documents, 
          supporting materials, or relevant images. All files are reviewed before publication.
        </AlertDescription>
      </Alert>
    </div>
  );
}