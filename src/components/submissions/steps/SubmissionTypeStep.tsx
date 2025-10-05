import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { FileText, Edit } from 'lucide-react';
import { SubmissionFormData, SubmissionType } from '@/types/submissions';

interface SubmissionTypeStepProps {
  data: Partial<SubmissionFormData>;
  onDataChange: (data: Partial<SubmissionFormData>) => void;
  onNext: () => void;
  onPrevious?: () => void;
  onSubmit?: (data: SubmissionFormData) => void;
  isSubmitting?: boolean;
}

const SubmissionTypeStep: React.FC<SubmissionTypeStepProps> = ({
  data,
  onDataChange,
  onNext,
}) => {
  const handleTypeChange = (type: SubmissionType) => {
    onDataChange({ type });
  };

  const handleNext = () => {
    if (data.type) {
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">What would you like to do?</h2>
        <p className="text-muted-foreground">
          Choose the type of submission you'd like to make
        </p>
      </div>

      <RadioGroup
        value={data.type || ''}
        onValueChange={handleTypeChange}
        className="space-y-4"
      >
        <Card className={`cursor-pointer transition-colors ${
          data.type === 'new_legislation' ? 'ring-2 ring-primary' : ''
        }`}>
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="new_legislation" id="new_legislation" />
              <FileText className="w-6 h-6 text-primary" />
              <div>
                <CardTitle className="text-lg">
                  <Label htmlFor="new_legislation" className="cursor-pointer">
                    Submit New Legislation
                  </Label>
                </CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Report new breed-specific legislation that isn't currently in our database.
              This includes new bans, restrictions, or regulations you've discovered.
            </p>
            <ul className="mt-2 text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>New city or county ordinances</li>
              <li>Recently passed legislation</li>
              <li>Previously unknown regulations</li>
            </ul>
          </CardContent>
        </Card>

        <Card className={`cursor-pointer transition-colors ${
          data.type === 'update_existing' ? 'ring-2 ring-primary' : ''
        }`}>
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="update_existing" id="update_existing" />
              <Edit className="w-6 h-6 text-primary" />
              <div>
                <CardTitle className="text-lg">
                  <Label htmlFor="update_existing" className="cursor-pointer">
                    Update Existing Record
                  </Label>
                </CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Report changes to legislation that's already in our database.
              This helps keep our information current and accurate.
            </p>
            <ul className="mt-2 text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>Legislation has been repealed</li>
              <li>New breeds added to existing bans</li>
              <li>Changes to restrictions or requirements</li>
              <li>Updated ordinance text or URLs</li>
            </ul>
          </CardContent>
        </Card>
      </RadioGroup>

      {data.type && (
        <div className="flex justify-center">
          <Button onClick={handleNext} size="lg">
            Continue with {data.type === 'new_legislation' ? 'New Legislation' : 'Update'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default SubmissionTypeStep;