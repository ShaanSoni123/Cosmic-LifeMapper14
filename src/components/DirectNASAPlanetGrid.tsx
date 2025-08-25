import React, { useState, useEffect } from 'react';
import { Loader2, ChevronLeft, ChevronRight, Database, Globe, Zap, Search, Calendar, Telescope, Star, Thermometer, Weight, Ruler, Clock, Target, Activity, Droplets, Shield } from 'lucide-react';
import { processedNASALoader } from '../services/processedNasaLoader';
import { ProcessedNASAExoplanet } from '../data/nasaProcessedExoplanets';
import { HabitabilityBar } from './HabitabilityBar';

interface DirectNASAPlanetGridProps {
  onPlanetSelect: (planetName: string) => void;
}

export const DirectNASAPlanetGrid: React.FC<DirectNASAPlanetGridProps> = ({ onPlanetSelect }) => {
  const [planets, setPlanets] = useState<ProcessedNASAExoplanet[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPlanets, setTotalPlanets] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPlanets, setFilteredPlanets] = useState<ProcessedNASAExoplanet[]>([]);

  const planetsPerPage = 50;

  // Enhanced planet card component
  const DirectPlanetCard: React.FC<{ planet: ProcessedNASAExoplanet; onClick: () => void }> = ({ planet, onClick }) => {
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

    // Calculate habitability score based on available data
    const calculateHabitabilityScore = (planet: ProcessedNASAExoplanet): number => {
      let score = 0;
      
      // Temperature factor (ideal range: 200-350K)
      if (planet.st_teff_k) {
        if (planet.st_teff_k >= 200 && planet.st_teff_k <= 350) score += 30;
        else if (planet.st_teff_k >= 150 && planet.st_teff_k <= 400) score += 20;
        else if (planet.st_teff_k >= 100 && planet.st_teff_k <= 500) score += 10;
      }
      
      // Size factor (Earth-like: 0.8-2.0 Earth radii)
      if (planet.pl_rad_rearth) {
        if (planet.pl_rad_rearth >= 0.8 && planet.pl_rad_rearth <= 2.0) score += 25;
        else if (planet.pl_rad_rearth >= 0.5 && planet.pl_rad_rearth <= 3.0) score += 15;
        else if (planet.pl_rad_rearth >= 0.3 && planet.pl_rad_rearth <= 5.0) score += 5;
      }
      
      // Mass factor (Earth-like: 0.5-5.0 Earth masses)
      if (planet.pl_mass_mearth) {
        if (planet.pl_mass_mearth >= 0.5 && planet.pl_mass_mearth <= 5.0) score += 20;
        else if (planet.pl_mass_mearth >= 0.1 && planet.pl_mass_mearth <= 10.0) score += 10;
      }
      
      // Habitable zone factor
      if (planet.habitable_zone_flag === 'habitable') {
        score += 25;
      } else if (planet.habitable_zone_flag === 'inner' || planet.habitable_zone_flag === 'outer') {
        score += 15;
      }
      
      return Math.min(score, 100);
    };

    const habitabilityScore = calculateHabitabilityScore(planet);
    const isInHabitableZone = planet.habitable_zone_flag === 'habitable';

    return (
      <div
        onClick={onClick}
        className="group cursor-pointer transform transition-all duration-500 hover:scale-105"
      >
        {/* Planet visualization */}
        <div className="relative w-20 h-20 mx-auto mb-4">
          <div
            className={`absolute inset-0 rounded-full bg-gradient-to-br ${getTemperatureColor(
              planet.pl_eqt
            )} shadow-xl animate-pulse group-hover:animate-none transition-all duration-500`}
            style={{
              boxShadow: `0 0 20px rgba(${(planet.pl_eqt || 0) < 280 ? '34, 197, 94' : '239, 68, 68'}, 0.3)`,
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
                <span>{planet.sy_dist.toFixed(1)} pc</span>
              </div>
            )}
            
            {planet.pl_orbper && (
              <div className="flex items-center gap-2 text-gray-300">
                <Clock className="w-4 h-4 text-green-400" />
                <span>{planet.pl_orbper.toFixed(1)} days</span>
              </div>
            )}
            
            {planet.pl_eqt && (
              <div className="flex items-center gap-2 text-gray-300">
                <Thermometer className="w-4 h-4 text-red-400" />
                <span>{planet.pl_eqt.toFixed(0)}K</span>
              </div>
            )}
            
            {planet.disc_facility && (
              <div className="flex items-center gap-2 text-gray-300">
                <Telescope className="w-4 h-4 text-purple-400" />
                <span className="truncate text-xs">{planet.disc_facility}</span>
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
            
            {planet.discoverymethod && (
              <div className="flex items-center gap-1">
                <Telescope className="w-3 h-3 text-pink-400" />
                <span className="text-gray-400 truncate text-xs">
                  {planet.discoverymethod.split(' ')[0]}
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
              {planet.disc_telescope && `${planet.disc_telescope}`}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const loadPlanets = async (page: number) => {
    setLoading(true);
    
    try {
      console.log(`🚀 Loading planets from NASA processed data... page ${page}`);
      
      // Use NASA data loader service
      const allPlanets = await processedNASALoader.loadProcessedData();
      console.log(`📊 NASA service returned ${allPlanets.length} planets`);
      
      if (allPlanets.length === 0) {
        console.log('❌ No planets returned from NASA service!');
        setPlanets([]);
        setTotalPlanets(0);
        setTotalPages(1);
        setCurrentPage(1);
        return;
      }
      
      // Implement pagination
      const startIndex = (page - 1) * planetsPerPage;
      const endIndex = startIndex + planetsPerPage;
      const pagePlanets = allPlanets.slice(startIndex, endIndex);
      
      console.log(`📄 Setting ${pagePlanets.length} planets for page ${page}`);
      console.log(`📄 First planet:`, pagePlanets[0]);
      
      setPlanets(pagePlanets);
      setTotalPages(Math.ceil(allPlanets.length / planetsPerPage));
      setTotalPlanets(allPlanets.length);
      setCurrentPage(page);
      console.log(`✅ Successfully loaded ${pagePlanets.length} planets, total: ${allPlanets.length}`);
    } catch (err) {
      console.error('❌ Error loading planets:', err);
      setPlanets([]);
      setTotalPlanets(0);
    } finally {
      setLoading(false);
      console.log('🔄 Loading finished, planets state:', planets.length);
    }
  };

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    if (term.length >= 2) {
      try {
        // Simple search through loaded planets
        const allPlanets = await csvPlanetLoader.loadPlanets();
        const searchResults = allPlanets.filter(planet => 
          planet.pl_name.toLowerCase().includes(term.toLowerCase()) ||
          planet.discoverymethod.toLowerCase().includes(term.toLowerCase())
        );
        setPlanets(searchResults.slice(0, planetsPerPage));
        setTotalPlanets(searchResults.length);
        setTotalPages(Math.ceil(searchResults.length / planetsPerPage));
        setCurrentPage(1);
      } catch (error) {
        console.error('Search error:', error);
      }
    } else if (term.length === 0) {
      loadPlanets(1);
    }
  };

  const showLatestDiscoveries = async () => {
    try {
      const allPlanets = await csvPlanetLoader.loadPlanets();
      const latest = allPlanets
        .filter(p => p.disc_year)
        .sort((a, b) => (b.disc_year || 0) - (a.disc_year || 0))
        .slice(0, 100);
      setPlanets(latest);
      setTotalPlanets(latest.length);
      setTotalPages(1);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error loading latest discoveries:', error);
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
          <p className="text-gray-300">Loading NASA Exoplanet Data...</p>
          <p className="text-gray-500 text-sm mt-2">Fetching 6000+ confirmed exoplanets from NASA...</p>
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
          
          <button
            onClick={async () => {
              try {
                const allPlanets = await csvPlanetLoader.loadPlanets();
                const habitable = allPlanets
                  .filter(p => p.pl_rade && p.pl_rade >= 0.5 && p.pl_rade <= 2.5)
                  .slice(0, 100);
                setPlanets(habitable);
                setTotalPlanets(habitable.length);
                setTotalPages(1);
                setCurrentPage(1);
                setSearchTerm('');
              } catch (error) {
                console.error('Error loading habitable planets:', error);
              }
            }}
            className="px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <Star className="w-4 h-4" />
            Most Habitable
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
              {planets.filter(p => {
                const score = p.pl_eqt && p.pl_rade && p.pl_bmasse ? 
                  (p.pl_eqt >= 200 && p.pl_eqt <= 350 ? 30 : 0) +
                  (p.pl_rade >= 0.8 && p.pl_rade <= 2.0 ? 25 : 0) +
                  (p.pl_bmasse >= 0.5 && p.pl_bmasse <= 5.0 ? 20 : 0) +
                  (p.pl_insol && p.pl_insol >= 0.3 && p.pl_insol <= 1.5 ? 25 : 0) : 0;
                return score >= 50;
              }).length}
            </div>
            <div className="text-gray-400 text-sm">High Habitability</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
            <div className="text-2xl font-bold text-yellow-400">
              {planets.filter(p => p.pl_insol ? (p.pl_insol >= 0.3 && p.pl_insol <= 1.5) : false).length}
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
          Showing {planets.length} {searchTerm ? 'results' : `of ${totalPlanets.toLocaleString()} planets`}
        </p>
        <p className="text-gray-500 text-sm">
          {!searchTerm && `Page ${currentPage} of ${totalPages.toLocaleString()} • `}
          NASA Exoplanet Archive Data - Live from NASA
        </p>
      </div>

      {/* Enhanced Planet Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {planets.map((planet, index) => (
          <DirectPlanetCard
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
            NASA Exoplanet Archive - Live Data with 6000+ Confirmed Exoplanets
          </span>
        </div>
      </div>
    </div>
  );
};