from flask import Flask, jsonify, request
from flask_cors import CORS
from fuzzywuzzy import process
import pandas as pd
import requests
from io import StringIO
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
import logging
import time

app = Flask(__name__)
CORS(app)

# Setup logging
logging.basicConfig(level=logging.INFO)

# Cache for planet names and data
planet_names_cache = None
planet_data_cache = {}

def habitableZoneBoundsExtended(star_temp):
    """Calculate habitable zone bounds using Kopparapu et al. 2013"""
    T_star = star_temp
    S_inner = 1.107 + 1.332e-4 * (T_star - 5780) + 1.580e-8 * (T_star - 5780)**2
    S_outer = 0.356 + 6.171e-5 * (T_star - 5780) + 1.698e-9 * (T_star - 5780)**2
    L_star = (T_star / 5778) ** 4
    
    inner_bound = np.sqrt(L_star / S_inner)
    outer_bound = np.sqrt(L_star / S_outer)
    return inner_bound, outer_bound

def estimateSurfaceTemperature(star_temp, orbital_distance, albedo=0.3):
    """Estimate equilibrium surface temperature"""
    R_sun_AU = 0.00465047
    T_eq = star_temp * np.sqrt(R_sun_AU / (2 * orbital_distance)) * (1 - albedo) ** 0.25
    return T_eq

def calculateSurfaceGravity(planet_mass, planet_radius):
    """Calculate surface gravity relative to Earth"""
    return planet_mass / (planet_radius ** 2)

def calculateWaterRetentionPotential(planet_mass, planet_radius, star_temp, orbital_distance):
    """Calculate water retention potential score (0-1)"""
    gravity = calculateSurfaceGravity(planet_mass, planet_radius)
    T_eq = estimateSurfaceTemperature(star_temp, orbital_distance, 0.3)
    
    gravity_factor = 1 if gravity >= 0.5 else gravity / 0.5
    
    if T_eq <= 320:
        temp_factor = 1.0
    elif T_eq >= 400:
        temp_factor = 0.0
    else:
        temp_factor = (400 - T_eq) / 80
    
    score = gravity_factor * temp_factor
    return np.clip(score, 0, 1)

def calculateRadiationHazardIndex(star_temp, stellar_luminosity, orbital_distance, host_star_age):
    """Calculate radiation hazard index (0-1)"""
    temp_norm = np.clip((star_temp - 2500) / (7000 - 2500), 0, 1)
    base_radiation = stellar_luminosity / (orbital_distance ** 2)
    age_factor = 1.0 if host_star_age < 1 else max(0, 1 - (host_star_age - 1) / 9)
    
    raw_index = base_radiation * temp_norm * age_factor
    max_expected = 10
    hazard_index = np.clip(raw_index / max_expected, 0, 1)
    return hazard_index

def calculateHabitabilityScore(row):
    """Calculate comprehensive habitability score using apSameer1.py logic"""
    try:
        # Extract values with defaults
        planet_radius = row.get('pl_rade', 1.0) or 1.0
        star_temperature = row.get('st_teff', 5778) or 5778
        planet_mass = row.get('pl_bmasse', 1.0) or 1.0
        orbital_period = row.get('pl_orbper', 365) or 365
        stellar_age = row.get('st_age', 4.6) or 4.6
        
        # Estimate orbital distance from period (Kepler's 3rd law approximation)
        orbital_distance = (orbital_period / 365.25) ** (2/3)
        
        # Default values for missing parameters
        atmospheric_pressure = 1.0
        stellar_luminosity = (star_temperature / 5778) ** 4
        albedo = 0.3
        
        # Calculate habitable zone
        hz_inner, hz_outer = habitableZoneBoundsExtended(star_temperature)
        in_hz = hz_inner <= orbital_distance <= hz_outer
        hz_factor = 1.0 if in_hz else 0.0
        
        # Calculate factors
        radius_factor = np.exp(-((planet_radius - 1.0) ** 2) / (2 * 0.3 ** 2))
        pressure_factor = np.exp(-((atmospheric_pressure - 1.0) ** 2) / (2 * 0.5 ** 2))
        luminosity_factor = np.exp(-((stellar_luminosity - 1.0) ** 2) / (2 * 0.7 ** 2))
        
        water_potential = calculateWaterRetentionPotential(
            planet_mass, planet_radius, star_temperature, orbital_distance
        )
        
        radiation_penalty = 1 - calculateRadiationHazardIndex(
            star_temperature, stellar_luminosity, orbital_distance, stellar_age
        )
        
        # Combine all factors
        score_raw = hz_factor * radius_factor * pressure_factor * luminosity_factor * water_potential * radiation_penalty
        score = float(np.clip(score_raw, 0, 1)) * 100  # Convert to 0-100 scale
        
        return score
    except Exception as e:
        logging.error(f"Error calculating habitability score: {e}")
        return 0.0

def load_planet_names():
    """Load all planet names from NASA Exoplanet Archive"""
    global planet_names_cache
    
    if planet_names_cache is not None:
        return planet_names_cache
    
    base_url = "https://exoplanetarchive.ipac.caltech.edu/TAP/sync"
    query = "SELECT pl_name FROM pscomppars"
    data = {"query": query, "format": "csv"}
    headers = {"User-Agent": "Mozilla/5.0"}

    try:
        response = requests.post(base_url, data=data, headers=headers, timeout=30)
        response.raise_for_status()
        df = pd.read_csv(StringIO(response.text))
        planet_names_cache = df['pl_name'].dropna().tolist()
        logging.info(f"Loaded {len(planet_names_cache)} planet names")
        return planet_names_cache
    except Exception as e:
        logging.error(f"Failed to load planet names: {e}")
        return []

def fetch_planet_details(planet_name):
    """Fetch detailed data for a specific planet"""
    if planet_name in planet_data_cache:
        return planet_data_cache[planet_name]
    
    base_url = "https://exoplanetarchive.ipac.caltech.edu/TAP/sync"
    safe_name = planet_name.replace("'", "''")
    query = (
        "SELECT pl_name, pl_rade, pl_bmasse, pl_orbper, pl_eqt, "
        "st_teff, st_age, st_mass, st_dens, disc_year, pl_nespec, "
        "discoverymethod, disc_locale, disc_facility, st_rad "
        f"FROM pscomppars WHERE pl_name = '{safe_name}'"
    )
    data = {"query": query, "format": "csv"}
    headers = {"User-Agent": "Mozilla/5.0"}

    try:
        response = requests.post(base_url, data=data, headers=headers, timeout=30)
        response.raise_for_status()
        df = pd.read_csv(StringIO(response.text))
        
        if not df.empty:
            planet_data = df.iloc[0].to_dict()
            planet_data_cache[planet_name] = planet_data
            return planet_data
        return {}
    except Exception as e:
        logging.error(f"Failed to fetch planet details for {planet_name}: {e}")
        return {}

def fetch_batch_planet_details(planet_names, batch_size=50):
    """Fetch details for multiple planets in batches"""
    all_data = []
    
    for i in range(0, len(planet_names), batch_size):
        batch = planet_names[i:i + batch_size]
        
        # Create IN clause for SQL query
        names_str = "', '".join([name.replace("'", "''") for name in batch])
        
        base_url = "https://exoplanetarchive.ipac.caltech.edu/TAP/sync"
        query = (
            "SELECT pl_name, pl_rade, pl_bmasse, pl_orbper, pl_eqt, "
            "st_teff, st_age, st_mass, st_dens, disc_year, pl_nespec, "
            "discoverymethod, disc_locale, disc_facility, st_rad "
            f"FROM pscomppars WHERE pl_name IN ('{names_str}')"
        )
        data = {"query": query, "format": "csv"}
        headers = {"User-Agent": "Mozilla/5.0"}

        try:
            response = requests.post(base_url, data=data, headers=headers, timeout=60)
            response.raise_for_status()
            df = pd.read_csv(StringIO(response.text))
            
            for _, row in df.iterrows():
                planet_data = row.to_dict()
                planet_data['habitability_score'] = calculateHabitabilityScore(planet_data)
                all_data.append(planet_data)
                
            logging.info(f"Processed batch {i//batch_size + 1}, got {len(df)} planets")
            time.sleep(1)  # Rate limiting
            
        except Exception as e:
            logging.error(f"Failed to fetch batch {i//batch_size + 1}: {e}")
            continue
    
    return all_data

@app.route('/api/planets/search', methods=['GET'])
def search_planets():
    """Search for planets using fuzzy matching"""
    query = request.args.get('q', '')
    limit = int(request.args.get('limit', 5))
    
    if not query:
        return jsonify({'error': 'Query parameter required'}), 400
    
    planet_names = load_planet_names()
    if not planet_names:
        return jsonify({'error': 'Failed to load planet names'}), 500
    
    matches = process.extract(query, planet_names, limit=limit)
    
    results = []
    for name, score in matches:
        results.append({
            'name': name,
            'match_score': score
        })
    
    return jsonify({'results': results})

@app.route('/api/planets/<planet_name>', methods=['GET'])
def get_planet_details(planet_name):
    """Get detailed information for a specific planet"""
    planet_data = fetch_planet_details(planet_name)
    
    if not planet_data:
        return jsonify({'error': 'Planet not found'}), 404
    
    # Calculate habitability score
    habitability_score = calculateHabitabilityScore(planet_data)
    planet_data['habitability_score'] = habitability_score
    
    # Add additional calculated fields
    star_temp = planet_data.get('st_teff', 5778) or 5778
    orbital_period = planet_data.get('pl_orbper', 365) or 365
    orbital_distance = (orbital_period / 365.25) ** (2/3)
    
    hz_inner, hz_outer = habitableZoneBoundsExtended(star_temp)
    planet_data['in_habitable_zone'] = hz_inner <= orbital_distance <= hz_outer
    planet_data['orbital_distance_au'] = orbital_distance
    
    return jsonify(planet_data)

@app.route('/api/planets/all', methods=['GET'])
def get_all_planets():
    """Get all planets with habitability scores (paginated)"""
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 100))
    
    planet_names = load_planet_names()
    if not planet_names:
        return jsonify({'error': 'Failed to load planet names'}), 500
    
    # Calculate pagination
    start_idx = (page - 1) * per_page
    end_idx = start_idx + per_page
    page_names = planet_names[start_idx:end_idx]
    
    # Fetch details for this page
    planets_data = fetch_batch_planet_details(page_names)
    
    return jsonify({
        'planets': planets_data,
        'total': len(planet_names),
        'page': page,
        'per_page': per_page,
        'total_pages': (len(planet_names) + per_page - 1) // per_page
    })

@app.route('/api/planets/stats', methods=['GET'])
def get_planet_stats():
    """Get overall statistics about the planet database"""
    planet_names = load_planet_names()
    
    return jsonify({
        'total_planets': len(planet_names),
        'data_source': 'NASA Exoplanet Archive',
        'last_updated': 'Real-time'
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)