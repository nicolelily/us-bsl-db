import React, { forwardRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ValidationMessage, ValidationBadge } from './ValidationMessage';
import { useFieldValidation } from '@/hooks/useFormValidation';
import { cn } from '@/lib/utils';

interface ValidatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  fieldName: string;
  onValidatedChange?: (value: string, isValid: boolean) => void;
  additionalValidationData?: any;
  showValidationBadge?: boolean;
  showSuccessValidation?: boolean;
  required?: boolean;
}

export const ValidatedInput = forwardRef<HTMLInputElement, ValidatedInputProps>(
  ({ 
    label, 
    fieldName, 
    onValidatedChange, 
    additionalValidationData,
    showValidationBadge = false,
    showSuccessValidation = false,
    required = false,
    className,
    ...props 
  }, ref) => {
    const {
      value,
      setValue,
      validation,
      isValidating,
      isValid
    } = useFieldValidation(fieldName, props.defaultValue);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setValue(newValue, additionalValidationData);
      
      if (onValidatedChange) {
        onValidatedChange(newValue, isValid);
      }
      
      if (props.onChange) {
        props.onChange(e);
      }
    };

    const inputClassName = cn(
      className,
      {
        'border-red-500 focus:border-red-500': validation && !validation.isValid,
        'border-orange-400 focus:border-orange-400': validation && validation.warning,
        'border-green-500 focus:border-green-500': validation && validation.isValid && !validation.warning && showSuccessValidation
      }
    );

    return (
      <div className="space-y-2">
        {label && (
          <div className="flex items-center justify-between">
            <Label htmlFor={props.id || fieldName} className="flex items-center space-x-1">
              <span>{label}</span>
              {required && <span className="text-red-500">*</span>}
            </Label>
            {showValidationBadge && (
              <ValidationBadge validation={validation} isValidating={isValidating} />
            )}
          </div>
        )}
        
        <Input
          {...props}
          ref={ref}
          id={props.id || fieldName}
          value={value}
          onChange={handleChange}
          className={inputClassName}
        />
        
        <ValidationMessage 
          validation={validation} 
          isValidating={isValidating}
          showSuccess={showSuccessValidation}
        />
      </div>
    );
  }
);

ValidatedInput.displayName = 'ValidatedInput';