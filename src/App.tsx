import React, { useState, useMemo } from 'react';
import { StarField } from './components/StarField';
import { PlanetModal } from './components/PlanetModal';
import { AllCSVPlanets } from './components/AllCSVPlanets';
import { PlanetComparison } from './components/PlanetComparison';
import { CreateExoplanet } from './components/CreateExoplanet';
import { ExtendedExoplanet } from './utils/exoplanetAnalysis';
import { Telescope, Globe, Zap, Database, GitCompare, Plus } from 'lucide-react';
import { csvLoader } from './services/csvLoader';

function App() {
  const [selectedPlanet, setSelectedPlanet] = useState<ExtendedExoplanet | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [allPlanets, setAllPlanets] = useState<ExtendedExoplanet[]>([]);
  const [activeTab, setActiveTab] = useState<'explore' | 'compare' | 'create'>('explore');

  // Load planets for comparison
  React.useEffect(() => {
    const loadPlanetsForComparison = async () => {
      try {
        const csvPlanets = await csvLoader.loadCSVData();
        // Convert to ExtendedExoplanet format
        const extendedPlanets: ExtendedExoplanet[] = csvPlanets.map(planet => ({
          ...planet,
          habitabilityScore: planet.habitabilityScore * 10, // Convert to 0-100 scale
          surfaceTemperature: planet.temperature,
          surfaceGravity: planet.mass / Math.pow(planet.radius, 2),
          waterRetentionPotential: Math.min(1, planet.habitabilityScore / 10),
          radiationHazardIndex: Math.max(0, 1 - planet.habitabilityScore / 10),
          cluster: planet.habitabilityScore >= 7 ? 0 : planet.habitabilityScore >= 5 ? 1 : planet.habitabilityScore >= 2.5 ? 2 : 3,
          clusterLabel: planet.habitabilityScore >= 7 ? "Very High Habitability Potential" : 
                      planet.habitabilityScore >= 5 ? "Moderate to High Habitability Potential" :
                      planet.habitabilityScore >= 2.5 ? "Low Habitability Potential" : "Very Low Habitability Potential",
          inHabitableZone: planet.temperature >= 200 && planet.temperature <= 350
        }));
        setAllPlanets(extendedPlanets);
      } catch (error) {
        console.error('Error loading planets for comparison:', error);
      }
    };

    loadPlanetsForComparison();
  }, []);

  const handlePlanetSelect = (planet: ExtendedExoplanet) => {
    setSelectedPlanet(planet);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <StarField />
      
      <div className="relative z-10">
        {/* Header */}
        <header className="bg-black/20 backdrop-blur-md border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg">
                  <Telescope className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white flex items-center">
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
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'explore' ? (
            <AllCSVPlanets onPlanetSelect={handlePlanetSelect} />
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