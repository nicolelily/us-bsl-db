
import React, { useState, useMemo } from 'react';
import Navigation from '../components/Navigation';
import StatsComponent from '../components/StatsComponent';
import DataFilters from '../components/DataFilters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FilterOptions } from '@/types';
import { fetchBreedLegislationData } from '@/utils/dataFetcher';
import { useQuery } from '@tanstack/react-query';

const Stats = () => {
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

  // Calculate some basic statistics
  const totalMunicipalities = filteredData.length;
  const totalBreedBans = filteredData.reduce((sum, item) => sum + item.bannedBreeds.length, 0);
  const uniqueBreeds = new Set(filteredData.flatMap(item => item.bannedBreeds)).size;
  const uniqueStates = new Set(filteredData.map(item => item.state)).size;

  return (
    <div className="min-h-screen bg-dogdata-background">
      <Navigation />
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-dogdata-text mb-4">Statistics & Analytics</h1>
          <p className="text-dogdata-text mb-6">
            Explore statistics and visualizations about breed-specific legislation in the United States.
            Use the filters below to analyze specific subsets of the data.
          </p>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-dogdata-blue"></div>
            </div>
          ) : error ? (
            <p className="text-red-500 mb-6">Error loading data. Please try again later.</p>
          ) : (
            <>
              <DataFilters onFilterChange={setFilters} breedLegislationData={breedLegislationData} />
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">Total Municipalities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-dogdata-blue">{totalMunicipalities}</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">Total Breed Bans</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-dogdata-accent">{totalBreedBans}</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">Unique Breeds Banned</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-dogdata-bluelight">{uniqueBreeds}</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">States with Bans</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-dogdata-blue">{uniqueStates}</p>
                  </CardContent>
                </Card>
              </div>
              
              <StatsComponent data={filteredData} />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Stats;
