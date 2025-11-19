
import React, { useState } from 'react';
import Navigation from '../components/Navigation';
import DataFilters from '../components/DataFilters';
import { FilterOptions } from '@/types';
import { fetchBreedLegislationData } from '@/utils/dataFetcher';
import { useQuery } from '@tanstack/react-query';
import MapComponent from '../components/MapComponent';
const MapView = () => {
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    breed: null,
    stateFilter: null,
    municipalityType: null,
    legislationType: null,
  });

  const { data: breedLegislationData = [], isLoading, error } = useQuery({
    queryKey: ['breedLegislationData'],
    queryFn: fetchBreedLegislationData
  });

  const filteredData = React.useMemo(() => {
    return breedLegislationData.filter(item => {
      // Filter by search text
      if (filters.search && !item.municipality.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }

      // Filter by breed
      if (filters.breed && !item.bannedBreeds.includes(filters.breed)) {
        return false;
      }

      // Filter by state
      if (filters.stateFilter && item.state !== filters.stateFilter) {
        return false;
      }

      // Filter by municipality type
      if (filters.municipalityType && item.municipalityType !== filters.municipalityType) {
        return false;
      }

      // Filter by legislation type
      if (filters.legislationType && item.legislationType !== filters.legislationType) {
        return false;
      }

      return true;
    });
  }, [filters, breedLegislationData]);

  return (
    <div className="min-h-screen bg-dogdata-background">
      <Navigation />
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-dogdata-text mb-4">Breed Legislation Map</h1>
          <p className="text-dogdata-text mb-6">
            Visual representation of breed-specific legislation across the United States.
            Hover over markers to view summary details, and click for full information and ordinance links.
          </p>

          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-dogdata-blue"></div>
            </div>
          ) : error ? (
            <p className="text-red-500 mb-6">Error loading data. Please try again later.</p>
          ) : (
            <DataFilters onFilterChange={setFilters} breedLegislationData={breedLegislationData} />
          )}

          <MapComponent data={filteredData} />
        </div>
      </div>
    </div>
  );
};



export default MapView;
