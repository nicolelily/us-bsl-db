import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { SubmissionFormData } from '@/types/submissions';
import LocationSelector from '../form-components/LocationSelector';

interface LocationStepProps {
  data: Partial<SubmissionFormData>;
  onDataChange: (data: Partial<SubmissionFormData>) => void;
  onNext: () => void;
  onPrevious: () => void;
  onSubmit?: (data: SubmissionFormData) => void;
  isSubmitting?: boolean;
}

const LocationStep: React.FC<LocationStepProps> = ({
  data,
  onDataChange,
  onNext,
  onPrevious,
}) => {
  const [errors, setErrors] = useState<string[]>([]);

  // Validate form and update errors for display
  useEffect(() => {
    const newErrors: string[] = [];
    
    if (!data.municipality?.trim()) {
      newErrors.push('Municipality name is required');
    }
    
    if (!data.state) {
      newErrors.push('State is required');
    }
    
    setErrors(newErrors);
  }, [data.municipality, data.state]);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Location Information</h2>
        <p className="text-muted-foreground">
          Tell us where this legislation is located
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

      <LocationSelector
        municipality={data.municipality || ''}
        state={data.state || ''}
        municipalityType={data.municipality_type || 'City'}
        onMunicipalityChange={(municipality) => onDataChange({ municipality })}
        onStateChange={(state) => onDataChange({ state })}
        onMunicipalityTypeChange={(municipality_type) => onDataChange({ municipality_type })}
        errors={errors}
      />

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">💡 Tips for Location Information</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Use the official municipality name as it appears in legal documents</li>
          <li>• Autocomplete shows existing municipalities to help avoid duplicates</li>
          <li>• For counties, include "County" in the name (e.g., "Los Angeles County")</li>
          <li>• For cities, use the full official name</li>
        </ul>
      </div>
    </div>
  );
};

export default LocationStep;