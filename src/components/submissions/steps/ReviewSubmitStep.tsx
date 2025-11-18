import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  AlertTriangle, 
  MapPin, 
  Scale, 
  Link, 
  Calendar,
  Users,
  FileText,
  Loader2
} from 'lucide-react';
import { SubmissionFormData } from '@/types/submissions';
import { useDuplicateDetection } from '@/hooks/useDuplicateDetection';
import DuplicateWarning from '../DuplicateWarning';

interface ReviewSubmitStepProps {
  data: Partial<SubmissionFormData>;
  onDataChange?: (data: Partial<SubmissionFormData>) => void;
  onNext?: () => void;
  onPrevious: () => void;
  onSubmit: (data: SubmissionFormData) => void;
  isSubmitting: boolean;
}

const ReviewSubmitStep: React.FC<ReviewSubmitStepProps> = ({
  data,
  onDataChange,
  onPrevious,
  onSubmit,
  isSubmitting,
}) => {
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [duplicateWarningAcknowledged, setDuplicateWarningAcknowledged] = useState(false);

  // Check if form is complete using useMemo for performance
  const isFormComplete = useMemo(() => {
    return !!(
      data.type &&
      data.municipality &&
      data.state &&
      data.municipality_type &&
      data.ordinance &&
      data.legislation_type &&
      data.banned_breeds &&
      data.banned_breeds.length > 0
    );
  }, [data]);

  // Real-time duplicate detection
  const { 
    duplicateResult, 
    isChecking, 
    hasDuplicates 
  } = useDuplicateDetection({
    formData: data,
    enabled: isFormComplete
  });

  const canSubmit = useMemo(() => {
    return (
      isFormComplete &&
      agreedToTerms &&
      (!hasDuplicates || duplicateWarningAcknowledged) &&
      !isSubmitting &&
      !isChecking
    );
  }, [isFormComplete, agreedToTerms, hasDuplicates, duplicateWarningAcknowledged, isSubmitting, isChecking]);

  // Notify parent about validation state changes
  React.useEffect(() => {
    if (onDataChange) {
      onDataChange({
        _reviewStepValid: canSubmit
      });
    }
  }, [canSubmit]); // Removed onDataChange from dependencies to prevent infinite loops



  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2 flex items-center justify-center">
          <CheckCircle className="w-5 h-5 mr-2" />
          Review & Submit
        </h2>
        <p className="text-muted-foreground">
          Please review your submission before sending it for moderation
        </p>
      </div>

      {/* Submission Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Submission Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Submission Type</h4>
              <p className="capitalize">
                {data.type?.replace('_', ' ')} 
                {data.type === 'new_legislation' ? ' Legislation' : ''}
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Legislation Type</h4>
              <Badge 
                variant={data.legislation_type === 'ban' ? 'destructive' : 'secondary'}
                className={data.legislation_type === 'restriction' ? 'bg-[#74CFC5] text-white hover:bg-[#5fb8ad]' : ''}
              >
                {data.legislation_type}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Location Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Municipality</h4>
              <p>{data.municipality}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">State</h4>
              <p>{data.state}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Type</h4>
              <p>{data.municipality_type}</p>
            </div>
          </div>
          {data.population && (
            <div className="mt-4">
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Population</h4>
              <p>{data.population.toLocaleString()}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Legislation Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Scale className="w-5 h-5 mr-2" />
            Legislation Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-1">Ordinance</h4>
            <p className="text-sm">{data.ordinance}</p>
          </div>
          
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-1">
              Affected Breeds ({data.banned_breeds?.length || 0})
            </h4>
            <div className="flex flex-wrap gap-2">
              {data.banned_breeds?.map((breed) => (
                <Badge key={breed} variant="outline">
                  {breed}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sources & Documents */}
      {(data.ordinance_url || data.verification_date) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Link className="w-5 h-5 mr-2" />
              Sources & Verification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.ordinance_url && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Source URL</h4>
                <a 
                  href={data.ordinance_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline text-sm break-all"
                >
                  {data.ordinance_url}
                </a>
              </div>
            )}
            
            {data.verification_date && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Verification Date</h4>
                <p className="flex items-center text-sm">
                  <Calendar className="w-4 h-4 mr-1" />
                  {(() => {
                    // Parse date as local date to avoid timezone conversion
                    const [year, month, day] = data.verification_date.split('-').map(Number);
                    return new Date(year, month - 1, day).toLocaleDateString();
                  })()}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Duplicate Detection Status */}
      {isChecking && (
        <Alert>
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertDescription>
            <p className="font-medium">Checking for duplicates...</p>
            <p className="text-sm">Please wait while we scan existing records.</p>
          </AlertDescription>
        </Alert>
      )}

      {/* Duplicate Warning */}
      {duplicateResult && hasDuplicates && (
        <DuplicateWarning
          duplicateResult={duplicateResult}
          acknowledged={duplicateWarningAcknowledged}
          onAcknowledgeChange={setDuplicateWarningAcknowledged}
        />
      )}

      {/* No Duplicates Found */}
      {duplicateResult && !hasDuplicates && !isChecking && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <p className="font-medium text-green-800">No duplicates found</p>
            <p className="text-sm text-green-700">
              This appears to be a unique piece of legislation.
            </p>
          </AlertDescription>
        </Alert>
      )}

      {/* Terms Agreement */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms-agreement"
                checked={agreedToTerms}
                onCheckedChange={setAgreedToTerms}
              />
              <div className="text-sm">
                <label htmlFor="terms-agreement" className="cursor-pointer">
                  I agree to the submission terms and conditions
                </label>
                <ul className="mt-2 text-xs text-muted-foreground space-y-1 ml-4">
                  <li>• The information I'm submitting is accurate to the best of my knowledge</li>
                  <li>• I understand this submission will be reviewed by moderators</li>
                  <li>• I agree to provide additional information if requested</li>
                  <li>• I understand false or misleading submissions may result in account restrictions</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submission Status */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">📋 What happens next?</h3>
        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
          <li>Your submission will be added to the moderation queue</li>
          <li>Our team will review the information and sources</li>
          <li>You'll receive an email notification when the review is complete</li>
          <li>If approved, the legislation will be added to our public database</li>
          <li>If changes are needed, you'll receive feedback and can resubmit</li>
        </ol>
      </div>

    </div>
  );
};

export default ReviewSubmitStep;