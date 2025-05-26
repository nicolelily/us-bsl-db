
import { BreedLegislation } from "@/types";

// The Google Sheet ID from the provided URL
const SHEET_ID = "1caayCJPHvkzspOfaoe5APMH5kZPpm1uU4-PRvRslp7Q";
const SHEET_NAME = "Sheet1"; // Default sheet name, change if needed
const API_KEY = "AIzaSyBgm80tLaj73wC9vHGhIhFvaoIG4mBR8UA"; // This is a public API key for Google Sheets API

export async function fetchBreedLegislationData(): Promise<BreedLegislation[]> {
  try {
    // Construct the Google Sheets API URL
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}?key=${API_KEY}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }
    
    const data = await response.json();
    return transformSheetData(data.values);
  } catch (error) {
    console.error("Error fetching breed legislation data:", error);
    return []; // Return empty array on error
  }
}

function transformSheetData(values: any[][]): BreedLegislation[] {
  if (!values || values.length < 2) {
    console.error("Invalid sheet data format");
    return [];
  }
  
  // Skip the header row (row 0) and process each data row
  return values.slice(1).map((row, index) => {
    // Based on the observed structure in the Google Sheet
    // Adjust indices if the column order is different
    const municipality = row[0] || '';
    const state = row[1] || '';
    const type = (row[2] === 'County' ? 'County' : 'City') as 'City' | 'County';
    
    // Parse banned breeds - assuming they're in column 3, comma-separated
    const bannedBreeds = row[3] ? row[3].split(',').map((breed: string) => breed.trim()) : [];
    
    const ordinance = row[4] || '';
    const population = row[5] ? parseInt(row[5], 10) : undefined;
    
    // Parse coordinates if available (columns 6 and 7)
    const lat = row[6] ? parseFloat(row[6]) : undefined;
    const lng = row[7] ? parseFloat(row[7]) : undefined;
    
    // Parse new fields (columns 8 and 9)
    const verificationDate = row[8] || undefined;
    const ordinanceUrl = row[9] || undefined;
    
    return {
      id: index + 1, // Generate an ID based on row index
      municipality,
      state,
      type,
      bannedBreeds,
      ordinance,
      population,
      lat,
      lng,
      verificationDate,
      ordinanceUrl
    };
  });
}
