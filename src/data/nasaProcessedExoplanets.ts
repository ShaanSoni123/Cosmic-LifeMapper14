/**
 * Processed NASA Exoplanet Data Schema
 * This interface represents the cleaned and enriched data from the NASA ingestion pipeline
 */

export interface ProcessedNASAExoplanet {
  // Basic identification (mapped from NASA schema)
  planet_name: string;
  host_name: string;
  disc_method: string;
  disc_year: number;
  
  // Planetary properties (mapped from NASA schema)
  pl_orbper_days?: number;
  pl_rad_rearth?: number;
  pl_mass_mearth?: number;
  
  // Stellar properties (mapped from NASA schema)
  st_teff_k?: number;
  st_rad_rsun?: number;
  st_mass_msun?: number;
  
  // Derived fields (computed by ingestion pipeline)
  pl_mass_mjup?: number;
  pl_rad_rjup?: number;
  habitable_zone_flag?: 'inner' | 'habitable' | 'outer' | 'unknown';
  esi?: number; // Earth Similarity Index, 0-1 scale
  
  // Data quality flags
  has_mass: boolean;
  has_radius: boolean;
  has_stellar_data: boolean;
}

/**
 * Data quality metrics for the processed dataset
 */
export interface ProcessedDataQuality {
  totalRecords: number;
  validRecords: number;
  invalidRecords: number;
  successRate: number;
  
  // Column coverage statistics
  massCoverage: number;
  radiusCoverage: number;
  stellarDataCoverage: number;
  esiCoverage: number;
  
  // Validation summary
  validationErrors: string[];
}

/**
 * Summary statistics for numeric columns
 */
export interface ColumnStatistics {
  columnName: string;
  nonNullCount: number;
  minValue?: number;
  maxValue?: number;
  meanValue?: number;
  uniqueCount?: number;
}

/**
 * Complete dataset with metadata
 */
export interface ProcessedNASAExoplanetDataset {
  data: ProcessedNASAExoplanet[];
  quality: ProcessedDataQuality;
  statistics: ColumnStatistics[];
  lastUpdated: string;
  source: string;
}

/**
 * Constants for unit conversions
 */
export const UNIT_CONVERSIONS = {
  EARTH_TO_JUPITER_MASS: 317.828,
  EARTH_TO_JUPITER_RADIUS: 11.209,
  DAYS_TO_YEARS: 365.25
} as const;

/**
 * Habitable zone classification
 */
export const HABITABLE_ZONE_CLASSIFICATIONS = {
  INNER: 'inner',
  HABITABLE: 'habitable', 
  OUTER: 'outer',
  UNKNOWN: 'unknown'
} as const;

export type HabitableZoneClassification = typeof HABITABLE_ZONE_CLASSIFICATIONS[keyof typeof HABITABLE_ZONE_CLASSIFICATIONS];

/**
 * Discovery method normalization
 */
export const DISCOVERY_METHODS = {
  TRANSIT: 'transit',
  RADIAL_VELOCITY: 'radial velocity',
  IMAGING: 'imaging',
  MICROLENSING: 'microlensing',
  ECLIPSE_TIMING: 'eclipse timing',
  PULSAR_TIMING: 'pulsar timing',
  ORBITAL_BRIGHTNESS_MODULATION: 'orbital brightness modulation',
  ASTROMETRY: 'astrometry',
  OTHER: 'other'
} as const;

export type DiscoveryMethod = typeof DISCOVERY_METHODS[keyof typeof DISCOVERY_METHODS];

/**
 * Utility functions for working with processed data
 */
export class ProcessedDataUtils {
  /**
   * Check if an exoplanet has complete basic data
   */
  static hasCompleteBasicData(planet: ProcessedNASAExoplanet): boolean {
    return !!(planet.planet_name && planet.host_name && planet.disc_method && planet.disc_year);
  }
  
  /**
   * Check if an exoplanet has complete planetary data
   */
  static hasCompletePlanetaryData(planet: ProcessedNASAExoplanet): boolean {
    return !!(planet.pl_orbper_days && planet.pl_rad_rearth && planet.pl_mass_mearth);
  }
  
  /**
   * Check if an exoplanet has complete stellar data
   */
  static hasCompleteStellarData(planet: ProcessedNASAExoplanet): boolean {
    return !!(planet.st_teff_k && planet.st_rad_rsun && planet.st_mass_msun);
  }
  
  /**
   * Get the overall data completeness score (0-100)
   */
  static getDataCompletenessScore(planet: ProcessedNASAExoplanet): number {
    let score = 0;
    let totalFields = 0;
    
    // Basic fields (required)
    totalFields += 4;
    if (planet.planet_name) score += 25;
    if (planet.host_name) score += 25;
    if (planet.disc_method) score += 25;
    if (planet.disc_year) score += 25;
    
    // Planetary fields (optional but valuable)
    totalFields += 3;
    if (planet.pl_orbper_days) score += 33.33;
    if (planet.pl_rad_rearth) score += 33.33;
    if (planet.pl_mass_mearth) score += 33.33;
    
    // Stellar fields (optional but valuable)
    totalFields += 3;
    if (planet.st_teff_k) score += 33.33;
    if (planet.st_rad_rsun) score += 33.33;
    if (planet.st_mass_msun) score += 33.33;
    
    // Derived fields (bonus)
    totalFields += 2;
    if (planet.pl_mass_mjup) score += 50;
    if (planet.pl_rad_rjup) score += 50;
    
    return Math.round((score / totalFields) * 100);
  }
  
  /**
   * Filter exoplanets by data quality threshold
   */
  static filterByDataQuality(
    planets: ProcessedNASAExoplanet[], 
    minScore: number = 50
  ): ProcessedNASAExoplanet[] {
    return planets.filter(planet => 
      this.getDataCompletenessScore(planet) >= minScore
    );
  }
  
  /**
   * Get planets in the habitable zone
   */
  static getHabitableZonePlanets(planets: ProcessedNASAExoplanet[]): ProcessedNASAExoplanet[] {
    return planets.filter(planet => 
      planet.habitable_zone_flag === HABITABLE_ZONE_CLASSIFICATIONS.HABITABLE
    );
  }
  
  /**
   * Get planets with high Earth Similarity Index
   */
  static getHighESIPlanets(
    planets: ProcessedNASAExoplanet[], 
    minESI: number = 0.7
  ): ProcessedNASAExoplanet[] {
    return planets.filter(planet => 
      planet.esi !== undefined && planet.esi >= minESI
    );
  }
}
