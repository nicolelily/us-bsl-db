
import { supabase } from "@/integrations/supabase/client";
import { BreedLegislation } from "@/types";

export async function fetchBreedLegislationData(): Promise<BreedLegislation[]> {
  try {
    console.log('Fetching breed legislation data from Supabase with RLS protection...');
    
    // The breed_legislation table should be publicly readable, but we'll handle RLS gracefully
    const { data, error } = await supabase
      .from('breed_legislation')
      .select('*')
      .order('municipality', { ascending: true });

    if (error) {
      console.error('Supabase error:', error);
      
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
      return [];
    }

    console.log(`Successfully fetched ${data.length} records from Supabase`);
    
    // Transform the data to match our BreedLegislation interface
    return data.map((row) => ({
      id: row.id,
      municipality: row.municipality || '',
      state: row.state || '',
      type: (row.type === 'County' ? 'County' : 'City') as 'City' | 'County',
      bannedBreeds: Array.isArray(row.banned_breeds) ? row.banned_breeds.map(breed => String(breed)) : [],
      ordinance: row.ordinance || '',
      population: row.population || undefined,
      lat: row.lat || undefined,
      lng: row.lng || undefined,
      verificationDate: row.verification_date || undefined,
      ordinanceUrl: row.ordinance_url || undefined
    }));
  } catch (error) {
    console.error("Error fetching breed legislation data:", error);
    return []; // Return empty array on error
  }
}
