import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Save, 
  X, 
  ArrowLeft, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { SubmissionWithDetails, SubmissionFormData } from '@/types/submissions';
import { useSubmissionManagement } from '@/hooks/useSubmissionManagement';

interface SubmissionEditFormProps {
  submissionId: string;
  onSave: () => void;
  onCancel: () => void;
}

const SubmissionEditForm: React.FC<SubmissionEditFormProps> = ({
  submissionId,
  onSave,
  onCancel
}) => {
  const [submission, setSubmission] = useState<SubmissionWithDetails | null>(null);
  const [formData, setFormData] = useState<Partial<SubmissionFormData>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { updateSubmission, isUpdating } = useSubmissionManagement();

  useEffect(() => {
    fetchSubmission();
  }, [submissionId]);

  const fetchSubmission = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('submissions' as any)
        .select('*')
        .eq('id', submissionId)
        .single();

      if (error) throw error;

      const submissionData = data as unknown as SubmissionWithDetails;
      setSubmission(submissionData);

      // Initialize form data from submission
      const submitted = (submissionData.submitted_data as any) || {};
      setFormData({
        municipality: submitted.municipality || '',
        state: submitted.state || '',
        municipality_type: submitted.municipality_type || 'City',
        ordinance_title: submitted.ordinance || '',
        banned_breeds: submitted.banned_breeds || [],
        legislation_type: submitted.legislation_type || 'ban',
        population: submitted.population,
        ordinance_url: submitted.ordinance_url || '',
        verification_date: submitted.verification_date || ''
      });
    } catch (err) {
      console.error('Error fetching submission:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch submission');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.municipality || !formData.state || !formData.ordinance_title) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      await updateSubmission(submissionId, formData as SubmissionFormData);
      onSave();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update submission');
    }
  };

  const handleBreedsChange = (value: string) => {
    const breeds = value.split(',').map(breed => breed.trim()).filter(breed => breed.length > 0);
    setFormData(prev => ({ ...prev, banned_breeds: breeds }));
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  if (error && !submission) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={onCancel} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Edit Submission</h1>
          <p className="text-muted-foreground">
            Make changes to your pending submission
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={onCancel} disabled={isUpdating}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isUpdating}>
            {isUpdating ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Legislation Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Location */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="state">State *</Label>
              <Input
                id="state"
                value={formData.state || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                placeholder="e.g., California"
                required
              />
            </div>
            <div>
              <Label htmlFor="municipality">Municipality *</Label>
              <Input
                id="municipality"
                value={formData.municipality || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, municipality: e.target.value }))}
                placeholder="e.g., Los Angeles"
                required
              />
            </div>
            <div>
              <Label htmlFor="municipality_type">Type</Label>
              <Select 
                value={formData.municipality_type || 'City'} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, municipality_type: value as 'City' | 'County' }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="City">City</SelectItem>
                  <SelectItem value="County">County</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Ordinance Details */}
          <div>
            <Label htmlFor="ordinance_title">Ordinance Title/Description *</Label>
            <Textarea
              id="ordinance_title"
              value={formData.ordinance_title || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, ordinance_title: e.target.value }))}
              placeholder="Enter the ordinance title or description"
              rows={3}
              required
            />
          </div>

          {/* Legislation Type */}
          <div>
            <Label htmlFor="legislation_type">Legislation Type</Label>
            <Select 
              value={formData.legislation_type || 'ban'} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, legislation_type: value as 'ban' | 'restriction' | 'repealed' | 'unverified' }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ban">Ban</SelectItem>
                <SelectItem value="restriction">Restriction</SelectItem>
                <SelectItem value="repealed">Repealed</SelectItem>
                <SelectItem value="unverified">Unverified</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Banned Breeds */}
          <div>
            <Label htmlFor="banned_breeds">Restricted Breeds</Label>
            <Input
              id="banned_breeds"
              value={formData.banned_breeds?.join(', ') || ''}
              onChange={(e) => handleBreedsChange(e.target.value)}
              placeholder="e.g., Pit Bull, Rottweiler, German Shepherd (comma-separated)"
            />
            {formData.banned_breeds && formData.banned_breeds.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {formData.banned_breeds.map((breed) => (
                  <Badge key={breed} variant="secondary" className="text-xs">
                    {breed}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Optional Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="population">Population (optional)</Label>
              <Input
                id="population"
                type="number"
                value={formData.population || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, population: parseInt(e.target.value) || undefined }))}
                placeholder="e.g., 50000"
              />
            </div>
            <div>
              <Label htmlFor="verification_date">Verification Date (optional)</Label>
              <Input
                id="verification_date"
                type="date"
                value={formData.verification_date || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, verification_date: e.target.value }))}
              />
            </div>
          </div>

          {/* Source URL */}
          <div>
            <Label htmlFor="ordinance_url">Source URL (optional)</Label>
            <Input
              id="ordinance_url"
              type="url"
              value={formData.ordinance_url || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, ordinance_url: e.target.value }))}
              placeholder="https://example.com/ordinance.pdf"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubmissionEditForm;