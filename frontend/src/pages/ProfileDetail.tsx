import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Phone,
  MessageSquare,
  Share2,
  Heart,
  CheckCircle,
  Ruler,
  Palette,
  ShieldCheck,
  Check
} from 'lucide-react';
import { apiService } from '../services/apiService';
import type { Profile } from '../types';
import { useSEO } from '../hooks/useSEO';

const ProfileDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [activeImage, setActiveImage] = useState('');
  const [showContact, setShowContact] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string } | null>(null);

  // 🔥 FIXED API CALL
  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) return;
      try {
        const data = await apiService.getProfileById(id);
        setProfile(data);
        setActiveImage(data.imageUrl);

        const favs = localStorage.getItem('favorites');
        const list = favs ? JSON.parse(favs) : [];
        setIsFavorited(list.includes(id));
      } catch (err) {
        console.error(err);
        navigate('/search');
      }
    };

    fetchProfile();
  }, [id, navigate]);

  const gallery = useMemo(() => {
    if (!profile) return [];
    return [profile.imageUrl, ...(profile.galleryImages || [])];
  }, [profile]);

  useSEO({
    title: profile ? `${profile.name} - ${profile.age} Yrs` : 'Loading...',
    description: profile ? profile.description : 'Profile detail'
  });

  const handleContactClick = async () => {
    if (!id || showContact) return;
    await apiService.incrementContactClick(id);
    setShowContact(true);
  };

  const toggleFavorite = () => {
    const favs = localStorage.getItem('favorites');
    let list = favs ? JSON.parse(favs) : [];
    list = list.includes(id) ? list.filter((f: string) => f !== id) : [...list, id];
    localStorage.setItem('favorites', JSON.stringify(list));
    setIsFavorited(!isFavorited);
    setFeedback({ message: isFavorited ? 'Removed from favorites' : 'Added to favorites' });
    setTimeout(() => setFeedback(null), 2000);
  };

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-rose-300 border-t-rose-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 pt-28 pb-12">
      {feedback && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-black text-white px-6 py-3 rounded-xl">
          {feedback.message}
        </div>
      )}

      <button onClick={() => navigate(-1)} className="flex gap-2 mb-6 text-gray-600">
        <ArrowLeft /> Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* IMAGES */}
        <div>
          <img src={activeImage} className="rounded-3xl shadow-xl" />
          <div className="grid grid-cols-4 gap-3 mt-4">
            {gallery.map((img, i) => (
              <img
                key={i}
                src={img}
                onClick={() => setActiveImage(img)}
                className={`cursor-pointer rounded-xl ${
                  activeImage === img ? 'ring-4 ring-rose-400' : ''
                }`}
              />
            ))}
          </div>
        </div>

        {/* DETAILS */}
        <div>
          <h1 className="text-4xl font-bold">{profile.name}</h1>
          <p className="flex gap-2 mt-2 text-gray-500">
            <MapPin /> {profile.location}
          </p>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <div><Ruler /> {profile.height}</div>
            <div><Palette /> {profile.complexion}</div>
          </div>

          <p className="mt-6 italic text-gray-600">"{profile.description}"</p>

          {showContact ? (
            <div className="mt-8 bg-rose-500 text-white p-6 rounded-xl text-center">
              <h2 className="text-3xl font-bold">{profile.contactInfo}</h2>
            </div>
          ) : (
            <button
              onClick={handleContactClick}
              className="mt-8 w-full bg-black text-white py-4 rounded-xl"
            >
              Request Contact
            </button>
          )}

          <div className="flex gap-4 mt-4">
            <button onClick={toggleFavorite} className="border px-4 py-2 rounded-xl">
              <Heart className={isFavorited ? 'fill-current' : ''} /> Favorite
            </button>
            <button
              onClick={() => navigator.share?.({ url: window.location.href })}
              className="border px-4 py-2 rounded-xl"
            >
              <Share2 /> Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileDetail;
