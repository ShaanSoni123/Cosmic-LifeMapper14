export interface NASAExoplanet {
  id: string;
  name: string;
  distanceFromEarth: number; // light years
  orbitalPeriod: number; // days
  temperature: number; // Kelvin
  starType: string;
  radius: number; // Earth radii
  mass: number; // Earth masses
  discoveryYear: number;
  discoveryMethod: string;
  discoveryFacility: string;
  constellation: string;
  habitabilityScore: number;
  inHabitableZone: boolean;
  stellarTemperature: number;
  orbitalDistance: number; // AU
}

// Empty NASA Exoplanet Database - removed as requested
export const nasaExoplanets: NASAExoplanet[] = [];

// Helper function to get star type from temperature
export function getStarTypeFromTemp(temp: number): string {
  if (temp > 30000) return 'O';
  if (temp > 10000) return 'B';
  if (temp > 7500) return 'A';
  if (temp > 6000) return 'F';
  if (temp > 5200) return 'G';
  if (temp > 3700) return 'K';
  return 'M';
}

// Helper function to estimate distance (simplified)
export function estimateDistance(discoveryYear: number, method: string): number {
  // Rough estimation based on discovery capabilities over time
  const baseDistance = method === 'Transit' ? 
    (discoveryYear > 2015 ? 500 : 1000) : 
    (discoveryYear > 2010 ? 50 : 100);
  
  return baseDistance + Math.random() * baseDistance;
}

// Export total count
export const TOTAL_NASA_PLANETS = nasaExoplanets.length;