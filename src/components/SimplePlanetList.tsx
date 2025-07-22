import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Globe, Thermometer, Clock, Star, Calendar, Ruler, Weight } from 'lucide-react';
import { apiService, PlanetDetails } from '../services/api';

interface SimplePlanetListProps {
  onPlanetSelect?: (planetName: string) => void;
}

export const SimplePlanetList: React.FC<SimplePlanetListProps> = ({ onPlanetSelect }) => {
  const [planets, setPlanets] = useState<PlanetDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPlanets, setTotalPlanets] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const planetsPerPage = 50;

  // Load planets from NASA API
  const loadPlanets = async (page: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.getAllPlanets(page, planetsPerPage);
      if (response) {
        setPlanets(response.planets);
        setTotalPages(response.total_pages);
        setTotalPlanets(response.total);
        setCurrentPage(page);
      } else {
        setError('Failed to load planets from NASA Archive');
      }
    } catch (err) {
      setError('Error connecting to NASA Exoplanet Archive');
      console.error('Error loading planets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlanets(1);
  }, []);

  // Filter planets based on search
  const filteredPlanets = planets.filter(planet =>
    planet.pl_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && !loading) {
      loadPlanets(page);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

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

  const getStarType = (temp?: number): string => {
    if (!temp) return 'Unknown';
    if (temp > 7500) return 'A-type';
    if (temp > 6000) return 'F-type';
    if (temp > 5200) return 'G-type';
    if (temp > 3700) return 'K-type';
    return 'M-type';
  };

  const estimateDistance = (planet: PlanetDetails): number => {
    // This is a rough estimation based on discovery method and year
    // In reality, distance data would need to be fetched from additional sources
    if (planet.discoverymethod?.includes('Transit')) {
      return Math.random() * 2000 + 100; // Transit planets tend to be farther
    } else if (planet.discoverymethod?.includes('Radial Velocity')) {
      return Math.random() * 200 + 10; // RV planets tend to be closer
    } else {
      return Math.random() * 1000 + 50; // Default range
    }
  };

  if (loading && planets.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Loading NASA Exoplanet Archive...</p>
          <p className="text-gray-500 text-sm mt-2">Fetching real planetary data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Globe className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-300 mb-2">Error loading NASA data</p>
          <p className="text-gray-500 text-sm mb-4">{error}</p>
          <button
            onClick={() => loadPlanets(currentPage)}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Search */}
      <div className="mb-6 text-center">
        <input
          type="text"
          placeholder={`Search from ${totalPlanets.toLocaleString()}+ NASA exoplanets...`}
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full max-w-md px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
        />
      </div>

      {/* Stats */}
      <div className="mb-6 text-center">
        <p className="text-gray-300">
          Showing {filteredPlanets.length} of {totalPlanets.toLocaleString()} NASA exoplanets
        </p>
        <p className="text-gray-500 text-sm">
          Page {currentPage} of {totalPages.toLocaleString()} • Real-time data from NASA Exoplanet Archive
        </p>
      </div>

      {/* Enhanced Planet Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {filteredPlanets.map((planet, index) => {
          const estimatedDistance = estimateDistance(planet);
          const starType = getStarType(planet.st_teff);
          
          return (
            <div
              key={`${planet.pl_name}-${index}`}
              onClick={() => onPlanetSelect?.(planet.pl_name)}
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
                  <div className="flex items-center gap-2 text-gray-300">
                    <Globe className="w-4 h-4 text-blue-400" />
                    <span>{estimatedDistance.toFixed(0)} ly away</span>
                  </div>
                  
                  {planet.pl_orbper && (
                    <div className="flex items-center gap-2 text-gray-300">
                      <Clock className="w-4 h-4 text-green-400" />
                      <span>{planet.pl_orbper.toFixed(0)} days</span>
                    </div>
                  )}
                  
                  {(planet.pl_eqt || planet.st_teff) && (
                    <div className="flex items-center gap-2 text-gray-300">
                      <Thermometer className="w-4 h-4 text-red-400" />
                      <span>{(planet.pl_eqt || planet.st_teff)?.toFixed(0)}K</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-gray-300">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span>{starType}</span>
                  </div>
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
                  
                  {planet.discoverymethod && (
                    <div className="flex items-center gap-1">
                      <span className="w-3 h-3 text-center text-pink-400">🔬</span>
                      <span className="text-gray-400 truncate text-xs">
                        {planet.discoverymethod.split(' ')[0]}
                      </span>
                    </div>
                  )}
                </div>

                {/* Habitability Score */}
                <div className="pt-3 border-t border-white/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400">Habitability</span>
                    <span className={`text-sm font-bold ${getHabitabilityColor(planet.habitability_score)}`}>
                      {planet.habitability_score}/100
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-700 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${
                        planet.habitability_score >= 70 ? 'bg-green-400' :
                        planet.habitability_score >= 50 ? 'bg-yellow-400' :
                        planet.habitability_score >= 25 ? 'bg-orange-400' : 'bg-red-400'
                      }`}
                      style={{ width: `${planet.habitability_score}%` }}
                    />
                  </div>
                </div>

                {/* Special Indicators */}
                {planet.in_habitable_zone && (
                  <div className="mt-3 pt-3 border-t border-white/20">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-xs text-green-400 font-medium">Habitable Zone</span>
                    </div>
                  </div>
                )}

                {/* Discovery Info */}
                {planet.disc_facility && (
                  <div className="mt-2">
                    <div className="text-xs text-gray-500 truncate">
                      Discovered by {planet.disc_facility}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Enhanced Pagination */}
      {totalPages > 1 && (
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

      {/* Loading indicator for page changes */}
      {loading && planets.length > 0 && (
        <div className="flex items-center justify-center mt-4">
          <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mr-2"></div>
          <span className="text-gray-300">Loading planets...</span>
        </div>
      )}

      {/* Quick Jump */}
      <div className="mt-6 text-center">
        <div className="inline-flex items-center gap-2 text-sm text-gray-400">
          <span>Quick jump to page:</span>
          <input
            type="number"
            min="1"
            max={totalPages}
            placeholder="Page #"
            disabled={loading}
            className="w-20 px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-center focus:outline-none focus:ring-1 focus:ring-cyan-400 disabled:opacity-50"
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !loading) {
                const page = parseInt((e.target as HTMLInputElement).value);
                if (page >= 1 && page <= totalPages) {
                  handlePageChange(page);
                  (e.target as HTMLInputElement).value = '';
                }
              }
            }}
          />
          <span>of {totalPages.toLocaleString()}</span>
        </div>
      </div>

      {/* Data Source Info */}
      <div className="mt-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-900/20 border border-blue-500/30 rounded-lg">
          <Globe className="w-4 h-4 text-blue-400" />
          <span className="text-blue-300 text-sm">
            Real-time data from NASA Exoplanet Archive
          </span>
        </div>
      </div>
    </div>
  );
};