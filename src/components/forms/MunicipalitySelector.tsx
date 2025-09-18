import React, { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronDown, MapPin, Building } from 'lucide-react';
import { ValidationMessage } from './ValidationMessage';
import { useFieldValidation } from '@/hooks/useFormValidation';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface MunicipalityData {
  municipality: string;
  state: string;
  type: string;
  count: number;
}

interface MunicipalitySelectorProps {
  value: string;
  onChange: (municipality: string, type?: string) => void;
  state: string;
  municipalityType?: string;
  onTypeChange?: (type: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export function MunicipalitySelector({
  value,
  onChange,
  state,
  municipalityType,
  onTypeChange,
  label = 'Municipality',
  placeholder = 'Enter city or county name...',
  required = false,
  className = ''
}: MunicipalitySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<MunicipalityData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    validation,
    isValidating,
    setValue: setValidationValue
  } = useFieldValidation('municipality', value);

  // Load municipality suggestions from database
  const loadSuggestions = useCallback(async (searchTerm: string, selectedState: string) => {
    if (!selectedState || searchTerm.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('breed_legislation')
        .select('municipality, state, municipality_type')
        .eq('state', selectedState)
        .ilike('municipality', `%${searchTerm}%`)
        .limit(10);

      if (error) {
        console.error('Error loading municipalities:', error);
        setSuggestions([]);
        return;
      }

      // Group by municipality and count occurrences
      const municipalityMap = new Map<string, MunicipalityData>();
      
      data?.forEach(record => {
        const key = `${record.municipality}-${record.municipality_type}`;
        if (municipalityMap.has(key)) {
          municipalityMap.get(key)!.count++;
        } else {
          municipalityMap.set(key, {
            municipality: record.municipality,
            state: record.state,
            type: record.municipality_type || 'City',
            count: 1
          });
        }
      });

      const sortedSuggestions = Array.from(municipalityMap.values())
        .sort((a, b) => b.count - a.count); // Sort by frequency

      setSuggestions(sortedSuggestions);
    } catch (error) {
      console.error('Error loading municipalities:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update suggestions when value or state changes
  useEffect(() => {
    if (value && state) {
      loadSuggestions(value, state);
    } else {
      setSuggestions([]);
    }
  }, [value, state, loadSuggestions]);

  const handleInputChange = (newValue: string) => {
    onChange(newValue);
    setValidationValue(newValue, { state });
  };

  const handleSuggestionSelect = (suggestion: MunicipalityData) => {
    onChange(suggestion.municipality, suggestion.type);
    if (onTypeChange) {
      onTypeChange(suggestion.type);
    }
    setValidationValue(suggestion.municipality, { state });
    setIsOpen(false);
  };

  const getMunicipalityTypeIcon = (type: string) => {
    return type.toLowerCase() === 'county' ? 
      <Building className="h-3 w-3" /> : 
      <MapPin className="h-3 w-3" />;
  };

  const getMunicipalityTypeBadge = (type: string) => {
    return type.toLowerCase() === 'county' ? 'County' : 'City';
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <Label className="flex items-center space-x-1">
          <span>{label}</span>
          {required && <span className="text-red-500">*</span>}
        </Label>
      )}

      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Input
              value={value}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder={placeholder}
              className={cn(
                'pr-10',
                validation && !validation.isValid && 'border-red-500',
                validation && validation.warning && 'border-orange-400'
              )}
              disabled={!state}
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1 h-6 w-6 p-0"
              onClick={() => setIsOpen(!isOpen)}
              disabled={!state}
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Search municipalities..."
              value={value}
              onValueChange={handleInputChange}
            />
            <CommandEmpty>
              {isLoading ? (
                <div className="p-4 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                  <p className="text-sm text-gray-600 mt-2">Loading municipalities...</p>
                </div>
              ) : (
                <div className="p-4 text-center">
                  <p className="text-sm text-gray-600">
                    {value.length < 2 
                      ? 'Type at least 2 characters to search'
                      : 'No municipalities found'
                    }
                  </p>
                  {value.length >= 2 && (
                    <p className="text-xs text-gray-500 mt-1">
                      This might be a new municipality for our database
                    </p>
                  )}
                </div>
              )}
            </CommandEmpty>
            <CommandGroup>
              {suggestions.map((suggestion, index) => (
                <CommandItem
                  key={`${suggestion.municipality}-${suggestion.type}-${index}`}
                  onSelect={() => handleSuggestionSelect(suggestion)}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-2">
                    {getMunicipalityTypeIcon(suggestion.type)}
                    <span>{suggestion.municipality}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {getMunicipalityTypeBadge(suggestion.type)}
                    </Badge>
                    {suggestion.count > 1 && (
                      <Badge variant="secondary" className="text-xs">
                        {suggestion.count} records
                      </Badge>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Show selected municipality type */}
      {value && municipalityType && (
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center space-x-1">
            {getMunicipalityTypeIcon(municipalityType)}
            <span>{getMunicipalityTypeBadge(municipalityType)}</span>
          </Badge>
        </div>
      )}

      {/* Validation Message */}
      <ValidationMessage 
        validation={validation} 
        isValidating={isValidating}
      />

      {/* Help Text */}
      {!state && (
        <p className="text-sm text-gray-500">
          Please select a state first to search for municipalities
        </p>
      )}
      
      {state && (
        <div className="text-sm text-gray-600 space-y-1">
          <p>• Start typing to see municipalities in {state}</p>
          <p>• Suggestions are based on existing records in our database</p>
          <p>• You can enter a new municipality if not found</p>
        </div>
      )}
    </div>
  );
}