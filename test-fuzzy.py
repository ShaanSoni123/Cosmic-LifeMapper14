#!/usr/bin/env python3
"""
Quick test script to verify fuzzywuzzy and NASA API are working
"""

import sys
import os

def test_imports():
    """Test all required imports"""
    print("🧪 Testing Python imports...")
    
    try:
        import pandas as pd
        print("✅ pandas imported successfully")
    except ImportError as e:
        print(f"❌ pandas import failed: {e}")
        return False
    
    try:
        import requests
        print("✅ requests imported successfully")
    except ImportError as e:
        print(f"❌ requests import failed: {e}")
        return False
    
    try:
        from fuzzywuzzy import process
        print("✅ fuzzywuzzy imported successfully")
    except ImportError as e:
        print(f"❌ fuzzywuzzy import failed: {e}")
        return False
    
    try:
        import Levenshtein
        print("✅ python-Levenshtein imported successfully (fast fuzzy search enabled)")
    except ImportError:
        print("⚠️ python-Levenshtein not available (fuzzy search will be slower but still work)")
    
    return True

def test_nasa_connection():
    """Test connection to NASA Exoplanet Archive"""
    print("\n🌌 Testing NASA Exoplanet Archive connection...")
    
    try:
        import requests
        import pandas as pd
        from io import StringIO
        
        base_url = "https://exoplanetarchive.ipac.caltech.edu/TAP/sync"
        query = "SELECT DISTINCT pl_name FROM pscomppars WHERE pl_name IS NOT NULL ORDER BY pl_name LIMIT 10"
        data = {"query": query, "format": "csv"}
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Accept": "text/csv,application/csv,text/plain,*/*",
        }
        
        print("📡 Connecting to NASA API...")
        response = requests.post(base_url, data=data, headers=headers, timeout=30)
        response.raise_for_status()
        
        df = pd.read_csv(StringIO(response.text))
        planet_names = df['pl_name'].dropna().tolist()
        
        print(f"✅ Successfully connected to NASA API!")
        print(f"📊 Retrieved {len(planet_names)} sample planet names:")
        for i, name in enumerate(planet_names[:5]):
            print(f"   {i+1}. {name}")
        if len(planet_names) > 5:
            print(f"   ... and {len(planet_names) - 5} more")
        
        return True
        
    except Exception as e:
        print(f"❌ NASA API connection failed: {e}")
        return False

def test_fuzzy_search():
    """Test fuzzy search functionality"""
    print("\n🔍 Testing fuzzy search...")
    
    try:
        from fuzzywuzzy import process
        
        # Sample planet names for testing
        planet_names = [
            "Kepler-22b", "Proxima Centauri b", "TRAPPIST-1e", 
            "Gliese 667 Cc", "HD 40307g", "Kepler-186f"
        ]
        
        test_query = "kepler"
        matches = process.extract(test_query, planet_names, limit=3)
        
        print(f"🎯 Searching for '{test_query}' in sample planet list...")
        print("📋 Results:")
        for i, (name, score) in enumerate(matches):
            print(f"   {i+1}. {name} (Match: {score}%)")
        
        print("✅ Fuzzy search working correctly!")
        return True
        
    except Exception as e:
        print(f"❌ Fuzzy search test failed: {e}")
        return False

def main():
    print("🚀 NASA Exoplanet Backend Test Suite")
    print("=" * 50)
    
    # Test imports
    if not test_imports():
        print("\n❌ Import tests failed. Please install missing dependencies:")
        print("pip3 install pandas requests fuzzywuzzy python-Levenshtein")
        return False
    
    # Test NASA connection
    if not test_nasa_connection():
        print("\n❌ NASA API connection failed. Check your internet connection.")
        return False
    
    # Test fuzzy search
    if not test_fuzzy_search():
        print("\n❌ Fuzzy search test failed.")
        return False
    
    print("\n" + "=" * 50)
    print("🎉 All tests passed! Your NASA exoplanet backend is ready!")
    print("✅ You can now run:")
    print("   • python3 backend/fuzzywuzzy.py  (interactive planet search)")
    print("   • python3 backend/app.py         (start Flask API server)")
    print("   • ./start-backend.sh             (automated setup and start)")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)