import React, { useState, useEffect } from 'react';
import { 
  Globe, Clock, Thermometer, Star, Ruler, Weight, 
  Droplets, Shield, Calendar, Search, Filter, 
  ChevronLeft, ChevronRight, Loader2, Zap, Target, Info
} from 'lucide-react';
import { ProcessedNASAExoplanet } from '../data/nasaProcessedExoplanets';
import { processedNASALoader } from '../services/processedNasaLoader';
import { expandConstellationName, getConstellationInfo } from '../utils/constellationExpander';
import { generatePlanetBiosignatures, generateBiosignatureReport } from '../utils/biosignatureAnalysis';

interface BeautifulExoplanetGridProps {
  onPlanetSelect?: (planetName: string) => void;
}

export const BeautifulExoplanetGrid: React.FC<BeautifulExoplanetGridProps> = ({ onPlanetSelect }) => {
  const [planets, setPlanets] = useState<ProcessedNASAExoplanet[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPlanets, setFilteredPlanets] = useState<ProcessedNASAExoplanet[]>([]);
  const [selectedDiscoveryMethod, setSelectedDiscoveryMethod] = useState<string>('all');
  const [minYear, setMinYear] = useState(1990);
  const [maxYear, setMaxYear] = useState(2025);

  const planetsPerPage = 12; // Show 12 planets per page (3x4 grid)

  useEffect(() => {
    loadPlanets();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [planets, searchTerm, selectedDiscoveryMethod, minYear, maxYear]);

  const loadPlanets = async () => {
    try {
      setLoading(true);
      const allPlanets = await processedNASALoader.loadProcessedData();
      setPlanets(allPlanets);
      setTotalPages(Math.ceil(allPlanets.length / planetsPerPage));
    } catch (error) {
      console.error('Error loading planets:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = planets;

    // Search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(planet =>
        planet.planet_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        planet.host_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Discovery method filter
    if (selectedDiscoveryMethod !== 'all') {
      filtered = filtered.filter(planet =>
        planet.disc_method.toLowerCase() === selectedDiscoveryMethod.toLowerCase()
      );
    }

    // Year range filter
    filtered = filtered.filter(planet =>
      planet.disc_year >= minYear && planet.disc_year <= maxYear
    );

    setFilteredPlanets(filtered);
    setTotalPages(Math.ceil(filtered.length / planetsPerPage));
    setCurrentPage(1);
  };

  const getDiscoveryMethods = () => {
    const methods = new Set(planets.map(p => p.disc_method));
    return Array.from(methods).sort();
  };

  // Enhanced habitability score calculation based on apSameer1.py logic
  const calculateHabitabilityScore = (planet: ProcessedNASAExoplanet): number => {
    let score = 0;
    
    // Habitable zone factor (25 points)
    if (planet.habitable_zone_flag === 'habitable') {
      score += 25;
    } else if (planet.habitable_zone_flag === 'inner' || planet.habitable_zone_flag === 'outer') {
      score += 15;
    }
    
    // Radius factor (25 points) - Earth-like: 0.8-2.0 Earth radii
    if (planet.pl_rad_rearth) {
      if (planet.pl_rad_rearth >= 0.8 && planet.pl_rad_rearth <= 2.0) {
        score += 25;
      } else if (planet.pl_rad_rearth >= 0.5 && planet.pl_rad_rearth <= 3.0) {
        score += 15;
      } else if (planet.pl_rad_rearth >= 0.3 && planet.pl_rad_rearth <= 5.0) {
        score += 5;
      }
    }
    
    // Mass factor (20 points) - Earth-like: 0.5-5.0 Earth masses
    if (planet.pl_mass_mearth) {
      if (planet.pl_mass_mearth >= 0.5 && planet.pl_mass_mearth <= 5.0) {
        score += 20;
      } else if (planet.pl_mass_mearth >= 0.1 && planet.pl_mass_mearth <= 10.0) {
        score += 10;
      }
    }
    
    // Stellar temperature factor (20 points) - Optimal: 4000-7000K
    if (planet.st_teff_k) {
      if (planet.st_teff_k >= 4000 && planet.st_teff_k <= 7000) {
        score += 20;
      } else if (planet.st_teff_k >= 3000 && planet.st_teff_k <= 8000) {
        score += 10;
      }
    }
    
    // ESI bonus (10 points)
    if (planet.esi && planet.esi >= 0.7) {
      score += 10;
    } else if (planet.esi && planet.esi >= 0.5) {
      score += 5;
    }
    
    return Math.min(score, 100);
  };

  const getHabitabilityColor = (score: number) => {
    if (score >= 70) return 'from-green-500 to-emerald-500';
    if (score >= 50) return 'from-yellow-500 to-orange-500';
    if (score >= 30) return 'from-orange-500 to-red-500';
    return 'from-red-500 to-pink-500';
  };

  const getTemperatureColor = (temp?: number) => {
    if (!temp) return 'from-gray-500 to-gray-300';
    if (temp < 200) return 'from-blue-500 to-cyan-300';
    if (temp < 280) return 'from-green-500 to-emerald-300';
    if (temp < 350) return 'from-orange-500 to-yellow-300';
    return 'from-red-500 to-pink-300';
  };

  const getCurrentPagePlanets = () => {
    const startIndex = (currentPage - 1) * planetsPerPage;
    const endIndex = startIndex + planetsPerPage;
    return filteredPlanets.slice(startIndex, endIndex);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-cyan-400 animate-spin mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-2">Loading Exoplanet Data</h2>
          <p className="text-gray-400">Fetching 5,983+ confirmed exoplanets from NASA...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
              {/* Header with Stats */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            🪐 Exoplanet Hunting
          </h1>
          <p className="text-xl text-gray-300 mb-6">
            Discover and analyze {planets.length.toLocaleString()} confirmed exoplanets
          </p>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
            <div className="text-2xl font-bold text-blue-400">{planets.length.toLocaleString()}</div>
            <div className="text-sm text-gray-400">Total Planets</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
            <div className="text-2xl font-bold text-green-400">
              {planets.filter(p => p.habitable_zone_flag === 'habitable').length}
            </div>
            <div className="text-sm text-gray-400">Habitable Zone</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
            <div className="text-2xl font-bold text-purple-400">
              {planets.filter(p => p.esi && p.esi >= 0.7).length}
            </div>
            <div className="text-sm text-gray-400">High ESI (≥0.7)</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
            <div className="text-2xl font-bold text-orange-400">
              {planets.filter(p => p.has_stellar_data).length}
            </div>
            <div className="text-sm text-gray-400">With Stellar Data</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Planet or star name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Discovery Method</label>
            <select
              value={selectedDiscoveryMethod}
              onChange={(e) => setSelectedDiscoveryMethod(e.target.value)}
              className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="all">All Methods</option>
              {getDiscoveryMethods().map(method => (
                <option key={method} value={method}>{method}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Min Year</label>
            <input
              type="number"
              min="1990"
              max="2025"
              value={minYear}
              onChange={(e) => setMinYear(parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Max Year</label>
            <input
              type="number"
              min="1990"
              max="2025"
              value={maxYear}
              onChange={(e) => setMaxYear(parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
          
          <div className="flex items-end">
            <button
              onClick={applyFilters}
              className="w-full px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-medium rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Apply
            </button>
          </div>
        </div>
        
        <div className="mt-4 text-center text-sm text-gray-400">
          Showing {filteredPlanets.length.toLocaleString()} of {planets.length.toLocaleString()} planets
        </div>
      </div>

      {/* Exoplanet Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {getCurrentPagePlanets().map((planet, index) => {
          const habitabilityScore = calculateHabitabilityScore(planet);
          const isInHabitableZone = planet.habitable_zone_flag === 'habitable';
          
          return (
            <div
              key={index}
              onClick={() => onPlanetSelect?.(planet.planet_name)}
              className="group cursor-pointer transform transition-all duration-500 hover:scale-105"
            >
              {/* Planet Card */}
              <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500">
                
                {/* Planet Visualization */}
                <div className="relative w-20 h-20 mx-auto mb-4">
                  <div
                    className={`absolute inset-0 rounded-full bg-gradient-to-br ${getTemperatureColor(
                      planet.st_teff_k
                    )} shadow-xl animate-pulse group-hover:animate-none transition-all duration-500`}
                    style={{
                      boxShadow: `0 0 20px rgba(${(planet.st_teff_k || 0) < 280 ? '34, 197, 94' : '239, 68, 68'}, 0.3)`,
                    }}
                  />
                  <div className="absolute inset-1 rounded-full bg-gradient-to-br from-transparent to-black/20" />
                  
                  {/* Orbital ring */}
                  <div className="absolute -inset-6 border border-white/10 rounded-full animate-spin-slow" />
                  
                  {/* Habitable zone indicator */}
                  {isInHabitableZone && (
                    <div className="absolute -inset-8 border-2 border-green-400/50 rounded-full animate-pulse" />
                  )}
                </div>

                {/* Planet Name */}
                <div className="text-center mb-4">
                  <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                    {expandConstellationName(planet.planet_name)}
                  </h3>
                  {getConstellationInfo(planet.planet_name) && (
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <Info className="w-3 h-3 text-blue-400" />
                      <span className="text-xs text-blue-400">
                        {getConstellationInfo(planet.planet_name)?.fullName}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Physical Properties Grid */}
                <div className="space-y-3 mb-4">
                  {/* Host Star */}
                  <div className="flex items-center gap-2 text-sm">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span className="text-gray-300">Host:</span>
                    <span className="text-white font-medium truncate">{planet.host_name}</span>
                  </div>
                  
                  {/* Discovery Year */}
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-blue-400" />
                    <span className="text-gray-300">Discovered:</span>
                    <span className="text-white font-medium">{planet.disc_year}</span>
                  </div>
                  
                  {/* Orbital Period */}
                  {planet.pl_orbper_days && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-green-400" />
                      <span className="text-gray-300">Period:</span>
                      <span className="text-white font-medium">{planet.pl_orbper_days.toFixed(1)} days</span>
                    </div>
                  )}
                  
                  {/* Temperature */}
                  {planet.st_teff_k && (
                    <div className="flex items-center gap-2 text-sm">
                      <Thermometer className="w-4 h-4 text-red-400" />
                      <span className="text-gray-300">Temp:</span>
                      <span className="text-white font-medium">{planet.st_teff_k.toFixed(0)}K</span>
                    </div>
                  )}
                  
                  {/* Radius */}
                  {planet.pl_rad_rearth && (
                    <div className="flex items-center gap-2 text-sm">
                      <Ruler className="w-4 h-4 text-purple-400" />
                      <span className="text-gray-300">Radius:</span>
                      <span className="text-white font-medium">{planet.pl_rad_rearth.toFixed(1)}⊕</span>
                    </div>
                  )}
                  
                  {/* Mass */}
                  {planet.pl_mass_mearth && (
                    <div className="flex items-center gap-2 text-sm">
                      <Weight className="w-4 h-4 text-orange-400" />
                      <span className="text-gray-300">Mass:</span>
                      <span className="text-white font-medium">{planet.pl_mass_mearth.toFixed(1)}⊕</span>
                    </div>
                  )}
                  
                  {/* Discovery Method */}
                  <div className="flex items-center gap-2 text-sm">
                    <Target className="w-4 h-4 text-cyan-400" />
                    <span className="text-gray-300">Method:</span>
                    <span className="text-white font-medium capitalize">{planet.disc_method}</span>
                  </div>
                </div>

                {/* Habitability Score */}
                <div className="pt-4 border-t border-white/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-300">Habitability</span>
                    <span className="text-sm font-bold text-white">
                      {(() => {
                        try {
                          // Use the EXACT same calculation as BiosignaturePanel
                          const biosignatureInput = generatePlanetBiosignatures({
                            temperature: planet.st_teff_k || 0,
                            radius: planet.pl_rad_rearth || 0,
                            mass: planet.pl_mass_mearth || 0,
                            starType: 'G', // Default to G-type star
                            inHabitableZone: planet.habitable_zone_flag === 'habitable',
                            habitabilityScore: habitabilityScore
                          });
                          const biosignatureReport = generateBiosignatureReport(biosignatureInput);
                          return biosignatureReport['Habitability Score'].toFixed(1);
                        } catch (error) {
                          console.error('Biosignature calculation error:', error);
                          return habitabilityScore.toFixed(1); // Fallback to original score
                        }
                      })()}/100
                    </span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-white/20 rounded-full h-2 mb-2">
                    <div
                      className="h-2 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${(() => {
                          try {
                            // Use the EXACT same calculation as BiosignaturePanel
                            const biosignatureInput = generatePlanetBiosignatures({
                              temperature: planet.st_teff_k || 0,
                              radius: planet.pl_rad_rearth || 0,
                              mass: planet.pl_mass_mearth || 0,
                              starType: 'G',
                              inHabitableZone: planet.habitable_zone_flag === 'habitable',
                              habitabilityScore: habitabilityScore
                            });
                            const biosignatureReport = generateBiosignatureReport(biosignatureInput);
                            return biosignatureReport['Habitability Score'] || 0;
                          } catch (error) {
                            return habitabilityScore; // Fallback to original score
                          }
                        })()}%` 
                      }}
                    />
                  </div>
                  
                  {/* Habitability Indicators */}
                  <div className="flex flex-wrap gap-1">
                    {isInHabitableZone && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 rounded-full border border-green-500/30 text-xs text-green-400">
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                        Habitable Zone
                      </span>
                    )}
                    
                    {planet.esi && planet.esi >= 0.7 && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/20 rounded-full border border-blue-500/30 text-xs text-blue-400">
                        <Zap className="w-3 h-3" />
                        High ESI ({planet.esi.toFixed(2)})
                      </span>
                    )}
                    
                    {planet.habitable_zone_flag === 'inner' && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/20 rounded-full border border-red-500/30 text-xs text-red-400">
                        <Thermometer className="w-3 h-3" />
                        Inner Zone
                      </span>
                    )}
                    
                    {planet.habitable_zone_flag === 'outer' && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/20 rounded-full border border-blue-500/30 text-xs text-blue-400">
                        <Shield className="w-3 h-3" />
                        Outer Zone
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-300"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
          
          <span className="text-white">
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-300"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default BeautifulExoplanetGrid;
