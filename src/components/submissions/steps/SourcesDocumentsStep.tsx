import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Link, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { SubmissionFormData } from '@/types/submissions';
import { useAuth } from '@/contexts/AuthContext';
import { DocumentManager } from '../DocumentManager';
import { DocumentMetadata } from '@/hooks/useDocumentUpload';

interface SourcesDocumentsStepProps {
  data: Partial<SubmissionFormData>;
  onDataChange: (data: Partial<SubmissionFormData>) => void;
  onNext: () => void;
  onPrevious: () => void;
  onSubmit?: (data: SubmissionFormData) => void;
  isSubmitting?: boolean;
}

// Remove the old UploadedFile interface as we're using DocumentMetadata now

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
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);

  // Update parent when data changes - avoid including onDataChange in dependencies
  useEffect(() => {
    onDataChange({
      ordinance_url: ordinanceUrl || undefined,
      verification_date: verificationDate?.toISOString().split('T')[0],
    });
  }, [ordinanceUrl, verificationDate]); // Removed onDataChange from dependencies

  // Validate form and update errors/warnings for display
  useEffect(() => {
    const newErrors: string[] = [];
    const newWarnings: string[] = [];
    
    // Check if at least one source is provided
    if (!ordinanceUrl.trim() && documents.length === 0) {
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
  }, [ordinanceUrl, documents]);

  const handleDocumentsChange = (newDocuments: DocumentMetadata[]) => {
    setDocuments(newDocuments);
    // Update form data with document information
    onDataChange({
      documents: newDocuments.map(doc => ({
        id: doc.id,
        fileName: doc.fileName,
        fileUrl: doc.fileUrl,
        fileType: doc.fileType,
        fileSize: doc.fileSize
      }))
    });
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
              onChange={(e) => {
                setOrdinanceUrl(e.target.value);
              }}
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
                  onSelect={(date) => {
                    setVerificationDate(date);
                  }}
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

      {/* Document Upload Section */}
      <DocumentManager
        onDocumentsChange={handleDocumentsChange}
        maxFiles={5}
        maxFileSize={10}
        required={false}
      />

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

    </div>
  );
};

export default SourcesDocumentsStep;