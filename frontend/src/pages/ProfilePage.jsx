import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import DashboardHeader from '../components/DashboardHeader';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';
import { User, Phone, MapPin, CreditCard, Warehouse, Leaf, AlertCircle, Camera, Check } from 'lucide-react';

const PRESET_AVATARS = [
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%23dcfce7'/><text x='50' y='60' font-size='40' text-anchor='middle'>🌱</text></svg>",
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%23fef3c7'/><text x='50' y='60' font-size='40' text-anchor='middle'>🌾</text></svg>",
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%23dbeafe'/><text x='50' y='60' font-size='40' text-anchor='middle'>🚜</text></svg>",
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%23e0e7ff'/><text x='50' y='60' font-size='40' text-anchor='middle'>🍎</text></svg>"
];

export default function ProfilePage() {
  const { user, updateUserContext } = useAuth();
  const { t } = useLanguage();
  
  // Profile state details
  const [profilePhoto, setProfilePhoto] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [farmSize, setFarmSize] = useState('');
  const [upiId, setUpiId] = useState('');

  // Buyer Specific
  const [companyName, setCompanyName] = useState('');
  const [address, setAddress] = useState('');
  const [gstin, setGstin] = useState('');

  // Storage Specific
  const [storageName, setStorageName] = useState('');
  const [storageLocation, setStorageLocation] = useState('');
  const [storageCapacity, setStorageCapacity] = useState('');
  const [storageRate, setStorageRate] = useState('');
  const [storageDescription, setStorageDescription] = useState('');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Dispute/Complaint states
  const [complaints, setComplaints] = useState([]);
  const [compTitle, setCompTitle] = useState('');
  const [compDesc, setCompDesc] = useState('');
  const [compMessage, setCompMessage] = useState('');
  const [compError, setCompError] = useState('');
  const [compLoading, setCompLoading] = useState(false);

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const response = await api.get('/auth/profile');
        const data = response.data;
        setProfilePhoto(data.profilePhoto || '');
        setName(data.name || '');
        setPhone(data.phone || '');
        setState(data.state || '');
        setDistrict(data.district || '');
        setFarmSize(data.farmSizeAcres || '');
        setUpiId(data.upiId || '');

        setCompanyName(data.companyName || '');
        setAddress(data.address || '');
        setGstin(data.gstin || '');

        setStorageName(data.storageName || '');
        setStorageLocation(data.storageLocation || '');
        setStorageCapacity(data.storageCapacityTons || '');
        setStorageRate(data.storagePricePerTonDay || '');
        setStorageDescription(data.storageDescription || '');

        // Fetch personal dispute records if not an admin
        if (data.role !== 'ADMIN') {
          const compRes = await api.get('/complaints');
          setComplaints(compRes.data);
        }
      } catch (err) {
        console.error("Failed to load user profile.", err);
        setError("Could not load profile details from backend.");
      }
    };
    loadProfileData();
  }, []);

  const handleSubmitComplaint = async (e) => {
    e.preventDefault();
    setCompLoading(true);
    setCompMessage('');
    setCompError('');

    try {
      await api.post('/complaints', {
        title: compTitle,
        description: compDesc
      });
      setCompMessage("Your dispute case has been successfully filed with the Admin Board.");
      setCompTitle('');
      setCompDesc('');
      
      const compRes = await api.get('/complaints');
      setComplaints(compRes.data);
    } catch (err) {
      setCompError(err.response?.data || "Failed to submit dispute complaint.");
    } finally {
      setCompLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 150;
          const MAX_HEIGHT = 150;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          setProfilePhoto(dataUrl);
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePresetSelect = (preset) => {
    setProfilePhoto(preset);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    const payload = {
      profilePhoto,
      name,
      phone,
      state,
      district,
      farmSizeAcres: parseFloat(farmSize) || 0,
      upiId,
      companyName,
      address,
      gstin,
      storageName,
      storageLocation,
      storageCapacityTons: parseFloat(storageCapacity) || 0,
      storagePricePerTonDay: parseFloat(storageRate) || 0,
      storageDescription
    };

    try {
      await api.put('/auth/profile', payload);
      setMessage("Profile parameters successfully saved.");
      
      // Broadcast contextual updates to Sidebar & Headers
      updateUserContext({
        profilePhoto: profilePhoto
      });
    } catch (err) {
      setError(err.response?.data || "Failed to update profile details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex bg-[#fafbfb] min-h-screen font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-y-auto">
        <DashboardHeader title={t('profileTitle')} />

        <main className="p-8 max-w-4xl w-full mx-auto space-y-8">
          
          <div className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-premium text-left">
            <h3 className="text-xl font-black text-slate-800 tracking-tight mb-6">Manage User Credentials</h3>

            {message && (
              <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 p-4 rounded-xl text-xs font-bold mb-6">
                {message}
              </div>
            )}

            {error && (
              <div className="bg-rose-50 border border-rose-100 text-rose-700 p-4 rounded-xl text-xs font-bold mb-6 flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-8">
              
              {/* Profile Photo Uploader Section */}
              <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-8 pb-6 border-b border-slate-100">
                <div className="relative">
                  {profilePhoto ? (
                    <img src={profilePhoto} alt="Avatar" className="h-24 w-24 rounded-3xl object-cover border border-slate-100 shadow-md" />
                  ) : (
                    <div className="h-24 w-24 rounded-3xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400">
                      <User className="h-10 w-10" />
                    </div>
                  )}
                  <label className="absolute bottom-[-8px] right-[-8px] bg-slate-900 text-white p-2 rounded-2xl cursor-pointer hover:bg-slate-800 transition-colors border border-slate-800 shadow-sm">
                    <Camera className="h-4 w-4" />
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  </label>
                </div>

                <div className="text-center sm:text-left space-y-3">
                  <h4 className="font-bold text-sm text-slate-700">Choose Profile Avatar</h4>
                  <p className="text-xs text-slate-400">Upload a custom image (max 2MB) or select from farm presets:</p>
                  
                  <div className="flex space-x-3.5 justify-center sm:justify-start">
                    {PRESET_AVATARS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handlePresetSelect(preset)}
                        className={`h-11 w-11 rounded-2xl border transition-all relative overflow-hidden flex items-center justify-center bg-white ${profilePhoto === preset ? 'border-indigo-600 scale-[1.05]' : 'border-slate-150 hover:scale-[1.02]'}`}
                      >
                        <img src={preset} alt="preset" className="h-9 w-9 object-contain" />
                        {profilePhoto === preset && (
                          <div className="absolute inset-0 bg-indigo-600/10 flex items-center justify-center">
                            <Check className="h-4.5 w-4.5 text-indigo-700 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Dynamic Role Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Farmer Details */}
                {user?.role === 'FARMER' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Farmer Name</label>
                      <input 
                        type="text" required value={name} onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none text-sm" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Phone Number</label>
                      <input 
                        type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none text-sm" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">State</label>
                      <input 
                        type="text" required value={state} onChange={(e) => setState(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none text-sm" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">District</label>
                      <input 
                        type="text" required value={district} onChange={(e) => setDistrict(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none text-sm" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Farm Size (Acres)</label>
                      <input 
                        type="number" step="0.1" required value={farmSize} onChange={(e) => setFarmSize(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none text-sm" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">UPI Payment ID</label>
                      <input 
                        type="text" required value={upiId} onChange={(e) => setUpiId(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none text-sm" 
                      />
                    </div>
                  </>
                )}

                {/* Buyer Details */}
                {user?.role === 'BUYER' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Company Name</label>
                      <input 
                        type="text" required value={companyName} onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none text-sm" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Representative Name</label>
                      <input 
                        type="text" required value={name} onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none text-sm" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Contact Phone</label>
                      <input 
                        type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none text-sm" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">GSTIN Number</label>
                      <input 
                        type="text" value={gstin} onChange={(e) => setGstin(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none text-sm" 
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Delivery Address</label>
                      <textarea 
                        rows={2} required value={address} onChange={(e) => setAddress(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none text-sm resize-none" 
                      />
                    </div>
                  </>
                )}

                {/* Cold Storage Details */}
                {user?.role === 'COLD_STORAGE_MANAGER' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Storage Facility Name</label>
                      <input 
                        type="text" required value={storageName} onChange={(e) => setStorageName(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none text-sm" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Location / Address</label>
                      <input 
                        type="text" required value={storageLocation} onChange={(e) => setStorageLocation(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none text-sm" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Total Capacity (Tons)</label>
                      <input 
                        type="number" required value={storageCapacity} onChange={(e) => setStorageCapacity(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none text-sm" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Storage Rate (₹/ton/day)</label>
                      <input 
                        type="number" required value={storageRate} onChange={(e) => setStorageRate(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none text-sm" 
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Facility Description</label>
                      <textarea 
                        rows={3} required value={storageDescription} onChange={(e) => setStorageDescription(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none text-sm resize-none" 
                      />
                    </div>
                  </>
                )}

                {/* Admin Details */}
                {user?.role === 'ADMIN' && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-slate-500 bg-slate-50 p-4 border border-slate-100 rounded-2xl">
                      Logged in as System Administrator. Access credentials parameters under the Settings console.
                    </p>
                  </div>
                )}

              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#143d2c] hover:bg-agrogreen-950 text-white py-3.5 rounded-xl font-bold transition-all"
              >
                {loading ? 'Applying Parameters...' : 'Save & Broadcast Profile Updates'}
              </button>

            </form>
          </div>

          {/* Dispute / Complaint Submission Desk */}
          {user?.role !== 'ADMIN' && (
            <div className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-premium text-left space-y-6">
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-1">Disputes & Complaints Board</h3>
                <p className="text-xs text-slate-400">File a secure ticket to the Admin Desk to resolve order, payment, or logistics disputes.</p>
              </div>

              {compMessage && (
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 p-4 rounded-xl text-xs font-bold">
                  {compMessage}
                </div>
              )}

              {compError && (
                <div className="bg-rose-50 border border-rose-100 text-rose-700 p-4 rounded-xl text-xs font-bold flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{compError}</span>
                </div>
              )}

              <form onSubmit={handleSubmitComplaint} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Issue Subject / Title</label>
                  <input 
                    type="text" required value={compTitle} onChange={(e) => setCompTitle(e.target.value)}
                    placeholder="e.g. Escrow payout not cleared / Storage overbooking"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none text-sm placeholder:text-slate-350" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Detailed Description</label>
                  <textarea 
                    rows={4} required value={compDesc} onChange={(e) => setCompDesc(e.target.value)}
                    placeholder="Please explain the details of the issue including Order IDs and dates..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none text-sm resize-none placeholder:text-slate-350" 
                  />
                </div>
                <button
                  type="submit"
                  disabled={compLoading}
                  className="bg-[#143d2c] hover:bg-agrogreen-950 text-white font-bold px-6 py-3 rounded-xl text-xs transition-colors shadow-sm"
                >
                  {compLoading ? 'Submitting Case...' : 'File Secure Dispute'}
                </button>
              </form>

              {/* Past Complaints List */}
              <div className="pt-6 border-t border-slate-100">
                <h4 className="font-extrabold text-slate-800 text-sm mb-4">Your Dispute Records</h4>
                {complaints.length === 0 ? (
                  <p className="text-xs text-slate-400">You have no active or historical dispute cases filed.</p>
                ) : (
                  <div className="space-y-4">
                    {complaints.map((comp) => (
                      <div key={comp.id} className="p-4 border border-slate-150 rounded-2xl flex justify-between items-start">
                        <div className="space-y-1">
                          <span className="font-extrabold text-slate-850 text-sm">{comp.title}</span>
                          <p className="text-xs text-slate-500">{comp.description}</p>
                          <span className="block text-[10px] text-slate-400">Filed on: {new Date(comp.createdAt || Date.now()).toLocaleDateString()}</span>
                        </div>
                        <span className={`px-2.5 py-0.5 text-[9px] font-bold uppercase rounded-md ${
                          comp.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-600' :
                          comp.status === 'PENDING' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-500'
                        }`}>{comp.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
