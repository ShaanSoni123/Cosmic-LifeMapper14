import React from 'react';
import { Zap, Thermometer, Wind, Droplets, AlertTriangle, CheckCircle, Info, Beaker, Atom, Microscope } from 'lucide-react';
import { generatePlanetBiosignatures, generateBiosignatureReport, interpretBiosignatureResults } from '../utils/biosignatureAnalysis';

interface BiosignaturePanelProps {
  planet: {
    temperature: number;
    radius: number;
    mass: number;
    starType: string;
    inHabitableZone: boolean;
    habitabilityScore: number;
    name: string;
  };
}

export const BiosignaturePanel: React.FC<BiosignaturePanelProps> = ({ planet }) => {
  // Generate biosignature data for this planet
  const biosignatureInput = generatePlanetBiosignatures(planet);
  const biosignatureReport = generateBiosignatureReport(biosignatureInput);
  const interpretation = interpretBiosignatureResults(biosignatureReport);

  const getChemicalIcon = (chemical: string) => {
    switch (chemical) {
      case 'H2': return <Atom className="w-4 h-4" />;
      case 'O2': return <Wind className="w-4 h-4" />;
      case 'N2': return <Wind className="w-4 h-4" />;
      case 'CO2': return <Thermometer className="w-4 h-4" />;
      case 'NH3': return <Beaker className="w-4 h-4" />;
      case 'C2H6': return <Atom className="w-4 h-4" />;
      case 'SO2': return <AlertTriangle className="w-4 h-4" />;
      case 'H2S': return <AlertTriangle className="w-4 h-4" />;
      default: return <Microscope className="w-4 h-4" />;
    }
  };

  const getChemicalColor = (chemical: string, survival: number) => {
    if (survival >= 80) return 'text-green-400';
    if (survival >= 60) return 'text-yellow-400';
    if (survival >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getChemicalBg = (chemical: string, survival: number) => {
    if (survival >= 80) return 'bg-green-500/20 border-green-500/30';
    if (survival >= 60) return 'bg-yellow-500/20 border-yellow-500/30';
    if (survival >= 40) return 'bg-orange-500/20 border-orange-500/30';
    return 'bg-red-500/20 border-red-500/30';
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'from-green-900/30 to-emerald-900/30 border-green-500/30';
    if (score >= 60) return 'from-yellow-900/30 to-orange-900/30 border-yellow-500/30';
    if (score >= 40) return 'from-orange-900/30 to-red-900/30 border-orange-500/30';
    return 'from-red-900/30 to-pink-900/30 border-red-500/30';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-3">
          <Zap className="w-8 h-8 text-purple-400" />
          Biosignature Analysis
        </h3>
        <p className="text-gray-300">
          Atmospheric composition analysis for {planet.name}
        </p>
      </div>

      {/* Overall Score */}
      <div className={`bg-gradient-to-br ${getScoreBg(biosignatureReport['Habitability Score'])} rounded-xl p-6 border backdrop-blur-sm`}>
        <div className="text-center">
          <div className={`text-4xl font-bold ${getScoreColor(biosignatureReport['Habitability Score'])} mb-2`}>
            {biosignatureReport['Habitability Score'].toFixed(1)}/100
          </div>
          <div className="text-white font-semibold text-lg mb-3">Biosignature Habitability Score</div>
          <div className="text-gray-300 text-sm leading-relaxed">
            {interpretation.overall}
          </div>
        </div>
      </div>

      {/* Chemical Analysis Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {Object.entries(biosignatureReport).map(([chemical, value]) => {
          if (chemical === 'Habitability Score') return null;
          
          const inputValue = biosignatureInput[chemical as keyof typeof biosignatureInput];
          const survival = value as number;
          
          return (
            <div
              key={chemical}
              className={`p-4 rounded-lg border ${getChemicalBg(chemical, survival)} backdrop-blur-sm`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={getChemicalColor(chemical, survival)}>
                    {getChemicalIcon(chemical)}
                  </div>
                  <span className="text-white font-semibold">{chemical}</span>
                </div>
                <div className={`text-lg font-bold ${getChemicalColor(chemical, survival)}`}>
                  {survival}%
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Concentration:</span>
                  <span className="text-white">
                    {inputValue?.toFixed(chemical === 'NH3' || chemical === 'C2H6' || chemical === 'SO2' || chemical === 'H2S' ? 4 : 2)}
                    {chemical === 'Temperature' ? '°C' : 
                     chemical === 'N2' || chemical === 'O2' || chemical === 'CO2' ? '%' : 'ppm'}
                  </span>
                </div>
                
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-1000 ${
                      survival >= 80 ? 'bg-gradient-to-r from-green-500 to-emerald-400' :
                      survival >= 60 ? 'bg-gradient-to-r from-yellow-500 to-orange-400' :
                      survival >= 40 ? 'bg-gradient-to-r from-orange-500 to-red-400' :
                      'bg-gradient-to-r from-red-500 to-red-600'
                    }`}
                    style={{ width: `${survival}%` }}
                  />
                </div>
                
                <div className="text-xs text-gray-400">
                  Survival probability: {survival}%
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Life Indicators */}
      {interpretation.lifeIndicators.length > 0 && (
        <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 rounded-xl p-6 border border-green-500/30">
          <h4 className="text-lg font-bold text-green-300 mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Positive Life Indicators
          </h4>
          <div className="space-y-2">
            {interpretation.lifeIndicators.map((indicator, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-green-200 text-sm leading-relaxed">{indicator}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Concerns */}
      {interpretation.concerns.length > 0 && (
        <div className="bg-gradient-to-br from-red-900/20 to-pink-900/20 rounded-xl p-6 border border-red-500/30">
          <h4 className="text-lg font-bold text-red-300 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Environmental Concerns
          </h4>
          <div className="space-y-2">
            {interpretation.concerns.map((concern, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-red-200 text-sm leading-relaxed">{concern}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detailed Analysis */}
      <div className="bg-gradient-to-br from-blue-900/20 to-indigo-900/20 rounded-xl p-6 border border-blue-500/30">
        <h4 className="text-lg font-bold text-blue-300 mb-4 flex items-center gap-2">
          <Info className="w-5 h-5" />
          Detailed Analysis
        </h4>
        <div className="space-y-2">
          {interpretation.details.map((detail, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
              <span className="text-blue-200 text-sm leading-relaxed">{detail}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Scientific Note */}
      <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-600/30">
        <h5 className="font-semibold text-white mb-2 flex items-center gap-2">
          <Microscope className="w-4 h-4 text-gray-400" />
          Scientific Methodology
        </h5>
        <div className="text-sm text-gray-300 space-y-2">
          <p>
            <strong className="text-white">Biosignature Assessment:</strong> This analysis evaluates atmospheric 
            chemical compositions and their potential to support life based on survival probability models.
          </p>
          <p>
            <strong className="text-white">Chemical Analysis:</strong> Each gas concentration is assessed for its 
            impact on potential biological processes, considering both beneficial and harmful effects.
          </p>
          <p>
            <strong className="text-white">Temperature Factor:</strong> Surface temperature is evaluated for its 
            compatibility with liquid water and known biological processes.
          </p>
        </div>
      </div>
    </div>
  );
};