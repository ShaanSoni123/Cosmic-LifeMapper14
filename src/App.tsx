import React, { useState, useMemo } from 'react';
import { StarField } from './components/StarField';
import { EnhancedPlanetCard } from './components/EnhancedPlanetCard';
import { PlanetModal } from './components/PlanetModal';
import { SearchFilter } from './components/SearchFilter';
import { UnifiedPlanetGrid } from './components/UnifiedPlanetGrid';
import { nasaExoplanets, TOTAL_NASA_PLANETS } from './data/nasaExoplanets';
import { exoplanets } from './data/exoplanets';
import { csvLoader } from './services/csvLoader';
import { clusterPlanets, ExtendedExoplanet } from './utils/exoplanetAnalysis';
import { Telescope, Globe, Zap, Database } from 'lucide-react';

function App() {
  const [selectedPlanet, setSelectedPlanet] = useState<ExtendedExoplanet | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('distance');
  const [filterBy, setFilterBy] = useState('all');
  const [csvLoaded, setCsvLoaded] = useState(false);
  const [csvPlanets, setCsvPlanets] = useState<ExtendedExoplanet[]>([]);
  const [allPlanets, setAllPlanets] = useState<ExtendedExoplanet[]>([]);
  const [loading, setLoading] = useState(true);

  // Load and merge all planet data on component mount
  React.useEffect(() => {
    const loadAllPlanetData = async () => {
      setLoading(true);
      try {
        console.log('🚀 Loading all exoplanet data...');
        // Load CSV data
        console.log('📊 Loading CSV data with 5900+ exoplanets...');
        await csvLoader.loadCSVData();
        const csvPlanets = csvLoader.getPlanets();
        console.log(`✅ Loaded ${csvPlanets.length} planets from CSV`);
        
        if (csvPlanets.length === 0) {
          console.error('❌ No planets loaded from CSV file');
          setLoading(false);
          return;
        }
        
        const processedCsvPlanets = clusterPlanets(csvPlanets);
        console.log(`🔬 Processed ${processedCsvPlanets.length} planets with habitability analysis`);
        setCsvPlanets(processedCsvPlanets);
        setCsvLoaded(true);
        
        // Convert NASA exoplanets to ExtendedExoplanet format
        const nasaPlanets: ExtendedExoplanet[] = nasaExoplanets.map(planet => ({
          id: planet.id,
          name: planet.name,
          distanceFromEarth: planet.distanceFromEarth,
          orbitalPeriod: planet.orbitalPeriod,
          temperature: planet.temperature,
          starType: planet.starType,
          biosignatures: [], // NASA data doesn't have biosignatures
          radius: planet.radius,
          mass: planet.mass,
          discoveryYear: planet.discoveryYear,
          constellation: planet.constellation,
          habitabilityScore: planet.habitabilityScore,
          surfaceTemperature: planet.temperature,
          surfaceGravity: planet.mass / Math.pow(planet.radius, 2),
          waterRetentionPotential: Math.min(1, planet.habitabilityScore / 100),
          radiationHazardIndex: Math.max(0, 1 - planet.habitabilityScore / 100),
          cluster: getCluster(planet.habitabilityScore),
          clusterLabel: getClusterLabel(planet.habitabilityScore),
          inHabitableZone: planet.inHabitableZone
        }));
        
        // Prioritize CSV planets (5900+) and add others as supplementary
        console.log('🔄 Merging all planet datasets...');
        const mergedPlanets = [...processedCsvPlanets, ...nasaPlanets, ...clusterPlanets(exoplanets)];
        const uniquePlanets = removeDuplicatePlanets(mergedPlanets);
        
        setAllPlanets(uniquePlanets);
        console.log(`🌟 Final dataset: ${uniquePlanets.length} total planets`);
        console.log(`📈 CSV planets: ${processedCsvPlanets.length}, NASA: ${nasaPlanets.length}, Curated: ${exoplanets.length}`);
      } catch (error) {
        console.error('❌ Failed to load planet data:', error);
        // Fallback to NASA + curated exoplanets only
        console.log('🔄 Using fallback data...');
        const nasaPlanets: ExtendedExoplanet[] = nasaExoplanets.map(planet => ({
          id: planet.id,
          name: planet.name,
          distanceFromEarth: planet.distanceFromEarth,
          orbitalPeriod: planet.orbitalPeriod,
          temperature: planet.temperature,
          starType: planet.starType,
          biosignatures: [],
          radius: planet.radius,
          mass: planet.mass,
          discoveryYear: planet.discoveryYear,
          constellation: planet.constellation,
          habitabilityScore: planet.habitabilityScore,
          surfaceTemperature: planet.temperature,
          surfaceGravity: planet.mass / Math.pow(planet.radius, 2),
          waterRetentionPotential: Math.min(1, planet.habitabilityScore / 100),
          radiationHazardIndex: Math.max(0, 1 - planet.habitabilityScore / 100),
          cluster: getCluster(planet.habitabilityScore),
          clusterLabel: getClusterLabel(planet.habitabilityScore),
          inHabitableZone: planet.inHabitableZone
        }));
        
        const mergedPlanets = [...nasaPlanets, ...clusterPlanets(exoplanets)];
        const uniquePlanets = removeDuplicatePlanets(mergedPlanets);
        setAllPlanets(uniquePlanets);
        setCsvLoaded(true);
      } finally {
        setLoading(false);
      }
    };

    loadAllPlanetData();
  }, []);

  // Remove duplicate planets based on name similarity
  const removeDuplicatePlanets = (planets: ExtendedExoplanet[]): ExtendedExoplanet[] => {
    const uniquePlanets: ExtendedExoplanet[] = [];
    const seenNames = new Set<string>();
    
    for (const planet of planets) {
      const normalizedName = planet.name.toLowerCase()
        .replace(/\s+/g, '')
        .replace(/-/g, '')
        .replace(/\./g, '');
      
      // Check if we've seen a similar name
      let isDuplicate = false;
      for (const seenName of seenNames) {
        if (normalizedName === seenName || 
            normalizedName.includes(seenName) || 
            seenName.includes(normalizedName)) {
          isDuplicate = true;
          break;
        }
      }
      
      if (!isDuplicate) {
        seenNames.add(normalizedName);
        uniquePlanets.push(planet);
      }
    }
    
    return uniquePlanets;
  };

  const handlePlanetSelect = (planet: ExtendedExoplanet) => {
    setSelectedPlanet(planet);
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
  const filteredAndSortedPlanets = useMemo(() => {
    let filtered = allPlanets.filter(planet => {
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
  }, [allPlanets, searchTerm, sortBy, filterBy]);

  const stats = useMemo(() => {
    const totalPlanets = allPlanets.length;
    const highHabitability = allPlanets.filter(p => p.habitabilityScore >= 50).length;
    const withBiosignatures = allPlanets.filter(p => p.biosignatures.length > 0).length;
    const inHabitableZone = allPlanets.filter(p => p.inHabitableZone).length;
    
    return { totalPlanets, highHabitability, withBiosignatures, inHabitableZone };
  }, [allPlanets]);

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <StarField />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-white mb-4">Loading Exoplanet Database</h2>
            <p className="text-gray-300 mb-2">Accessing 5,900+ confirmed exoplanets from CSV database...</p>
            <p className="text-gray-500 text-sm">This may take a moment to process all the data</p>
          </div>
        </div>
      </div>
    );
  }

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
                    Explore {stats.totalPlanets.toLocaleString()} confirmed exoplanets from comprehensive database
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Stats */}
                <div className="hidden md:flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-cyan-400">
                      {stats.totalPlanets.toLocaleString()}
                    </div>
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
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Unified Exoplanet Section */}
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              Complete Exoplanet Archive - {stats.totalPlanets.toLocaleString()} Confirmed Planets
            </h2>
            <p className="text-gray-300 mb-2">
              All {stats.totalPlanets.toLocaleString()} confirmed exoplanets with advanced habitability analysis
            </p>
            <p className="text-gray-500 text-sm">
              Comprehensive dataset from NASA Exoplanet Archive with scientific clustering and biosignature detection
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

          <UnifiedPlanetGrid
            planets={filteredAndSortedPlanets}
            onPlanetSelect={handlePlanetSelect}
          />

          {/* Quick Stats Cards for Mobile */}
          <div className="md:hidden mt-8 grid grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="w-4 h-4 text-cyan-400" />
                <span className="text-sm text-gray-400">Total</span>
              </div>
              <div className="text-xl font-bold text-white">
                {stats.totalPlanets.toLocaleString()}
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