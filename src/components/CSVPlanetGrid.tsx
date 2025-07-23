import React, { useState, useEffect } from 'react';
import { Loader2, ChevronLeft, ChevronRight, Database, Globe, Zap, Search, Calendar, Telescope, Star, Thermometer, Weight, Ruler, Clock, Target, Activity, Droplets, Shield } from 'lucide-react';
import { csvLoader } from '../services/csvLoader';
import { Exoplanet } from '../data/exoplanets';
import { ExtendedExoplanet } from '../utils/exoplanetAnalysis';
import { HabitabilityBar } from './HabitabilityBar';

interface CSVPlanetGridProps {
  onPlanetSelect: (planet: ExtendedExoplanet) => void;
}

export const CSVPlanetGrid: React.FC<CSVPlanetGridProps> = ({ onPlanetSelect }) => {
  const [planets, setPlanets] = useState<Exoplanet[]>([]);
  const [filteredPlanets, setFilteredPlanets] = useState<Exoplanet[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('habitability');
  const [filterBy, setFilterBy] = useState('all');
  const planetsPerPage = 50;

  // Convert Exoplanet to ExtendedExoplanet format
  const convertToExtendedExoplanet = (planet: Exoplanet): ExtendedExoplanet => {
    const surfaceGravity = planet.mass / Math.pow(planet.radius, 2);
    const waterRetentionPotential = Math.min(1, planet.habitabilityScore / 10);
    const radiationHazardIndex = Math.max(0, 1 - planet.habitabilityScore / 10);
    
    // Determine cluster based on habitability score
    let cluster: number;
    let clusterLabel: string;
    
    if (planet.habitabilityScore >= 7) {
      cluster = 0;
      clusterLabel = "Very High Habitability Potential";
    } else if (planet.habitabilityScore >= 5) {
      cluster = 1;
      clusterLabel = "Moderate to High Habitability Potential";
    } else if (planet.habitabilityScore >= 2.5) {
      cluster = 2;
      clusterLabel = "Low Habitability Potential";
    } else {
      cluster = 3;
      clusterLabel = "Very Low Habitability Potential";
    }
    
    // Check if in habitable zone based on temperature
    const inHabitableZone = planet.temperature >= 200 && planet.temperature <= 350;
    
    return {
      ...planet,
      habitabilityScore: planet.habitabilityScore * 10, // Convert to 0-100 scale
      surfaceTemperature: planet.temperature,
      surfaceGravity,
      waterRetentionPotential,
      radiationHazardIndex,
      cluster,
      clusterLabel,
      inHabitableZone
    };
  };
  useEffect(() => {
    const loadCSVPlanets = async () => {
      setLoading(true);
      try {
        console.log('Loading CSV planets...');
        const csvPlanets = await csvLoader.loadCSVData();
        console.log(`Loaded ${csvPlanets.length} planets from CSV`);
        setPlanets(csvPlanets);
        setFilteredPlanets(csvPlanets);
      } catch (error) {
        console.error('Error loading CSV planets:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCSVPlanets();
  }, []);

  // Filter and sort planets
  useEffect(() => {
    let filtered = planets.filter(planet => {
      const matchesSearch = planet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           planet.constellation.toLowerCase().includes(searchTerm.toLowerCase());
      
      switch (filterBy) {
        case 'high-habitability':
          return matchesSearch && planet.habitabilityScore >= 5;
        case 'with-biosignatures':
          return matchesSearch && planet.biosignatures.length > 0;
        case 'nearby':
          return matchesSearch && planet.distanceFromEarth < 50;
        case 'recent':
          return matchesSearch && planet.discoveryYear >= 2015;
        default:
          return matchesSearch;
      }
    });

    // Sort planets
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'distance':
          return a.distanceFromEarth - b.distanceFromEarth;
        case 'habitability':
          return b.habitabilityScore - a.habitabilityScore;
        case 'temperature':
          return a.temperature - b.temperature;
        case 'discovery':
          return b.discoveryYear - a.discoveryYear;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    setFilteredPlanets(filtered);
    setCurrentPage(1);
  }, [planets, searchTerm, sortBy, filterBy]);

  const totalPages = Math.ceil(filteredPlanets.length / planetsPerPage);
  const startIndex = (currentPage - 1) * planetsPerPage;
  const endIndex = startIndex + planetsPerPage;
  const paginatedPlanets = filteredPlanets.slice(startIndex, endIndex);

  const getTemperatureColor = (temp: number) => {
    if (temp < 200) return 'from-blue-500 to-cyan-300';
    if (temp < 280) return 'from-green-500 to-emerald-300';
    if (temp < 350) return 'from-orange-500 to-yellow-300';
    return 'from-red-500 to-pink-300';
  };

  const CSVPlanetCard: React.FC<{ planet: Exoplanet; onClick: () => void }> = ({ planet, onClick }) => (
    <div
      onClick={onClick}
      className="group cursor-pointer transform transition-all duration-500 hover:scale-105"
    >
      {/* Planet visualization */}
      <div className="relative w-20 h-20 mx-auto mb-4">
        <div
          className={`absolute inset-0 rounded-full bg-gradient-to-br ${getTemperatureColor(
            planet.temperature
          )} shadow-xl animate-pulse group-hover:animate-none transition-all duration-500`}
          style={{
            boxShadow: `0 0 20px rgba(${planet.temperature < 280 ? '34, 197, 94' : '239, 68, 68'}, 0.3)`,
          }}
        />
        <div className="absolute inset-1 rounded-full bg-gradient-to-br from-transparent to-black/20" />
        
        {/* Orbital rings */}
        <div className="absolute -inset-6 border border-white/10 rounded-full animate-spin-slow" />
        <div className="absolute -inset-8 border border-white/5 rounded-full animate-spin-reverse" />
      </div>

      {/* Planet info card */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 shadow-xl">
        <h3 className="text-lg font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors truncate">
          {planet.name}
        </h3>
        
        {/* Primary Stats */}
        <div className="space-y-2 text-sm mb-4">
          <div className="flex items-center gap-2 text-gray-300">
            <Globe className="w-4 h-4 text-blue-400" />
            <span>{planet.distanceFromEarth.toFixed(1)} ly</span>
          </div>
          
          <div className="flex items-center gap-2 text-gray-300">
            <Clock className="w-4 h-4 text-green-400" />
            <span>{planet.orbitalPeriod.toFixed(1)} days</span>
          </div>
          
          <div className="flex items-center gap-2 text-gray-300">
            <Thermometer className="w-4 h-4 text-red-400" />
            <span>{planet.temperature.toFixed(0)}K</span>
          </div>
          
          <div className="flex items-center gap-2 text-gray-300">
            <Star className="w-4 h-4 text-yellow-400" />
            <span>{planet.starType}</span>
          </div>
        </div>

        {/* Physical Properties */}
        <div className="grid grid-cols-2 gap-2 text-xs mb-4">
          <div className="flex items-center gap-1">
            <Ruler className="w-3 h-3 text-purple-400" />
            <span className="text-gray-400">R:</span>
            <span className="text-white">{planet.radius.toFixed(1)}⊕</span>
          </div>
          
          <div className="flex items-center gap-1">
            <Weight className="w-3 h-3 text-orange-400" />
            <span className="text-gray-400">M:</span>
            <span className="text-white">{planet.mass.toFixed(1)}⊕</span>
          </div>
          
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-cyan-400" />
            <span className="text-gray-400">Disc:</span>
            <span className="text-white">{planet.discoveryYear}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <Telescope className="w-3 h-3 text-pink-400" />
            <span className="text-gray-400 truncate text-xs">
              CSV Data
            </span>
          </div>
        </div>

        {/* Habitability Score */}
        <div className="pt-3 border-t border-white/20">
          <HabitabilityBar score={planet.habitabilityScore * 10} size="medium" />
        </div>

        {/* Special Indicators */}
        <div className="mt-3 flex flex-wrap gap-1">
          {planet.biosignatures.length > 0 && (
            <div className="flex items-center gap-1 px-2 py-1 bg-green-500/20 rounded-full border border-green-500/30">
              <Zap className="w-3 h-3 text-green-400" />
              <span className="text-xs text-green-400 font-medium">Bio</span>
            </div>
          )}
          
          {planet.habitabilityScore >= 7 && (
            <div className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 rounded-full border border-blue-500/30">
              <Target className="w-3 h-3 text-blue-400" />
              <span className="text-xs text-blue-400 font-medium">Prime</span>
            </div>
          )}
        </div>

        {/* Discovery Info */}
        <div className="mt-2">
          <div className="text-xs text-gray-500 truncate">
            {planet.constellation} constellation
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-300">Loading CSV Exoplanet Database...</p>
          <p className="text-gray-500 text-sm mt-2">Processing 5900+ planets from CSV file...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Controls */}
      <div className="mb-6 space-y-4">
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder={`Search from ${planets.length.toLocaleString()} CSV planets...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
            />
          </div>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
          >
            <option value="habitability" className="bg-gray-800">Habitability</option>
            <option value="distance" className="bg-gray-800">Distance</option>
            <option value="temperature" className="bg-gray-800">Temperature</option>
            <option value="discovery" className="bg-gray-800">Discovery Year</option>
            <option value="name" className="bg-gray-800">Name</option>
          </select>
          
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            className="px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
          >
            <option value="all" className="bg-gray-800">All Planets</option>
            <option value="high-habitability" className="bg-gray-800">High Habitability</option>
            <option value="with-biosignatures" className="bg-gray-800">With Biosignatures</option>
            <option value="nearby" className="bg-gray-800">Nearby (&lt;50 ly)</option>
            <option value="recent" className="bg-gray-800">Recent Discoveries</option>
          </select>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
            <div className="text-2xl font-bold text-cyan-400">{planets.length.toLocaleString()}</div>
            <div className="text-gray-400 text-sm">Total Planets</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
            <div className="text-2xl font-bold text-green-400">
              {planets.filter(p => p.habitabilityScore >= 5).length}
            </div>
            <div className="text-gray-400 text-sm">High Habitability</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
            <div className="text-2xl font-bold text-yellow-400">
              {planets.filter(p => p.biosignatures.length > 0).length}
            </div>
            <div className="text-gray-400 text-sm">With Biosignatures</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
            <div className="text-2xl font-bold text-purple-400">
              {planets.filter(p => p.distanceFromEarth < 50).length}
            </div>
            <div className="text-gray-400 text-sm">Nearby Planets</div>
          </div>
        </div>
      </div>

      {/* Stats Header */}
      <div className="mb-6 text-center">
        <p className="text-gray-300">
          {searchTerm ? `Search Results for "${searchTerm}"` : 'All CSV Planets'} - 
          Showing {paginatedPlanets.length} of {filteredPlanets.length.toLocaleString()} planets
        </p>
        <p className="text-gray-500 text-sm">
          Page {currentPage} of {totalPages.toLocaleString()} • CSV Database
        </p>
      </div>

      {/* Planet Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {paginatedPlanets.map((planet, index) => (
          <CSVPlanetCard
            key={`${planet.id}-${index}`}
            planet={planet}
            onClick={() => onPlanetSelect(convertToExtendedExoplanet(planet))}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <div className="flex items-center gap-2">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
              if (page > totalPages) return null;
              
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    page === currentPage
                      ? 'bg-cyan-600 text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  {page.toLocaleString()}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Data Source Info */}
      <div className="mt-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-900/20 border border-green-500/30 rounded-lg">
          <Database className="w-4 h-4 text-green-400" />
          <span className="text-green-300 text-sm">
            CSV Database - {planets.length.toLocaleString()} Comprehensive Exoplanet Records
          </span>
        </div>
      </div>
    </div>
  );
};