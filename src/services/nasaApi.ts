// Enhanced NASA Exoplanet Archive API Service
const NASA_BASE_URL = "https://exoplanetarchive.ipac.caltech.edu/TAP/sync";
// Use a more reliable CORS proxy that supports POST requests
const CORS_PROXY = "https://corsproxy.io/?";

export interface NASAExoplanetData {
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
  pl_nespec?: number;
  discoverymethod?: string;
  disc_locale?: string;
  disc_facility?: string;
  disc_telescope?: string;
  disc_instrument?: string;
  disc_refname?: string;
  disc_pubdate?: string;
  pl_controv_flag?: number;
  pl_orbsmax?: number;
  pl_orbeccen?: number;
  pl_insol?: number;
  pl_dens?: number;
  pl_trandep?: number;
  pl_tranmid?: number;
  pl_tsystemref?: string;
  st_spectype?: string;
  st_lum?: number;
  st_logg?: number;
  st_met?: number;
  st_metratio?: string;
  sy_snum?: number;
  sy_pnum?: number;
  sy_mnum?: number;
  sy_dist?: number;
  sy_disterr1?: number;
  sy_disterr2?: number;
  sy_vmag?: number;
  sy_kmag?: number;
  sy_gaiamag?: number;
  ra?: number;
  dec?: number;
  glat?: number;
  glon?: number;
  elat?: number;
  elon?: number;
  pl_pubdate?: string;
  releasedate?: string;
  pl_nnotes?: number;
  st_nphot?: number;
  st_nrvc?: number;
  st_nspec?: number;
  pl_ntranspec?: number;
  pl_ndispec?: number;
  ttv_flag?: number;
  ptv_flag?: number;
  tran_flag?: number;
  rv_flag?: number;
  ast_flag?: number;
  obm_flag?: number;
  micro_flag?: number;
  etv_flag?: number;
  ima_flag?: number;
  dkin_flag?: number;
}

export interface PaginatedNASAResponse {
  planets: NASAExoplanetData[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
  has_more: boolean;
}

class NASAExoplanetService {
  private cache = new Map<string, any>();
  private cacheExpiry = new Map<string, number>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

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

  // Get total count of all confirmed exoplanets
  async getTotalPlanetCount(): Promise<number> {
    const cacheKey = 'total_count';
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    try {
      const countQuery = `SELECT COUNT(*) as total FROM pscomppars WHERE pl_name IS NOT NULL`;
      const response = await fetch(CORS_PROXY + encodeURIComponent(NASA_BASE_URL), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'CosmicLifeMapper/1.0 (Educational Research)'
        },
        body: new URLSearchParams({
          query: countQuery,
          format: 'json'
        })
      });

      if (!response.ok) {
        throw new Error(`NASA API error: ${response.status}`);
      }

      const data = await response.json();
      const total = data[0]?.total || 0;
      
      this.setCache(cacheKey, total);
      return total;

    } catch (error) {
      console.error('Error fetching total planet count:', error);
      return 0;
    }
  }

  async getAllPlanets(page: number = 1, perPage: number = 100): Promise<PaginatedNASAResponse> {
    const cacheKey = `planets_${page}_${perPage}`;
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    try {
      // Comprehensive query for all confirmed exoplanets
      const query = `
        SELECT 
          pl_name, pl_rade, pl_bmasse, pl_orbper, pl_eqt, pl_orbsmax, pl_orbeccen,
          pl_insol, pl_dens, pl_trandep, pl_tranmid, pl_controv_flag,
          st_teff, st_age, st_mass, st_dens, st_rad, st_spectype, st_lum, st_logg, st_met,
          sy_snum, sy_pnum, sy_mnum, sy_dist, sy_vmag, sy_kmag, sy_gaiamag,
          disc_year, discoverymethod, disc_locale, disc_facility, disc_telescope, 
          disc_instrument, disc_refname, disc_pubdate,
          ra, dec, glat, glon, elat, elon,
          pl_pubdate, releasedate, pl_nnotes,
          ttv_flag, ptv_flag, tran_flag, rv_flag, ast_flag, obm_flag, micro_flag, etv_flag, ima_flag, dkin_flag
        FROM pscomppars 
        WHERE pl_name IS NOT NULL 
        ORDER BY disc_year DESC, pl_name ASC
      `;

      const offset = (page - 1) * perPage;
      const limitedQuery = `${query} OFFSET ${offset} LIMIT ${perPage}`;

      const response = await fetch(CORS_PROXY + encodeURIComponent(NASA_BASE_URL), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'CosmicLifeMapper/1.0 (Educational Research)'
        },
        body: new URLSearchParams({
          query: limitedQuery,
          format: 'json'
        })
      });

      if (!response.ok) {
        throw new Error(`NASA API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Get total count using the optimized method
      const total = await this.getTotalPlanetCount();
      const totalPages = Math.ceil(total / perPage);

      const result: PaginatedNASAResponse = {
        planets: data || [],
        total,
        page,
        per_page: perPage,
        total_pages: totalPages,
        has_more: page < totalPages
      };

      this.setCache(cacheKey, result);
      return result;

    } catch (error) {
      console.error('Error fetching NASA exoplanet data:', error);
      throw error;
    }
  }

  async searchPlanets(query: string, limit: number = 20): Promise<NASAExoplanetData[]> {
    const cacheKey = `search_${query}_${limit}`;
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    try {
      const searchQuery = `
        SELECT 
          pl_name, pl_rade, pl_bmasse, pl_orbper, pl_eqt, pl_orbsmax,
          st_teff, st_age, st_mass, st_dens, st_rad, st_spectype,
          sy_dist, disc_year, discoverymethod, disc_facility
        FROM pscomppars 
        WHERE pl_name IS NOT NULL 
        AND (LOWER(pl_name) LIKE LOWER('%${query.replace(/'/g, "''")}%')
             OR LOWER(disc_facility) LIKE LOWER('%${query.replace(/'/g, "''")}%')
             OR LOWER(discoverymethod) LIKE LOWER('%${query.replace(/'/g, "''")}%'))
        ORDER BY disc_year DESC, pl_name ASC
        LIMIT ${limit}
      `;

      const response = await fetch(CORS_PROXY + encodeURIComponent(NASA_BASE_URL), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'CosmicLifeMapper/1.0 (Educational Research)'
        },
        body: new URLSearchParams({
          query: searchQuery,
          format: 'json'
        })
      });

      if (!response.ok) {
        throw new Error(`NASA API error: ${response.status}`);
      }

      const data = await response.json();
      const result = data || [];
      
      this.setCache(cacheKey, result);
      return result;

    } catch (error) {
      console.error('Error searching NASA exoplanet data:', error);
      return [];
    }
  }

  async getPlanetDetails(planetName: string): Promise<NASAExoplanetData | null> {
    const cacheKey = `planet_${planetName}`;
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    try {
      const detailQuery = `
        SELECT *
        FROM pscomppars 
        WHERE pl_name = '${planetName.replace(/'/g, "''")}'
      `;

      const response = await fetch(CORS_PROXY + encodeURIComponent(NASA_BASE_URL), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'CosmicLifeMapper/1.0 (Educational Research)'
        },
        body: new URLSearchParams({
          query: detailQuery,
          format: 'json'
        })
      });

      if (!response.ok) {
        throw new Error(`NASA API error: ${response.status}`);
      }

      const data = await response.json();
      const result = data && data.length > 0 ? data[0] : null;
      
      if (result) {
        this.setCache(cacheKey, result);
      }
      
      return result;

    } catch (error) {
      console.error('Error fetching planet details:', error);
      return null;
    }
  }

  // Get potentially habitable planets based on scientific criteria
  async getPotentiallyHabitablePlanets(limit: number = 100): Promise<NASAExoplanetData[]> {
    const cacheKey = `habitable_${limit}`;
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    try {
      const habitableQuery = `
        SELECT 
          pl_name, pl_rade, pl_bmasse, pl_orbper, pl_eqt, pl_orbsmax, pl_orbeccen,
          pl_insol, pl_dens, pl_trandep, pl_tranmid, pl_controv_flag,
          st_teff, st_age, st_mass, st_dens, st_rad, st_spectype, st_lum, st_logg, st_met,
          sy_snum, sy_pnum, sy_mnum, sy_dist, sy_vmag, sy_kmag, sy_gaiamag,
          disc_year, discoverymethod, disc_locale, disc_facility, disc_telescope, 
          disc_instrument, disc_refname, disc_pubdate,
          ra, dec, glat, glon, elat, elon,
          pl_pubdate, releasedate, pl_nnotes,
          ttv_flag, ptv_flag, tran_flag, rv_flag, ast_flag, obm_flag, micro_flag, etv_flag, ima_flag, dkin_flag
        FROM pscomppars 
        WHERE pl_name IS NOT NULL 
        AND pl_rade IS NOT NULL 
        AND pl_bmasse IS NOT NULL 
        AND pl_eqt IS NOT NULL 
        AND pl_insol IS NOT NULL
        AND pl_rade >= 0.5 
        AND pl_rade <= 2.5
        AND pl_bmasse >= 0.1 
        AND pl_bmasse <= 10.0
        AND pl_eqt >= 150 
        AND pl_eqt <= 400
        AND pl_insol >= 0.2 
        AND pl_insol <= 2.0
        ORDER BY 
          CASE 
            WHEN pl_rade BETWEEN 0.8 AND 2.0 AND pl_bmasse BETWEEN 0.5 AND 5.0 
                 AND pl_eqt BETWEEN 200 AND 350 AND pl_insol BETWEEN 0.3 AND 1.5 
            THEN 1
            WHEN pl_rade BETWEEN 0.5 AND 3.0 AND pl_bmasse BETWEEN 0.1 AND 10.0 
                 AND pl_eqt BETWEEN 150 AND 400 AND pl_insol BETWEEN 0.2 AND 2.0 
            THEN 2
            ELSE 3
          END,
          pl_eqt ASC
        LIMIT ${limit}
      `;

      const response = await fetch(CORS_PROXY + encodeURIComponent(NASA_BASE_URL), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'CosmicLifeMapper/1.0 (Educational Research)'
        },
        body: new URLSearchParams({
          query: habitableQuery,
          format: 'json'
        })
      });

      if (!response.ok) {
        throw new Error(`NASA API error: ${response.status}`);
      }

      const data = await response.json();
      const result = data || [];
      
      this.setCache(cacheKey, result);
      return result;

    } catch (error) {
      console.error('Error fetching potentially habitable planets:', error);
      return [];
    }
  }

  // Get planets by discovery method
  async getPlanetsByDiscoveryMethod(method: string, limit: number = 100): Promise<NASAExoplanetData[]> {
    const cacheKey = `method_${method}_${limit}`;
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    try {
      const methodQuery = `
        SELECT 
          pl_name, pl_rade, pl_bmasse, pl_orbper, pl_eqt, pl_orbsmax, pl_orbeccen,
          pl_insol, pl_dens, pl_trandep, pl_tranmid, pl_controv_flag,
          st_teff, st_age, st_mass, st_dens, st_rad, st_spectype, st_lum, st_logg, st_met,
          sy_snum, sy_pnum, sy_mnum, sy_dist, sy_vmag, sy_kmag, sy_gaiamag,
          disc_year, discoverymethod, disc_locale, disc_facility, disc_telescope, 
          disc_instrument, disc_refname, disc_pubdate,
          ra, dec, glat, glon, elat, elon,
          pl_pubdate, releasedate, pl_nnotes,
          ttv_flag, ptv_flag, tran_flag, rv_flag, ast_flag, obm_flag, micro_flag, etv_flag, ima_flag, dkin_flag
        FROM pscomppars 
        WHERE pl_name IS NOT NULL 
        AND LOWER(discoverymethod) = LOWER('${method.replace(/'/g, "''")}')
        ORDER BY disc_year DESC, pl_name ASC
        LIMIT ${limit}
      `;

      const response = await fetch(CORS_PROXY + encodeURIComponent(NASA_BASE_URL), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'CosmicLifeMapper/1.0 (Educational Research)'
        },
        body: new URLSearchParams({
          query: methodQuery,
          format: 'json'
        })
      });

      if (!response.ok) {
        throw new Error(`NASA API error: ${response.status}`);
      }

      const data = await response.json();
      const result = data || [];
      
      this.setCache(cacheKey, result);
      return result;

    } catch (error) {
      console.error(`Error fetching planets by discovery method ${method}:`, error);
      return [];
    }
  }

  // Get discovery methods statistics
  async getDiscoveryMethodsStats(): Promise<{ [key: string]: number }> {
    const cacheKey = 'discovery_methods_stats';
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    try {
      const statsQuery = `
        SELECT discoverymethod, COUNT(*) as count
        FROM pscomppars 
        WHERE pl_name IS NOT NULL AND discoverymethod IS NOT NULL
        GROUP BY discoverymethod
        ORDER BY count DESC
      `;

      const response = await fetch(CORS_PROXY + encodeURIComponent(NASA_BASE_URL), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'CosmicLifeMapper/1.0 (Educational Research)'
        },
        body: new URLSearchParams({
          query: statsQuery,
          format: 'json'
        })
      });

      if (!response.ok) {
        throw new Error(`NASA API error: ${response.status}`);
      }

      const data = await response.json();
      const stats: { [key: string]: number } = {};
      
      data.forEach((row: any) => {
        if (row.discoverymethod && row.count) {
          stats[row.discoverymethod] = parseInt(row.count);
        }
      });
      
      this.setCache(cacheKey, stats);
      return stats;

    } catch (error) {
      console.error('Error fetching discovery methods stats:', error);
      return {};
    }
  }

  async getLatestDiscoveries(limit: number = 50): Promise<NASAExoplanetData[]> {
    const cacheKey = `latest_${limit}`;
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    try {
      const latestQuery = `
        SELECT 
          pl_name, pl_rade, pl_bmasse, pl_orbper, pl_eqt, pl_orbsmax,
          st_teff, st_age, st_mass, st_dens, st_rad, st_spectype,
          sy_dist, disc_year, discoverymethod, disc_facility, disc_pubdate
        FROM pscomppars 
        WHERE pl_name IS NOT NULL 
        AND disc_year IS NOT NULL
        ORDER BY disc_year DESC, disc_pubdate DESC, pl_name ASC
        LIMIT ${limit}
      `;

      const response = await fetch(CORS_PROXY + encodeURIComponent(NASA_BASE_URL), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'CosmicLifeMapper/1.0 (Educational Research)'
        },
        body: new URLSearchParams({
          query: latestQuery,
          format: 'json'
        })
      });

      if (!response.ok) {
        throw new Error(`NASA API error: ${response.status}`);
      }

      const data = await response.json();
      const result = data || [];
      
      this.setCache(cacheKey, result);
      return result;

    } catch (error) {
      console.error('Error fetching latest discoveries:', error);
      return [];
    }
  }

  async getStatistics(): Promise<{
    total_planets: number;
    total_systems: number;
    discovery_methods: { [key: string]: number };
    yearly_discoveries: { [key: number]: number };
    facilities: { [key: string]: number };
  }> {
    const cacheKey = 'statistics';
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    try {
      // Get total counts
      const statsQuery = `
        SELECT 
          COUNT(DISTINCT pl_name) as total_planets,
          COUNT(DISTINCT hostname) as total_systems,
          discoverymethod,
          disc_year,
          disc_facility
        FROM pscomppars 
        WHERE pl_name IS NOT NULL
        GROUP BY discoverymethod, disc_year, disc_facility
      `;

      const response = await fetch(CORS_PROXY + encodeURIComponent(NASA_BASE_URL), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'CosmicLifeMapper/1.0 (Educational Research)'
        },
        body: new URLSearchParams({
          query: statsQuery,
          format: 'json'
        })
      });

      if (!response.ok) {
        throw new Error(`NASA API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Process statistics
      const discovery_methods: { [key: string]: number } = {};
      const yearly_discoveries: { [key: number]: number } = {};
      const facilities: { [key: string]: number } = {};
      
      let total_planets = 0;
      let total_systems = 0;

      data.forEach((row: any) => {
        if (row.total_planets) total_planets = Math.max(total_planets, row.total_planets);
        if (row.total_systems) total_systems = Math.max(total_systems, row.total_systems);
        
        if (row.discoverymethod) {
          discovery_methods[row.discoverymethod] = (discovery_methods[row.discoverymethod] || 0) + 1;
        }
        
        if (row.disc_year) {
          yearly_discoveries[row.disc_year] = (yearly_discoveries[row.disc_year] || 0) + 1;
        }
        
        if (row.disc_facility) {
          facilities[row.disc_facility] = (facilities[row.disc_facility] || 0) + 1;
        }
      });

      const result = {
        total_planets,
        total_systems,
        discovery_methods,
        yearly_discoveries,
        facilities
      };

      this.setCache(cacheKey, result);
      return result;

    } catch (error) {
      console.error('Error fetching statistics:', error);
      return {
        total_planets: 0,
        total_systems: 0,
        discovery_methods: {},
        yearly_discoveries: {},
        facilities: {}
      };
    }
  }

  // Clear all caches
  clearCache(): void {
    this.cache.clear();
    this.cacheExpiry.clear();
  }
}

export const nasaExoplanetService = new NASAExoplanetService();