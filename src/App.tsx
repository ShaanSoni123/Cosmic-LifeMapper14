import React, { useState, useMemo } from 'react';
import { StarField } from './components/StarField';
import { PlanetCard } from './components/PlanetCard';
import { PlanetModal } from './components/PlanetModal';
import { SearchFilter } from './components/SearchFilter';
import { exoplanets } from './data/exoplanets';
import { clusterPlanets, ExtendedExoplanet } from './utils/exoplanetAnalysis';
import { Telescope, Globe, Zap } from 'lucide-react';

function App() {
  const [selectedPlanet, setSelectedPlanet] = useState<ExtendedExoplanet | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('distance');
  const [filterBy, setFilterBy] = useState('all');

  // Process exoplanets with extended analysis
  const processedPlanets = useMemo(() => {
    return clusterPlanets(exoplanets);
  }, []);

  // Filter and sort planets
  const filteredAndSortedPlanets = useMemo(() => {
    let filtered = processedPlanets.filter(planet => {
      const matchesSearch = planet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           planet.constellation.toLowerCase().includes(searchTerm.toLowerCase());
      
      switch (filterBy) {
        case 'high-habitability':
          return matchesSearch && planet.habitabilityScore >= 50;
        case 'with-biosignatures':
          return matchesSearch && planet.biosignatures.length > 0;
        case 'nearby':
          return matchesSearch && planet.distanceFromEarth < 50;
        case 'in-habitable-zone':
          return matchesSearch && planet.inHabitableZone;
        default:
          return matchesSearch;
      }
    });

    // Sort planets
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'distance':
          return a.distanceFromEarth - b.distanceFromEarth;
        case 'habitability':
          return b.habitabilityScore - a.habitabilityScore;
        case 'temperature':
          return a.temperature - b.temperature;
        case 'discovery':
          return b.discoveryYear - a.discoveryYear;
        default:
          return 0;
      }
    });

    return filtered;
  }, [processedPlanets, searchTerm, sortBy, filterBy]);

  const stats = useMemo(() => {
    const totalPlanets = processedPlanets.length;
    const highHabitability = processedPlanets.filter(p => p.habitabilityScore >= 50).length;
    const withBiosignatures = processedPlanets.filter(p => p.biosignatures.length > 0).length;
    const inHabitableZone = processedPlanets.filter(p => p.inHabitableZone).length;
    
    return { totalPlanets, highHabitability, withBiosignatures, inHabitableZone };
  }, [processedPlanets]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <StarField />
      
      <div className="relative z-10">
        {/* Header */}
        <header className="bg-black/20 backdrop-blur-md border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg">
                  <Telescope className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Exoplanet Explorer</h1>
                  <p className="text-gray-300">Discover distant worlds beyond our solar system</p>
                </div>
              </div>
              
              <div className="hidden md:flex items-center gap-6 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-cyan-400">{stats.totalPlanets}</div>
                  <div className="text-gray-400">Total Planets</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{stats.highHabitability}</div>
                  <div className="text-gray-400">High Habitability</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">{stats.withBiosignatures}</div>
                  <div className="text-gray-400">With Biosignatures</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">{stats.inHabitableZone}</div>
                  <div className="text-gray-400">In Habitable Zone</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search and Filter */}
          <SearchFilter
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            sortBy={sortBy}
            onSortChange={setSortBy}
            filterBy={filterBy}
            onFilterChange={setFilterBy}
          />

          {/* Results Summary */}
          <div className="mb-6">
            <p className="text-gray-300">
              Showing {filteredAndSortedPlanets.length} of {processedPlanets.length} exoplanets
            </p>
          </div>

          {/* Planet Grid */}
          {filteredAndSortedPlanets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredAndSortedPlanets.map((planet) => (
                <PlanetCard
                  key={planet.id}
                  planet={planet}
                  onClick={() => setSelectedPlanet(planet)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Globe className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-300 mb-2">No planets found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          )}

          {/* Quick Stats Cards for Mobile */}
          <div className="md:hidden mt-8 grid grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="w-4 h-4 text-cyan-400" />
                <span className="text-sm text-gray-400">Total</span>
              </div>
              <div className="text-xl font-bold text-white">{stats.totalPlanets}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-green-400" />
                <span className="text-sm text-gray-400">High Habitability</span>
              </div>
              <div className="text-xl font-bold text-white">{stats.highHabitability}</div>
            </div>
          </div>
        </main>

        {/* Planet Modal */}
        {selectedPlanet && (
          <PlanetModal
            planet={selectedPlanet}
            isOpen={!!selectedPlanet}
            onClose={() => setSelectedPlanet(null)}
          />
        )}
      </div>
    </div>
  );
}

export default App;