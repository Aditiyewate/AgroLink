import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import Navbar from '../components/Navbar';
import { ArrowLeft, Eye, EyeOff, Lock, Mail, Users, Building, Warehouse, ShieldAlert } from 'lucide-react';

export default function Login() {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role');
  
  const [role, setRole] = useState(initialRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const trimmedEmail = email ? email.trim().toLowerCase() : '';
      const user = await login(trimmedEmail, password);
      if (user.role === 'FARMER') navigate('/farmer');
      else if (user.role === 'BUYER') navigate('/buyer');
      else if (user.role === 'COLD_STORAGE_MANAGER') navigate('/storage');
      else if (user.role === 'ADMIN') navigate('/admin');
      else navigate('/');
    } catch (err) {
      setError(err.message || 'Incorrect email or password.');
    } finally {
      setLoading(false);
    }
  };

  if (!role) {
    return (
      <div className="min-h-screen bg-[#fafbfb] flex flex-col font-sans">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-16 px-4">
          <div className="w-full max-w-2xl bg-white rounded-3xl border border-slate-100 p-10 shadow-premium text-center">
            <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-2">{t('selectRole')}</h2>
            <p className="text-slate-500 mb-10">Choose how you want to log in to AgroLink.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <button onClick={() => setRole('FARMER')} className="p-8 rounded-2xl border border-slate-200 hover:border-agrogreen-600 hover:bg-agrogreen-50 transition-all flex flex-col items-center">
                <Users className="h-10 w-10 text-agrogreen-600 mb-4" />
                <span className="font-bold text-slate-800">{t('farmer')}</span>
              </button>
              <button onClick={() => setRole('BUYER')} className="p-8 rounded-2xl border border-slate-200 hover:border-agrogreen-600 hover:bg-agrogreen-50 transition-all flex flex-col items-center">
                <Building className="h-10 w-10 text-agrogreen-600 mb-4" />
                <span className="font-bold text-slate-800">{t('buyer')}</span>
              </button>
              <button onClick={() => setRole('COLD_STORAGE_MANAGER')} className="p-8 rounded-2xl border border-slate-200 hover:border-agrogreen-600 hover:bg-agrogreen-50 transition-all flex flex-col items-center">
                <Warehouse className="h-10 w-10 text-agrogreen-600 mb-4" />
                <span className="font-bold text-slate-800">{t('coldStorageManager')}</span>
              </button>
              <button onClick={() => setRole('ADMIN')} className="p-8 rounded-2xl border border-slate-200 hover:border-agrogreen-600 hover:bg-agrogreen-50 transition-all flex flex-col items-center col-span-1 md:col-span-3 lg:col-span-1">
                <ShieldAlert className="h-10 w-10 text-agrogreen-600 mb-4" />
                <span className="font-bold text-slate-800">{t('systemAdmin')}</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const roleConfig = {
    FARMER: {
      title: t('farmer'),
      subtitle: t('loginSubtitle'),
      bgImage: '/images/login_farmer_bg.png',
      leftTitle: 'AgroLink',
      leftDesc: t('heroSubtitle'),
      boxNumber: '1.2M+',
      boxLabel: 'Farmers Trusted Us',
      boxText: '"AgroLink helped me secure my harvest and get the best market price directly from the mandis."',
      inputLabel: t('email'),
      btnText: t('signIn')
    },
    BUYER: {
      title: t('buyer'),
      subtitle: t('loginSubtitle'),
      bgImage: '/images/login_buyer_bg.png',
      leftTitle: 'Streamline Your Bulk Procurement',
      leftDesc: t('heroSubtitle'),
      boxNumber: 'WHEAT',
      boxLabel: '₹2,450/q',
      boxText: '',
      inputLabel: t('email'),
      btnText: t('signIn')
    },
    COLD_STORAGE_MANAGER: {
      title: t('coldStorageManager'),
      subtitle: t('loginSubtitle'),
      bgImage: '/images/login_storage_bg.png',
      leftTitle: 'Logistics Management Portal',
      leftDesc: t('heroSubtitle'),
      boxNumber: '98%',
      boxLabel: 'Efficiency Rate',
      boxText: '',
      inputLabel: t('email'),
      btnText: t('signIn')
    },
    ADMIN: {
      title: t('systemAdmin'),
      subtitle: t('loginSubtitle'),
      bgImage: '/images/logistics.png',
      leftTitle: 'AgroLink Central Control',
      leftDesc: t('heroSubtitle'),
      boxNumber: '100%',
      boxLabel: 'System Uptime',
      boxText: '',
      inputLabel: t('email'),
      btnText: t('signIn')
    }
  };

  const currentConfig = roleConfig[role] || roleConfig.FARMER;

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row font-sans">
      {/* Left Pane - Branding */}
      <div className="hidden md:flex md:w-1/2 relative bg-agrogreen-950 text-white overflow-hidden flex-col justify-between min-h-screen">
        <img src={currentConfig.bgImage} alt="Background" className="absolute inset-0 w-full h-full object-cover z-0 opacity-40 mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-t from-agrogreen-950 via-agrogreen-950/80 to-transparent z-10"></div>
        
        <div className="relative z-20 p-12">
          <Link to="/" className="text-2xl font-black tracking-tight text-white inline-block mb-12">AgroLink</Link>
          <h1 className="text-4xl lg:text-5xl font-extrabold mb-4">{currentConfig.leftTitle}</h1>
          <p className="text-agrogreen-100 text-lg max-w-md leading-relaxed">{currentConfig.leftDesc}</p>
        </div>

        <div className="relative z-20 p-12 pt-0">
          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 text-slate-800 shadow-xl max-w-sm">
            {role === 'FARMER' && (
              <div className="flex flex-col space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-agrogreen-100 p-2.5 rounded-full text-agrogreen-600"><Users className="h-6 w-6" /></div>
                  <div>
                    <h4 className="font-black text-xl">{currentConfig.boxNumber}</h4>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">{currentConfig.boxLabel}</p>
                  </div>
                </div>
                <p className="text-sm italic text-slate-600">{currentConfig.boxText}</p>
              </div>
            )}
            {role === 'BUYER' && (
              <div className="flex items-center justify-between font-bold text-sm">
                 <span className="text-slate-600">WHEAT <span className="text-agrogreen-600">₹2,450/q</span></span>
                 <span className="text-slate-600">POTATO <span className="text-agrogreen-600">₹1,120/q</span></span>
              </div>
            )}
            {role === 'COLD_STORAGE_MANAGER' && (
              <div className="flex items-center justify-between">
                 <div>
                    <h4 className="font-black text-2xl text-agrogreen-700">98%</h4>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Efficiency Rate</p>
                 </div>
                 <div>
                    <h4 className="font-black text-2xl text-agrogreen-700">24/7</h4>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Live Monitoring</p>
                 </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Pane - Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-between overflow-y-auto bg-white min-h-screen">
        <div className="p-8 flex justify-end">
          {/* Header area in form pane */}
        </div>

        <div className="max-w-md w-full mx-auto px-8 pb-12">
          <button onClick={() => setRole(null)} className="flex items-center text-xs font-bold text-slate-500 hover:text-slate-800 mb-8 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Role Selection
          </button>

          <h2 className="text-3xl font-black text-slate-900 mb-2">{currentConfig.title}</h2>
          <p className="text-slate-500 text-sm mb-10">{currentConfig.subtitle}</p>

          {error && (
            <div className="bg-rose-50 text-rose-700 p-4 rounded-xl text-xs font-bold mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">{currentConfig.inputLabel}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input 
                  type="text" required value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. name@domain.com"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-agrogreen-500/20 focus:border-agrogreen-600 transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="block text-xs font-bold text-slate-700">{t('password')}</label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input 
                  type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-10 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-agrogreen-500/20 focus:border-agrogreen-600 transition-all text-sm"
                />
                <div 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-[#143d2c] hover:bg-agrogreen-950 text-white py-4 rounded-xl font-bold flex items-center justify-center space-x-2 transition-all disabled:opacity-50">
              <span>{loading ? t('loading') : currentConfig.btnText}</span>
              <ArrowLeft className="h-4 w-4 rotate-180" />
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-sm text-slate-500">
              New to AgroLink? <Link to={`/register?role=${role}`} className="text-agrogreen-700 font-bold hover:underline">Register as {role.replace(/_/g, ' ').toLowerCase()}</Link>
            </p>
          </div>
        </div>

        <div className="p-8 text-center text-xs font-medium text-slate-400 flex flex-col md:flex-row justify-between items-center bg-slate-50 border-t border-slate-100 mt-auto">
           <span>© 2026 AgroLink. Empowering Indian Agriculture.</span>
           <div className="space-x-4 mt-4 md:mt-0">
             <Link to="#" className="hover:text-slate-600">Privacy Policy</Link>
             <Link to="#" className="hover:text-slate-600">Terms of Service</Link>
             <Link to="#" className="hover:text-slate-600">Support</Link>
           </div>
        </div>
      </div>
    </div>
  );
}
