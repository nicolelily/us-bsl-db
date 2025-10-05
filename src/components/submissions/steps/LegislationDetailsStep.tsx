import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Info, Loader2 } from 'lucide-react';
import { SubmissionFormData } from '@/types/submissions';
import { useDuplicateDetection } from '@/hooks/useDuplicateDetection';
import BreedSelector from '../form-components/BreedSelector';
import LegislationForm from '../form-components/LegislationForm';

interface LegislationDetailsStepProps {
  data: Partial<SubmissionFormData>;
  onDataChange: (data: Partial<SubmissionFormData>) => void;
  onNext: () => void;
  onPrevious: () => void;
  onSubmit?: (data: SubmissionFormData) => void;
  isSubmitting?: boolean;
}

const LegislationDetailsStep: React.FC<LegislationDetailsStepProps> = ({
  data,
  onDataChange,
  onNext,
  onPrevious,
}) => {
  const [errors, setErrors] = useState<string[]>([]);

  // Real-time duplicate detection for early warning
  const { 
    duplicateResult, 
    isChecking, 
    hasDuplicates,
    canCheckDuplicates 
  } = useDuplicateDetection({
    formData: data,
    enabled: true,
    debounceMs: 2000 // Longer debounce for this step
  });

  const validateForm = () => {
    const newErrors: string[] = [];
    
    if (!data.ordinance?.trim()) {
      newErrors.push('Ordinance title or description is required');
    }
    
    if (!data.banned_breeds || data.banned_breeds.length === 0) {
      newErrors.push('At least one breed must be specified');
    }
    
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Legislation Details</h2>
        <p className="text-muted-foreground">
          Provide details about the breed-specific legislation
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

      <LegislationForm
        data={data}
        onDataChange={onDataChange}
        errors={errors}
        showValidation={true}
      />

      {/* Early Duplicate Warning */}
      {canCheckDuplicates && isChecking && (
        <Alert>
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertDescription>
            <p className="text-sm">Checking for similar legislation...</p>
          </AlertDescription>
        </Alert>
      )}

      {canCheckDuplicates && hasDuplicates && duplicateResult && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <p className="font-medium">Similar legislation found</p>
            <p className="text-sm">
              We found {duplicateResult.matches.length} similar record{duplicateResult.matches.length !== 1 ? 's' : ''} 
              in {data.state}. You'll be able to review them before submitting.
            </p>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          Previous
        </Button>
        <Button onClick={handleNext}>
          Next: Sources & Documents
        </Button>
      </div>
    </div>
  );
};

export default LegislationDetailsStep;