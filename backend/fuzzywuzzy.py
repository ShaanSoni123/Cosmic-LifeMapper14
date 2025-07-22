from fuzzywuzzy import process
import pandas as pd
import requests
from io import StringIO
import sys
import os

# Load all planet names (quick and light)
def load_planet_names():
    base_url = "https://exoplanetarchive.ipac.caltech.edu/TAP/sync"
    query = "SELECT DISTINCT pl_name FROM pscomppars WHERE pl_name IS NOT NULL ORDER BY pl_name"
    data = {"query": query, "format": "csv"}
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "text/csv,application/csv,text/plain,*/*",
        "Accept-Language": "en-US,en;q=0.9",
        "Connection": "keep-alive",
    }

    try:
        print("🌟 Connecting to NASA Exoplanet Archive...")
        response = requests.post(base_url, data=data, headers=headers)
        response.raise_for_status()
        df = pd.read_csv(StringIO(response.text))
        planet_names = df['pl_name'].dropna().unique().tolist()
        print(f"✅ Loaded {len(planet_names)} planet names from NASA")
        return planet_names
    except Exception as e:
        print(f"❌ Failed to load planet names: {e}")
        return []

# 🛰️ Fetch full data for the selected planet
def fetch_planet_details(planet_name):
    base_url = "https://exoplanetarchive.ipac.caltech.edu/TAP/sync"
    safe_name = planet_name.replace("'", "''")  # SQL escape
    query = (
        "SELECT DISTINCT pl_name, pl_rade, pl_bmasse, pl_orbper, pl_eqt, "
        "st_teff, st_age, st_mass, st_dens, disc_year, discoverymethod, "
        "disc_locale, disc_facility, st_rad, pl_orbsmax, pl_orbeccen, "
        "pl_insol, sy_dist, st_spectype, st_lum, st_logg, st_met "
        "FROM pscomppars "
        f"WHERE pl_name = '{safe_name}'"
    )
    data = {"query": query, "format": "csv"}
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "text/csv,application/csv,text/plain,*/*",
        "Accept-Language": "en-US,en;q=0.9",
        "Connection": "keep-alive",
    }

    try:
        print(f"🔍 Fetching details for {planet_name}...")
        response = requests.post(base_url, data=data, headers=headers)
        response.raise_for_status()
        df = pd.read_csv(StringIO(response.text))
        print(f"✅ Retrieved {len(df)} records for {planet_name}")
        return df
    except Exception as e:
        print(f"❌ Failed to fetch planet details: {e}")
        return pd.DataFrame()

# 🌌 Main program
def main():
    print("🚀 NASA Exoplanet Fuzzy Search Tool")
    print("=" * 50)
    print("📡 Loading planet names from NASA Exoplanet Archive...")
    
    planet_list = load_planet_names()
    
    if not planet_list:
        print("❌ No planet names found. Please check your internet connection.")
        return

    print(f"✅ Successfully loaded {len(planet_list)} exoplanets!")
    print("\n🔍 Enter a planet name (partial names work too):")
    user_input = input("Planet name: ").strip()
    
    if not user_input:
        print("❌ Please enter a planet name.")
        return

    print(f"\n🔍 Searching for planets matching '{user_input}'...")
    matches = process.extract(user_input, planet_list, limit=5)

    if not matches:
        print("❌ No matches found. Try a different search term.")
        return

    print(f"\n🎯 Found {len(matches)} matches:")
    print("-" * 40)
    for i, (name, score) in enumerate(matches):
        print(f"{i + 1}. {name} (Match: {score}%)")

    try:
        choice = int(input(f"\n🌟 Select a planet number (1-{len(matches)}): ")) - 1
        if 0 <= choice < len(matches):
            selected_name = matches[choice][0]
            print(f"\n🎉 You selected: {selected_name}")
            print("📡 Fetching detailed data...")

            df = fetch_planet_details(selected_name)
            if df.empty:
                print("❌ No detailed data found for this planet.")
                return

            print(f"\n🌍 === {selected_name} - Detailed Data ===")
            print("=" * 60)
            
            # Display data in a more readable format
            for column in df.columns:
                value = df[column].iloc[0]
                if pd.notna(value):
                    if column == 'pl_name':
                        print(f"🪐 Planet Name: {value}")
                    elif column == 'pl_rade':
                        print(f"📏 Planet Radius: {value} Earth radii")
                    elif column == 'pl_bmasse':
                        print(f"⚖️  Planet Mass: {value} Earth masses")
                    elif column == 'pl_orbper':
                        print(f"🔄 Orbital Period: {value} days")
                    elif column == 'pl_eqt':
                        print(f"🌡️  Equilibrium Temperature: {value} K")
                    elif column == 'st_teff':
                        print(f"⭐ Star Temperature: {value} K")
                    elif column == 'st_mass':
                        print(f"🌟 Star Mass: {value} Solar masses")
                    elif column == 'disc_year':
                        print(f"📅 Discovery Year: {int(value)}")
                    elif column == 'discoverymethod':
                        print(f"🔬 Discovery Method: {value}")
                    elif column == 'disc_facility':
                        print(f"🏢 Discovery Facility: {value}")
                    elif column == 'sy_dist':
                        print(f"🚀 Distance: {value} parsecs ({value * 3.26:.1f} light years)")
                    else:
                        print(f"📊 {column}: {value}")
            
            print("=" * 60)
        else:
            print("❌ Invalid selection. Please choose a number from the list.")
    except Exception:
        print("❌ Invalid input. Please enter a number.")

def test_dependencies():
    """Test if all required dependencies are working"""
    print("🧪 Testing dependencies...")
    
    try:
        import pandas as pd
        print("✅ pandas: OK")
    except ImportError:
        print("❌ pandas: MISSING")
        return False
    
    try:
        import requests
        print("✅ requests: OK")
    except ImportError:
        print("❌ requests: MISSING")
        return False
    
    try:
        from fuzzywuzzy import process
        print("✅ fuzzywuzzy: OK")
    except ImportError:
        print("❌ fuzzywuzzy: MISSING")
        return False
    
    try:
        import Levenshtein
        print("✅ python-Levenshtein: OK")
    except ImportError:
        print("⚠️  python-Levenshtein: MISSING (fuzzy search will be slower)")
    
    return True

if __name__ == "__main__":
    print("🌌 NASA Exoplanet Fuzzy Search Tool")
    print("=" * 50)
    
    if test_dependencies():
        print("✅ All dependencies are working!")
        print()
        main()
    else:
        print("❌ Some dependencies are missing. Please install them first:")
        print("pip install pandas requests fuzzywuzzy python-Levenshtein")
        sys.exit(1)
