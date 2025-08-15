import React, { useState, useEffect } from 'react';
import { Loader2, ChevronLeft, ChevronRight, Database, Globe, Zap, Search, Calendar, Telescope, Star, Thermometer, Weight, Ruler, Clock, Target, Activity, Droplets, Shield, Filter, SortAsc } from 'lucide-react';
import { csvLoader } from '../services/csvLoader';
import { Exoplanet } from '../data/exoplanets';
import { ExtendedExoplanet } from '../utils/exoplanetAnalysis';
import { HabitabilityBar } from './HabitabilityBar';
import { generatePlanetBiosignatures, generateBiosignatureReport } from '../utils/biosignatureAnalysis';

interface AllCSVPlanetsProps {
  onPlanetSelect: (planet: ExtendedExoplanet) => void;
}

export const AllCSVPlanets: React.FC<AllCSVPlanetsProps> = ({ onPlanetSelect }) => {
  const [allPlanets, setAllPlanets] = useState<Exoplanet[]>([]);
  const [filteredPlanets, setFilteredPlanets] = useState<Exoplanet[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('habitability');
  const [filterBy, setFilterBy] = useState('all');
  const [loadingProgress, setLoadingProgress] = useState('');
  const [searchResults, setSearchResults] = useState<Exoplanet[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [searchResults, setSearchResults] = useState<Exoplanet[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [searchResults, setSearchResults] = useState<Exoplanet[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [searchResults, setSearchResults] = useState<Exoplanet[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [searchResults, setSearchResults] = useState<Exoplanet[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const planetsPerPage = 100; // Show more planets per page

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
    const loadAllCSVPlanets = async () => {
      setLoading(true);
      setLoadingProgress('🚀 Connecting to backend/exoplanets.csv...');
      
      try {
        console.log('🌟 Starting to load ALL 5900+ exoplanets from CSV...');
        
        // Add progress updates
        const progressInterval = setInterval(() => {
          if (csvLoader.isLoading()) {
            const messages = [
              '📡 Reading CSV file from backend...',
              '🔍 Parsing 5900+ exoplanet records...',
              '🧮 Processing planetary data...',
              '🌍 Calculating habitability scores...',
              '✨ Almost ready...'
            ];
            const randomMessage = messages[Math.floor(Math.random() * messages.length)];
            setLoadingProgress(randomMessage);
          }
        }, 2000);

        const csvPlanets = await csvLoader.loadCSVData();
        clearInterval(progressInterval);
        
        console.log(`✅ Successfully loaded ${csvPlanets.length} planets from CSV!`);
        setAllPlanets(csvPlanets);
        setFilteredPlanets(csvPlanets);
        setLoadingProgress(`🎉 Loaded ${csvPlanets.length} exoplanets successfully!`);
        
        // Show success message briefly
        setTimeout(() => setLoading(false), 1000);
        
      } catch (error) {
        console.error('💥 Error loading CSV planets:', error);
        setLoadingProgress('❌ Error loading CSV file. Please check the file path.');
        setTimeout(() => setLoading(false), 3000);
      }
    };

    loadAllCSVPlanets();
  }, []);

  // Handle search with real-time results
  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    
    if (term.length >= 2) {
      // Perform fuzzy search on planet names
      const results = allPlanets.filter(planet => {
        const planetName = planet.name.toLowerCase();
        const searchLower = term.toLowerCase();
        
        // Exact match gets highest priority
        if (planetName.includes(searchLower)) return true;
        
        // Check individual words
        const searchWords = searchLower.split(' ');
        const planetWords = planetName.split(' ');
        
        return searchWords.some(searchWord => 
          planetWords.some(planetWord => 
            planetWord.includes(searchWord) || searchWord.includes(planetWord)
          )
        );
      }).slice(0, 10); // Show top 10 results
      
      setSearchResults(results);
      setShowSearchDropdown(results.length > 0);
    } else {
      setSearchResults([]);
      setShowSearchDropdown(false);
    }
  };

  // Handle planet selection from search dropdown
  const handleSearchSelect = (planet: Exoplanet) => {
    setSearchTerm(planet.name);
    setShowSearchDropdown(false);
    setSearchResults([]);
    
    // Filter to show only this planet
    setFilteredPlanets([planet]);
    setCurrentPage(1);
  };

  // Clear search and show all planets
  const clearSearch = () => {
    setSearchTerm('');
    setShowSearchDropdown(false);
    setSearchResults([]);
    setFilteredPlanets(allPlanets);
    setCurrentPage(1);
  };
  // Handle search with real-time results
  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    
    if (term.length >= 2) {
      // Perform fuzzy search on planet names
      const results = allPlanets.filter(planet => {
        const planetName = planet.name.toLowerCase();
        const searchLower = term.toLowerCase();
        
        // Exact match gets highest priority
        if (planetName.includes(searchLower)) return true;
        
        // Check individual words
        const searchWords = searchLower.split(' ');
        const planetWords = planetName.split(' ');
        
        return searchWords.some(searchWord => 
          planetWords.some(planetWord => 
            planetWord.includes(searchWord) || searchWord.includes(planetWord)
          )
        );
      }).slice(0, 10); // Show top 10 results
      
      setSearchResults(results);
      setShowSearchDropdown(results.length > 0);
    } else {
      setSearchResults([]);
      setShowSearchDropdown(false);
    }
  };

  // Handle planet selection from search dropdown
  const handleSearchSelect = (planet: Exoplanet) => {
    setSearchTerm(planet.name);
    setShowSearchDropdown(false);
    setSearchResults([]);
    
    // Filter to show only this planet
    setFilteredPlanets([planet]);
    setCurrentPage(1);
  };

  // Clear search and show all planets
  const clearSearch = () => {
    setSearchTerm('');
    setShowSearchDropdown(false);
    setSearchResults([]);
    setFilteredPlanets(allPlanets);
    setCurrentPage(1);
  };
  // Handle search with real-time results
  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    
    if (term.length >= 2) {
      // Perform fuzzy search on planet names
      const results = allPlanets.filter(planet => {
        const planetName = planet.name.toLowerCase();
        const searchLower = term.toLowerCase();
        
        // Exact match gets highest priority
        if (planetName.includes(searchLower)) return true;
        
        // Check individual words
        const searchWords = searchLower.split(' ');
        const planetWords = planetName.split(' ');
        
        return searchWords.some(searchWord => 
          planetWords.some(planetWord => 
            planetWord.includes(searchWord) || searchWord.includes(planetWord)
          )
        );
      }).slice(0, 10); // Show top 10 results
      
      setSearchResults(results);
      setShowSearchDropdown(results.length > 0);
    } else {
      setSearchResults([]);
      setShowSearchDropdown(false);
    }
  };

  // Handle planet selection from search dropdown
  const handleSearchSelect = (planet: Exoplanet) => {
    setSearchTerm(planet.name);
    setShowSearchDropdown(false);
    setSearchResults([]);
    
    // Filter to show only this planet
    setFilteredPlanets([planet]);
    setCurrentPage(1);
  };

  // Clear search and show all planets
  const clearSearch = () => {
    setSearchTerm('');
    setShowSearchDropdown(false);
    setSearchResults([]);
    setFilteredPlanets(allPlanets);
    setCurrentPage(1);
  };
  // Handle search with real-time results
  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    
    if (term.length >= 2) {
      // Perform fuzzy search on planet names
      const results = allPlanets.filter(planet => {
        const planetName = planet.name.toLowerCase();
        const searchLower = term.toLowerCase();
        
        // Exact match gets highest priority
        if (planetName.includes(searchLower)) return true;
        
        // Check individual words
        const searchWords = searchLower.split(' ');
        const planetWords = planetName.split(' ');
        
        return searchWords.some(searchWord => 
          planetWords.some(planetWord => 
            planetWord.includes(searchWord) || searchWord.includes(planetWord)
          )
        );
      }).slice(0, 10); // Show top 10 results
      
      setSearchResults(results);
      setShowSearchDropdown(results.length > 0);
    } else {
      setSearchResults([]);
      setShowSearchDropdown(false);
    }
  };

  // Handle planet selection from search dropdown
  const handleSearchSelect = (planet: Exoplanet) => {
    setSearchTerm(planet.name);
    setShowSearchDropdown(false);
    setSearchResults([]);
    
    // Filter to show only this planet
    setFilteredPlanets([planet]);
    setCurrentPage(1);
  };

  // Clear search and show all planets
  const clearSearch = () => {
    setSearchTerm('');
    setShowSearchDropdown(false);
    setSearchResults([]);
    setFilteredPlanets(allPlanets);
    setCurrentPage(1);
  };
  // Handle search with real-time results
  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    
    if (term.length >= 2) {
      // Perform fuzzy search on planet names
      const results = allPlanets.filter(planet => {
        const planetName = planet.name.toLowerCase();
        const searchLower = term.toLowerCase();
        
        // Exact match gets highest priority
        if (planetName.includes(searchLower)) return true;
        
        // Check individual words
        const searchWords = searchLower.split(' ');
        const planetWords = planetName.split(' ');
        
        return searchWords.some(searchWord => 
          planetWords.some(planetWord => 
            planetWord.includes(searchWord) || searchWord.includes(planetWord)
          )
        );
      }).slice(0, 10); // Show top 10 results
      
      setSearchResults(results);
      setShowSearchDropdown(results.length > 0);
    } else {
      setSearchResults([]);
      setShowSearchDropdown(false);
    }
  };

  // Handle planet selection from search dropdown
  const handleSearchSelect = (planet: Exoplanet) => {
    setSearchTerm(planet.name);
    setShowSearchDropdown(false);
    setSearchResults([]);
    
    // Filter to show only this planet
    setFilteredPlanets([planet]);
    setCurrentPage(1);
  };

  // Clear search and show all planets
  const clearSearch = () => {
    setSearchTerm('');
    setShowSearchDropdown(false);
    setSearchResults([]);
    setFilteredPlanets(allPlanets);
    setCurrentPage(1);
  };
  // Filter and sort planets
  useEffect(() => {
    // If we have a specific search selection, don't apply other filters
    if (searchTerm && filteredPlanets.length === 1) {
      return;
    }
    
    // If we have a specific search selection, don't apply other filters
    if (searchTerm && filteredPlanets.length === 1) {
      return;
    }
    
    // If we have a specific search selection, don't apply other filters
    if (searchTerm && filteredPlanets.length === 1) {
      return;
    }
    
    // If we have a specific search selection, don't apply other filters
    if (searchTerm && filteredPlanets.length === 1) {
      return;
    }
    
    // If we have a specific search selection, don't apply other filters
    if (searchTerm && filteredPlanets.length === 1) {
      return;
    }
    
    let filtered = allPlanets.filter(planet => {
      // Only apply search if no specific planet is selected
      const matchesSearch = !searchTerm || 
      // Only apply search if no specific planet is selected
      const matchesSearch = !searchTerm || 
      // Only apply search if no specific planet is selected
      const matchesSearch = !searchTerm || 
      // Only apply search if no specific planet is selected
      const matchesSearch = !searchTerm || 
      // Only apply search if no specific planet is selected
      const matchesSearch = !searchTerm || 
                           planet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           planet.constellation.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           planet.starType.toLowerCase().includes(searchTerm.toLowerCase());
      
      switch (filterBy) {
        case 'high-habitability':
          return matchesSearch && planet.habitabilityScore >= 5;
        case 'with-biosignatures':
          return matchesSearch && planet.biosignatures.length > 0;
        case 'nearby':
          return matchesSearch && planet.distanceFromEarth < 100;
        case 'recent':
          return matchesSearch && planet.discoveryYear >= 2010;
        case 'earth-like':
          return matchesSearch && planet.radius >= 0.5 && planet.radius <= 2.0 && planet.temperature >= 200 && planet.temperature <= 350;
        case 'super-earth':
          return matchesSearch && planet.radius > 1.25 && planet.radius <= 2.0;
        case 'hot-jupiter':
          return matchesSearch && planet.radius > 5 && planet.temperature > 1000;
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
        case 'radius':
          return b.radius - a.radius;
        case 'mass':
          return b.mass - a.mass;
        default:
          return 0;
      }
    });

    setFilteredPlanets(filtered);
    setCurrentPage(1);
  }, [allPlanets, searchTerm, sortBy, filterBy]);

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
      {/* Calculate real biosignature score */}
      {(() => {
        const biosignatureInput = generatePlanetBiosignatures({
          temperature: planet.temperature,
          radius: planet.radius,
          mass: planet.mass,
          starType: planet.starType,
          inHabitableZone: planet.temperature >= 200 && planet.temperature <= 350,
          habitabilityScore: planet.habitabilityScore
        });
        const biosignatureReport = generateBiosignatureReport(biosignatureInput);
        const realBiosignatureScore = biosignatureReport['Habitability Score'];

        return (
          <>
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
            <Database className="w-3 h-3 text-pink-400" />
            <span className="text-gray-400 truncate text-xs">
              CSV
            </span>
          </div>
        </div>

        {/* Habitability Score */}
        <div className="pt-3 border-t border-white/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400">Biosignature Score</span>
            <span className={`text-sm font-bold ${
              realBiosignatureScore >= 80 ? 'text-green-400' :
              realBiosignatureScore >= 60 ? 'text-yellow-400' :
              realBiosignatureScore >= 40 ? 'text-orange-400' : 'text-red-400'
            }`}>
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

          {realBiosignatureScore >= 60 && (
            <div className="flex items-center gap-1 px-2 py-1 bg-green-500/20 rounded-full border border-green-500/30">
              <Zap className="w-3 h-3 text-green-400" />
              <span className="text-xs text-green-400 font-medium">Bio+</span>
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
          </>
        );
      })()}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-cyan-400 animate-spin mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-4">Loading ALL CSV Exoplanets</h2>
          <p className="text-gray-300 mb-2">{loadingProgress}</p>
          <div className="w-64 bg-gray-700 rounded-full h-2 mx-auto">
            <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full animate-pulse" style={{width: '70%'}}></div>
          </div>
          <p className="text-gray-500 text-sm mt-4">
            Reading backend/exoplanets.csv with 5900+ confirmed exoplanets...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
          <Database className="w-10 h-10 text-cyan-400" />
          Outer planets
        </h1>
      </div>

      {/* Controls */}
      <div className="mb-8 space-y-4">
        {/* Search and Primary Controls */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search planets (try 'proxima', 'kepler', 'trappist')..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => {
                if (searchResults.length > 0) {
                  setShowSearchDropdown(true);
                }
              }}
              onFocus={() => {
                if (searchResults.length > 0) {
                  setShowSearchDropdown(true);
                }
              }}
              onFocus={() => {
                if (searchResults.length > 0) {
                  setShowSearchDropdown(true);
                }
              }}
              onFocus={() => {
                if (searchResults.length > 0) {
                  setShowSearchDropdown(true);
                }
              }}
              onFocus={() => {
                if (searchResults.length > 0) {
                  setShowSearchDropdown(true);
                }
              }}
              className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent text-lg"
            />
            
            {/* Search Results Dropdown */}
            {showSearchDropdown && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900/95 backdrop-blur-xl rounded-lg border border-white/20 shadow-2xl z-50 max-h-80 overflow-y-auto">
                <div className="p-2 border-b border-white/10">
                  <div className="text-xs text-gray-400 px-2">
                    Found {searchResults.length} planets matching "{searchTerm}"
                  </div>
                </div>
                {searchResults.map((planet, index) => (
                  <button
                    key={`search-${planet.id}-${index}`}
                    onClick={() => handleSearchSelect(planet)}
                    className="w-full px-4 py-3 text-left hover:bg-white/10 transition-colors border-b border-white/5 last:border-b-0 flex items-center gap-3"
                  >
                    <div className={`w-4 h-4 rounded-full bg-gradient-to-br ${getTemperatureColor(planet.temperature)}`} />
                    <div className="flex-1">
                      <div className="text-white font-medium">{planet.name}</div>
                      <div className="text-gray-400 text-sm">
                        {planet.constellation} • {planet.distanceFromEarth.toFixed(1)} ly • Score: {(planet.habitabilityScore * 10).toFixed(0)}/100
                      </div>
                    </div>
                  </button>
                ))}
                <div className="p-2 border-t border-white/10">
                  <button
                    onClick={clearSearch}
                    className="w-full text-center text-xs text-gray-400 hover:text-white transition-colors py-1"
                  >
                    Clear search and show all planets
                  </button>
                </div>
              </div>
            )}
            
            {/* Clear search button */}
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
            
            {/* Search Results Dropdown */}
            {showSearchDropdown && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900/95 backdrop-blur-xl rounded-lg border border-white/20 shadow-2xl z-50 max-h-80 overflow-y-auto">
                <div className="p-2 border-b border-white/10">
                  <div className="text-xs text-gray-400 px-2">
                    Found {searchResults.length} planets matching "{searchTerm}"
                  </div>
                </div>
                {searchResults.map((planet, index) => (
                  <button
                    key={`search-${planet.id}-${index}`}
                    onClick={() => handleSearchSelect(planet)}
                    className="w-full px-4 py-3 text-left hover:bg-white/10 transition-colors border-b border-white/5 last:border-b-0 flex items-center gap-3"
                  >
                    <div className={`w-4 h-4 rounded-full bg-gradient-to-br ${getTemperatureColor(planet.temperature)}`} />
                    <div className="flex-1">
                      <div className="text-white font-medium">{planet.name}</div>
                      <div className="text-gray-400 text-sm">
                        {planet.constellation} • {planet.distanceFromEarth.toFixed(1)} ly • Score: {(planet.habitabilityScore * 10).toFixed(0)}/100
                      </div>
                    </div>
                  </button>
                ))}
                <div className="p-2 border-t border-white/10">
                  <button
                    onClick={clearSearch}
                    className="w-full text-center text-xs text-gray-400 hover:text-white transition-colors py-1"
                  >
                    Clear search and show all planets
                  </button>
                </div>
              </div>
            )}
            
            {/* Clear search button */}
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
            
            {/* Search Results Dropdown */}
            {showSearchDropdown && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900/95 backdrop-blur-xl rounded-lg border border-white/20 shadow-2xl z-50 max-h-80 overflow-y-auto">
                <div className="p-2 border-b border-white/10">
                  <div className="text-xs text-gray-400 px-2">
                    Found {searchResults.length} planets matching "{searchTerm}"
                  </div>
                </div>
                {searchResults.map((planet, index) => (
                  <button
                    key={`search-${planet.id}-${index}`}
                    onClick={() => handleSearchSelect(planet)}
                    className="w-full px-4 py-3 text-left hover:bg-white/10 transition-colors border-b border-white/5 last:border-b-0 flex items-center gap-3"
                  >
                    <div className={`w-4 h-4 rounded-full bg-gradient-to-br ${getTemperatureColor(planet.temperature)}`} />
                    <div className="flex-1">
                      <div className="text-white font-medium">{planet.name}</div>
                      <div className="text-gray-400 text-sm">
                        {planet.constellation} • {planet.distanceFromEarth.toFixed(1)} ly • Score: {(planet.habitabilityScore * 10).toFixed(0)}/100
                      </div>
                    </div>
                  </button>
                ))}
                <div className="p-2 border-t border-white/10">
                  <button
                    onClick={clearSearch}
                    className="w-full text-center text-xs text-gray-400 hover:text-white transition-colors py-1"
                  >
                    Clear search and show all planets
                  </button>
                </div>
              </div>
            )}
            
            {/* Clear search button */}
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
            
            {/* Search Results Dropdown */}
            {showSearchDropdown && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900/95 backdrop-blur-xl rounded-lg border border-white/20 shadow-2xl z-50 max-h-80 overflow-y-auto">
                <div className="p-2 border-b border-white/10">
                  <div className="text-xs text-gray-400 px-2">
                    Found {searchResults.length} planets matching "{searchTerm}"
                  </div>
                </div>
                {searchResults.map((planet, index) => (
                  <button
                    key={`search-${planet.id}-${index}`}
                    onClick={() => handleSearchSelect(planet)}
                    className="w-full px-4 py-3 text-left hover:bg-white/10 transition-colors border-b border-white/5 last:border-b-0 flex items-center gap-3"
                  >
                    <div className={`w-4 h-4 rounded-full bg-gradient-to-br ${getTemperatureColor(planet.temperature)}`} />
                    <div className="flex-1">
                      <div className="text-white font-medium">{planet.name}</div>
                      <div className="text-gray-400 text-sm">
                        {planet.constellation} • {planet.distanceFromEarth.toFixed(1)} ly • Score: {(planet.habitabilityScore * 10).toFixed(0)}/100
                      </div>
                    </div>
                  </button>
                ))}
                <div className="p-2 border-t border-white/10">
                  <button
                    onClick={clearSearch}
                    className="w-full text-center text-xs text-gray-400 hover:text-white transition-colors py-1"
                  >
                    Clear search and show all planets
                  </button>
                </div>
              </div>
            )}
            
            {/* Clear search button */}
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
            
            {/* Search Results Dropdown */}
            {showSearchDropdown && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900/95 backdrop-blur-xl rounded-lg border border-white/20 shadow-2xl z-50 max-h-80 overflow-y-auto">
                <div className="p-2 border-b border-white/10">
                  <div className="text-xs text-gray-400 px-2">
                    Found {searchResults.length} planets matching "{searchTerm}"
                  </div>
                </div>
                {searchResults.map((planet, index) => (
                  <button
                    key={`search-${planet.id}-${index}`}
                    onClick={() => handleSearchSelect(planet)}
                    className="w-full px-4 py-3 text-left hover:bg-white/10 transition-colors border-b border-white/5 last:border-b-0 flex items-center gap-3"
                  >
                    <div className={`w-4 h-4 rounded-full bg-gradient-to-br ${getTemperatureColor(planet.temperature)}`} />
                    <div className="flex-1">
                      <div className="text-white font-medium">{planet.name}</div>
                      <div className="text-gray-400 text-sm">
                        {planet.constellation} • {planet.distanceFromEarth.toFixed(1)} ly • Score: {(planet.habitabilityScore * 10).toFixed(0)}/100
                      </div>
                    </div>
                  </button>
                ))}
                <div className="p-2 border-t border-white/10">
                  <button
                    onClick={clearSearch}
                    className="w-full text-center text-xs text-gray-400 hover:text-white transition-colors py-1"
                  >
                    Clear search and show all planets
                  </button>
                </div>
              </div>
            )}
            
            {/* Clear search button */}
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          
          <div className="flex gap-3">
            <div className="relative">
              <SortAsc className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="pl-10 pr-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent appearance-none cursor-pointer"
              >
                <option value="habitability" className="bg-gray-800">Habitability Score</option>
                <option value="distance" className="bg-gray-800">Distance from Earth</option>
                <option value="temperature" className="bg-gray-800">Temperature</option>
                <option value="discovery" className="bg-gray-800">Discovery Year</option>
                <option value="name" className="bg-gray-800">Planet Name</option>
                <option value="radius" className="bg-gray-800">Planet Radius</option>
                <option value="mass" className="bg-gray-800">Planet Mass</option>
              </select>
            </div>
            
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="pl-10 pr-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent appearance-none cursor-pointer"
              >
                <option value="all" className="bg-gray-800">All Planets ({allPlanets.length.toLocaleString()})</option>
                <option value="high-habitability" className="bg-gray-800">High Habitability (Score ≥ 5)</option>
                <option value="with-biosignatures" className="bg-gray-800">With Biosignatures</option>
                <option value="nearby" className="bg-gray-800">Nearby (&lt;100 ly)</option>
                <option value="recent" className="bg-gray-800">Recent Discoveries (≥2010)</option>
                <option value="earth-like" className="bg-gray-800">Earth-like Candidates</option>
                <option value="super-earth" className="bg-gray-800">Super-Earths</option>
                <option value="hot-jupiter" className="bg-gray-800">Hot Jupiters</option>
              </select>
            </div>
          </div>
        </div>

        {/* Advanced Stats Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="bg-gradient-to-br from-cyan-900/30 to-blue-900/30 rounded-lg p-4 border border-cyan-500/30">
            <div className="text-2xl font-bold text-cyan-400">{allPlanets.length.toLocaleString()}</div>
            <div className="text-gray-400 text-sm">Total Planets</div>
          </div>
          <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 rounded-lg p-4 border border-green-500/30">
            <div className="text-2xl font-bold text-green-400">
              {allPlanets.filter(p => p.habitabilityScore >= 5).length}
            </div>
            <div className="text-gray-400 text-sm">High Habitability</div>
          </div>
          <div className="bg-gradient-to-br from-yellow-900/30 to-orange-900/30 rounded-lg p-4 border border-yellow-500/30">
            <div className="text-2xl font-bold text-yellow-400">
              {allPlanets.filter(p => p.biosignatures.length > 0).length}
            </div>
            <div className="text-gray-400 text-sm">With Biosignatures</div>
          </div>
          <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-lg p-4 border border-purple-500/30">
            <div className="text-2xl font-bold text-purple-400">
              {allPlanets.filter(p => p.distanceFromEarth < 100).length}
            </div>
            <div className="text-gray-400 text-sm">Nearby (&lt;100ly)</div>
          </div>
          <div className="bg-gradient-to-br from-red-900/30 to-pink-900/30 rounded-lg p-4 border border-red-500/30">
            <div className="text-2xl font-bold text-red-400">
              {allPlanets.filter(p => p.temperature >= 200 && p.temperature <= 350).length}
            </div>
            <div className="text-gray-400 text-sm">In Habitable Zone</div>
          </div>
          <div className="bg-gradient-to-br from-indigo-900/30 to-blue-900/30 rounded-lg p-4 border border-indigo-500/30">
            <div className="text-2xl font-bold text-indigo-400">
              {new Set(allPlanets.map(p => p.starType)).size}
            </div>
            <div className="text-gray-400 text-sm">Star Types</div>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="mb-6 text-center">
        <p className="text-gray-300 text-lg">
          {searchTerm || filterBy !== 'all' ? (
            <>
              <span className="text-cyan-400 font-bold">{filteredPlanets.length.toLocaleString()}</span> planets found
              {searchTerm && <span> matching "{searchTerm}"</span>}
              {filterBy !== 'all' && <span> with applied filters</span>}
            </>
          ) : (
            <>Showing <span className="text-cyan-400 font-bold">{paginatedPlanets.length}</span> of <span className="text-cyan-400 font-bold">{allPlanets.length.toLocaleString()}</span> total planets</>
          )}
        </p>
        <p className="text-gray-500 text-sm">
          Page {currentPage.toLocaleString()} of {totalPages.toLocaleString()}
        </p>
      </div>

      {/* Planet Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 mb-8">
        {paginatedPlanets.map((planet, index) => (
          <CSVPlanetCard
            key={`${planet.id}-${index}`}
            planet={planet}
            onClick={() => onPlanetSelect(convertToExtendedExoplanet(planet))}
          />
        ))}
      </div>

      {/* Enhanced Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col items-center gap-6">
          {/* Main Pagination Controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              Previous
            </button>

            <div className="flex items-center gap-2">
              {/* Show first page */}
              {currentPage > 3 && (
                <>
                  <button
                    onClick={() => setCurrentPage(1)}
                    className="px-4 py-2 rounded-lg bg-white/10 text-gray-300 hover:bg-white/20 transition-colors"
                  >
                    1
                  </button>
                  {currentPage > 4 && <span className="text-gray-500">...</span>}
                </>
              )}

              {/* Show pages around current page */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                if (page > totalPages) return null;
                
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      page === currentPage
                        ? 'bg-cyan-600 text-white'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}
                  >
                    {page.toLocaleString()}
                  </button>
                );
              })}

              {/* Show last page */}
              {currentPage < totalPages - 2 && (
                <>
                  {currentPage < totalPages - 3 && <span className="text-gray-500">...</span>}
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    className="px-4 py-2 rounded-lg bg-white/10 text-gray-300 hover:bg-white/20 transition-colors"
                  >
                    {totalPages.toLocaleString()}
                  </button>
                </>
              )}
            </div>

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
            >
              Next
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Jump */}
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-400">Quick jump to page:</span>
            <input
              type="number"
              min="1"
              max={totalPages}
              placeholder="Page #"
              className="w-24 px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-center focus:outline-none focus:ring-1 focus:ring-cyan-400"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  const page = parseInt((e.target as HTMLInputElement).value);
                  if (page >= 1 && page <= totalPages) {
                    setCurrentPage(page);
                    (e.target as HTMLInputElement).value = '';
                  }
                }
              }}
            />
            <span className="text-gray-400">of {totalPages.toLocaleString()}</span>
          </div>

          {/* Page Info */}
          <div className="text-center text-sm text-gray-500">
            Showing planets {(startIndex + 1).toLocaleString()} - {Math.min(endIndex, filteredPlanets.length).toLocaleString()} of {filteredPlanets.length.toLocaleString()} filtered results
          </div>
        </div>
      )}

      {/* Data Source Info */}
      <div className="mt-12 text-center">
        <div className="inline-flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-green-900/20 to-emerald-900/20 border border-green-500/30 rounded-xl">
          <Database className="w-6 h-6 text-green-400" />
          <div className="text-left">
            <div className="text-green-300 font-semibold">Complete CSV Database</div>
            <div className="text-green-400/80 text-sm">
              {allPlanets.length.toLocaleString()} exoplanets loaded from backend/exoplanets.csv
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};