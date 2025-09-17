// Breed mapping utilities for consistent data storage
// Maps specific pit bull-type breeds to the standardized "pit bull-type dog" category

export const PIT_BULL_TYPE_BREEDS = [
  'Pit Bull',
  'American Pit Bull Terrier', 
  'Staffordshire Terrier',
  'American Staffordshire Terrier',
  'Bull Terrier',
  'American Bulldog',
  'American Bully',
  'American Bully XL'
];

export const STANDARDIZED_PIT_BULL_NAME = 'pit bull-type dog';

// Common breed names for suggestions (excluding pit bull types since they'll be handled specially)
export const COMMON_BREEDS = [
  'Rottweiler', 'German Shepherd', 'Doberman Pinscher', 'Chow Chow',
  'Akita', 'Mastiff', 'Bullmastiff', 'Presa Canario', 'Cane Corso', 'Dogo Argentino',
  'Fila Brasileiro', 'Tosa Inu', 'Boxer', 'Great Dane', 'Siberian Husky',
  'Alaskan Malamute', 'Wolf Hybrid', 'Rhodesian Ridgeback'
];

/**
 * Maps user-selected breeds to standardized database format
 * Converts specific pit bull-type breeds to "pit bull-type dog"
 */
export const mapBreedsForStorage = (selectedBreeds: string[]): string[] => {
  const mappedBreeds = new Set<string>();
  
  selectedBreeds.forEach(breed => {
    if (PIT_BULL_TYPE_BREEDS.includes(breed)) {
      mappedBreeds.add(STANDARDIZED_PIT_BULL_NAME);
    } else {
      mappedBreeds.add(breed);
    }
  });
  
  return Array.from(mappedBreeds).sort();
};

/**
 * Maps database breeds back to display format
 * Expands "pit bull-type dog" to show specific breeds if needed
 */
export const mapBreedsForDisplay = (storedBreeds: string[]): string[] => {
  return storedBreeds.map(breed => {
    if (breed === STANDARDIZED_PIT_BULL_NAME) {
      return breed; // Keep as "pit bull-type dog" for display
    }
    return breed;
  });
};

/**
 * Checks if a breed is a pit bull-type breed
 */
export const isPitBullType = (breed: string): boolean => {
  return PIT_BULL_TYPE_BREEDS.includes(breed);
};

/**
 * Gets all available breeds for selection (including pit bull types)
 */
export const getAllSelectableBreeds = (): string[] => {
  return [...PIT_BULL_TYPE_BREEDS, ...COMMON_BREEDS].sort();
};

/**
 * Groups breeds by category for better UX
 */
export const getBreedsByCategory = () => {
  return {
    'Pit Bull-Type Breeds': PIT_BULL_TYPE_BREEDS,
    'Other Common Breeds': COMMON_BREEDS
  };
};