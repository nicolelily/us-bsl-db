import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Progress } from '@/components/ui/progress';
import { CalendarIcon, Upload, Link, AlertCircle, X, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { SubmissionFormData } from '@/types/submissions';
import { useAuth } from '@/contexts/AuthContext';
import { uploadFile, deleteFile, validateFile, UploadResult } from '@/utils/storageUtils';

interface SourcesDocumentsStepProps {
  data: Partial<SubmissionFormData>;
  onDataChange: (data: Partial<SubmissionFormData>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

interface UploadedFile {
  file: File;
  path?: string;
  url?: string;
  uploading: boolean;
  progress: number;
  error?: string;
}

const SourcesDocumentsStep: React.FC<SourcesDocumentsStepProps> = ({
  data,
  onDataChange,
  onNext,
  onPrevious,
}) => {
  const { user } = useAuth();
  const [ordinanceUrl, setOrdinanceUrl] = useState(data.ordinance_url || '');
  const [verificationDate, setVerificationDate] = useState<Date | undefined>(
    data.verification_date ? new Date(data.verification_date) : undefined
  );
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    onDataChange({
      ordinance_url: ordinanceUrl || undefined,
      verification_date: verificationDate?.toISOString().split('T')[0],
    });
  }, [ordinanceUrl, verificationDate, onDataChange]);

  const validateForm = () => {
    const newErrors: string[] = [];
    const newWarnings: string[] = [];
    
    // Check if at least one source is provided
    if (!ordinanceUrl.trim() && uploadedFiles.length === 0) {
      newWarnings.push('Consider providing at least one source (URL or document) to increase credibility');
    }
    
    // Validate URL format if provided
    if (ordinanceUrl.trim()) {
      try {
        new URL(ordinanceUrl);
      } catch {
        newErrors.push('Please enter a valid URL');
      }
    }
    
    setErrors(newErrors);
    setWarnings(newWarnings);
    return newErrors.length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onNext();
    }
  };

  const handleFileUpload = async (files: FileList | File[]) => {
    if (!user) return;
    
    const fileArray = Array.from(files);
    
    // Add files to state with uploading status
    const newFiles: UploadedFile[] = fileArray.map(file => ({
      file,
      uploading: true,
      progress: 0
    }));
    
    setUploadedFiles(prev => [...prev, ...newFiles]);
    
    // Upload each file
    for (let i = 0; i < newFiles.length; i++) {
      const fileData = newFiles[i];
      
      // Validate file first
      const validation = validateFile(fileData.file);
      if (!validation.isValid) {
        setUploadedFiles(prev => prev.map((f, index) => 
          f.file === fileData.file ? { ...f, uploading: false, error: validation.error } : f
        ));
        continue;
      }
      
      try {
        // Upload file
        const result: UploadResult = await uploadFile(
          fileData.file, 
          user.id,
          (progress) => {
            setUploadedFiles(prev => prev.map(f => 
              f.file === fileData.file ? { ...f, progress } : f
            ));
          }
        );
        
        if (result.success) {
          setUploadedFiles(prev => prev.map(f => 
            f.file === fileData.file 
              ? { ...f, uploading: false, progress: 100, path: result.path, url: result.url }
              : f
          ));
        } else {
          setUploadedFiles(prev => prev.map(f => 
            f.file === fileData.file 
              ? { ...f, uploading: false, error: result.error }
              : f
          ));
        }
      } catch (error) {
        setUploadedFiles(prev => prev.map(f => 
          f.file === fileData.file 
            ? { ...f, uploading: false, error: 'Upload failed' }
            : f
        ));
      }
    }
  };

  const handleInputFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      handleFileUpload(event.target.files);
    }
  };

  const removeFile = async (fileToRemove: UploadedFile) => {
    // If file was successfully uploaded, delete from storage
    if (fileToRemove.path && !fileToRemove.uploading) {
      await deleteFile(fileToRemove.path);
    }
    
    setUploadedFiles(files => files.filter(file => file.file !== fileToRemove.file));
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (e.dataTransfer.files) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2 flex items-center justify-center">
          <Link className="w-5 h-5 mr-2" />
          Sources & Documents
        </h2>
        <p className="text-muted-foreground">
          Provide sources to verify the legislation (optional but recommended)
        </p>
      </div>

      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {warnings.length > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside">
              {warnings.map((warning, index) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Online Sources</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ordinance-url">Ordinance URL</Label>
            <Input
              id="ordinance-url"
              type="url"
              value={ordinanceUrl}
              onChange={(e) => setOrdinanceUrl(e.target.value)}
              placeholder="https://example.com/ordinance.pdf"
            />
            <p className="text-sm text-muted-foreground">
              Link to the official ordinance document or municipal website
            </p>
          </div>

          <div className="space-y-2">
            <Label>Verification Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !verificationDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {verificationDate ? format(verificationDate, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={verificationDate}
                  onSelect={setVerificationDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <p className="text-sm text-muted-foreground">
              When did you last verify this information?
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Document Upload</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file-upload">Upload Documents</Label>
            <div 
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                isDragOver 
                  ? 'border-primary bg-primary/5' 
                  : 'border-muted-foreground/25'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Drag and drop files here, or click to browse
                </p>
                <p className="text-xs text-muted-foreground">
                  PDF and image files only, max 10MB each
                </p>
              </div>
              <input
                id="file-upload"
                type="file"
                multiple
                accept=".pdf,image/*"
                onChange={handleInputFileUpload}
                className="hidden"
              />
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                Choose Files
              </Button>
            </div>
          </div>

          {uploadedFiles.length > 0 && (
            <div className="space-y-2">
              <Label>Files ({uploadedFiles.length})</Label>
              <div className="space-y-2">
                {uploadedFiles.map((fileData, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center">
                        {fileData.uploading ? (
                          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        ) : fileData.error ? (
                          <AlertCircle className="w-4 h-4 text-destructive" />
                        ) : (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{fileData.file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(fileData.file.size)}
                        </p>
                        {fileData.uploading && (
                          <div className="mt-1">
                            <Progress value={fileData.progress} className="h-1" />
                          </div>
                        )}
                        {fileData.error && (
                          <p className="text-xs text-destructive mt-1">{fileData.error}</p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(fileData)}
                      disabled={fileData.uploading}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="font-medium text-green-900 mb-2">💡 Tips for Sources & Documents</h3>
        <ul className="text-sm text-green-800 space-y-1">
          <li>• Official municipal websites are the best sources</li>
          <li>• PDF copies of ordinances provide the most credibility</li>
          <li>• News articles can be helpful secondary sources</li>
          <li>• Recent verification dates help ensure accuracy</li>
          <li>• Multiple sources increase submission credibility</li>
        </ul>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          Previous
        </Button>
        <Button onClick={handleNext}>
          Next: Review & Submit
        </Button>
      </div>
    </div>
  );
};

export default SourcesDocumentsStep;