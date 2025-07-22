// Direct NASA Exoplanet Archive API Service (Frontend)
const NASA_BASE_URL = "https://exoplanetarchive.ipac.caltech.edu/TAP/sync";

export interface DirectNASAExoplanet {
  pl_name: string;
  pl_rade?: number;
  pl_bmasse?: number;
  pl_orbper?: number;
  pl_eqt?: number;
  st_teff?: number;
  st_age?: number;
  st_mass?: number;
  st_dens?: number;
  st_rad?: number;
  disc_year?: number;
  discoverymethod?: string;
  disc_locale?: string;
  disc_facility?: string;
  pl_orbsmax?: number;
  pl_orbeccen?: number;
  pl_insol?: number;
  sy_dist?: number;
  habitability_score?: number;
  in_habitable_zone?: boolean;
}

export interface DirectNASAResponse {
  planets: DirectNASAExoplanet[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

class DirectNASAService {
  private cache = new Map<string, any>();
  private cacheExpiry = new Map<string, number>();
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

  private isCacheValid(key: string): boolean {
    const expiry = this.cacheExpiry.get(key);
    return expiry ? Date.now() < expiry : false;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, data);
    this.cacheExpiry.set(key, Date.now() + this.CACHE_DURATION);
  }

  private getCache(key: string): any {
    if (this.isCacheValid(key)) {
      return this.cache.get(key);
    }
    this.cache.delete(key);
    this.cacheExpiry.delete(key);
    return null;
  }

  private calculateHabitabilityScore(planet: any): number {
    let score = 0;
    
    // Temperature factor (Earth-like ~288K)
    if (planet.pl_eqt) {
      const temp = planet.pl_eqt;
      if (temp >= 200 && temp <= 350) score += 30;
      else if (temp >= 150 && temp <= 400) score += 15;
    } else if (planet.st_teff) {
      const temp = planet.st_teff;
      if (temp >= 4000 && temp <= 7000) score += 20;
    }
    
    // Radius factor (Earth-like ~1.0)
    if (planet.pl_rade) {
      const radius = planet.pl_rade;
      if (radius >= 0.5 && radius <= 2.0) score += 25;
      else if (radius >= 0.3 && radius <= 3.0) score += 15;
    }
    
    // Mass factor (Earth-like ~1.0)
    if (planet.pl_bmasse) {
      const mass = planet.pl_bmasse;
      if (mass >= 0.1 && mass <= 10.0) score += 25;
      else if (mass >= 0.05 && mass <= 20.0) score += 15;
    }
    
    // Stellar type factor
    if (planet.st_teff) {
      const st_temp = planet.st_teff;
      if (st_temp >= 3000 && st_temp <= 7000) score += 20;
    }
    
    return Math.min(100, score);
  }

  private isInHabitableZone(planet: any): boolean {
    if (planet.pl_eqt) {
      const temp = planet.pl_eqt;
      return temp >= 200 && temp <= 350;
    }
    return false;
  }

  async getAllPlanets(page: number = 1, perPage: number = 100): Promise<DirectNASAResponse> {
    const cacheKey = `all_planets_${page}_${perPage}`;
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    try {
      console.log(`Fetching NASA exoplanets page ${page}...`);
      
      // Query similar to your fuzzywuzzy.py
      const query = `
        SELECT pl_name, pl_rade, pl_bmasse, pl_orbper, pl_eqt, st_teff, st_age, 
               st_mass, st_dens, disc_year, discoverymethod, 
               disc_locale, disc_facility, st_rad, pl_orbsmax, pl_orbeccen, 
               pl_insol, sy_dist
        FROM pscomppars 
        WHERE pl_name IS NOT NULL
        ORDER BY disc_year DESC, pl_name ASC
      `;

      const formData = new FormData();
      formData.append('query', query);
      formData.append('format', 'csv');

      const response = await fetch(NASA_BASE_URL, {
        method: 'POST',
        headers: {
          'User-Agent': 'CosmicLifeMapper/1.0 (Educational Research)'
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`NASA API error: ${response.status} ${response.statusText}`);
      }

      const csvText = await response.text();
      console.log('NASA API Response received, parsing CSV...');
      
      // Parse CSV
      const lines = csvText.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      const allPlanets: DirectNASAExoplanet[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        const planet: any = {};
        
        headers.forEach((header, index) => {
          const value = values[index]?.trim();
          if (value && value !== 'null' && value !== '') {
            // Convert numeric fields
            if (['pl_rade', 'pl_bmasse', 'pl_orbper', 'pl_eqt', 'st_teff', 'st_age', 
                 'st_mass', 'st_dens', 'st_rad', 'disc_year', 'pl_orbsmax', 
                 'pl_orbeccen', 'pl_insol', 'sy_dist'].includes(header)) {
              const numValue = parseFloat(value);
              if (!isNaN(numValue)) {
                planet[header] = numValue;
              }
            } else {
              planet[header] = value;
            }
          }
        });
        
        if (planet.pl_name) {
          // Calculate derived fields
          planet.habitability_score = this.calculateHabitabilityScore(planet);
          planet.in_habitable_zone = this.isInHabitableZone(planet);
          allPlanets.push(planet);
        }
      }

      console.log(`Parsed ${allPlanets.length} planets from NASA API`);

      // Implement pagination
      const total = allPlanets.length;
      const totalPages = Math.ceil(total / perPage);
      const startIndex = (page - 1) * perPage;
      const endIndex = startIndex + perPage;
      const paginatedPlanets = allPlanets.slice(startIndex, endIndex);

      const result: DirectNASAResponse = {
        planets: paginatedPlanets,
        total,
        page,
        per_page: perPage,
        total_pages: totalPages
      };

      this.setCache(cacheKey, result);
      return result;

    } catch (error) {
      console.error('Error fetching from NASA API:', error);
      throw error;
    }
  }

  async searchPlanets(query: string, limit: number = 20): Promise<DirectNASAExoplanet[]> {
    const cacheKey = `search_${query}_${limit}`;
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    try {
      console.log(`Searching NASA planets for: ${query}`);
      
      const searchQuery = `
        SELECT pl_name, pl_rade, pl_bmasse, pl_orbper, pl_eqt, st_teff, st_age, 
               st_mass, st_dens, disc_year, discoverymethod, 
               disc_locale, disc_facility, st_rad, sy_dist
        FROM pscomppars 
        WHERE pl_name IS NOT NULL 
        AND (LOWER(pl_name) LIKE LOWER('%${query.replace(/'/g, "''")}%')
             OR LOWER(disc_facility) LIKE LOWER('%${query.replace(/'/g, "''")}%')
             OR LOWER(discoverymethod) LIKE LOWER('%${query.replace(/'/g, "''")}%'))
        ORDER BY disc_year DESC, pl_name ASC
        LIMIT ${limit}
      `;

      const formData = new FormData();
      formData.append('query', searchQuery);
      formData.append('format', 'csv');

      const response = await fetch(NASA_BASE_URL, {
        method: 'POST',
        headers: {
          'User-Agent': 'CosmicLifeMapper/1.0 (Educational Research)'
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`NASA API error: ${response.status}`);
      }

      const csvText = await response.text();
      const lines = csvText.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      const planets: DirectNASAExoplanet[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        const planet: any = {};
        
        headers.forEach((header, index) => {
          const value = values[index]?.trim();
          if (value && value !== 'null' && value !== '') {
            if (['pl_rade', 'pl_bmasse', 'pl_orbper', 'pl_eqt', 'st_teff', 'st_age', 
                 'st_mass', 'st_dens', 'st_rad', 'disc_year', 'sy_dist'].includes(header)) {
              const numValue = parseFloat(value);
              if (!isNaN(numValue)) {
                planet[header] = numValue;
              }
            } else {
              planet[header] = value;
            }
          }
        });
        
        if (planet.pl_name) {
          planet.habitability_score = this.calculateHabitabilityScore(planet);
          planet.in_habitable_zone = this.isInHabitableZone(planet);
          planets.push(planet);
        }
      }

      this.setCache(cacheKey, planets);
      return planets;

    } catch (error) {
      console.error('Error searching NASA planets:', error);
      return [];
    }
  }

  async getLatestDiscoveries(limit: number = 100): Promise<DirectNASAExoplanet[]> {
    const cacheKey = `latest_${limit}`;
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    try {
      console.log(`Fetching latest ${limit} discoveries...`);
      
      const latestQuery = `
        SELECT pl_name, pl_rade, pl_bmasse, pl_orbper, pl_eqt, st_teff, st_age, 
               st_mass, st_dens, disc_year, discoverymethod, 
               disc_locale, disc_facility, st_rad, sy_dist
        FROM pscomppars 
        WHERE pl_name IS NOT NULL 
        AND disc_year IS NOT NULL
        ORDER BY disc_year DESC, pl_name ASC
        LIMIT ${limit}
      `;

      const formData = new FormData();
      formData.append('query', latestQuery);
      formData.append('format', 'csv');

      const response = await fetch(NASA_BASE_URL, {
        method: 'POST',
        headers: {
          'User-Agent': 'CosmicLifeMapper/1.0 (Educational Research)'
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`NASA API error: ${response.status}`);
      }

      const csvText = await response.text();
      const lines = csvText.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      const planets: DirectNASAExoplanet[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        const planet: any = {};
        
        headers.forEach((header, index) => {
          const value = values[index]?.trim();
          if (value && value !== 'null' && value !== '') {
            if (['pl_rade', 'pl_bmasse', 'pl_orbper', 'pl_eqt', 'st_teff', 'st_age', 
                 'st_mass', 'st_dens', 'st_rad', 'disc_year', 'sy_dist'].includes(header)) {
              const numValue = parseFloat(value);
              if (!isNaN(numValue)) {
                planet[header] = numValue;
              }
            } else {
              planet[header] = value;
            }
          }
        });
        
        if (planet.pl_name) {
          planet.habitability_score = this.calculateHabitabilityScore(planet);
          planet.in_habitable_zone = this.isInHabitableZone(planet);
          planets.push(planet);
        }
      }

      this.setCache(cacheKey, planets);
      return planets;

    } catch (error) {
      console.error('Error fetching latest discoveries:', error);
      return [];
    }
  }

  clearCache(): void {
    this.cache.clear();
    this.cacheExpiry.clear();
  }
}

export const directNasaService = new DirectNASAService();