#!/usr/bin/env python3
"""
Test script for NASA Exoplanet Data Ingestion Pipeline
Tests basic functionality without running the full pipeline
"""

import sys
import os
import requests
import pandas as pd
from io import StringIO
from typing import Dict, Any

def test_nasa_api_connection():
    """Test connection to NASA Exoplanet Archive API."""
    print("🔗 Testing NASA API connection...")
    
    try:
        url = "https://exoplanetarchive.ipac.caltech.edu/TAP/sync?query=SELECT+pl_name,hostname,discoverymethod,disc_year,pl_orbper,pl_rade,pl_masse,st_teff,st_rad,st_mass+FROM+pscomppars&format=csv&limit=10"
        
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        
        print(f"✅ API connection successful: {response.status_code}")
        print(f"📄 Response size: {len(response.text)} characters")
        
        # Test CSV parsing
        try:
            df = pd.read_csv(StringIO(response.text))
            print(f"✅ CSV parsing successful: {len(df)} rows, {len(df.columns)} columns")
            print(f"📊 Sample columns: {list(df.columns)[:5]}")
            print(f"🪐 Sample data:")
            print(df.head(3).to_string())
            return True
        except Exception as e:
            print(f"❌ CSV parsing failed: {e}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ API connection failed: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

def test_dependencies():
    """Test if all required dependencies are available."""
    print("\n📦 Testing dependencies...")
    
    required_packages = [
        'requests',
        'pandas', 
        'numpy',
        'logging'
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package)
            print(f"✅ {package}: Available")
        except ImportError:
            print(f"❌ {package}: Missing")
            missing_packages.append(package)
    
    if missing_packages:
        print(f"\n⚠️  Missing packages: {', '.join(missing_packages)}")
        print("Install with: pip install " + " ".join(missing_packages))
        return False
    
    print("✅ All required packages available")
    return True

def test_data_processing():
    """Test basic data processing functionality."""
    print("\n🔧 Testing data processing...")
    
    try:
        # Create sample data
        sample_data = {
            'pl_name': ['Kepler-22b', 'Proxima Centauri b', 'TRAPPIST-1e'],
            'hostname': ['Kepler-22', 'Proxima Centauri', 'TRAPPIST-1'],
            'discoverymethod': ['Transit', 'Radial Velocity', 'Transit'],
            'disc_year': [2011, 2016, 2017],
            'pl_orbper': [289.9, 11.2, 6.1],
            'pl_rade': [2.4, 1.1, 0.92],
            'pl_masse': [5.4, 1.3, 0.77],
            'st_teff': [5518, 3042, 2559],
            'st_rad': [0.979, 0.141, 0.121],
            'st_mass': [0.97, 0.122, 0.089]
        }
        
        df = pd.DataFrame(sample_data)
        print(f"✅ Sample data created: {len(df)} rows")
        
        # Test column mapping
        column_mapping = {
            'pl_name': 'planet_name',
            'hostname': 'host_name',
            'discoverymethod': 'disc_method',
            'disc_year': 'disc_year',
            'pl_orbper': 'pl_orbper_days',
            'pl_rade': 'pl_rad_rearth',
            'pl_masse': 'pl_mass_mearth',
            'st_teff': 'st_teff_k',
            'st_rad': 'st_rad_rsun',
            'st_mass': 'st_mass_msun'
        }
        
        df_mapped = df.rename(columns=column_mapping)
        print(f"✅ Column mapping successful: {list(df_mapped.columns)}")
        
        # Test derived fields
        EARTH_TO_JUPITER_MASS = 317.828
        EARTH_TO_JUPITER_RADIUS = 11.209
        
        df_mapped['pl_mass_mjup'] = df_mapped['pl_mass_mearth'] / EARTH_TO_JUPITER_MASS
        df_mapped['pl_rad_rjup'] = df_mapped['pl_rad_rearth'] / EARTH_TO_JUPITER_RADIUS
        
        print(f"✅ Derived fields calculated: Jupiter mass and radius")
        print(f"📊 Sample derived values:")
        print(df_mapped[['planet_name', 'pl_mass_mearth', 'pl_mass_mjup', 'pl_rad_rearth', 'pl_rad_rjup']].to_string())
        
        return True
        
    except Exception as e:
        print(f"❌ Data processing test failed: {e}")
        return False

def test_file_output():
    """Test file output functionality."""
    print("\n💾 Testing file output...")
    
    try:
        # Create test output directory
        output_dir = "../public"
        os.makedirs(output_dir, exist_ok=True)
        
        # Create sample processed data
        sample_processed = {
            'planet_name': ['Kepler-22b', 'Proxima Centauri b'],
            'host_name': ['Kepler-22', 'Proxima Centauri'],
            'disc_method': ['transit', 'radial velocity'],
            'disc_year': [2011, 2016],
            'pl_orbper_days': [289.9, 11.2],
            'pl_rad_rearth': [2.4, 1.1],
            'pl_mass_mearth': [5.4, 1.3],
            'pl_mass_mjup': [0.017, 0.004],
            'pl_rad_rjup': [0.214, 0.098],
            'has_mass': [True, True],
            'has_radius': [True, True],
            'has_stellar_data': [True, True]
        }
        
        df_processed = pd.DataFrame(sample_processed)
        
        # Save to CSV
        output_path = f"{output_dir}/test_nasa_output.csv"
        df_processed.to_csv(output_path, index=False, encoding='utf-8')
        
        print(f"✅ Test file saved: {output_path}")
        print(f"📄 File size: {os.path.getsize(output_path)} bytes")
        
        # Verify file can be read back
        df_readback = pd.read_csv(output_path)
        print(f"✅ File readback successful: {len(df_readback)} rows")
        
        # Clean up test file
        os.remove(output_path)
        print("✅ Test file cleaned up")
        
        return True
        
    except Exception as e:
        print(f"❌ File output test failed: {e}")
        return False

def main():
    """Run all tests."""
    print("🧪 NASA Exoplanet Data Ingestion Pipeline - Test Suite")
    print("=" * 60)
    
    tests = [
        ("Dependencies", test_dependencies),
        ("NASA API Connection", test_nasa_api_connection),
        ("Data Processing", test_data_processing),
        ("File Output", test_file_output)
    ]
    
    results = []
    
    for test_name, test_func in tests:
        try:
            success = test_func()
            results.append((test_name, success))
        except Exception as e:
            print(f"❌ {test_name} test crashed: {e}")
            results.append((test_name, False))
    
    # Summary
    print("\n" + "=" * 60)
    print("📋 TEST SUMMARY")
    print("=" * 60)
    
    passed = 0
    total = len(results)
    
    for test_name, success in results:
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if success:
            passed += 1
    
    print(f"\n📊 Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Ready to run the full pipeline.")
        return 0
    else:
        print("⚠️  Some tests failed. Please fix issues before running the full pipeline.")
        return 1

if __name__ == "__main__":
    exit(main())
