import { Exoplanet } from '../data/exoplanets';

export interface ExtendedExoplanet extends Exoplanet {
  surfaceTemperature: number;
  surfaceGravity: number;
  waterRetentionPotential: number;
  radiationHazardIndex: number;
  cluster: number;
  clusterLabel: string;
  inHabitableZone: boolean;
}

/**
 * Calculate inner and outer habitable zone boundaries using Kopparapu et al. 2013
 * Source: Kopparapu et al., 2013, ApJ, 765, 131
 */
export function habitableZoneBounds(starTemp: number): [number, number] {
  const T_star = starTemp;
  // Empirical coefficients for runaway greenhouse (inner) and maximum greenhouse (outer)
  const S_inner = 1.107 + 1.332e-4 * (T_star - 5780) + 1.580e-8 * Math.pow(T_star - 5780, 2);
  const S_outer = 0.356 + 6.171e-5 * (T_star - 5780) + 1.698e-9 * Math.pow(T_star - 5780, 2);
  const L_star = Math.pow(T_star / 5778, 4); // Approximate luminosity
  
  const inner_bound = Math.sqrt(L_star / S_inner);
  const outer_bound = Math.sqrt(L_star / S_outer);
  return [inner_bound, outer_bound];
}

/**
 * Estimate equilibrium surface temperature of the planet in Kelvin
 * Assumes blackbody equilibrium with no atmosphere
 */
export function estimateSurfaceTemperature(
  starTemp: number,
  orbitalDistance: number,
  albedo: number = 0.3
): number {
  // Solar radius in AU
  const R_sun_AU = 0.00465047;
  const T_eq = starTemp * Math.sqrt(R_sun_AU / (2 * orbitalDistance)) * Math.pow(1 - albedo, 0.25);
  return T_eq;
}

/**
 * Calculate surface gravity relative to Earth gravity
 */
export function calculateSurfaceGravity(planetMass: number, planetRadius: number): number {
  // g = M / R^2 (relative to Earth)
  return planetMass / Math.pow(planetRadius, 2);
}

/**
 * Calculate water retention potential score (0-1)
 * Accounts for gravity and stellar irradiation
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
  
  // Temperature factor: too hot planets lose water
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
 * Younger stars and closer planets have higher radiation
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
  return Math.max(0, Math.min(1, rawIndex / maxExpected));
}

/**
 * Calculate comprehensive habitability score (0-10)
 */
export function calculateHabitabilityScore(planet: Exoplanet): number {
  // Use more realistic star temperature based on star type
  const starTemp = getStarTemperature(planet.starType);
  // Better orbital distance estimation (very rough approximation)
  const orbitalDistance = Math.sqrt(planet.orbitalPeriod / 365.25); // Kepler's 3rd law approximation
  const albedo = 0.3; // Earth-like albedo
  const stellarLuminosity = 1.0; // Solar units
  const hostStarAge = 4.6; // Gyr, Sun-like
  
  const [hzInner, hzOuter] = habitableZoneBounds(starTemp);
  const inHz = hzInner <= orbitalDistance && orbitalDistance <= hzOuter;
  const hzFactor = inHz ? 1.0 : Math.max(0.1, 1.0 - Math.abs(orbitalDistance - (hzInner + hzOuter) / 2) / ((hzOuter - hzInner) / 2));

  // Radius factor (Earth-like is optimal)
  const radiusFactor = Math.exp(-Math.pow(planet.radius - 1.0, 2) / (2 * Math.pow(0.3, 2)));
  
  // Mass factor (Earth-like is optimal)
  const massFactor = Math.exp(-Math.pow(planet.mass - 1.0, 2) / (2 * Math.pow(0.5, 2)));
  
  // Temperature factor (Earth-like ~288K is optimal)
  const tempFactor = Math.exp(-Math.pow(planet.temperature - 288, 2) / (2 * Math.pow(50, 2)));
  
  const waterPotential = calculateWaterRetentionPotential(
    planet.mass, 
    planet.radius, 
    starTemp, 
    orbitalDistance
  );
  
  const radiationPenalty = 1 - calculateRadiationHazardIndex(
    starTemp, 
    stellarLuminosity, 
    orbitalDistance, 
    hostStarAge
  );

  // Biosignature bonus
  const biosignatureBonus = planet.biosignatures.length > 0 ? 0.5 + (planet.biosignatures.length * 0.2) : 0;
  
  const scoreRaw = (hzFactor * 3.0) + (radiusFactor * 2.0) + (massFactor * 2.0) + (tempFactor * 1.5) + (waterPotential * 1.0) + (radiationPenalty * 0.5) + biosignatureBonus;
  const finalScore = Math.max(0, Math.min(10, scoreRaw));
  
  // Round to 1 decimal place
  return Math.round(finalScore * 10) / 10;
}

/**
 * Get estimated star temperature based on star type
 */
function getStarTemperature(starType: string): number {
  const typeMap: { [key: string]: number } = {
    'G2V': 5778, // Sun-like
    'M5.5V': 3042, // Red dwarf
    'M8V': 2559, // Very cool red dwarf
    'M1.5V': 3700, // Red dwarf
    'M2.5V': 3503, // Red dwarf
    'M4V': 3200, // Red dwarf
    'M4.5V': 3131, // Red dwarf
    'M3V': 3370, // Red dwarf
    'K2V': 4900, // Orange dwarf
    'F5V': 6440, // Yellow-white dwarf
  };
  
  // Extract base type (e.g., 'M5.5V' -> 'M')
  const baseType = starType.charAt(0);
  
  if (typeMap[starType]) {
    return typeMap[starType];
  } else if (baseType === 'M') {
    return 3400; // Average M dwarf
  } else if (baseType === 'K') {
    return 4900; // Average K dwarf
  } else if (baseType === 'G') {
    return 5778; // Sun-like
  } else if (baseType === 'F') {
    return 6440; // F-type
  } else {
    return 5778; // Default to Sun-like
  }
}

/**
 * Simple clustering based on habitability characteristics
 */
export function clusterPlanets(planets: Exoplanet[]): ExtendedExoplanet[] {
  return planets.map(planet => {
    const habitabilityScore = calculateHabitabilityScore(planet);
    const starTemp = getStarTemperature(planet.starType);
    const orbitalDistance = Math.sqrt(planet.orbitalPeriod / 365.25);
    
    const surfaceTemperature = estimateSurfaceTemperature(starTemp, orbitalDistance);
    const surfaceGravity = calculateSurfaceGravity(planet.mass, planet.radius);
    const waterRetentionPotential = calculateWaterRetentionPotential(
      planet.mass, planet.radius, starTemp, orbitalDistance
    );
    const radiationHazardIndex = calculateRadiationHazardIndex(
      starTemp, 1.0, orbitalDistance, 4.6
    );
    
    const [hzInner, hzOuter] = habitableZoneBounds(starTemp);
    const inHabitableZone = hzInner <= orbitalDistance && orbitalDistance <= hzOuter;
    
    // Simple clustering based on habitability score
    let cluster: number;
    let clusterLabel: string;
    
    if (habitabilityScore >= 7) {
      cluster = 0;
      clusterLabel = "Very High Habitability Potential";
    } else if (habitabilityScore >= 5) {
      cluster = 1;
      clusterLabel = "Moderate to High Habitability Potential";
    } else if (habitabilityScore >= 2.5) {
      cluster = 2;
      clusterLabel = "Low Habitability Potential";
    } else {
      cluster = 3;
      clusterLabel = "Very Low Habitability Potential";
    }

    return {
      ...planet,
      habitabilityScore,
      surfaceTemperature,
      surfaceGravity,
      waterRetentionPotential,
      radiationHazardIndex,
      cluster,
      clusterLabel,
      inHabitableZone
    };
  });
}

/**
 * Generate detailed scientific report for a planet
 */
export function generateDetailedReport(planet: ExtendedExoplanet): string {
  const report = [
    `=== Exoplanet Report: ${planet.name} ===`,
    `Planet Radius (Earth radii): ${planet.radius.toFixed(2)}`,
    `Planet Mass (Earth masses): ${planet.mass.toFixed(2)}`,
    `Distance from Earth (light years): ${planet.distanceFromEarth.toFixed(1)}`,
    `Orbital Period (days): ${planet.orbitalPeriod.toFixed(1)}`,
    `Temperature (K): ${planet.temperature.toFixed(1)}`,
    `Star Type: ${planet.starType}`,
    `Discovery Year: ${planet.discoveryYear}`,
    `Constellation: ${planet.constellation}`,
    ``,
    `=== Scientific Analysis ===`,
    `Habitability Score: ${planet.habitabilityScore.toFixed(3)}/10`,
    `Cluster Assignment: ${planet.cluster} (${planet.clusterLabel})`,
    `In Habitable Zone: ${planet.inHabitableZone ? 'Yes' : 'No'}`,
    `Estimated Surface Temperature (K): ${planet.surfaceTemperature.toFixed(1)}`,
    `Surface Gravity (Earth g): ${planet.surfaceGravity.toFixed(2)}`,
    `Water Retention Potential: ${planet.waterRetentionPotential.toFixed(3)}`,
    `Radiation Hazard Index: ${planet.radiationHazardIndex.toFixed(3)}`,
    ``,
    `=== Biosignatures Detected ===`,
    ...planet.biosignatures.map(sig => `• ${sig}`),
    ``,
    `=== Scientific Context ===`,
    `The habitability score synthesizes planetary and stellar parameters,`,
    `including location within the habitable zone (Kopparapu et al., 2013),`,
    `planetary radius suitability for Earth-like conditions, and potential`,
    `water retention ability influenced by gravity and temperature.`,
    ``,
    `References:`,
    `1. Kopparapu et al., 'Habitable Zones around Main-sequence Stars', ApJ, 2013`,
    `2. NASA Exoplanet Archive: https://exoplanetarchive.ipac.caltech.edu/`
  ];
  
  return report.join('\n');
}