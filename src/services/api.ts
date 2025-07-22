const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:5000/api';

// Add timeout to fetch requests
const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeout = 10000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

export interface PlanetSearchResult {
  name: string;
  match_score: number;
}

export interface PlanetDetails {
  pl_name: string;
  pl_rade?: number;
  pl_bmasse?: number;
  pl_orbper?: number;
  pl_eqt?: number;
  st_teff?: number;
  st_age?: number;
  st_mass?: number;
  st_dens?: number;
  disc_year?: number;
  pl_nespec?: number;
  discoverymethod?: string;
  disc_locale?: string;
  disc_facility?: string;
  st_rad?: number;
  habitability_score: number;
  in_habitable_zone: boolean;
  orbital_distance_au: number;
}

export interface PlanetsResponse {
  planets: PlanetDetails[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface PlanetStats {
  total_planets: number;
  data_source: string;
  last_updated: string;
}

class ApiService {
  async searchPlanets(query: string, limit: number = 5): Promise<PlanetSearchResult[]> {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/planets/search?q=${encodeURIComponent(query)}&limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }, 15000);
      if (!response.ok) throw new Error('Search failed');
      const data = await response.json();
      return data.results;
    } catch (error) {
      console.warn('Search service unavailable, using fallback:', error);
      return [];
    }
  }

  async getPlanetDetails(planetName: string): Promise<PlanetDetails | null> {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/planets/${encodeURIComponent(planetName)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }, 15000);
      if (!response.ok) throw new Error('Planet not found');
      return await response.json();
    } catch (error) {
      console.warn('Planet details service unavailable:', error);
      return null;
    }
  }

  async getAllPlanets(page: number = 1, perPage: number = 100): Promise<PlanetsResponse | null> {
    try {
      console.log(`Fetching planets from backend: page ${page}, per_page ${perPage}`);
      const response = await fetchWithTimeout(`${API_BASE_URL}/planets/all?page=${page}&per_page=${perPage}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }, 30000); // Longer timeout for large datasets
      if (!response.ok) throw new Error('Failed to fetch planets');
      const data = await response.json();
      console.log(`Backend returned ${data.planets?.length || 0} planets, total: ${data.total || 0}`);
      return data;
    } catch (error) {
      console.warn('Planets service unavailable:', error);
      return null;
    }
  }

  async getPlanetStats(): Promise<PlanetStats | null> {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/planets/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }, 10000);
      if (!response.ok) throw new Error('Failed to fetch stats');
      return await response.json();
    } catch (error) {
      console.warn('Stats service unavailable:', error);
      return null;
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      console.log('Checking backend health...');
      const response = await fetchWithTimeout(`${API_BASE_URL}/health`, {
        method: 'GET',
      }, 5000);
      const isHealthy = response.ok;
      console.log(`Backend health check: ${isHealthy ? 'healthy' : 'unhealthy'}`);
      return isHealthy;
    } catch (error) {
      console.log('Backend health check failed:', error);
      return false;
    }
  }
}

export const apiService = new ApiService();