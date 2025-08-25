# Cosmic LifeMapper - NASA Exoplanet Explorer

## Features
A comprehensive exoplanet exploration application that provides access to **6000+ confirmed exoplanets** from NASA's Exoplanet Archive with advanced habitability analysis.
- **Live NASA Data**: Real-time access to NASA Exoplanet Archive with 6000+ planets
- **Advanced Search**: Fuzzy search across planet names, discovery facilities, and methods
- **Habitability Analysis**: Scientific scoring based on multiple factors (temperature, size, mass, insolation)
- **Interactive Visualization**: Beautiful planet cards with orbital animations
- **Comprehensive Data**: Physical properties, discovery information, and scientific metadata
- **Discovery Methods**: Filter by transit, radial velocity, imaging, and other detection methods
- **Potentially Habitable**: Special filtering for planets in the habitable zone

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
- **Intelligent Caching**: 5-minute cache to reduce API calls and improve performance
- **Advanced Search**: Multi-field search across planet properties
- **Habitability Scoring**: Scientific analysis based on temperature, radius, mass, and insolation
- **Discovery Method Analysis**: Categorization by detection techniques

### Frontend (React + TypeScript)
- **NASA Archive Integration**: Direct access to 6000+ confirmed exoplanets
- **Advanced UI**: Interactive planet cards with real-time data
- **Real-time Search**: Instant search across all NASA planets
- **Responsive Design**: Works on all devices
- **Pagination**: Efficient loading of large datasets
- **Specialized Views**: Latest discoveries, potentially habitable planets, method-based filtering

## Data Sources
- **NASA Exoplanet Archive**: Primary source for 6000+ confirmed exoplanets
- **Real-time Updates**: Data refreshed every 5 minutes
- **Comprehensive Coverage**: All confirmed exoplanets with complete metadata
- **Scientific Accuracy**: Data directly from NASA's authoritative database

## Scientific Methodology
The habitability scoring system considers:
- **Temperature Range**: Optimal for liquid water (200-350K)
- **Planet Size**: Earth-like radius (0.8-2.0 Earth radii)
- **Mass Range**: Suitable for atmosphere retention (0.5-5.0 Earth masses)
- **Insolation**: Habitable zone positioning (0.3-1.5 Earth insolation)
- **Stellar Properties**: Star type, age, and stability
- **Orbital Characteristics**: Distance and eccentricity

## Discovery Methods Supported
- **Transit**: Planets detected by dimming of host star
- **Radial Velocity**: Planets detected by star wobble
- **Imaging**: Direct observation of planets
- **Microlensing**: Gravitational lensing effects
- **Timing**: Variations in transit timing
- **Astrometry**: Precise star position measurements

## Troubleshooting
### Backend Issues
1. **Python Dependencies**: Ensure Python 3.7+ and pip are installed
2. **Network**: Backend needs internet access to reach NASA APIs
3. **Port Conflicts**: Backend runs on port 5000 by default
4. **API Limits**: NASA API has rate limits; caching helps mitigate this

### Frontend Issues
1. **Backend Connection**: Ensure backend is running on localhost:5000
2. **CORS**: Backend handles CORS automatically
3. **Loading Issues**: Check browser console for errors
4. **Large Datasets**: 6000+ planets may take time to load initially

## Performance Features
- **Smart Caching**: Reduces API calls and improves load times
- **Pagination**: Loads planets in manageable chunks
- **Lazy Loading**: Only fetches data when needed
- **Optimized Queries**: Efficient NASA API queries for better performance

## Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly with the NASA API
5. Submit a pull request

## License
MIT License - See LICENSE file for details