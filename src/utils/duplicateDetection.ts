import { BreedLegislation } from '@/types';
import { mapBreedsForStorage } from './breedMapping';

export interface DuplicateMatch {
  record: BreedLegislation;
  similarity: number;
  reasons: string[];
}

export interface DuplicateDetectionResult {
  hasDuplicates: boolean;
  matches: DuplicateMatch[];
  confidence: 'high' | 'medium' | 'low';
}

/**
 * Calculate similarity between two strings using Levenshtein distance
 */
function calculateStringSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  
  if (s1 === s2) return 1.0;
  
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  
  if (longer.length === 0) return 1.0;
  
  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

/**
 * Normalize municipality name for comparison
 */
function normalizeMunicipalityName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\b(city|county|town|village|borough)\b/g, '')
    .replace(/[^\w\s]/g, '')
    .trim();
}

/**
 * Calculate breed overlap between two breed arrays
 */
function calculateBreedOverlap(breeds1: string[], breeds2: string[]): number {
  if (breeds1.length === 0 && breeds2.length === 0) return 1.0;
  if (breeds1.length === 0 || breeds2.length === 0) return 0.0;
  
  // Normalize breeds using our mapping system
  const normalizedBreeds1 = mapBreedsForStorage(breeds1);
  const normalizedBreeds2 = mapBreedsForStorage(breeds2);
  
  const set1 = new Set(normalizedBreeds1.map(b => b.toLowerCase()));
  const set2 = new Set(normalizedBreeds2.map(b => b.toLowerCase()));
  
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  return intersection.size / union.size; // Jaccard similarity
}

/**
 * Check if two records are potential duplicates
 */
function checkDuplicate(
  newRecord: {
    municipality: string;
    state: string;
    municipality_type: 'City' | 'County';
    banned_breeds: string[];
    legislation_type: 'ban' | 'restriction';
  },
  existingRecord: BreedLegislation
): DuplicateMatch | null {
  const reasons: string[] = [];
  let totalSimilarity = 0;
  let weightSum = 0;
  
  // 1. Exact location match (highest weight)
  const locationWeight = 0.4;
  const municipalityMatch = newRecord.municipality.toLowerCase().trim() === 
                           existingRecord.municipality.toLowerCase().trim();
  const stateMatch = newRecord.state === existingRecord.state;
  const typeMatch = newRecord.municipality_type === existingRecord.municipalityType;
  
  if (municipalityMatch && stateMatch && typeMatch) {
    totalSimilarity += locationWeight * 1.0;
    reasons.push('Exact location match');
  } else if (stateMatch && typeMatch) {
    // Check for similar municipality names
    const municipalitySimilarity = calculateStringSimilarity(
      normalizeMunicipalityName(newRecord.municipality),
      normalizeMunicipalityName(existingRecord.municipality)
    );
    
    if (municipalitySimilarity > 0.8) {
      totalSimilarity += locationWeight * municipalitySimilarity;
      reasons.push(`Similar municipality name (${Math.round(municipalitySimilarity * 100)}% match)`);
    }
  }
  weightSum += locationWeight;
  
  // 2. Breed overlap (medium weight)
  const breedWeight = 0.35;
  const breedOverlap = calculateBreedOverlap(newRecord.banned_breeds, existingRecord.bannedBreeds);
  
  if (breedOverlap > 0.5) {
    totalSimilarity += breedWeight * breedOverlap;
    reasons.push(`${Math.round(breedOverlap * 100)}% breed overlap`);
  }
  weightSum += breedWeight;
  
  // 3. Legislation type match (lower weight)
  const legislationWeight = 0.25;
  if (newRecord.legislation_type === existingRecord.legislationType) {
    totalSimilarity += legislationWeight * 1.0;
    reasons.push('Same legislation type');
  }
  weightSum += legislationWeight;
  
  const finalSimilarity = totalSimilarity / weightSum;
  
  // Only consider it a potential duplicate if similarity is above threshold
  if (finalSimilarity > 0.6 && reasons.length > 0) {
    return {
      record: existingRecord,
      similarity: finalSimilarity,
      reasons
    };
  }
  
  return null;
}

/**
 * Detect potential duplicates for a new submission
 */
export function detectDuplicates(
  newRecord: {
    municipality: string;
    state: string;
    municipality_type: 'City' | 'County';
    banned_breeds: string[];
    legislation_type: 'ban' | 'restriction';
  },
  existingRecords: BreedLegislation[]
): DuplicateDetectionResult {
  const matches: DuplicateMatch[] = [];
  
  for (const existing of existingRecords) {
    const match = checkDuplicate(newRecord, existing);
    if (match) {
      matches.push(match);
    }
  }
  
  // Sort by similarity (highest first)
  matches.sort((a, b) => b.similarity - a.similarity);
  
  // Determine confidence level
  let confidence: 'high' | 'medium' | 'low' = 'low';
  if (matches.length > 0) {
    const highestSimilarity = matches[0].similarity;
    if (highestSimilarity > 0.9) {
      confidence = 'high';
    } else if (highestSimilarity > 0.75) {
      confidence = 'medium';
    } else {
      confidence = 'low';
    }
  }
  
  return {
    hasDuplicates: matches.length > 0,
    matches: matches.slice(0, 3), // Return top 3 matches
    confidence
  };
}

/**
 * Real-time duplicate checking hook for form validation
 */
export function useRealTimeDuplicateCheck() {
  // This would be implemented as a React hook for real-time checking
  // For now, we'll implement the basic detection function
  return { detectDuplicates };
}