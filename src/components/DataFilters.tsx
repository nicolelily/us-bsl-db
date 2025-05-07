
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';
import { breedLegislationData } from '../data/breedLegislationData';
import { FilterOptions } from '@/types';

interface DataFiltersProps {
  onFilterChange: (filters: FilterOptions) => void;
}

const DataFilters = ({ onFilterChange }: DataFiltersProps) => {
  const [search, setSearch] = useState('');
  const [breed, setBreed] = useState<string | null>(null);
  const [stateFilter, setStateFilter] = useState<string | null>(null);
  const [type, setType] = useState<string | null>(null);

  // Generate unique lists for filters
  const uniqueBreeds = Array.from(
    new Set(
      breedLegislationData.flatMap(item => item.bannedBreeds)
    )
  ).sort();

  const uniqueStates = Array.from(
    new Set(breedLegislationData.map(item => item.state))
  ).sort();

  // Update filters whenever any filter changes
  useEffect(() => {
    onFilterChange({
      search,
      breed,
      stateFilter,
      type
    });
  }, [search, breed, stateFilter, type, onFilterChange]);

  const handleReset = () => {
    setSearch('');
    setBreed(null);
    setStateFilter(null);
    setType(null);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
      <h2 className="text-lg font-semibold mb-4 text-dogdata-text">Filter Data</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <label htmlFor="search" className="text-sm font-medium text-dogdata-text">
            Search Municipality
          </label>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="breed-filter" className="text-sm font-medium text-dogdata-text">
            Breed
          </label>
          <Select value={breed || ''} onValueChange={setBreed}>
            <SelectTrigger id="breed-filter">
              <SelectValue placeholder="All breeds" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All breeds</SelectItem>
              {uniqueBreeds.map(breed => (
                <SelectItem key={breed} value={breed}>{breed}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label htmlFor="state-filter" className="text-sm font-medium text-dogdata-text">
            State
          </label>
          <Select value={stateFilter || ''} onValueChange={setStateFilter}>
            <SelectTrigger id="state-filter">
              <SelectValue placeholder="All states" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All states</SelectItem>
              {uniqueStates.map(state => (
                <SelectItem key={state} value={state}>{state}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label htmlFor="type-filter" className="text-sm font-medium text-dogdata-text">
            Municipality Type
          </label>
          <Select value={type || ''} onValueChange={setType}>
            <SelectTrigger id="type-filter">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All types</SelectItem>
              <SelectItem value="City">City</SelectItem>
              <SelectItem value="County">County</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <Button
          variant="outline"
          onClick={handleReset}
          className="text-dogdata-text"
        >
          <Filter className="mr-2 h-4 w-4" />
          Reset Filters
        </Button>
      </div>
    </div>
  );
};

export default DataFilters;
