import { calculateHabitabilityScore, isInHabitableZone } from '../utils/habitabilityCalculator';

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

// This will be populated from the actual CSV data
// For now, we'll use a small sample to avoid duplicates
export const nasaExoplanets: NASAExoplanet[] = [
  {
    id: "kepler-22b",
    name: "Kepler-22b",
    distanceFromEarth: 620,
    orbitalPeriod: 289.9,
    temperature: 262,
    starType: "G5V",
    radius: 2.4,
    mass: 5.4,
    discoveryYear: 2011,
    discoveryMethod: "Transit",
    discoveryFacility: "Kepler Space Telescope",
    constellation: "Cygnus",
    habitabilityScore: 45,
    inHabitableZone: true,
    stellarTemperature: 5518,
    orbitalDistance: 0.85
  },
  {
    id: "proxima-centauri-b",
    name: "Proxima Centauri b",
    distanceFromEarth: 4.24,
    orbitalPeriod: 11.2,
    temperature: 234,
    starType: "M5.5V",
    radius: 1.1,
    mass: 1.3,
    discoveryYear: 2016,
    discoveryMethod: "Radial Velocity",
    discoveryFacility: "ESO",
    constellation: "Centaurus",
    habitabilityScore: 65,
    inHabitableZone: true,
    stellarTemperature: 3042,
    orbitalDistance: 0.0485
  },
  {
    id: "trappist-1e",
    name: "TRAPPIST-1e",
    distanceFromEarth: 40.7,
    orbitalPeriod: 6.1,
    temperature: 251,
    starType: "M8V",
    radius: 0.92,
    mass: 0.77,
    discoveryYear: 2017,
    discoveryMethod: "Transit",
    discoveryFacility: "TRAPPIST",
    constellation: "Aquarius",
    habitabilityScore: 72,
    inHabitableZone: true,
    stellarTemperature: 2559,
    orbitalDistance: 0.028
  }
];

// Export total count
export const TOTAL_NASA_PLANETS = nasaExoplanets.length;