// Comprehensive habitability calculation based on apSameer1.py
export interface PlanetData {
  name: string;
  pl_rade?: number; // Planet radius (Earth radii)
  pl_bmasse?: number; // Planet mass (Earth masses)
  pl_eqt?: number; // Equilibrium temperature (K)
  st_teff?: number; // Stellar temperature (K)
  pl_orbsmax?: number; // Orbital distance (AU)
  st_age?: number; // Star age (Gyr)
  st_mass?: number; // Star mass (Solar masses)
  st_lum?: number; // Stellar luminosity (Solar units)
  discoveryYear?: number;
  discoveryMethod?: string;
  discoveryFacility?: string;
  constellation?: string;
}

/**
 * Calculate habitable zone bounds using Kopparapu et al. 2013 model
 */
export function habitableZoneBoundsExtended(starTemp: number): [number, number] {
  const T_star = starTemp;
  // Empirical coefficients for runaway greenhouse (inner) and maximum greenhouse (outer)
  const S_inner = 1.107 + 1.332e-4 * (T_star - 5780) + 1.580e-8 * Math.pow(T_star - 5780, 2);
  const S_outer = 0.356 + 6.171e-5 * (T_star - 5780) + 1.698e-9 * Math.pow(T_star - 5780, 2);
  const L_star = Math.pow(T_star / 5778, 4); // Approximate luminosity if no direct value
  
  const inner_bound = Math.sqrt(L_star / S_inner);
  const outer_bound = Math.sqrt(L_star / S_outer);
  return [inner_bound, outer_bound];
}

/**
 * Estimate surface temperature using blackbody equilibrium
 */
export function estimateSurfaceTemperature(
  starTemp: number,
  orbitalDistance: number,
  albedo: number = 0.3
): number {
  const R_sun_AU = 0.00465047; // Solar radius in AU
  const T_eq = starTemp * Math.sqrt(R_sun_AU / (2 * orbitalDistance)) * Math.pow(1 - albedo, 0.25);
  return T_eq;
}

/**
 * Calculate surface gravity relative to Earth
 */
export function calculateSurfaceGravity(planetMass: number, planetRadius: number): number {
  return planetMass / Math.pow(planetRadius, 2);
}

/**
 * Calculate water retention potential (0-1)
 */
export function calculateWaterRetentionPotential(
  planetMass: number,
  planetRadius: number,
  starTemp: number,
  orbitalDistance: number
): number {
  const gravity = calculateSurfaceGravity(planetMass, planetRadius);
  const T_eq = estimateSurfaceTemperature(starTemp, orbitalDistance, 0.3);
  
  // Planets with gravity > 0.5g can retain water
  const gravityFactor = gravity >= 0.5 ? 1 : gravity / 0.5;
  
  // Temperature factor for water retention
  let tempFactor: number;
  if (T_eq <= 320) {
    tempFactor = 1.0;
  } else if (T_eq >= 400) {
    tempFactor = 0.0;
  } else {
    tempFactor = (400 - T_eq) / 80;
  }
  
  const score = gravityFactor * tempFactor;
  return Math.max(0, Math.min(1, score));
}

/**
 * Calculate radiation hazard index (0-1)
 */
export function calculateRadiationHazardIndex(
  starTemp: number,
  stellarLuminosity: number,
  orbitalDistance: number,
  hostStarAge: number
): number {
  // Normalize star temp between 2500K and 7000K
  const tempNorm = Math.max(0, Math.min(1, (starTemp - 2500) / (7000 - 2500)));
  
  // Base radiation proportional to stellar luminosity / distance^2
  const baseRadiation = stellarLuminosity / Math.pow(orbitalDistance, 2);
  
  // Age factor: younger stars (<1 Gyr) more active
  const ageFactor = hostStarAge < 1 ? 1.0 : Math.max(0, 1 - (hostStarAge - 1) / 9);
  
  const rawIndex = baseRadiation * tempNorm * ageFactor;
  
  // Normalize into [0,1]
  const maxExpected = 10;
  const hazardIndex = Math.max(0, Math.min(1, rawIndex / maxExpected));
  return hazardIndex;
}

/**
 * Comprehensive habitability score calculation (0-100)
 * Based on the logic from apSameer1.py
 */
export function calculateHabitabilityScore(planet: PlanetData): number {
  const planetRadius = planet.pl_rade || 1.0;
  const starTemperature = planet.st_teff || 5778;
  const orbitalDistance = planet.pl_orbsmax || 1.0;
  const atmosphericPressure = 1.0; // Default Earth-like
  const stellarLuminosity = planet.st_lum || 1.0;
  const planetMass = planet.pl_bmasse || 1.0;
  const albedo = 0.3; // Default Earth-like
  const hostStarAge = planet.st_age || 4.6;

  // Check if planet is in habitable zone
  const [hzInner, hzOuter] = habitableZoneBoundsExtended(starTemperature);
  const inHz = hzInner <= orbitalDistance && orbitalDistance <= hzOuter;
  const hzFactor = inHz ? 1.0 : 0.0;

  // Radius factor (Earth-like = 1.0 Earth radii)
  const radiusFactor = Math.exp(-Math.pow(planetRadius - 1.0, 2) / (2 * Math.pow(0.3, 2)));
  
  // Atmospheric pressure factor
  const pressureFactor = Math.exp(-Math.pow(atmosphericPressure - 1.0, 2) / (2 * Math.pow(0.5, 2)));
  
  // Stellar luminosity factor
  const luminosityFactor = Math.exp(-Math.pow(stellarLuminosity - 1.0, 2) / (2 * Math.pow(0.7, 2)));
  
  // Water retention potential
  const waterPotential = calculateWaterRetentionPotential(planetMass, planetRadius, starTemperature, orbitalDistance);
  
  // Radiation penalty
  const radiationPenalty = 1 - calculateRadiationHazardIndex(starTemperature, stellarLuminosity, orbitalDistance, hostStarAge);

  // Combine all factors
  const scoreRaw = hzFactor * radiusFactor * pressureFactor * luminosityFactor * waterPotential * radiationPenalty;
  const score = Math.max(0, Math.min(1, scoreRaw));
  
  return Math.round(score * 100); // Convert to 0-100 scale
}

/**
 * Check if planet is in habitable zone
 */
export function isInHabitableZone(planet: PlanetData): boolean {
  const starTemp = planet.st_teff || 5778;
  const orbitalDistance = planet.pl_orbsmax || 1.0;
  
  const [hzInner, hzOuter] = habitableZoneBoundsExtended(starTemp);
  return hzInner <= orbitalDistance && orbitalDistance <= hzOuter;
}

/**
 * Get cluster label based on habitability score
 */
export function getClusterLabel(score: number): string {
  if (score >= 70) return "Very High Habitability Potential";
  if (score >= 50) return "Moderate to High Habitability Potential";
  if (score >= 25) return "Low Habitability Potential";
  return "Very Low Habitability Potential";
}