import React, { useState, useMemo } from 'react';
import { StarField } from './components/StarField';
import { PlanetModal } from './components/PlanetModal';
import { BeautifulExoplanetGrid } from './components/BeautifulExoplanetGrid';
import { PlanetComparison } from './components/PlanetComparison';
import { CreateExoplanet } from './components/CreateExoplanet';
import { ExtendedExoplanet } from './utils/exoplanetAnalysis';
import { Telescope, Globe, Zap, Database, GitCompare, Plus } from 'lucide-react';
import { processedNASALoader } from './services/processedNasaLoader';


function App() {
  const [selectedPlanet, setSelectedPlanet] = useState<ExtendedExoplanet | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [allPlanets, setAllPlanets] = useState<ExtendedExoplanet[]>([]);
  const [activeTab, setActiveTab] = useState<'explore' | 'compare' | 'create'>('explore');

  // Load planets for comparison
  React.useEffect(() => {
    const loadPlanetsForComparison = async () => {
      try {
        const nasaPlanets = await processedNASALoader.loadProcessedData();
        // Convert to ExtendedExoplanet format
        const extendedPlanets: ExtendedExoplanet[] = nasaPlanets.map(planet => ({
          id: planet.planet_name,
          name: planet.planet_name,
          distanceFromEarth: 0, // Not available in NASA data
          orbitalPeriod: planet.pl_orbper_days || 0,
          temperature: planet.st_teff_k || 0,
          starType: '', // Not available in NASA data
          radius: planet.pl_rad_rearth || 0,
          mass: planet.pl_mass_mearth || 0,
          discoveryYear: planet.disc_year,
          discoveryMethod: planet.disc_method,
          discoveryFacility: '', // Not available in NASA data
          constellation: '', // Not available in NASA data
          habitabilityScore: planet.esi ? planet.esi * 10 : 0, // Convert ESI to 0-100 scale
          inHabitableZone: planet.habitable_zone_flag === 'habitable',
          stellarTemperature: planet.st_teff_k || 0,
          orbitalDistance: 0, // Not available in NASA data
          biosignatures: [], // Not available in NASA data
          surfaceTemperature: planet.st_teff_k || 0,
          surfaceGravity: planet.pl_mass_mearth && planet.pl_rad_rearth ? planet.pl_mass_mearth / Math.pow(planet.pl_rad_rearth, 2) : 0,
          waterRetentionPotential: planet.esi || 0,
          radiationHazardIndex: planet.esi ? Math.max(0, 1 - planet.esi) : 0,
          cluster: planet.esi ? (planet.esi >= 0.7 ? 0 : planet.esi >= 0.5 ? 1 : planet.esi >= 0.3 ? 2 : 3) : 3,
          clusterLabel: planet.esi ? (planet.esi >= 0.7 ? "Very High Habitability Potential" : 
                      planet.esi >= 0.5 ? "Moderate to High Habitability Potential" :
                      planet.esi >= 0.3 ? "Low Habitability Potential" : "Very Low Habitability Potential") : "Very Low Habitability Potential"
        }));
        setAllPlanets(extendedPlanets);
      } catch (error) {
        console.error('Error loading NASA planets for comparison:', error);
      }
    };

    loadPlanetsForComparison();
  }, []);



  const handlePlanetSelect = async (planetName: string) => {
    try {
      // Load the NASA data to get the full planet information
      const allPlanets = await processedNASALoader.loadProcessedData();
      const selectedPlanetData = allPlanets.find(p => p.planet_name === planetName);
      
      if (selectedPlanetData) {
        // Convert NASA data to ExtendedExoplanet format
        const convertedPlanet: ExtendedExoplanet = {
          id: selectedPlanetData.planet_name,
          name: selectedPlanetData.planet_name,
          distanceFromEarth: 0, // Not available in NASA data
          orbitalPeriod: selectedPlanetData.pl_orbper_days || 0,
          temperature: selectedPlanetData.st_teff_k || 0,
          starType: '', // Not available in NASA data
          radius: selectedPlanetData.pl_rad_rearth || 0,
          mass: selectedPlanetData.pl_mass_mearth || 0,
          discoveryYear: selectedPlanetData.disc_year,
          discoveryMethod: selectedPlanetData.disc_method,
          discoveryFacility: '', // Not available in NASA data
          constellation: '', // Will be derived from host star name
          habitabilityScore: 0, // Will be calculated
          inHabitableZone: selectedPlanetData.habitable_zone_flag === 'habitable',
          stellarTemperature: selectedPlanetData.st_teff_k || 0,
          orbitalDistance: 0, // Not available in NASA data
          biosignatures: [], // Not available in NASA data
          surfaceTemperature: selectedPlanetData.st_teff_k || 0,
          surfaceGravity: selectedPlanetData.pl_mass_mearth && selectedPlanetData.pl_rad_rearth ? 
            selectedPlanetData.pl_mass_mearth / Math.pow(selectedPlanetData.pl_rad_rearth, 2) : 0,
          waterRetentionPotential: selectedPlanetData.esi || 0,
          radiationHazardIndex: selectedPlanetData.esi ? Math.max(0, 1 - selectedPlanetData.esi) : 0,
          cluster: selectedPlanetData.esi ? (selectedPlanetData.esi >= 0.7 ? 0 : selectedPlanetData.esi >= 0.5 ? 1 : selectedPlanetData.esi >= 0.3 ? 2 : 3) : 3,
          clusterLabel: selectedPlanetData.esi ? (selectedPlanetData.esi >= 0.7 ? "Very High Habitability Potential" : 
                      selectedPlanetData.esi >= 0.5 ? "Moderate to High Habitability Potential" :
                      selectedPlanetData.esi >= 0.3 ? "Low Habitability Potential" : "Very Low Habitability Potential") : "Very Low Habitability Potential"
        };
        
        // Calculate habitability score based on NASA data
        let habitabilityScore = 0;
        
        // Habitable zone factor (25 points)
        if (selectedPlanetData.habitable_zone_flag === 'habitable') {
          habitabilityScore += 25;
        } else if (selectedPlanetData.habitable_zone_flag === 'inner' || selectedPlanetData.habitable_zone_flag === 'outer') {
          habitabilityScore += 15;
        }
        
        // Radius factor (25 points) - Earth-like: 0.8-2.0 Earth radii
        if (selectedPlanetData.pl_rad_rearth) {
          if (selectedPlanetData.pl_rad_rearth >= 0.8 && selectedPlanetData.pl_rad_rearth <= 2.0) {
            habitabilityScore += 25;
          } else if (selectedPlanetData.pl_rad_rearth >= 0.5 && selectedPlanetData.pl_rad_rearth <= 3.0) {
            habitabilityScore += 15;
          } else if (selectedPlanetData.pl_rad_rearth >= 0.3 && selectedPlanetData.pl_rad_rearth <= 5.0) {
            habitabilityScore += 5;
          }
        }
        
        // Mass factor (20 points) - Earth-like: 0.5-5.0 Earth masses
        if (selectedPlanetData.pl_mass_mearth) {
          if (selectedPlanetData.pl_mass_mearth >= 0.5 && selectedPlanetData.pl_mass_mearth <= 5.0) {
            habitabilityScore += 20;
          } else if (selectedPlanetData.pl_mass_mearth >= 0.1 && selectedPlanetData.pl_mass_mearth <= 10.0) {
            habitabilityScore += 10;
          }
        }
        
        // Stellar temperature factor (20 points) - Optimal: 4000-7000K
        if (selectedPlanetData.st_teff_k) {
          if (selectedPlanetData.st_teff_k >= 4000 && selectedPlanetData.st_teff_k <= 7000) {
            habitabilityScore += 20;
          } else if (selectedPlanetData.st_teff_k >= 3000 && selectedPlanetData.st_teff_k <= 8000) {
            habitabilityScore += 10;
          }
        }
        
        // ESI bonus (10 points)
        if (selectedPlanetData.esi && selectedPlanetData.esi >= 0.7) {
          habitabilityScore += 10;
        } else if (selectedPlanetData.esi && selectedPlanetData.esi >= 0.5) {
          habitabilityScore += 5;
        }
        
        convertedPlanet.habitabilityScore = Math.min(habitabilityScore, 100);
        
        setSelectedPlanet(convertedPlanet);
      } else {
        console.error('Planet not found:', planetName);
      }
    } catch (error) {
      console.error('Error loading planet data:', error);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <StarField />
      
      <div className="relative z-10">
        {/* Header */}
        <header className="bg-black/20 backdrop-blur-md border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Desktop Layout */}
            <div className="hidden md:flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg">
                  <Telescope className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white flex items-center flex-nowrap">
                    <span className="mr-1">C</span>
                    <div className="relative inline-block w-6 h-6 flex-shrink-0">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 via-green-400 to-blue-600 animate-spin shadow-lg border border-blue-300/30">
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-500/40 via-transparent to-blue-500/40"></div>
                        <div className="absolute top-1 left-1 w-1 h-1 bg-green-300 rounded-full opacity-80"></div>
                        <div className="absolute bottom-1 right-1 w-1.5 h-1 bg-green-400 rounded-full opacity-60"></div>
                      </div>
                    </div>
                    <span className="ml-1 whitespace-nowrap">smic LifeMapper</span>
                  </h1>
                </div>
              </div>
              
              {/* Navigation Tabs */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('explore')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-300 ${
                    activeTab === 'explore'
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  <Globe className="w-5 h-5" />
                  <span className="font-medium">Explore Worlds</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('compare')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-300 ${
                    activeTab === 'compare'
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  <GitCompare className="w-5 h-5" />
                  <span className="font-medium">Compare Worlds</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('create')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-300 ${
                    activeTab === 'create'
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  <Plus className="w-5 h-5" />
                  <span className="font-medium">Create World</span>
                </button>
              </div>
            </div>

            {/* Mobile Layout - 3 Lines */}
            <div className="md:hidden space-y-4">
              {/* Line 1: Logo and Title */}
              <div className="flex items-center justify-center gap-4">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg">
                  <Telescope className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white flex items-center flex-nowrap">
                    <span className="mr-1">C</span>
                    <div className="relative inline-block w-5 h-5 flex-shrink-0">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 via-green-400 to-blue-600 animate-spin shadow-lg border border-blue-300/30">
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-500/40 via-transparent to-blue-500/40"></div>
                        <div className="absolute top-0.5 left-0.5 w-1 h-1 bg-green-300 rounded-full opacity-80"></div>
                        <div className="absolute bottom-0.5 right-0.5 w-1 h-1 bg-green-400 rounded-full opacity-60"></div>
                      </div>
                    </div>
                    <span className="ml-1 whitespace-nowrap">smic LifeMapper</span>
                  </h1>
                </div>
              </div>

              {/* Line 2: Navigation Tabs */}
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setActiveTab('explore')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 text-sm ${
                    activeTab === 'explore'
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  <span className="font-medium">Explore</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('compare')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 text-sm ${
                    activeTab === 'compare'
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  <GitCompare className="w-4 h-4" />
                  <span className="font-medium">Compare</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('create')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 text-sm ${
                    activeTab === 'create'
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  <span className="font-medium">Create</span>
                </button>
              </div>

              {/* Line 3: Active Tab Indicator */}
              <div className="text-center">
                <div className="inline-block px-4 py-2 bg-white/10 rounded-lg border border-white/20">
                  <span className="text-white font-medium text-sm">
                    {activeTab === 'explore' && 'Exploring Exoplanets'}
                    {activeTab === 'compare' && 'Comparing Worlds'}
                    {activeTab === 'create' && 'Creating New Worlds'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'explore' ? (
            <BeautifulExoplanetGrid onPlanetSelect={handlePlanetSelect} />
          ) : activeTab === 'compare' ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                <GitCompare className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">Compare Exoplanets</h2>
              <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
                Select two exoplanets to compare their characteristics, habitability potential, and discover which world might be more suitable for life.
              </p>
              <button
                onClick={() => setShowComparison(true)}
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <GitCompare className="w-6 h-6" />
                Start Comparison
              </button>
            </div>
          ) : (
            <CreateExoplanet />
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

        {/* Planet Comparison Modal */}
        <PlanetComparison
          planets={allPlanets}
          isOpen={showComparison}
          onClose={() => setShowComparison(false)}
        />
      </div>
    </div>
  );
}

export default App;