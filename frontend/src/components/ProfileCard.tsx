import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, ShieldCheck, Heart } from 'lucide-react';
import type { Profile } from '../types';

interface ProfileCardProps {
  profile: Profile;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ profile }) => {
  const [isFavorited, setIsFavorited] = useState(false);
  const profileId = profile._id;

  useEffect(() => {
    const favs = localStorage.getItem('favorites');
    const list = favs ? JSON.parse(favs) : [];
    setIsFavorited(list.includes(profileId));
  }, [profileId]);

  const toggleFavorite = () => {
    const favs = localStorage.getItem('favorites');
    let list = favs ? JSON.parse(favs) : [];
    if (list.includes(profileId)) {
      list = list.filter((id: string) => id !== profileId);
    } else {
      list.push(profileId);
    }
    localStorage.setItem('favorites', JSON.stringify(list));
    setIsFavorited(!isFavorited);
  };

  return (
    <div className="group relative bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-[0_20px_50px_rgba(244,63,94,0.1)] transition-all duration-500 border border-gray-100 flex flex-col h-full">
      <button
        onClick={toggleFavorite}
        className={`absolute top-5 right-5 z-20 backdrop-blur-md p-2.5 rounded-2xl transition-all active:scale-90 shadow-lg ${
          isFavorited ? 'bg-rose-500 text-white opacity-100' : 'bg-white/20 text-white hover:bg-rose-500 hover:text-white opacity-0 group-hover:opacity-100'
        }`}
      >
        <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
      </button>

      <div className="relative aspect-[4/5] overflow-hidden">
        <img
          src={profile.imageUrl}
          alt={profile.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
        
        <div className="absolute top-5 left-5 flex gap-2">
          {profile.isFeatured && (
            <div className="bg-amber-400 text-white text-[10px] font-black px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-xl animate-pulse">
              <Star className="w-3 h-3 fill-current" />
              TOP PICK
            </div>
          )}
          <div className="bg-white/20 backdrop-blur-md text-white text-[10px] font-black px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-xl border border-white/10">
            <ShieldCheck className="w-3 h-3" />
            VERIFIED
          </div>
        </div>

        <div className="absolute bottom-6 left-6 right-6 text-white transform group-hover:-translate-y-1 transition-transform">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-2xl font-serif font-bold tracking-tight">{profile.name}</h3>
            <span className="text-xl font-light opacity-80">{profile.age}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-white/80">
            <MapPin className="w-3 h-3 text-rose-400" />
            {profile.location}
          </div>
        </div>
      </div>

      <div className="p-6 flex flex-col gap-5 flex-grow">
        <div className="flex justify-between items-center text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-rose-400" />
            {profile.height}
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-rose-400" />
            {profile.complexion} Skin
          </div>
        </div>

        <Link
          to={`/profile/${profileId}`}
          className="w-full bg-gray-50 hover:bg-rose-500 hover:text-white text-gray-900 text-center py-4 rounded-2xl text-sm font-black transition-all shadow-inner border border-gray-100 group-hover:border-rose-400"
        >
          Explore Profile
        </Link>
      </div>
    </div>
  );
};

export default ProfileCard;