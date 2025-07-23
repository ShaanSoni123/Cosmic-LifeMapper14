import React, { useState, useMemo } from 'react';
import { StarField } from './components/StarField';
import { PlanetModal } from './components/PlanetModal';
import { AllCSVPlanets } from './components/AllCSVPlanets';
import { ExtendedExoplanet } from './utils/exoplanetAnalysis';
import { Telescope, Globe, Zap, Database } from 'lucide-react';

function App() {
  const [selectedPlanet, setSelectedPlanet] = useState<ExtendedExoplanet | null>(null);

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
            <div className="flex items-center justify-center">
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
                  <p className="text-gray-300">
                    ALL 5900+ Exoplanets from backend/exoplanets.csv
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* All CSV Planets Component */}
          <AllCSVPlanets onPlanetSelect={handlePlanetSelect} />
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