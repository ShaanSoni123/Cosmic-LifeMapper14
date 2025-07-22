from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import requests
from io import StringIO
from fuzzywuzzy import process
import math
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Increase timeout and add retry logic
import time
from functools import wraps

def retry_on_failure(max_retries=3, delay=1):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(max_retries):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    if attempt == max_retries - 1:
                        raise e
                    logger.warning(f"Attempt {attempt + 1} failed: {e}. Retrying in {delay}s...")
                    time.sleep(delay)
            return None
        return wrapper
    return decorator

# Cache for planet names to avoid repeated API calls
planet_names_cache = None
all_planets_cache = None

@retry_on_failure(max_retries=3, delay=2)
def load_planet_names():
    """Load all planet names from NASA Exoplanet Archive"""
    global planet_names_cache
    
    if planet_names_cache is not None:
        return planet_names_cache
    
    base_url = "https://exoplanetarchive.ipac.caltech.edu/TAP/sync"
    query = "SELECT DISTINCT pl_name FROM pscomppars WHERE pl_name IS NOT NULL AND default_flag = 1"
    data = {"query": query, "format": "csv"}
    headers = {"User-Agent": "Mozilla/5.0 (compatible; ExoplanetExplorer/1.0)"}

    try:
        logger.info("Loading planet names from NASA Exoplanet Archive...")
        response = requests.post(base_url, data=data, headers=headers, timeout=60)
        response.raise_for_status()
        df = pd.read_csv(StringIO(response.text))
        planet_names_cache = df['pl_name'].dropna().unique().tolist()
        logger.info(f"Loaded {len(planet_names_cache)} planet names")
        return planet_names_cache
    except Exception as e:
        logger.error(f"Failed to load planet names: {e}")
        return []

@retry_on_failure(max_retries=2, delay=3)
def load_all_planets():
    """Load all planet data from NASA Exoplanet Archive"""
    global all_planets_cache
    
    if all_planets_cache is not None:
        return all_planets_cache
    
    base_url = "https://exoplanetarchive.ipac.caltech.edu/TAP/sync"
    query = """
    SELECT DISTINCT pl_name, pl_rade, pl_bmasse, pl_orbper, pl_eqt, st_teff, st_age, 
           st_mass, st_dens, disc_year, pl_nespec, discoverymethod, 
           disc_locale, disc_facility, st_rad
    FROM pscomppars
    WHERE pl_name IS NOT NULL AND default_flag = 1
    ORDER BY pl_name
    """
    data = {"query": query, "format": "csv"}
    headers = {"User-Agent": "Mozilla/5.0 (compatible; ExoplanetExplorer/1.0)"}

    try:
        logger.info("Loading all planet data from NASA Exoplanet Archive...")
        response = requests.post(base_url, data=data, headers=headers, timeout=120)
        response.raise_for_status()
        df = pd.read_csv(StringIO(response.text))
        
        # Add calculated fields
        df['habitability_score'] = calculate_habitability_scores(df)
        df['in_habitable_zone'] = calculate_habitable_zone_status(df)
        df['orbital_distance_au'] = estimate_orbital_distance(df)
        
        all_planets_cache = df
        logger.info(f"Loaded {len(df)} planets with full data")
        return df
    except Exception as e:
        logger.error(f"Failed to load planet data: {e}")
        return pd.DataFrame()

def calculate_habitability_scores(df):
    """Calculate simple habitability scores for planets"""
    scores = []
    for _, row in df.iterrows():
        score = 0
        
        # Temperature factor (Earth-like ~288K)
        if pd.notna(row.get('pl_eqt')):
            temp = row['pl_eqt']
            if 200 <= temp <= 350:
                score += 30
            elif 150 <= temp <= 400:
                score += 15
        elif pd.notna(row.get('st_teff')):
            # Estimate from stellar temperature
            temp = row['st_teff']
            if 4000 <= temp <= 7000:
                score += 20
        
        # Radius factor (Earth-like ~1.0)
        if pd.notna(row.get('pl_rade')):
            radius = row['pl_rade']
            if 0.5 <= radius <= 2.0:
                score += 25
            elif 0.3 <= radius <= 3.0:
                score += 15
        
        # Mass factor (Earth-like ~1.0)
        if pd.notna(row.get('pl_bmasse')):
            mass = row['pl_bmasse']
            if 0.1 <= mass <= 10.0:
                score += 25
            elif 0.05 <= mass <= 20.0:
                score += 15
        
        # Stellar type factor
        if pd.notna(row.get('st_teff')):
            st_temp = row['st_teff']
            if 3000 <= st_temp <= 7000:  # M, K, G stars
                score += 20
        
        scores.append(min(100, score))
    
    return scores

def calculate_habitable_zone_status(df):
    """Determine if planets are in habitable zone"""
    status = []
    for _, row in df.iterrows():
        in_hz = False
        
        if pd.notna(row.get('pl_eqt')):
            temp = row['pl_eqt']
            # Simple temperature-based habitable zone
            if 200 <= temp <= 350:
                in_hz = True
        
        status.append(in_hz)
    
    return status

def estimate_orbital_distance(df):
    """Estimate orbital distance from period using Kepler's 3rd law"""
    distances = []
    for _, row in df.iterrows():
        if pd.notna(row.get('pl_orbper')) and pd.notna(row.get('st_mass')):
            period_years = row['pl_orbper'] / 365.25
            star_mass = row['st_mass']
            # Kepler's 3rd law: a^3 = P^2 * M
            distance = (period_years**2 * star_mass)**(1/3)
        elif pd.notna(row.get('pl_orbper')):
            # Assume solar mass
            period_years = row['pl_orbper'] / 365.25
            distance = period_years**(2/3)
        else:
            distance = None
        
        distances.append(distance)
    
    return distances

@retry_on_failure(max_retries=2, delay=1)
def fetch_planet_details(planet_name):
    """Fetch detailed data for a specific planet"""
    base_url = "https://exoplanetarchive.ipac.caltech.edu/TAP/sync"
    safe_name = planet_name.replace("'", "''")  # SQL escape
    query = f"""
    SELECT DISTINCT pl_name, pl_rade, pl_bmasse, pl_orbper, pl_eqt, st_teff, st_age, 
           st_mass, st_dens, disc_year, pl_nespec, discoverymethod, 
           disc_locale, disc_facility, st_rad
    FROM pscomppars
    WHERE pl_name = '{safe_name}' AND default_flag = 1
    """
    data = {"query": query, "format": "csv"}
    headers = {"User-Agent": "Mozilla/5.0 (compatible; ExoplanetExplorer/1.0)"}

    try:
        response = requests.post(base_url, data=data, headers=headers, timeout=60)
        response.raise_for_status()
        df = pd.read_csv(StringIO(response.text))
        
        if df.empty:
            return None
        
        # Add calculated fields
        row = df.iloc[0]
        result = row.to_dict()
        
        # Calculate habitability score
        temp_score = 0
        if pd.notna(result.get('pl_eqt')):
            temp = result['pl_eqt']
            if 200 <= temp <= 350:
                temp_score = 30
        
        radius_score = 0
        if pd.notna(result.get('pl_rade')):
            radius = result['pl_rade']
            if 0.5 <= radius <= 2.0:
                radius_score = 25
        
        mass_score = 0
        if pd.notna(result.get('pl_bmasse')):
            mass = result['pl_bmasse']
            if 0.1 <= mass <= 10.0:
                mass_score = 25
        
        stellar_score = 0
        if pd.notna(result.get('st_teff')):
            st_temp = result['st_teff']
            if 3000 <= st_temp <= 7000:
                stellar_score = 20
        
        result['habitability_score'] = min(100, temp_score + radius_score + mass_score + stellar_score)
        result['in_habitable_zone'] = pd.notna(result.get('pl_eqt')) and 200 <= result['pl_eqt'] <= 350
        
        # Estimate orbital distance
        if pd.notna(result.get('pl_orbper')):
            period_years = result['pl_orbper'] / 365.25
            result['orbital_distance_au'] = period_years**(2/3)
        else:
            result['orbital_distance_au'] = None
        
        return result
    except Exception as e:
        logger.error(f"Failed to fetch planet details for {planet_name}: {e}")
        return None

@app.route('/api/planets/search', methods=['GET'])
def search_planets():
    """Search for planets using fuzzy matching"""
    query = request.args.get('q', '').strip()
    limit = min(int(request.args.get('limit', 10)), 50)  # Max 50 results
    
    if len(query) < 2:
        return jsonify({"results": []})
    
    try:
        planet_names = load_planet_names()
        if not planet_names:
            return jsonify({"error": "Failed to load planet names"}), 500
        
        # Use fuzzywuzzy for fuzzy matching
        matches = process.extract(query, planet_names, limit=limit)
        
        results = [
            {"name": name, "match_score": score}
            for name, score in matches
            if score >= 60  # Only return matches with 60%+ similarity
        ]
        
        return jsonify({"results": results})
    
    except Exception as e:
        logger.error(f"Search error: {e}")
        return jsonify({"error": "Search failed"}), 500

@app.route('/api/planets/<planet_name>', methods=['GET'])
def get_planet_details(planet_name):
    """Get detailed information for a specific planet"""
    try:
        details = fetch_planet_details(planet_name)
        if details is None:
            return jsonify({"error": "Planet not found"}), 404
        
        return jsonify(details)
    
    except Exception as e:
        logger.error(f"Error fetching planet details: {e}")
        return jsonify({"error": "Failed to fetch planet details"}), 500

@app.route('/api/planets/all', methods=['GET'])
def get_all_planets():
    """Get paginated list of all planets"""
    try:
        page = max(1, int(request.args.get('page', 1)))
        per_page = min(int(request.args.get('per_page', 100)), 200)  # Max 200 per page
        
        df = load_all_planets()
        if df.empty:
            return jsonify({"error": "Failed to load planet data"}), 500
        
        total = len(df)
        total_pages = math.ceil(total / per_page)
        
        # Calculate pagination
        start_idx = (page - 1) * per_page
        end_idx = start_idx + per_page
        
        # Get page data
        page_df = df.iloc[start_idx:end_idx]
        
        # Convert to list of dictionaries
        planets = []
        for _, row in page_df.iterrows():
            planet_dict = row.to_dict()
            # Convert NaN to None for JSON serialization
            planet_dict = {k: (None if pd.isna(v) else v) for k, v in planet_dict.items()}
            planets.append(planet_dict)
        
        return jsonify({
            "planets": planets,
            "total": total,
            "page": page,
            "per_page": per_page,
            "total_pages": total_pages
        })
    
    except Exception as e:
        logger.error(f"Error fetching all planets: {e}")
        return jsonify({"error": "Failed to fetch planets"}), 500

@app.route('/api/planets/stats', methods=['GET'])
def get_planet_stats():
    """Get statistics about the planet database"""
    try:
        planet_names = load_planet_names()
        
        return jsonify({
            "total_planets": len(planet_names) if planet_names else 0,
            "data_source": "NASA Exoplanet Archive",
            "last_updated": "Real-time"
        })
    
    except Exception as e:
        logger.error(f"Error fetching stats: {e}")
        return jsonify({"error": "Failed to fetch statistics"}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "service": "Exoplanet Explorer API"})

if __name__ == '__main__':
    logger.info("Starting Exoplanet Explorer API...")
    app.run(debug=True, host='0.0.0.0', port=5000)