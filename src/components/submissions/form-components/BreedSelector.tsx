import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { X, Plus, Search, Dog, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { fetchBreedLegislationData } from '@/utils/dataFetcher';
import { 
  PIT_BULL_TYPE_BREEDS, 
  COMMON_BREEDS, 
  mapBreedsForStorage, 
  isPitBullType,
  getBreedsByCategory,
  STANDARDIZED_PIT_BULL_NAME
} from '@/utils/breedMapping';

interface BreedSelectorProps {
  selectedBreeds: string[];
  onBreedsChange: (breeds: string[]) => void;
  errors?: string[];
}

// Breed categories for organized display
const breedCategories = getBreedsByCategory();

const BreedSelector: React.FC<BreedSelectorProps> = ({
  selectedBreeds,
  onBreedsChange,
  errors = []
}) => {
  const [newBreed, setNewBreed] = useState('');
  const [breedSuggestionsOpen, setBreedSuggestionsOpen] = useState(false);
  const [allBreeds, setAllBreeds] = useState<string[]>([]);

  // Fetch existing legislation data to get breed suggestions
  const { data: existingData = [] } = useQuery({
    queryKey: ['breedLegislationData'],
    queryFn: fetchBreedLegislationData
  });

  // Normalize breed names to fix inconsistencies - make everything plural
  const normalizeBreedName = (breed: string): string => {
    const normalized = breed.trim();
    
    // Create a mapping of breed name variations to standard plural forms
    const breedMappings: { [key: string]: string } = {
      // Pit Bull variations
      'pit bull-type dog': 'Pit Bull-Type Dogs',
      'pit bull-type dogs': 'Pit Bull-Type Dogs',
      'pit-bull type dog': 'Pit Bull-Type Dogs',
      'pit-bull type dogs': 'Pit Bull-Type Dogs',
      'pit bull type dog': 'Pit Bull-Type Dogs',
      'pit bull type dogs': 'Pit Bull-Type Dogs',
      'pit bull': 'Pit Bulls',
      'pit bulls': 'Pit Bulls',
      
      // Doberman variations
      'doberman pinscher': 'Doberman Pinschers',
      'doberman pinschers': 'Doberman Pinschers',
      'doberman': 'Doberman Pinschers',
      'dobermans': 'Doberman Pinschers',
      
      // German Shepherd variations
      'german shepherd': 'German Shepherd Dogs',
      'german shepherds': 'German Shepherd Dogs',
      'german shepherd dog': 'German Shepherd Dogs',
      'german shepherd dogs': 'German Shepherd Dogs',
      
      // American Pit Bull Terrier variations
      'american pit bull terrier': 'American Pit Bull Terriers',
      'american pit bull terriers': 'American Pit Bull Terriers',
      
      // Staffordshire Terrier variations
      'staffordshire terrier': 'Staffordshire Terriers',
      'staffordshire terriers': 'Staffordshire Terriers',
      'american staffordshire terrier': 'American Staffordshire Terriers',
      'american staffordshire terriers': 'American Staffordshire Terriers',
      
      // Rottweiler variations
      'rottweiler': 'Rottweilers',
      'rottweilers': 'Rottweilers',
      
      // Other common breeds that might have singular/plural issues
      'akita': 'Akitas',
      'akitas': 'Akitas',
      'boxer': 'Boxers',
      'boxers': 'Boxers',
      'mastiff': 'Mastiffs',
      'mastiffs': 'Mastiffs',
      'bullmastiff': 'Bullmastiffs',
      'bullmastiffs': 'Bullmastiffs',
      'chow chow': 'Chow Chows',
      'chow chows': 'Chow Chows',
    };
    
    // Check for exact matches (case insensitive)
    const lowerNormalized = normalized.toLowerCase();
    if (breedMappings[lowerNormalized]) {
      return breedMappings[lowerNormalized];
    }
    
    // If no specific mapping, apply generic pluralization rules
    if (!normalized.endsWith('s') && !normalized.endsWith('x') && !normalized.endsWith('z')) {
      // Simple pluralization for most breeds
      if (normalized.endsWith('y') && normalized.length > 1) {
        const beforeY = normalized.slice(-2, -1);
        if (!['a', 'e', 'i', 'o', 'u'].includes(beforeY.toLowerCase())) {
          return normalized.slice(0, -1) + 'ies';
        }
      }
      return normalized + 's';
    }
    
    return normalized;
  };

  // Generate comprehensive breed list from existing data
  useEffect(() => {
    const existingBreeds = existingData
      .flatMap(item => item.bannedBreeds)
      .map(breed => normalizeBreedName(breed)) // Normalize breed names
      .filter((breed, index, self) => self.indexOf(breed) === index) // Remove duplicates
      .sort();

    // Combine all selectable breeds with existing breeds, removing duplicates
    const allSelectableBreeds = [...PIT_BULL_TYPE_BREEDS, ...COMMON_BREEDS];
    const combinedBreeds = [...new Set([...allSelectableBreeds, ...existingBreeds])].sort();
    setAllBreeds(combinedBreeds);
  }, [existingData]);

  const addBreed = (breed: string) => {
    const trimmedBreed = breed.trim();
    if (trimmedBreed && !selectedBreeds.includes(trimmedBreed)) {
      const updatedBreeds = [...selectedBreeds, trimmedBreed];
      onBreedsChange(updatedBreeds);
      setNewBreed('');
      setBreedSuggestionsOpen(false);
    }
  };

  // Get the final mapped breeds for storage (this will be used when submitting)
  const getMappedBreeds = () => {
    return mapBreedsForStorage(selectedBreeds);
  };

  // Check if any pit bull-type breeds are selected
  const hasPitBullTypes = selectedBreeds.some(breed => isPitBullType(breed));
  const selectedPitBullTypes = selectedBreeds.filter(breed => isPitBullType(breed));

  const removeBreed = (breedToRemove: string) => {
    onBreedsChange(selectedBreeds.filter(breed => breed !== breedToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addBreed(newBreed);
    }
  };

  const filteredBreeds = allBreeds.filter(breed =>
    breed.toLowerCase().includes(newBreed.toLowerCase()) &&
    !selectedBreeds.includes(breed)
  );

  const availablePitBullTypes = PIT_BULL_TYPE_BREEDS.filter(breed => 
    !selectedBreeds.includes(breed)
  );
  
  const availableCommonBreeds = COMMON_BREEDS.filter(breed => 
    !selectedBreeds.includes(breed)
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <Dog className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-medium">Affected Breeds *</h3>
      </div>

      {/* Add Breed Input */}
      <div className="space-y-2">
        <Label htmlFor="new-breed">Add Breed</Label>
        <div className="flex space-x-2">
          <div className="flex-1">
            <Popover open={breedSuggestionsOpen} onOpenChange={setBreedSuggestionsOpen}>
              <PopoverTrigger asChild>
                <div className="relative">
                  <Input
                    id="new-breed"
                    value={newBreed}
                    onChange={(e) => {
                      setNewBreed(e.target.value);
                      setBreedSuggestionsOpen(true);
                    }}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter breed name or search..."
                    className="pr-8"
                  />
                  <Search className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
              </PopoverTrigger>
              {newBreed && filteredBreeds.length > 0 && (
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandEmpty>
                      <div className="p-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => addBreed(newBreed)}
                          className="w-full"
                        >
                          Add "{newBreed}" as new breed
                        </Button>
                      </div>
                    </CommandEmpty>
                    <CommandGroup heading="Suggested Breeds">
                      {filteredBreeds.slice(0, 8).map((breed) => (
                        <CommandItem
                          key={breed}
                          value={breed}
                          onSelect={() => addBreed(breed)}
                        >
                          {breed}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              )}
            </Popover>
          </div>
          <Button 
            onClick={() => addBreed(newBreed)} 
            disabled={!newBreed.trim()}
            size="icon"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Start typing to see suggestions from existing legislation
        </p>
      </div>

      {/* Selected Breeds */}
      {selectedBreeds.length > 0 && (
        <div className="space-y-2">
          <Label>Selected Breeds ({selectedBreeds.length})</Label>
          <div className="flex flex-wrap gap-2">
            {selectedBreeds.map((breed) => (
              <Badge key={breed} variant="secondary" className="flex items-center space-x-1">
                <span>{breed}</span>
                <button
                  onClick={() => removeBreed(breed)}
                  className="ml-1 hover:text-destructive"
                  type="button"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Pit Bull-Type Breeds */}
      {availablePitBullTypes.length > 0 && (
        <div className="space-y-2">
          <Label>Pit Bull-Type Breeds (click to add)</Label>
          <div className="flex flex-wrap gap-2">
            {availablePitBullTypes.map((breed) => (
              <Badge
                key={breed}
                variant="outline"
                className="cursor-pointer hover:bg-orange-500 hover:text-white transition-colors border-orange-300"
                onClick={() => addBreed(breed)}
              >
                {breed}
              </Badge>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            These breeds will be stored as "Pit Bull-Type Dogs" for consistency with existing data
          </p>
        </div>
      )}

      {/* Other Common Breeds */}
      {availableCommonBreeds.length > 0 && (
        <div className="space-y-2">
          <Label>Other Common Breeds (click to add)</Label>
          <div className="flex flex-wrap gap-2">
            {availableCommonBreeds.slice(0, 12).map((breed) => (
              <Badge
                key={breed}
                variant="outline"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => addBreed(breed)}
              >
                {breed}
              </Badge>
            ))}
            {availableCommonBreeds.length > 12 && (
              <Badge variant="outline" className="text-muted-foreground">
                +{availableCommonBreeds.length - 12} more...
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Pit Bull-Type Mapping Info */}
      {hasPitBullTypes && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <div>
              <p className="font-medium mb-1">Breed Mapping Information</p>
              <p className="text-sm">
                You've selected {selectedPitBullTypes.length} pit bull-type breed{selectedPitBullTypes.length !== 1 ? 's' : ''}: {selectedPitBullTypes.join(', ')}
              </p>
              <p className="text-sm mt-1">
                These will be stored as "<strong>Pit Bull-Type Dogs</strong>" to maintain consistency with existing data in our database.
              </p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Breed Statistics */}
      {allBreeds.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            💡 <strong>{allBreeds.length}</strong> different breeds found in existing legislation. 
            Most commonly banned: {allBreeds.slice(0, 3).join(', ')}
          </p>
        </div>
      )}

      {errors.length > 0 && (
        <div className="text-sm text-destructive">
          <ul className="list-disc list-inside">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default BreedSelector;