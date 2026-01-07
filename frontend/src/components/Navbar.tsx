import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Heart, User, LogOut, LayoutDashboard, Search as SearchIcon, Menu, X } from 'lucide-react';
import { authService } from '../services/authService';

const Navbar: React.FC = () => {
  const user = authService.getCurrentUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    authService.logout();
    setIsMenuOpen(false);
    navigate('/');
  };

  const isAdmin = user?.role === 'admin';
  const isHome = location.pathname === '/';
  const navTextClass = !isScrolled && isHome ? 'text-white' : 'text-gray-900';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
      isScrolled || isMenuOpen
        ? 'bg-white/95 backdrop-blur-xl border-b border-gray-100 py-3 shadow-sm'
        : 'bg-transparent py-6 md:py-8'
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-3 shrink-0">
          <div className="bg-[#ff3061] p-2 rounded-xl shadow-lg shadow-rose-200">
            <Heart className="w-5 h-5 text-white fill-current" />
          </div>
          <span className={`text-2xl font-serif font-black tracking-tight ${navTextClass}`}>
            Belle<span className="text-[#ff3061]">Discovery</span>
          </span>
        </Link>

        <div className="hidden lg:flex items-center gap-10">
          <Link
            to="/search"
            className={`text-sm font-bold uppercase tracking-widest flex items-center gap-2 hover:text-[#ff3061] transition-colors ${
              location.pathname === '/search' ? 'text-[#ff3061]' : navTextClass
            }`}
          >
            <SearchIcon className="w-4 h-4" />
            BROWSE
          </Link>

          {isAdmin ? (
            <div className="flex items-center gap-6">
              <Link to="/admin/dashboard" className="text-sm font-bold text-gray-900 flex items-center gap-2 hover:text-[#ff3061] transition-colors">
                <LayoutDashboard className="w-4 h-4" /> DASHBOARD
              </Link>
              <button
                onClick={handleLogout}
                className="text-gray-400 hover:text-red-500 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <Link
              to="/admin/login"
              className="bg-[#0f172a] text-white px-8 py-3 rounded-full font-bold text-sm flex items-center gap-2 hover:bg-gray-800 transition-all shadow-lg active:scale-95"
            >
              <User className="w-4 h-4" />
              Admin
            </Link>
          )}
        </div>

        <button
          className="lg:hidden p-2 rounded-lg"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle Menu"
        >
          {isMenuOpen ? <X className="w-6 h-6 text-gray-900" /> : <Menu className={`w-6 h-6 ${navTextClass}`} />}
        </button>
      </div>

      {isMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-100 p-8 flex flex-col gap-6 animate-in slide-in-from-top duration-300 shadow-2xl">
          <Link to="/search" className={`text-lg font-bold uppercase tracking-widest ${location.pathname === '/search' ? 'text-[#ff3061]' : 'text-gray-900'}`}>
            BROWSE PROFILES
          </Link>

          {isAdmin ? (
            <>
              <div className="h-px bg-gray-100 w-full" />
              <Link to="/admin/dashboard" className={`text-lg font-bold uppercase tracking-widest ${location.pathname.includes('/admin/dashboard') ? 'text-[#ff3061]' : 'text-gray-900'}`}>
                DASHBOARD
              </Link>
              <button
                onClick={handleLogout}
                className="text-lg font-bold uppercase tracking-widest text-red-500 flex items-center gap-3 mt-2"
              >
                <LogOut className="w-5 h-5" />
                SIGN OUT
              </button>
            </>
          ) : (
            <Link to="/admin/login" className="bg-[#0f172a] text-white py-4 rounded-2xl text-center font-bold uppercase tracking-widest shadow-lg">
              ADMIN LOGIN
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;