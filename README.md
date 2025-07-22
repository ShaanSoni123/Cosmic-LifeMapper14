# Cosmic LifeMapper - NASA Exoplanet Explorer

## Features
A comprehensive exoplanet exploration application that provides access to 5900+ confirmed exoplanets from NASA's Exoplanet Archive with advanced habitability analysis.
- **Live NASA Data**: Real-time access to NASA Exoplanet Archive
- **Advanced Search**: Fuzzy search across planet names and discovery facilities
- **Habitability Analysis**: Scientific scoring based on multiple factors
- **Interactive Visualization**: Beautiful planet cards with orbital animations
- **Comprehensive Data**: Physical properties, discovery information, and more
## Quick Start
### 1. Start the Backend (Required for NASA data)
```bash
# Make the script executable
chmod +x start-backend.sh
# Start the Flask backend
./start-backend.sh
```
The backend will:
- Install Python dependencies
- Connect to NASA Exoplanet Archive
- Start serving on http://localhost:5000
### 2. Start the Frontend
```bash
# Install dependencies
npm install
# Start the development server
npm run dev
```
## Architecture
### Backend (Flask)
- **Direct NASA API Integration**: Fetches real-time data from NASA Exoplanet Archive
- **Intelligent Caching**: 5-minute cache to reduce API calls
- **Fuzzy Search**: Advanced planet name matching
- **Habitability Scoring**: Scientific analysis of planet characteristics
### Frontend (React + TypeScript)
- **Dual Data Sources**: NASA Archive + Curated dataset
- **Advanced UI**: Interactive planet cards with animations
- **Real-time Search**: Instant search across 5900+ planets
- **Responsive Design**: Works on all devices
## Troubleshooting
### Backend Issues
1. **Python Dependencies**: Ensure Python 3.7+ and pip are installed
2. **Network**: Backend needs internet access to reach NASA APIs
3. **Port Conflicts**: Backend runs on port 5000 by default
### Frontend Issues
1. **Backend Connection**: Ensure backend is running on localhost:5000
2. **CORS**: Backend handles CORS automatically
3. **Loading Issues**: Check browser console for errors
## Data Sources
- **NASA Exoplanet Archive**: Primary source for confirmed exoplanets
- **Curated Dataset**: Hand-picked planets with detailed analysis
- **Real-time Updates**: Data refreshed every 5 minutes
## Scientific Methodology
The habitability scoring system considers:
- **Temperature Range**: Optimal for liquid water
- **Planet Size**: Earth-like radius and mass
- **Stellar Properties**: Star type and age
- **Orbital Characteristics**: Distance and eccentricity
## Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request
## License
MIT License - See LICENSE file for details