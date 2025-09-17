import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { fetchBreedLegislationData } from '@/utils/dataFetcher';

interface LocationSelectorProps {
  municipality: string;
  state: string;
  municipalityType: 'City' | 'County';
  onMunicipalityChange: (value: string) => void;
  onStateChange: (value: string) => void;
  onMunicipalityTypeChange: (value: 'City' | 'County') => void;
  errors?: string[];
}

// US States list
const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
  'Wisconsin', 'Wyoming'
];

const LocationSelector: React.FC<LocationSelectorProps> = ({
  municipality,
  state,
  municipalityType,
  onMunicipalityChange,
  onStateChange,
  onMunicipalityTypeChange,
  errors = []
}) => {
  const [municipalityOpen, setMunicipalityOpen] = useState(false);
  const [municipalitySuggestions, setMunicipalitySuggestions] = useState<string[]>([]);

  // Fetch existing legislation data for autocomplete suggestions
  const { data: existingData = [] } = useQuery({
    queryKey: ['breedLegislationData'],
    queryFn: fetchBreedLegislationData
  });

  // Generate municipality suggestions based on existing data and selected state/type
  useEffect(() => {
    if (!state || !municipalityType) {
      setMunicipalitySuggestions([]);
      return;
    }

    const suggestions = existingData
      .filter(item => 
        item.state === state && 
        item.municipalityType === municipalityType
      )
      .map(item => item.municipality)
      .filter((value, index, self) => self.indexOf(value) === index) // Remove duplicates
      .sort();

    setMunicipalitySuggestions(suggestions);
  }, [state, municipalityType, existingData]);

  const filteredMunicipalities = municipalitySuggestions.filter(m =>
    m.toLowerCase().includes(municipality.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <MapPin className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-medium">Location Information</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="state">State *</Label>
          <Select value={state} onValueChange={onStateChange}>
            <SelectTrigger id="state">
              <SelectValue placeholder="Select a state" />
            </SelectTrigger>
            <SelectContent>
              {US_STATES.map((stateName) => (
                <SelectItem key={stateName} value={stateName}>
                  {stateName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="municipality-type">Type *</Label>
          <Select 
            value={municipalityType} 
            onValueChange={(value: 'City' | 'County') => onMunicipalityTypeChange(value)}
          >
            <SelectTrigger id="municipality-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="City">City</SelectItem>
              <SelectItem value="County">County</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="municipality">
          {municipalityType} Name *
        </Label>
        
        {municipalitySuggestions.length > 0 ? (
          <Popover open={municipalityOpen} onOpenChange={setMunicipalityOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={municipalityOpen}
                className="w-full justify-between"
              >
                {municipality || `Select ${municipalityType.toLowerCase()}...`}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput 
                  placeholder={`Search ${municipalityType.toLowerCase()}...`}
                  value={municipality}
                  onValueChange={onMunicipalityChange}
                />
                <CommandEmpty>
                  <div className="p-2">
                    <p className="text-sm text-muted-foreground mb-2">
                      No existing {municipalityType.toLowerCase()} found.
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setMunicipalityOpen(false);
                      }}
                    >
                      Use "{municipality}" as new entry
                    </Button>
                  </div>
                </CommandEmpty>
                <CommandGroup>
                  {filteredMunicipalities.map((m) => (
                    <CommandItem
                      key={m}
                      value={m}
                      onSelect={(currentValue) => {
                        onMunicipalityChange(currentValue);
                        setMunicipalityOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          municipality === m ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {m}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        ) : (
          <Input
            id="municipality"
            value={municipality}
            onChange={(e) => onMunicipalityChange(e.target.value)}
            placeholder={`Enter ${municipalityType.toLowerCase()} name`}
            className="w-full"
          />
        )}
        
        <p className="text-sm text-muted-foreground">
          {municipalitySuggestions.length > 0 
            ? `${municipalitySuggestions.length} existing ${municipalityType.toLowerCase()}${municipalitySuggestions.length !== 1 ? 's' : ''} found in ${state}`
            : `Enter the full official name of the ${municipalityType.toLowerCase()}`
          }
        </p>
      </div>

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

export default LocationSelector;