
import React, { useState } from 'react';
import Navigation from '../components/Navigation';
import DataFilters from '../components/DataFilters';
import { FilterOptions } from '@/types';
import { fetchBreedLegislationData } from '@/utils/dataFetcher';
import { useQuery } from '@tanstack/react-query';

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

  return (
    <div className="min-h-screen bg-dogdata-background">
      <Navigation />
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-dogdata-text mb-4">Breed Legislation Map</h1>
          <p className="text-dogdata-text mb-6">
            Visual representation of breed-specific legislation across the United States.
            This map view is under development and will be available in a future update.
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

          <div className="bg-white p-8 rounded-lg shadow-md flex flex-col items-center justify-center" style={{ height: '500px' }}>
            <MapPin className="w-16 h-16 text-dogdata-accent mb-4" />
            <h3 className="text-xl font-semibold text-dogdata-text mb-2">Map Visualization Coming Soon</h3>
            <p className="text-center text-dogdata-text max-w-md">
              The interactive map showing the geographical distribution of breed-specific legislation
              will be implemented in a future update. Check back soon!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Temporary map pin component until we implement actual map
const MapPin = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
);

export default MapView;
