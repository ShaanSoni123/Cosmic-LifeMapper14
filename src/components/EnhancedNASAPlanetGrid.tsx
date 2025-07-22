import React, { useState, useEffect } from 'react';
import { Loader2, ChevronLeft, ChevronRight, Database, Globe, Zap, Search, Filter, Calendar, Telescope, Star, Thermometer, Weight, Ruler, Clock, Target, Activity, Droplets, Shield, Info } from 'lucide-react';
import { directNasaService, DirectNASAExoplanet } from '../services/directNasaApi';

interface EnhancedNASAPlanetGridProps {
  onPlanetSelect: (planetName: string) => void;
}

export const EnhancedNASAPlanetGrid: React.FC<EnhancedNASAPlanetGridProps> = ({ onPlanetSelect }) => {
  const [planets, setPlanets] = useState<DirectNASAExoplanet[]>([]);
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

  const planetsPerPage = 50;

  // Enhanced planet card component
  const EnhancedPlanetCard: React.FC<{ planet: DirectNASAExoplanet; onClick: () => void }> = ({ planet, onClick }) => {
    const getTemperatureColor = (temp?: number) => {
      if (!temp) return 'from-gray-500 to-gray-300';
      if (temp < 200) return 'from-blue-500 to-cyan-300';
      if (temp < 280) return 'from-green-500 to-emerald-300';
      if (temp < 350) return 'from-orange-500 to-yellow-300';
      return 'from-red-500 to-pink-300';
    };

    const calculateHabitabilityScore = (planet: DirectNASAExoplanet): number => {
      let score = 0;
      
      // Temperature factor
      if (planet.pl_eqt) {
        const temp = planet.pl_eqt;
        if (temp >= 200 && temp <= 350) score += 30;
        else if (temp >= 150 && temp <= 400) score += 15;
      }
      
      // Radius factor
      if (planet.pl_rade) {
        const radius = planet.pl_rade;
        if (radius >= 0.5 && radius <= 2.0) score += 25;
        else if (radius >= 0.3 && radius <= 3.0) score += 15;
      }
      
      // Mass factor
      if (planet.pl_bmasse) {
        const mass = planet.pl_bmasse;
        if (mass >= 0.1 && mass <= 10.0) score += 25;
        else if (mass >= 0.05 && mass <= 20.0) score += 15;
      }
      
      // Stellar temperature factor
      if (planet.st_teff) {
        const stTemp = planet.st_teff;
        if (stTemp >= 3000 && stTemp <= 7000) score += 20;
      }
      
      return Math.min(100, score);
    };

    const getHabitabilityColor = (score: number) => {
      if (score >= 70) return 'text-green-400';
      if (score >= 50) return 'text-yellow-400';
      if (score >= 25) return 'text-orange-400';
      return 'text-red-400';
    };

    const habitabilityScore = planet.habitability_score || 0;
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
            {planet.sy_dist && (
              <div className="flex items-center gap-2 text-gray-300">
                <Globe className="w-4 h-4 text-blue-400" />
                <span>{planet.sy_dist.toFixed(1)} pc ({(planet.sy_dist * 3.26).toFixed(0)} ly)</span>
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

          {/* Advanced Properties */}
          {(planet.pl_orbsmax || planet.pl_orbeccen || planet.pl_insol) && (
            <div className="grid grid-cols-2 gap-2 text-xs mb-4 pt-2 border-t border-white/10">
              {planet.pl_orbsmax && (
                <div className="flex items-center gap-1">
                  <Target className="w-3 h-3 text-indigo-400" />
                  <span className="text-gray-400">a:</span>
                  <span className="text-white">{planet.pl_orbsmax.toFixed(2)} AU</span>
                </div>
              )}
              
              {planet.pl_orbeccen && (
                <div className="flex items-center gap-1">
                  <Activity className="w-3 h-3 text-emerald-400" />
                  <span className="text-gray-400">e:</span>
                  <span className="text-white">{planet.pl_orbeccen.toFixed(2)}</span>
                </div>
              )}
              
              {planet.pl_insol && (
                <div className="flex items-center gap-1">
                  <Droplets className="w-3 h-3 text-cyan-400" />
                  <span className="text-gray-400">S:</span>
                  <span className="text-white">{planet.pl_insol.toFixed(1)}⊕</span>
                </div>
              )}
              
              {planet.st_mass && (
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-400" />
                  <span className="text-gray-400">M*:</span>
                  <span className="text-white">{planet.st_mass.toFixed(1)}☉</span>
                </div>
              )}
            </div>
          )}

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
      const response = await directNasaService.getAllPlanets(page, planetsPerPage);
      setPlanets(response.planets);
      setTotalPages(response.total_pages);
      setTotalPlanets(response.total);
      setCurrentPage(page);
    } catch (err) {
      setError('Error connecting to NASA Exoplanet Archive');
      console.error('Error loading planets:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      // For now, calculate stats from loaded planets
      const stats = {
        total_planets: planets.length,
        total_systems: new Set(planets.map(p => p.pl_name?.split(' ')[0]).filter(Boolean)).size,
        discovery_methods: {},
        yearly_discoveries: {}
      };
      setStatistics(stats);
    } catch (err) {
      console.error('Error loading statistics:', err);
    }
  };

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    if (term.length >= 2) {
      setLoading(true);
      try {
        const results = await directNasaService.searchPlanets(term, planetsPerPage);
        setPlanets(results);
        setTotalPlanets(results.length);
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

  const showLatestDiscoveries = async () => {
    setLoading(true);
    setShowLatest(true);
    try {
      const latest = await directNasaService.getLatestDiscoveries(100);
      setPlanets(latest);
      setTotalPlanets(latest.length);
      setTotalPages(1);
      setCurrentPage(1);
    } catch (err) {
      console.error('Error loading latest discoveries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlanets(1);
  }, []);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && !loading && !searchTerm && !showLatest) {
      loadPlanets(page);
    }
  };

  if (loading && planets.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-300">Loading NASA Exoplanet Archive...</p>
          <p className="text-gray-500 text-sm mt-2">Accessing 5900+ confirmed exoplanets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Database className="w-12 h-12 text-red-400 mx-auto mb-4" />
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
          
          <button
            onClick={showLatestDiscoveries}
            className="px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            Latest Discoveries
          </button>
        </div>

        {/* Quick Stats */}
        {statistics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
              <div className="text-2xl font-bold text-cyan-400">{statistics.total_planets.toLocaleString()}</div>
              <div className="text-gray-400 text-sm">Total Planets</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
              <div className="text-2xl font-bold text-green-400">{statistics.total_systems.toLocaleString()}</div>
              <div className="text-gray-400 text-sm">Star Systems</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
              <div className="text-2xl font-bold text-yellow-400">
                {Object.keys(statistics.discovery_methods).length}
              </div>
              <div className="text-gray-400 text-sm">Discovery Methods</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
              <div className="text-2xl font-bold text-purple-400">
                {Math.max(...Object.keys(statistics.yearly_discoveries).map(Number))}
              </div>
              <div className="text-gray-400 text-sm">Latest Discovery Year</div>
            </div>
          </div>
        )}
      </div>

      {/* Stats Header */}
      <div className="mb-6 text-center">
        <p className="text-gray-300">
          {showLatest ? 'Latest Discoveries' : searchTerm ? `Search Results for "${searchTerm}"` : 'All NASA Exoplanets'} - 
          Showing {planets.length} {searchTerm || showLatest ? 'results' : `of ${totalPlanets.toLocaleString()} planets`}
        </p>
        <p className="text-gray-500 text-sm">
          {!searchTerm && !showLatest && `Page ${currentPage} of ${totalPages.toLocaleString()} • `}
          Real-time NASA Exoplanet Archive Data
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
      {totalPages > 1 && !searchTerm && !showLatest && (
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
      {(searchTerm || showLatest) && (
        <div className="flex justify-center mt-6">
          <button
            onClick={() => {
              setSearchTerm('');
              setShowLatest(false);
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
            Live NASA Exoplanet Archive - Updated Daily with Latest Discoveries
          </span>
        </div>
      </div>
    </div>
  );
};