import { Exoplanet } from './exoplanets';

// This will be populated by the CSV data
export let csvExoplanets: Exoplanet[] = [];

// Function to load CSV data (will be called from the backend)
export function setCsvExoplanets(planets: Exoplanet[]) {
  csvExoplanets = planets;
}

// Export count
export const TOTAL_CSV_PLANETS = () => csvExoplanets.length;

export { csvExoplanets }