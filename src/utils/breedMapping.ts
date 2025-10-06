// Breed mapping utilities for consistent data storage
// Maps specific pit bull-type breeds to the standardized "Pit Bull-Type Dogs" category
// All breed names are normalized to plural forms for consistency

export const PIT_BULL_TYPE_BREEDS = [
  'Pit Bulls',
  'American Pit Bull Terriers', 
  'Staffordshire Terriers',
  'American Staffordshire Terriers',
  'Bull Terriers',
  'American Bulldogs',
  'American Bullies',
  'American Bully XLs'
];

export const STANDARDIZED_PIT_BULL_NAME = 'Pit Bull-Type Dogs';

// Common breed names for suggestions (excluding pit bull types since they'll be handled specially)
export const COMMON_BREEDS = [
  'Rottweilers', 'German Shepherd Dogs', 'Doberman Pinschers', 'Chow Chows',
  'Akitas', 'Mastiffs', 'Bullmastiffs', 'Presa Canarios', 'Cane Corsos', 'Dogo Argentinos',
  'Fila Brasileiros', 'Tosa Inus', 'Boxers', 'Great Danes', 'Siberian Huskies',
  'Alaskan Malamutes', 'Wolf Hybrids', 'Rhodesian Ridgebacks'
];


/**
 * Maps user-selected breeds to standardized database format
 * Converts specific pit bull-type breeds to "Pit Bull-Type Dogs"
 */
export const mapBreedsForStorage = (selectedBreeds: string[]): string[] => {
  const mappedBreeds = new Set<string>();
  
  selectedBreeds.forEach(breed => {
    if (isPitBullType(breed)) {
      mappedBreeds.add(STANDARDIZED_PIT_BULL_NAME);
    } else {
      mappedBreeds.add(breed);
    }
  });
  
  return Array.from(mappedBreeds).sort();
};

/**
 * Maps database breeds back to display format
 * Keeps "Pit Bull-Type Dogs" as the display name for pit bull-type breeds
 */
export const mapBreedsForDisplay = (storedBreeds: string[]): string[] => {
  return storedBreeds.map(breed => {
    if (breed === STANDARDIZED_PIT_BULL_NAME || breed === 'pit bull-type dog') {
      return STANDARDIZED_PIT_BULL_NAME; // Always show as "Pit Bull-Type Dogs"
    }
    return breed;
  });
};

/**
 * Checks if a breed is a pit bull-type breed (handles both singular and plural forms)
 */
export const isPitBullType = (breed: string): boolean => {
  const lowerBreed = breed.toLowerCase();
  
  // Check against our plural list
  if (PIT_BULL_TYPE_BREEDS.map(b => b.toLowerCase()).includes(lowerBreed)) {
    return true;
  }
  
  // Also check against singular forms for backwards compatibility
  const singularForms = [
    'pit bull', 'american pit bull terrier', 'staffordshire terrier',
    'american staffordshire terrier', 'bull terrier', 'american bulldog',
    'american bully', 'american bully xl'
  ];
  
  return singularForms.includes(lowerBreed);
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