
import React, { useState, useMemo, useEffect } from 'react';
import Navigation from '../components/Navigation';
import DataFilters from '../components/DataFilters';
import DataTable from '../components/DataTable';
import { FilterOptions, BreedLegislation } from '@/types';
import { fetchBreedLegislationData } from '@/utils/dataFetcher';

import { useQuery } from '@tanstack/react-query';

const Index = () => {
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    breed: null,
    stateFilter: null,
    type: null,
  });

  const { data: breedLegislationData = [], isLoading, error } = useQuery({
    queryKey: ['breedLegislationData'],
    queryFn: fetchBreedLegislationData
  });



  const filteredData = useMemo(() => {
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

      // Filter by type
      if (filters.type && item.type !== filters.type) {
        return false;
      }

      return true;
    });
  }, [filters, breedLegislationData]);

  return (
    <div className="min-h-screen bg-bsl-background">
      <Navigation />
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-bsl-brown mb-4">U.S. Breed-Specific Legislation Database</h1>
          <p className="text-bsl-brown mb-6">
            This application provides information about breed-specific legislation in municipalities across the United States.
            Use the filters below to explore data about banned dog breeds, ordinances, and more. Please note that this database only includes bans at the moment. We plan to add the legislation regulating specific breeds in the near future.
          </p>
          
          <DataFilters onFilterChange={setFilters} breedLegislationData={breedLegislationData} />
          
          <div className="mb-4">
            {isLoading ? (
              <p className="text-sm text-bsl-brown">Loading data...</p>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-red-600 font-semibold">Error loading data:</p>
                <p className="text-sm text-red-500 mt-1">{error?.message || 'Unknown error occurred'}</p>
                <p className="text-xs text-red-400 mt-2">Check the browser console for more details.</p>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-sm text-bsl-brown">
                  Showing {filteredData.length} of {breedLegislationData.length} records
                </p>
                {breedLegislationData.length === 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
                    <p className="text-sm text-yellow-700">No data loaded from database</p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-bsl-teal"></div>
            </div>
          ) : (
            <DataTable data={filteredData} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
