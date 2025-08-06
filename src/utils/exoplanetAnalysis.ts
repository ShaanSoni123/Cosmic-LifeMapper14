import { Exoplanet } from '../data/exoplanets';
import { extendedExoplanetData, ExtendedExoplanetData } from '../data/extendedExoplanets';
import { generatePlanetBiosignatures, generateBiosignatureReport } from './biosignatureAnalysis';
import { 
  calculateHabitabilityScoreBackend,
  habitableZoneBoundsExtended,
  estimateSurfaceTemperature,
  calculateSurfaceGravity,
  calculateWaterRetentionPotential,
  calculateRadiationHazardIndex,
  interpretCluster,
  generateDetailedReportBackend
} from './backendHabitabilityAnalysis';

export interface ExtendedExoplanet extends Exoplanet {
  surfaceTemperature: number;
  surfaceGravity: number;
  waterRetentionPotential: number;
  radiationHazardIndex: number;
  cluster: number;
  clusterLabel: string;
  inHabitableZone: boolean;
  extendedData?: ExtendedExoplanetData;
}

// Re-export functions from backend analysis
export const habitableZoneBounds = habitableZoneBoundsExtended;
export { estimateSurfaceTemperature, calculateSurfaceGravity, calculateWaterRetentionPotential, calculateRadiationHazardIndex };

/**
 * Calculate comprehensive habitability score (0-10)
 */
export function calculateHabitabilityScore(planet: Exoplanet): number {
  // Use biosignature analysis for more accurate scoring
  const biosignatureInput = generatePlanetBiosignatures({
    temperature: planet.temperature,
    radius: planet.radius,
    mass: planet.mass,
    starType: planet.starType,
    inHabitableZone: planet.temperature >= 200 && planet.temperature <= 350,
    habitabilityScore: 0 // Will be calculated
  });
  
  const biosignatureReport = generateBiosignatureReport(biosignatureInput);
  const biosignatureScore = biosignatureReport['Habitability Score'];
  
  // Convert biosignature score (0-100) to our scale (0-10)
  return Math.round(biosignatureScore / 10 * 100) / 100;
}

/**
 * Calculate comprehensive habitability score using backend method (0-10)
 */
export function calculateHabitabilityScoreExtended(planet: Exoplanet): number {
  // Try to find extended data for this planet
  const extendedData = extendedExoplanetData.find(data => 
    data.planet_name.toLowerCase().includes(planet.name.toLowerCase()) ||
    planet.name.toLowerCase().includes(data.planet_name.toLowerCase())
  );

  if (extendedData) {
    // Use backend calculation with extended data
    const backendScore = calculateHabitabilityScoreBackend(
      extendedData.planet_radius,
      extendedData.star_temperature,
      extendedData.orbital_distance,
      extendedData.atmospheric_pressure,
      extendedData.stellar_luminosity,
      extendedData.planet_mass,
      extendedData.albedo,
      extendedData.host_star_age
    );
    
    // Add biosignature bonus
    const biosignatureBonus = planet.biosignatures.length > 0 ? 0.05 + (planet.biosignatures.length * 0.02) : 0;
    const finalScore = Math.min(1, backendScore + biosignatureBonus);
    
    return Math.round(finalScore * 1000) / 10; // Convert to 100-point scale with 1 decimal
  } else {
    // Fallback to simplified calculation for planets without extended data
    const starTemp = getStarTemperature(planet.starType);
    const orbitalDistance = Math.sqrt(planet.orbitalPeriod / 365.25);
    
    const backendScore = calculateHabitabilityScoreBackend(
      planet.radius,
      starTemp,
      orbitalDistance,
      1.0, // Default atmospheric pressure
      1.0, // Default stellar luminosity
      planet.mass,
      0.3, // Default albedo
      4.6  // Default star age
    );
    
    const biosignatureBonus = planet.biosignatures.length > 0 ? 0.05 + (planet.biosignatures.length * 0.02) : 0;
    const finalScore = Math.min(1, backendScore + biosignatureBonus);
    
    return Math.round(finalScore * 1000) / 10; // Convert to 100-point scale with 1 decimal
  }
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
    // Use the actual habitability score from the planet data (calculated from biosignatures)
    const habitabilityScore = planet.habitabilityScore * 10; // Convert to 0-100 scale
    
    // Try to find extended data for this planet
    const extendedData = extendedExoplanetData.find(data => 
      data.planet_name.toLowerCase().includes(planet.name.toLowerCase()) ||
      planet.name.toLowerCase().includes(data.planet_name.toLowerCase())
    );

    const starTemp = extendedData ? extendedData.star_temperature : getStarTemperature(planet.starType);
    const orbitalDistance = extendedData ? extendedData.orbital_distance : Math.sqrt(planet.orbitalPeriod / 365.25);
    const albedo = extendedData ? extendedData.albedo : 0.3;
    const stellarLuminosity = extendedData ? extendedData.stellar_luminosity : 1.0;
    const hostStarAge = extendedData ? extendedData.host_star_age : 4.6;
    
    const surfaceTemperature = estimateSurfaceTemperature(starTemp, orbitalDistance, albedo);
    const surfaceGravity = calculateSurfaceGravity(
      extendedData ? extendedData.planet_mass : planet.mass, 
      extendedData ? extendedData.planet_radius : planet.radius
    );
    const waterRetentionPotential = calculateWaterRetentionPotential(
      extendedData ? extendedData.planet_mass : planet.mass, 
      extendedData ? extendedData.planet_radius : planet.radius, 
      starTemp, 
      orbitalDistance
    );
    const radiationHazardIndex = calculateRadiationHazardIndex(
      starTemp, stellarLuminosity, orbitalDistance, hostStarAge
    );
    
    const [hzInner, hzOuter] = habitableZoneBoundsExtended(starTemp);
    const inHabitableZone = hzInner <= orbitalDistance && orbitalDistance <= hzOuter;
    
    // Simple clustering based on habitability score
    let cluster: number;
    let clusterLabel: string;
    
    if (habitabilityScore >= 80) {
      cluster = 0;
      clusterLabel = "Very High Habitability Potential";
    } else if (habitabilityScore >= 60) {
      cluster = 1;
      clusterLabel = "Moderate to High Habitability Potential";
    } else if (habitabilityScore >= 40) {
      cluster = 2;
      clusterLabel = "Low Habitability Potential";
    } else {
      cluster = 3;
      clusterLabel = interpretCluster(3);
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
      inHabitableZone,
      extendedData
    };
  });
}

/**
 * Generate detailed scientific report for a planet
 */
export function generateDetailedReport(planet: ExtendedExoplanet): string {
  if (planet.extendedData) {
    // Use backend report generation for planets with extended data
    return generateDetailedReportBackend(planet.extendedData, planet.habitabilityScore / 100);
  } else {
    // Fallback report for planets without extended data
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
      `Habitability Score: ${planet.habitabilityScore.toFixed(1)}/100`,
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
}