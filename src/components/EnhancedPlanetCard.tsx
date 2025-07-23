import React from 'react';
import { Thermometer, Clock, Star, Globe, Calendar, Activity, Droplets, Ruler, Weight, Target } from 'lucide-react';
import { HabitabilityBar } from './HabitabilityBar';

interface EnhancedPlanetCardProps {
  planet: {
    id: string;
    name: string;
    distanceFromEarth?: number;
    orbitalPeriod?: number;
    temperature?: number;
    starType?: string;
    radius?: number;
    mass?: number;
    discoveryYear?: number;
    discoveryMethod?: string;
    discoveryFacility?: string;
    constellation?: string;
    habitabilityScore: number;
    inHabitableZone: boolean;
    stellarTemperature?: number;
    orbitalDistance?: number;
  };
  onClick: () => void;
}

export const EnhancedPlanetCard: React.FC<EnhancedPlanetCardProps> = ({ planet, onClick }) => {
  const getTemperatureColor = (temp?: number) => {
    if (!temp) return 'from-gray-500 to-gray-300';
    if (temp < 200) return 'from-blue-500 to-cyan-300';
    if (temp < 280) return 'from-green-500 to-emerald-300';
    if (temp < 350) return 'from-orange-500 to-yellow-300';
    return 'from-red-500 to-pink-300';
  };

  const displayTemp = planet.temperature || planet.stellarTemperature || 288;

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer transform transition-all duration-500 hover:scale-105"
    >
      {/* Planet visualization */}
      <div className="relative w-20 h-20 mx-auto mb-4">
        <div
          className={`absolute inset-0 rounded-full bg-gradient-to-br ${getTemperatureColor(
            displayTemp
          )} shadow-xl animate-pulse group-hover:animate-none transition-all duration-500`}
          style={{
            boxShadow: `0 0 20px rgba(${displayTemp < 280 ? '34, 197, 94' : '239, 68, 68'}, 0.3)`,
          }}
        />
        <div className="absolute inset-1 rounded-full bg-gradient-to-br from-transparent to-black/20" />
        
        {/* Orbital rings */}
        <div className="absolute -inset-6 border border-white/10 rounded-full animate-spin-slow" />
        <div className="absolute -inset-8 border border-white/5 rounded-full animate-spin-reverse" />
      </div>

      {/* Enhanced Planet info card */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 shadow-xl">
        <h3 className="text-lg font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors truncate">
          {planet.name}
        </h3>
        
        {/* Primary Stats */}
        <div className="space-y-2 text-sm mb-4">
          {planet.distanceFromEarth && (
            <div className="flex items-center gap-2 text-gray-300">
              <Globe className="w-4 h-4 text-blue-400" />
              <span>{planet.distanceFromEarth.toFixed(1)} ly</span>
            </div>
          )}
          
          {planet.orbitalPeriod && (
            <div className="flex items-center gap-2 text-gray-300">
              <Clock className="w-4 h-4 text-green-400" />
              <span>{planet.orbitalPeriod.toFixed(1)} days</span>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-gray-300">
            <Thermometer className="w-4 h-4 text-red-400" />
            <span>{displayTemp.toFixed(0)}K</span>
          </div>
          
          {planet.starType && (
            <div className="flex items-center gap-2 text-gray-300">
              <Star className="w-4 h-4 text-yellow-400" />
              <span>{planet.starType}</span>
            </div>
          )}
        </div>

        {/* Physical Properties */}
        <div className="grid grid-cols-2 gap-2 text-xs mb-4">
          {planet.radius && (
            <div className="flex items-center gap-1">
              <Ruler className="w-3 h-3 text-purple-400" />
              <span className="text-gray-400">R:</span>
              <span className="text-white">{planet.radius.toFixed(1)}⊕</span>
            </div>
          )}
          
          {planet.mass && (
            <div className="flex items-center gap-1">
              <Weight className="w-3 h-3 text-orange-400" />
              <span className="text-gray-400">M:</span>
              <span className="text-white">{planet.mass.toFixed(1)}⊕</span>
            </div>
          )}
          
          {planet.discoveryYear && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-cyan-400" />
              <span className="text-gray-400">Disc:</span>
              <span className="text-white">{planet.discoveryYear}</span>
            </div>
          )}
          
          {planet.discoveryMethod && (
            <div className="flex items-center gap-1">
              <Activity className="w-3 h-3 text-pink-400" />
              <span className="text-gray-400 truncate text-xs">
                {planet.discoveryMethod.split(' ')[0]}
              </span>
            </div>
          )}
        </div>

        {/* Habitability Score Bar */}
        <div className="pt-3 border-t border-white/20">
          <HabitabilityBar score={planet.habitabilityScore} size="medium" />
        </div>

        {/* Special Indicators */}
        <div className="mt-3 flex flex-wrap gap-1">
          {planet.inHabitableZone && (
            <div className="flex items-center gap-1 px-2 py-1 bg-green-500/20 rounded-full border border-green-500/30">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-400 font-medium">HZ</span>
            </div>
          )}
          
          {planet.habitabilityScore >= 70 && (
            <div className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 rounded-full border border-blue-500/30">
              <Target className="w-3 h-3 text-blue-400" />
              <span className="text-xs text-blue-400 font-medium">Prime</span>
            </div>
          )}
        </div>

        {/* Discovery Info */}
        <div className="mt-2">
          <div className="text-xs text-gray-500 truncate">
            {planet.constellation && `${planet.constellation} constellation`}
            {planet.discoveryFacility && ` • ${planet.discoveryFacility}`}
          </div>
        </div>
      </div>
    </div>
  );
};