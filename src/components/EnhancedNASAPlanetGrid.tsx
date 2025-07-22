import React, { useState, useEffect } from 'react';
import { Loader2, ChevronLeft, ChevronRight, Database, Globe, Zap, Search, Filter, Calendar, Telescope, Star, Thermometer, Weight, Ruler, Clock, Target, Activity, Droplets, Shield, Info } from 'lucide-react';
import { apiService, PlanetDetails } from '../services/api';

interface EnhancedNASAPlanetGridProps {
  onPlanetSelect: (planetName: string) => void;
}

export const EnhancedNASAPlanetGrid: React.FC<EnhancedNASAPlanetGridProps> = ({ onPlanetSelect }) => {
  const [planets, setPlanets] = useState<PlanetDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPlanets, setTotalPlanets] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [sortBy, setSortBy] = useState('discovery_year');
  const [statistics, setStatistics] = useState<any>(null);
  const [showLatest, setShowLatest] = useState(false);
  const [backendAvailable, setBackendAvailable] = useState(false);

  const planetsPerPage = 50;

  // Enhanced planet card component for NASA data
  const EnhancedPlanetCard: React.FC<{ planet: PlanetDetails; onClick: () => void }> = ({ planet, onClick }) => {
    const getTemperatureColor = (temp?: number) => {
      if (!temp) return 'from-gray-500 to-gray-300';
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

    const habitabilityScore = planet.habitability_score;
    const isInHabitableZone = planet.pl_eqt && planet.pl_eqt >= 200 && planet.pl_eqt <= 350;

    return (
      <div
        onClick={onClick}
        className="group cursor-pointer transform transition-all duration-500 hover:scale-105"
      >
        {/* Planet visualization */}
        <div className="relative w-20 h-20 mx-auto mb-4">
          <div
            className={`absolute inset-0 rounded-full bg-gradient-to-br ${getTemperatureColor(
              planet.pl_eqt || planet.st_teff
            )} shadow-xl animate-pulse group-hover:animate-none transition-all duration-500`}
            style={{
              boxShadow: `0 0 20px rgba(${(planet.pl_eqt || planet.st_teff || 0) < 280 ? '34, 197, 94' : '239, 68, 68'}, 0.3)`,
            }}
          />
          <div className="absolute inset-1 rounded-full bg-gradient-to-br from-transparent to-black/20" />
          
          {/* Orbital ring */}
          <div className="absolute -inset-6 border border-white/10 rounded-full animate-spin-slow" />
        </div>

        {/* Enhanced Planet info card */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 shadow-xl">
          <h3 className="text-lg font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors truncate">
            {planet.pl_name}
          </h3>
          
          {/* Primary Stats */}
          <div className="space-y-2 text-sm mb-4">
            {planet.orbital_distance_au && (
              <div className="flex items-center gap-2 text-gray-300">
                <Globe className="w-4 h-4 text-blue-400" />
                <span>{planet.orbital_distance_au.toFixed(2)} AU</span>
              </div>
            )}
            
            {planet.pl_orbper && (
              <div className="flex items-center gap-2 text-gray-300">
                <Clock className="w-4 h-4 text-green-400" />
                <span>{planet.pl_orbper.toFixed(1)} days</span>
              </div>
            )}
            
            {(planet.pl_eqt || planet.st_teff) && (
              <div className="flex items-center gap-2 text-gray-300">
                <Thermometer className="w-4 h-4 text-red-400" />
                <span>{(planet.pl_eqt || planet.st_teff)?.toFixed(0)}K</span>
              </div>
            )}
            
            {planet.discoverymethod && (
              <div className="flex items-center gap-2 text-gray-300">
                <Star className="w-4 h-4 text-yellow-400" />
                <span>{planet.discoverymethod}</span>
              </div>
            )}
          </div>

          {/* Physical Properties */}
          <div className="grid grid-cols-2 gap-2 text-xs mb-4">
            {planet.pl_rade && (
              <div className="flex items-center gap-1">
                <Ruler className="w-3 h-3 text-purple-400" />
                <span className="text-gray-400">R:</span>
                <span className="text-white">{planet.pl_rade.toFixed(1)}⊕</span>
              </div>
            )}
            
            {planet.pl_bmasse && (
              <div className="flex items-center gap-1">
                <Weight className="w-3 h-3 text-orange-400" />
                <span className="text-gray-400">M:</span>
                <span className="text-white">{planet.pl_bmasse.toFixed(1)}⊕</span>
              </div>
            )}
            
            {planet.disc_year && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-cyan-400" />
                <span className="text-gray-400">Disc:</span>
                <span className="text-white">{planet.disc_year}</span>
              </div>
            )}
            
            {planet.disc_facility && (
              <div className="flex items-center gap-1">
                <Telescope className="w-3 h-3 text-pink-400" />
                <span className="text-gray-400 truncate text-xs">
                  {planet.disc_facility.split(' ')[0]}
                </span>
              </div>
            )}
          </div>

          {/* Habitability Score */}
          <div className="pt-3 border-t border-white/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400">Habitability</span>
              <span className={`text-sm font-bold ${getHabitabilityColor(habitabilityScore)}`}>
                {habitabilityScore}/100
              </span>
            </div>
            
            <div className="w-full bg-gray-700 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full ${
                  habitabilityScore >= 70 ? 'bg-green-400' :
                  habitabilityScore >= 50 ? 'bg-yellow-400' :
                  habitabilityScore >= 25 ? 'bg-orange-400' : 'bg-red-400'
                }`}
                style={{ width: `${habitabilityScore}%` }}
              />
            </div>
          </div>

          {/* Special Indicators */}
          <div className="mt-3 flex flex-wrap gap-1">
            {isInHabitableZone && (
              <div className="flex items-center gap-1 px-2 py-1 bg-green-500/20 rounded-full border border-green-500/30">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-400 font-medium">HZ</span>
              </div>
            )}
          </div>

          {/* Discovery Info */}
          <div className="mt-2">
            <div className="text-xs text-gray-500 truncate">
              {planet.disc_locale && `${planet.disc_locale}`}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const loadPlanets = async (page: number) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log(`Loading NASA planets page ${page}...`);
      
      // Check if backend is available
      const isHealthy = await apiService.checkHealth();
      if (!isHealthy) {
        setBackendAvailable(false);
        setError('Backend service is starting up and loading NASA data. This may take 1-2 minutes...');
        setLoading(false);
        return;
      }
      
      setBackendAvailable(true);
      console.log('Backend is healthy, fetching planets...');
      const response = await apiService.getAllPlanets(page, 100); // Increase page size
      if (response) {
        console.log(`Loaded ${response.planets.length} planets for page ${page}`);
        console.log(`Total planets available: ${response.total}`);
        setPlanets(response.planets);
        setTotalPages(response.total_pages);
        setTotalPlanets(response.total);
        setCurrentPage(page);
        setError(null); // Clear any previous errors
      } else {
        setError('Failed to load planets from NASA Archive. The backend may still be loading data...');
      }
    } catch (err) {
      setError('Error connecting to NASA Exoplanet Archive. Please wait while the backend loads all 5900+ planets...');
      console.error('Error loading planets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    if (term.length >= 2) {
      setLoading(true);
      try {
        const results = await apiService.searchPlanets(term, planetsPerPage);
        // Convert search results to planet details format
        const planetDetails = await Promise.all(
          results.slice(0, planetsPerPage).map(async (result) => {
            const details = await apiService.getPlanetDetails(result.name);
            return details;
          })
        );
        const validPlanets = planetDetails.filter(p => p !== null) as PlanetDetails[];
        setPlanets(validPlanets);
        setTotalPlanets(validPlanets.length);
        setTotalPages(1);
        setCurrentPage(1);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    } else if (term.length === 0) {
      loadPlanets(1);
    }
  };

  useEffect(() => {
    loadPlanets(1);
  }, []);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && !loading && !searchTerm) {
      loadPlanets(page);
    }
  };

  if (loading && planets.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-300">🚀 Loading NASA Exoplanet Archive...</p>
          <p className="text-gray-500 text-sm mt-2">📡 Fetching all 5900+ confirmed exoplanets from NASA...</p>
          <p className="text-gray-400 text-xs mt-2">This may take 1-2 minutes on first load</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Database className={`w-12 h-12 mx-auto mb-4 ${backendAvailable ? 'text-red-400' : 'text-yellow-400'}`} />
          <p className={`mb-2 ${backendAvailable ? 'text-red-300' : 'text-yellow-300'}`}>
            {backendAvailable ? '⚠️ Error loading planets' : '🔄 Backend Loading NASA Data'}
          </p>
          <p className="text-gray-500 text-sm mb-4">{error}</p>
          {!backendAvailable && (
            <p className="text-gray-400 text-xs mb-4">
              🌟 The Flask backend is downloading all 5900+ exoplanets from NASA's servers...
            </p>
          )}
          <button
            onClick={() => loadPlanets(currentPage)}
            className={`px-4 py-2 text-white rounded-lg transition-colors ${
              backendAvailable 
                ? 'bg-cyan-600 hover:bg-cyan-700' 
                : 'bg-yellow-600 hover:bg-yellow-700'
            }`}
          >
            {backendAvailable ? '🔄 Try Again' : '⏳ Check Progress'}
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
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder={`Search from ${totalPlanets.toLocaleString()}+ NASA exoplanets...`}
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
            />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
            <div className="text-2xl font-bold text-cyan-400">
              {totalPlanets > 0 ? totalPlanets.toLocaleString() : '...'}
            </div>
            <div className="text-gray-400 text-sm">Total Planets</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
            <div className="text-2xl font-bold text-green-400">
              {planets.filter(p => p.habitability_score >= 50).length}
            </div>
            <div className="text-gray-400 text-sm">High Habitability</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
            <div className="text-2xl font-bold text-yellow-400">
              {planets.filter(p => p.in_habitable_zone).length}
            </div>
            <div className="text-gray-400 text-sm">In Habitable Zone</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
            <div className="text-2xl font-bold text-purple-400">
              {new Set(planets.map(p => p.discoverymethod).filter(Boolean)).size}
            </div>
            <div className="text-gray-400 text-sm">Discovery Methods</div>
          </div>
        </div>
      </div>

      {/* Stats Header */}
      <div className="mb-6 text-center">
        <p className="text-gray-300">
          {searchTerm ? `Search Results for "${searchTerm}"` : 'All NASA Exoplanets'} - 
          Showing {planets.length} {searchTerm ? 'results' : `of ${totalPlanets > 0 ? totalPlanets.toLocaleString() : '...'} planets`}
        </p>
        <p className="text-gray-500 text-sm">
          {!searchTerm && totalPages > 0 && `Page ${currentPage} of ${totalPages.toLocaleString()} • `}
          🛰️ Live NASA Exoplanet Archive Data
        </p>
      </div>

      {/* Enhanced Planet Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {planets.map((planet, index) => (
          <EnhancedPlanetCard
            key={`${planet.pl_name}-${index}`}
            planet={planet}
            onClick={() => onPlanetSelect(planet.pl_name)}
          />
        ))}
      </div>

      {/* Enhanced Pagination */}
      {totalPages > 1 && !searchTerm && (
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || loading}
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
                  disabled={loading}
                  className="px-3 py-2 rounded-lg bg-white/10 text-gray-300 hover:bg-white/20 transition-colors disabled:opacity-50"
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
                  disabled={loading}
                  className={`px-3 py-2 rounded-lg transition-colors disabled:opacity-50 ${
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
                  disabled={loading}
                  className="px-3 py-2 rounded-lg bg-white/10 text-gray-300 hover:bg-white/20 transition-colors disabled:opacity-50"
                >
                  {totalPages.toLocaleString()}
                </button>
              </>
            )}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || loading}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Reset Button */}
      {searchTerm && (
        <div className="flex justify-center mt-6">
          <button
            onClick={() => {
              setSearchTerm('');
              loadPlanets(1);
            }}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Show All Planets
          </button>
        </div>
      )}

      {/* Loading indicator for page changes */}
      {loading && planets.length > 0 && (
        <div className="flex items-center justify-center mt-4">
          <Loader2 className="w-6 h-6 text-cyan-400 animate-spin mr-2" />
          <span className="text-gray-300">Loading planets...</span>
        </div>
      )}

      {/* Data Source Info */}
      <div className="mt-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-900/20 border border-blue-500/30 rounded-lg">
          <Database className="w-4 h-4 text-blue-400" />
          <span className="text-blue-300 text-sm">
            Live NASA Exoplanet Archive - Real-time Data via Flask Backend
          </span>
        </div>
      </div>
    </div>
  );
};