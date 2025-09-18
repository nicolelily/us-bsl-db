import { useState, useCallback, useEffect } from 'react';
import { 
  validateEmail, 
  validateUrl, 
  validateState, 
  validateMunicipality, 
  validateBreeds, 
  validateOrdinanceText, 
  validatePopulation,
  validateSubmissionForm,
  FieldValidationResult,
  ValidationResult
} from '@/utils/validationUtils';
import { debounce } from 'lodash';

export interface FormValidationState {
  [fieldName: string]: FieldValidationResult;
}

export interface UseFormValidationResult {
  validationState: FormValidationState;
  overallValidation: ValidationResult | null;
  isValidating: boolean;
  validateField: (fieldName: string, value: any, additionalData?: any) => Promise<void>;
  validateForm: (formData: any) => Promise<ValidationResult>;
  clearValidation: (fieldName?: string) => void;
  hasErrors: boolean;
  hasWarnings: boolean;
}

export function useFormValidation(): UseFormValidationResult {
  const [validationState, setValidationState] = useState<FormValidationState>({});
  const [overallValidation, setOverallValidation] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  // Debounced validation to avoid excessive API calls
  const debouncedValidateField = useCallback(
    debounce(async (fieldName: string, value: any, additionalData?: any) => {
      setIsValidating(true);
      
      try {
        let result: FieldValidationResult;
        
        switch (fieldName) {
          case 'email':
            result = validateEmail(value);
            break;
            
          case 'ordinance_url':
          case 'url':
            result = await validateUrl(value);
            break;
            
          case 'state':
            result = validateState(value);
            break;
            
          case 'municipality':
            result = await validateMunicipality(value, additionalData?.state || '');
            break;
            
          case 'banned_breeds':
          case 'breeds':
            result = await validateBreeds(Array.isArray(value) ? value : [value]);
            break;
            
          case 'ordinance':
            result = validateOrdinanceText(value);
            break;
            
          case 'population':
            result = validatePopulation(value);
            break;
            
          default:
            result = {
              field: fieldName,
              isValid: true
            };
        }
        
        setValidationState(prev => ({
          ...prev,
          [fieldName]: result
        }));
        
      } catch (error) {
        console.error(`Validation error for ${fieldName}:`, error);
        setValidationState(prev => ({
          ...prev,
          [fieldName]: {
            field: fieldName,
            isValid: true,
            warning: 'Could not validate field'
          }
        }));
      } finally {
        setIsValidating(false);
      }
    }, 500), // 500ms debounce
    []
  );

  const validateField = useCallback(async (fieldName: string, value: any, additionalData?: any) => {
    await debouncedValidateField(fieldName, value, additionalData);
  }, [debouncedValidateField]);

  const validateForm = useCallback(async (formData: any): Promise<ValidationResult> => {
    setIsValidating(true);
    
    try {
      const result = await validateSubmissionForm(formData);
      setOverallValidation(result);
      return result;
    } catch (error) {
      console.error('Form validation error:', error);
      const errorResult: ValidationResult = {
        isValid: false,
        errors: ['Validation failed due to an error'],
        warnings: []
      };
      setOverallValidation(errorResult);
      return errorResult;
    } finally {
      setIsValidating(false);
    }
  }, []);

  const clearValidation = useCallback((fieldName?: string) => {
    if (fieldName) {
      setValidationState(prev => {
        const newState = { ...prev };
        delete newState[fieldName];
        return newState;
      });
    } else {
      setValidationState({});
      setOverallValidation(null);
    }
  }, []);

  // Computed properties
  const hasErrors = Object.values(validationState).some(result => !result.isValid) || 
                   (overallValidation && !overallValidation.isValid);
  
  const hasWarnings = Object.values(validationState).some(result => result.warning) ||
                     (overallValidation && overallValidation.warnings.length > 0);

  return {
    validationState,
    overallValidation,
    isValidating,
    validateField,
    validateForm,
    clearValidation,
    hasErrors,
    hasWarnings
  };
}

/**
 * Hook for validating a single field with real-time feedback
 */
export function useFieldValidation(fieldName: string, initialValue?: any) {
  const [value, setValue] = useState(initialValue || '');
  const [validation, setValidation] = useState<FieldValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const debouncedValidate = useCallback(
    debounce(async (val: any, additionalData?: any) => {
      if (!val && val !== 0) {
        setValidation(null);
        return;
      }

      setIsValidating(true);
      
      try {
        let result: FieldValidationResult;
        
        switch (fieldName) {
          case 'email':
            result = validateEmail(val);
            break;
            
          case 'ordinance_url':
          case 'url':
            result = await validateUrl(val);
            break;
            
          case 'state':
            result = validateState(val);
            break;
            
          case 'municipality':
            result = await validateMunicipality(val, additionalData?.state || '');
            break;
            
          case 'banned_breeds':
          case 'breeds':
            result = await validateBreeds(Array.isArray(val) ? val : [val]);
            break;
            
          case 'ordinance':
            result = validateOrdinanceText(val);
            break;
            
          case 'population':
            result = validatePopulation(val);
            break;
            
          default:
            result = {
              field: fieldName,
              isValid: true
            };
        }
        
        setValidation(result);
        
      } catch (error) {
        console.error(`Field validation error for ${fieldName}:`, error);
        setValidation({
          field: fieldName,
          isValid: true,
          warning: 'Could not validate field'
        });
      } finally {
        setIsValidating(false);
      }
    }, 300),
    [fieldName]
  );

  const updateValue = useCallback((newValue: any, additionalData?: any) => {
    setValue(newValue);
    debouncedValidate(newValue, additionalData);
  }, [debouncedValidate]);

  useEffect(() => {
    if (initialValue !== undefined) {
      debouncedValidate(initialValue);
    }
  }, [initialValue, debouncedValidate]);

  return {
    value,
    setValue: updateValue,
    validation,
    isValidating,
    isValid: validation ? validation.isValid : true,
    error: validation?.error,
    warning: validation?.warning,
    suggestion: validation?.suggestion
  };
}