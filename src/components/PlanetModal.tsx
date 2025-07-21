import React from 'react';
import { X, Globe, Clock, Thermometer, Star, Zap, Calendar, Weight, Ruler, Activity, Droplets, Shield, Target } from 'lucide-react';
import { ExtendedExoplanet, generateDetailedReport } from '../utils/exoplanetAnalysis';

interface PlanetModalProps {
  planet: ExtendedExoplanet;
  isOpen: boolean;
  onClose: () => void;
}

export const PlanetModal: React.FC<PlanetModalProps> = ({ planet, isOpen, onClose }) => {
  if (!isOpen) return null;

  const getTemperatureColor = (temp: number) => {
    if (temp < 200) return 'from-blue-500 to-cyan-300';
    if (temp < 280) return 'from-green-500 to-emerald-300';
    if (temp < 350) return 'from-orange-500 to-yellow-300';
    return 'from-red-500 to-pink-300';
  };

  const getHabitabilityColor = (score: number) => {
    if (score >= 8) return 'text-green-400';
    if (score >= 6) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900/90 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative p-6 border-b border-white/20">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-6">
            {/* Large planet visualization */}
            <div className="relative w-32 h-32">
              <div
                className={`absolute inset-0 rounded-full bg-gradient-to-br ${getTemperatureColor(
                  planet.temperature
                )} shadow-2xl`}
                style={{
                  boxShadow: `0 0 50px rgba(${planet.temperature < 280 ? '34, 197, 94' : '239, 68, 68'}, 0.6)`,
                }}
              />
              <div className="absolute inset-4 rounded-full bg-gradient-to-br from-transparent to-black/30" />
              
              {/* Orbital rings */}
              <div className="absolute -inset-8 border border-white/10 rounded-full animate-spin-slow" />
              <div className="absolute -inset-16 border border-white/5 rounded-full animate-spin-reverse" />
            </div>
            
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">{planet.name}</h2>
              <p className="text-gray-300 mb-4">Located in the {planet.constellation} constellation</p>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">Habitability:</span>
                  <span className={`text-xl font-bold ${getHabitabilityColor(planet.habitabilityScore)}`}>
                    {planet.habitabilityScore}/10
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300">
                    {planet.inHabitableZone ? 'In Habitable Zone' : 'Outside Habitable Zone'}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300">Discovered {planet.discoveryYear}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 grid md:grid-cols-2 gap-6">
          {/* Physical Properties */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-4">Physical Properties</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-blue-400" />
                  <span className="text-gray-300">Distance from Earth</span>
                </div>
                <span className="text-white font-medium">{planet.distanceFromEarth} light years</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <Ruler className="w-5 h-5 text-purple-400" />
                  <span className="text-gray-300">Radius</span>
                </div>
                <span className="text-white font-medium">{planet.radius} Earth radii</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <Weight className="w-5 h-5 text-orange-400" />
                  <span className="text-gray-300">Mass</span>
                </div>
                <span className="text-white font-medium">{planet.mass} Earth masses</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <Thermometer className="w-5 h-5 text-red-400" />
                  <span className="text-gray-300">Equilibrium Temperature</span>
                </div>
                <span className="text-white font-medium">{planet.temperature}K ({Math.round(planet.temperature - 273.15)}°C)</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <Thermometer className="w-5 h-5 text-orange-400" />
                  <span className="text-gray-300">Surface Temperature</span>
                </div>
                <span className="text-white font-medium">{planet.surfaceTemperature.toFixed(1)}K ({Math.round(planet.surfaceTemperature - 273.15)}°C)</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-green-400" />
                  <span className="text-gray-300">Surface Gravity</span>
                </div>
                <span className="text-white font-medium">{planet.surfaceGravity.toFixed(2)} Earth g</span>
              </div>
            </div>
          </div>

          {/* Habitability Analysis */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-4">Habitability Analysis</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <Droplets className="w-5 h-5 text-cyan-400" />
                  <span className="text-gray-300">Water Retention</span>
                </div>
                <span className="text-white font-medium">{(planet.waterRetentionPotential * 100).toFixed(1)}%</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-red-400" />
                  <span className="text-gray-300">Radiation Hazard</span>
                </div>
                <span className="text-white font-medium">{(planet.radiationHazardIndex * 100).toFixed(1)}%</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <Target className="w-5 h-5 text-purple-400" />
                  <span className="text-gray-300">Cluster Category</span>
                </div>
                <span className="text-white font-medium text-sm">{planet.clusterLabel}</span>
              </div>
            </div>
          </div>

          {/* Orbital Properties */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-4">Orbital Properties</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-green-400" />
                  <span className="text-gray-300">Orbital Period</span>
                </div>
                <span className="text-white font-medium">{planet.orbitalPeriod} Earth days</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <Star className="w-5 h-5 text-yellow-400" />
                  <span className="text-gray-300">Star Type</span>
                </div>
                <span className="text-white font-medium">{planet.starType}</span>
              </div>
            </div>
          </div>

          {/* Biosignatures */}
          {planet.biosignatures.length > 0 && (
            <div className="md:col-span-3">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-green-400" />
                Biosignatures Detected
              </h3>
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {planet.biosignatures.map((biosignature, index) => (
                  <div
                    key={index}
                    className="p-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg border border-green-500/30"
                  >
                    <span className="text-green-300 font-medium">{biosignature}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                <p className="text-green-300 text-sm">
                  <strong>Note:</strong> These biosignatures suggest the potential for life or life-supporting conditions. 
                  Further observation and analysis are needed to confirm biological origins.
                </p>
              </div>
            </div>
          )}
          
          {/* Scientific Report */}
          <div className="md:col-span-2">
            <h3 className="text-xl font-bold text-white mb-4">Scientific Analysis</h3>
            
            {/* Habitability Score Card */}
            <div className="mb-6 p-6 bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-xl border border-purple-500/30 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-bold text-white flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-400" />
                  Overall Habitability Assessment
                </h4>
                <div className="text-right">
                  <div className={`text-3xl font-bold ${getHabitabilityColor(planet.habitabilityScore)}`}>
                    {planet.habitabilityScore.toFixed(1)}/10
                  </div>
                  <div className="text-sm text-gray-400">Composite Score</div>
                </div>
              </div>
              
              <div className="w-full bg-gray-700 rounded-full h-3 mb-4">
                <div
                  className={`h-3 rounded-full transition-all duration-1000 ${
                    planet.habitabilityScore >= 7 ? 'bg-gradient-to-r from-green-500 to-emerald-400' :
                    planet.habitabilityScore >= 5 ? 'bg-gradient-to-r from-yellow-500 to-orange-400' :
                    planet.habitabilityScore >= 2.5 ? 'bg-gradient-to-r from-orange-500 to-red-400' :
                    'bg-gradient-to-r from-red-500 to-red-600'
                  }`}
                  style={{ width: `${planet.habitabilityScore * 10}%` }}
                />
              </div>
              
              <p className="text-gray-300 text-sm leading-relaxed">
                This score synthesizes multiple factors including habitable zone placement, planetary characteristics, 
                water retention potential, and radiation environment. Higher scores indicate more Earth-like conditions 
                suitable for potential life as we know it.
              </p>
            </div>

            {/* Detailed Metrics Grid */}
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              {/* Habitable Zone Analysis */}
              <div className="p-4 bg-gradient-to-br from-green-900/20 to-emerald-900/20 rounded-lg border border-green-500/20">
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-3 h-3 rounded-full ${planet.inHabitableZone ? 'bg-green-400' : 'bg-red-400'}`} />
                  <h5 className="font-semibold text-white">Habitable Zone Status</h5>
                </div>
                <p className={`text-sm ${planet.inHabitableZone ? 'text-green-300' : 'text-red-300'}`}>
                  {planet.inHabitableZone ? 'Within optimal distance for liquid water' : 'Outside the habitable zone'}
                </p>
                <div className="mt-2 text-xs text-gray-400">
              {/* Water Retention */}
              <div className="p-4 bg-gradient-to-br from-cyan-900/20 to-blue-900/20 rounded-lg border border-cyan-500/20">
                <div className="flex items-center gap-2 mb-3">
                  <Droplets className="w-4 h-4 text-cyan-400" />
                  <h5 className="font-semibold text-white">Water Retention</h5>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-cyan-300 text-lg font-bold">
                    {(planet.waterRetentionPotential * 100).toFixed(0)}%
                  </span>
                  <span className="text-xs text-gray-400">Potential</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-400"
                    style={{ width: `${planet.waterRetentionPotential * 100}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Ability to maintain liquid water on surface
                </p>
              </div>
                  Based on Kopparapu et al. 2013 calculations
              {/* Surface Conditions */}
              <div className="p-4 bg-gradient-to-br from-orange-900/20 to-red-900/20 rounded-lg border border-orange-500/20">
                <div className="flex items-center gap-2 mb-3">
                  <Activity className="w-4 h-4 text-orange-400" />
                  <h5 className="font-semibold text-white">Surface Conditions</h5>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Gravity:</span>
                    <span className="text-white">{planet.surfaceGravity.toFixed(2)}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Surface Temp:</span>
                    <span className="text-white">{Math.round(planet.surfaceTemperature - 273.15)}°C</span>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Estimated physical surface conditions
                </p>
              </div>
                </div>
              {/* Radiation Environment */}
              <div className="p-4 bg-gradient-to-br from-red-900/20 to-pink-900/20 rounded-lg border border-red-500/20">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-4 h-4 text-red-400" />
                  <h5 className="font-semibold text-white">Radiation Hazard</h5>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-red-300 text-lg font-bold">
                    {(planet.radiationHazardIndex * 100).toFixed(0)}%
                  </span>
                  <span className="text-xs text-gray-400">Risk Level</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-red-500 to-pink-400"
                    style={{ width: `${planet.radiationHazardIndex * 100}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Stellar radiation and activity impact
                </p>
              </div>
            </div>
              </div>
            {/* Scientific Context */}
            <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-600/30">
              <h5 className="font-semibold text-white mb-3 flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-400" />
                Scientific Methodology
              </h5>
              <div className="text-sm text-gray-300 space-y-2">
                <p>
                  <strong className="text-white">Habitability Assessment:</strong> Based on peer-reviewed models including 
                  Kopparapu et al. (2013) habitable zone calculations, surface gravity analysis, and water retention modeling.
                </p>
                <p>
                  <strong className="text-white">Temperature Estimation:</strong> Uses blackbody equilibrium calculations 
                  considering stellar radiation, orbital distance, and assumed Earth-like albedo (0.3).
                </p>
                <p>
                  <strong className="text-white">Clustering Analysis:</strong> Machine learning classification groups planets 
                  by similar habitability characteristics for comparative analysis.
                </p>
              </div>
              
              <div className="mt-4 pt-3 border-t border-gray-600/30">
                <h6 className="text-xs font-semibold text-gray-400 mb-2">KEY REFERENCES</h6>
                <div className="text-xs text-gray-400 space-y-1">
                  <div>• Kopparapu et al., "Habitable Zones around Main-sequence Stars", ApJ, 2013</div>
                  <div>• NASA Exoplanet Archive: exoplanetarchive.ipac.caltech.edu</div>
                  <div>• Seager, "Exoplanet Atmospheres: Physical Processes", 2010</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};