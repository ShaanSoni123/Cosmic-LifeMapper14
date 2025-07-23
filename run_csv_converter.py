#!/usr/bin/env python3
"""
Quick script to run the CSV converter and populate the NASA Archive
"""

import sys
import os
sys.path.append('backend')

from backend.csv_to_frontend import generate_frontend_data

if __name__ == "__main__":
    print("🌌 NASA Exoplanet CSV Converter")
    print("=" * 50)
    
    try:
        print("📡 Loading exoplanets.csv...")
        planets = generate_frontend_data()
        
        if planets:
            print(f"✅ SUCCESS! Converted {len(planets)} exoplanets")
            print("🚀 Your NASA Archive section is now populated!")
            print("\nNext steps:")
            print("1. The data has been written to src/data/nasaExoplanets.ts")
            print("2. Switch to 'NASA Archive' tab to see all planets")
            print("3. Enjoy exploring 5900+ exoplanets! 🌍")
        else:
            print("❌ No planets were processed")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        print("\nTroubleshooting:")
        print("1. Make sure exoplanets.csv exists in src/data/")
        print("2. Check that the CSV file has the expected columns")
        print("3. Verify Python dependencies are installed")