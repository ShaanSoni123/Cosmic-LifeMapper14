import React, { useState, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { apiService, PlanetSearchResult } from '../services/api';

interface PlanetSearchProps {
  onPlanetSelect: (planetName: string) => void;
}

export const PlanetSearch: React.FC<PlanetSearchProps> = ({ onPlanetSelect }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PlanetSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const searchPlanets = async () => {
      if (query.length < 2) {
        setResults([]);
        setShowResults(false);
        return;
      }

      setLoading(true);
      const searchResults = await apiService.searchPlanets(query, 10);
      setResults(searchResults);
      setShowResults(true);
      setLoading(false);
    };

    const debounceTimer = setTimeout(searchPlanets, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handlePlanetSelect = (planetName: string) => {
    setQuery(planetName);
    setShowResults(false);
    onPlanetSelect(planetName);
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search from 5000+ exoplanets..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-10 pr-10 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 animate-spin" />
        )}
      </div>

      {showResults && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900/95 backdrop-blur-xl rounded-lg border border-white/20 shadow-2xl z-50 max-h-80 overflow-y-auto">
          {results.map((result, index) => (
            <button
              key={index}
              onClick={() => handlePlanetSelect(result.name)}
              className="w-full px-4 py-3 text-left hover:bg-white/10 transition-colors border-b border-white/10 last:border-b-0"
            >
              <div className="flex items-center justify-between">
                <span className="text-white font-medium">{result.name}</span>
                <span className="text-cyan-400 text-sm">{result.match_score}% match</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {showResults && results.length === 0 && !loading && query.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900/95 backdrop-blur-xl rounded-lg border border-white/20 shadow-2xl z-50 p-4">
          <p className="text-gray-400 text-center">No planets found matching "{query}"</p>
        </div>
      )}
    </div>
  );
};