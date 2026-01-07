import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ShieldAlert, CheckCircle2, XCircle } from 'lucide-react';

const DisclaimerPopup: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If current path is any admin route → do NOT show disclaimer
    if (location.pathname.startsWith('/admin')) {
      return;
    }

    // Only check localStorage for non-admin routes
    const isAccepted = localStorage.getItem('belle_disclaimer_accepted');
    if (!isAccepted) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [location.pathname]);

  const handleAccept = () => {
    localStorage.setItem('belle_disclaimer_accepted', 'true');
    setIsVisible(false);
    document.body.style.overflow = 'auto';
    navigate('/');
  };

  const handleDecline = () => {
    window.location.href = 'https://www.google.com';
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-gray-950 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-rose-900/40 via-gray-950 to-black" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-indigo-950/20 via-transparent to-transparent" />
      <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-rose-500/10 blur-[150px] rounded-full animate-pulse duration-[10s]" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-rose-600/5 blur-[120px] rounded-full" />
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E")` }} />
      
      <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-[0_0_100px_rgba(244,63,94,0.2)] overflow-hidden border border-white/20 animate-in fade-in zoom-in duration-500">
        <div className="p-8 md:p-10 text-center">
          <div className="bg-rose-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 text-rose-500 shadow-inner">
            <ShieldAlert className="w-10 h-10" />
          </div>
          
          <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">
            Safety & Terms <span className="text-rose-500">Notice</span>
          </h2>
          
          <div className="space-y-4 text-gray-600 text-sm leading-relaxed mb-10 text-left bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <p className="flex gap-3 text-gray-700">
              <span className="shrink-0 text-rose-500 font-bold">•</span>
              I confirm that I am at least 18 years of age or older.
            </p>
            <p className="flex gap-3 text-gray-700">
              <span className="shrink-0 text-rose-500 font-bold">•</span>
              I understand that BelleDiscovery is a discovery platform and does not personally verify all details of the profiles listed.
            </p>
            <p className="flex gap-3 text-gray-700">
              <span className="shrink-0 text-rose-500 font-bold">•</span>
              I agree to use this information responsibly and adhere to the platform's community guidelines.
            </p>
          </div>
          
          <div className="flex flex-col gap-3">
            <button
              onClick={handleAccept}
              className="w-full bg-[#ff3061] hover:bg-[#e62a56] text-white py-4 rounded-2xl font-bold text-lg transition-all shadow-lg shadow-rose-200 flex items-center justify-center gap-2 active:scale-95"
            >
              <CheckCircle2 className="w-5 h-5" />
              I Agree & Enter
            </button>
            <button
              onClick={handleDecline}
              className="w-full bg-white border border-gray-200 text-gray-500 py-4 rounded-2xl font-bold text-lg hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
            >
              <XCircle className="w-5 h-5" />
              Exit Platform
            </button>
          </div>
          
          <p className="mt-8 text-[10px] text-gray-400 uppercase font-bold tracking-[0.2em]">
            Secure Access • BelleDiscovery Protocol
          </p>
        </div>
      </div>
    </div>
  );
};

export default DisclaimerPopup;