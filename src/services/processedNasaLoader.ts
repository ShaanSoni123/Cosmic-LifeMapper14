/**
 * Processed NASA Exoplanet Data Loader Service
 * Loads and manages the cleaned and enriched NASA exoplanet dataset
 */

import { ProcessedNASAExoplanet, ProcessedDataQuality, ColumnStatistics } from '../data/nasaProcessedExoplanets';

export interface ProcessedDataMetadata {
  lastUpdated: string;
  source: string;
  totalRecords: number;
  validRecords: number;
  successRate: number;
}

export class ProcessedNASALoader {
  private static instance: ProcessedNASALoader;
  private data: ProcessedNASAExoplanet[] = [];
  private metadata: ProcessedDataMetadata | null = null;
  private loaded = false;
  private loading = false;

  static getInstance(): ProcessedNASALoader {
    if (!ProcessedNASALoader.instance) {
      ProcessedNASALoader.instance = new ProcessedNASALoader();
    }
    return ProcessedNASALoader.instance;
  }

  /**
   * Load the processed NASA exoplanet data
   */
  async loadProcessedData(): Promise<ProcessedNASAExoplanet[]> {
    if (this.loaded) {
      return this.data;
    }

    if (this.loading) {
      // Wait for current loading to complete
      while (this.loading) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return this.data;
    }

    try {
      this.loading = true;
      console.log('🚀 Loading processed NASA exoplanet data...');

      // Load the processed CSV file
      const response = await fetch('/nasa_exoplanets_processed.csv');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch processed data: ${response.status} ${response.statusText}`);
      }

      const csvText = await response.text();
      console.log(`📄 Received ${csvText.length} characters of processed CSV data`);

      if (csvText.length < 100) {
        throw new Error('Processed CSV file too small - may be corrupted or empty');
      }

      // Parse CSV data
      const lines = csvText.split('\n').filter((line: string) => line.trim());
      console.log(`📊 Total lines: ${lines.length}`);

      if (lines.length === 0) {
        throw new Error('No data found in processed CSV');
      }

      const headers = lines[0].split(',').map((h: string) => h.replace(/"/g, '').trim());
      console.log('📊 Headers:', headers);

      const planets: ProcessedNASAExoplanet[] = [];

      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
          const values = lines[i].split(',').map((v: string) => v.replace(/"/g, '').trim());
          const planet: any = {};

          headers.forEach((header: string, index: number) => {
            if (values[index] && values[index] !== '') {
              const value = values[index];
              
              // Convert numeric values
              if (['disc_year', 'pl_orbper_days', 'pl_rad_rearth', 'pl_mass_mearth', 
                   'st_teff_k', 'st_rad_rsun', 'st_mass_msun', 'pl_mass_mjup', 
                   'pl_rad_rjup', 'esi'].includes(header)) {
                planet[header] = parseFloat(value);
              } else if (['has_mass', 'has_radius', 'has_stellar_data'].includes(header)) {
                // Boolean flags
                planet[header] = value.toLowerCase() === 'true';
              } else {
                planet[header] = value;
              }
            }
          });

          if (planet.planet_name) {
            planets.push(planet as ProcessedNASAExoplanet);
          }
        }
      }

      this.data = planets;
      this.loaded = true;
      
      // Generate metadata
      this.metadata = this.generateMetadata(planets);
      
      console.log(`✅ Successfully loaded ${planets.length} processed NASA exoplanets`);
      if (planets.length > 0) {
        console.log('🪐 First planet:', planets[0]);
      }

      return planets;

    } catch (error: any) {
      console.error('❌ Error loading processed NASA data:', error);
      this.loaded = false;
      throw error;
    } finally {
      this.loading = false;
    }
  }

  /**
   * Get all processed exoplanets
   */
  async getAllPlanets(): Promise<ProcessedNASAExoplanet[]> {
    if (!this.loaded) {
      await this.loadProcessedData();
    }
    return this.data;
  }

  /**
   * Get planets by discovery method
   */
  async getPlanetsByDiscoveryMethod(method: string): Promise<ProcessedNASAExoplanet[]> {
    if (!this.loaded) {
      await this.loadProcessedData();
    }
    
    return this.data.filter(planet => 
      planet.disc_method.toLowerCase() === method.toLowerCase()
    );
  }

  /**
   * Get planets discovered in a specific year range
   */
  async getPlanetsByYearRange(startYear: number, endYear: number): Promise<ProcessedNASAExoplanet[]> {
    if (!this.loaded) {
      await this.loadProcessedData();
    }
    
    return this.data.filter(planet => 
      planet.disc_year >= startYear && planet.disc_year <= endYear
    );
  }

  /**
   * Get planets with mass data
   */
  async getPlanetsWithMass(): Promise<ProcessedNASAExoplanet[]> {
    if (!this.loaded) {
      await this.loadProcessedData();
    }
    
    return this.data.filter(planet => planet.has_mass);
  }

  /**
   * Get planets with radius data
   */
  async getPlanetsWithRadius(): Promise<ProcessedNASAExoplanet[]> {
    if (!this.loaded) {
      await this.loadProcessedData();
    }
    
    return this.data.filter(planet => planet.has_radius);
  }

  /**
   * Get planets with stellar data
   */
  async getPlanetsWithStellarData(): Promise<ProcessedNASAExoplanet[]> {
    if (!this.loaded) {
      await this.loadProcessedData();
    }
    
    return this.data.filter(planet => planet.has_stellar_data);
  }

  /**
   * Get planets in the habitable zone
   */
  async getHabitableZonePlanets(): Promise<ProcessedNASAExoplanet[]> {
    if (!this.loaded) {
      await this.loadProcessedData();
    }
    
    return this.data.filter(planet => 
      planet.habitable_zone_flag === 'habitable'
    );
  }

  /**
   * Get planets with high Earth Similarity Index
   */
  async getHighESIPlanets(minESI: number = 0.7): Promise<ProcessedNASAExoplanet[]> {
    if (!this.loaded) {
      await this.loadProcessedData();
    }
    
    return this.data.filter(planet => 
      planet.esi !== undefined && planet.esi >= minESI
    );
  }

  /**
   * Search planets by name or host star
   */
  async searchPlanets(query: string): Promise<ProcessedNASAExoplanet[]> {
    if (!this.loaded) {
      await this.loadProcessedData();
    }
    
    const lowerQuery = query.toLowerCase();
    
    return this.data.filter(planet => 
      planet.planet_name.toLowerCase().includes(lowerQuery) ||
      planet.host_name.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get data quality metrics
   */
  async getDataQuality(): Promise<ProcessedDataQuality> {
    if (!this.loaded) {
      await this.loadProcessedData();
    }
    
    const totalRecords = this.data.length;
    const validRecords = this.data.filter(planet => 
      planet.planet_name && planet.host_name && planet.disc_method && planet.disc_year
    ).length;
    
    const massCoverage = this.data.filter(planet => planet.has_mass).length / totalRecords * 100;
    const radiusCoverage = this.data.filter(planet => planet.has_radius).length / totalRecords * 100;
    const stellarDataCoverage = this.data.filter(planet => planet.has_stellar_data).length / totalRecords * 100;
    const esiCoverage = this.data.filter(planet => planet.esi !== undefined).length / totalRecords * 100;
    
    return {
      totalRecords,
      validRecords,
      invalidRecords: totalRecords - validRecords,
      successRate: (validRecords / totalRecords) * 100,
      massCoverage,
      radiusCoverage,
      stellarDataCoverage,
      esiCoverage,
      validationErrors: []
    };
  }

  /**
   * Get column statistics
   */
  async getColumnStatistics(): Promise<ColumnStatistics[]> {
    if (!this.loaded) {
      await this.loadProcessedData();
    }
    
    const statistics: ColumnStatistics[] = [];
    
    for (const column of Object.keys(this.data[0] || {})) {
      const values = this.data.map(planet => (planet as any)[column]);
      const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== '');
      
      if (nonNullValues.length > 0) {
        const stat: ColumnStatistics = {
          columnName: column,
          nonNullCount: nonNullValues.length
        };
        
        // Add numeric statistics if applicable
        if (typeof nonNullValues[0] === 'number') {
          stat.minValue = Math.min(...nonNullValues);
          stat.maxValue = Math.max(...nonNullValues);
          stat.meanValue = nonNullValues.reduce((a, b) => a + b, 0) / nonNullValues.length;
        } else {
          stat.uniqueCount = new Set(nonNullValues).size;
        }
        
        statistics.push(stat);
      }
    }
    
    return statistics;
  }

  /**
   * Get dataset metadata
   */
  async getMetadata(): Promise<ProcessedDataMetadata | null> {
    if (!this.loaded) {
      await this.loadProcessedData();
    }
    
    return this.metadata;
  }

  /**
   * Check if data is loaded
   */
  isDataLoaded(): boolean {
    return this.loaded;
  }

  /**
   * Clear loaded data (useful for testing or refreshing)
   */
  clearData(): void {
    this.data = [];
    this.metadata = null;
    this.loaded = false;
  }

  /**
   * Generate metadata from the loaded data
   */
  private generateMetadata(planets: ProcessedNASAExoplanet[]): ProcessedDataMetadata {
    const totalRecords = planets.length;
    const validRecords = planets.filter(planet => 
      planet.planet_name && planet.host_name && planet.disc_method && planet.disc_year
    ).length;
    
    return {
      lastUpdated: new Date().toISOString(),
      source: 'NASA Exoplanet Archive (Processed)',
      totalRecords,
      validRecords,
      successRate: (validRecords / totalRecords) * 100
    };
  }
}

// Export singleton instance
export const processedNASALoader = ProcessedNASALoader.getInstance();
