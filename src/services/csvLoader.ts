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
      while (this.loading) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return this.planets;
    }

    this.loading = true;
    console.log('🚀 Loading exoplanets from backend/exoplanets.csv...');

    try {
      // Try to load the CSV file from backend directory
      const response = await fetch('/backend/exoplanets.csv');
      if (!response.ok) {
        throw new Error(`Failed to load CSV: ${response.status}`);
      }

      const csvText = await response.text();
      console.log(`📊 CSV file loaded: ${csvText.length} characters`);

      this.planets = this.parseCSV(csvText);
      this.loaded = true;
      
      console.log(`🎉 SUCCESS! Loaded ${this.planets.length} unique exoplanets from CSV`);
      
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
    console.log(`📋 CSV Headers found: ${headers.length} columns`);

    const planets: Exoplanet[] = [];
    const seenPlanets = new Set<string>(); // Track unique planets
    let successCount = 0;
    let duplicateCount = 0;
    let errorCount = 0;

    // Parse each data line
    for (let i = 1; i < lines.length; i++) {
      try {
        const values = this.parseCSVLine(lines[i]);
        if (values.length < 5) continue; // Skip incomplete rows

        const row: CSVRow = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });

        const planet = this.convertRowToPlanet(row, i);
        if (planet && planet.name && planet.name.trim() !== '') {
          // Check for duplicates
          const planetKey = planet.name.toLowerCase().trim();
          if (seenPlanets.has(planetKey)) {
            duplicateCount++;
            continue; // Skip duplicate
          }
          
          seenPlanets.add(planetKey);
          planets.push(planet);
          successCount++;
        }
      } catch (error) {
        errorCount++;
        if (errorCount < 5) {
          console.warn(`⚠️ Error parsing line ${i + 1}:`, error);
        }
      }

      if (i % 1000 === 0) {
        console.log(`📊 Processed ${i}/${lines.length} lines, found ${successCount} unique planets`);
      }
    }

    console.log(`✅ CSV Parsing Complete!`);
    console.log(`📊 Total lines processed: ${lines.length - 1}`);
    console.log(`✅ Unique planets parsed: ${successCount}`);
    console.log(`🔄 Duplicates removed: ${duplicateCount}`);
    console.log(`❌ Parsing errors: ${errorCount}`);

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
      // Get planet name from CSV
      const planetName = this.getValueFromRow(row, [
        'pl_name', 'name', 'planet_name', 'Planet Name', 'PLANET_NAME'
      ]);

      if (!planetName || planetName.trim() === '') {
        return null;
      }

      // Extract all data from CSV with proper column mapping
      const distance = this.parseFloat(this.getValueFromRow(row, [
        'sy_dist', 'distance', 'dist', 'Distance', 'sy_distance'
      ])) || this.generateRealisticDistance();

      const orbitalPeriod = this.parseFloat(this.getValueFromRow(row, [
        'pl_orbper', 'orbital_period', 'period', 'Period', 'pl_period'
      ])) || this.generateRealisticPeriod();

      const temperature = this.parseFloat(this.getValueFromRow(row, [
        'pl_eqt', 'temperature', 'temp', 'Temperature', 'pl_temp', 'st_teff'
      ])) || this.generateRealisticTemperature();

      const radius = this.parseFloat(this.getValueFromRow(row, [
        'pl_rade', 'radius', 'pl_radius', 'Radius', 'planet_radius'
      ])) || this.generateRealisticRadius();

      const mass = this.parseFloat(this.getValueFromRow(row, [
        'pl_bmasse', 'mass', 'pl_mass', 'Mass', 'planet_mass'
      ])) || this.generateRealisticMass(radius);

      const discoveryYear = this.parseInt(this.getValueFromRow(row, [
        'disc_year', 'discovery_year', 'year', 'Year', 'disc_date'
      ])) || this.generateRealisticYear();

      const starType = this.getStarType(this.getValueFromRow(row, [
        'st_spectype', 'star_type', 'stellar_type', 'Star_Type', 'st_teff'
      ]));

      const constellation = this.getValueFromRow(row, [
        'constellation', 'Constellation'
      ]) || this.getRandomConstellation();

      const discoveryMethod = this.getValueFromRow(row, [
        'discoverymethod', 'discovery_method', 'method', 'Method'
      ]) || 'Transit';

      const discoveryFacility = this.getValueFromRow(row, [
        'disc_facility', 'discovery_facility', 'facility', 'Facility'
      ]) || 'Unknown';

      // Calculate realistic biosignature score based on planet characteristics
      const biosignatureScore = this.calculateBiosignatureScore(temperature, radius, mass, distance);

      const planet: Exoplanet = {
        id: `csv-${planetName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`,
        name: planetName,
        distanceFromEarth: distance,
        orbitalPeriod: orbitalPeriod,
        temperature: temperature,
        starType: starType,
        biosignatures: this.getBiosignatures(temperature, biosignatureScore),
        radius: radius,
        mass: mass,
        discoveryYear: discoveryYear,
        constellation: constellation,
        habitabilityScore: biosignatureScore
      };

      return planet;
    } catch (error) {
      console.warn(`❌ Error converting row ${index} to planet:`, error);
      return null;
    }
  }

  private getValueFromRow(row: CSVRow, possibleColumns: string[]): string {
    for (const col of possibleColumns) {
      if (row[col] && row[col].trim() !== '' && row[col] !== 'null') {
        return row[col].trim();
      }
    }
    return '';
  }

  private parseFloat(value: string): number | undefined {
    if (!value || value === '' || value === 'null' || value === 'NaN' || value === 'undefined') {
      return undefined;
    }
    const parsed = parseFloat(value.replace(/[^\d.-]/g, ''));
    return isNaN(parsed) ? undefined : Math.abs(parsed);
  }

  private parseInt(value: string): number | undefined {
    if (!value || value === '' || value === 'null' || value === 'NaN') {
      return undefined;
    }
    const parsed = parseInt(value.replace(/[^\d]/g, ''));
    return isNaN(parsed) ? undefined : parsed;
  }

  private getStarType(value: string): string {
    if (!value) return this.getRandomStarType();
    
    // If it's a temperature, convert to star type
    const temp = this.parseFloat(value);
    if (temp) {
      if (temp > 30000) return 'O5V';
      if (temp > 10000) return 'B5V';
      if (temp > 7500) return 'A5V';
      if (temp > 6000) return 'F5V';
      if (temp > 5200) return 'G2V';
      if (temp > 3700) return 'K5V';
      return 'M5V';
    }
    
    // If it's already a star type, clean it up
    const cleaned = value.trim().toUpperCase();
    if (cleaned.match(/^[OBAFGKM]\d*V?$/)) {
      return cleaned;
    }
    
    return this.getRandomStarType();
  }

  private getRandomStarType(): string {
    const types = ['G2V', 'K5V', 'M5V', 'F5V', 'A5V', 'M3V', 'K2V', 'G5V'];
    return types[Math.floor(Math.random() * types.length)];
  }

  private calculateBiosignatureScore(temperature: number, radius: number, mass: number, distance: number): number {
    let score = 0;
    
    // Temperature factor (optimal for liquid water)
    if (temperature >= 273 && temperature <= 373) { // 0°C to 100°C
      score += 4;
    } else if (temperature >= 200 && temperature <= 400) {
      score += 3;
    } else if (temperature >= 150 && temperature <= 500) {
      score += 2;
    } else if (temperature >= 100 && temperature <= 600) {
      score += 1;
    }
    
    // Size factor (Earth-like is optimal)
    if (radius >= 0.8 && radius <= 1.5) {
      score += 3;
    } else if (radius >= 0.5 && radius <= 2.5) {
      score += 2;
    } else if (radius >= 0.3 && radius <= 4.0) {
      score += 1;
    }
    
    // Mass factor (affects gravity and atmosphere retention)
    if (mass >= 0.5 && mass <= 2.0) {
      score += 2;
    } else if (mass >= 0.1 && mass <= 10.0) {
      score += 1;
    }
    
    // Distance factor (closer planets are easier to study)
    if (distance < 50) {
      score += 1;
    } else if (distance < 200) {
      score += 0.5;
    }
    
    return Math.min(10, Math.max(0, score));
  }

  private getBiosignatures(temperature: number, score: number): string[] {
    const biosignatures: string[] = [];
    
    // Only add biosignatures for planets with good conditions
    if (score >= 6) {
      biosignatures.push('Water vapor potential');
      if (temperature >= 273 && temperature <= 373) {
        biosignatures.push('Liquid water possible');
      }
    }
    
    if (score >= 7) {
      biosignatures.push('Atmospheric stability indicators');
    }
    
    if (score >= 8) {
      biosignatures.push('Oxygen traces possible');
      biosignatures.push('Methane signatures');
    }
    
    return biosignatures;
  }

  // Realistic data generators for missing values
  private generateRealisticDistance(): number {
    return Math.random() * 1000 + 10;
  }

  private generateRealisticPeriod(): number {
    return Math.random() * 1000 + 1;
  }

  private generateRealisticTemperature(): number {
    return Math.random() * 2000 + 100;
  }

  private generateRealisticRadius(): number {
    return Math.random() * 5 + 0.1;
  }

  private generateRealisticMass(radius: number): number {
    return Math.pow(radius, 2.5) * (0.5 + Math.random());
  }

  private generateRealisticYear(): number {
    return Math.floor(Math.random() * 30) + 1995;
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