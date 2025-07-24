import React, { useState, useMemo } from 'react';
import { X, Search, ArrowRight, Globe, Thermometer, Clock, Star, Ruler, Weight, Calendar, Target, Activity, Droplets, Shield, Zap, ChevronDown } from 'lucide-react';
import { ExtendedExoplanet } from '../utils/exoplanetAnalysis';
import { HabitabilityBar } from './HabitabilityBar';

interface PlanetComparisonProps {
  planets: ExtendedExoplanet[];
  isOpen: boolean;
  onClose: () => void;
}

export const PlanetComparison: React.FC<PlanetComparisonProps> = ({ planets, isOpen, onClose }) => {
  const [selectedPlanet1, setSelectedPlanet1] = useState<ExtendedExoplanet | null>(null);
  const [selectedPlanet2, setSelectedPlanet2] = useState<ExtendedExoplanet | null>(null);
  const [searchTerm1, setSearchTerm1] = useState('');
  const [searchTerm2, setSearchTerm2] = useState('');
  const [showDropdown1, setShowDropdown1] = useState(false);
  const [showDropdown2, setShowDropdown2] = useState(false);

  // Filter planets for search
  const filteredPlanets1 = useMemo(() => {
    if (!searchTerm1) return planets.slice(0, 10);
    return planets.filter(planet =>
      planet.name.toLowerCase().includes(searchTerm1.toLowerCase()) ||
      planet.constellation.toLowerCase().includes(searchTerm1.toLowerCase())
    ).slice(0, 10);
  }, [planets, searchTerm1]);

  const filteredPlanets2 = useMemo(() => {
    if (!searchTerm2) return planets.slice(0, 10);
    return planets.filter(planet =>
      planet.name.toLowerCase().includes(searchTerm2.toLowerCase()) ||
      planet.constellation.toLowerCase().includes(searchTerm2.toLowerCase())
    ).slice(0, 10);
  }, [planets, searchTerm2]);

  const getTemperatureColor = (temp: number) => {
    if (temp < 200) return 'from-blue-500 to-cyan-300';
    if (temp < 280) return 'from-green-500 to-emerald-300';
    if (temp < 350) return 'from-orange-500 to-yellow-300';
    return 'from-red-500 to-pink-300';
  };

  const getComparisonVerdict = () => {
    if (!selectedPlanet1 || !selectedPlanet2) return null;

    const p1 = selectedPlanet1;
    const p2 = selectedPlanet2;

    // Compare habitability scores
    const habitabilityDiff = p1.habitabilityScore - p2.habitabilityScore;
    const tempDiff = Math.abs(p1.temperature - 288) - Math.abs(p2.temperature - 288); // 288K is Earth-like
    const sizeDiff = Math.abs(p1.radius - 1.0) - Math.abs(p2.radius - 1.0); // 1.0 is Earth-like
    const massDiff = Math.abs(p1.mass - 1.0) - Math.abs(p2.mass - 1.0); // 1.0 is Earth-like

    let winner = '';
    let reasons = [];
    let verdict = '';

    if (Math.abs(habitabilityDiff) < 5) {
      winner = 'tie';
      verdict = 'Both planets show similar habitability potential';
    } else if (habitabilityDiff > 0) {
      winner = p1.name;
      reasons.push('higher habitability score');
    } else {
      winner = p2.name;
      reasons.push('higher habitability score');
    }

    // Add specific reasons
    if (tempDiff < -10) reasons.push('more Earth-like temperature');
    if (sizeDiff < -0.3) reasons.push('more Earth-like size');
    if (massDiff < -0.5) reasons.push('more Earth-like mass');

    if (p1.inHabitableZone && !p2.inHabitableZone) {
      winner = p1.name;
      reasons.push('located in habitable zone');
    } else if (!p1.inHabitableZone && p2.inHabitableZone) {
      winner = p2.name;
      reasons.push('located in habitable zone');
    }

    if (p1.biosignatures.length > p2.biosignatures.length) {
      if (winner !== p2.name) winner = p1.name;
      reasons.push('more biosignatures detected');
    } else if (p2.biosignatures.length > p1.biosignatures.length) {
      if (winner !== p1.name) winner = p2.name;
      reasons.push('more biosignatures detected');
    }

    if (winner === 'tie') {
      verdict = `Both ${p1.name} and ${p2.name} show remarkably similar characteristics for potential habitability.`;
    } else {
      verdict = `${winner} appears more promising for potential habitability due to ${reasons.slice(0, 3).join(', ')}.`;
    }

    return { winner, verdict, reasons };
  };

  const PlanetSelector: React.FC<{
    selectedPlanet: ExtendedExoplanet | null;
    onSelect: (planet: ExtendedExoplanet) => void;
    searchTerm: string;
    onSearchChange: (term: string) => void;
    filteredPlanets: ExtendedExoplanet[];
    showDropdown: boolean;
    onToggleDropdown: (show: boolean) => void;
    placeholder: string;
  }> = ({
    selectedPlanet,
    onSelect,
    searchTerm,
    onSearchChange,
    filteredPlanets,
    showDropdown,
    onToggleDropdown,
    placeholder
  }) => (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder={placeholder}
          value={selectedPlanet ? selectedPlanet.name : searchTerm}
          onChange={(e) => {
            onSearchChange(e.target.value);
            onToggleDropdown(true);
            if (selectedPlanet) onSelect(null as any);
          }}
          onFocus={() => onToggleDropdown(true)}
          className="w-full pl-12 pr-12 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent text-lg"
        />
        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
      </div>

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900/95 backdrop-blur-xl rounded-lg border border-white/20 shadow-2xl z-50 max-h-80 overflow-y-auto">
          {filteredPlanets.map((planet) => (
            <button
              key={planet.id}
              onClick={() => {
                onSelect(planet);
                onToggleDropdown(false);
                onSearchChange('');
              }}
              className="w-full px-4 py-3 text-left hover:bg-white/10 transition-colors border-b border-white/10 last:border-b-0 flex items-center gap-3"
            >
              <div className={`w-4 h-4 rounded-full bg-gradient-to-br ${getTemperatureColor(planet.temperature)}`} />
              <div className="flex-1">
                <div className="text-white font-medium">{planet.name}</div>
                <div className="text-gray-400 text-sm">{planet.constellation} • {planet.habitabilityScore}/100</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const PlanetCard: React.FC<{ planet: ExtendedExoplanet; side: 'left' | 'right' }> = ({ planet, side }) => (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-xl">
      {/* Planet visualization */}
      <div className="relative w-32 h-32 mx-auto mb-6">
        <div
          className={`absolute inset-0 rounded-full bg-gradient-to-br ${getTemperatureColor(planet.temperature)} shadow-2xl animate-pulse`}
          style={{
            boxShadow: `0 0 40px rgba(${planet.temperature < 280 ? '34, 197, 94' : '239, 68, 68'}, 0.4)`,
          }}
        />
        <div className="absolute inset-4 rounded-full bg-gradient-to-br from-transparent to-black/30" />
        
        {/* Orbital rings */}
        <div className="absolute -inset-8 border border-white/10 rounded-full animate-spin-slow" />
        <div className="absolute -inset-12 border border-white/5 rounded-full animate-spin-reverse" />
      </div>

      <h3 className="text-2xl font-bold text-white mb-4 text-center">{planet.name}</h3>

      {/* Key Stats */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-blue-400" />
            <span className="text-gray-300">Distance</span>
          </div>
          <span className="text-white font-medium">{planet.distanceFromEarth.toFixed(1)} ly</span>
        </div>

        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
          <div className="flex items-center gap-3">
            <Thermometer className="w-5 h-5 text-red-400" />
            <span className="text-gray-300">Temperature</span>
          </div>
          <span className="text-white font-medium">{planet.temperature.toFixed(0)}K</span>
        </div>

        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
          <div className="flex items-center gap-3">
            <Ruler className="w-5 h-5 text-purple-400" />
            <span className="text-gray-300">Radius</span>
          </div>
          <span className="text-white font-medium">{planet.radius.toFixed(1)}⊕</span>
        </div>

        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
          <div className="flex items-center gap-3">
            <Weight className="w-5 h-5 text-orange-400" />
            <span className="text-gray-300">Mass</span>
          </div>
          <span className="text-white font-medium">{planet.mass.toFixed(1)}⊕</span>
        </div>

        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-green-400" />
            <span className="text-gray-300">Orbital Period</span>
          </div>
          <span className="text-white font-medium">{planet.orbitalPeriod.toFixed(1)} days</span>
        </div>

        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
          <div className="flex items-center gap-3">
            <Star className="w-5 h-5 text-yellow-400" />
            <span className="text-gray-300">Star Type</span>
          </div>
          <span className="text-white font-medium">{planet.starType}</span>
        </div>
      </div>

      {/* Habitability Score */}
      <div className="mb-6">
        <HabitabilityBar score={planet.habitabilityScore} size="large" />
      </div>

      {/* Advanced Stats */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center justify-between p-2 bg-white/5 rounded">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400" />
            <span className="text-gray-400 text-sm">Surface Gravity</span>
          </div>
          <span className="text-white text-sm">{planet.surfaceGravity.toFixed(2)}g</span>
        </div>

        <div className="flex items-center justify-between p-2 bg-white/5 rounded">
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-cyan-400" />
            <span className="text-gray-400 text-sm">Water Retention</span>
          </div>
          <span className="text-white text-sm">{(planet.waterRetentionPotential * 100).toFixed(0)}%</span>
        </div>

        <div className="flex items-center justify-between p-2 bg-white/5 rounded">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-red-400" />
            <span className="text-gray-400 text-sm">Radiation Hazard</span>
          </div>
          <span className="text-white text-sm">{(planet.radiationHazardIndex * 100).toFixed(0)}%</span>
        </div>
      </div>

      {/* Special Indicators */}
      <div className="flex flex-wrap gap-2 mb-4">
        {planet.inHabitableZone && (
          <div className="flex items-center gap-1 px-3 py-1 bg-green-500/20 rounded-full border border-green-500/30">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-400 font-medium">Habitable Zone</span>
          </div>
        )}
        
        {planet.habitabilityScore >= 70 && (
          <div className="flex items-center gap-1 px-3 py-1 bg-blue-500/20 rounded-full border border-blue-500/30">
            <Target className="w-3 h-3 text-blue-400" />
            <span className="text-xs text-blue-400 font-medium">Prime Candidate</span>
          </div>
        )}

        {planet.biosignatures.length > 0 && (
          <div className="flex items-center gap-1 px-3 py-1 bg-purple-500/20 rounded-full border border-purple-500/30">
            <Zap className="w-3 h-3 text-purple-400" />
            <span className="text-xs text-purple-400 font-medium">{planet.biosignatures.length} Biosignatures</span>
          </div>
        )}
      </div>

      {/* Discovery Info */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
          <Calendar className="w-4 h-4" />
          <span>Discovered {planet.discoveryYear}</span>
        </div>
        <div className="text-gray-500 text-xs mt-1">{planet.constellation} constellation</div>
      </div>
    </div>
  );

  if (!isOpen) return null;

  const comparisonResult = getComparisonVerdict();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900/90 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="relative p-6 border-b border-white/20">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-2">Comparing Worlds</h2>
            <p className="text-gray-300">Select two exoplanets to compare their characteristics and habitability potential</p>
          </div>
        </div>

        {/* Planet Selectors */}
        <div className="p-6 border-b border-white/20">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-white font-semibold mb-3">Select First Planet</label>
              <PlanetSelector
                selectedPlanet={selectedPlanet1}
                onSelect={setSelectedPlanet1}
                searchTerm={searchTerm1}
                onSearchChange={setSearchTerm1}
                filteredPlanets={filteredPlanets1}
                showDropdown={showDropdown1}
                onToggleDropdown={setShowDropdown1}
                placeholder="Search for first planet..."
              />
            </div>
            
            <div>
              <label className="block text-white font-semibold mb-3">Select Second Planet</label>
              <PlanetSelector
                selectedPlanet={selectedPlanet2}
                onSelect={setSelectedPlanet2}
                searchTerm={searchTerm2}
                onSearchChange={setSearchTerm2}
                filteredPlanets={filteredPlanets2}
                showDropdown={showDropdown2}
                onToggleDropdown={setShowDropdown2}
                placeholder="Search for second planet..."
              />
            </div>
          </div>
        </div>

        {/* Comparison Content */}
        {selectedPlanet1 && selectedPlanet2 ? (
          <div className="p-6">
            {/* Planet Comparison Cards */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <PlanetCard planet={selectedPlanet1} side="left" />
              
              {/* VS Divider */}
              <div className="hidden md:flex absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-full p-4 border-4 border-gray-900 shadow-2xl">
                  <span className="text-white font-bold text-xl">VS</span>
                </div>
              </div>
              
              <PlanetCard planet={selectedPlanet2} side="right" />
            </div>

            {/* Comparison Verdict */}
            {comparisonResult && (
              <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-xl p-8 border border-purple-500/30 backdrop-blur-sm">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-white mb-4 flex items-center justify-center gap-3">
                    <Target className="w-8 h-8 text-purple-400" />
                    Final Verdict
                  </h3>
                  
                  {comparisonResult.winner === 'tie' ? (
                    <div className="inline-flex items-center gap-3 px-6 py-3 bg-yellow-500/20 rounded-full border border-yellow-500/30">
                      <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                      <span className="text-yellow-300 font-semibold text-lg">Evenly Matched</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-3 px-6 py-3 bg-green-500/20 rounded-full border border-green-500/30">
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-green-300 font-semibold text-lg">Winner: {comparisonResult.winner}</span>
                    </div>
                  )}
                </div>

                <div className="bg-white/5 rounded-lg p-6 mb-6">
                  <p className="text-gray-300 text-lg leading-relaxed text-center">
                    {comparisonResult.verdict}
                  </p>
                </div>

                {/* Detailed Comparison Metrics */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-white/5 rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <Thermometer className="w-4 h-4 text-red-400" />
                      Temperature Analysis
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">{selectedPlanet1.name}:</span>
                        <span className="text-white">{selectedPlanet1.temperature.toFixed(0)}K</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">{selectedPlanet2.name}:</span>
                        <span className="text-white">{selectedPlanet2.temperature.toFixed(0)}K</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        Earth-like: ~288K
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <Ruler className="w-4 h-4 text-purple-400" />
                      Size Comparison
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">{selectedPlanet1.name}:</span>
                        <span className="text-white">{selectedPlanet1.radius.toFixed(1)}⊕</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">{selectedPlanet2.name}:</span>
                        <span className="text-white">{selectedPlanet2.radius.toFixed(1)}⊕</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        Earth radius: 1.0⊕
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <Target className="w-4 h-4 text-green-400" />
                      Habitability Score
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">{selectedPlanet1.name}:</span>
                        <span className="text-white">{selectedPlanet1.habitabilityScore.toFixed(1)}/100</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">{selectedPlanet2.name}:</span>
                        <span className="text-white">{selectedPlanet2.habitabilityScore.toFixed(1)}/100</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        Higher is better
                      </div>
                    </div>
                  </div>
                </div>

                {/* Scientific Note */}
                <div className="mt-6 p-4 bg-blue-900/20 rounded-lg border border-blue-500/20">
                  <p className="text-blue-300 text-sm leading-relaxed">
                    <strong>Scientific Note:</strong> This comparison is based on current scientific models including 
                    Kopparapu et al. (2013) habitable zone calculations, planetary characteristics analysis, and 
                    potential biosignature indicators. Actual habitability depends on many factors not yet fully 
                    understood or observable with current technology.
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <ArrowRight className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Ready to Compare Worlds</h3>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Select two exoplanets from the search boxes above to begin your comparative analysis. 
              Discover which world might be more suitable for life as we know it.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};