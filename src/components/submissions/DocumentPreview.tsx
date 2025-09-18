import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Eye, 
  Download, 
  FileText, 
  Image as ImageIcon, 
  File,
  ExternalLink,
  X
} from 'lucide-react';
import { DocumentMetadata } from '@/hooks/useDocumentUpload';

interface DocumentPreviewProps {
  document: DocumentMetadata;
  onRemove?: (documentId: string) => void;
  showRemoveButton?: boolean;
  compact?: boolean;
}

export function DocumentPreview({ 
  document, 
  onRemove, 
  showRemoveButton = false,
  compact = false 
}: DocumentPreviewProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <ImageIcon className="h-5 w-5 text-blue-500" />;
    }
    if (fileType === 'application/pdf') {
      return <FileText className="h-5 w-5 text-red-500" />;
    }
    return <File className="h-5 w-5 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = document.fileUrl;
    link.download = document.fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderPreviewContent = () => {
    if (document.fileType.startsWith('image/')) {
      return (
        <div className="flex justify-center">
          {!imageError ? (
            <img
              src={document.fileUrl}
              alt={document.fileName}
              className="max-w-full max-h-96 object-contain rounded-lg"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-48 bg-gray-100 rounded-lg">
              <ImageIcon className="h-12 w-12 text-gray-400 mb-2" />
              <p className="text-gray-500">Unable to load image</p>
            </div>
          )}
        </div>
      );
    }

    if (document.fileType === 'application/pdf') {
      return (
        <div className="space-y-4">
          <div className="flex justify-center">
            <iframe
              src={`${document.fileUrl}#toolbar=0`}
              className="w-full h-96 border rounded-lg"
              title={document.fileName}
            />
          </div>
          <div className="text-center">
            <Button
              onClick={() => window.open(document.fileUrl, '_blank')}
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Open in New Tab
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center h-48 bg-gray-100 rounded-lg">
        <File className="h-12 w-12 text-gray-400 mb-2" />
        <p className="text-gray-500 mb-4">Preview not available for this file type</p>
        <Button onClick={handleDownload} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Download File
        </Button>
      </div>
    );
  };

  if (compact) {
    return (
      <div className="flex items-center space-x-3 p-2 border rounded-lg bg-white">
        <div className="flex-shrink-0">
          {getFileIcon(document.fileType)}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{document.fileName}</p>
          <p className="text-xs text-gray-500">{formatFileSize(document.fileSize)}</p>
        </div>

        <div className="flex items-center space-x-1">
          <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm">
                <Eye className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>{document.fileName}</span>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownload}
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </DialogTitle>
              </DialogHeader>
              <div className="mt-4">
                {renderPreviewContent()}
              </div>
            </DialogContent>
          </Dialog>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4" />
          </Button>

          {showRemoveButton && onRemove && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(document.id)}
              className="text-red-500 hover:text-red-700"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center space-x-2">
            {getFileIcon(document.fileType)}
            <span className="truncate">{document.fileName}</span>
          </div>
          {showRemoveButton && onRemove && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(document.id)}
              className="text-red-500 hover:text-red-700"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* File Info */}
        <div className="flex flex-wrap gap-2 text-sm text-gray-600">
          <Badge variant="outline">{formatFileSize(document.fileSize)}</Badge>
          <Badge variant="outline">{document.fileType}</Badge>
          <Badge variant="outline">Uploaded {formatDate(document.uploadedAt)}</Badge>
        </div>

        {/* Preview */}
        <div className="border rounded-lg p-4 bg-gray-50">
          {renderPreviewContent()}
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center">
          <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Full Preview
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>{document.fileName}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownload}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </DialogTitle>
              </DialogHeader>
              <div className="mt-4">
                {renderPreviewContent()}
              </div>
            </DialogContent>
          </Dialog>

          <Button
            onClick={handleDownload}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}