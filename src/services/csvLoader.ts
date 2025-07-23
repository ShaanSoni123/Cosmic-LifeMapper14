import { Exoplanet } from '../data/exoplanets';

interface CSVRow {
  [key: string]: string;
}

export class CSVExoplanetLoader {
  private static instance: CSVExoplanetLoader;
  private planets: Exoplanet[] = [];
  private loaded = false;
  private loading = false;

  static getInstance(): CSVExoplanetLoader {
    if (!CSVExoplanetLoader.instance) {
      CSVExoplanetLoader.instance = new CSVExoplanetLoader();
    }
    return CSVExoplanetLoader.instance;
  }

  async loadCSVData(): Promise<Exoplanet[]> {
    if (this.loaded) {
      console.log(`✅ CSV already loaded: ${this.planets.length} planets`);
      return this.planets;
    }

    if (this.loading) {
      console.log('⏳ CSV loading in progress...');
      // Wait for loading to complete
      while (this.loading) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return this.planets;
    }

    this.loading = true;
    console.log('🚀 Starting to load ALL exoplanets from backend/exoplanets.csv...');

    try {
      // Try multiple paths to find the CSV file
      const possiblePaths = [
        '/backend/exoplanets.csv',
        './backend/exoplanets.csv',
        '/public/backend/exoplanets.csv',
        'backend/exoplanets.csv',
        '../backend/exoplanets.csv'
      ];

      let csvText = '';
      let successPath = '';

      for (const path of possiblePaths) {
        try {
          console.log(`🔍 Trying to load CSV from: ${path}`);
          const response = await fetch(path);
          if (response.ok) {
            csvText = await response.text();
            successPath = path;
            console.log(`✅ Successfully loaded CSV from: ${path}`);
            console.log(`📊 CSV file size: ${csvText.length} characters`);
            break;
          }
        } catch (error) {
          console.log(`❌ Failed to load from ${path}:`, error);
        }
      }

      if (!csvText) {
        throw new Error('Could not load CSV file from any path');
      }

      console.log('🔄 Parsing CSV data...');
      this.planets = this.parseCSV(csvText);
      this.loaded = true;
      
      console.log(`🎉 SUCCESS! Loaded ${this.planets.length} exoplanets from ${successPath}`);
      console.log('📋 Sample planet names:', this.planets.slice(0, 5).map(p => p.name));
      
      return this.planets;

    } catch (error) {
      console.error('💥 Error loading CSV planets:', error);
      this.planets = [];
      return [];
    } finally {
      this.loading = false;
    }
  }

  private parseCSV(csvText: string): Exoplanet[] {
    console.log('🔍 Starting CSV parsing...');
    const lines = csvText.trim().split('\n');
    
    if (lines.length < 2) {
      console.error('❌ CSV file appears to be empty or invalid');
      return [];
    }

    // Parse headers
    const headers = this.parseCSVLine(lines[0]).map(h => h.trim().replace(/"/g, ''));
    console.log(`📋 CSV Headers (${headers.length}):`, headers.slice(0, 10), '...');

    const planets: Exoplanet[] = [];
    let successCount = 0;
    let errorCount = 0;

    // Parse each data line
    for (let i = 1; i < lines.length; i++) {
      try {
        const values = this.parseCSVLine(lines[i]);
        if (values.length < headers.length - 5) { // Allow some missing columns
          continue;
        }

        const row: CSVRow = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });

        const planet = this.convertRowToPlanet(row, i);
        if (planet && planet.name && planet.name.trim() !== '') {
          planets.push(planet);
          successCount++;
        }
      } catch (error) {
        errorCount++;
        if (errorCount < 10) { // Only log first 10 errors
          console.warn(`⚠️ Error parsing line ${i + 1}:`, error);
        }
      }

      // Progress logging for large datasets
      if (i % 1000 === 0) {
        console.log(`📊 Processed ${i}/${lines.length} lines, found ${successCount} valid planets`);
      }
    }

    console.log(`✅ CSV Parsing Complete!`);
    console.log(`📊 Total lines processed: ${lines.length - 1}`);
    console.log(`✅ Successfully parsed: ${successCount} planets`);
    console.log(`❌ Parsing errors: ${errorCount}`);
    console.log(`🎯 Final planet count: ${planets.length}`);

    return planets;
  }

  private parseCSVLine(line: string): string[] {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    let i = 0;

    while (i < line.length) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // Handle escaped quotes
          current += '"';
          i += 2;
          continue;
        }
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
      i++;
    }
    
    values.push(current.trim());
    return values;
  }

  private convertRowToPlanet(row: CSVRow, index: number): Exoplanet | null {
    try {
      // Try multiple possible column names for planet name
      const possibleNameColumns = ['pl_name', 'name', 'planet_name', 'Planet Name', 'PLANET_NAME'];
      let planetName = '';
      
      for (const col of possibleNameColumns) {
        if (row[col] && row[col].trim() !== '') {
          planetName = row[col].trim();
          break;
        }
      }

      if (!planetName) {
        planetName = `CSV-Planet-${index}`;
      }

      // Extract data with multiple fallback column names
      const distance = this.parseFloat(
        row['sy_dist'] || row['distance'] || row['dist'] || row['Distance'] || row['sy_distance']
      ) || this.generateRealisticDistance();

      const orbitalPeriod = this.parseFloat(
        row['pl_orbper'] || row['orbital_period'] || row['period'] || row['Period'] || row['pl_period']
      ) || this.generateRealisticPeriod();

      const temperature = this.parseFloat(
        row['pl_eqt'] || row['temperature'] || row['temp'] || row['Temperature'] || row['pl_temp'] || row['st_teff']
      ) || this.generateRealisticTemperature();

      const radius = this.parseFloat(
        row['pl_rade'] || row['radius'] || row['pl_radius'] || row['Radius'] || row['planet_radius']
      ) || this.generateRealisticRadius();

      const mass = this.parseFloat(
        row['pl_bmasse'] || row['mass'] || row['pl_mass'] || row['Mass'] || row['planet_mass']
      ) || this.generateRealisticMass(radius);

      const discoveryYear = this.parseInt(
        row['disc_year'] || row['discovery_year'] || row['year'] || row['Year'] || row['disc_date']
      ) || this.generateRealisticYear();

      const starType = this.getStarType(
        row['st_teff'] || row['star_temp'] || row['stellar_temperature'] || row['Star_Type'] || row['st_spectype']
      );

      const constellation = row['constellation'] || row['Constellation'] || this.getRandomConstellation();

      const planet: Exoplanet = {
        id: `csv-${index}-${planetName.toLowerCase().replace(/\s+/g, '-')}`,
        name: planetName,
        distanceFromEarth: distance,
        orbitalPeriod: orbitalPeriod,
        temperature: temperature,
        starType: starType,
        biosignatures: this.getBiosignatures(row, temperature),
        radius: radius,
        mass: mass,
        discoveryYear: discoveryYear,
        constellation: constellation,
        habitabilityScore: this.calculateHabitabilityScore(temperature, radius, mass, distance)
      };

      return planet;
    } catch (error) {
      console.warn(`❌ Error converting row ${index} to planet:`, error);
      return null;
    }
  }

  private parseFloat(value: string | undefined): number | undefined {
    if (!value || value === '' || value === 'null' || value === 'NaN' || value === 'undefined') {
      return undefined;
    }
    const parsed = parseFloat(value.replace(/[^\d.-]/g, ''));
    return isNaN(parsed) ? undefined : Math.abs(parsed);
  }

  private parseInt(value: string | undefined): number | undefined {
    if (!value || value === '' || value === 'null' || value === 'NaN') {
      return undefined;
    }
    const parsed = parseInt(value.replace(/[^\d]/g, ''));
    return isNaN(parsed) ? undefined : parsed;
  }

  private getStarType(tempStr: string | undefined): string {
    const temp = this.parseFloat(tempStr);
    if (!temp) return this.getRandomStarType();

    if (temp > 30000) return 'O5V';
    if (temp > 10000) return 'B5V';
    if (temp > 7500) return 'A5V';
    if (temp > 6000) return 'F5V';
    if (temp > 5200) return 'G2V';
    if (temp > 3700) return 'K5V';
    return 'M5V';
  }

  private getRandomStarType(): string {
    const types = ['G2V', 'K5V', 'M5V', 'F5V', 'A5V', 'M3V', 'K2V', 'G5V'];
    return types[Math.floor(Math.random() * types.length)];
  }

  private getBiosignatures(row: CSVRow, temperature: number): string[] {
    const biosignatures: string[] = [];
    
    // Check for potential biosignature indicators
    if (temperature >= 200 && temperature <= 350) {
      biosignatures.push('Potential water vapor');
    }
    
    // Check for atmospheric composition hints in column names
    const atmosphereColumns = Object.keys(row).filter(key => 
      key.toLowerCase().includes('atmosphere') || 
      key.toLowerCase().includes('h2o') || 
      key.toLowerCase().includes('oxygen') ||
      key.toLowerCase().includes('methane')
    );
    
    if (atmosphereColumns.length > 0) {
      biosignatures.push('Atmospheric composition data');
    }
    
    return biosignatures;
  }

  private calculateHabitabilityScore(temperature: number, radius: number, mass: number, distance: number): number {
    let score = 0;
    
    // Temperature factor (Earth-like ~288K)
    if (temperature >= 200 && temperature <= 350) {
      score += 3;
    } else if (temperature >= 150 && temperature <= 400) {
      score += 2;
    } else if (temperature >= 100 && temperature <= 500) {
      score += 1;
    }
    
    // Radius factor (Earth-like ~1.0)
    if (radius >= 0.5 && radius <= 2.0) {
      score += 3;
    } else if (radius >= 0.3 && radius <= 3.0) {
      score += 2;
    } else {
      score += 1;
    }
    
    // Mass factor (Earth-like ~1.0)
    if (mass >= 0.1 && mass <= 10.0) {
      score += 2;
    } else {
      score += 1;
    }
    
    // Distance factor (closer is more interesting for study)
    if (distance < 50) {
      score += 2;
    } else if (distance < 200) {
      score += 1;
    }
    
    return Math.min(10, score);
  }

  // Realistic data generators for missing values
  private generateRealisticDistance(): number {
    return Math.random() * 1000 + 10; // 10-1010 light years
  }

  private generateRealisticPeriod(): number {
    return Math.random() * 1000 + 1; // 1-1001 days
  }

  private generateRealisticTemperature(): number {
    return Math.random() * 2000 + 100; // 100-2100 K
  }

  private generateRealisticRadius(): number {
    return Math.random() * 5 + 0.1; // 0.1-5.1 Earth radii
  }

  private generateRealisticMass(radius: number): number {
    return Math.pow(radius, 2.5) * (0.5 + Math.random()); // Mass-radius relationship
  }

  private generateRealisticYear(): number {
    return Math.floor(Math.random() * 30) + 1995; // 1995-2024
  }

  private getRandomConstellation(): string {
    const constellations = [
      'Andromeda', 'Aquarius', 'Aries', 'Cancer', 'Capricornus', 'Gemini',
      'Leo', 'Libra', 'Pisces', 'Sagittarius', 'Scorpius', 'Taurus',
      'Virgo', 'Cygnus', 'Draco', 'Lyra', 'Pegasus', 'Perseus',
      'Ursa Major', 'Ursa Minor', 'Cassiopeia', 'Orion', 'Centaurus',
      'Boötes', 'Hercules', 'Ophiuchus', 'Serpens', 'Corona Borealis'
    ];
    return constellations[Math.floor(Math.random() * constellations.length)];
  }

  getPlanets(): Exoplanet[] {
    return this.planets;
  }

  getCount(): number {
    return this.planets.length;
  }

  isLoaded(): boolean {
    return this.loaded;
  }

  isLoading(): boolean {
    return this.loading;
  }
}

export const csvLoader = CSVExoplanetLoader.getInstance();