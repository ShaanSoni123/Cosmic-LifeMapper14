import React, { useState, useMemo } from 'react';
import { StarField } from './components/StarField';
import { PlanetCard } from './components/PlanetCard';
import { PlanetModal } from './components/PlanetModal';
import { SearchFilter } from './components/SearchFilter';
import { PlanetSearch } from './components/PlanetSearch';
import { DirectNASAPlanetGrid } from './components/DirectNASAPlanetGrid';
import { SimplePlanetList } from './components/SimplePlanetList';
import { nasaExoplanets, TOTAL_NASA_PLANETS } from './data/nasaExoplanets';
import { exoplanets } from './data/exoplanets';
import { csvLoader } from './services/csvLoader';
import { csvExoplanets } from './data/csvExoplanets';
import { clusterPlanets, ExtendedExoplanet } from './utils/exoplanetAnalysis';
import { Telescope, Globe, Zap } from 'lucide-react';

function App() {
  const [selectedPlanet, setSelectedPlanet] = useState<ExtendedExoplanet | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('distance');
  const [filterBy, setFilterBy] = useState('all');
  const [viewMode, setViewMode] = useState<'local' | 'nasa'>('nasa');
  const [nasaStats, setNasaStats] = useState({ total_planets: TOTAL_NASA_PLANETS });
  const [csvLoaded, setCsvLoaded] = useState(false);
  const [csvPlanets, setCsvPlanets] = useState<ExtendedExoplanet[]>([]);

  // Load CSV data on component mount
  React.useEffect(() => {
    const loadCSVData = async () => {
      try {
        await csvLoader.loadCSVData();
        const planets = csvLoader.getPlanets();
        const processedPlanets = clusterPlanets(planets);
        setCsvPlanets(processedPlanets);
        setCsvLoaded(true);
        console.log(`Loaded ${planets.length} planets from CSV`);
      } catch (error) {
        console.error('Failed to load CSV data:', error);
        // Fallback to hardcoded exoplanets
        const processedPlanets = clusterPlanets(exoplanets);
        setCsvPlanets(processedPlanets);
        setCsvLoaded(true);
      }
    };

    loadCSVData();
  }, []);

  // Process exoplanets with extended analysis
  const processedPlanets = useMemo(() => {
    if (csvLoaded && csvPlanets.length > 0) {
      return csvPlanets;
    }
    return clusterPlanets(exoplanets);
  }, [csvLoaded, csvPlanets]);

  const handleNasaPlanetSelect = async (planetName: string) => {
    // Find planet in our NASA dataset
    const planetDetails = nasaExoplanets.find(p => p.name === planetName);
    if (planetDetails) {
      // Convert to ExtendedExoplanet format for modal
      const extendedPlanet: ExtendedExoplanet = {
        id: planetDetails.id,
        name: planetDetails.name,
        distanceFromEarth: planetDetails.distanceFromEarth,
        orbitalPeriod: planetDetails.orbitalPeriod,
        temperature: planetDetails.temperature,
        starType: planetDetails.starType,
        biosignatures: [],
        radius: planetDetails.radius,
        mass: planetDetails.mass,
        discoveryYear: planetDetails.discoveryYear,
        constellation: planetDetails.constellation,
        habitabilityScore: planetDetails.habitabilityScore,
        surfaceTemperature: planetDetails.temperature,
        surfaceGravity: planetDetails.mass / Math.pow(planetDetails.radius, 2),
        waterRetentionPotential: Math.min(1, planetDetails.habitabilityScore / 100),
        radiationHazardIndex: Math.max(0, 1 - planetDetails.habitabilityScore / 100),
        cluster: getCluster(planetDetails.habitabilityScore),
        clusterLabel: getClusterLabel(planetDetails.habitabilityScore),
        inHabitableZone: planetDetails.inHabitableZone
      };
      setSelectedPlanet(extendedPlanet);
    }
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
                  <h1 className="text-3xl font-bold text-white flex items-center">
                    C
                    <div className="relative inline-block mx-1">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 via-green-400 to-blue-600 animate-spin shadow-lg border border-blue-300/30">
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-500/40 via-transparent to-blue-500/40"></div>
                        <div className="absolute top-1 left-1 w-1 h-1 bg-green-300 rounded-full opacity-80"></div>
                        <div className="absolute bottom-1 right-1 w-1.5 h-1 bg-green-400 rounded-full opacity-60"></div>
                      </div>
                    </div>
                    smic LifeMapper
                  </h1>
                  <p className="text-gray-300">
                    {viewMode === 'nasa' 
                      ? `Explore ${nasaStats.total_planets.toLocaleString()}+ exoplanets from NASA Archive`
                      : 'Discover distant worlds beyond our solar system'
                    }
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                {/* View Mode Toggle */}
                <div className="flex bg-white/10 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('nasa')}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      viewMode === 'nasa' 
                        ? 'bg-cyan-600 text-white' 
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    NASA Archive
                  </button>
                  <button
                    onClick={() => setViewMode('local')}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      viewMode === 'local' 
                        ? 'bg-cyan-600 text-white' 
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    Curated
                  </button>
                </div>

                {/* Stats */}
                <div className="hidden md:flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-cyan-400">
                      {viewMode === 'nasa' ? nasaStats.total_planets.toLocaleString() : stats.totalPlanets}
                    </div>
                    <div className="text-gray-400">Total Planets</div>
                  </div>
                  {viewMode === 'local' && (
                    <>
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
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {viewMode === 'nasa' ? (
            <>
              {/* NASA Archive View */}
              <div className="mb-8 text-center">
                <h2 className="text-2xl font-bold text-white mb-4">NASA Exoplanet Archive</h2>
                <p className="text-gray-300 mb-2">Access to 5900+ confirmed exoplanets</p>
                <p className="text-gray-500 text-sm">Real NASA data with latest discoveries and advanced search</p>
              </div>
              
              <DirectNASAPlanetGrid 
                onPlanetSelect={(planetName) => {
                  handleNasaPlanetSelect(planetName);
                }} 
              />
            </>
          ) : (
            <>
              {/* Local Curated View */}
              <div className="mb-8 text-center">
                <h2 className="text-2xl font-bold text-white mb-4">
                  {csvLoaded ? 'CSV Exoplanet Database' : 'Curated Exoplanets'}
                </h2>
                <p className="text-gray-300 mb-2">
                  {csvLoaded 
                    ? `${csvPlanets.length.toLocaleString()} exoplanets loaded from CSV database`
                    : 'Hand-picked exoplanets with detailed analysis'
                  }
                </p>
                <p className="text-gray-500 text-sm">
                  {csvLoaded 
                    ? 'Comprehensive dataset with habitability analysis'
                    : 'Curated selection with biosignature detection'
                  }
                </p>
              </div>

              <SearchFilter
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                sortBy={sortBy}
                onSortChange={setSortBy}
                filterBy={filterBy}
                onFilterChange={setFilterBy}
              />

              <div className="mb-6">
                <p className="text-gray-300">
                  Showing {filteredAndSortedPlanets.length} of {processedPlanets.length} {csvLoaded ? 'CSV' : 'curated'} exoplanets
                </p>
              </div>

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
                <div className="text-center">
                  <Globe className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-300 mb-2">No planets found</h3>
                  <p className="text-gray-500">Try adjusting your search or filter criteria</p>
                </div>
              )}
            </>
          )}

          {/* Quick Stats Cards for Mobile */}
          {viewMode === 'local' && (
            <div className="md:hidden mt-8 grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm text-gray-400">Total</span>
                </div>
                <div className="text-xl font-bold text-white">
                  {csvLoaded ? csvPlanets.length : stats.totalPlanets}
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-gray-400">High Habitability</span>
                </div>
                <div className="text-xl font-bold text-white">{stats.highHabitability}</div>
              </div>
            </div>
          )}
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