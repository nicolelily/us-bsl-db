import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  AlertCircle, 
  CheckCircle, 
  Info, 
  Lightbulb,
  Loader2
} from 'lucide-react';
import { FieldValidationResult } from '@/utils/validationUtils';

interface ValidationMessageProps {
  validation: FieldValidationResult | null;
  isValidating?: boolean;
  showSuccess?: boolean;
  className?: string;
}

export function ValidationMessage({ 
  validation, 
  isValidating = false, 
  showSuccess = false,
  className = ''
}: ValidationMessageProps) {
  if (isValidating) {
    return (
      <div className={`flex items-center space-x-2 text-sm text-gray-600 ${className}`}>
        <Loader2 className="h-3 w-3 animate-spin" />
        <span>Validating...</span>
      </div>
    );
  }

  if (!validation) {
    return null;
  }

  // Error message
  if (!validation.isValid && validation.error) {
    return (
      <Alert className={`border-red-200 bg-red-50 ${className}`}>
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          {validation.error}
        </AlertDescription>
      </Alert>
    );
  }

  // Warning message
  if (validation.warning) {
    return (
      <Alert className={`border-orange-200 bg-orange-50 ${className}`}>
        <AlertCircle className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800">
          {validation.warning}
        </AlertDescription>
      </Alert>
    );
  }

  // Suggestion message
  if (validation.suggestion) {
    return (
      <Alert className={`border-blue-200 bg-blue-50 ${className}`}>
        <Lightbulb className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>Suggestion:</strong> {validation.suggestion}
        </AlertDescription>
      </Alert>
    );
  }

  // Success message (optional)
  if (showSuccess && validation.isValid) {
    return (
      <div className={`flex items-center space-x-2 text-sm text-green-600 ${className}`}>
        <CheckCircle className="h-3 w-3" />
        <span>Valid</span>
      </div>
    );
  }

  return null;
}

interface ValidationBadgeProps {
  validation: FieldValidationResult | null;
  isValidating?: boolean;
}

export function ValidationBadge({ validation, isValidating }: ValidationBadgeProps) {
  if (isValidating) {
    return (
      <Badge variant="secondary" className="flex items-center space-x-1">
        <Loader2 className="h-3 w-3 animate-spin" />
        <span>Validating</span>
      </Badge>
    );
  }

  if (!validation) {
    return null;
  }

  if (!validation.isValid) {
    return (
      <Badge variant="destructive" className="flex items-center space-x-1">
        <AlertCircle className="h-3 w-3" />
        <span>Invalid</span>
      </Badge>
    );
  }

  if (validation.warning) {
    return (
      <Badge variant="outline" className="flex items-center space-x-1 border-orange-300 text-orange-700">
        <AlertCircle className="h-3 w-3" />
        <span>Warning</span>
      </Badge>
    );
  }

  if (validation.suggestion) {
    return (
      <Badge variant="outline" className="flex items-center space-x-1 border-blue-300 text-blue-700">
        <Info className="h-3 w-3" />
        <span>Suggestion</span>
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="flex items-center space-x-1 border-green-300 text-green-700">
      <CheckCircle className="h-3 w-3" />
      <span>Valid</span>
    </Badge>
  );
}

interface ValidationSummaryProps {
  validationResults: FieldValidationResult[];
  className?: string;
}

export function ValidationSummary({ validationResults, className = '' }: ValidationSummaryProps) {
  const errors = validationResults.filter(r => !r.isValid);
  const warnings = validationResults.filter(r => r.warning);
  const suggestions = validationResults.filter(r => r.suggestion);

  if (errors.length === 0 && warnings.length === 0 && suggestions.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {errors.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Please fix the following errors:</strong>
            <ul className="mt-1 list-disc list-inside">
              {errors.map((error, index) => (
                <li key={index}>{error.error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {warnings.length > 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Warnings:</strong>
            <ul className="mt-1 list-disc list-inside">
              {warnings.map((warning, index) => (
                <li key={index}>{warning.warning}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {suggestions.length > 0 && (
        <Alert className="border-blue-200 bg-blue-50">
          <Lightbulb className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Suggestions:</strong>
            <ul className="mt-1 list-disc list-inside">
              {suggestions.map((suggestion, index) => (
                <li key={index}>{suggestion.suggestion}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}