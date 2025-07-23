#!/usr/bin/env python3
"""
CSV to Frontend Data Converter
Converts the exoplanets.csv file to the format expected by the React frontend
"""

import json
import pandas as pd
import numpy as np
from apSameer1 import (
    load_exoplanets_from_csv, 
    convert_to_frontend_format,
    CSV_FILE_PATH
)
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def generate_frontend_data():
    """
    Generate the frontend-compatible data from CSV and save it.
    """
    try:
        # Load the CSV data
        logger.info("Loading exoplanet data from CSV...")
        df = load_exoplanets_from_csv(CSV_FILE_PATH)
        
        if df.empty:
            logger.error("No data loaded from CSV file")
            return
        
        logger.info(f"Processing {len(df)} exoplanets...")
        
        # Convert to frontend format
        planets_data = convert_to_frontend_format(df)
        
        logger.info(f"Successfully converted {len(planets_data)} planets")
        
        # Generate TypeScript file content
        ts_content = generate_typescript_file(planets_data)
        
        # Write to the nasaExoplanets.ts file
        output_path = "../src/data/nasaExoplanets.ts"
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(ts_content)
        
        logger.info(f"Successfully wrote {len(planets_data)} planets to {output_path}")
        
        # Also save as JSON for debugging
        with open("../src/data/exoplanets_processed.json", 'w', encoding='utf-8') as f:
            json.dump(planets_data, f, indent=2, default=str)
        
        return planets_data
        
    except Exception as e:
        logger.error(f"Error generating frontend data: {e}")
        raise

def generate_typescript_file(planets_data):
    """Generate the TypeScript file content."""
    
    # Start with the interface and imports
    ts_content = '''export interface NASAExoplanet {
  id: string;
  name: string;
  distanceFromEarth: number; // light years
  orbitalPeriod: number; // days
  temperature: number; // Kelvin
  starType: string;
  radius: number; // Earth radii
  mass: number; // Earth masses
  discoveryYear: number;
  discoveryMethod: string;
  discoveryFacility: string;
  constellation: string;
  habitabilityScore: number;
  inHabitableZone: boolean;
  stellarTemperature: number;
  orbitalDistance: number; // AU
}

// Comprehensive NASA Exoplanet Database from CSV - 5900+ planets
export const nasaExoplanets: NASAExoplanet[] = [
'''
    
    # Add each planet
    for i, planet in enumerate(planets_data):
        ts_content += "  {\n"
        for key, value in planet.items():
            if isinstance(value, str):
                ts_content += f'    {key}: "{value}",\n'
            elif isinstance(value, bool):
                ts_content += f'    {key}: {str(value).lower()},\n'
            else:
                ts_content += f'    {key}: {value},\n'
        ts_content += "  }"
        
        if i < len(planets_data) - 1:
            ts_content += ","
        ts_content += "\n"
    
    # Close the array and add helper functions
    ts_content += '''];

// Helper function to get star type from temperature
export function getStarTypeFromTemp(temp: number): string {
  if (temp > 30000) return 'O';
  if (temp > 10000) return 'B';
  if (temp > 7500) return 'A';
  if (temp > 6000) return 'F';
  if (temp > 5200) return 'G';
  if (temp > 3700) return 'K';
  return 'M';
}

// Helper function to estimate distance (simplified)
export function estimateDistance(discoveryYear: number, method: string): number {
  const baseDistance = method === 'Transit' ? 
    (discoveryYear > 2015 ? 500 : 1000) : 
    (discoveryYear > 2010 ? 50 : 100);
  
  return baseDistance + Math.random() * baseDistance;
}

// Export total count
export const TOTAL_NASA_PLANETS = nasaExoplanets.length;
'''
    
    return ts_content

if __name__ == "__main__":
    print("🚀 Converting CSV data to frontend format...")
    planets = generate_frontend_data()
    if planets:
        print(f"✅ Successfully processed {len(planets)} exoplanets!")
        print("🌟 Your NASA Archive section now has access to all the CSV data!")
    else:
        print("❌ Failed to process exoplanet data")