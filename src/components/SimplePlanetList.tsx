import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Database, Globe, Loader2 } from 'lucide-react';
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
  const [error, setError] = useState<string | null>(null);
  const [backendAvailable, setBackendAvailable] = useState(true);

  const loadPlanets = async (page: number) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log(`Loading planets page ${page}...`);
      
      // Check if backend is available
      const isHealthy = await apiService.checkHealth();
      if (!isHealthy) {
        setBackendAvailable(false);
        setError('Backend service is starting up. Please wait a moment and try again.');
        setLoading(false);
        return;
      }
      
      setBackendAvailable(true);
      const response = await apiService.getAllPlanets(page, 100);
      if (response) {
        console.log(`Loaded ${response.planets.length} planets for page ${page}`);
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
    console.log('SimplePlanetList component mounted, loading first page...');
    loadPlanets(1);
  }, []);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      console.log(`Changing to page ${page}`);
      loadPlanets(page);
    }
  };

  if (loading && planets.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-300">Loading exoplanets from NASA Archive...</p>
          <p className="text-gray-500 text-sm mt-2">Extracting planet data using fuzzy matching</p>
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

      {/* Simple Planet Names List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
        {planets.map((planet, index) => (
          <div
            key={`${planet.pl_name}-${index}`}
            onClick={() => onPlanetSelect?.(planet.pl_name)}
            className="group cursor-pointer p-4 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex-shrink-0"></div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-medium group-hover:text-cyan-300 transition-colors truncate">
                  {planet.pl_name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-400">
                    Habitability: {planet.habitability_score}/100
                  </span>
                  {planet.in_habitable_zone && (
                    <span className="text-xs text-green-400">• HZ</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
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
          <span className="text-gray-300">Loading planets...</span>
        </div>
      )}
    </div>
  );
};