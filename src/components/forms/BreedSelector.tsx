import React, { useState, useEffect, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { X, Plus, Check, ChevronDown } from 'lucide-react';
import { ValidationMessage } from './ValidationMessage';
import { useFieldValidation } from '@/hooks/useFormValidation';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface BreedSelectorProps {
  selectedBreeds: string[];
  onBreedsChange: (breeds: string[]) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  maxBreeds?: number;
  className?: string;
}

// Common dog breeds for suggestions
const COMMON_BREEDS = [
  'Pit Bull', 'American Pit Bull Terrier', 'Staffordshire Terrier', 'Bull Terrier',
  'Rottweiler', 'German Shepherd', 'Doberman Pinscher', 'Mastiff', 'Bullmastiff',
  'Presa Canario', 'Cane Corso', 'Dogo Argentino', 'Fila Brasileiro', 'Tosa Inu',
  'American Bulldog', 'Chow Chow', 'Akita', 'Wolf Hybrid', 'Mixed Breed'
];

export function BreedSelector({
  selectedBreeds,
  onBreedsChange,
  label = 'Banned Breeds',
  placeholder = 'Type to search or add breeds...',
  required = false,
  maxBreeds = 20,
  className = ''
}: BreedSelectorProps) {
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [databaseBreeds, setDatabaseBreeds] = useState<string[]>([]);
  
  const {
    validation,
    isValidating
  } = useFieldValidation('breeds', selectedBreeds);

  // Load breeds from database
  useEffect(() => {
    loadDatabaseBreeds();
  }, []);

  const loadDatabaseBreeds = async () => {
    try {
      const { data, error } = await supabase
        .from('breed_legislation')
        .select('banned_breeds')
        .not('banned_breeds', 'is', null)
        .limit(100);

      if (error) {
        console.error('Error loading breeds:', error);
        return;
      }

      // Extract unique breeds
      const allBreeds = new Set<string>();
      data?.forEach(record => {
        if (Array.isArray(record.banned_breeds)) {
          record.banned_breeds.forEach(breed => {
            if (typeof breed === 'string' && breed.trim()) {
              allBreeds.add(breed.trim());
            }
          });
        }
      });

      setDatabaseBreeds(Array.from(allBreeds).sort());
    } catch (error) {
      console.error('Error loading breeds:', error);
    }
  };

  // Update suggestions based on input
  useEffect(() => {
    if (!inputValue.trim()) {
      setSuggestions(COMMON_BREEDS.slice(0, 10));
      return;
    }

    const searchTerm = inputValue.toLowerCase();
    const allBreeds = [...new Set([...COMMON_BREEDS, ...databaseBreeds])];
    
    const filtered = allBreeds
      .filter(breed => 
        breed.toLowerCase().includes(searchTerm) &&
        !selectedBreeds.some(selected => selected.toLowerCase() === breed.toLowerCase())
      )
      .slice(0, 10);

    setSuggestions(filtered);
  }, [inputValue, databaseBreeds, selectedBreeds]);

  const addBreed = useCallback((breed: string) => {
    const trimmedBreed = breed.trim();
    if (!trimmedBreed) return;

    // Check if breed already exists (case insensitive)
    const exists = selectedBreeds.some(
      existing => existing.toLowerCase() === trimmedBreed.toLowerCase()
    );

    if (exists) return;

    if (selectedBreeds.length >= maxBreeds) {
      return; // Could show a toast here
    }

    const newBreeds = [...selectedBreeds, trimmedBreed];
    onBreedsChange(newBreeds);
    setInputValue('');
    setIsOpen(false);
  }, [selectedBreeds, onBreedsChange, maxBreeds]);

  const removeBreed = useCallback((breedToRemove: string) => {
    const newBreeds = selectedBreeds.filter(breed => breed !== breedToRemove);
    onBreedsChange(newBreeds);
  }, [selectedBreeds, onBreedsChange]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      addBreed(inputValue);
    }
  };

  const getBreedVariant = (breed: string) => {
    const lowerBreed = breed.toLowerCase();
    if (COMMON_BREEDS.some(common => common.toLowerCase() === lowerBreed)) {
      return 'default';
    }
    if (databaseBreeds.some(db => db.toLowerCase() === lowerBreed)) {
      return 'secondary';
    }
    return 'outline';
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {label && (
        <Label className="flex items-center space-x-1">
          <span>{label}</span>
          {required && <span className="text-red-500">*</span>}
          <span className="text-sm text-gray-500">({selectedBreeds.length}/{maxBreeds})</span>
        </Label>
      )}

      {/* Selected Breeds */}
      {selectedBreeds.length > 0 && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-wrap gap-2">
              {selectedBreeds.map((breed) => (
                <Badge
                  key={breed}
                  variant={getBreedVariant(breed)}
                  className="flex items-center space-x-1 pr-1"
                >
                  <span>{breed}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => removeBreed(breed)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Breed Input */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className={cn(
                'pr-10',
                validation && !validation.isValid && 'border-red-500',
                validation && validation.warning && 'border-orange-400'
              )}
              disabled={selectedBreeds.length >= maxBreeds}
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1 h-6 w-6 p-0"
              onClick={() => setIsOpen(!isOpen)}
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Search breeds..."
              value={inputValue}
              onValueChange={setInputValue}
            />
            <CommandEmpty>
              <div className="p-4 text-center">
                <p className="text-sm text-gray-600 mb-2">No breeds found</p>
                {inputValue.trim() && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addBreed(inputValue)}
                    className="flex items-center space-x-1"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Add "{inputValue}"</span>
                  </Button>
                )}
              </div>
            </CommandEmpty>
            <CommandGroup>
              {suggestions.map((breed) => (
                <CommandItem
                  key={breed}
                  onSelect={() => addBreed(breed)}
                  className="flex items-center justify-between"
                >
                  <span>{breed}</span>
                  <div className="flex items-center space-x-1">
                    {COMMON_BREEDS.includes(breed) && (
                      <Badge variant="secondary" className="text-xs">Common</Badge>
                    )}
                    {databaseBreeds.includes(breed) && (
                      <Badge variant="outline" className="text-xs">In DB</Badge>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
            {inputValue.trim() && !suggestions.some(s => s.toLowerCase() === inputValue.toLowerCase()) && (
              <CommandGroup>
                <CommandItem
                  onSelect={() => addBreed(inputValue)}
                  className="flex items-center space-x-2 border-t"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add "{inputValue}" as new breed</span>
                </CommandItem>
              </CommandGroup>
            )}
          </Command>
        </PopoverContent>
      </Popover>

      {/* Validation Message */}
      <ValidationMessage 
        validation={validation} 
        isValidating={isValidating}
      />

      {/* Help Text */}
      <div className="text-sm text-gray-600 space-y-1">
        <p>• Type breed names and press Enter or select from suggestions</p>
        <p>• Common breeds and database breeds are highlighted</p>
        <p>• You can add custom breed names if not found in suggestions</p>
      </div>
    </div>
  );
}