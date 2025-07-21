import React, { useState, useEffect } from 'react';
import { Loader2, ChevronLeft, ChevronRight, Database, Globe, Zap } from 'lucide-react';
import { apiService, PlanetDetails } from '../services/api';
import { ExtendedExoplanet } from '../utils/exoplanetAnalysis';

interface PlanetGridProps {
  onPlanetSelect: (planet: ExtendedExoplanet) => void;
}

export const PlanetGrid: React.FC<PlanetGridProps> = ({ onPlanetSelect }) => {
  const [planets, setPlanets] = useState<PlanetDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPlanets, setTotalPlanets] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [backendAvailable, setBackendAvailable] = useState(true);

  // Simple planet card component for NASA data
  const NasaPlanetCard: React.FC<{ planet: PlanetDetails; onClick: () => void }> = ({ planet, onClick }) => {
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

    return (
      <div
        onClick={onClick}
        className="group relative cursor-pointer transform transition-all duration-500 hover:scale-105"
      >
        {/* Planet visualization */}
        <div className="relative w-20 h-20 mx-auto mb-3">
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

        {/* Planet info card */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20 shadow-xl">
          <h3 className="text-sm font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors truncate">
            {planet.pl_name}
          </h3>
          
          <div className="space-y-1 text-xs">
            {planet.pl_rade && (
              <div className="flex items-center gap-1 text-gray-300">
                <Globe className="w-3 h-3" />
                <span>{planet.pl_rade.toFixed(1)} R⊕</span>
              </div>
            )}
            
            {planet.pl_orbper && (
              <div className="flex items-center gap-1 text-gray-300">
                <span className="w-3 h-3 text-center">⏱</span>
                <span>{planet.pl_orbper.toFixed(0)}d</span>
              </div>
            )}
            
            {(planet.pl_eqt || planet.st_teff) && (
              <div className="flex items-center gap-1 text-gray-300">
                <span className="w-3 h-3 text-center">🌡</span>
                <span>{(planet.pl_eqt || planet.st_teff)?.toFixed(0)}K</span>
              </div>
            )}
            
            {planet.disc_year && (
              <div className="flex items-center gap-1 text-gray-300">
                <span className="w-3 h-3 text-center">📅</span>
                <span>{planet.disc_year}</span>
              </div>
            )}
          </div>

          <div className="mt-2 pt-2 border-t border-white/20">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Habitability</span>
              <span className={`text-xs font-bold ${getHabitabilityColor(planet.habitability_score)}`}>
                {planet.habitability_score}/100
              </span>
            </div>
            
            <div className="mt-1 w-full bg-gray-700 rounded-full h-1">
              <div
                className={`h-1 rounded-full ${
                  planet.habitability_score >= 70 ? 'bg-green-400' :
                  planet.habitability_score >= 50 ? 'bg-yellow-400' :
                  planet.habitability_score >= 25 ? 'bg-orange-400' : 'bg-red-400'
                }`}
                style={{ width: `${planet.habitability_score}%` }}
              />
            </div>
          </div>

          {planet.in_habitable_zone && (
            <div className="mt-2 pt-2 border-t border-white/20">
              <div className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-green-400" />
                <span className="text-xs text-green-400 font-medium">Habitable Zone</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const loadPlanets = async (page: number) => {
    setLoading(true);
    setError(null);
    
    try {
      // Check if backend is available
      const isHealthy = await apiService.checkHealth();
      if (!isHealthy) {
        setBackendAvailable(false);
        setError('Backend service is starting up. Please wait a moment and try again.');
        setLoading(false);
        return;
      }
      
      setBackendAvailable(true);
      const response = await apiService.getAllPlanets(page, 50);
      if (response) {
        setPlanets(response.planets);
        setTotalPages(response.total_pages);
        setTotalPlanets(response.total);
        setCurrentPage(page);
      } else {
        setError('Failed to load planets');
      }
    } catch (err) {
      setError('Error loading planets');
      console.error('Error loading planets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlanets(1);
  }, []);

  const convertToExtendedExoplanet = (planet: PlanetDetails): ExtendedExoplanet => {
    // Convert API planet data to ExtendedExoplanet format
    const orbitalPeriod = planet.pl_orbper || 365;
    const temperature = planet.pl_eqt || planet.st_teff || 288;
    const starTemp = planet.st_teff || 5778;
    const orbitalDistance = planet.orbital_distance_au || (orbitalPeriod / 365.25) ** (2/3);
    
    return {
      id: planet.pl_name.toLowerCase().replace(/\s+/g, '-'),
      name: planet.pl_name,
      distanceFromEarth: 100, // Default value - would need additional API call for actual distance
      orbitalPeriod: orbitalPeriod,
      temperature: temperature,
      starType: getStarType(starTemp),
      biosignatures: [], // Would need spectroscopy data
      radius: planet.pl_rade || 1.0,
      mass: planet.pl_bmasse || 1.0,
      discoveryYear: planet.disc_year || 2000,
      constellation: 'Unknown', // Would need additional data
      habitabilityScore: planet.habitability_score,
      surfaceTemperature: temperature,
      surfaceGravity: (planet.pl_bmasse || 1.0) / Math.pow(planet.pl_rade || 1.0, 2),
      waterRetentionPotential: Math.min(1, planet.habitability_score / 100),
      radiationHazardIndex: Math.max(0, 1 - planet.habitability_score / 100),
      cluster: getCluster(planet.habitability_score),
      clusterLabel: getClusterLabel(planet.habitability_score),
      inHabitableZone: planet.in_habitable_zone
    };
  };

  const getStarType = (temp: number): string => {
    if (temp > 7500) return 'A';
    if (temp > 6000) return 'F';
    if (temp > 5200) return 'G';
    if (temp > 3700) return 'K';
    return 'M';
  };

  const getCluster = (score: number): number => {
    if (score >= 70) return 0;
    if (score >= 50) return 1;
    if (score >= 25) return 2;
    return 3;
  };

  const getClusterLabel = (score: number): string => {
    if (score >= 70) return "Very High Habitability Potential";
    if (score >= 50) return "Moderate to High Habitability Potential";
    if (score >= 25) return "Low Habitability Potential";
    return "Very Low Habitability Potential";
  };

  const handlePlanetClick = (planet: PlanetDetails) => {
    const extendedPlanet = convertToExtendedExoplanet(planet);
    onPlanetSelect(extendedPlanet);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      loadPlanets(page);
    }
  };

  if (loading && planets.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-300">Loading exoplanets from NASA Archive...</p>
          <p className="text-gray-500 text-sm mt-2">This may take a moment</p>
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
            {backendAvailable ? 'Error loading planets' : 'Backend Starting Up'}
          </p>
          <p className="text-gray-500 text-sm mb-4">{error}</p>
          {!backendAvailable && (
            <p className="text-gray-400 text-xs mb-4">
              The Flask backend is initializing and connecting to NASA's servers...
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
            {backendAvailable ? 'Try Again' : 'Check Again'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Stats Header */}
      <div className="mb-6 text-center">
        <p className="text-gray-300">
          Showing {planets.length} of {totalPlanets.toLocaleString()} exoplanets from NASA Exoplanet Archive
        </p>
        <p className="text-gray-500 text-sm">
          Page {currentPage} of {totalPages} • Real-time data with habitability analysis
        </p>
      </div>

      {/* Planet Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {planets.map((planet) => {
          return (
            <NasaPlanetCard
              key={planet.pl_name}
              planet={planet}
              onClick={() => handlePlanetClick(planet)}
            />
          );
        })}
      </div>

      {/* Pagination */}
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
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const page = Math.max(1, currentPage - 2) + i;
            if (page > totalPages) return null;
            
            return (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                disabled={loading}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  page === currentPage
                    ? 'bg-cyan-600 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                {page}
              </button>
            );
          })}
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

      {loading && (
        <div className="flex items-center justify-center mt-4">
          <Loader2 className="w-6 h-6 text-cyan-400 animate-spin mr-2" />
          <span className="text-gray-300">Loading...</span>
        </div>
      )}
    </div>
  );
};