import React, { useState, useEffect } from 'react';
import { Loader2, ChevronLeft, ChevronRight, Database, Globe, Zap, Search, Calendar, Telescope, Star, Thermometer, Weight, Ruler, Clock, Target, Activity, Droplets, Shield } from 'lucide-react';
import { nasaExoplanets, NASAExoplanet } from '../data/nasaExoplanets';
import { HabitabilityBar } from './HabitabilityBar';

interface DirectNASAPlanetGridProps {
  onPlanetSelect: (planetName: string) => void;
}

export const DirectNASAPlanetGrid: React.FC<DirectNASAPlanetGridProps> = ({ onPlanetSelect }) => {
  const [planets, setPlanets] = useState<NASAExoplanet[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPlanets, setTotalPlanets] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPlanets, setFilteredPlanets] = useState<NASAExoplanet[]>([]);

  const planetsPerPage = 50;

  // Enhanced planet card component
  const DirectPlanetCard: React.FC<{ planet: NASAExoplanet; onClick: () => void }> = ({ planet, onClick }) => {
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

    const habitabilityScore = planet.habitability_score || 0;
    const isInHabitableZone = planet.inHabitableZone || false;

    return (
      <div
        onClick={onClick}
        className="group cursor-pointer transform transition-all duration-500 hover:scale-105"
      >
        {/* Planet visualization */}
        <div className="relative w-20 h-20 mx-auto mb-4">
          <div
            className={`absolute inset-0 rounded-full bg-gradient-to-br ${getTemperatureColor(
              planet.temperature || planet.stellarTemperature
            )} shadow-xl animate-pulse group-hover:animate-none transition-all duration-500`}
            style={{
              boxShadow: `0 0 20px rgba(${(planet.temperature || planet.stellarTemperature || 0) < 280 ? '34, 197, 94' : '239, 68, 68'}, 0.3)`,
            }}
          />
          <div className="absolute inset-1 rounded-full bg-gradient-to-br from-transparent to-black/20" />
          
          {/* Orbital ring */}
          <div className="absolute -inset-6 border border-white/10 rounded-full animate-spin-slow" />
        </div>

        {/* Enhanced Planet info card */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 shadow-xl">
          <h3 className="text-lg font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors truncate">
            {planet.name}
          </h3>
          
          {/* Primary Stats */}
          <div className="space-y-2 text-sm mb-4">
            {planet.distanceFromEarth && (
              <div className="flex items-center gap-2 text-gray-300">
                <Globe className="w-4 h-4 text-blue-400" />
                <span>{planet.distanceFromEarth.toFixed(1)} ly</span>
              </div>
            )}
            
            {planet.orbitalPeriod && (
              <div className="flex items-center gap-2 text-gray-300">
                <Clock className="w-4 h-4 text-green-400" />
                <span>{planet.orbitalPeriod.toFixed(1)} days</span>
              </div>
            )}
            
            {(planet.temperature || planet.stellarTemperature) && (
              <div className="flex items-center gap-2 text-gray-300">
                <Thermometer className="w-4 h-4 text-red-400" />
                <span>{(planet.temperature || planet.stellarTemperature)?.toFixed(0)}K</span>
              </div>
            )}
            
            {planet.discoveryFacility && (
              <div className="flex items-center gap-2 text-gray-300">
                <Telescope className="w-4 h-4 text-purple-400" />
                <span className="truncate text-xs">{planet.discoveryFacility}</span>
              </div>
            )}
          </div>

          {/* Physical Properties */}
          <div className="grid grid-cols-2 gap-2 text-xs mb-4">
            {planet.radius && (
              <div className="flex items-center gap-1">
                <Ruler className="w-3 h-3 text-purple-400" />
                <span className="text-gray-400">R:</span>
                <span className="text-white">{planet.radius.toFixed(1)}⊕</span>
              </div>
            )}
            
            {planet.mass && (
              <div className="flex items-center gap-1">
                <Weight className="w-3 h-3 text-orange-400" />
                <span className="text-gray-400">M:</span>
                <span className="text-white">{planet.mass.toFixed(1)}⊕</span>
              </div>
            )}
            
            {planet.discoveryYear && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-cyan-400" />
                <span className="text-gray-400">Disc:</span>
                <span className="text-white">{planet.discoveryYear}</span>
              </div>
            )}
            
            {planet.discoveryMethod && (
              <div className="flex items-center gap-1">
                <Telescope className="w-3 h-3 text-pink-400" />
                <span className="text-gray-400 truncate text-xs">
                  {planet.discoveryMethod.split(' ')[0]}
                </span>
              </div>
            )}
          </div>

          {/* Habitability Score */}
          <div className="pt-3 border-t border-white/20">
            <HabitabilityBar score={habitabilityScore} size="medium" />
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
              {planet.constellation && `${planet.constellation} constellation`}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const loadPlanets = async (page: number) => {
    setLoading(true);
    
    try {
      console.log(`Loading NASA planets page ${page}...`);
      
      // Use local NASA dataset
      const allPlanets = nasaExoplanets;
      const total = allPlanets.length;
      const totalPages = Math.ceil(total / planetsPerPage);
      
      const startIndex = (page - 1) * planetsPerPage;
      const endIndex = startIndex + planetsPerPage;
      const paginatedPlanets = allPlanets.slice(startIndex, endIndex);
      
      setPlanets(paginatedPlanets);
      setTotalPages(totalPages);
      setTotalPlanets(total);
      setCurrentPage(page);
      console.log(`Loaded ${paginatedPlanets.length} planets, total: ${total}`);
    } catch (err) {
      console.error('Error loading planets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    if (term.length >= 2) {
      const filtered = nasaExoplanets.filter(planet =>
        planet.name.toLowerCase().includes(term.toLowerCase()) ||
        planet.constellation.toLowerCase().includes(term.toLowerCase()) ||
        planet.discoveryFacility.toLowerCase().includes(term.toLowerCase())
      );
      setPlanets(filtered.slice(0, planetsPerPage));
      setTotalPlanets(filtered.length);
      setTotalPages(Math.ceil(filtered.length / planetsPerPage));
      setCurrentPage(1);
    } else if (term.length === 0) {
      loadPlanets(1);
    }
  };

  const showLatestDiscoveries = () => {
    const latest = nasaExoplanets
      .sort((a, b) => b.discoveryYear - a.discoveryYear)
      .slice(0, 100);
    setPlanets(latest);
    setTotalPlanets(latest.length);
    setTotalPages(1);
    setCurrentPage(1);
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
          <p className="text-gray-300">Loading NASA Exoplanet Data...</p>
          <p className="text-gray-500 text-sm mt-2">Preparing 5900+ confirmed exoplanets...</p>
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
            <div className="text-2xl font-bold text-cyan-400">{totalPlanets.toLocaleString()}</div>
            <div className="text-gray-400 text-sm">Total Planets</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
            <div className="text-2xl font-bold text-green-400">
              {planets.filter(p => p.habitabilityScore >= 50).length}
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
              {new Set(planets.map(p => p.discoveryMethod).filter(Boolean)).size}
            </div>
            <div className="text-gray-400 text-sm">Discovery Methods</div>
          </div>
        </div>
      </div>

      {/* Stats Header */}
      <div className="mb-6 text-center">
        <p className="text-gray-300">
          {searchTerm ? `Search Results for "${searchTerm}"` : 'All NASA Exoplanets'} - 
          Showing {planets.length} {searchTerm ? 'results' : `of ${totalPlanets.toLocaleString()} planets`}
        </p>
        <p className="text-gray-500 text-sm">
          {!searchTerm && `Page ${currentPage} of ${totalPages.toLocaleString()} • `}
          NASA Exoplanet Archive Data
        </p>
      </div>

      {/* Enhanced Planet Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {planets.map((planet, index) => (
          <DirectPlanetCard
            key={`${planet.name}-${index}`}
            planet={planet}
            onClick={() => onPlanetSelect(planet.name)}
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
            NASA Exoplanet Archive - Real Data with Latest Discoveries
          </span>
        </div>
      </div>
    </div>
  );
};