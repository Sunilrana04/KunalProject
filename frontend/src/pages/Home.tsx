import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, MapPin, ArrowRight, Star, ShieldCheck, Zap, Users } from 'lucide-react';
import { apiService } from '../services/apiService';
import ProfileCard from '../components/ProfileCard';
import { LOCATIONS } from '../constants';
import { useSEO } from '../hooks/useSEO';
import type { Profile } from '../types';

const Home: React.FC = () => {
  useSEO({
    title: 'Top Profile Discovery Platform | Find Profiles in Bangalore & Mumbai',
    description: 'Discover verified and exceptional profiles near you. Search by location, age, and preferences on BelleDiscovery, India\'s leading discovery platform.'
  });

  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [profiles, setProfiles] = useState<Profile[]>([]);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const data = await apiService.getProfiles();
        setProfiles(data);
      } catch (err) {
        console.error('Failed to load profiles', err);
      }
    };
    fetchProfiles();
  }, []);

  const featuredProfiles = profiles.filter(p => p.isFeatured).slice(0, 4);
  

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (selectedLocation) params.set('location', selectedLocation);
    navigate(`/search?${params.toString()}`);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0 scale-105 animate-slow-zoom">
          <img
            src="https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&q=80&w=1920"
            className="w-full h-full object-cover brightness-[0.75]"
            alt="Premium discovery background"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-white" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-[6.5rem] font-serif font-bold text-white mb-6 leading-[1.1] md:leading-[1.05] drop-shadow-2xl">
            Premium <span className="text-[#ff3061]">Profile</span> <br className="hidden sm:block" /> Discovery.
          </h1>
          <p className="text-base sm:text-lg md:text-2xl text-white/95 mb-10 md:mb-14 max-w-3xl mx-auto font-medium drop-shadow-lg leading-relaxed px-4">
            Find authentic and verified profiles in your city. Precision filtering by
            <span className="font-bold border-b-2 border-[#ff3061] pb-1 mx-1">Location, Age</span>, and <span className="font-bold border-b-2 border-[#ff3061] pb-1">Preferences</span>.
          </p>

          <form
            onSubmit={handleSearch}
            className="bg-white p-3 md:p-2 rounded-[2rem] md:rounded-full shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] flex flex-col md:flex-row gap-2 max-w-4xl mx-auto items-stretch md:items-center animate-in slide-in-from-bottom-8 duration-700 mx-4"
          >
            <div className="flex-1 flex items-center px-4 md:px-8 gap-3 md:gap-4 group">
              <Search className="w-5 h-5 text-[#ff3061] shrink-0 group-focus-within:scale-110 transition-transform" />
              <input
                type="text"
                placeholder="Search name or keyword..."
                className="w-full bg-transparent border-none text-gray-800 placeholder-gray-400 focus:ring-0 text-sm md:text-lg py-3 md:py-4 outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="hidden md:block w-px bg-gray-200 h-10 mx-2" />

            <div className="flex-1 flex items-center px-4 md:px-8 gap-3 md:gap-4 border-t md:border-t-0 border-gray-100 pt-2 md:pt-0">
              <MapPin className="w-5 h-5 text-[#ff3061] shrink-0" />
              <select
                className="w-full bg-transparent border-none text-gray-800 focus:ring-0 text-sm md:text-lg appearance-none cursor-pointer py-3 md:py-4 outline-none"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
              >
                <option value="">Across India</option>
                {LOCATIONS.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="bg-[#ff3061] hover:bg-[#e62a56] text-white px-8 md:px-14 py-4 md:py-5 rounded-2xl md:rounded-full font-bold text-base md:text-lg transition-all active:scale-95 shadow-xl flex items-center justify-center gap-3 mt-2 md:mt-0"
            >
              Discover Now <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="bg-white py-14 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-8 md:gap-24">
            {['Verified Profiles', 'Privacy First', 'Secure Connect', 'Real Photos'].map(badge => (
              <div key={badge} className="flex items-center gap-3 font-bold text-gray-400 uppercase tracking-[0.2em] text-[10px] md:text-xs hover:text-[#ff3061] transition-colors cursor-default">
                <ShieldCheck className="w-5 h-5 text-[#ff3061]" />
                {badge}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Profiles */}
      <section className="max-w-7xl mx-auto px-4 py-24 bg-white">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-6xl font-serif font-bold text-gray-900 mb-6 tracking-tight">Curated <span className="text-[#ff3061]">Top Picks</span></h2>
            <p className="text-gray-500 text-lg md:text-xl font-light leading-relaxed">Discover our community's most highly-rated and verified profiles, hand-picked for authenticity and quality.</p>
          </div>
          <Link to="/search" className="w-full md:w-auto bg-gray-900 text-white px-10 py-5 rounded-2xl font-bold hover:bg-[#ff3061] transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2">
            Browse All Profiles <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {featuredProfiles.map(profile => (
            <ProfileCard key={profile._id} profile={profile} />
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-32 border-y border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-100/50 blur-[120px] rounded-full -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-rose-50/50 blur-[120px] rounded-full -ml-48 -mb-48" />

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-20">
            <div className="space-y-6 flex flex-col items-center group">
              <div className="w-20 h-20 bg-white shadow-xl rounded-[2rem] flex items-center justify-center text-[#ff3061] group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                <Zap className="w-10 h-10 fill-current" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Instant Access</h3>
              <p className="text-gray-500 leading-relaxed text-lg text-center">Find matching profiles in under 3 seconds with our proprietary high-speed indexing system.</p>
            </div>
            <div className="space-y-6 flex flex-col items-center group">
              <div className="w-20 h-20 bg-white shadow-xl rounded-[2rem] flex items-center justify-center text-[#ff3061] group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500">
                <ShieldCheck className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">100% Verified</h3>
              <p className="text-gray-500 leading-relaxed text-lg text-center">Every single profile undergoes a multi-step manual verification process by our expert moderation team.</p>
            </div>
            <div className="space-y-6 flex flex-col items-center group">
              <div className="w-20 h-20 bg-white shadow-xl rounded-[2rem] flex items-center justify-center text-[#ff3061] group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                <Users className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Direct Connect</h3>
              <p className="text-gray-500 leading-relaxed text-lg text-center">Experience genuine connections with direct access to verified contact details while maintaining your privacy.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;