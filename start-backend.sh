#!/bin/bash

echo "🚀 Starting Exoplanet Explorer Backend..."
echo "=" * 50

# Navigate to backend directory
cd backend

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 is not installed. Please install Python3 first."
    echo "💡 Try: sudo apt install python3 python3-pip (Ubuntu/Debian)"
    echo "💡 Try: brew install python3 (macOS)"
    exit 1
fi

# Check if pip is available
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 is not installed. Please install pip3 first."
    echo "💡 Installing pip..."
    python3 -m ensurepip --upgrade
    exit 1
fi

# Upgrade pip first
echo "📦 Upgrading pip..."
python3 -m pip install --upgrade pip

# Install core requirements
echo "📦 Installing Python dependencies..."
python3 -m pip install Flask==2.3.3
python3 -m pip install Flask-CORS==4.0.0
python3 -m pip install pandas==2.1.1
python3 -m pip install requests==2.31.0
python3 -m pip install numpy==1.24.3

echo "📦 Installing fuzzy search dependencies..."
python3 -m pip install fuzzywuzzy==0.18.0

echo "📦 Installing Levenshtein (trying multiple versions)..."
python3 -m pip install python-Levenshtein==0.21.1 || \
python3 -m pip install Levenshtein==0.20.9 || \
python3 -m pip install python-Levenshtein || \
echo "⚠️ Levenshtein install failed, fuzzy search may be slower"

echo "📦 Installing machine learning dependencies..."
python3 -m pip install scikit-learn==1.3.0

echo "✅ All dependencies installed successfully!"
echo ""
echo "🧪 Testing dependencies..."
python3 -c "
import sys
missing = []
try:
    import pandas
    print('✅ pandas: OK')
except ImportError:
    missing.append('pandas')
    print('❌ pandas: MISSING')

try:
    import requests
    print('✅ requests: OK')
except ImportError:
    missing.append('requests')
    print('❌ requests: MISSING')

try:
    from fuzzywuzzy import process
    print('✅ fuzzywuzzy: OK')
except ImportError:
    missing.append('fuzzywuzzy')
    print('❌ fuzzywuzzy: MISSING')

try:
    import Levenshtein
    print('✅ python-Levenshtein: OK')
except ImportError:
    print('⚠️ python-Levenshtein: MISSING (fuzzy search will be slower)')

if missing:
    print(f'❌ Missing: {missing}')
    sys.exit(1)
else:
    print('✅ All core dependencies working!')
"

if [ $? -ne 0 ]; then
    echo "❌ Dependency test failed. Please check the installation."
    exit 1
fi

echo ""
echo "🌟 Starting Flask backend on http://localhost:5000..."
echo "🌍 The backend will connect to NASA Exoplanet Archive and load 5900+ planets..."
echo "⏳ This may take 1-2 minutes on first startup..."
echo ""
echo "🌟 Starting Flask backend on http://localhost:5000..."
python3 app.py