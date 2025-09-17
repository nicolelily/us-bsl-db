import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertTriangle, ExternalLink, MapPin, Scale } from 'lucide-react';
import { DuplicateDetectionResult, DuplicateMatch } from '@/utils/duplicateDetection';

interface DuplicateWarningProps {
  duplicateResult: DuplicateDetectionResult;
  acknowledged: boolean;
  onAcknowledgeChange: (acknowledged: boolean) => void;
  onViewRecord?: (recordId: string) => void;
}

const DuplicateWarning: React.FC<DuplicateWarningProps> = ({
  duplicateResult,
  acknowledged,
  onAcknowledgeChange,
  onViewRecord
}) => {
  if (!duplicateResult.hasDuplicates) {
    return null;
  }

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getConfidenceText = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'Very Likely Duplicate';
      case 'medium': return 'Possible Duplicate';
      case 'low': return 'Similar Record Found';
      default: return 'Similar Record';
    }
  };

  const formatSimilarity = (similarity: number) => {
    return `${Math.round(similarity * 100)}% match`;
  };

  return (
    <Alert variant={duplicateResult.confidence === 'high' ? 'destructive' : 'default'}>
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">
                {getConfidenceText(duplicateResult.confidence)} Detected
              </p>
              <p className="text-sm">
                We found {duplicateResult.matches.length} similar record{duplicateResult.matches.length !== 1 ? 's' : ''} 
                in our database. Please review to avoid duplicates.
              </p>
            </div>
            <Badge variant={getConfidenceColor(duplicateResult.confidence)}>
              {duplicateResult.confidence.toUpperCase()} CONFIDENCE
            </Badge>
          </div>

          {/* Similar Records */}
          <div className="space-y-3">
            {duplicateResult.matches.map((match, index) => (
              <Card key={match.record.id} className="border-l-4 border-l-orange-400">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {match.record.municipality}, {match.record.state}
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">
                        {formatSimilarity(match.similarity)}
                      </Badge>
                      {onViewRecord && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewRecord(match.record.id)}
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          View
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm">
                      <Scale className="w-3 h-3" />
                      <span className="capitalize">{match.record.legislationType}</span>
                      <span className="text-muted-foreground">•</span>
                      <span>{match.record.municipalityType}</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {match.record.bannedBreeds.slice(0, 3).map((breed) => (
                        <Badge key={breed} variant="secondary" className="text-xs">
                          {breed}
                        </Badge>
                      ))}
                      {match.record.bannedBreeds.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{match.record.bannedBreeds.length - 3} more
                        </Badge>
                      )}
                    </div>

                    <div className="text-xs text-muted-foreground">
                      <strong>Why this might be a duplicate:</strong>
                      <ul className="list-disc list-inside mt-1">
                        {match.reasons.map((reason, i) => (
                          <li key={i}>{reason}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Acknowledgment */}
          <div className="border-t pt-3">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="duplicate-acknowledge"
                checked={acknowledged}
                onCheckedChange={onAcknowledgeChange}
              />
              <div className="text-sm">
                <label htmlFor="duplicate-acknowledge" className="cursor-pointer font-medium">
                  I have reviewed the similar records above
                </label>
                <p className="text-muted-foreground mt-1">
                  {duplicateResult.confidence === 'high' 
                    ? 'Please confirm this is not a duplicate before proceeding. Consider updating the existing record instead of creating a new one.'
                    : 'Please confirm this is a new, unique piece of legislation and not a duplicate of the records shown above.'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default DuplicateWarning;