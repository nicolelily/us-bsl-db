import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  FileText, 
  AlertCircle, 
  CheckCircle,
  Trash2,
  Eye
} from 'lucide-react';
import { DocumentUpload, UploadedFile } from './DocumentUpload';
import { DocumentPreview } from './DocumentPreview';
import { useDocumentUpload, DocumentMetadata } from '@/hooks/useDocumentUpload';
import { useToast } from '@/hooks/use-toast';

interface DocumentManagerProps {
  submissionId?: string;
  onDocumentsChange?: (documents: DocumentMetadata[]) => void;
  maxFiles?: number;
  maxFileSize?: number;
  required?: boolean;
  disabled?: boolean;
}

export function DocumentManager({
  submissionId,
  onDocumentsChange,
  maxFiles = 5,
  maxFileSize = 10,
  required = false,
  disabled = false
}: DocumentManagerProps) {
  const { 
    documents, 
    isUploading, 
    uploadDocument, 
    removeDocument, 
    clearDocuments,
    error 
  } = useDocumentUpload();
  
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('upload');

  // Notify parent component when documents change - avoid including callback in dependencies
  useEffect(() => {
    if (onDocumentsChange) {
      onDocumentsChange(documents);
    }
  }, [documents]); // Removed onDocumentsChange from dependencies

  const handleFilesChange = async (uploadedFiles: UploadedFile[]) => {
    // Convert UploadedFile to File objects and upload them
    // This is a simplified approach - in practice, the DocumentUpload component
    // would handle the actual upload process
    console.log('Files changed:', uploadedFiles);
  };

  const handleFileUpload = async (files: File[]) => {
    if (disabled) return;

    try {
      for (const file of files) {
        await uploadDocument(file, submissionId);
      }
      
      // Switch to preview tab after successful upload
      if (documents.length > 0) {
        setActiveTab('preview');
      }
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const handleRemoveDocument = async (documentId: string) => {
    try {
      await removeDocument(documentId);
    } catch (error) {
      console.error('Remove failed:', error);
    }
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to remove all documents? This action cannot be undone.')) {
      clearDocuments();
      toast({
        title: 'Documents Cleared',
        description: 'All documents have been removed.'
      });
    }
  };

  const getDocumentStats = () => {
    const totalSize = documents.reduce((sum, doc) => sum + doc.fileSize, 0);
    const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(1);
    
    return {
      count: documents.length,
      totalSizeMB: parseFloat(totalSizeMB)
    };
  };

  const stats = getDocumentStats();

  return (
    <div className="space-y-4">
      {/* Header with Stats */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Document Management</span>
              {required && <Badge variant="destructive">Required</Badge>}
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>{stats.count}/{maxFiles} files</span>
              <span>{stats.totalSizeMB}MB total</span>
              {documents.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearAll}
                  disabled={disabled || isUploading}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Clear All
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Required Field Validation */}
      {required && documents.length === 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-orange-800">
            At least one document is required for this submission.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload" className="flex items-center space-x-2">
            <Upload className="h-4 w-4" />
            <span>Upload Documents</span>
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center space-x-2">
            <Eye className="h-4 w-4" />
            <span>Preview & Manage ({documents.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-4">
          <DocumentUpload
            onFilesChange={handleFilesChange}
            maxFiles={maxFiles}
            maxFileSize={maxFileSize}
            disabled={disabled || isUploading}
            existingFiles={[]} // We manage files separately
          />
          
          {/* Upload Guidelines */}
          <Alert className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Document Guidelines:</strong>
              <ul className="mt-2 space-y-1 text-sm">
                <li>• Upload official ordinance documents (PDF preferred)</li>
                <li>• Include supporting materials like meeting minutes or amendments</li>
                <li>• Images of posted signs or notices are helpful</li>
                <li>• Ensure documents are clear and readable</li>
                <li>• Maximum file size: {maxFileSize}MB per file</li>
              </ul>
            </AlertDescription>
          </Alert>
        </TabsContent>

        <TabsContent value="preview" className="mt-4">
          {documents.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Documents Uploaded</h3>
                <p className="text-gray-600 mb-4">
                  Upload documents to see them here for preview and management.
                </p>
                <Button onClick={() => setActiveTab('upload')}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Documents
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Document List */}
              <div className="grid gap-4">
                {documents.map((document) => (
                  <DocumentPreview
                    key={document.id}
                    document={document}
                    onRemove={handleRemoveDocument}
                    showRemoveButton={!disabled}
                    compact={true}
                  />
                ))}
              </div>

              {/* Summary */}
              <Card className="bg-green-50 border-green-200">
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-800">
                        {documents.length} document{documents.length !== 1 ? 's' : ''} ready for submission
                      </p>
                      <p className="text-sm text-green-600">
                        Total size: {stats.totalSizeMB}MB
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Upload Progress Indicator */}
      {isUploading && (
        <Alert className="border-blue-200 bg-blue-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-blue-800">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-600"></div>
              <span>Uploading documents...</span>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}