import React, { useState, useEffect } from 'react';
import { ProcessedNASAExoplanet, ProcessedDataQuality } from '../data/nasaProcessedExoplanets';
import { processedNASALoader } from '../services/processedNasaLoader';

/**
 * Demonstration component for the processed NASA exoplanet data
 * Shows data loading, filtering, and quality metrics
 */
export const NASAProcessedDataDemo: React.FC = () => {
  const [planets, setPlanets] = useState<ProcessedNASAExoplanet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataQuality, setDataQuality] = useState<ProcessedDataQuality | null>(null);
  const [filteredPlanets, setFilteredPlanets] = useState<ProcessedNASAExoplanet[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDiscoveryMethod, setSelectedDiscoveryMethod] = useState<string>('all');
  const [minYear, setMinYear] = useState(1990);
  const [maxYear, setMaxYear] = useState(2025);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [planets, searchQuery, selectedDiscoveryMethod, minYear, maxYear]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load planets and quality metrics
      const [planetsData, qualityData] = await Promise.all([
        processedNASALoader.loadProcessedData(),
        processedNASALoader.getDataQuality()
      ]);
      
      setPlanets(planetsData);
      setDataQuality(qualityData);
      setFilteredPlanets(planetsData);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = planets;

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(planet =>
        planet.planet_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        planet.host_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Discovery method filter
    if (selectedDiscoveryMethod !== 'all') {
      filtered = filtered.filter(planet =>
        planet.disc_method.toLowerCase() === selectedDiscoveryMethod.toLowerCase()
      );
    }

    // Year range filter
    filtered = filtered.filter(planet =>
      planet.disc_year >= minYear && planet.disc_year <= maxYear
    );

    setFilteredPlanets(filtered);
  };

  const getDiscoveryMethods = () => {
    const methods = new Set(planets.map(p => p.disc_method));
    return Array.from(methods).sort();
  };

  const getHabitableZoneCount = () => {
    return planets.filter(p => p.habitable_zone_flag === 'habitable').length;
  };

  const getHighESICount = () => {
    return planets.filter(p => p.esi !== undefined && p.esi >= 0.7).length;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading NASA exoplanet data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Data</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={loadData}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🪐 NASA Exoplanet Data Explorer
        </h1>
        <p className="text-xl text-gray-600">
          Processed and enriched exoplanet data from NASA Exoplanet Archive
        </p>
      </div>

      {/* Data Quality Overview */}
      {dataQuality && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Quality Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{dataQuality.totalRecords.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total Records</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{dataQuality.successRate.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{dataQuality.massCoverage.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">Mass Coverage</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">{dataQuality.radiusCoverage.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">Radius Coverage</div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-3xl font-bold text-green-600">{getHabitableZoneCount()}</div>
          <div className="text-gray-600">Habitable Zone Planets</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-3xl font-bold text-blue-600">{getHighESICount()}</div>
          <div className="text-gray-600">High ESI Planets (≥0.7)</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-3xl font-bold text-purple-600">{planets.filter(p => p.has_stellar_data).length}</div>
          <div className="text-gray-600">With Stellar Data</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              placeholder="Planet or star name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Discovery Method</label>
            <select
              value={selectedDiscoveryMethod}
              onChange={(e) => setSelectedDiscoveryMethod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Methods</option>
              {getDiscoveryMethods().map(method => (
                <option key={method} value={method}>{method}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Min Year</label>
            <input
              type="number"
              min="1990"
              max="2025"
              value={minYear}
              onChange={(e) => setMinYear(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Max Year</label>
            <input
              type="number"
              min="1990"
              max="2025"
              value={maxYear}
              onChange={(e) => setMaxYear(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredPlanets.length.toLocaleString()} of {planets.length.toLocaleString()} planets
        </div>
      </div>

      {/* Results */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Exoplanet Results</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Planet</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Host Star</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mass (M⊕)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Radius (R⊕)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ESI</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Zone</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPlanets.slice(0, 20).map((planet, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {planet.planet_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {planet.host_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {planet.disc_method}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {planet.disc_year}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {planet.pl_mass_mearth ? planet.pl_mass_mearth.toFixed(2) : '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {planet.pl_rad_rearth ? planet.pl_rad_rearth.toFixed(2) : '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {planet.esi ? planet.esi.toFixed(3) : '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      planet.habitable_zone_flag === 'habitable' 
                        ? 'bg-green-100 text-green-800'
                        : planet.habitable_zone_flag === 'inner'
                        ? 'bg-red-100 text-red-800'
                        : planet.habitable_zone_flag === 'outer'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {planet.habitable_zone_flag}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredPlanets.length > 20 && (
          <div className="px-6 py-4 border-t border-gray-200 text-center text-sm text-gray-600">
            Showing first 20 results. Use filters to narrow down results.
          </div>
        )}
      </div>

      {/* Data Source Info */}
      <div className="bg-gray-50 rounded-lg p-4 text-center text-sm text-gray-600">
        <p>
          Data source: NASA Exoplanet Archive • 
          Last updated: {new Date().toLocaleDateString()} • 
          Total records: {planets.length.toLocaleString()}
        </p>
      </div>
    </div>
  );
};

export default NASAProcessedDataDemo;
