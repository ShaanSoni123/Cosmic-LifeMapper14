import { ExtendedExoplanetData } from '../data/extendedExoplanets';

/**
 * Calculate inner and outer habitable zone boundaries (AU) using Kopparapu et al. 2013.
 * This model accounts for star temperature effects on habitable zone limits.
 * 
 * Source: Kopparapu et al., 2013, ApJ, 765, 131 https://doi.org/10.1088/0004-637X/765/2/131
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
 * Estimate equilibrium surface temperature of the planet in Kelvin.
 * Assumes no atmosphere or greenhouse effect (blackbody equilibrium).
 */
export function estimateSurfaceTemperature(
  starTemp: number,
  orbitalDistance: number,
  albedo: number
): number {
  // Solar radius in AU
  const R_sun_AU = 0.00465047;
  const T_eq = starTemp * Math.sqrt(R_sun_AU / (2 * orbitalDistance)) * Math.pow(1 - albedo, 0.25);
  return T_eq;
}

/**
 * Calculate surface gravity relative to Earth gravity.
 */
export function calculateSurfaceGravity(
  planetMass: number,
  planetRadius: number
): number {
  // g = M / R^2 (relative to Earth)
  return planetMass / Math.pow(planetRadius, 2);
}

/**
 * Simplified water retention potential score (0-1).
 * Accounts for gravity (mass-radius) and stellar irradiation.
 */
export function calculateWaterRetentionPotential(
  planetMass: number,
  planetRadius: number,
  starTemp: number,
  orbitalDistance: number
): number {
  const gravity = calculateSurfaceGravity(planetMass, planetRadius);
  const T_eq = estimateSurfaceTemperature(starTemp, orbitalDistance, 0.3); // Assume Earth-like albedo
  
  // Assume planets with gravity > 0.5g can retain water
  const gravityFactor = gravity >= 0.5 ? 1 : gravity / 0.5;
  
  // Too hot planets (T_eq > 320K) lose water, score declines linearly to 0 at 400K
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
 * Approximate a radiation hazard index (0-1).
 * Younger stars and closer planets have higher radiation.
 */
export function calculateRadiationHazardIndex(
  starTemp: number,
  stellarLuminosity: number,
  orbitalDistance: number,
  hostStarAge: number
): number {
  // Normalize star temp between 2500K and 7000K for weighting
  const tempNorm = Math.max(0, Math.min(1, (starTemp - 2500) / (7000 - 2500)));
  
  // Base radiation proportional to stellar luminosity / distance^2
  const baseRadiation = stellarLuminosity / Math.pow(orbitalDistance, 2);
  
  // Age factor: younger stars (<1 Gyr) more active; older stars less
  const ageFactor = hostStarAge < 1 ? 1.0 : Math.max(0, 1 - (hostStarAge - 1) / 9); // scales from 1 to 0 over 1-10 Gyr
  
  const rawIndex = baseRadiation * tempNorm * ageFactor;
  
  // Normalize roughly into [0,1]
  const maxExpected = 10; // arbitrary scaling
  const hazardIndex = Math.max(0, Math.min(1, rawIndex / maxExpected));
  return hazardIndex;
}

/**
 * Compute a comprehensive habitability score combining multiple factors.
 * Returns a score between 0 and 1.
 */
export function calculateHabitabilityScoreBackend(
  planetRadius: number,
  starTemperature: number,
  orbitalDistance: number,
  atmosphericPressure: number,
  stellarLuminosity: number,
  planetMass: number,
  albedo: number,
  hostStarAge: number
): number {
  const [hzInner, hzOuter] = habitableZoneBoundsExtended(starTemperature);
  const inHz = hzInner <= orbitalDistance && orbitalDistance <= hzOuter;
  const hzFactor = inHz ? 1.0 : 0.0;

  const radiusFactor = Math.exp(-Math.pow(planetRadius - 1.0, 2) / (2 * Math.pow(0.3, 2)));
  const pressureFactor = Math.exp(-Math.pow(atmosphericPressure - 1.0, 2) / (2 * Math.pow(0.5, 2)));
  const luminosityFactor = Math.exp(-Math.pow(stellarLuminosity - 1.0, 2) / (2 * Math.pow(0.7, 2)));
  const waterPotential = calculateWaterRetentionPotential(planetMass, planetRadius, starTemperature, orbitalDistance);
  const radiationPenalty = 1 - calculateRadiationHazardIndex(starTemperature, stellarLuminosity, orbitalDistance, hostStarAge);

  const scoreRaw = hzFactor * radiusFactor * pressureFactor * luminosityFactor * waterPotential * radiationPenalty;
  return Math.max(0, Math.min(1, scoreRaw));
}

/**
 * Simple clustering based on habitability characteristics
 */
export function interpretCluster(clusterLabel: number): string {
  const interpretations: { [key: number]: string } = {
    0: "Very High Habitability Potential",
    1: "Moderate to High Habitability Potential", 
    2: "Low Habitability Potential",
    3: "Very Low Habitability Potential"
  };
  return interpretations[clusterLabel] || "Unknown Cluster";
}

/**
 * Generate detailed scientific report for a planet
 */
export function generateDetailedReportBackend(planetData: ExtendedExoplanetData, habitabilityScore: number): string {
  const surfaceTemp = estimateSurfaceTemperature(planetData.star_temperature, planetData.orbital_distance, planetData.albedo);
  const surfaceGravity = calculateSurfaceGravity(planetData.planet_mass, planetData.planet_radius);
  const waterPotential = calculateWaterRetentionPotential(
    planetData.planet_mass, 
    planetData.planet_radius, 
    planetData.star_temperature, 
    planetData.orbital_distance
  );
  const radiationIndex = calculateRadiationHazardIndex(
    planetData.star_temperature, 
    planetData.stellar_luminosity, 
    planetData.orbital_distance, 
    planetData.host_star_age
  );

  const report = [
    `=== Exoplanet Report: ${planetData.planet_name} ===`,
    `Planet Radius (Earth radii): ${planetData.planet_radius.toFixed(2)}`,
    `Planet Mass (Earth masses): ${planetData.planet_mass.toFixed(2)}`,
    `Star Effective Temperature (K): ${planetData.star_temperature.toFixed(1)}`,
    `Orbital Distance (AU): ${planetData.orbital_distance.toFixed(3)}`,
    `Orbital Eccentricity: ${planetData.eccentricity.toFixed(3)}`,
    `Atmospheric Pressure (Earth atm): ${planetData.atmospheric_pressure.toFixed(2)}`,
    `Albedo: ${planetData.albedo.toFixed(2)}`,
    `Stellar Luminosity (Solar units): ${planetData.stellar_luminosity.toFixed(3)}`,
    `Host Star Metallicity [Fe/H]: ${planetData.host_star_metallicity.toFixed(3)}`,
    `Host Star Age (Gyr): ${planetData.host_star_age.toFixed(2)}`,
    `Habitability Score: ${(habitabilityScore * 100).toFixed(1)}/100`,
    ``,
    `=== Scientific Analysis ===`,
    `Estimated Surface Temperature (K): ${surfaceTemp.toFixed(1)}`,
    `Surface Gravity (Earth g): ${surfaceGravity.toFixed(2)}`,
    `Water Retention Potential: ${waterPotential.toFixed(3)}`,
    `Radiation Hazard Index: ${radiationIndex.toFixed(3)}`,
    ``,
    `=== Scientific Context ===`,
    `The habitability score synthesizes planetary and stellar parameters,`,
    `including location within the habitable zone (Kopparapu et al., 2013),`,
    `planetary radius suitability for Earth-like conditions (Rogers, 2015),`,
    `atmospheric pressure, and potential water retention ability influenced by gravity and temperature (Seager et al., 2013).`,
    `Radiation hazard index approximates stellar activity and irradiation risks impacting biological sustainability (Vidotto et al., 2013).`,
    ``,
    `References:`,
    `1. Kopparapu et al., 'Habitable Zones around Main-sequence Stars', ApJ, 2013. https://doi.org/10.1088/0004-637X/765/2/131`,
    `2. Rogers, 'Most 1.6 Earth-radius Planets are Not Rocky', ApJ, 2015. https://doi.org/10.1088/0004-637X/801/1/41`,
    `3. Seager, 'Exoplanet Atmospheres: Physical Processes', Princeton Univ Press, 2010.`,
    `4. Vidotto et al., 'The Stellar Winds of Low-Mass Stars', MNRAS, 2013. https://doi.org/10.1093/mnras/stt161`,
    `5. NASA Exoplanet Archive: https://exoplanetarchive.ipac.caltech.edu/`
  ];

  return report.join('\n');
}