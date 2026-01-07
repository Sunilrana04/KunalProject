import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Phone,
  MessageSquare,
  Share2,
  Heart,
  Ruler,
  Palette,
  User,
  Star,
  Gift,
  Shield
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
  const [bioSections, setBioSections] = useState({
    aboutMe: '',
    interestsHobbies: '',
    whatIOffer: '',
    valuesPrivacy: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) return;
      try {
        const data = await apiService.getProfileById(id);
        setProfile(data);
        setActiveImage(data.imageUrl);

        // ✅ Parse description into sections
        const parsedSections = parseDescription(data.description || '');
        setBioSections(parsedSections);

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

  // ✅ Function to parse description into 4 sections
  const parseDescription = (description: string) => {
    const sections = {
      aboutMe: '',
      interestsHobbies: '',
      whatIOffer: '',
      valuesPrivacy: ''
    };

    if (!description) return sections;

    // Try different patterns
    const aboutPatterns = ['About Me:', 'About me:', 'About:', 'About Me'];
    const interestsPatterns = ['Interests & Hobbies:', 'Interests and Hobbies:', 'Hobbies:', 'Interests:'];
    const offerPatterns = ['What I Offer:', 'I Offer:', 'What I offer:', 'Offer:'];
    const valuesPatterns = ['Values & Privacy:', 'Values and Privacy:', 'Values:', 'Privacy:'];

    let aboutIndex = -1, interestsIndex = -1, offerIndex = -1, valuesIndex = -1;

    // Find indices for each section
    aboutPatterns.forEach(pattern => {
      const idx = description.indexOf(pattern);
      if (idx !== -1 && aboutIndex === -1) aboutIndex = idx;
    });

    interestsPatterns.forEach(pattern => {
      const idx = description.indexOf(pattern);
      if (idx !== -1 && interestsIndex === -1) interestsIndex = idx;
    });

    offerPatterns.forEach(pattern => {
      const idx = description.indexOf(pattern);
      if (idx !== -1 && offerIndex === -1) offerIndex = idx;
    });

    valuesPatterns.forEach(pattern => {
      const idx = description.indexOf(pattern);
      if (idx !== -1 && valuesIndex === -1) valuesIndex = idx;
    });

    // Extract sections
    if (aboutIndex !== -1) {
      const endIndex = Math.min(
        interestsIndex !== -1 ? interestsIndex : Infinity,
        offerIndex !== -1 ? offerIndex : Infinity,
        valuesIndex !== -1 ? valuesIndex : Infinity
      );
      sections.aboutMe = description.substring(aboutIndex, endIndex !== Infinity ? endIndex : description.length)
        .replace(/^(About Me:|About me:|About:|About Me)\s*/, '')
        .trim();
    }

    if (interestsIndex !== -1) {
      const endIndex = Math.min(
        offerIndex !== -1 ? offerIndex : Infinity,
        valuesIndex !== -1 ? valuesIndex : Infinity
      );
      sections.interestsHobbies = description.substring(interestsIndex, endIndex !== Infinity ? endIndex : description.length)
        .replace(/^(Interests & Hobbies:|Interests and Hobbies:|Hobbies:|Interests:)\s*/, '')
        .trim();
    }

    if (offerIndex !== -1) {
      const endIndex = valuesIndex !== -1 ? valuesIndex : description.length;
      sections.whatIOffer = description.substring(offerIndex, endIndex)
        .replace(/^(What I Offer:|I Offer:|What I offer:|Offer:)\s*/, '')
        .trim();
    }

    if (valuesIndex !== -1) {
      sections.valuesPrivacy = description.substring(valuesIndex)
        .replace(/^(Values & Privacy:|Values and Privacy:|Values:|Privacy:)\s*/, '')
        .trim();
    }

    // If no sections found, show full description in About Me
    if (!sections.aboutMe && !sections.interestsHobbies && !sections.whatIOffer && !sections.valuesPrivacy) {
      sections.aboutMe = description;
    }

    return sections;
  };

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

  // ✅ IMPROVED WhatsApp function with better formatting
  const openWhatsApp = () => {
    if (!profile?.contactInfo) return;
    
    // Clean the phone number - remove all non-numeric except +
    let phoneNumber = profile.contactInfo.trim();
    
    // Remove spaces, dashes, parentheses
    phoneNumber = phoneNumber.replace(/[\s\-\(\)]/g, '');
    
    // If number starts with 0, remove it
    if (phoneNumber.startsWith('0')) {
      phoneNumber = phoneNumber.substring(1);
    }
    
    // If number doesn't start with +, add India country code (+91)
    if (!phoneNumber.startsWith('+')) {
      // Check if already has 91 at start
      if (phoneNumber.startsWith('91') && phoneNumber.length >= 12) {
        phoneNumber = '+' + phoneNumber;
      } else {
        phoneNumber = '+91' + phoneNumber;
      }
    }
    
    console.log('Formatted WhatsApp number:', phoneNumber);
    
    // Create WhatsApp URL with default message
    const message = `Hi ${profile.name}, I found your profile on BelleDiscovery and would like to connect with you.`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    // Open in new tab
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  // ✅ SIMPLIFIED phone number check
  const isPhoneNumber = (contact: string) => {
    const cleanContact = contact.replace(/\D/g, '');
    return cleanContact.length >= 10;
  };

  // ✅ Format phone number for display
  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.length === 10) {
      return `+91 ${cleaned.substring(0,5)} ${cleaned.substring(5)}`;
    }
    
    return phone;
  };

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-rose-300 border-t-rose-500 rounded-full animate-spin" />
      </div>
    );
  }

  // ✅ Check if any section has content
  const hasBioSections = bioSections.aboutMe || bioSections.interestsHobbies || 
                         bioSections.whatIOffer || bioSections.valuesPrivacy;

  return (
    <div className="max-w-6xl mx-auto px-6 pt-28 pb-12">
      {feedback && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-black text-white px-6 py-3 rounded-xl z-50">
          {feedback.message}
        </div>
      )}

      <button onClick={() => navigate(-1)} className="flex gap-2 mb-6 text-gray-600 hover:text-black transition-colors">
        <ArrowLeft /> Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* IMAGES */}
        <div>
          <img 
            src={activeImage} 
            alt={profile.name}
            className="w-full h-auto rounded-3xl shadow-xl object-cover"
          />
          <div className="grid grid-cols-4 gap-3 mt-4">
            {gallery.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`${profile.name} - Image ${i+1}`}
                onClick={() => setActiveImage(img)}
                className={`cursor-pointer rounded-xl w-full h-24 object-cover ${
                  activeImage === img ? 'ring-4 ring-rose-400' : 'opacity-80 hover:opacity-100'
                }`}
              />
            ))}
          </div>
        </div>

        {/* DETAILS */}
        <div>
          <h1 className="text-4xl font-bold text-gray-900">{profile.name}, {profile.age}</h1>
          <p className="flex items-center gap-2 mt-2 text-gray-500">
            <MapPin size={18} /> {profile.location}
          </p>

          <div className="grid grid-cols-2 gap-4 mt-6 text-gray-700">
            <div className="flex items-center gap-2">
              <Ruler size={18} className="text-rose-500" />
              <span className="font-medium">{profile.height}</span>
            </div>
            <div className="flex items-center gap-2">
              <Palette size={18} className="text-rose-500" />
              <span className="font-medium">{profile.complexion}</span>
            </div>
          </div>

          {/* ✅ DISPLAY 4 BIO SECTIONS */}
          {hasBioSections ? (
            <div className="mt-8 space-y-6">
              {/* About Me Section */}
              {bioSections.aboutMe && (
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-bold text-blue-700">About Me</h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{bioSections.aboutMe}</p>
                </div>
              )}

              {/* Interests & Hobbies Section */}
              {bioSections.interestsHobbies && (
                <div className="bg-green-50 border border-green-100 rounded-2xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-green-100 p-2 rounded-full">
                      <Star className="w-5 h-5 text-green-600" />
                    </div>
                    <h3 className="text-lg font-bold text-green-700">Interests & Hobbies</h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{bioSections.interestsHobbies}</p>
                </div>
              )}

              {/* What I Offer Section */}
              {bioSections.whatIOffer && (
                <div className="bg-purple-50 border border-purple-100 rounded-2xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-purple-100 p-2 rounded-full">
                      <Gift className="w-5 h-5 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-bold text-purple-700">What I Offer</h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{bioSections.whatIOffer}</p>
                </div>
              )}

              {/* Values & Privacy Section */}
              {bioSections.valuesPrivacy && (
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-amber-100 p-2 rounded-full">
                      <Shield className="w-5 h-5 text-amber-600" />
                    </div>
                    <h3 className="text-lg font-bold text-amber-700">Values & Privacy</h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{bioSections.valuesPrivacy}</p>
                </div>
              )}
            </div>
          ) : (
            /* Fallback: Original single description */
            <p className="mt-6 italic text-gray-600 bg-gray-50 p-4 rounded-xl">"{profile.description}"</p>
          )}

          {showContact ? (
            <div className="mt-8 space-y-4">
              {/* ✅ PINK BACKGROUND CONTACT CARD */}
              <div className="bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 p-6 rounded-2xl shadow-sm">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Contact Information</h3>
                
                {/* Phone Number Display */}
                <div className="flex items-center gap-3 mb-6 p-4 bg-white rounded-xl shadow-sm">
                  <div className="bg-pink-100 p-2 rounded-full">
                    <Phone className="text-pink-600" size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone Number</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatPhoneNumber(profile.contactInfo)}
                    </p>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Call Button - Pink Color */}
                  <a 
                    href={`tel:${profile.contactInfo.replace(/\D/g, '')}`}
                    className="bg-pink-600 hover:bg-pink-700 text-white py-3 rounded-xl text-center font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    <Phone size={20} />
                    Call Now
                  </a>
                  
                  {/* WhatsApp Button - Green Color */}
                  {isPhoneNumber(profile.contactInfo) && (
                    <button
                      onClick={openWhatsApp}
                      className="bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg"
                    >
                      <MessageSquare size={20} />
                      <span className="font-semibold">WhatsApp</span>
                    </button>
                  )}
                </div>
              </div>
              
              <p className="text-sm text-gray-500 text-center mt-4">
                Please be respectful when contacting. Mention you found them on BelleDiscovery.
              </p>
            </div>
          ) : (
            // Request Contact Button (Also Pink)
            <button
              onClick={handleContactClick}
              className="mt-8 w-full bg-gradient-to-r from-pink-600 to-rose-600 text-white py-4 rounded-xl hover:from-pink-700 hover:to-rose-700 transition-all shadow-lg hover:shadow-xl font-bold text-lg"
            >
              Get in Touch
            </button>
          )}

          <div className="flex gap-4 mt-6">
            <button 
              onClick={toggleFavorite} 
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all ${
                isFavorited 
                  ? 'bg-pink-50 text-pink-600 border border-pink-200' 
                  : 'border border-gray-300 hover:bg-gray-50 text-gray-700'
              }`}
            >
              <Heart size={20} className={isFavorited ? 'fill-current' : ''} />
              <span className="font-medium">{isFavorited ? 'Favorited' : 'Add to Favorites'}</span>
            </button>
            
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: `${profile.name} - BelleDiscovery`,
                    text: `Check out ${profile.name}'s profile on BelleDiscovery`,
                    url: window.location.href,
                  });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  setFeedback({ message: 'Link copied to clipboard!' });
                  setTimeout(() => setFeedback(null), 2000);
                }
              }}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-300 hover:bg-gray-50 text-gray-700 transition-all"
            >
              <Share2 size={20} />
              <span className="font-medium">Share Profile</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileDetail;
