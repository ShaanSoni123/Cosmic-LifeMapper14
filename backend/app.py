from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import requests
from io import StringIO
from fuzzywuzzy import process
import math
import logging
import time
import threading
from urllib.parse import quote

# Setup comprehensive logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
# Enable CORS for all routes and origins
CORS(app, origins="*", methods=["GET", "POST", "OPTIONS"], allow_headers=["Content-Type", "Authorization"])

# Global cache variables
planet_names_cache = None
all_planets_cache = None
cache_timestamp = None
CACHE_DURATION = 300  # 5 minutes
loading_lock = threading.Lock()
is_loading = False

def is_cache_valid():
    global cache_timestamp
    if cache_timestamp is None:
        return False
    return (time.time() - cache_timestamp) < CACHE_DURATION

def update_cache_timestamp():
    global cache_timestamp
    cache_timestamp = time.time()

def make_nasa_request(query, timeout=120):
    """Make a robust request to NASA Exoplanet Archive with proper headers"""
    base_url = "https://exoplanetarchive.ipac.caltech.edu/TAP/sync"
    
    # Use form data instead of URL parameters for complex queries
    data = {
        "query": query,
        "format": "csv"
    }
    
    # Headers to mimic a real browser request
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Accept": "text/csv,application/csv,text/plain,*/*",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Cache-Control": "max-age=0"
    }
    
    try:
        logger.info(f"Making NASA API request with query length: {len(query)}")
        response = requests.post(
            base_url, 
            data=data, 
            headers=headers, 
            timeout=timeout,
            verify=True,
            allow_redirects=True
        )
        response.raise_for_status()
        logger.info(f"NASA API response received: {len(response.text)} characters")
        return response.text
    except requests.exceptions.Timeout:
        logger.error(f"NASA API request timed out after {timeout} seconds")
        raise
    except requests.exceptions.RequestException as e:
        logger.error(f"NASA API request failed: {e}")
        raise

def load_all_planets():
    """Load ALL planet data from NASA Exoplanet Archive with comprehensive fields"""
    global all_planets_cache, is_loading
    
    if all_planets_cache is not None and is_cache_valid():
        logger.info(f"Using cached planet data: {len(all_planets_cache)} planets")
        return all_planets_cache
    
    with loading_lock:
        if is_loading:
            logger.info("Another thread is already loading planets, waiting...")
            time.sleep(2)
            if all_planets_cache is not None:
                return all_planets_cache
        
        is_loading = True
        
        try:
            logger.info("Loading ALL planet data from NASA Exoplanet Archive...")
            
            # Comprehensive query to get all confirmed exoplanets with all available data
            query = """
            SELECT DISTINCT
                pl_name, pl_rade, pl_bmasse, pl_orbper, pl_eqt, pl_orbsmax, pl_orbeccen,
                pl_insol, pl_dens, pl_trandep, pl_tranmid, pl_controv_flag,
                st_teff, st_age, st_mass, st_dens, st_rad, st_spectype, st_lum, st_logg, st_met,
                sy_snum, sy_pnum, sy_mnum, sy_dist, sy_vmag, sy_kmag, sy_gaiamag,
                disc_year, discoverymethod, disc_locale, disc_facility, disc_telescope, 
                disc_instrument, disc_refname, disc_pubdate,
                ra, dec, glat, glon, elat, elon,
                pl_pubdate, releasedate, pl_nnotes,
                ttv_flag, ptv_flag, tran_flag, rv_flag, ast_flag, obm_flag, micro_flag, etv_flag, ima_flag, dkin_flag
            FROM pscomppars 
            WHERE pl_name IS NOT NULL 
            AND pl_controv_flag != 1
            ORDER BY disc_year DESC, pl_name ASC
            """
            
            csv_text = make_nasa_request(query, timeout=180)
            
            # Parse CSV with proper handling
            df = pd.read_csv(StringIO(csv_text), low_memory=False)
            logger.info(f"Successfully loaded {len(df)} planets from NASA")
            
            if df.empty:
                logger.error("No planet data received from NASA")
                return pd.DataFrame()
            
            # Clean and process the data
            logger.info("Processing planet data...")
            
            # Add calculated fields
            df['habitability_score'] = calculate_habitability_scores(df)
            df['in_habitable_zone'] = calculate_habitable_zone_status(df)
            df['orbital_distance_au'] = estimate_orbital_distance(df)
            
            # Clean up data types
            numeric_columns = [
                'pl_rade', 'pl_bmasse', 'pl_orbper', 'pl_eqt', 'pl_orbsmax', 'pl_orbeccen',
                'pl_insol', 'pl_dens', 'st_teff', 'st_age', 'st_mass', 'st_dens', 'st_rad',
                'sy_dist', 'disc_year', 'habitability_score', 'orbital_distance_au'
            ]
            
            for col in numeric_columns:
                if col in df.columns:
                    df[col] = pd.to_numeric(df[col], errors='coerce')
            
            all_planets_cache = df
            update_cache_timestamp()
            
            logger.info(f"Successfully processed and cached {len(df)} planets")
            logger.info(f"Sample planets: {df['pl_name'].head().tolist()}")
            
            return df
            
        except Exception as e:
            logger.error(f"Failed to load planet data: {e}")
            # Return empty DataFrame on error
            return pd.DataFrame()
        finally:
            is_loading = False

def calculate_habitability_scores(df):
    """Calculate comprehensive habitability scores for planets"""
    logger.info("Calculating habitability scores...")
    scores = []
    
    for _, row in df.iterrows():
        score = 0
        
        # Temperature factor (Earth-like ~288K)
        if pd.notna(row.get('pl_eqt')):
            temp = row['pl_eqt']
            if 200 <= temp <= 350:
                score += 35  # Optimal temperature range
            elif 150 <= temp <= 400:
                score += 20  # Acceptable range
            elif 100 <= temp <= 500:
                score += 10  # Marginal range
        elif pd.notna(row.get('st_teff')):
            # Estimate habitability from stellar temperature
            temp = row['st_teff']
            if 4000 <= temp <= 7000:
                score += 25  # Good stellar temperature
            elif 3000 <= temp <= 8000:
                score += 15  # Acceptable stellar temperature
        
        # Radius factor (Earth-like ~1.0)
        if pd.notna(row.get('pl_rade')):
            radius = row['pl_rade']
            if 0.8 <= radius <= 1.5:
                score += 25  # Earth-like size
            elif 0.5 <= radius <= 2.5:
                score += 15  # Reasonable size
            elif 0.3 <= radius <= 4.0:
                score += 8   # Possible but less ideal
        
        # Mass factor (Earth-like ~1.0)
        if pd.notna(row.get('pl_bmasse')):
            mass = row['pl_bmasse']
            if 0.5 <= mass <= 2.0:
                score += 25  # Earth-like mass
            elif 0.1 <= mass <= 10.0:
                score += 15  # Reasonable mass
            elif 0.05 <= mass <= 20.0:
                score += 8   # Possible but less ideal
        
        # Stellar type factor
        if pd.notna(row.get('st_teff')):
            st_temp = row['st_teff']
            if 5000 <= st_temp <= 6500:  # G-type stars (Sun-like)
                score += 15
            elif 3500 <= st_temp <= 5000:  # K-type stars
                score += 12
            elif 2500 <= st_temp <= 3500:  # M-type stars
                score += 8
            elif 6500 <= st_temp <= 7500:  # F-type stars
                score += 10
        
        scores.append(min(100, max(0, score)))
    
    logger.info(f"Calculated habitability scores for {len(scores)} planets")
    return scores

def calculate_habitable_zone_status(df):
    """Determine if planets are in habitable zone"""
    logger.info("Calculating habitable zone status...")
    status = []
    
    for _, row in df.iterrows():
        in_hz = False
        
        # Primary check: equilibrium temperature
        if pd.notna(row.get('pl_eqt')):
            temp = row['pl_eqt']
            if 200 <= temp <= 350:  # Conservative habitable zone
                in_hz = True
        
        # Secondary check: orbital distance and stellar properties
        elif pd.notna(row.get('pl_orbsmax')) and pd.notna(row.get('st_teff')):
            distance = row['pl_orbsmax']
            st_temp = row['st_teff']
            
            # Rough habitable zone calculation
            if st_temp >= 5000:  # Sun-like or hotter
                if 0.7 <= distance <= 1.5:
                    in_hz = True
            elif st_temp >= 4000:  # K-type stars
                if 0.3 <= distance <= 0.8:
                    in_hz = True
            elif st_temp >= 2500:  # M-type stars
                if 0.1 <= distance <= 0.4:
                    in_hz = True
        
        status.append(in_hz)
    
    logger.info(f"Calculated habitable zone status for {len(status)} planets")
    return status

def estimate_orbital_distance(df):
    """Estimate orbital distance from period using Kepler's 3rd law"""
    logger.info("Estimating orbital distances...")
    distances = []
    
    for _, row in df.iterrows():
        distance = None
        
        # Use direct measurement if available
        if pd.notna(row.get('pl_orbsmax')):
            distance = row['pl_orbsmax']
        # Calculate from orbital period
        elif pd.notna(row.get('pl_orbper')):
            period_years = row['pl_orbper'] / 365.25
            star_mass = row.get('st_mass', 1.0)  # Default to solar mass
            if pd.notna(star_mass) and star_mass > 0:
                # Kepler's 3rd law: a^3 = P^2 * M
                distance = (period_years**2 * star_mass)**(1/3)
            else:
                # Assume solar mass
                distance = period_years**(2/3)
        
        distances.append(distance)
    
    logger.info(f"Estimated orbital distances for {len(distances)} planets")
    return distances

def load_planet_names():
    """Load all planet names for search functionality"""
    global planet_names_cache
    
    if planet_names_cache is not None and is_cache_valid():
        return planet_names_cache
    
    try:
        logger.info("Loading planet names for search...")
        query = "SELECT DISTINCT pl_name FROM pscomppars WHERE pl_name IS NOT NULL ORDER BY pl_name"
        csv_text = make_nasa_request(query, timeout=60)
        df = pd.read_csv(StringIO(csv_text))
        planet_names_cache = df['pl_name'].dropna().unique().tolist()
        update_cache_timestamp()
        logger.info(f"Loaded {len(planet_names_cache)} planet names for search")
        return planet_names_cache
    except Exception as e:
        logger.error(f"Failed to load planet names: {e}")
        return []

@app.route('/api/health', methods=['GET', 'OPTIONS'])
def health_check():
    """Health check endpoint"""
    if request.method == 'OPTIONS':
        return '', 200
    
    logger.info("Health check requested")
    return jsonify({
        "status": "healthy", 
        "service": "Exoplanet Explorer API",
        "cache_valid": is_cache_valid(),
        "cached_planets": len(all_planets_cache) if all_planets_cache is not None else 0
    })

@app.route('/api/planets/all', methods=['GET', 'OPTIONS'])
def get_all_planets():
    """Get paginated list of all planets"""
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        page = max(1, int(request.args.get('page', 1)))
        per_page = min(int(request.args.get('per_page', 50)), 200)  # Max 200 per page
        
        logger.info(f"Fetching planets page {page}, per_page {per_page}")
        
        df = load_all_planets()
        if df.empty:
            logger.error("No planet data available")
            return jsonify({"error": "Failed to load planet data"}), 500
        
        total = len(df)
        total_pages = math.ceil(total / per_page)
        
        logger.info(f"Total planets: {total}, total pages: {total_pages}")
        
        # Calculate pagination
        start_idx = (page - 1) * per_page
        end_idx = start_idx + per_page
        
        # Get page data
        page_df = df.iloc[start_idx:end_idx]
        
        logger.info(f"Returning {len(page_df)} planets for page {page}")
        
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
        return jsonify({"error": f"Failed to fetch planets: {str(e)}"}), 500

@app.route('/api/planets/search', methods=['GET', 'OPTIONS'])
def search_planets():
    """Search for planets using fuzzy matching"""
    if request.method == 'OPTIONS':
        return '', 200
    
    query = request.args.get('q', '').strip()
    limit = min(int(request.args.get('limit', 10)), 50)
    
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
            if score >= 50  # Lower threshold for better results
        ]
        
        logger.info(f"Search for '{query}' returned {len(results)} results")
        return jsonify({"results": results})
    
    except Exception as e:
        logger.error(f"Search error: {e}")
        return jsonify({"error": "Search failed"}), 500

@app.route('/api/planets/<planet_name>', methods=['GET', 'OPTIONS'])
def get_planet_details(planet_name):
    """Get detailed information for a specific planet"""
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        df = load_all_planets()
        if df.empty:
            return jsonify({"error": "Planet database not available"}), 500
        
        # Find the planet
        planet_row = df[df['pl_name'] == planet_name]
        if planet_row.empty:
            return jsonify({"error": "Planet not found"}), 404
        
        # Convert to dictionary
        planet_dict = planet_row.iloc[0].to_dict()
        planet_dict = {k: (None if pd.isna(v) else v) for k, v in planet_dict.items()}
        
        return jsonify(planet_dict)
    
    except Exception as e:
        logger.error(f"Error fetching planet details: {e}")
        return jsonify({"error": "Failed to fetch planet details"}), 500

@app.route('/api/planets/stats', methods=['GET', 'OPTIONS'])
def get_planet_stats():
    """Get statistics about the planet database"""
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        df = load_all_planets()
        total_planets = len(df) if not df.empty else 0
        
        stats = {
            "total_planets": total_planets,
            "data_source": "NASA Exoplanet Archive",
            "last_updated": "Real-time",
            "cache_valid": is_cache_valid()
        }
        
        if not df.empty:
            stats.update({
                "high_habitability": len(df[df['habitability_score'] >= 50]),
                "in_habitable_zone": len(df[df['in_habitable_zone'] == True]),
                "discovery_methods": len(df['discoverymethod'].dropna().unique()),
                "latest_discovery": int(df['disc_year'].max()) if pd.notna(df['disc_year'].max()) else None
            })
        
        return jsonify(stats)
    
    except Exception as e:
        logger.error(f"Error fetching stats: {e}")
        return jsonify({"error": "Failed to fetch statistics"}), 500

@app.route('/api/cache/clear', methods=['POST', 'OPTIONS'])
def clear_cache():
    """Clear all caches"""
    if request.method == 'OPTIONS':
        return '', 200
    
    global planet_names_cache, all_planets_cache, cache_timestamp
    planet_names_cache = None
    all_planets_cache = None
    cache_timestamp = None
    logger.info("Cache cleared manually")
    return jsonify({"status": "Cache cleared"})

@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        response = jsonify()
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add('Access-Control-Allow-Headers', "*")
        response.headers.add('Access-Control-Allow-Methods', "*")
        return response

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

if __name__ == '__main__':
    logger.info("🚀 Starting Exoplanet Explorer API...")
    logger.info("🌟 Connecting to NASA Exoplanet Archive...")
    
    # Pre-load data in background
    def preload_data():
        logger.info("Pre-loading planet data...")
        load_all_planets()
        logger.info("Pre-loading complete!")
    
    # Start preloading in background thread
    preload_thread = threading.Thread(target=preload_data)
    preload_thread.daemon = True
    preload_thread.start()
    
    app.run(debug=False, host='0.0.0.0', port=5000, threaded=True)