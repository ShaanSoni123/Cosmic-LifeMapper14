// CSV Planet Loader Service

export interface CSVPlanet {
  pl_name: string;
  hostname: string;
  discoverymethod: string;
  disc_year: number;
  pl_orbper?: number;
  pl_rade?: number;
  pl_masse?: number;
  st_teff?: number;
  st_rad?: number;
  st_mass?: number;
  // Additional properties needed for the UI
  pl_eqt?: number;
  pl_insol?: number;
  sy_dist?: number;
  disc_facility?: string;
  disc_telescope?: string;
  pl_bmasse?: number; // Alternative mass field
}

export class CSVPlanetLoader {
  async loadPlanets(): Promise<CSVPlanet[]> {
    try {
      console.log('🚀 Loading planets from CSV file...');
      
      // Use fetch with the correct path for Vite
      const response = await fetch('/planets-data.csv');
      console.log('📁 Fetching CSV from /planets-data.csv');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch CSV: ${response.status} ${response.statusText}`);
      }
      
      const csvText = await response.text();
      console.log(`📄 Received ${csvText.length} characters of CSV data`);
      
      if (csvText.length < 100) {
        console.log('❌ CSV file seems too small, content:', csvText);
        throw new Error('CSV file too small - may be corrupted or empty');
      }
      
      // Parse CSV data
      const lines = csvText.split('\n').filter((line: string) => line.trim());
      console.log(`📊 Total lines: ${lines.length}`);
      
      if (lines.length === 0) {
        console.log('❌ No data found in CSV');
        return [];
      }
      
      const headers = lines[0].split(',').map((h: string) => h.replace(/"/g, '').trim());
      console.log('📊 Headers:', headers);
      
      const planets: CSVPlanet[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
          const values = lines[i].split(',').map((v: string) => v.replace(/"/g, '').trim());
          const planet: any = {};
          
          headers.forEach((header: string, index: number) => {
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
      
    } catch (error: any) {
      console.error('❌ Error loading CSV planets:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      return [];
    }
  }
}

export const csvPlanetLoader = new CSVPlanetLoader();
