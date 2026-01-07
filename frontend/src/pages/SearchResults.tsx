import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, Filter } from 'lucide-react';
import { apiService } from '../services/apiService';
import ProfileCard from '../components/ProfileCard';
import { LOCATIONS, COMPLEXIONS } from '../constants';
import type { Profile } from '../types';

const SearchIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const SearchResults: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [ageMin, setAgeMin] = useState(searchParams.get('ageMin') || '18');
  const [ageMax, setAgeMax] = useState(searchParams.get('ageMax') || '45');
  const [complexion, setComplexion] = useState(searchParams.get('complexion') || '');
  const [query, setQuery] = useState(searchParams.get('q') || '');

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const data = await apiService.getProfiles();
        setProfiles(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfiles();
  }, []);

  const filteredProfiles = useMemo(() => {
    return profiles.filter(p => {
      const matchLoc = !location || p.location === location;
      const matchAge = p.age >= parseInt(ageMin) && p.age <= parseInt(ageMax);
      const matchComplexion = !complexion || p.complexion === complexion;
      const matchQuery = !query || p.name.toLowerCase().includes(query.toLowerCase());
      return matchLoc && matchAge && matchComplexion && matchQuery;
    });
  }, [profiles, location, ageMin, ageMax, complexion, query]);

  const applyFilters = () => {
    const params: Record<string, string> = {};
    if (location) params.location = location;
    if (ageMin && ageMin !== '18') params.ageMin = ageMin;
    if (ageMax && ageMax !== '45') params.ageMax = ageMax;
    if (complexion) params.complexion = complexion;
    if (query) params.q = query;
    setSearchParams(params);
    setShowMobileFilters(false);
  };

  const clearFilters = () => {
    setLocation('');
    setAgeMin('18');
    setAgeMax('45');
    setComplexion('');
    setQuery('');
    setSearchParams({});
  };

  const FiltersSidebar = () => (
    <div className="flex flex-col gap-8">
      <div>
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Location</h3>
        <select
          className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-rose-500 outline-none"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        >
          <option value="">All Locations</option>
          {LOCATIONS.map(loc => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>
      </div>

      <div>
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Age Range ({ageMin} - {ageMax})</h3>
        <div className="flex flex-col gap-4">
          <input type="range" min="18" max="60" value={ageMin} onChange={(e) => setAgeMin(e.target.value)} className="accent-rose-500" />
          <input type="range" min="18" max="60" value={ageMax} onChange={(e) => setAgeMax(e.target.value)} className="accent-rose-500" />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Complexion</h3>
        <div className="flex flex-wrap gap-2">
          {COMPLEXIONS.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => setComplexion(complexion === c ? '' : c)}
              className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all ${
                complexion === c ? 'bg-rose-500 border-rose-500 text-white shadow-lg' : 'bg-white border-gray-200 text-gray-600 hover:border-rose-300'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-4 flex gap-3">
        <button onClick={applyFilters} className="flex-1 bg-rose-500 text-white py-3 rounded-xl font-bold text-sm shadow-md hover:bg-rose-600 transition-all">
          Apply Filters
        </button>
        <button onClick={clearFilters} className="px-4 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-200">
          Reset
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 pt-24 pb-12 sm:pt-28">
      <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-72 shrink-0 sticky top-28 h-fit">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-8">
              <SlidersHorizontal className="w-5 h-5 text-rose-500" />
              <h2 className="text-xl font-bold">Filters</h2>
            </div>
            <FiltersSidebar />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
              <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">Search Results</h1>
              <p className="text-gray-500">Found {filteredProfiles.length} matching profiles</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative flex-1 md:w-80">
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Filter by name..."
                  className="w-full bg-white border border-gray-100 rounded-2xl pl-11 pr-4 py-3 focus:ring-2 focus:ring-rose-500 outline-none shadow-sm"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <button
                onClick={() => setShowMobileFilters(true)}
                className="md:hidden bg-white p-3 rounded-2xl border border-gray-100 shadow-sm text-gray-600 flex items-center justify-center"
              >
                <Filter className="w-6 h-6" />
              </button>
            </div>
          </div>

          {filteredProfiles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProfiles.map(profile => (
                <ProfileCard key={profile._id} profile={profile} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-200">
              <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <SearchIcon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">No profiles found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your filters or search keywords to find what you're looking for.</p>
              <button onClick={clearFilters} className="text-rose-500 font-bold hover:underline">
                Clear all filters
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filter Overlay */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm md:hidden">
          <div className="absolute right-0 top-0 bottom-0 w-[85%] bg-white p-6 shadow-2xl flex flex-col">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold">Filters</h2>
              <button onClick={() => setShowMobileFilters(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto pr-2">
              <FiltersSidebar />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchResults;