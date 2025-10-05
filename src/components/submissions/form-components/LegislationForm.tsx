import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Scale, AlertCircle, Info } from 'lucide-react';
import { LegislationType } from '@/types/submissions';
import { mapBreedsForStorage } from '@/utils/breedMapping';
import LocationSelector from './LocationSelector';
import BreedSelector from './BreedSelector';

interface LegislationFormData {
  municipality: string;
  state: string;
  municipality_type: 'City' | 'County';
  ordinance: string;
  legislation_type: LegislationType;
  banned_breeds: string[];
  population?: number;
}

interface LegislationFormProps {
  data: Partial<LegislationFormData>;
  onDataChange: (data: Partial<LegislationFormData>) => void;
  errors?: string[];
  showValidation?: boolean;
}

const LegislationForm: React.FC<LegislationFormProps> = ({
  data,
  onDataChange,
  errors = [],
  showValidation = false
}) => {
  const [localData, setLocalData] = useState<Partial<LegislationFormData>>(data);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Update local data when props change
  useEffect(() => {
    setLocalData(data);
  }, [data]);

  // Validate form data
  const validateForm = () => {
    const newErrors: string[] = [];
    
    if (!localData.municipality?.trim()) {
      newErrors.push('Municipality name is required');
    }
    
    if (!localData.state) {
      newErrors.push('State is required');
    }
    
    if (!localData.ordinance?.trim()) {
      newErrors.push('Ordinance title or description is required');
    }
    
    if (!localData.banned_breeds || localData.banned_breeds.length === 0) {
      newErrors.push('At least one breed must be specified');
    }
    
    setValidationErrors(newErrors);
    return newErrors.length === 0;
  };

  // Update parent component when local data changes
  const updateData = (updates: Partial<LegislationFormData>) => {
    const newData = { ...localData, ...updates };
    setLocalData(newData);
    
    // Map breeds for storage if breeds are being updated
    const dataToSend = { ...newData };
    if (updates.banned_breeds) {
      dataToSend.banned_breeds = mapBreedsForStorage(updates.banned_breeds);
    }
    
    onDataChange(dataToSend);
    
    if (showValidation) {
      validateForm();
    }
  };

  const allErrors = [...errors, ...validationErrors];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2 flex items-center justify-center">
          <Scale className="w-5 h-5 mr-2" />
          Legislation Information
        </h2>
        <p className="text-muted-foreground">
          Provide details about the breed-specific legislation
        </p>
      </div>

      {/* Validation Errors */}
      {allErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside">
              {allErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Location Information */}
      <Card>
        <CardHeader>
          <CardTitle>Location</CardTitle>
        </CardHeader>
        <CardContent>
          <LocationSelector
            municipality={localData.municipality || ''}
            state={localData.state || ''}
            municipalityType={localData.municipality_type || 'City'}
            onMunicipalityChange={(municipality) => updateData({ municipality })}
            onStateChange={(state) => updateData({ state })}
            onMunicipalityTypeChange={(municipality_type) => updateData({ municipality_type })}
            errors={allErrors.filter(e => e.includes('Municipality') || e.includes('State'))}
          />
        </CardContent>
      </Card>

      {/* Legislation Details */}
      <Card>
        <CardHeader>
          <CardTitle>Legislation Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="legislation-type">Type of Legislation *</Label>
            <Select 
              value={localData.legislation_type || 'ban'} 
              onValueChange={(value: LegislationType) => updateData({ legislation_type: value })}
            >
              <SelectTrigger id="legislation-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ban">
                  <div>
                    <div className="font-medium">Ban</div>
                    <div className="text-sm text-muted-foreground">
                      Prohibits ownership of specific breeds
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="restriction">
                  <div>
                    <div className="font-medium">Restriction</div>
                    <div className="text-sm text-muted-foreground">
                      Requires special permits, insurance, or conditions
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="repealed">
                  <div>
                    <div className="font-medium">Repealed</div>
                    <div className="text-sm text-muted-foreground">
                      Previously enacted legislation that has been repealed
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ordinance">Ordinance Title/Description *</Label>
            <Textarea
              id="ordinance"
              value={localData.ordinance || ''}
              onChange={(e) => updateData({ ordinance: e.target.value })}
              placeholder="Enter the ordinance title, number, or brief description"
              rows={3}
            />
            <p className="text-sm text-muted-foreground">
              Include the official ordinance number if available, or a brief description
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="population">Population (Optional)</Label>
            <Input
              id="population"
              type="number"
              value={localData.population?.toString() || ''}
              onChange={(e) => updateData({ 
                population: e.target.value ? parseInt(e.target.value) : undefined 
              })}
              placeholder="Enter municipality population"
            />
          </div>
        </CardContent>
      </Card>

      {/* Breed Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Affected Breeds</CardTitle>
        </CardHeader>
        <CardContent>
          <BreedSelector
            selectedBreeds={localData.banned_breeds || []}
            onBreedsChange={(banned_breeds) => updateData({ banned_breeds })}
            errors={allErrors.filter(e => e.includes('breed'))}
          />
        </CardContent>
      </Card>

      {/* Tips */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <div>
            <h4 className="font-medium mb-2">💡 Tips for Accurate Legislation Data</h4>
            <ul className="text-sm space-y-1">
              <li>• Use official municipality names as they appear in legal documents</li>
              <li>• Include ordinance numbers when available for easy verification</li>
              <li>• Use specific breed names as they appear in the legislation</li>
              <li>• For "pit bull type" dogs, list the specific breeds mentioned</li>
            </ul>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default LegislationForm;