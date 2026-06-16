import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, ArrowUpRight, Leaf } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import LanguageSelector from './LanguageSelector';
import MandiTicker from './MandiTicker';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const handleDashboardRedirect = () => {
    if (!user) return;
    if (user.role === 'FARMER') navigate('/farmer');
    else if (user.role === 'BUYER') navigate('/buyer');
    else if (user.role === 'COLD_STORAGE_MANAGER') navigate('/storage');
    else if (user.role === 'ADMIN') navigate('/admin');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 glass-card transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          {/* Logo Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="bg-gradient-to-tr from-agrogreen-600 to-agrogreen-500 p-2 rounded-xl text-white shadow-md shadow-agrogreen-200">
                <Leaf className="h-6 w-6 transform group-hover:rotate-12 transition-transform duration-300" />
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-agrogreen-950 font-sans">
                Agro<span className="text-agrogreen-600 font-semibold">Link</span>
              </span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-9">
            <Link 
              to="/" 
              className={`font-medium transition-colors ${isActive('/') ? 'text-agrogreen-700' : 'text-slate-600 hover:text-agrogreen-600'}`}
            >
              {t('home')}
            </Link>
            <Link 
              to="/about" 
              className={`font-medium transition-colors ${isActive('/about') ? 'text-agrogreen-700' : 'text-slate-600 hover:text-agrogreen-600'}`}
            >
              {t('aboutUs')}
            </Link>
            <Link 
              to="/services" 
              className={`font-medium transition-colors ${isActive('/services') ? 'text-agrogreen-700' : 'text-slate-600 hover:text-agrogreen-600'}`}
            >
              {t('services')}
            </Link>
            {user && user.role === 'FARMER' && (
              <Link 
                to="/schemes" 
                className={`font-medium transition-colors ${isActive('/schemes') ? 'text-agrogreen-700' : 'text-slate-600 hover:text-agrogreen-600'}`}
              >
                {t('govtSchemes')}
              </Link>
            )}
            <Link 
              to="/contact" 
              className={`font-medium transition-colors ${isActive('/contact') ? 'text-agrogreen-700' : 'text-slate-600 hover:text-agrogreen-600'}`}
            >
              {t('contact')}
            </Link>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <LanguageSelector />
            {user ? (
              <>
                <button
                  onClick={handleDashboardRedirect}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-agrogreen-700 hover:bg-agrogreen-50 transition-colors flex items-center space-x-2"
                >
                  {user.profilePhoto ? (
                    <img src={user.profilePhoto} alt="Profile" className="h-7 w-7 rounded-full object-cover border border-agrogreen-200" />
                  ) : (
                    <div className="h-7 w-7 rounded-full bg-agrogreen-500 flex items-center justify-center font-bold text-white text-xs">
                      {user.email.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span>{t('dashboard')}</span>
                  <ArrowUpRight className="h-4 w-4 animate-pulse" />
                </button>
                <button
                  onClick={() => { logout(); navigate('/'); }}
                  className="bg-red-50 hover:bg-red-100 text-red-600 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                >
                  {t('signOut')}
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-6 py-2.5 text-sm font-semibold text-slate-700 hover:text-agrogreen-700 transition-colors"
                >
                  {t('signIn')}
                </Link>
                <Link
                  to="/register"
                  className="bg-agrogreen-950 hover:bg-agrogreen-900 text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-slate-200 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  {t('register')}
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center space-x-2">
            <LanguageSelector />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-600 p-2 rounded-xl hover:bg-slate-50 transition-colors"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white/95 backdrop-blur-lg animate-fade-in">
          <div className="px-4 pt-2 pb-6 space-y-2">
            <Link
              to="/"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-3 rounded-xl font-medium text-slate-700 hover:bg-agrogreen-50 hover:text-agrogreen-700 transition-all"
            >
              {t('home')}
            </Link>
            <Link
              to="/about"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-3 rounded-xl font-medium text-slate-700 hover:bg-agrogreen-50 hover:text-agrogreen-700 transition-all"
            >
              {t('aboutUs')}
            </Link>
            <Link
              to="/services"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-3 rounded-xl font-medium text-slate-700 hover:bg-agrogreen-50 hover:text-agrogreen-700 transition-all"
            >
              {t('services')}
            </Link>
            {user && user.role === 'FARMER' && (
              <Link
                to="/schemes"
                onClick={() => setIsOpen(false)}
                className="block px-4 py-3 rounded-xl font-medium text-slate-700 hover:bg-agrogreen-50 hover:text-agrogreen-700 transition-all"
              >
                {t('govtSchemes')}
              </Link>
            )}
            <Link
              to="/contact"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-3 rounded-xl font-medium text-slate-700 hover:bg-agrogreen-50 hover:text-agrogreen-700 transition-all"
            >
              {t('contact')}
            </Link>
            <hr className="border-slate-100 my-2" />
            {user ? (
              <div className="space-y-2 px-2">
                <button
                  onClick={() => { setIsOpen(false); handleDashboardRedirect(); }}
                  className="w-full flex items-center justify-center space-x-2 bg-agrogreen-50 hover:bg-agrogreen-100 text-agrogreen-700 py-3 rounded-xl font-semibold transition-colors"
                >
                  {user.profilePhoto ? (
                    <img src={user.profilePhoto} alt="Profile" className="h-6 w-6 rounded-full object-cover border border-agrogreen-200" />
                  ) : (
                    <div className="h-6 w-6 rounded-full bg-agrogreen-500 flex items-center justify-center font-bold text-white text-xs">
                      {user.email.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span>{t('dashboard')}</span>
                </button>
                <button
                  onClick={() => { setIsOpen(false); logout(); navigate('/'); }}
                  className="w-full text-center bg-red-50 hover:bg-red-100 text-red-600 py-3 rounded-xl font-semibold transition-colors"
                >
                  {t('signOut')}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 px-2">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="text-center border border-slate-200 hover:border-slate-300 py-3 rounded-xl font-semibold text-slate-700 transition-colors"
                >
                  {t('signIn')}
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="text-center bg-agrogreen-950 hover:bg-agrogreen-900 text-white py-3 rounded-xl font-semibold transition-colors"
                >
                  {t('register')}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Live Mandi Rates Running Ticker */}
      <MandiTicker />
    </nav>
  );
}

