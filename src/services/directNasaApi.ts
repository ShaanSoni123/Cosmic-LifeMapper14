// Direct NASA CSV Data Fetcher
const NASA_CSV_URL = "https://exoplanetarchive.ipac.caltech.edu/TAP/sync?query=SELECT+pl_name,hostname,discoverymethod,disc_year,pl_orbper,pl_rade,pl_masse,st_teff,st_rad,st_mass+FROM+pscomppars&format=csv";

export interface DirectNASAExoplanet {
  pl_name: string;
  hostname: string;
  discoverymethod: string;
  disc_year: number;
  pl_orbper?: number;
  pl_rade?: number;
  pl_masse?: number;
  pl_bmasse?: number; // Alternative mass field
  st_teff?: number;
  st_rad?: number;
  st_mass?: number;
  // Additional properties needed for the UI
  pl_eqt?: number;
  pl_insol?: number;
  sy_dist?: number;
  disc_facility?: string;
  disc_telescope?: string;
}

export class DirectNASAService {
  async fetchAllPlanets(): Promise<DirectNASAExoplanet[]> {
    try {
      console.log('🚀 Starting to fetch planets from NASA CSV...');
      console.log('📡 URL:', NASA_CSV_URL);
      
      const response = await fetch(NASA_CSV_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'CosmicLifeMapper/1.0 (Educational Research)'
        }
      });
      
      console.log('📥 Response status:', response.status);
      console.log('📥 Response ok:', response.ok);
      console.log('📥 Response headers:', response.headers);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
      }
      
      const csvText = await response.text();
      console.log(`📄 Received ${csvText.length} characters of CSV data`);
      console.log('📄 First 500 characters:', csvText.substring(0, 500));
      
      // Parse CSV manually (simple approach)
      const lines = csvText.split('\n');
      console.log('📊 Total lines:', lines.length);
      console.log('📊 First line (headers):', lines[0]);
      
      const headers = lines[0].split(',').map(h => h.replace(/"/g, ''));
      console.log('📊 Parsed headers:', headers);
      
      const planets: DirectNASAExoplanet[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
          const values = lines[i].split(',').map(v => v.replace(/"/g, ''));
          const planet: any = {};
          
          headers.forEach((header, index) => {
            if (values[index] && values[index] !== '') {
              // Convert numeric values
              if (['disc_year', 'pl_orbper', 'pl_rade', 'pl_masse', 'st_teff', 'st_rad', 'st_mass'].includes(header)) {
                planet[header] = parseFloat(values[index]);
              } else {
                planet[header] = values[index];
              }
            }
          });
          
          if (planet.pl_name) {
            planets.push(planet);
          }
        }
      }
      
      console.log(`✅ Successfully parsed ${planets.length} planets from CSV`);
      if (planets.length > 0) {
        console.log('🪐 First planet:', planets[0]);
      }
      return planets;
      
    } catch (error) {
      console.error('❌ Error fetching NASA CSV data:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      return [];
    }
  }
}

export const directNASAService = new DirectNASAService();