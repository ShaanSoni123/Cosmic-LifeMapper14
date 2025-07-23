import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Globe, Database } from 'lucide-react';
import { ExtendedExoplanet } from '../utils/exoplanetAnalysis';
import { EnhancedPlanetCard } from './EnhancedPlanetCard';

interface UnifiedPlanetGridProps {
  planets: ExtendedExoplanet[];
  onPlanetSelect: (planet: ExtendedExoplanet) => void;
}

export const UnifiedPlanetGrid: React.FC<UnifiedPlanetGridProps> = ({ 
  planets, 
  onPlanetSelect 
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const planetsPerPage = 50; // Increased from 20 to show more planets per page

  // Calculate pagination
  const totalPages = Math.ceil(planets.length / planetsPerPage);
  const startIndex = (currentPage - 1) * planetsPerPage;
  const endIndex = startIndex + planetsPerPage;
  const paginatedPlanets = planets.slice(startIndex, endIndex);

  // Reset to page 1 when planets change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [planets]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      // Scroll to top when changing pages
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first page
      pages.push(1);
      
      // Calculate range around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      // Add ellipsis if needed
      if (start > 2) {
        pages.push('...');
      }
      
      // Add pages around current
      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== totalPages) {
          pages.push(i);
        }
      }
      
      // Add ellipsis if needed
      if (end < totalPages - 1) {
        pages.push('...');
      }
      
      // Show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  if (planets.length === 0) {
    return (
      <div className="text-center py-20">
        <Globe className="w-16 h-16 text-gray-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-300 mb-2">No planets found</h3>
        <p className="text-gray-500">Try adjusting your search or filter criteria</p>
      </div>
    );
  }

  return (
    <div>
      {/* Stats Header */}
      <div className="mb-6 text-center">
        <p className="text-gray-300">
          Showing {paginatedPlanets.length} of {planets.length.toLocaleString()} exoplanets
          {totalPages > 1 && (
            <span className="text-gray-400"> • Page {currentPage} of {totalPages.toLocaleString()}</span>
          )}
        </p>
      </div>

      {/* Planet Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {paginatedPlanets.map((planet) => (
          <EnhancedPlanetCard
            key={planet.id}
            planet={{
              id: planet.id,
              name: planet.name,
              distanceFromEarth: planet.distanceFromEarth,
              orbitalPeriod: planet.orbitalPeriod,
              temperature: planet.temperature,
              starType: planet.starType,
              radius: planet.radius,
              mass: planet.mass,
              discoveryYear: planet.discoveryYear,
              discoveryMethod: planet.biosignatures.length > 0 ? 'Spectroscopy' : 'Transit',
              discoveryFacility: 'Various',
              constellation: planet.constellation,
              habitabilityScore: Math.round(planet.habitabilityScore),
              inHabitableZone: planet.inHabitableZone,
              stellarTemperature: planet.temperature,
              orbitalDistance: planet.orbitalPeriod / 365.25
            }}
            onClick={() => onPlanetSelect(planet)}
          />
        ))}
      </div>

      {/* Enhanced Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col items-center gap-4">
          {/* Page Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            <div className="flex items-center gap-1">
              {getPageNumbers().map((page, index) => (
                <React.Fragment key={index}>
                  {page === '...' ? (
                    <span className="px-2 py-1 text-gray-500">...</span>
                  ) : (
                    <button
                      onClick={() => handlePageChange(page as number)}
                      className={`px-3 py-2 rounded-lg transition-colors ${
                        page === currentPage
                          ? 'bg-cyan-600 text-white'
                          : 'bg-white/10 text-gray-300 hover:bg-white/20'
                      }`}
                    >
                      {page}
                    </button>
                  )}
                </React.Fragment>
              ))}
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

          {/* Quick Jump */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-400">Jump to page:</span>
            <input
              type="number"
              min="1"
              max={totalPages}
              placeholder="Page #"
              className="w-20 px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-center focus:outline-none focus:ring-1 focus:ring-cyan-400"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  const page = parseInt((e.target as HTMLInputElement).value);
                  if (page >= 1 && page <= totalPages) {
                    handlePageChange(page);
                    (e.target as HTMLInputElement).value = '';
                  }
                }
              }}
            />
            <span className="text-gray-400">of {totalPages.toLocaleString()}</span>
          </div>

          {/* Page Size Info */}
          <div className="text-xs text-gray-500 text-center">
            Showing {planetsPerPage} planets per page • {planets.length.toLocaleString()} total planets
          </div>
        </div>
      )}

      {/* Data Source Info */}
      <div className="mt-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-900/20 border border-blue-500/30 rounded-lg">
          <Database className="w-4 h-4 text-blue-400" />
          <span className="text-blue-300 text-sm">
            Unified Database - NASA Archive + CSV Data + Curated Collection (No Duplicates)
          </span>
        </div>
      </div>
    </div>
  );
};