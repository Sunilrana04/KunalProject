import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import DisclaimerPopup from './components/DisclaimerPopup';
import Home from './pages/Home';
import SearchResults from './pages/SearchResults';
import ProfileDetail from './pages/ProfileDetail';
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import ManageProfiles from './pages/admin/ManageProfiles';
import { authService } from './services/authService';

const ProtectedRoute: React.FC<React.PropsWithChildren> = ({ children }) => {
  if (!authService.isAdmin()) {
    return <Navigate to="/admin/login" replace />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <DisclaimerPopup />  {/* Ab ye admin routes pe nahi dikhega */}
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/profile/:id" element={<ProfileDetail />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/manage" element={<ProtectedRoute><ManageProfiles /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <footer className="bg-white border-t border-gray-100 py-12 px-4 mt-12">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-center md:text-left">
              <span className="text-xl font-serif font-bold tracking-tight text-gray-900">
                Belle<span className="text-rose-500">Discovery</span>
              </span>
              <p className="text-sm text-gray-500 mt-2">Connecting people through genuine discovery.</p>
            </div>
            <div className="flex gap-8 text-sm font-semibold text-gray-400">
              <a href="#" className="hover:text-rose-500 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-rose-500 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-rose-500 transition-colors">Help Center</a>
            </div>
            <div className="text-xs text-gray-400 font-bold uppercase tracking-widest">
              © 2026 BELLEDISCOVERY INC.
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
};

export default App;