import { Exoplanet } from '../data/exoplanets';
import { setCsvExoplanets } from '../data/csvExoplanets';

interface CSVRow {
  [key: string]: string;
}

export class CSVExoplanetLoader {
  private static instance: CSVExoplanetLoader;
  private planets: Exoplanet[] = [];
  private loaded = false;

  static getInstance(): CSVExoplanetLoader {
    if (!CSVExoplanetLoader.instance) {
      CSVExoplanetLoader.instance = new CSVExoplanetLoader();
    }
    return CSVExoplanetLoader.instance;
  }

  async loadCSVData(): Promise<Exoplanet[]> {
    if (this.loaded) {
      return this.planets;
    }

    try {
      // Try to load from public directory first
      const response = await fetch('/public/backend/exoplanets.csv');
      if (response.ok) {
        const csvText = await response.text();
        this.planets = this.parseCSV(csvText);
        this.loaded = true;
        setCsvExoplanets(this.planets);
        console.log(`Successfully loaded ${this.planets.length} exoplanets from CSV`);
        return this.planets;
      }
      
      // Fallback: try direct backend path
      const backupResponse = await fetch('/backend/exoplanets.csv');
      if (backupResponse.ok) {
        const csvText = await backupResponse.text();
        this.planets = this.parseCSV(csvText);
        this.loaded = true;
        setCsvExoplanets(this.planets);
        console.log(`Successfully loaded ${this.planets.length} exoplanets from backup CSV path`);
        return this.planets;
      }
    } catch (error) {
      console.warn('Could not load CSV from backend:', error);
    }

    // Final fallback: try to generate sample data from existing structure
    console.warn('CSV file not accessible, generating sample data from existing structure');
    this.planets = this.generateSampleData();
    this.loaded = true;
    setCsvExoplanets(this.planets);
    return this.planets;
  }

  private generateSampleData(): Exoplanet[] {
    // Generate sample exoplanet data if CSV is not accessible
    const samplePlanets: Exoplanet[] = [];
    const constellations = ['Cygnus', 'Lyra', 'Draco', 'Aquarius', 'Leo', 'Virgo', 'Centaurus', 'Pegasus'];
    const starTypes = ['G2V', 'K2V', 'M3V', 'F5V', 'M1V', 'K5V'];
    const methods = ['Transit', 'Radial Velocity', 'Direct Imaging', 'Gravitational Microlensing'];
    
    for (let i = 0; i < 100; i++) {
      const temp = 200 + Math.random() * 800;
      const radius = 0.5 + Math.random() * 3;
      const mass = 0.1 + Math.random() * 10;
      
      samplePlanets.push({
        id: `sample-planet-${i}`,
        name: `Sample Planet ${i + 1}`,
        distanceFromEarth: 10 + Math.random() * 1000,
        orbitalPeriod: 1 + Math.random() * 1000,
        temperature: temp,
        starType: starTypes[Math.floor(Math.random() * starTypes.length)],
        biosignatures: Math.random() > 0.8 ? ['Water vapor', 'Oxygen'] : [],
        radius: radius,
        mass: mass,
        discoveryYear: 2000 + Math.floor(Math.random() * 24),
        constellation: constellations[Math.floor(Math.random() * constellations.length)],
        habitabilityScore: this.calculateHabitabilityScore({
          pl_eqt: temp.toString(),
          pl_rade: radius.toString(),
          pl_bmasse: mass.toString(),
          st_teff: (5000 + Math.random() * 2000).toString()
        })
      });
    }
    
    return samplePlanets;
  }

  private parseCSV(csvText: string): Exoplanet[] {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const planets: Exoplanet[] = [];

    for (let i = 1; i < lines.length; i++) {
      try {
        const values = this.parseCSVLine(lines[i]);
        if (values.length < headers.length) continue;

        const row: CSVRow = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });

        const planet = this.convertRowToPlanet(row, i);
        if (planet) {
          planets.push(planet);
        }
      } catch (error) {
        console.warn(`Error parsing CSV line ${i + 1}:`, error);
      }
    }

    console.log(`Successfully loaded ${planets.length} exoplanets from CSV`);
    return planets;
  }

  private parseCSVLine(line: string): string[] {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    values.push(current.trim());
    return values;
  }

  private convertRowToPlanet(row: CSVRow, index: number): Exoplanet | null {
    try {
      // Map common CSV column names to our format
      const name = row['pl_name'] || row['name'] || row['planet_name'] || `Planet-${index}`;
      
      const planet: Exoplanet = {
        id: `csv-planet-${index}`,
        name: name,
        distanceFromEarth: this.parseFloat(row['sy_dist'] || row['distance'] || row['dist']) || 100,
        orbitalPeriod: this.parseFloat(row['pl_orbper'] || row['orbital_period'] || row['period']) || 365,
        temperature: this.parseFloat(row['pl_eqt'] || row['temperature'] || row['temp']) || 288,
        starType: this.getStarType(row['st_teff'] || row['star_temp'] || row['stellar_temperature']),
        biosignatures: this.getBiosignatures(row),
        radius: this.parseFloat(row['pl_rade'] || row['radius'] || row['pl_radius']) || 1.0,
        mass: this.parseFloat(row['pl_bmasse'] || row['mass'] || row['pl_mass']) || 1.0,
        discoveryYear: this.parseInt(row['disc_year'] || row['discovery_year'] || row['year']) || 2000,
        constellation: row['constellation'] || this.getRandomConstellation(),
        habitabilityScore: this.calculateHabitabilityScore(row)
      };

      return planet;
    } catch (error) {
      console.warn(`Error converting row to planet:`, error);
      return null;
    }
  }

  private parseFloat(value: string | undefined): number | undefined {
    if (!value || value === '' || value === 'null' || value === 'NaN') return undefined;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? undefined : parsed;
  }

  private parseInt(value: string | undefined): number | undefined {
    if (!value || value === '' || value === 'null' || value === 'NaN') return undefined;
    const parsed = parseInt(value);
    return isNaN(parsed) ? undefined : parsed;
  }

  private getStarType(tempStr: string | undefined): string {
    const temp = this.parseFloat(tempStr);
    if (!temp) return 'G2V';

    if (temp > 30000) return 'O5V';
    if (temp > 10000) return 'B5V';
    if (temp > 7500) return 'A5V';
    if (temp > 6000) return 'F5V';
    if (temp > 5200) return 'G2V';
    if (temp > 3700) return 'K5V';
    return 'M5V';
  }

  private getBiosignatures(row: CSVRow): string[] {
    const biosignatures: string[] = [];
    
    // Check for potential biosignature indicators in the data
    const temp = this.parseFloat(row['pl_eqt'] || row['temperature']);
    const inHZ = temp && temp >= 200 && temp <= 350;
    
    if (inHZ) {
      biosignatures.push('Potential water vapor');
    }
    
    const radius = this.parseFloat(row['pl_rade'] || row['radius']);
    if (radius && radius >= 0.5 && radius <= 2.0) {
      biosignatures.push('Earth-like size');
    }

    return biosignatures;
  }

  private calculateHabitabilityScore(row: CSVRow): number {
    let score = 0;
    
    // Temperature factor
    const temp = this.parseFloat(row['pl_eqt'] || row['temperature']);
    if (temp) {
      if (temp >= 200 && temp <= 350) score += 3;
      else if (temp >= 150 && temp <= 400) score += 2;
      else if (temp >= 100 && temp <= 500) score += 1;
    }
    
    // Radius factor
    const radius = this.parseFloat(row['pl_rade'] || row['radius']);
    if (radius) {
      if (radius >= 0.5 && radius <= 2.0) score += 3;
      else if (radius >= 0.3 && radius <= 3.0) score += 2;
      else score += 1;
    }
    
    // Mass factor
    const mass = this.parseFloat(row['pl_bmasse'] || row['mass']);
    if (mass) {
      if (mass >= 0.1 && mass <= 10.0) score += 2;
      else score += 1;
    }
    
    // Star temperature factor
    const starTemp = this.parseFloat(row['st_teff'] || row['star_temp']);
    if (starTemp) {
      if (starTemp >= 3000 && starTemp <= 7000) score += 2;
      else score += 1;
    }
    
    return Math.min(10, score);
  }

  private getRandomConstellation(): string {
    const constellations = [
      'Andromeda', 'Aquarius', 'Aries', 'Cancer', 'Capricornus', 'Gemini',
      'Leo', 'Libra', 'Pisces', 'Sagittarius', 'Scorpius', 'Taurus',
      'Virgo', 'Cygnus', 'Draco', 'Lyra', 'Pegasus', 'Perseus',
      'Ursa Major', 'Ursa Minor', 'Cassiopeia', 'Orion', 'Centaurus'
    ];
    return constellations[Math.floor(Math.random() * constellations.length)];
  }

  getPlanets(): Exoplanet[] {
    return this.planets;
  }

  getCount(): number {
    return this.planets.length;
  }
}

export const csvLoader = CSVExoplanetLoader.getInstance();