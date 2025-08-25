import React, { useState, useMemo, useCallback } from 'react';
import { X, Search, ArrowRight, Globe, Thermometer, Clock, Star, Ruler, Weight, Calendar, Target, Activity, Droplets, Shield, Zap, ChevronDown, Info } from 'lucide-react';
import { ExtendedExoplanet } from '../utils/exoplanetAnalysis';
import { generatePlanetBiosignatures, generateBiosignatureReport } from '../utils/biosignatureAnalysis';
import { expandConstellationName, getConstellationInfo } from '../utils/constellationExpander';

interface PlanetComparisonProps {
  planets: ExtendedExoplanet[];
  isOpen: boolean;
  onClose: () => void;
}

export const PlanetComparison: React.FC<PlanetComparisonProps> = ({ planets, isOpen, onClose }) => {
  const [selectedPlanet1, setSelectedPlanet1] = useState<ExtendedExoplanet | null>(null);
  const [selectedPlanet2, setSelectedPlanet2] = useState<ExtendedExoplanet | null>(null);




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

    // Calculate real biosignature scores using the same function as BiosignaturePanel
    let p1BiosignatureScore = 0;
    let p2BiosignatureScore = 0;
    
    try {
      const p1BiosignatureInput = generatePlanetBiosignatures({
        temperature: p1.temperature,
        radius: p1.radius,
        mass: p1.mass,
        starType: 'G',
        inHabitableZone: p1.inHabitableZone,
        habitabilityScore: p1.habitabilityScore
      });
      const p1BiosignatureReport = generateBiosignatureReport(p1BiosignatureInput);
      p1BiosignatureScore = p1BiosignatureReport['Habitability Score'] || 0;
    } catch (error) {
      console.error('Error calculating p1 biosignature score:', error);
      p1BiosignatureScore = p1.biosignatures.length > 0 ? 
        Math.min(p1.biosignatures.length * 25, 100) : 
        Math.round(p1.habitabilityScore * 10);
    }
    
    try {
      const p2BiosignatureInput = generatePlanetBiosignatures({
        temperature: p2.temperature,
        radius: p2.radius,
        mass: p2.mass,
        starType: 'G',
        inHabitableZone: p2.inHabitableZone,
        habitabilityScore: p2.habitabilityScore
      });
      const p2BiosignatureReport = generateBiosignatureReport(p2BiosignatureInput);
      p2BiosignatureScore = p2BiosignatureReport['Habitability Score'] || 0;
    } catch (error) {
      console.error('Error calculating p2 biosignature score:', error);
      p2BiosignatureScore = p2.biosignatures.length > 0 ? 
        Math.min(p2.biosignatures.length * 25, 100) : 
        Math.round(p2.habitabilityScore * 10);
    }

    // Compare biosignature scores
    const biosignatureDiff = p1BiosignatureScore - p2BiosignatureScore;
    const tempDiff = Math.abs(p1.temperature - 5778) - Math.abs(p2.temperature - 5778); // 5778K is Sun-like
    const sizeDiff = Math.abs(p1.radius - 1.0) - Math.abs(p2.radius - 1.0); // 1.0 is Earth-like
    const massDiff = Math.abs(p1.mass - 1.0) - Math.abs(p2.mass - 1.0); // 1.0 is Earth-like

    let winner = '';
    let reasons = [];
    let verdict = '';

    if (Math.abs(biosignatureDiff) < 5) {
      winner = 'tie';
      verdict = 'Both planets show similar biosignature potential';
    } else if (biosignatureDiff > 0) {
      winner = p1.name;
      reasons.push('higher biosignature score');
    } else {
      winner = p2.name;
      reasons.push('higher biosignature score');
    }

    // Add specific reasons
    if (tempDiff < -500) reasons.push('more Sun-like stellar temperature');
    if (sizeDiff < -0.3) reasons.push('more Earth-like size');
    if (massDiff < -0.5) reasons.push('more Earth-like mass');

    if (p1.inHabitableZone && !p2.inHabitableZone) {
      winner = p1.name;
      reasons.push('located in habitable zone');
    } else if (!p1.inHabitableZone && p2.inHabitableZone) {
      winner = p2.name;
      reasons.push('located in habitable zone');
    }

    // Compare orbital periods (closer to Earth's 365 days is better)
    const p1OrbitalDiff = Math.abs(p1.orbitalPeriod - 365.25);
    const p2OrbitalDiff = Math.abs(p2.orbitalPeriod - 365.25);
    if (p1OrbitalDiff < p2OrbitalDiff - 30) {
      if (winner !== p2.name) winner = p1.name;
      reasons.push('more Earth-like orbital period');
    } else if (p2OrbitalDiff < p1OrbitalDiff - 30) {
      if (winner !== p1.name) winner = p2.name;
      reasons.push('more Earth-like orbital period');
    }

    if (winner === 'tie') {
      verdict = `Both ${p1.name} and ${p2.name} show remarkably similar characteristics for potential biosignatures.`;
    } else {
      verdict = `${winner} appears more promising for potential biosignatures due to ${reasons.slice(0, 3).join(', ')}.`;
    }

    return { winner, verdict, reasons };
  };

  // Simple, clean search component - no complex state management
  const SimpleSearchBox: React.FC<{
    placeholder: string;
    onSelect: (planet: ExtendedExoplanet) => void;
    planets: ExtendedExoplanet[];
  }> = ({ placeholder, onSelect, planets }) => {
    const [inputValue, setInputValue] = React.useState('');
    const [isOpen, setIsOpen] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement>(null);

    // Simple filtering - no complex state
    const filteredResults = React.useMemo(() => {
      if (!inputValue.trim()) return [];
      
      const search = inputValue.toLowerCase();
      return planets.filter(planet => 
        planet.name.toLowerCase().includes(search) ||
        planet.constellation.toLowerCase().includes(search) ||
        planet.discoveryYear.toString().includes(search) ||
        planet.habitabilityScore.toString().includes(search)
      ).slice(0, 10);
    }, [inputValue, planets]);

    // Simple handlers - no complex logic
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value);
      setIsOpen(e.target.value.length > 0);
    };

    const handleSelect = (planet: ExtendedExoplanet) => {
      onSelect(planet);
      setInputValue('');
      setIsOpen(false);
      inputRef.current?.focus();
    };

    const handleClear = () => {
      setInputValue('');
      setIsOpen(false);
      inputRef.current?.focus();
    };

    return (
      <div className="relative">
        {/* Simple Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          
          <input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={inputValue}
            onChange={handleInputChange}
            onFocus={() => setIsOpen(inputValue.length > 0)}
            className="w-full pl-10 pr-10 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 text-lg"
          />
          
          {inputValue && (
            <button
              onClick={handleClear}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Simple Dropdown */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-white/20 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
            {filteredResults.length > 0 ? (
              filteredResults.map(planet => (
                <button
                  key={planet.id}
                  onClick={() => handleSelect(planet)}
                  className="w-full px-4 py-3 text-left hover:bg-white/10 border-b border-white/10 last:border-b-0 flex items-center gap-3"
                >
                  <div className={`w-3 h-3 rounded-full ${getTemperatureColor(planet.temperature)}`} />
                  <div>
                    <div className="text-white font-medium">{planet.name}</div>
                    <div className="text-gray-400 text-sm">
                      {planet.constellation} • {planet.discoveryYear} • {planet.habitabilityScore}/100
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="px-4 py-6 text-center text-gray-400">
                No planets found for "{inputValue}"
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

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

      <h3 className="text-2xl font-bold text-white mb-4 text-center">{expandConstellationName(planet.name)}</h3>
      
      {/* Constellation Info */}
      {getConstellationInfo(planet.name) && (
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 rounded-full border border-blue-500/30">
            <Info className="w-3 h-3 text-blue-400" />
            <span className="text-xs text-blue-400 font-medium">
              {getConstellationInfo(planet.name)?.fullName}
            </span>
          </div>
        </div>
      )}

      {/* Key Stats */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-green-400" />
            <span className="text-gray-300">Orbital Period</span>
          </div>
          <span className="text-white font-medium">{planet.orbitalPeriod > 0 ? `${planet.orbitalPeriod.toFixed(1)} days` : 'Unknown'}</span>
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
            <Star className="w-5 h-5 text-yellow-400" />
            <span className="text-gray-300">Stellar Temperature</span>
          </div>
          <span className="text-white font-medium">{planet.temperature > 0 ? `${planet.temperature.toFixed(0)}K` : 'Unknown'}</span>
        </div>
      </div>

      {/* Biosignature Score */}
      <div className="mb-6">
        <div className="bg-gradient-to-br from-amber-900/30 to-yellow-900/30 rounded-xl p-4 border border-amber-500/30">
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-300 mb-2">
              {(() => {
                try {
                  // Use the EXACT same calculation as BiosignaturePanel
                  const biosignatureInput = generatePlanetBiosignatures({
                    temperature: planet.temperature,
                    radius: planet.radius,
                    mass: planet.mass,
                    starType: 'G', // Default to G-type star
                    inHabitableZone: planet.inHabitableZone,
                    habitabilityScore: planet.habitabilityScore
                  });
                  const biosignatureReport = generateBiosignatureReport(biosignatureInput);
                  return biosignatureReport['Habitability Score'].toFixed(1);
                } catch (error) {
                  console.error('Biosignature calculation error:', error);
                  return planet.biosignatures.length > 0 ? 
                    Math.min(planet.biosignatures.length * 25, 100) : 
                    Math.round(planet.habitabilityScore * 10);
                }
              })()}/100
            </div>
            <div className="text-white font-medium mb-2">Biosignature Score</div>
            
            {/* Progress Bar */}
            <div className="w-full bg-white/20 rounded-full h-2 mb-3">
              <div
                className="h-2 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full transition-all duration-500"
                style={{ 
                  width: `${(() => {
                    try {
                      const biosignatureInput = generatePlanetBiosignatures({
                        temperature: planet.temperature,
                        radius: planet.radius,
                        mass: planet.mass,
                        starType: 'G',
                        inHabitableZone: planet.inHabitableZone,
                        habitabilityScore: planet.habitabilityScore
                      });
                      const biosignatureReport = generateBiosignatureReport(biosignatureInput);
                      return biosignatureReport['Habitability Score'] || 0;
                    } catch (error) {
                      return planet.biosignatures.length > 0 ? 
                        Math.min(planet.biosignatures.length * 25, 100) : 
                        Math.round(planet.habitabilityScore * 10);
                    }
                  })()}%` 
                }}
              />
            </div>
            
            <div className="text-amber-200 text-sm">
              {(() => {
                try {
                  const biosignatureInput = generatePlanetBiosignatures({
                    temperature: planet.temperature,
                    radius: planet.radius,
                    mass: planet.mass,
                    starType: 'G',
                    inHabitableZone: planet.inHabitableZone,
                    habitabilityScore: planet.habitabilityScore
                  });
                  const biosignatureReport = generateBiosignatureReport(biosignatureInput);
                  const score = biosignatureReport['Habitability Score'];
                  if (score >= 80) return 'Excellent conditions for life';
                  else if (score >= 60) return 'Good potential for life';
                  else if (score >= 40) return 'Marginal habitability';
                  else return 'Challenging conditions for life';
                } catch (error) {
                  return planet.biosignatures.length > 0 ? 
                    `${planet.biosignatures.length} biosignature${planet.biosignatures.length !== 1 ? 's' : ''} detected` :
                    'Based on habitability analysis';
                }
              })()}
            </div>
          </div>
        </div>
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
        <div className="text-gray-500 text-xs mt-1">{planet.constellation ? `in ${planet.constellation}` : 'Exoplanet'}</div>
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
              <SimpleSearchBox
                placeholder="Search for first planet..."
                onSelect={setSelectedPlanet1}
                planets={planets}
              />
            </div>
            
            <div>
              <label className="block text-white font-semibold mb-3">Select Second Planet</label>
              <SimpleSearchBox
                placeholder="Search for second planet..."
                onSelect={setSelectedPlanet2}
                planets={planets}
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
                      Stellar Temperature
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">{selectedPlanet1.name}:</span>
                        <span className="text-white">{selectedPlanet1.temperature > 0 ? `${selectedPlanet1.temperature.toFixed(0)}K` : 'Unknown'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">{selectedPlanet2.name}:</span>
                        <span className="text-white">{selectedPlanet2.temperature > 0 ? `${selectedPlanet2.temperature.toFixed(0)}K` : 'Unknown'}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        Sun-like: ~5778K
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
                      <Clock className="w-4 h-4 text-green-400" />
                      Orbital Period
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">{selectedPlanet1.name}:</span>
                        <span className="text-white">{selectedPlanet1.orbitalPeriod > 0 ? `${selectedPlanet1.orbitalPeriod.toFixed(1)} days` : 'Unknown'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">{selectedPlanet2.name}:</span>
                        <span className="text-white">{selectedPlanet2.orbitalPeriod > 0 ? `${selectedPlanet2.orbitalPeriod.toFixed(1)} days` : 'Unknown'}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        Earth: 365.25 days
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Comparison Metrics */}
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div className="bg-white/5 rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <Target className="w-4 h-4 text-amber-400" />
                      Biosignature Score
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">{selectedPlanet1.name}:</span>
                        <span className="text-white">
                          {selectedPlanet1.biosignatures.length > 0 ? 
                            Math.min(selectedPlanet1.biosignatures.length * 25, 100) : 
                            Math.round(selectedPlanet1.habitabilityScore * 10)
                          }/100
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">{selectedPlanet2.name}:</span>
                        <span className="text-white">
                          {selectedPlanet2.biosignatures.length > 0 ? 
                            Math.min(selectedPlanet2.biosignatures.length * 25, 100) : 
                            Math.round(selectedPlanet2.habitabilityScore * 10)
                          }/100
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        Based on detected biosignatures or habitability analysis
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-blue-400" />
                      Surface Gravity
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">{selectedPlanet1.name}:</span>
                        <span className="text-white">{selectedPlanet1.surfaceGravity.toFixed(2)}g</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">{selectedPlanet2.name}:</span>
                        <span className="text-white">{selectedPlanet2.surfaceGravity.toFixed(2)}g</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        Earth: 1.00g
                      </div>
                    </div>
                  </div>
                </div>

                {/* Visual Comparison Bars */}
                <div className="mt-6 space-y-4">
                  <h4 className="text-white font-semibold text-lg text-center mb-4">Visual Comparison</h4>
                  
                  {/* Biosignature Score Comparison */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>{selectedPlanet1.name}</span>
                      <span>Biosignature Score</span>
                      <span>{selectedPlanet2.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 bg-gray-700 rounded-full h-3">
                        <div 
                          className="h-3 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full transition-all duration-1000"
                          style={{ width: `${selectedPlanet1.biosignatures.length > 0 ? Math.min(selectedPlanet1.biosignatures.length * 25, 100) : Math.round(selectedPlanet1.habitabilityScore * 10)}%` }}
                        />
                      </div>
                      <span className="text-white font-bold text-sm w-16 text-center">
                        {selectedPlanet1.biosignatures.length > 0 ? 
                          Math.min(selectedPlanet1.biosignatures.length * 25, 100) : 
                          Math.round(selectedPlanet1.habitabilityScore * 10)
                        }
                      </span>
                      <div className="flex-1 bg-gray-700 rounded-full h-3">
                        <div 
                          className="h-3 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full transition-all duration-1000"
                          style={{ width: `${selectedPlanet2.biosignatures.length > 0 ? Math.min(selectedPlanet2.biosignatures.length * 25, 100) : Math.round(selectedPlanet2.habitabilityScore * 10)}%` }}
                        />
                      </div>
                      <span className="text-white font-bold text-sm w-16 text-center">
                        {selectedPlanet2.biosignatures.length > 0 ? 
                          Math.min(selectedPlanet2.biosignatures.length * 25, 100) : 
                          Math.round(selectedPlanet2.habitabilityScore * 10)
                        }
                      </span>
                    </div>
                  </div>

                  {/* Radius Comparison */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>{selectedPlanet1.name}</span>
                      <span>Radius (Earth = 1.0)</span>
                      <span>{selectedPlanet2.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 bg-gray-700 rounded-full h-3">
                        <div 
                          className="h-3 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full transition-all duration-1000"
                          style={{ width: `${Math.min(selectedPlanet1.radius * 20, 100)}%` }}
                        />
                      </div>
                      <span className="text-white font-bold text-sm w-16 text-center">{selectedPlanet1.radius.toFixed(1)}⊕</span>
                      <div className="flex-1 bg-gray-700 rounded-full h-3">
                        <div 
                          className="h-3 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full transition-all duration-1000"
                          style={{ width: `${Math.min(selectedPlanet2.radius * 20, 100)}%` }}
                        />
                      </div>
                      <span className="text-white font-bold text-sm w-16 text-center">{selectedPlanet2.radius.toFixed(1)}⊕</span>
                    </div>
                  </div>
                </div>

                {/* Scientific Note */}
                <div className="mt-6 p-4 bg-blue-900/20 rounded-lg border border-blue-500/20">
                  <p className="text-blue-300 text-sm leading-relaxed">
                    <strong>Scientific Note:</strong> This comparison is based on current scientific models including 
                    biosignature analysis, atmospheric composition indicators, planetary characteristics analysis, and 
                    potential life-supporting conditions. Actual biosignature potential depends on many factors not yet fully 
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