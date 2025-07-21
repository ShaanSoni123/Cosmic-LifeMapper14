import React from 'react';
import { Search, Filter, SortAsc } from 'lucide-react';

interface SearchFilterProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  filterBy: string;
  onFilterChange: (filter: string) => void;
}

export const SearchFilter: React.FC<SearchFilterProps> = ({
  searchTerm,
  onSearchChange,
  sortBy,
  onSortChange,
  filterBy,
  onFilterChange,
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-8">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search exoplanets..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
        />
      </div>

      {/* Sort */}
      <div className="relative">
        <SortAsc className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="pl-10 pr-8 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent appearance-none cursor-pointer"
        >
          <option value="distance" className="bg-gray-800">Distance</option>
          <option value="habitability" className="bg-gray-800">Habitability</option>
          <option value="temperature" className="bg-gray-800">Temperature</option>
          <option value="discovery" className="bg-gray-800">Discovery Year</option>
        </select>
      </div>

      {/* Filter */}
      <div className="relative">
        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <select
          value={filterBy}
          onChange={(e) => onFilterChange(e.target.value)}
          className="pl-10 pr-8 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent appearance-none cursor-pointer"
        >
          <option value="all" className="bg-gray-800">All Planets</option>
          <option value="high-habitability" className="bg-gray-800">High Habitability (5+)</option>
          <option value="with-biosignatures" className="bg-gray-800">With Biosignatures</option>
          <option value="nearby" className="bg-gray-800">Nearby (&lt;50 ly)</option>
          <option value="in-habitable-zone" className="bg-gray-800">In Habitable Zone</option>
        </select>
      </div>
    </div>
  );
};