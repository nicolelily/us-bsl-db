
import { supabase } from "@/integrations/supabase/client";
import { BreedLegislation } from "@/types";
import { securityChecks, auditLog } from "@/utils/securityUtils";

export async function fetchBreedLegislationData(): Promise<BreedLegislation[]> {
  try {
    console.log('Fetching breed legislation data with enhanced security...');
    
    // Enhanced security checks
    if (!securityChecks.checkRateLimiting('fetch_breed_data', 10, 60000)) {
      console.warn('Rate limit exceeded for breed legislation fetch');
      return [];
    }
    
    // Audit log the action
    await auditLog.logAction('fetch_breed_legislation_attempt');
    
    // The breed_legislation table should be publicly readable, but we'll handle RLS gracefully
    const { data, error } = await supabase
      .from('breed_legislation')
      .select('*')
      .order('municipality', { ascending: true });

    if (error) {
      console.error('Supabase error:', error);
      await auditLog.logAction('fetch_breed_legislation_error', { error: error.message });
      
      // Handle RLS policy violations gracefully
      if (error.message?.includes('row-level security') || 
          error.message?.includes('permission denied') ||
          error.code === 'PGRST116' || 
          error.code === '42501') {
        console.warn('RLS policy may be blocking access to breed legislation data');
        // Return empty array for now, but log the issue
        return [];
      }
      
      throw new Error(`Failed to fetch data: ${error.message}`);
    }

    if (!data) {
      console.log('No data returned from Supabase');
      await auditLog.logAction('fetch_breed_legislation_empty');
      return [];
    }

    console.log(`Successfully fetched ${data.length} records from Supabase`);
    await auditLog.logAction('fetch_breed_legislation_success', { record_count: data.length });
    
    // Transform the data to match our BreedLegislation interface with input validation
    const transformedData = data.map((row) => ({
      id: row.id,
      municipality: String(row.municipality || '').trim(),
      state: String(row.state || '').trim(),
      type: (row.type === 'County' ? 'County' : 'City') as 'City' | 'County',
      bannedBreeds: Array.isArray(row.banned_breeds) 
        ? row.banned_breeds.map(breed => String(breed).trim()).filter(Boolean)
        : [],
      ordinance: String(row.ordinance || '').trim(),
      population: row.population || undefined,
      lat: row.lat || undefined,
      lng: row.lng || undefined,
      verificationDate: row.verification_date || undefined,
      ordinanceUrl: row.ordinance_url || undefined
    }));

    return transformedData;
  } catch (error) {
    console.error("Error fetching breed legislation data:", error);
    await auditLog.logAction('fetch_breed_legislation_error', { error: error instanceof Error ? error.message : 'Unknown error' });
    return []; // Return empty array on error
  }
}
