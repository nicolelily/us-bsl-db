import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchBreedLegislationData } from '@/utils/dataFetcher';
import { detectDuplicates, DuplicateDetectionResult } from '@/utils/duplicateDetection';
import { SubmissionFormData } from '@/types/submissions';

interface UseDuplicateDetectionProps {
  formData: Partial<SubmissionFormData>;
  enabled?: boolean;
  debounceMs?: number;
}

export const useDuplicateDetection = ({
  formData,
  enabled = true,
  debounceMs = 1000
}: UseDuplicateDetectionProps) => {
  const [debouncedFormData, setDebouncedFormData] = useState(formData);
  const [duplicateResult, setDuplicateResult] = useState<DuplicateDetectionResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  // Fetch existing legislation data
  const { data: existingRecords = [], isLoading: isLoadingRecords } = useQuery({
    queryKey: ['breedLegislationData'],
    queryFn: fetchBreedLegislationData,
    enabled
  });

  // Debounce form data changes
  useEffect(() => {
    if (!enabled) return;

    const timer = setTimeout(() => {
      setDebouncedFormData(formData);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [formData, debounceMs, enabled]);

  // Check if we have enough data to perform duplicate detection
  const canCheckDuplicates = useMemo(() => {
    return !!(
      debouncedFormData.municipality?.trim() &&
      debouncedFormData.state &&
      debouncedFormData.municipality_type &&
      debouncedFormData.banned_breeds &&
      debouncedFormData.banned_breeds.length > 0 &&
      debouncedFormData.legislation_type
    );
  }, [debouncedFormData]);

  // Perform duplicate detection
  useEffect(() => {
    if (!enabled || !canCheckDuplicates || isLoadingRecords || existingRecords.length === 0) {
      setDuplicateResult(null);
      setIsChecking(false);
      return;
    }

    setIsChecking(true);

    // Simulate async operation for better UX
    const checkDuplicates = async () => {
      try {
        const result = detectDuplicates(
          {
            municipality: debouncedFormData.municipality!,
            state: debouncedFormData.state!,
            municipality_type: debouncedFormData.municipality_type!,
            banned_breeds: debouncedFormData.banned_breeds!,
            legislation_type: debouncedFormData.legislation_type!
          },
          existingRecords
        );

        setDuplicateResult(result);
      } catch (error) {
        console.error('Duplicate detection error:', error);
        setDuplicateResult(null);
      } finally {
        setIsChecking(false);
      }
    };

    // Small delay to prevent too frequent checks
    const timer = setTimeout(checkDuplicates, 100);
    return () => clearTimeout(timer);
  }, [
    enabled,
    canCheckDuplicates,
    debouncedFormData,
    existingRecords,
    isLoadingRecords
  ]);

  // Reset duplicate result when form data changes significantly
  useEffect(() => {
    if (!enabled) return;

    // If key fields change, immediately clear the result to show loading state
    const keyFields = [
      formData.municipality,
      formData.state,
      formData.municipality_type,
      formData.legislation_type
    ];

    if (keyFields.some(field => field !== undefined)) {
      setIsChecking(true);
    }
  }, [
    formData.municipality,
    formData.state,
    formData.municipality_type,
    formData.legislation_type,
    enabled
  ]);

  return {
    duplicateResult,
    isChecking: isChecking || isLoadingRecords,
    canCheckDuplicates,
    hasDuplicates: duplicateResult?.hasDuplicates ?? false,
    confidence: duplicateResult?.confidence ?? 'low',
    matchCount: duplicateResult?.matches.length ?? 0
  };
};