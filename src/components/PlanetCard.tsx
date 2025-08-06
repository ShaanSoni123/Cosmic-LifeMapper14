import React from 'react';
import { Thermometer, Clock, Star, Globe, Zap, Calendar, Activity, Droplets } from 'lucide-react';
import { ExtendedExoplanet } from '../utils/exoplanetAnalysis';
import { generatePlanetBiosignatures, generateBiosignatureReport } from '../utils/biosignatureAnalysis';

interface PlanetCardProps {
  planet: ExtendedExoplanet;
  onClick: () => void;
}

export const PlanetCard: React.FC<PlanetCardProps> = ({ planet, onClick }) => {
  // Calculate real biosignature score for this planet
  const biosignatureInput = generatePlanetBiosignatures({
    temperature: planet.temperature,
    radius: planet.radius,
    mass: planet.mass,
    starType: planet.starType,
    inHabitableZone: planet.inHabitableZone,
    habitabilityScore: planet.habitabilityScore
  });
  const biosignatureReport = generateBiosignatureReport(biosignatureInput);
  const realBiosignatureScore = biosignatureReport['Habitability Score'];

  const getTemperatureColor = (temp: number) => {
    if (temp < 200) return 'from-blue-500 to-cyan-300';
    if (temp < 280) return 'from-green-500 to-emerald-300';
    if (temp < 350) return 'from-orange-500 to-yellow-300';
    return 'from-red-500 to-pink-300';
  };

  const getBiosignatureColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div
      onClick={onClick}
      className="group relative cursor-pointer transform transition-all duration-500 hover:scale-105"
    >
      {/* Planet visualization */}
      <div className="relative w-24 h-24 mx-auto mb-4">
        <div
          className={`absolute inset-0 rounded-full bg-gradient-to-br ${getTemperatureColor(
            planet.temperature
          )} shadow-2xl animate-pulse group-hover:animate-none transition-all duration-500`}
          style={{
            boxShadow: `0 0 30px rgba(${planet.temperature < 280 ? '34, 197, 94' : '239, 68, 68'}, 0.4)`,
          }}
        />
        <div className="absolute inset-2 rounded-full bg-gradient-to-br from-transparent to-black/20" />
        
        {/* Orbital rings */}
        <div className="absolute -inset-8 border border-white/10 rounded-full animate-spin-slow" />
        <div className="absolute -inset-12 border border-white/5 rounded-full animate-spin-reverse" />
      </div>

      {/* Planet info card */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 shadow-xl">
        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
          {planet.name}
        </h3>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-gray-300">
            <Globe className="w-4 h-4" />
            <span>{planet.distanceFromEarth} ly away</span>
          </div>
          
          <div className="flex items-center gap-2 text-gray-300">
            <Clock className="w-4 h-4" />
            <span>{planet.orbitalPeriod} days</span>
          </div>
          
          <div className="flex items-center gap-2 text-gray-300">
            <Thermometer className="w-4 h-4" />
            <span>{planet.temperature}K</span>
          </div>
          
          <div className="flex items-center gap-2 text-gray-300">
            <Star className="w-4 h-4" />
            <span>{planet.starType}</span>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-white/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400">Biosignature Score</span>
            <span className={`text-sm font-bold ${getBiosignatureColor(realBiosignatureScore)}`}>
              {realBiosignatureScore.toFixed(1)}/100
            </span>
          </div>
          
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-1000 ${
                realBiosignatureScore >= 80 ? 'bg-gradient-to-r from-green-500 to-emerald-400' :
                realBiosignatureScore >= 60 ? 'bg-gradient-to-r from-yellow-500 to-orange-400' :
                realBiosignatureScore >= 40 ? 'bg-gradient-to-r from-orange-500 to-red-400' :
                'bg-gradient-to-r from-red-500 to-red-600'
              }`}
              style={{ width: `${realBiosignatureScore}%` }}
            />
          </div>
        </div>

        {/* Scientific indicators */}
        <div className="mt-3 pt-3 border-t border-white/20">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <Activity className="w-3 h-3 text-blue-400" />
              <span className="text-gray-400">Gravity:</span>
              <span className="text-white">{planet.surfaceGravity.toFixed(1)}g</span>
            </div>
            <div className="flex items-center gap-1">
              <Droplets className="w-3 h-3 text-cyan-400" />
              <span className="text-gray-400">Bio Score:</span>
              <span className="text-white">{realBiosignatureScore.toFixed(0)}</span>
            </div>
          </div>
          
          <div className="mt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Cluster:</span>
              <span className="text-xs text-cyan-300">{planet.clusterLabel.split(' ')[0]} {planet.clusterLabel.split(' ')[1]}</span>
            </div>
          </div>
        </div>

        {planet.biosignatures.length > 0 && (
          <div className="mt-3 pt-3 border-t border-white/20">
            <div className="flex items-center gap-1 mb-1">
              <Zap className="w-3 h-3 text-green-400" />
              <span className="text-xs text-green-400 font-medium">Biosignatures</span>
            </div>
            <span className="text-xs text-gray-300">
              {planet.biosignatures.length} detected
            </span>
          </div>
        )}
      </div>
    </div>
  );
};