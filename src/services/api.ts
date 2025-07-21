const API_BASE_URL = 'http://localhost:5000/api';

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
      const response = await fetch(`${API_BASE_URL}/planets/search?q=${encodeURIComponent(query)}&limit=${limit}`);
      if (!response.ok) throw new Error('Search failed');
      const data = await response.json();
      return data.results;
    } catch (error) {
      console.error('Error searching planets:', error);
      return [];
    }
  }

  async getPlanetDetails(planetName: string): Promise<PlanetDetails | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/planets/${encodeURIComponent(planetName)}`);
      if (!response.ok) throw new Error('Planet not found');
      return await response.json();
    } catch (error) {
      console.error('Error fetching planet details:', error);
      return null;
    }
  }

  async getAllPlanets(page: number = 1, perPage: number = 100): Promise<PlanetsResponse | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/planets/all?page=${page}&per_page=${perPage}`);
      if (!response.ok) throw new Error('Failed to fetch planets');
      return await response.json();
    } catch (error) {
      console.error('Error fetching all planets:', error);
      return null;
    }
  }

  async getPlanetStats(): Promise<PlanetStats | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/planets/stats`);
      if (!response.ok) throw new Error('Failed to fetch stats');
      return await response.json();
    } catch (error) {
      console.error('Error fetching planet stats:', error);
      return null;
    }
  }
}

export const apiService = new ApiService();