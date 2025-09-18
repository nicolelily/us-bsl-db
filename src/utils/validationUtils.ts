import { supabase } from '@/integrations/supabase/client';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions?: string[];
}

export interface FieldValidationResult {
  field: string;
  isValid: boolean;
  error?: string;
  warning?: string;
  suggestion?: string;
}

// Common validation patterns
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_REGEX = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;
const PHONE_REGEX = /^\+?[\d\s\-\(\)]{10,}$/;

// US States for validation
const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
  'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
  'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
  'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico',
  'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
  'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
  'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming', 'District of Columbia'
];

const US_STATE_ABBREVIATIONS = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA',
  'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT',
  'VA', 'WA', 'WV', 'WI', 'WY', 'DC'
];

/**
 * Validate email address
 */
export function validateEmail(email: string): FieldValidationResult {
  const trimmedEmail = email.trim();
  
  if (!trimmedEmail) {
    return {
      field: 'email',
      isValid: false,
      error: 'Email address is required'
    };
  }
  
  if (!EMAIL_REGEX.test(trimmedEmail)) {
    return {
      field: 'email',
      isValid: false,
      error: 'Please enter a valid email address'
    };
  }
  
  return {
    field: 'email',
    isValid: true
  };
}

/**
 * Validate URL with accessibility checking
 */
export async function validateUrl(url: string): Promise<FieldValidationResult> {
  const trimmedUrl = url.trim();
  
  if (!trimmedUrl) {
    return {
      field: 'url',
      isValid: true // URL is optional
    };
  }
  
  // Basic URL format validation
  if (!URL_REGEX.test(trimmedUrl)) {
    return {
      field: 'url',
      isValid: false,
      error: 'Please enter a valid URL (must start with http:// or https://)'
    };
  }
  
  // Check for common issues
  if (trimmedUrl.includes('localhost') || trimmedUrl.includes('127.0.0.1')) {
    return {
      field: 'url',
      isValid: false,
      error: 'URL cannot be a local address'
    };
  }
  
  // Try to check if URL is accessible (optional - can be done server-side)
  try {
    const response = await fetch(trimmedUrl, { 
      method: 'HEAD', 
      mode: 'no-cors',
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });
    
    // Note: Due to CORS, we might not get a proper response
    // This is more of a basic connectivity check
    return {
      field: 'url',
      isValid: true,
      warning: response.ok ? undefined : 'URL may not be accessible'
    };
  } catch (error) {
    return {
      field: 'url',
      isValid: true, // Don't fail validation due to network issues
      warning: 'Could not verify URL accessibility'
    };
  }
}

/**
 * Validate US state
 */
export function validateState(state: string): FieldValidationResult {
  const trimmedState = state.trim();
  
  if (!trimmedState) {
    return {
      field: 'state',
      isValid: false,
      error: 'State is required'
    };
  }
  
  // Check if it's a valid state name or abbreviation
  const isValidName = US_STATES.some(s => s.toLowerCase() === trimmedState.toLowerCase());
  const isValidAbbr = US_STATE_ABBREVIATIONS.some(s => s.toLowerCase() === trimmedState.toLowerCase());
  
  if (!isValidName && !isValidAbbr) {
    // Try to find similar states for suggestions
    const suggestions = US_STATES.filter(s => 
      s.toLowerCase().includes(trimmedState.toLowerCase()) ||
      trimmedState.toLowerCase().includes(s.toLowerCase())
    ).slice(0, 3);
    
    return {
      field: 'state',
      isValid: false,
      error: 'Please enter a valid US state',
      suggestion: suggestions.length > 0 ? `Did you mean: ${suggestions.join(', ')}?` : undefined
    };
  }
  
  return {
    field: 'state',
    isValid: true
  };
}

/**
 * Validate municipality against known database
 */
export async function validateMunicipality(municipality: string, state: string): Promise<FieldValidationResult> {
  const trimmedMunicipality = municipality.trim();
  
  if (!trimmedMunicipality) {
    return {
      field: 'municipality',
      isValid: false,
      error: 'Municipality is required'
    };
  }
  
  if (trimmedMunicipality.length < 2) {
    return {
      field: 'municipality',
      isValid: false,
      error: 'Municipality name must be at least 2 characters'
    };
  }
  
  try {
    // Check against existing municipalities in the database
    const { data: existingMunicipalities, error } = await supabase
      .from('breed_legislation')
      .select('municipality')
      .eq('state', state)
      .ilike('municipality', `%${trimmedMunicipality}%`)
      .limit(5);
    
    if (error) {
      console.error('Municipality validation error:', error);
      return {
        field: 'municipality',
        isValid: true, // Don't fail validation due to database errors
        warning: 'Could not verify municipality against database'
      };
    }
    
    // Check for exact match
    const exactMatch = existingMunicipalities?.find(
      m => m.municipality.toLowerCase() === trimmedMunicipality.toLowerCase()
    );
    
    if (exactMatch) {
      return {
        field: 'municipality',
        isValid: true
      };
    }
    
    // Check for similar municipalities
    const similarMunicipalities = existingMunicipalities?.map(m => m.municipality) || [];
    
    if (similarMunicipalities.length > 0) {
      return {
        field: 'municipality',
        isValid: true,
        suggestion: `Similar municipalities in ${state}: ${similarMunicipalities.slice(0, 3).join(', ')}`
      };
    }
    
    return {
      field: 'municipality',
      isValid: true,
      warning: 'This appears to be a new municipality for our database'
    };
    
  } catch (error) {
    console.error('Municipality validation error:', error);
    return {
      field: 'municipality',
      isValid: true,
      warning: 'Could not verify municipality'
    };
  }
}

/**
 * Validate and standardize breed names
 */
export async function validateBreeds(breeds: string[]): Promise<FieldValidationResult> {
  if (!breeds || breeds.length === 0) {
    return {
      field: 'breeds',
      isValid: false,
      error: 'At least one breed must be specified'
    };
  }
  
  // Remove empty strings and trim
  const cleanBreeds = breeds.filter(breed => breed.trim().length > 0).map(breed => breed.trim());
  
  if (cleanBreeds.length === 0) {
    return {
      field: 'breeds',
      isValid: false,
      error: 'At least one valid breed must be specified'
    };
  }
  
  try {
    // Get existing breeds from database for standardization
    const { data: existingBreeds, error } = await supabase
      .from('breed_legislation')
      .select('banned_breeds')
      .not('banned_breeds', 'is', null)
      .limit(100);
    
    if (error) {
      console.error('Breed validation error:', error);
      return {
        field: 'breeds',
        isValid: true,
        warning: 'Could not verify breeds against database'
      };
    }
    
    // Extract all unique breeds from the database
    const allExistingBreeds = new Set<string>();
    existingBreeds?.forEach(record => {
      if (Array.isArray(record.banned_breeds)) {
        record.banned_breeds.forEach(breed => {
          if (typeof breed === 'string') {
            allExistingBreeds.add(breed.toLowerCase());
          }
        });
      }
    });
    
    // Check for standardization opportunities
    const suggestions: string[] = [];
    const warnings: string[] = [];
    
    cleanBreeds.forEach(breed => {
      const lowerBreed = breed.toLowerCase();
      
      // Check for exact match
      if (allExistingBreeds.has(lowerBreed)) {
        return; // Good match
      }
      
      // Check for similar breeds
      const similarBreeds = Array.from(allExistingBreeds).filter(existingBreed =>
        existingBreed.includes(lowerBreed) || lowerBreed.includes(existingBreed)
      );
      
      if (similarBreeds.length > 0) {
        suggestions.push(`"${breed}" might be similar to: ${similarBreeds.slice(0, 2).join(', ')}`);
      } else {
        warnings.push(`"${breed}" is a new breed for our database`);
      }
    });
    
    let resultMessage = '';
    if (suggestions.length > 0) {
      resultMessage += suggestions.join('; ');
    }
    if (warnings.length > 0) {
      if (resultMessage) resultMessage += '; ';
      resultMessage += warnings.join('; ');
    }
    
    return {
      field: 'breeds',
      isValid: true,
      suggestion: suggestions.length > 0 ? resultMessage : undefined,
      warning: warnings.length > 0 && suggestions.length === 0 ? resultMessage : undefined
    };
    
  } catch (error) {
    console.error('Breed validation error:', error);
    return {
      field: 'breeds',
      isValid: true,
      warning: 'Could not verify breeds against database'
    };
  }
}

/**
 * Validate ordinance text
 */
export function validateOrdinanceText(text: string): FieldValidationResult {
  const trimmedText = text.trim();
  
  if (!trimmedText) {
    return {
      field: 'ordinance',
      isValid: false,
      error: 'Ordinance description is required'
    };
  }
  
  if (trimmedText.length < 10) {
    return {
      field: 'ordinance',
      isValid: false,
      error: 'Ordinance description must be at least 10 characters'
    };
  }
  
  if (trimmedText.length > 5000) {
    return {
      field: 'ordinance',
      isValid: false,
      error: 'Ordinance description must be less than 5000 characters'
    };
  }
  
  // Check for common issues
  const warnings: string[] = [];
  
  if (!/[.!?]$/.test(trimmedText)) {
    warnings.push('Consider ending with proper punctuation');
  }
  
  if (trimmedText.split(' ').length < 5) {
    warnings.push('Consider providing more detailed description');
  }
  
  return {
    field: 'ordinance',
    isValid: true,
    warning: warnings.length > 0 ? warnings.join('; ') : undefined
  };
}

/**
 * Validate population (optional field)
 */
export function validatePopulation(population?: number): FieldValidationResult {
  if (population === undefined || population === null) {
    return {
      field: 'population',
      isValid: true // Optional field
    };
  }
  
  if (population < 0) {
    return {
      field: 'population',
      isValid: false,
      error: 'Population cannot be negative'
    };
  }
  
  if (population > 50000000) { // Reasonable upper limit
    return {
      field: 'population',
      isValid: false,
      error: 'Population seems unreasonably large'
    };
  }
  
  if (population < 100) {
    return {
      field: 'population',
      isValid: true,
      warning: 'Very small population - please verify'
    };
  }
  
  return {
    field: 'population',
    isValid: true
  };
}

/**
 * Comprehensive form validation
 */
export async function validateSubmissionForm(formData: any): Promise<ValidationResult> {
  const results: FieldValidationResult[] = [];
  
  // Validate required fields
  if (formData.state) {
    results.push(validateState(formData.state));
  }
  
  if (formData.municipality && formData.state) {
    results.push(await validateMunicipality(formData.municipality, formData.state));
  }
  
  if (formData.banned_breeds) {
    results.push(await validateBreeds(formData.banned_breeds));
  }
  
  if (formData.ordinance) {
    results.push(validateOrdinanceText(formData.ordinance));
  }
  
  if (formData.ordinance_url) {
    results.push(await validateUrl(formData.ordinance_url));
  }
  
  if (formData.population !== undefined) {
    results.push(validatePopulation(formData.population));
  }
  
  // Compile results
  const errors = results.filter(r => !r.isValid).map(r => r.error!);
  const warnings = results.filter(r => r.warning).map(r => r.warning!);
  const suggestions = results.filter(r => r.suggestion).map(r => r.suggestion!);
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions: suggestions.length > 0 ? suggestions : undefined
  };
}