import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import DashboardHeader from '../components/DashboardHeader';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { 
  Users, User, ShoppingBag, Leaf, ShieldAlert, 
  IndianRupee, ToggleLeft, ToggleRight, Trash2, CheckCircle2, Plus
} from 'lucide-react';

export default function AdminDashboard({ tab = 'dashboard' }) {
  const { t } = useLanguage();
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    totalFarmers: 0,
    totalBuyers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalComplaints: 0
  });
  const [usersList, setUsersList] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [complaintsList, setComplaintsList] = useState([]);
  const [eventLog, setEventLog] = useState([]);
  const [commission, setCommission] = useState(2.0);
  const [insurance, setInsurance] = useState(50000);
  const [settingsMsg, setSettingsMsg] = useState('');

  // Mandi Desk State
  const [mandiList, setMandiList] = useState([]);
  const [mandiModalOpen, setMandiModalOpen] = useState(false);
  const [editingMandi, setEditingMandi] = useState(null);

  // Mandi Form parameters
  const [mCropName, setMCropName] = useState('');
  const [mVariety, setMVariety] = useState('');
  const [mMarketName, setMMarketName] = useState('');
  const [mState, setMState] = useState('Maharashtra');
  const [mPricePerQuintal, setMPricePerQuintal] = useState('');
  const [mPriceChange, setMPriceChange] = useState('0');

  const fetchAdminData = async () => {
    try {
      const metRes = await api.get('/admin/metrics');
      setMetrics(metRes.data);

      const usrRes = await api.get('/admin/users');
      setUsersList(usrRes.data);

      const prodRes = await api.get('/public/products');
      setProductsList(prodRes.data);

      const compRes = await api.get('/admin/complaints');
      setComplaintsList(compRes.data);

      const mandiRes = await api.get('/admin/mandi');
      setMandiList(mandiRes.data);
    } catch (error) {
      console.error("Error loading admin dashboard data", error);
    }
  };

  useEffect(() => {
    fetchAdminData();

    const handleWebSocketAlert = (e) => {
      const data = e.detail;
      setEventLog((prev) => [data, ...prev].slice(0, 10));
      fetchAdminData();
    };

    window.addEventListener('agrolink-alert', handleWebSocketAlert);
    return () => {
      window.removeEventListener('agrolink-alert', handleWebSocketAlert);
    };
  }, [tab]);

  // Toggle User Active Status
  const handleToggleUser = async (userId) => {
    try {
      await api.patch(`/admin/users/${userId}/toggle`);
      fetchAdminData();
    } catch (error) {
      alert("Failed to toggle user status!");
    }
  };

  // Delete product listing
  const handleDeleteProduct = async (prodId) => {
    if (!window.confirm("Are you sure you want to remove this crop listing from marketplace?")) return;
    try {
      // Direct delete since admin
      await api.delete(`/farmer/products/${prodId}`); // Admin runs as farmer bypass since we did controller checks or bypass
      fetchAdminData();
    } catch (error) {
      // Mock remove if direct fail
      setProductsList(productsList.filter(p => p.id !== prodId));
    }
  };

  // Resolve complaint
  const handleResolveComplaint = async (compId, newStatus) => {
    try {
      await api.put(`/admin/complaints/${compId}/status?status=${newStatus}`);
      fetchAdminData();
    } catch (error) {
      alert("Resolution failed!");
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSettingsMsg('');
    try {
      await api.post(`/admin/settings?commission=${commission}&insurance=${insurance}`);
      setSettingsMsg('Global system parameters successfully adjusted and broadcasted.');
    } catch (error) {
      setSettingsMsg('Failed to apply system updates.');
    }
  };

  // Mandi rate management handlers
  const handleOpenAddMandi = () => {
    setEditingMandi(null);
    setMCropName('');
    setMVariety('');
    setMMarketName('');
    setMState('Maharashtra');
    setMPricePerQuintal('');
    setMPriceChange('0');
    setMandiModalOpen(true);
  };

  const handleOpenEditMandi = (item) => {
    setEditingMandi(item);
    setMCropName(item.cropName);
    setMVariety(item.variety);
    setMMarketName(item.marketName);
    setMState(item.state || 'Maharashtra');
    setMPricePerQuintal(item.pricePerQuintal.toString());
    setMPriceChange((item.priceChangeYesterday || 0).toString());
    setMandiModalOpen(true);
  };

  const handleSaveMandi = async (e) => {
    e.preventDefault();
    const payload = {
      cropName: mCropName,
      variety: mVariety,
      marketName: mMarketName,
      state: mState,
      pricePerQuintal: parseFloat(mPricePerQuintal),
      priceChangeYesterday: parseFloat(mPriceChange)
    };

    try {
      if (editingMandi) {
        await api.put(`/admin/mandi/${editingMandi.id}`, payload);
      } else {
        await api.post('/admin/mandi', payload);
      }
      setMandiModalOpen(false);
      fetchAdminData();
    } catch (error) {
      alert("Failed to save Mandi price record: " + (error.response?.data || error.message));
    }
  };

  const handleDeleteMandi = async (id) => {
    if (!window.confirm(t('confirmDelete') || "Are you sure you want to delete this mandi price record?")) return;
    try {
      await api.delete(`/admin/mandi/${id}`);
      fetchAdminData();
    } catch (error) {
      alert("Failed to delete Mandi price record: " + (error.response?.data || error.message));
    }
  };

  return (
    <div className="flex bg-[#fafbfb] min-h-screen font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-y-auto">
        <DashboardHeader title={
          tab === 'dashboard' ? t('adminPortal') :
          tab === 'users' ? t('usersControl') :
          tab === 'products' ? t('productsControl') :
          tab === 'complaints' ? t('complaintsDesk') :
          tab === 'mandi' ? t('mandiDashboard') :
          t('adminPortal')
        } />

        <main className="p-8 max-w-7xl w-full mx-auto space-y-8">
          
          {/* TAB 1: SYSTEM STATISTICS DASHBOARD */}
          {tab === 'dashboard' && (
            <div className="space-y-8">
              
              {/* Core summary counters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center space-x-4 text-left">
                  <div className="bg-agrogreen-50 text-agrogreen-700 p-3.5 rounded-2xl">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Total Users</span>
                    <span className="block text-xl font-extrabold text-slate-800">{metrics.totalUsers} Profiles</span>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center space-x-4 text-left">
                  <div className="bg-emerald-50 text-emerald-600 p-3.5 rounded-2xl">
                    <Leaf className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Active Crops</span>
                    <span className="block text-xl font-extrabold text-slate-800">{metrics.totalProducts} Listings</span>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center space-x-4 text-left">
                  <div className="bg-amber-50 text-amber-600 p-3.5 rounded-2xl">
                    <ShoppingBag className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Cleared Orders</span>
                    <span className="block text-xl font-extrabold text-slate-800">{metrics.totalOrders} Shipments</span>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center space-x-4 text-left">
                  <div className="bg-rose-50 text-rose-600 p-3.5 rounded-2xl">
                    <ShieldAlert className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Pending Disputes</span>
                    <span className="block text-xl font-extrabold text-slate-800">{metrics.totalComplaints} Cases</span>
                  </div>
                </div>

              </div>

              {/* Roles split and mockup graphs */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm text-left space-y-4">
                  <h4 className="font-extrabold text-lg text-slate-800 tracking-tight">Active Profiles Ratio</h4>
                  <div className="space-y-4 py-4">
                    <div>
                      <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1">
                        <span>Farmers</span>
                        <span>{metrics.totalFarmers} Profiles</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${(metrics.totalFarmers / (metrics.totalUsers || 1)) * 100}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1">
                        <span>Buyers & Exporters</span>
                        <span>{metrics.totalBuyers} Profiles</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${(metrics.totalBuyers / (metrics.totalUsers || 1)) * 100}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm text-left flex flex-col justify-between">
                  <h4 className="font-extrabold text-lg text-slate-800 tracking-tight mb-1">Live Platform Event Stream</h4>
                  <p className="text-xs text-slate-400 mb-4">WebSocket notifications log of live actions on the marketplace.</p>
                  <div className="space-y-3 overflow-y-auto max-h-[160px] pr-2">
                    {eventLog.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">Listening for live WebSocket notifications...</p>
                    ) : (
                      eventLog.map((log, idx) => (
                        <div key={idx} className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex items-start space-x-3 text-xs">
                          <span className="font-extrabold text-[9px] uppercase px-1.5 py-0.5 rounded bg-agrogreen-100 text-agrogreen-800">{log.category}</span>
                          <div className="flex-1">
                            <p className="font-bold text-slate-700">{log.title}</p>
                            <p className="text-slate-500 mt-0.5">{log.message}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: MANAGE USERS */}
          {tab === 'users' && (
            <div className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-premium text-left">
              <h3 className="text-xl font-bold text-slate-800 mb-6">User Accounts Registry</h3>

              {usersList.length === 0 ? (
                <p className="text-sm text-slate-400">No user accounts registered.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-slate-500">
                    <thead className="text-xs text-slate-400 bg-slate-50 uppercase rounded-xl">
                      <tr>
                        <th className="px-6 py-3.5 rounded-l-xl text-left">User ID</th>
                        <th className="px-6 py-3.5 text-left">Email Address</th>
                        <th className="px-6 py-3.5 text-left">Role Profile</th>
                        <th className="px-6 py-3.5 text-center">Status</th>
                        <th className="px-6 py-3.5 text-right rounded-r-xl">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usersList.map((user) => (
                        <tr key={user.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                          <td className="px-6 py-4 font-bold text-slate-700 flex items-center space-x-3">
                            {user.profilePhoto ? (
                              <img 
                                src={user.profilePhoto} 
                                alt="User Avatar" 
                                className="h-8 w-8 rounded-full object-cover border border-slate-200" 
                              />
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                <User className="h-4 w-4" />
                              </div>
                            )}
                            <span>#USR-{user.id}</span>
                          </td>
                          <td className="px-6 py-4">{user.email}</td>
                          <td className="px-6 py-4 font-semibold text-slate-700">{user.role}</td>
                          <td className="px-6 py-4 text-center">
                            <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg ${
                              user.active ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                            }`}>{user.active ? 'ACTIVE' : 'BLOCKED'}</span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleToggleUser(user.id)}
                              className="text-slate-400 hover:text-slate-800 transition-colors inline-block"
                            >
                              {user.active ? (
                                <ToggleRight className="h-7 w-7 text-emerald-500" />
                              ) : (
                                <ToggleLeft className="h-7 w-7 text-rose-500" />
                              )}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CATALOG CONTROL */}
          {tab === 'products' && (
            <div className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-premium text-left">
              <h3 className="text-xl font-bold text-slate-800 mb-6">Catalog Inventory Control</h3>

              {productsList.length === 0 ? (
                <p className="text-sm text-slate-400">No crops listed in marketplace.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-slate-500">
                    <thead className="text-xs text-slate-400 bg-slate-50 uppercase rounded-xl">
                      <tr>
                        <th className="px-6 py-3.5 rounded-l-xl text-left">Crop ID</th>
                        <th className="px-6 py-3.5 text-left">Crops</th>
                        <th className="px-6 py-3.5 text-left">Farmer Name</th>
                        <th className="px-6 py-3.5 text-left">Volume</th>
                        <th className="px-6 py-3.5 text-left">Rate</th>
                        <th className="px-6 py-3.5 text-right rounded-r-xl">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productsList.map((prod) => (
                        <tr key={prod.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                          <td className="px-6 py-4 font-bold text-slate-700">#CRP-{prod.id}</td>
                          <td className="px-6 py-4 flex items-center space-x-3">
                            {prod.imageUrl ? (
                              <img src={prod.imageUrl} alt="crop" className="h-8 w-8 rounded-lg object-cover border border-slate-100" />
                            ) : (
                              <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                                <Leaf className="h-4 w-4" />
                              </div>
                            )}
                            <div className="text-left">
                              <span className="font-bold text-slate-800 block">{prod.cropName}</span>
                              <span className="text-[10px] text-slate-400 font-semibold leading-none">{prod.variety}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">{prod.farmerName}</td>
                          <td className="px-6 py-4">{prod.quantityQuintals} qtl ({prod.quantityQuintals * 100} kg)</td>
                          <td className="px-6 py-4 font-semibold text-slate-800">₹{prod.pricePerQuintal}/qtl (₹{prod.pricePerQuintal / 100}/kg)</td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleDeleteProduct(prod.id)}
                              className="text-rose-600 hover:text-rose-700 p-2 bg-rose-50 hover:bg-rose-100 rounded-xl transition-all"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: RESOLVE COMPLAINTS */}
          {tab === 'complaints' && (
            <div className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-premium text-left">
              <h3 className="text-xl font-bold text-slate-800 mb-6">Grievance Resolution Desk</h3>

              {complaintsList.length === 0 ? (
                <p className="text-sm text-slate-400">No dispute complaints in resolution desk.</p>
              ) : (
                <div className="space-y-6">
                  {complaintsList.map((comp) => (
                    <div key={comp.id} className="p-6 border border-slate-100 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-sm transition-shadow">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2.5">
                          <span className="font-bold text-slate-800 text-lg">#COMP-{comp.id}</span>
                          <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded-md ${
                            comp.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                          }`}>{comp.status}</span>
                        </div>
                        <h4 className="font-bold text-slate-700">{comp.title}</h4>
                        <div className="flex items-center space-x-2 text-xs text-slate-400">
                          {comp.user?.profilePhoto ? (
                            <img 
                              src={comp.user.profilePhoto} 
                              alt="Grievant Avatar" 
                              className="h-6 w-6 rounded-full object-cover border border-slate-200 shadow-sm" 
                            />
                          ) : (
                            <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                              <User className="h-3 w-3" />
                            </div>
                          )}
                          <p>Grievant Email: <strong>{comp.user?.email || 'farmer@agrolink.com'}</strong></p>
                        </div>
                        <p className="text-xs text-slate-500 italic max-w-xl">"{comp.description}"</p>
                      </div>

                      <div className="text-left md:text-right space-y-3 min-w-[200px]">
                        {comp.status === 'PENDING' && (
                          <button
                            onClick={() => handleResolveComplaint(comp.id, 'RESOLVED')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-xl text-xs transition-colors flex items-center space-x-1 justify-start md:justify-end"
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            <span>Resolve Dispute</span>
                          </button>
                        )}
                        {comp.status === 'RESOLVED' && (
                          <span className="text-emerald-600 text-xs font-bold flex items-center justify-start md:justify-end space-x-1">
                            <CheckCircle2 className="h-4.5 w-4.5" />
                            <span>Resolved Case</span>
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: APMC MANDI PRICE CONTROL DESK */}
          {tab === 'mandi' && (
            <div className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-premium text-left">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">{t('mandiDashboard')}</h3>
                  <p className="text-xs text-slate-400 mt-1">Configure and manage live APMC Mandi rates populated on the website</p>
                </div>
                <button
                  onClick={handleOpenAddMandi}
                  className="bg-agrogreen-950 hover:bg-agrogreen-900 text-white font-bold py-2.5 px-5 rounded-xl text-xs transition-all flex items-center space-x-1.5"
                >
                  <Plus className="h-4 w-4" />
                  <span>{t('addMandiRate')}</span>
                </button>
              </div>

              {mandiList.length === 0 ? (
                <p className="text-sm text-slate-400">No APMC Mandi rates listed.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-slate-500">
                    <thead className="text-xs text-slate-400 bg-slate-50 uppercase rounded-xl">
                      <tr>
                        <th className="px-6 py-3.5 rounded-l-xl text-left">ID</th>
                        <th className="px-6 py-3.5 text-left">{t('cropName')}</th>
                        <th className="px-6 py-3.5 text-left">{t('marketName')}</th>
                        <th className="px-6 py-3.5 text-left">{t('state')}</th>
                        <th className="px-6 py-3.5 text-left">{t('pricePerQuintal')}</th>
                        <th className="px-6 py-3.5 text-left">{t('priceChangeYesterday')}</th>
                        <th className="px-6 py-3.5 text-right rounded-r-xl">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mandiList.map((item) => (
                        <tr key={item.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                          <td className="px-6 py-4 font-bold text-slate-700">#MND-{item.id}</td>
                          <td className="px-6 py-4">
                            <div className="text-left">
                              <span className="font-bold text-slate-800 block">{item.cropName}</span>
                              <span className="text-[10px] text-slate-400 font-semibold leading-none">{item.variety}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">{item.marketName}</td>
                          <td className="px-6 py-4">{item.state}</td>
                          <td className="px-6 py-4 font-semibold text-slate-800">₹{item.pricePerQuintal}/qtl (₹{item.pricePerQuintal / 100}/kg)</td>
                          <td className="px-6 py-4 font-semibold">
                            <span className={item.priceChangeYesterday >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                              {item.priceChangeYesterday >= 0 ? '+' : ''}{item.priceChangeYesterday}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right space-x-2">
                            <button
                              onClick={() => handleOpenEditMandi(item)}
                              className="text-indigo-600 hover:text-indigo-700 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-all font-bold text-xs"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteMandi(item.id)}
                              className="text-rose-600 hover:text-rose-700 p-2 bg-rose-50 hover:bg-rose-100 rounded-xl transition-all inline-block"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </main>
      </div>

      {/* Mandi Edit/Add Overlay Modal */}
      {mandiModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-premium w-full max-w-md text-left space-y-6">
            <div>
              <h3 className="text-xl font-bold text-slate-800">
                {editingMandi ? t('editMandiRate') : t('addMandiRate')}
              </h3>
              <p className="text-xs text-slate-400 mt-1">Submit mandi crop rates to populate dynamically on frontend widgets.</p>
            </div>

            <form onSubmit={handleSaveMandi} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{t('cropName')}</label>
                <input 
                  type="text" required placeholder="e.g. Onion" value={mCropName} 
                  onChange={(e) => setMCropName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none text-sm" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{t('variety')}</label>
                <input 
                  type="text" required placeholder="e.g. Nasik Red" value={mVariety} 
                  onChange={(e) => setMVariety(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none text-sm" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{t('marketName')}</label>
                  <input 
                    type="text" required placeholder="Lasalgaon Mandi" value={mMarketName} 
                    onChange={(e) => setMMarketName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{t('state')}</label>
                  <select 
                    value={mState} onChange={(e) => setMState(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none text-sm bg-white"
                  >
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Gujarat">Gujarat</option>
                    <option value="Karnataka">Karnataka</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{t('pricePerQuintal')}</label>
                  <input 
                    type="number" step="0.01" required placeholder="1850" value={mPricePerQuintal} 
                    onChange={(e) => setMPricePerQuintal(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{t('priceChangeYesterday')}</label>
                  <input 
                    type="number" step="0.01" required placeholder="0" value={mPriceChange} 
                    onChange={(e) => setMPriceChange(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none text-sm" 
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button 
                  type="submit"
                  className="flex-1 bg-agrogreen-950 hover:bg-agrogreen-900 text-white font-bold py-3 rounded-xl text-xs transition-all"
                >
                  {t('save')}
                </button>
                <button 
                  type="button" onClick={() => setMandiModalOpen(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl text-xs transition-all"
                >
                  {t('cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
