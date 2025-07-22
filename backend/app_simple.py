#!/usr/bin/env python3
"""
Simplified Flask backend for NASA Exoplanet data
Handles CORS and provides API endpoints for exoplanet data
"""

try:
    from flask import Flask, request, jsonify
    from flask_cors import CORS
    import requests
    import json
    import time
    import threading
    from urllib.parse import quote
    import logging
    print("✅ Core imports successful")
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("🔧 Installing missing packages...")
    import subprocess
    import sys
    subprocess.check_call([sys.executable, "-m", "pip", "install", "flask", "flask-cors", "requests"])
    from flask import Flask, request, jsonify
    from flask_cors import CORS
    import requests
    import json

# Try to import pandas, use fallback if not available
try:
    import pandas as pd
    HAS_PANDAS = True
    print("✅ Pandas available")
except ImportError:
    HAS_PANDAS = False
    print("⚠️ Pandas not available, using basic CSV parsing")

# Try to import fuzzywuzzy, use fallback if not available
try:
    from fuzzywuzzy import process
    HAS_FUZZYWUZZY = True
    print("✅ FuzzyWuzzy available")
except ImportError:
    HAS_FUZZYWUZZY = False
    print("⚠️ FuzzyWuzzy not available, using basic string matching")

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, origins="*", methods=["GET", "POST", "OPTIONS"], allow_headers=["Content-Type", "Authorization"])

# Global cache
planets_cache = None
cache_timestamp = None
CACHE_DURATION = 300  # 5 minutes

def is_cache_valid():
    global cache_timestamp
    if cache_timestamp is None:
        return False
    return (time.time() - cache_timestamp) < CACHE_DURATION

def parse_csv_simple(csv_text):
    """Simple CSV parser without pandas"""
    lines = csv_text.strip().split('\n')
    if len(lines) < 2:
        return []
    
    headers = [h.strip().strip('"') for h in lines[0].split(',')]
    planets = []
    
    for line in lines[1:]:
        values = [v.strip().strip('"') for v in line.split(',')]
        if len(values) >= len(headers):
            planet = {}
            for i, header in enumerate(headers):
                if i < len(values):
                    value = values[i]
                    # Try to convert to number
                    if value and value != 'null' and value != '':
                        try:
                            if '.' in value:
                                planet[header] = float(value)
                            else:
                                planet[header] = int(value)
                        except ValueError:
                            planet[header] = value
                    else:
                        planet[header] = None
            if planet.get('pl_name'):
                planets.append(planet)
    
    return planets

def make_nasa_request(query, timeout=120):
    """Make request to NASA API with proper headers"""
    base_url = "https://exoplanetarchive.ipac.caltech.edu/TAP/sync"
    
    data = {
        "query": query,
        "format": "csv"
    }
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "text/csv,application/csv,text/plain,*/*",
        "Accept-Language": "en-US,en;q=0.9",
        "Connection": "keep-alive",
    }
    
    try:
        logger.info(f"Making NASA API request...")
        response = requests.post(base_url, data=data, headers=headers, timeout=timeout)
        response.raise_for_status()
        logger.info(f"NASA API response received: {len(response.text)} characters")
        return response.text
    except Exception as e:
        logger.error(f"NASA API request failed: {e}")
        raise

def calculate_habitability_score(planet):
    """Calculate basic habitability score"""
    score = 0
    
    # Temperature factor
    temp = planet.get('pl_eqt') or planet.get('st_teff')
    if temp:
        if 200 <= temp <= 350:
            score += 35
        elif 150 <= temp <= 400:
            score += 20
    
    # Radius factor
    radius = planet.get('pl_rade')
    if radius:
        if 0.8 <= radius <= 1.5:
            score += 25
        elif 0.5 <= radius <= 2.5:
            score += 15
    
    # Mass factor
    mass = planet.get('pl_bmasse')
    if mass:
        if 0.5 <= mass <= 2.0:
            score += 25
        elif 0.1 <= mass <= 10.0:
            score += 15
    
    # Stellar temperature factor
    st_temp = planet.get('st_teff')
    if st_temp:
        if 5000 <= st_temp <= 6500:
            score += 15
        elif 3500 <= st_temp <= 5000:
            score += 12
    
    return min(100, max(0, score))

def load_all_planets():
    """Load all planets from NASA"""
    global planets_cache, cache_timestamp
    
    if planets_cache and is_cache_valid():
        logger.info(f"Using cached data: {len(planets_cache)} planets")
        return planets_cache
    
    try:
        logger.info("Loading planets from NASA Exoplanet Archive...")
        
        query = """
        SELECT DISTINCT
            pl_name, pl_rade, pl_bmasse, pl_orbper, pl_eqt, pl_orbsmax,
            st_teff, st_age, st_mass, st_rad, sy_dist,
            disc_year, discoverymethod, disc_facility
        FROM pscomppars 
        WHERE pl_name IS NOT NULL 
        ORDER BY disc_year DESC, pl_name ASC
        """
        
        csv_text = make_nasa_request(query, timeout=180)
        
        # Parse CSV
        if HAS_PANDAS:
            import io
            df = pd.read_csv(io.StringIO(csv_text), low_memory=False)
            planets = df.to_dict('records')
        else:
            planets = parse_csv_simple(csv_text)
        
        logger.info(f"Loaded {len(planets)} planets from NASA")
        
        # Add calculated fields
        for planet in planets:
            planet['habitability_score'] = calculate_habitability_score(planet)
            planet['in_habitable_zone'] = bool(planet.get('pl_eqt') and 200 <= planet['pl_eqt'] <= 350)
        
        planets_cache = planets
        cache_timestamp = time.time()
        
        logger.info(f"Successfully cached {len(planets)} planets")
        return planets
        
    except Exception as e:
        logger.error(f"Failed to load planets: {e}")
        return []

@app.route('/api/health', methods=['GET', 'OPTIONS'])
def health_check():
    if request.method == 'OPTIONS':
        return '', 200
    
    return jsonify({
        "status": "healthy",
        "service": "NASA Exoplanet API",
        "cached_planets": len(planets_cache) if planets_cache else 0,
        "cache_valid": is_cache_valid()
    })

@app.route('/api/planets/all', methods=['GET', 'OPTIONS'])
def get_all_planets():
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        page = max(1, int(request.args.get('page', 1)))
        per_page = min(int(request.args.get('per_page', 50)), 200)
        
        planets = load_all_planets()
        if not planets:
            return jsonify({"error": "No planet data available"}), 500
        
        total = len(planets)
        total_pages = (total + per_page - 1) // per_page
        
        start_idx = (page - 1) * per_page
        end_idx = start_idx + per_page
        page_planets = planets[start_idx:end_idx]
        
        logger.info(f"Returning {len(page_planets)} planets for page {page}")
        
        return jsonify({
            "planets": page_planets,
            "total": total,
            "page": page,
            "per_page": per_page,
            "total_pages": total_pages
        })
    
    except Exception as e:
        logger.error(f"Error in get_all_planets: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/planets/search', methods=['GET', 'OPTIONS'])
def search_planets():
    if request.method == 'OPTIONS':
        return '', 200
    
    query = request.args.get('q', '').strip().lower()
    limit = min(int(request.args.get('limit', 10)), 50)
    
    if len(query) < 2:
        return jsonify({"results": []})
    
    try:
        planets = load_all_planets()
        if not planets:
            return jsonify({"results": []})
        
        planet_names = [p['pl_name'] for p in planets if p.get('pl_name')]
        
        if HAS_FUZZYWUZZY:
            matches = process.extract(query, planet_names, limit=limit)
            results = [{"name": name, "match_score": score} for name, score in matches if score >= 50]
        else:
            # Simple string matching fallback
            results = []
            for name in planet_names:
                if query in name.lower():
                    results.append({"name": name, "match_score": 100})
                elif any(word in name.lower() for word in query.split()):
                    results.append({"name": name, "match_score": 75})
            results = results[:limit]
        
        return jsonify({"results": results})
    
    except Exception as e:
        logger.error(f"Search error: {e}")
        return jsonify({"results": []})

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
    print("🚀 Starting NASA Exoplanet Explorer API...")
    print("🌟 Loading exoplanet data in background...")
    
    # Preload data in background
    def preload():
        load_all_planets()
        print("✅ Exoplanet data loaded!")
    
    thread = threading.Thread(target=preload)
    thread.daemon = True
    thread.start()
    
    print("🌐 Server starting on http://localhost:5000")
    app.run(debug=False, host='0.0.0.0', port=5000, threaded=True)