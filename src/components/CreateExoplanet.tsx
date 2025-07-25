import React, { useState } from 'react';
import { Plus, Sparkles, Palette, Beaker, Rocket, Globe, Star, Thermometer, Ruler, Weight, Clock, Zap, Save, Shuffle, Eye } from 'lucide-react';

export const CreateExoplanet: React.FC = () => {
  const [planetName, setPlanetName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreatePlanet = () => {
    setIsCreating(true);
    // Logic will be added later
    setTimeout(() => {
      setIsCreating(false);
    }, 2000);
  };

  const handleRandomize = () => {
    // Logic will be added later
    console.log('Randomizing planet parameters...');
  };

  const handlePreview = () => {
    // Logic will be added later
    console.log('Previewing planet...');
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 rounded-full flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-400/30 via-pink-400/30 to-blue-400/30 animate-pulse"></div>
          <Plus className="w-16 h-16 text-white relative z-10" />
          <div className="absolute -inset-4 border border-white/20 rounded-full animate-spin-slow"></div>
          <div className="absolute -inset-8 border border-white/10 rounded-full animate-spin-reverse"></div>
        </div>
        
        <h1 className="text-5xl font-bold text-white mb-6 flex items-center justify-center gap-4">
          <Sparkles className="w-12 h-12 text-purple-400" />
          Create Your Own Exoplanet
          <Sparkles className="w-12 h-12 text-blue-400" />
        </h1>
        
        <p className="text-xl text-gray-300 mb-4 max-w-3xl mx-auto leading-relaxed">
          Design and customize your very own exoplanet! Set its physical properties, atmospheric composition, 
          and orbital characteristics to create a unique world in the cosmos.
        </p>
        
        <div className="flex items-center justify-center gap-6 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <Beaker className="w-4 h-4 text-green-400" />
            <span>Scientific Parameters</span>
          </div>
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-purple-400" />
            <span>Visual Customization</span>
          </div>
          <div className="flex items-center gap-2">
            <Rocket className="w-4 h-4 text-blue-400" />
            <span>Orbital Dynamics</span>
          </div>
        </div>
      </div>

      {/* Creation Interface */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Panel - Planet Creator */}
        <div className="space-y-6">
          {/* Planet Name */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-xl">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <Globe className="w-6 h-6 text-blue-400" />
              Planet Identity
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 font-medium mb-2">Planet Name</label>
                <input
                  type="text"
                  placeholder="Enter your planet's name..."
                  value={planetName}
                  onChange={(e) => setPlanetName(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 font-medium mb-2">Star System</label>
                  <select className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent">
                    <option value="" className="bg-gray-800">Select system type...</option>
                    <option value="single" className="bg-gray-800">Single Star</option>
                    <option value="binary" className="bg-gray-800">Binary System</option>
                    <option value="triple" className="bg-gray-800">Triple System</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-300 font-medium mb-2">Constellation</label>
                  <select className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent">
                    <option value="" className="bg-gray-800">Choose constellation...</option>
                    <option value="andromeda" className="bg-gray-800">Andromeda</option>
                    <option value="cygnus" className="bg-gray-800">Cygnus</option>
                    <option value="lyra" className="bg-gray-800">Lyra</option>
                    <option value="custom" className="bg-gray-800">Custom</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Physical Properties */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-xl">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <Ruler className="w-6 h-6 text-purple-400" />
              Physical Properties
            </h3>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 font-medium mb-2 flex items-center gap-2">
                    <Ruler className="w-4 h-4 text-purple-400" />
                    Radius (Earth = 1.0)
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="10"
                    step="0.1"
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>0.1⊕</span>
                    <span className="text-purple-400 font-medium">1.0⊕</span>
                    <span>10⊕</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-gray-300 font-medium mb-2 flex items-center gap-2">
                    <Weight className="w-4 h-4 text-orange-400" />
                    Mass (Earth = 1.0)
                  </label>
                  <input
                    type="range"
                    min="0.01"
                    max="100"
                    step="0.1"
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>0.01⊕</span>
                    <span className="text-orange-400 font-medium">1.0⊕</span>
                    <span>100⊕</span>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-gray-300 font-medium mb-2 flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-red-400" />
                  Surface Temperature
                </label>
                <input
                  type="range"
                  min="50"
                  max="3000"
                  step="10"
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>50K</span>
                  <span className="text-green-400 font-medium">288K (Earth)</span>
                  <span>3000K</span>
                </div>
              </div>
            </div>
          </div>

          {/* Orbital Properties */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-xl">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <Clock className="w-6 h-6 text-green-400" />
              Orbital Characteristics
            </h3>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 font-medium mb-2">Orbital Period (Days)</label>
                  <input
                    type="range"
                    min="0.1"
                    max="10000"
                    step="0.1"
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>0.1d</span>
                    <span className="text-green-400 font-medium">365d</span>
                    <span>10000d</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-gray-300 font-medium mb-2">Distance from Star (AU)</label>
                  <input
                    type="range"
                    min="0.01"
                    max="50"
                    step="0.01"
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>0.01 AU</span>
                    <span className="text-green-400 font-medium">1.0 AU</span>
                    <span>50 AU</span>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-gray-300 font-medium mb-2 flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-400" />
                  Host Star Type
                </label>
                <select className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent">
                  <option value="" className="bg-gray-800">Select star type...</option>
                  <option value="M" className="bg-gray-800">M-type (Red Dwarf) - Cool & Long-lived</option>
                  <option value="K" className="bg-gray-800">K-type (Orange Dwarf) - Stable & Warm</option>
                  <option value="G" className="bg-gray-800">G-type (Yellow Dwarf) - Sun-like</option>
                  <option value="F" className="bg-gray-800">F-type (Yellow-White) - Hot & Bright</option>
                  <option value="A" className="bg-gray-800">A-type (White) - Very Hot</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Preview & Controls */}
        <div className="space-y-6">
          {/* Planet Preview */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20 shadow-xl">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <Eye className="w-6 h-6 text-cyan-400" />
              Planet Preview
            </h3>
            
            {/* Large Planet Visualization */}
            <div className="relative w-48 h-48 mx-auto mb-8">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 via-green-400 to-blue-600 shadow-2xl animate-pulse">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-transparent to-black/30"></div>
                <div className="absolute top-8 left-8 w-4 h-4 bg-green-300 rounded-full opacity-80"></div>
                <div className="absolute bottom-12 right-12 w-6 h-4 bg-green-400 rounded-full opacity-60"></div>
                <div className="absolute top-16 right-8 w-3 h-3 bg-blue-200 rounded-full opacity-70"></div>
              </div>
              
              {/* Orbital rings */}
              <div className="absolute -inset-12 border border-white/10 rounded-full animate-spin-slow"></div>
              <div className="absolute -inset-16 border border-white/5 rounded-full animate-spin-reverse"></div>
              <div className="absolute -inset-20 border border-white/5 rounded-full animate-spin-slow"></div>
            </div>
            
            {/* Planet Stats Preview */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <span className="text-gray-300 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-400" />
                  Planet Name
                </span>
                <span className="text-white font-medium">
                  {planetName || 'Unnamed World'}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <span className="text-gray-300 flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-red-400" />
                  Temperature
                </span>
                <span className="text-white font-medium">288K (15°C)</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <span className="text-gray-300 flex items-center gap-2">
                  <Ruler className="w-4 h-4 text-purple-400" />
                  Size
                </span>
                <span className="text-white font-medium">1.0 Earth Radii</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <span className="text-gray-300 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-green-400" />
                  Habitability
                </span>
                <span className="text-green-400 font-medium">85/100</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <button
              onClick={handleRandomize}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <Shuffle className="w-5 h-5" />
              Randomize Parameters
            </button>
            
            <button
              onClick={handlePreview}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <Eye className="w-5 h-5" />
              Preview in 3D
            </button>
            
            <button
              onClick={handleCreatePlanet}
              disabled={isCreating}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg disabled:cursor-not-allowed disabled:transform-none"
            >
              {isCreating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating Planet...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Create My Planet
                </>
              )}
            </button>
          </div>

          {/* Feature Highlights */}
          <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-xl p-6 border border-purple-500/30">
            <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              Coming Soon Features
            </h4>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 text-gray-300">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span>Atmospheric composition designer</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>Biosignature simulation</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Climate modeling</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span>Moon system builder</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                <span>Export to NASA format</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Info */}
      <div className="mt-12 text-center">
        <div className="inline-flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-green-900/20 to-emerald-900/20 border border-green-500/30 rounded-xl">
          <Beaker className="w-6 h-6 text-green-400" />
          <div className="text-left">
            <div className="text-green-300 font-semibold">Scientific Planet Creator</div>
            <div className="text-green-400/80 text-sm">
              Design realistic exoplanets based on astrophysical principles
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};