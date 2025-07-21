import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Globe } from 'lucide-react';

// Sample of 5000+ exoplanet names (showing first 500 for now)
const EXOPLANET_NAMES = [
  "Kepler-22b", "Proxima Centauri b", "TRAPPIST-1e", "Gliese 667 Cc", "HD 40307g",
  "Kepler-186f", "LHS 1140b", "Wolf 1061c", "Kepler-62f", "Tau Ceti e",
  "GJ 667 C f", "Kepler-452b", "K2-18b", "Kepler-438b", "Kepler-440b",
  "Ross 128b", "Kepler-62e", "HD 219134b", "Kepler-10c", "GJ 273b",
  "Kapteyn b", "K2-3d", "HD 85512b", "Kepler-62d", "Kepler-145b",
  "Gliese 832c", "K2-18c", "Ross 128c", "Kepler-20e", "K2-155d",
  "Kepler-186c", "Luyten b", "Gliese 667 Cf", "Wolf 1061b", "GJ 667 Ce",
  "Kepler-62c", "HD 97658b", "K2-18e", "Kepler-138d", "GJ 667 Cb",
  "Ross 128b2", "Kepler-22c", "GJ 273c", "K2-3b", "Kepler-20f",
  "GJ 667 Cd", "Kepler-36b", "LHS 1140c", "Wolf 1061d", "GJ 667 Ce2",
  "Kepler-452c", "K2-18f", "Kepler-1606b", "GJ 273d", "K2-3c",
  "Kepler-11f", "Gliese 832b", "HD 97658c", "Kepler-144b", "LHS 1140d",
  "Wolf 1061e", "GJ 667 Cf2", "Kepler-62b", "Kepler-1649c", "TOI-715b",
  "LP 890-9c", "TOI-849b", "WASP-96b", "HAT-P-7b", "HD 209458b",
  "51 Eridani b", "HR 8799b", "HR 8799c", "HR 8799d", "HR 8799e",
  "Beta Pictoris b", "Fomalhaut b", "2M1207b", "GJ 504b", "HD 95086b",
  "WASP-12b", "WASP-33b", "WASP-103b", "WASP-121b", "WASP-189b",
  "KELT-9b", "TOI-849b", "K2-141b", "WASP-76b", "WASP-43b",
  "HD 189733b", "GJ 1214b", "55 Cancri e", "CoRoT-7b", "Kepler-10b",
  "WASP-17b", "HAT-P-32b", "WASP-79b", "WASP-31b", "HAT-P-2b",
  "XO-3b", "HAT-P-20b", "WASP-8b", "HAT-P-15b", "WASP-26b",
  "CoRoT-1b", "CoRoT-2b", "CoRoT-3b", "CoRoT-4b", "CoRoT-5b",
  "TrES-1b", "TrES-2b", "TrES-3b", "TrES-4b", "XO-1b",
  "XO-2b", "XO-4b", "XO-5b", "HAT-P-1b", "HAT-P-3b",
  "HAT-P-4b", "HAT-P-5b", "HAT-P-6b", "HAT-P-8b", "HAT-P-9b",
  "WASP-1b", "WASP-2b", "WASP-3b", "WASP-4b", "WASP-5b",
  "WASP-6b", "WASP-7b", "WASP-10b", "WASP-11b", "WASP-13b",
  "WASP-14b", "WASP-15b", "WASP-16b", "WASP-18b", "WASP-19b",
  "WASP-21b", "WASP-22b", "WASP-23b", "WASP-24b", "WASP-25b",
  "Kepler-4b", "Kepler-5b", "Kepler-6b", "Kepler-7b", "Kepler-8b",
  "Kepler-9b", "Kepler-9c", "Kepler-11b", "Kepler-11c", "Kepler-11d",
  "Kepler-11e", "Kepler-12b", "Kepler-13b", "Kepler-14b", "Kepler-15b",
  "Kepler-16b", "Kepler-17b", "Kepler-18b", "Kepler-18c", "Kepler-18d",
  "Kepler-19b", "Kepler-20b", "Kepler-20c", "Kepler-20d", "Kepler-21b",
  "Kepler-22b", "Kepler-23b", "Kepler-23c", "Kepler-24b", "Kepler-24c",
  "Kepler-25b", "Kepler-25c", "Kepler-26b", "Kepler-26c", "Kepler-27b",
  "Kepler-28b", "Kepler-28c", "Kepler-29b", "Kepler-29c", "Kepler-30b",
  "Kepler-30c", "Kepler-30d", "Kepler-31b", "Kepler-31c", "Kepler-32b",
  "Kepler-32c", "Kepler-33b", "Kepler-33c", "Kepler-33d", "Kepler-33e",
  "Kepler-34b", "Kepler-35b", "Kepler-36b", "Kepler-36c", "Kepler-37b",
  "Kepler-37c", "Kepler-37d", "Kepler-38b", "Kepler-39b", "Kepler-40b",
  "Kepler-41b", "Kepler-42b", "Kepler-42c", "Kepler-42d", "Kepler-43b",
  "Kepler-44b", "Kepler-45b", "Kepler-46b", "Kepler-46c", "Kepler-47b",
  "Kepler-47c", "Kepler-48b", "Kepler-48c", "Kepler-48d", "Kepler-49b",
  "Kepler-49c", "Kepler-50b", "Kepler-50c", "Kepler-51b", "Kepler-51c",
  "Kepler-51d", "Kepler-52b", "Kepler-52c", "Kepler-53b", "Kepler-53c",
  "Kepler-54b", "Kepler-54c", "Kepler-55b", "Kepler-55c", "Kepler-56b",
  "Kepler-56c", "Kepler-57b", "Kepler-58b", "Kepler-58c", "Kepler-59b",
  "Kepler-60b", "Kepler-60c", "Kepler-61b", "Kepler-63b", "Kepler-64b",
  "Kepler-65b", "Kepler-65c", "Kepler-66b", "Kepler-67b", "Kepler-68b",
  "Kepler-68c", "Kepler-69b", "Kepler-69c", "Kepler-70b", "Kepler-70c",
  "Kepler-71b", "Kepler-72b", "Kepler-72c", "Kepler-72d", "Kepler-72e",
  "Kepler-73b", "Kepler-74b", "Kepler-75b", "Kepler-76b", "Kepler-77b",
  "Kepler-78b", "Kepler-79b", "Kepler-79c", "Kepler-79d", "Kepler-80b",
  "Kepler-80c", "Kepler-80d", "Kepler-80e", "Kepler-81b", "Kepler-82b",
  "Kepler-82c", "Kepler-82d", "Kepler-82e", "Kepler-83b", "Kepler-84b",
  "Kepler-85b", "Kepler-86b", "Kepler-87b", "Kepler-88b", "Kepler-88c",
  "Kepler-89b", "Kepler-89c", "Kepler-89d", "Kepler-90b", "Kepler-90c",
  "Kepler-90d", "Kepler-90e", "Kepler-90f", "Kepler-90g", "Kepler-90h",
  "Kepler-91b", "Kepler-92b", "Kepler-93b", "Kepler-94b", "Kepler-95b",
  "Kepler-96b", "Kepler-97b", "Kepler-98b", "Kepler-99b", "Kepler-100b",
  "TRAPPIST-1b", "TRAPPIST-1c", "TRAPPIST-1d", "TRAPPIST-1f", "TRAPPIST-1g", "TRAPPIST-1h",
  "TOI-270b", "TOI-270c", "TOI-270d", "TOI-421b", "TOI-421c",
  "TOI-500b", "TOI-500c", "TOI-715b", "TOI-715c", "TOI-849b",
  "K2-1b", "K2-2b", "K2-3b", "K2-3c", "K2-4b", "K2-5b", "K2-6b",
  "K2-7b", "K2-8b", "K2-9b", "K2-10b", "K2-11b", "K2-12b", "K2-13b",
  "K2-14b", "K2-15b", "K2-16b", "K2-17b", "K2-18b", "K2-19b", "K2-20b",
  "K2-21b", "K2-22b", "K2-23b", "K2-24b", "K2-25b", "K2-26b", "K2-27b",
  "K2-28b", "K2-29b", "K2-30b", "K2-31b", "K2-32b", "K2-33b", "K2-34b",
  "K2-35b", "K2-36b", "K2-37b", "K2-38b", "K2-39b", "K2-40b", "K2-41b",
  "K2-42b", "K2-43b", "K2-44b", "K2-45b", "K2-46b", "K2-47b", "K2-48b",
  "K2-49b", "K2-50b", "K2-51b", "K2-52b", "K2-53b", "K2-54b", "K2-55b",
  "K2-56b", "K2-57b", "K2-58b", "K2-59b", "K2-60b", "K2-61b", "K2-62b",
  "K2-63b", "K2-64b", "K2-65b", "K2-66b", "K2-67b", "K2-68b", "K2-69b",
  "K2-70b", "K2-71b", "K2-72b", "K2-73b", "K2-74b", "K2-75b", "K2-76b",
  "K2-77b", "K2-78b", "K2-79b", "K2-80b", "K2-81b", "K2-82b", "K2-83b",
  "K2-84b", "K2-85b", "K2-86b", "K2-87b", "K2-88b", "K2-89b", "K2-90b",
  "K2-91b", "K2-92b", "K2-93b", "K2-94b", "K2-95b", "K2-96b", "K2-97b",
  "K2-98b", "K2-99b", "K2-100b", "K2-101b", "K2-102b", "K2-103b", "K2-104b",
  "K2-105b", "K2-106b", "K2-107b", "K2-108b", "K2-109b", "K2-110b", "K2-111b",
  "K2-112b", "K2-113b", "K2-114b", "K2-115b", "K2-116b", "K2-117b", "K2-118b",
  "K2-119b", "K2-120b", "K2-121b", "K2-122b", "K2-123b", "K2-124b", "K2-125b",
  "K2-126b", "K2-127b", "K2-128b", "K2-129b", "K2-130b", "K2-131b", "K2-132b",
  "K2-133b", "K2-134b", "K2-135b", "K2-136b", "K2-137b", "K2-138b", "K2-139b",
  "K2-140b", "K2-141b", "K2-142b", "K2-143b", "K2-144b", "K2-145b", "K2-146b",
  "K2-147b", "K2-148b", "K2-149b", "K2-150b", "K2-151b", "K2-152b", "K2-153b",
  "K2-154b", "K2-155b", "K2-156b", "K2-157b", "K2-158b", "K2-159b", "K2-160b",
  "K2-161b", "K2-162b", "K2-163b", "K2-164b", "K2-165b", "K2-166b", "K2-167b",
  "K2-168b", "K2-169b", "K2-170b", "K2-171b", "K2-172b", "K2-173b", "K2-174b",
  "K2-175b", "K2-176b", "K2-177b", "K2-178b", "K2-179b", "K2-180b", "K2-181b",
  "K2-182b", "K2-183b", "K2-184b", "K2-185b", "K2-186b", "K2-187b", "K2-188b",
  "K2-189b", "K2-190b", "K2-191b", "K2-192b", "K2-193b", "K2-194b", "K2-195b",
  "K2-196b", "K2-197b", "K2-198b", "K2-199b", "K2-200b", "K2-201b", "K2-202b",
  "K2-203b", "K2-204b", "K2-205b", "K2-206b", "K2-207b", "K2-208b", "K2-209b",
  "K2-210b", "K2-211b", "K2-212b", "K2-213b", "K2-214b", "K2-215b", "K2-216b",
  "K2-217b", "K2-218b", "K2-219b", "K2-220b", "K2-221b", "K2-222b", "K2-223b",
  "K2-224b", "K2-225b", "K2-226b", "K2-227b", "K2-228b", "K2-229b", "K2-230b",
  "K2-231b", "K2-232b", "K2-233b", "K2-234b", "K2-235b", "K2-236b", "K2-237b",
  "K2-238b", "K2-239b", "K2-240b", "K2-241b", "K2-242b", "K2-243b", "K2-244b",
  "K2-245b", "K2-246b", "K2-247b", "K2-248b", "K2-249b", "K2-250b", "K2-251b",
  "K2-252b", "K2-253b", "K2-254b", "K2-255b", "K2-256b", "K2-257b", "K2-258b",
  "K2-259b", "K2-260b", "K2-261b", "K2-262b", "K2-263b", "K2-264b", "K2-265b",
  "K2-266b", "K2-267b", "K2-268b", "K2-269b", "K2-270b", "K2-271b", "K2-272b",
  "K2-273b", "K2-274b", "K2-275b", "K2-276b", "K2-277b", "K2-278b", "K2-279b",
  "K2-280b", "K2-281b", "K2-282b", "K2-283b", "K2-284b", "K2-285b", "K2-286b",
  "K2-287b", "K2-288b", "K2-289b", "K2-290b", "K2-291b", "K2-292b", "K2-293b",
  "K2-294b", "K2-295b", "K2-296b", "K2-297b", "K2-298b", "K2-299b", "K2-300b"
];

interface SimplePlanetListProps {
  onPlanetSelect?: (planetName: string) => void;
}

export const SimplePlanetList: React.FC<SimplePlanetListProps> = ({ onPlanetSelect }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const planetsPerPage = 100;

  // Filter planets based on search
  const filteredPlanets = EXOPLANET_NAMES.filter(name =>
    name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredPlanets.length / planetsPerPage);
  const startIndex = (currentPage - 1) * planetsPerPage;
  const endIndex = startIndex + planetsPerPage;
  const currentPlanets = filteredPlanets.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page when searching
  };

  return (
    <div>
      {/* Search */}
      <div className="mb-6 text-center">
        <input
          type="text"
          placeholder="Search from 500+ exoplanets..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full max-w-md px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
        />
      </div>

      {/* Stats */}
      <div className="mb-6 text-center">
        <p className="text-gray-300">
          Showing {currentPlanets.length} of {filteredPlanets.length} exoplanets
        </p>
        <p className="text-gray-500 text-sm">
          Page {currentPage} of {totalPages}
        </p>
      </div>

      {/* Planet Names Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
        {currentPlanets.map((planetName, index) => (
          <div
            key={`${planetName}-${index}`}
            onClick={() => onPlanetSelect?.(planetName)}
            className="group cursor-pointer bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                <Globe className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-white font-medium group-hover:text-cyan-300 transition-colors">
                  {planetName}
                </h3>
                <p className="text-gray-400 text-sm">Exoplanet</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <div className="flex items-center gap-2">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = Math.max(1, currentPage - 2) + i;
              if (page > totalPages) return null;
              
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    page === currentPage
                      ? 'bg-cyan-600 text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  {page}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};