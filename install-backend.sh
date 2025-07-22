#!/bin/bash

echo "🔧 Installing Python Dependencies for Exoplanet Explorer..."

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 is not installed. Please install Python3 first."
    echo "💡 Try: sudo apt install python3 python3-pip (Ubuntu/Debian)"
    echo "💡 Try: brew install python3 (macOS)"
    exit 1
fi

# Check if pip is available
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 is not installed. Installing pip..."
    python3 -m ensurepip --upgrade
fi

echo "📦 Upgrading pip..."
python3 -m pip install --upgrade pip

echo "📦 Installing core dependencies..."
python3 -m pip install Flask==2.3.3
python3 -m pip install Flask-CORS==4.0.0
python3 -m pip install pandas==2.1.1
python3 -m pip install requests==2.31.0
python3 -m pip install numpy==1.24.3

echo "📦 Installing fuzzy search dependencies..."
python3 -m pip install fuzzywuzzy==0.18.0

echo "📦 Installing Levenshtein (trying multiple versions)..."
python3 -m pip install python-Levenshtein==0.12.2 || \
python3 -m pip install Levenshtein==0.20.9 || \
python3 -m pip install python-Levenshtein || \
echo "⚠️ Levenshtein install failed, fuzzy search may be slower"

echo "📦 Installing machine learning dependencies..."
python3 -m pip install scikit-learn==1.3.0

echo "✅ All dependencies installed successfully!"
echo "🚀 Starting Flask backend..."

cd backend
python3 app.py