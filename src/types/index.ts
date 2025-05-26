
export interface BreedLegislation {
  id: number;
  municipality: string;
  state: string;
  type: "City" | "County";
  bannedBreeds: string[];
  ordinance: string;
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
}

export interface SheetData {
  values: any[][];
}
