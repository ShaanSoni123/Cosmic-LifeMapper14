import React, { useState, useEffect } from 'react';
import { Loader2, ChevronLeft, ChevronRight, Database, Globe, Zap, Search, Filter, Calendar, Telescope, Star, Thermometer, Weight, Ruler, Clock, Target, Activity, Droplets, Shield, Info } from 'lucide-react';
import { csvLoader } from '../services/csvLoader';
import { ExtendedExoplanet } from '../utils/exoplanetAnalysis';

interface CSVPlanetGridProps {
  onPlanetSelect: (planet: ExtendedExoplanet) => void;
}

export const CSVPlanetGrid: React.FC<CSVPlanetGridProps> = ({ onPlanetSelect }) => {
  const [planets, setPlanets] = useState<ExtendedExoplanet[]>([]);
  const [filteredPlanets, setFilteredPlanets] = useState<ExtendedExoplanet[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [filterBy, setFilterBy] = useState('all');
  const [error, setError] = useState<string | null>(null);

  const planetsPerPage = 50;

  // Enhanced planet card component for CSV data
  const CSVPlanetCard: React.FC<{ planet: ExtendedExoplanet; onClick: () => void }> = ({ planet, onClick }) => {
    const getTemperatureColor = (temp: number) => {
      if (temp < 200) return 'from-blue-500 to-cyan-300';
      if (temp < 280) return 'from-green-500 to-emerald-300';
      if (temp < 350) return 'from-orange-500 to-yellow-300';
      return 'from-red-500 to-pink-300';
    };

    const getHabitabilityColor = (score: number) => {
      if (score >= 70) return 'text-green-400';
      if (score >= 50) return 'text-yellow-400';
      if (score >= 25) return 'text-orange-400';
      return 'text-red-400';
    };

    return (
      <div
        onClick={onClick}
        className="group cursor-pointer transform transition-all duration-500 hover:scale-105"
      >
        {/* Planet visualization */}
        <div className="relative w-20 h-20 mx-auto mb-4">
          <div
            className={`absolute inset-0 rounded-full bg-gradient-to-br ${getTemperatureColor(
              planet.temperature
            )} shadow-xl animate-pulse group-hover:animate-none transition-all duration-500`}
            style={{
              boxShadow: `0 0 20px rgba(${planet.temperature < 280 ? '34, 197, 94' : '239, 68, 68'}, 0.3)`,
            }}
          />
          <div className="absolute inset-1 rounded-full bg-gradient-to-br from-transparent to-black/20" />
          
          {/* Orbital rings */}
          <div className="absolute -inset-6 border border-white/10 rounded-full animate-spin-slow" />
          <div className="absolute -inset-8 border border-white/5 rounded-full animate-spin-reverse" />
        </div>

        {/* Enhanced Planet info card */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 shadow-xl">
          <h3 className="text-lg font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors truncate">
            {planet.name}
          </h3>
          
          {/* Primary Stats */}
          <div className="space-y-2 text-sm mb-4">
            <div className="flex items-center gap-2 text-gray-300">
              <Globe className="w-4 h-4 text-blue-400" />
              <span>{planet.distanceFromEarth.toFixed(1)} ly</span>
            </div>
            
            <div className="flex items-center gap-2 text-gray-300">
              <Clock className="w-4 h-4 text-green-400" />
              <span>{planet.orbitalPeriod.toFixed(1)} days</span>
            </div>
            
            <div className="flex items-center gap-2 text-gray-300">
              <Thermometer className="w-4 h-4 text-red-400" />
              <span>{planet.temperature.toFixed(0)}K</span>
            </div>
            
            <div className="flex items-center gap-2 text-gray-300">
              <Star className="w-4 h-4 text-yellow-400" />
              <span>{planet.starType}</span>
            </div>
          </div>

          {/* Physical Properties */}
          <div className="grid grid-cols-2 gap-2 text-xs mb-4">
            <div className="flex items-center gap-1">
              <Ruler className="w-3 h-3 text-purple-400" />
              <span className="text-gray-400">R:</span>
              <span className="text-white">{planet.radius.toFixed(1)}⊕</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Weight className="w-3 h-3 text-orange-400" />
              <span className="text-gray-400">M:</span>
              <span className="text-white">{planet.mass.toFixed(1)}⊕</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-cyan-400" />
              <span className="text-gray-400">Disc:</span>
              <span className="text-white">{planet.discoveryYear}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Activity className="w-3 h-3 text-pink-400" />
              <span className="text-gray-400">Grav:</span>
              <span className="text-white">{planet.surfaceGravity.toFixed(1)}g</span>
            </div>
          </div>

          {/* Habitability Score */}
          <div className="pt-3 border-t border-white/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400">Habitability</span>
              <span className={`text-sm font-bold ${getHabitabilityColor(planet.habitabilityScore)}`}>
                {planet.habitabilityScore.toFixed(1)}/100
              </span>
            </div>
            
            <div className="w-full bg-gray-700 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full transition-all duration-1000 ${
                  planet.habitabilityScore >= 70 ? 'bg-green-400' :
                  planet.habitabilityScore >= 50 ? 'bg-yellow-400' :
                  planet.habitabilityScore >= 25 ? 'bg-orange-400' : 'bg-red-400'
                }`}
                style={{ width: `${planet.habitabilityScore}%` }}
              />
            </div>
          </div>

          {/* Special Indicators */}
          <div className="mt-3 flex flex-wrap gap-1">
            {planet.inHabitableZone && (
              <div className="flex items-center gap-1 px-2 py-1 bg-green-500/20 rounded-full border border-green-500/30">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-400 font-medium">HZ</span>
              </div>
            )}
            
            {planet.biosignatures.length > 0 && (
              <div className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 rounded-full border border-blue-500/30">
                <Zap className="w-3 h-3 text-blue-400" />
                <span className="text-xs text-blue-400 font-medium">{planet.biosignatures.length}</span>
              </div>
            )}
            
            {planet.waterRetentionPotential > 0.7 && (
              <div className="flex items-center gap-1 px-2 py-1 bg-cyan-500/20 rounded-full border border-cyan-500/30">
                <Droplets className="w-3 h-3 text-cyan-400" />
                <span className="text-xs text-cyan-400 font-medium">H₂O</span>
              </div>
            )}
          </div>

          {/* Constellation */}
          <div className="mt-2">
            <div className="text-xs text-gray-500 truncate">
              {planet.constellation} constellation
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Load CSV data
  useEffect(() => {
    const loadCSVData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('Loading CSV exoplanet data...');
        const csvPlanets = await csvLoader.loadCSVData();
        
        if (csvPlanets.length === 0) {
          setError('No exoplanet data found in CSV file');
          return;
        }

        // Convert to ExtendedExoplanet format with enhanced data
        const extendedPlanets: ExtendedExoplanet[] = csvPlanets.map((planet, index) => ({
          ...planet,
          surfaceTemperature: planet.temperature,
          surfaceGravity: planet.mass / Math.pow(planet.radius, 2),
          waterRetentionPotential: Math.min(1, planet.habitabilityScore / 10),
          radiationHazardIndex: Math.max(0, 1 - planet.habitabilityScore / 10),
          cluster: getCluster(planet.habitabilityScore),
          clusterLabel: getClusterLabel(planet.habitabilityScore),
          inHabitableZone: planet.temperature >= 200 && planet.temperature <= 350
        }));

        setPlanets(extendedPlanets);
        setFilteredPlanets(extendedPlanets);
        console.log(`Successfully loaded ${extendedPlanets.length} exoplanets from CSV`);
      } catch (err) {
        console.error('Error loading CSV data:', err);
        setError('Failed to load exoplanet data from CSV file');
      } finally {
        setLoading(false);
      }
    };

    loadCSVData();
  }, []);

  // Filter and search functionality
  useEffect(() => {
    let filtered = planets.filter(planet => {
      const matchesSearch = planet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           planet.constellation.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           planet.starType.toLowerCase().includes(searchTerm.toLowerCase());
      
      switch (filterBy) {
        case 'high-habitability':
          return matchesSearch && planet.habitabilityScore >= 5;
        case 'with-biosignatures':
          return matchesSearch && planet.biosignatures.length > 0;
        case 'nearby':
          return matchesSearch && planet.distanceFromEarth < 50;
        case 'in-habitable-zone':
          return matchesSearch && planet.inHabitableZone;
        case 'earth-like':
          return matchesSearch && planet.radius >= 0.8 && planet.radius <= 1.5 && planet.mass >= 0.5 && planet.mass <= 2.0;
        default:
          return matchesSearch;
      }
    });

    // Sort planets
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'distance':
          return a.distanceFromEarth - b.distanceFromEarth;
        case 'habitability':
          return b.habitabilityScore - a.habitabilityScore;
        case 'temperature':
          return a.temperature - b.temperature;
        case 'discovery':
          return b.discoveryYear - a.discoveryYear;
        case 'size':
          return b.radius - a.radius;
        default:
          return 0;
      }
    });

    setFilteredPlanets(filtered);
    setCurrentPage(1);
  }, [planets, searchTerm, sortBy, filterBy]);

  const getCluster = (score: number): number => {
    if (score >= 7) return 0;
    if (score >= 5) return 1;
    if (score >= 3) return 2;
    return 3;
  };

  const getClusterLabel = (score: number): string => {
    if (score >= 7) return "Very High Habitability Potential";
    if (score >= 5) return "Moderate to High Habitability Potential";
    if (score >= 3) return "Low Habitability Potential";
    return "Very Low Habitability Potential";
  };

  // Pagination
  const totalPages = Math.ceil(filteredPlanets.length / planetsPerPage);
  const startIndex = (currentPage - 1) * planetsPerPage;
  const endIndex = startIndex + planetsPerPage;
  const paginatedPlanets = filteredPlanets.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-300">Loading Complete CSV Exoplanet Database...</p>
          <p className="text-gray-500 text-sm mt-2">Processing 5,900+ confirmed exoplanets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Database className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-300 mb-2">Error Loading CSV Data</p>
          <p className="text-gray-500 text-sm mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Enhanced Controls */}
      <div className="mb-6 space-y-4">
        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder={`Search from ${planets.length.toLocaleString()}+ CSV exoplanets...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent appearance-none cursor-pointer"
            >
              <option value="name" className="bg-gray-800">Name</option>
              <option value="distance" className="bg-gray-800">Distance</option>
              <option value="habitability" className="bg-gray-800">Habitability</option>
              <option value="temperature" className="bg-gray-800">Temperature</option>
              <option value="discovery" className="bg-gray-800">Discovery Year</option>
              <option value="size" className="bg-gray-800">Size</option>
            </select>
            
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent appearance-none cursor-pointer"
            >
              <option value="all" className="bg-gray-800">All Planets</option>
              <option value="high-habitability" className="bg-gray-800">High Habitability</option>
              <option value="with-biosignatures" className="bg-gray-800">With Biosignatures</option>
              <option value="nearby" className="bg-gray-800">Nearby (&lt;50 ly)</option>
              <option value="in-habitable-zone" className="bg-gray-800">In Habitable Zone</option>
              <option value="earth-like" className="bg-gray-800">Earth-like</option>
            </select>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
            <div className="text-2xl font-bold text-cyan-400">{planets.length.toLocaleString()}</div>
            <div className="text-gray-400 text-sm">Total Planets</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
            <div className="text-2xl font-bold text-green-400">
              {planets.filter(p => p.habitabilityScore >= 5).length}
            </div>
            <div className="text-gray-400 text-sm">High Habitability</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
            <div className="text-2xl font-bold text-yellow-400">
              {planets.filter(p => p.inHabitableZone).length}
            </div>
            <div className="text-gray-400 text-sm">In Habitable Zone</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
            <div className="text-2xl font-bold text-purple-400">
              {planets.filter(p => p.biosignatures.length > 0).length}
            </div>
            <div className="text-gray-400 text-sm">With Biosignatures</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
            <div className="text-2xl font-bold text-orange-400">
              {planets.filter(p => p.distanceFromEarth < 50).length}
            </div>
            <div className="text-gray-400 text-sm">Nearby (&lt;50ly)</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
            <div className="text-2xl font-bold text-pink-400">
              {planets.filter(p => p.radius >= 0.8 && p.radius <= 1.5).length}
            </div>
            <div className="text-gray-400 text-sm">Earth-like Size</div>
          </div>
        </div>
      </div>

      {/* Stats Header */}
      <div className="mb-6 text-center">
        <p className="text-gray-300">
          {searchTerm || filterBy !== 'all' ? `Filtered Results: ${filteredPlanets.length.toLocaleString()} planets` : `All CSV Exoplanets: ${planets.length.toLocaleString()} planets`}
        </p>
        <p className="text-gray-500 text-sm">
          {totalPages > 1 && `Page ${currentPage} of ${totalPages.toLocaleString()} • `}
          Complete CSV Database with Enhanced Analysis
        </p>
      </div>

      {/* Enhanced Planet Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {paginatedPlanets.map((planet, index) => (
          <CSVPlanetCard
            key={`${planet.id}-${index}`}
            planet={planet}
            onClick={() => onPlanetSelect(planet)}
          />
        ))}
      </div>

      {/* Enhanced Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <div className="flex items-center gap-2">
            {/* Show first page */}
            {currentPage > 3 && (
              <>
                <button
                  onClick={() => handlePageChange(1)}
                  className="px-3 py-2 rounded-lg bg-white/10 text-gray-300 hover:bg-white/20 transition-colors"
                >
                  1
                </button>
                {currentPage > 4 && <span className="text-gray-500">...</span>}
              </>
            )}

            {/* Show pages around current page */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
              if (page > totalPages) return null;
              
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    page === currentPage
                      ? 'bg-cyan-600 text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  {page.toLocaleString()}
                </button>
              );
            })}

            {/* Show last page */}
            {currentPage < totalPages - 2 && (
              <>
                {currentPage < totalPages - 3 && <span className="text-gray-500">...</span>}
                <button
                  onClick={() => handlePageChange(totalPages)}
                  className="px-3 py-2 rounded-lg bg-white/10 text-gray-300 hover:bg-white/20 transition-colors"
                >
                  {totalPages.toLocaleString()}
                </button>
              </>
            )}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Data Source Info */}
      <div className="mt-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-900/20 border border-green-500/30 rounded-lg">
          <Database className="w-4 h-4 text-green-400" />
          <span className="text-green-300 text-sm">
            Complete CSV Database - {planets.length.toLocaleString()} Exoplanets with Full Scientific Data
          </span>
        </div>
      </div>
    </div>
  );
};