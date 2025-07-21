from fuzzywuzzy import process
import pandas as pd
import requests
from io import StringIO

#Load all planet names (quick and light)
def load_planet_names():
    base_url = "https://exoplanetarchive.ipac.caltech.edu/TAP/sync"
    query = "SELECT pl_name FROM pscomppars"
    data = {"query": query, "format": "csv"}
    headers = {"User-Agent": "Mozilla/5.0"}

    try:
        response = requests.post(base_url, data=data, headers=headers)
        response.raise_for_status()
        df = pd.read_csv(StringIO(response.text))
        return df['pl_name'].dropna().tolist()
    except Exception as e:
        print("Failed to load planet names:", e)
        return []
#st_rad               | double     | Stellar Radius
#st_dens              | double     | Stellar Density
#st_mass              | double     | Stellar Mass
#st_age               | double     | Stellar Age
'''disc_pubdate         | char       | Discovery Publication Date
disc_year            | int        | Discovery Year
discoverymethod      | char       | Discovery Method
disc_locale          | char       | Discovery Locale
disc_facility        | char       | Discovery Facility
disc_instrument      | char       | Discovery Instrument
disc_telescope       | char       | Discovery Telescope
disc_refname         | char       | Discovery Reference'''
# 🛰️ Fetch full data for the selected planet
def fetch_planet_details(planet_name):
    base_url = "https://exoplanetarchive.ipac.caltech.edu/TAP/sync"
    safe_name = planet_name.replace("'", "''")  # SQL escape
    query = (
        "SELECT pl_name, pl_rade, pl_bmasse, pl_orbper, pl_eqt, "
        "st_teff, st_age, st_mass, st_dens, disc_year, pl_nespec, discoverymethod, disc_locale, disc_facility, st_rad FROM pscomppars "
        f"WHERE pl_name = '{safe_name}'"
    )
    data = {"query": query, "format": "csv"}
    headers = {"User-Agent": "Mozilla/5.0"}

    try:
        response = requests.post(base_url, data=data, headers=headers)
        response.raise_for_status()
        df = pd.read_csv(StringIO(response.text))
        return df
    except Exception as e:
        print("Failed to fetch planet details:", e)
        return pd.DataFrame()

# 🌌 Main program
def main():
    print("Loading planet names...")
    planet_list = load_planet_names()
    
    if not planet_list:
        print("No planet names found.")
        return

    user_input = input("Enter the name of a planet: ")

    matches = process.extract(user_input, planet_list, limit=5)

    print("\nDid you mean:")
    for i, (name, score) in enumerate(matches):
        print(f"{i + 1}. {name} ({score}%)")

    try:
        choice = int(input("\nSelect a planet number (1-5): ")) - 1
        if 0 <= choice < len(matches):
            selected_name = matches[choice][0]
            print(f"\n✅ You selected: {selected_name}")
            print("📡 Fetching detailed data...")

            df = fetch_planet_details(selected_name)
            if df.empty:
                print("No detailed data found.")
                return

            print("\n== Planetary Data ==\n")
            print(df.T)
        else:
            print("Invalid selection.")
    except Exception:
        print("Invalid input.")

if __name__ == "__main__":
    main()
# This code is a streamlined version of the original Integration.py, focusing on fetching and displaying planet data.
# It uses the fuzzywuzzy library for name matching and pandas for data handling.
# The code is designed to be efficient and user-friendly, providing a quick way to access exoplanet data.
# It includes error handling for network requests and user input validation.            
