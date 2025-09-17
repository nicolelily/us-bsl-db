
export type LegislationType = 'ban' | 'restriction';

export interface BreedLegislation {
  id: string;
  municipality: string;
  state: string;
  type: "City" | "County";
  bannedBreeds: string[];
  ordinance: string;
  legislationType: LegislationType;
  population?: number;
  lat?: number;
  lng?: number;
  verificationDate?: string;
  ordinanceUrl?: string;
}

export interface FilterOptions {
  search: string;
  breed: string | null;
  stateFilter: string | null;
  type: string | null;
  legislationType: string | null;
}

export interface SheetData {
  values: any[][];
}
