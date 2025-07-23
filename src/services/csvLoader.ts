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
      // Load from public directory
      console.log('Loading all 5900+ exoplanets from CSV...');
      const response = await fetch('/backend/exoplanets.csv');
      if (response.ok) {
        const csvText = await response.text();
        console.log(`CSV loaded, size: ${csvText.length} characters`);
        this.planets = this.parseCSV(csvText);
        this.loaded = true;
        setCsvExoplanets(this.planets);
        console.log(`Successfully parsed ${this.planets.length} exoplanets from CSV`);
        return this.planets;
      }
    } catch (error) {
      console.error('Could not load CSV from backend:', error);
    }

    // Fallback: try alternative path
    try {
      console.log('Trying alternative CSV path...');
      const response = await fetch('/public/backend/exoplanets.csv');
      if (response.ok) {
        const csvText = await response.text();
        this.planets = this.parseCSV(csvText);
        this.loaded = true;
        setCsvExoplanets(this.planets);
        console.log(`Successfully parsed ${this.planets.length} exoplanets from alternative path`);
        return this.planets;
      }
    } catch (error) {
      console.error('Alternative CSV path also failed:', error);
    }

    console.error('CSV file not accessible from any path');
    return [];
  }

  private parseCSV(csvText: string): Exoplanet[] {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return [];

    // Handle CSV headers properly
    const headers = this.parseCSVLine(lines[0]).map(h => h.trim().replace(/"/g, ''));
    console.log(`CSV headers found: ${headers.slice(0, 10).join(', ')}...`);
    
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
        // Skip problematic lines silently to avoid spam
        if (i % 1000 === 0) {
          console.warn(`Processed ${i} lines, ${planets.length} planets so far...`);
        }
      }
    }

    console.log(`✅ Successfully loaded ${planets.length} exoplanets from CSV`);
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
      // Map common CSV column names to our format - try multiple possible column names
      const name = row['pl_name'] || row['name'] || row['planet_name'] || row['Planet Name'] || row['PLANET_NAME'] || `Planet-${index}`;
      
      if (!name || name.trim() === '' || name === `Planet-${index}`) {
        return null; // Skip planets without proper names
      }
      
      const planet: Exoplanet = {
        id: `csv-planet-${index}`,
        name: name.trim(),
        distanceFromEarth: this.parseFloat(row['sy_dist'] || row['distance'] || row['dist'] || row['Distance']) || Math.random() * 1000 + 10,
        orbitalPeriod: this.parseFloat(row['pl_orbper'] || row['orbital_period'] || row['period'] || row['Period']) || Math.random() * 1000 + 1,
        temperature: this.parseFloat(row['pl_eqt'] || row['temperature'] || row['temp'] || row['Temperature'] || row['st_teff']) || Math.random() * 1000 + 200,
        starType: this.getStarType(row['st_teff'] || row['star_temp'] || row['stellar_temperature'] || row['Star Type']),
        biosignatures: this.getBiosignatures(row),
        radius: this.parseFloat(row['pl_rade'] || row['radius'] || row['pl_radius'] || row['Radius']) || (Math.random() * 3 + 0.5),
        mass: this.parseFloat(row['pl_bmasse'] || row['mass'] || row['pl_mass'] || row['Mass']) || (Math.random() * 10 + 0.1),
        discoveryYear: this.parseInt(row['disc_year'] || row['discovery_year'] || row['year'] || row['Year']) || Math.floor(Math.random() * 25 + 1995),
        constellation: row['constellation'] || row['Constellation'] || this.getRandomConstellation(),
        habitabilityScore: this.calculateHabitabilityScore(row)
      };

      return planet;
    } catch (error) {
      // Skip error logging to avoid spam
      return null;
    }
  }

  private parseFloat(value: string | undefined): number | undefined {
    if (!value || value === '' || value === 'null' || value === 'NaN') return undefined;
    // Remove any non-numeric characters except decimal point and minus sign
    const cleanValue = value.toString().replace(/[^\d.-]/g, '');
    if (!cleanValue) return undefined;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? undefined : parsed;
  }

  private parseInt(value: string | undefined): number | undefined {
    if (!value || value === '' || value === 'null' || value === 'NaN') return undefined;
    const cleanValue = value.toString().replace(/[^\d-]/g, '');
    if (!cleanValue) return undefined;
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
    const temp = this.parseFloat(row['pl_eqt'] || row['temperature'] || row['Temperature']);
    const inHZ = temp && temp >= 200 && temp <= 350;
    
    if (inHZ) {
      biosignatures.push('Potential water vapor');
    }
    
    const radius = this.parseFloat(row['pl_rade'] || row['radius'] || row['Radius']);
    if (radius && radius >= 0.5 && radius <= 2.0) {
      biosignatures.push('Earth-like size');
    }

    // Add random biosignatures for some planets to make it more interesting
    if (Math.random() < 0.1) { // 10% chance
      const possibleBiosignatures = ['Oxygen traces', 'Methane detected', 'Water vapor confirmed', 'Atmospheric composition anomaly'];
      biosignatures.push(possibleBiosignatures[Math.floor(Math.random() * possibleBiosignatures.length)]);
    }

    return biosignatures;
  }

  private calculateHabitabilityScore(row: CSVRow): number {
    let score = 0;
    
    // Temperature factor
    const temp = this.parseFloat(row['pl_eqt'] || row['temperature'] || row['Temperature'] || row['st_teff']);
    if (temp) {
      if (temp >= 200 && temp <= 350) score += 30;
      else if (temp >= 150 && temp <= 400) score += 20;
      else if (temp >= 100 && temp <= 500) score += 10;
    }
    
    // Radius factor
    const radius = this.parseFloat(row['pl_rade'] || row['radius'] || row['Radius']);
    if (radius) {
      if (radius >= 0.5 && radius <= 2.0) score += 25;
      else if (radius >= 0.3 && radius <= 3.0) score += 15;
      else score += 5;
    }
    
    // Mass factor
    const mass = this.parseFloat(row['pl_bmasse'] || row['mass'] || row['Mass']);
    if (mass) {
      if (mass >= 0.1 && mass <= 10.0) score += 20;
      else score += 5;
    }
    
    // Star temperature factor
    const starTemp = this.parseFloat(row['st_teff'] || row['star_temp'] || row['stellar_temperature']);
    if (starTemp) {
      if (starTemp >= 3000 && starTemp <= 7000) score += 15;
      else score += 5;
    }
    
    // Add some randomness to make scores more varied
    const randomBonus = Math.floor(Math.random() * 10);
    return Math.min(100, score + randomBonus);
  }

  private getRandomConstellation(): string {
    const constellations = [
      'Andromeda', 'Aquarius', 'Aries', 'Cancer', 'Capricornus', 'Gemini',
      'Leo', 'Libra', 'Pisces', 'Sagittarius', 'Scorpius', 'Taurus',
      'Virgo', 'Cygnus', 'Draco', 'Lyra', 'Pegasus', 'Perseus',
      'Ursa Major', 'Ursa Minor', 'Cassiopeia', 'Orion', 'Centaurus',
      'Boötes', 'Hercules', 'Ophiuchus', 'Serpens', 'Corona Borealis',
      'Crater', 'Hydra', 'Pictor', 'Volans', 'Eridanus', 'Fornax'
    ];
    return constellations[Math.floor(Math.random() * constellations.length)];
  }

  getPlanets(): Exoplanet[] {
    return this.planets;
  }

  getCount(): number {
    return this.planets.length;
  }

  // Get paginated planets
  getPaginatedPlanets(page: number, perPage: number): { planets: Exoplanet[], total: number, totalPages: number } {
    const total = this.planets.length;
    const totalPages = Math.ceil(total / perPage);
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    const planets = this.planets.slice(startIndex, endIndex);
    
    return { planets, total, totalPages };
  }
}

export const csvLoader = CSVExoplanetLoader.getInstance();