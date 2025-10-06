import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { SubmissionFormData } from '@/types/submissions';

// Step components (to be implemented)
import SubmissionTypeStep from './steps/SubmissionTypeStep';
import LocationStep from './steps/LocationStep';
import LegislationDetailsStep from './steps/LegislationDetailsStep';
import SourcesDocumentsStep from './steps/SourcesDocumentsStep';
import ReviewSubmitStep from './steps/ReviewSubmitStep';

interface SubmissionWizardProps {
  onComplete: (data: SubmissionFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const STEPS = [
  { id: 1, title: 'Submission Type', component: SubmissionTypeStep },
  { id: 2, title: 'Location', component: LocationStep },
  { id: 3, title: 'Legislation Details', component: LegislationDetailsStep },
  { id: 4, title: 'Sources & Documents', component: SourcesDocumentsStep },
  { id: 5, title: 'Review & Submit', component: ReviewSubmitStep },
];

const SubmissionWizard: React.FC<SubmissionWizardProps> = ({ 
  onComplete, 
  onCancel, 
  isSubmitting: externalIsSubmitting = false 
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<SubmissionFormData>>({});
  const [reviewStepValid, setReviewStepValid] = useState(false);
  
  // Use external submission state if provided, otherwise track internally
  const isSubmitting = externalIsSubmitting;

  const progress = (currentStep / STEPS.length) * 100;
  const currentStepData = STEPS.find(step => step.id === currentStep);

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepData = (stepData: Partial<SubmissionFormData>) => {
    // Handle validation state separately to avoid infinite re-renders
    if ('_reviewStepValid' in stepData) {
      setReviewStepValid(!!stepData._reviewStepValid);
      // Remove validation flag from form data to prevent it from being stored
      const { _reviewStepValid, ...cleanStepData } = stepData;
      if (Object.keys(cleanStepData).length > 0) {
        setFormData(prev => ({ ...prev, ...cleanStepData }));
      }
    } else {
      setFormData(prev => ({ ...prev, ...stepData }));
    }
  };

  const handleSubmit = async (finalData: SubmissionFormData) => {
    try {
      await onComplete(finalData);
    } catch (error) {
      console.error('Submission error:', error);
      // Error handling is done in the parent component
    }
  };

  const canGoNext = () => {
    switch (currentStep) {
      case 1: // Submission Type
        return !!formData.type;
      case 2: // Location
        return !!(formData.municipality?.trim() && formData.state);
      case 3: // Legislation Details
        return !!(formData.ordinance?.trim() && formData.banned_breeds && formData.banned_breeds.length > 0);
      case 4: // Sources & Documents
        return true; // This step is optional
      case 5: // Review & Submit
        return false; // This step uses its own submit logic
      default:
        return false;
    }
  };

  const canGoPrevious = () => {
    return currentStep > 1;
  };

  const isFormComplete = () => {
    return !!(
      formData.type &&
      formData.municipality &&
      formData.state &&
      formData.municipality_type &&
      formData.ordinance &&
      formData.legislation_type &&
      formData.banned_breeds &&
      formData.banned_breeds.length > 0
    );
  };

  if (!currentStepData) {
    return <div>Error: Invalid step</div>;
  }

  const StepComponent = currentStepData.component;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            Submit Breed-Specific Legislation
          </CardTitle>
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Step {currentStep} of {STEPS.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>

          {/* Step Navigation */}
          <div className="flex justify-center space-x-4 mt-4">
            {STEPS.map((step) => (
              <div
                key={step.id}
                className={`flex items-center space-x-2 ${
                  step.id === currentStep
                    ? 'text-primary font-semibold'
                    : step.id < currentStep
                    ? 'text-green-600'
                    : 'text-muted-foreground'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                    step.id === currentStep
                      ? 'bg-primary text-primary-foreground'
                      : step.id < currentStep
                      ? 'bg-green-600 text-white'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {step.id}
                </div>
                <span className="hidden md:block">{step.title}</span>
              </div>
            ))}
          </div>
        </CardHeader>

        <CardContent>
          {/* Current Step Component */}
          <div className="min-h-[400px]">
            <StepComponent
              data={formData}
              onDataChange={handleStepData}
              onNext={handleNext}
              onPrevious={handlePrevious}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6 pt-6 border-t">
            <div>
              {canGoPrevious() && (
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={isSubmitting}
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
              )}
            </div>

            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              
              {currentStep < STEPS.length && (
                <Button
                  onClick={handleNext}
                  disabled={!canGoNext() || isSubmitting}
                >
                  {currentStep === 4 ? 'Review & Submit' : 'Next'}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              )}
              
              {currentStep === STEPS.length && (
                <Button
                  onClick={() => handleSubmit(formData as SubmissionFormData)}
                  disabled={!reviewStepValid || isSubmitting}
                  className="min-w-[120px]"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit for Review'}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubmissionWizard;