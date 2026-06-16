import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import DashboardHeader from '../components/DashboardHeader';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import ComplaintsDesk from '../components/ComplaintsDesk';
import ProductDetailModal from '../components/ProductDetailModal';
import CheckoutFlowModal from '../components/CheckoutFlowModal';
import {
  Search, MapPin, ShoppingBag, Heart,
  CheckCircle2, ChevronRight, MessageCircle, ShoppingCart, Trash2, Eye, Package, User
} from 'lucide-react';

const getCategoryFromName = (name) => {
  const n = (name || '').toLowerCase();
  if (['tomato','potato','onion','cabbage','cauliflower','carrot','garlic','ginger','spinach','okra','brinjal','chilli','veg','lady finger'].some(v => n.includes(v))) return 'VEGETABLES';
  if (['mango','banana','apple','orange','grapes','pomegranate','papaya','watermelon','guava','lemon','fruit'].some(v => n.includes(v))) return 'FRUITS';
  return 'GRAINS';
};

const CATEGORY_CHIPS = {
  VEGETABLES: { emoji: '🥦', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100' },
  FRUITS:     { emoji: '🍊', bg: 'bg-orange-50',  text: 'text-orange-700',  border: 'border-orange-100' },
  GRAINS:     { emoji: '🌾', bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-100' },
};

export default function BuyerDashboard({ tab = 'shop' }) {
  const { t } = useLanguage();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [favorites, setFavorites] = useState([]);

  // Search & Filter
  const [cropSearch, setCropSearch] = useState('');
  const [locationSearch, setLocationSearch] = useState('');
  const [debouncedCropSearch, setDebouncedCropSearch] = useState('');
  const [debouncedLocationSearch, setDebouncedLocationSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // Cold Storage States
  const [bookings, setBookings] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [selectedFacility, setSelectedFacility] = useState('');
  const [bookingQty, setBookingQty] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [bookingMessage, setBookingMessage] = useState('');

  // Shopping Cart
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('agrolink_cart');
    return saved ? JSON.parse(saved) : [];
  });

  // Product Detail Modal
  const [detailProduct, setDetailProduct] = useState(null);

  // Checkout Flow Modal
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutProduct, setCheckoutProduct] = useState(null); // for Buy Now
  const [checkoutMode, setCheckoutMode] = useState('buynow'); // 'buynow' | 'cart'

  // Cart address (pre-fill)
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [cartMessage, setCartMessage] = useState('');

  useEffect(() => {
    localStorage.setItem('agrolink_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (tab === 'cart') {
      api.get('/auth/profile').then(r => {
        if (r.data?.address) setDeliveryAddress(r.data.address);
      }).catch(() => {});
    }
  }, [tab]);

  const handleAddToCart = (product) => {
    const existing = cart.find(i => i.id === product.id);
    if (existing) {
      const u = existing.cartUnit || 'qtl';
      const step = u === 'kg' ? 100 : 1;
      const max = u === 'kg' ? product.quantityQuintals * 100 : product.quantityQuintals;
      if (existing.cartQty + step > max) {
        alert(`Max stock: ${product.quantityQuintals} qtl.`);
        return;
      }
      setCart(cart.map(i => i.id === product.id ? { ...i, cartQty: i.cartQty + step } : i));
    } else {
      setCart([...cart, { ...product, cartQty: 1, cartUnit: 'qtl' }]);
    }
    window.dispatchEvent(new CustomEvent('agrolink-toast', {
      detail: { title: 'Added to Cart', message: `${product.cropName} added to cart.`, category: 'MARKETPLACE', timestamp: new Date() }
    }));
  };

  const handleCartQtyChange = (id, val, max, unit) => {
    const q = parseFloat(val);
    const lim = unit === 'kg' ? max * 100 : max;
    if (isNaN(q) || q <= 0 || q > lim) return;
    setCart(cart.map(i => i.id === id ? { ...i, cartQty: q } : i));
  };

  const handleCartUnitChange = (id, newUnit) => {
    setCart(cart.map(item => {
      if (item.id !== id) return item;
      const old = item.cartUnit || 'qtl';
      if (old === newUnit) return item;
      let q = parseFloat(item.cartQty) || 0;
      q = newUnit === 'kg' ? Math.round(q * 100) : parseFloat((q / 100).toFixed(2));
      return { ...item, cartUnit: newUnit, cartQty: q };
    }));
  };

  const handleRemoveFromCart = (id) => setCart(cart.filter(i => i.id !== id));

  const handleBuyNow = (product) => {
    setCheckoutProduct(product);
    setCheckoutMode('buynow');
    setCheckoutOpen(true);
  };

  const handleCartCheckout = () => {
    if (cart.length === 0) return;
    setCheckoutMode('cart');
    setCheckoutProduct(null);
    setCheckoutOpen(true);
  };

  const handleToggleFavorite = (product) => {
    const isFav = favorites.some(f => f.id === product.id);
    setFavorites(isFav ? favorites.filter(f => f.id !== product.id) : [...favorites, product]);
  };

  const handleConfirmDelivery = async (orderId) => {
    try {
      await api.put(`/orders/${orderId}/status?status=DELIVERED`);
      fetchBuyerData();
    } catch { alert('Verification failed!'); }
  };

  // Debounce
  useEffect(() => {
    const h = setTimeout(() => setDebouncedCropSearch(cropSearch), 400);
    return () => clearTimeout(h);
  }, [cropSearch]);

  useEffect(() => {
    const h = setTimeout(() => setDebouncedLocationSearch(locationSearch), 400);
    return () => clearTimeout(h);
  }, [locationSearch]);

  const fetchBuyerData = async () => {
    try {
      const prodRes = await api.get(`/public/products?crop=${encodeURIComponent(debouncedCropSearch)}&location=${encodeURIComponent(debouncedLocationSearch)}`);
      setProducts(prodRes.data);
      const ordRes = await api.get('/buyer/orders');
      setOrders(ordRes.data);
      if (tab === 'cold-storage') {
        const bookRes = await api.get('/buyer/cold-storage/bookings');
        setBookings(bookRes.data);
        const facRes = await api.get('/public/cold-storage');
        setFacilities(facRes.data);
      }
    } catch (e) {
      console.error('Error loading buyer data', e);
    }
  };

  useEffect(() => {
    fetchBuyerData();
    const handler = (e) => {
      if (['ORDER','MARKETPLACE','COLD_STORAGE'].includes(e.detail?.category)) fetchBuyerData();
    };
    window.addEventListener('agrolink-alert', handler);
    return () => window.removeEventListener('agrolink-alert', handler);
  }, [tab, debouncedCropSearch, debouncedLocationSearch]);

  const handleBookStorageSubmit = async (e) => {
    e.preventDefault();
    setBookingMessage('');
    try {
      await api.post('/buyer/cold-storage/bookings', {
        coldStorageId: parseInt(selectedFacility),
        quantityTons: parseFloat(bookingQty),
        startDate,
        endDate
      });
      setBookingMessage('Reservation submitted!');
      setSelectedFacility(''); setBookingQty(''); setStartDate(''); setEndDate('');
      fetchBuyerData();
    } catch (err) {
      setBookingMessage('Failed: ' + (err.response?.data || err.message));
    }
  };

  const filteredProducts = products.filter(p => {
    if (selectedCategory !== 'ALL' && getCategoryFromName(p.cropName) !== selectedCategory) return false;
    if (minPrice && p.pricePerQuintal < parseFloat(minPrice)) return false;
    if (maxPrice && p.pricePerQuintal > parseFloat(maxPrice)) return false;
    return true;
  });

  const cartTotal = cart.reduce((s, i) => {
    const r = i.cartUnit === 'kg' ? i.pricePerQuintal / 100 : i.pricePerQuintal;
    return s + r * i.cartQty;
  }, 0);

  return (
    <div className="flex bg-[#fafbfc] min-h-screen font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-y-auto">
        <DashboardHeader title={
          tab === 'shop'         ? t('produceMarketplace') :
          tab === 'orders'       ? t('purchasedOrders') :
          tab === 'cart'         ? t('shoppingCart') :
          tab === 'favorites'    ? t('favoritesListings') :
          tab === 'cold-storage' ? t('reserveColdStorage') :
          t('complaintsDesk')
        } />

        <main className="p-6 max-w-7xl w-full mx-auto space-y-6">

          {/* ══════════════════ TAB: SHOP ══════════════════ */}
          {tab === 'shop' && (
            <div className="space-y-5">

              {/* Search & Filters */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                    <input
                      type="text" placeholder="Search crops..." value={cropSearch}
                      onChange={e => setCropSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm bg-slate-50/60 placeholder:text-slate-300 transition-all"
                    />
                  </div>
                  <div className="relative flex-1">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                    <input
                      type="text" placeholder="Filter by location..." value={locationSearch}
                      onChange={e => setLocationSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm bg-slate-50/60 placeholder:text-slate-300 transition-all"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 items-center pt-1 border-t border-slate-50">
                  {/* Category pills */}
                  {['ALL','VEGETABLES','FRUITS','GRAINS'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3.5 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider transition-all border ${
                        selectedCategory === cat
                          ? 'bg-[#0a2d1e] text-white border-transparent shadow-sm'
                          : 'bg-slate-50 text-slate-500 border-slate-100 hover:border-slate-200 hover:text-slate-700'
                      }`}
                    >
                      {cat === 'ALL' ? 'All' : `${CATEGORY_CHIPS[cat].emoji} ${cat.charAt(0) + cat.slice(1).toLowerCase()}`}
                    </button>
                  ))}
                  <div className="flex items-center space-x-2 ml-auto">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider whitespace-nowrap">Price ₹:</span>
                    <input type="number" placeholder="Min" value={minPrice} onChange={e => setMinPrice(e.target.value)}
                      className="w-20 px-2.5 py-1.5 rounded-lg border border-slate-100 text-xs bg-slate-50/60 focus:outline-none" />
                    <span className="text-slate-300 text-xs">—</span>
                    <input type="number" placeholder="Max" value={maxPrice} onChange={e => setMaxPrice(e.target.value)}
                      className="w-20 px-2.5 py-1.5 rounded-lg border border-slate-100 text-xs bg-slate-50/60 focus:outline-none" />
                    {(minPrice || maxPrice) && (
                      <button onClick={() => { setMinPrice(''); setMaxPrice(''); }} className="text-[10px] font-black text-rose-400 hover:text-rose-600">Reset</button>
                    )}
                  </div>
                </div>
              </div>

              {/* Results count */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">{filteredProducts.length} listings available</span>
                {cart.length > 0 && (
                  <button
                    onClick={handleCartCheckout}
                    className="flex items-center space-x-2 bg-[#0a2d1e] hover:bg-[#0d3825] text-white px-4 py-2 rounded-xl text-xs font-black transition-all shadow-md shadow-emerald-900/15"
                  >
                    <ShoppingCart className="h-3.5 w-3.5" />
                    <span>Cart ({cart.length}) · ₹{cartTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                  </button>
                )}
              </div>

              {/* Product Grid - Small Cards (4 columns) */}
              {filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 space-y-3 text-slate-300">
                  <ShoppingBag className="h-12 w-12 stroke-[1.5]" />
                  <p className="text-sm font-medium">No produce matches your filters.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {filteredProducts.map(product => {
                    const isFav = favorites.some(f => f.id === product.id);
                    const cat = getCategoryFromName(product.cropName);
                    const chip = CATEGORY_CHIPS[cat];
                    const isInCart = cart.some(i => i.id === product.id);

                    return (
                      <div
                        key={product.id}
                        className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group shimmer-hover relative"
                      >
                        {/* Image */}
                        <div
                          className="relative aspect-[4/3] bg-slate-50 overflow-hidden cursor-pointer"
                          onClick={() => setDetailProduct(product)}
                        >
                          {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.cropName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-200">
                              <ShoppingBag className="h-8 w-8 stroke-[1.5]" />
                            </div>
                          )}

                          {/* Category chip */}
                          <span className={`absolute top-2 left-2 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${chip.bg} ${chip.text} ${chip.border}`}>
                            {chip.emoji} {cat.charAt(0) + cat.slice(1).toLowerCase()}
                          </span>

                          {/* Fav button */}
                          <button
                            onClick={e => { e.stopPropagation(); handleToggleFavorite(product); }}
                            className={`absolute top-2 right-2 h-6 w-6 flex items-center justify-center rounded-full shadow-sm transition-all ${
                              isFav ? 'bg-rose-500 text-white' : 'bg-white/80 text-slate-300 hover:text-rose-400 backdrop-blur-sm'
                            }`}
                          >
                            <Heart className="h-3 w-3 fill-current" />
                          </button>

                          {/* In-cart indicator */}
                          {isInCart && (
                            <span className="absolute bottom-2 left-2 bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full">
                              In Cart
                            </span>
                          )}

                          {/* View details hover overlay */}
                          <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/20 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <span className="bg-white/95 text-slate-800 text-[10px] font-black px-3 py-1.5 rounded-full flex items-center space-x-1 shadow-sm">
                              <Eye className="h-3 w-3" />
                              <span>View Details</span>
                            </span>
                          </div>
                        </div>

                        {/* Card body */}
                        <div className="p-3 flex flex-col flex-1 space-y-2">
                          <div>
                            <h4 className="font-extrabold text-slate-800 text-sm leading-tight truncate">{product.cropName}</h4>
                            <span className="text-[10px] text-slate-400 font-semibold truncate block">{product.variety}</span>
                          </div>

                          <div className="flex items-end justify-between">
                            <div>
                              <span className="block text-base font-black text-slate-800 leading-none">₹{product.pricePerQuintal.toLocaleString('en-IN')}</span>
                              <span className="text-[10px] text-slate-400 font-medium">per qtl</span>
                            </div>
                            <div className="text-right">
                              <span className="block text-xs font-bold text-slate-500">{product.quantityQuintals} qtl</span>
                              <span className="text-[10px] text-slate-400">stock</span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="grid grid-cols-2 gap-1.5 pt-1">
                            <button
                              onClick={() => handleAddToCart(product)}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 rounded-lg text-[10px] transition-colors flex items-center justify-center space-x-1"
                            >
                              <ShoppingCart className="h-3 w-3" />
                              <span>Cart</span>
                            </button>
                            <button
                              onClick={() => handleBuyNow(product)}
                              className="bg-[#0a2d1e] hover:bg-[#0d3825] text-white font-bold py-2 rounded-lg text-[10px] transition-colors"
                            >
                              Buy Now
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ══════════════════ TAB: ORDERS ══════════════════ */}
          {tab === 'orders' && (
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm text-left">
              <h3 className="text-lg font-black text-slate-800 mb-6 tracking-tight">Purchase History</h3>
              {orders.length === 0 ? (
                <div className="py-12 text-center">
                  <Package className="h-10 w-10 mx-auto text-slate-200 mb-3 stroke-[1.5]" />
                  <p className="text-sm text-slate-400">No orders placed yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map(order => (
                    <div key={order.id} className="p-5 border border-slate-100 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-5 hover:shadow-sm transition-all">
                      <div className="space-y-1.5">
                        <div className="flex items-center space-x-2">
                          <span className="font-black text-slate-800">#AGR-{order.id}</span>
                          <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded-lg ${
                            order.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-600' :
                            order.status === 'PENDING'   ? 'bg-amber-50 text-amber-600' :
                                                           'bg-blue-50 text-blue-600'
                          }`}>{order.status}</span>
                        </div>
                        <h4 className="font-bold text-slate-700 text-sm">{order.cropName} ({order.variety})</h4>
                        <div className="flex items-center space-x-2 text-xs text-slate-400 py-1">
                          {order.farmerProfilePhoto ? (
                            <img 
                              src={order.farmerProfilePhoto} 
                              alt="Farmer Avatar" 
                              className="h-6 w-6 rounded-full object-cover border border-slate-200 shadow-sm" 
                            />
                          ) : (
                            <div className="h-6 w-6 rounded-full bg-slate-50 border border-slate-150 flex items-center justify-center text-slate-400">
                              <User className="h-3 w-3" />
                            </div>
                          )}
                          <span>Farmer: <strong>{order.farmerName}</strong> ({order.farmerPhone})</span>
                        </div>
                        <p className="text-xs text-slate-400">Volume: {order.quantityQuintals} qtl · Price: ₹{order.pricePerQuintal}/qtl</p>
                        {order.estimatedDeliveryDate && (
                          <div className="inline-flex items-center space-x-1.5 bg-emerald-50/50 border border-emerald-100 text-emerald-850 px-2.5 py-1 rounded-xl text-[10px] font-black mt-2">
                            <span>📅 Est. Delivery: {new Date(order.estimatedDeliveryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          </div>
                        )}

                        {order.status === 'SHIPPED' && (
                          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 mt-2 max-w-md">
                            <div className="flex justify-between text-[9px] font-black uppercase tracking-wider text-slate-400 mb-2">
                              <span>Origin</span>
                              <span className="text-blue-500 animate-pulse">In Transit</span>
                              <span>Destination</span>
                            </div>
                            <div className="relative h-5 flex items-center">
                              <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-1 bg-blue-500 rounded-full" style={{ width: '62%' }} />
                              </div>
                              <div className="absolute left-[62%] -translate-x-1/2 -top-0.5">
                                <span className="h-5 w-5 flex items-center justify-center rounded-full bg-blue-600 text-white text-[10px] animate-bounce shadow-sm">🚚</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="min-w-[160px] space-y-2.5">
                        <div>
                          <span className="block text-[10px] text-slate-400 font-black uppercase tracking-wider">Total Paid</span>
                          <span className="block text-lg font-black text-slate-800">₹{order.totalPrice.toLocaleString('en-IN')}</span>
                        </div>
                        {order.status === 'SHIPPED' && (
                          <span className="text-xs text-blue-600 font-bold block">🚚 Dispatch In Transit</span>
                        )}
                        {order.status === 'PENDING'   && <span className="text-xs text-slate-400 italic">Awaiting farmer approval...</span>}
                        {order.status === 'APPROVED'  && <span className="text-xs text-slate-400 italic">Awaiting shipment...</span>}
                        {order.status === 'DELIVERED' && (
                          <div className="text-emerald-600 text-xs font-bold flex items-center space-x-1.5">
                            <CheckCircle2 className="h-3.5 w-3.5" /><span>Completed</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ══════════════════ TAB: FAVORITES ══════════════════ */}
          {tab === 'favorites' && (
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm text-left">
              <h3 className="text-lg font-black text-slate-800 mb-5 tracking-tight">Saved Favorites</h3>
              {favorites.length === 0 ? (
                <div className="py-12 text-center">
                  <Heart className="h-10 w-10 mx-auto text-slate-200 mb-3" />
                  <p className="text-sm text-slate-400">No favorites saved yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {favorites.map(product => (
                    <div key={product.id} className="p-4 border border-slate-100 rounded-2xl flex items-center justify-between hover:shadow-sm transition-all">
                      <div className="min-w-0 space-y-0.5">
                        <h4 className="font-extrabold text-slate-800 text-sm truncate">{product.cropName}</h4>
                        <span className="text-[10px] text-slate-400 font-semibold block">{product.variety} · {product.location}</span>
                        <span className="text-sm font-black text-slate-800">₹{product.pricePerQuintal.toLocaleString('en-IN')}/qtl</span>
                      </div>
                      <div className="flex flex-col space-y-1.5 ml-4 shrink-0">
                        <button onClick={() => setDetailProduct(product)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-1.5 px-3 rounded-xl text-[10px] transition-colors flex items-center space-x-1">
                          <Eye className="h-3 w-3" /><span>View</span>
                        </button>
                        <button onClick={() => handleBuyNow(product)} className="bg-[#0a2d1e] hover:bg-[#0d3825] text-white font-bold py-1.5 px-3 rounded-xl text-[10px] transition-colors">
                          Buy Now
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ══════════════════ TAB: CART ══════════════════ */}
          {tab === 'cart' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-left">

              {/* Cart Items */}
              <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-black text-slate-800 tracking-tight">{t('shoppingCart')}</h3>
                  <span className="text-xs bg-emerald-50 text-emerald-700 font-black px-3 py-1.5 rounded-full border border-emerald-100">
                    {cart.length} items
                  </span>
                </div>

                {cart.length === 0 ? (
                  <div className="py-12 text-center space-y-3">
                    <ShoppingCart className="h-12 w-12 mx-auto text-slate-200 stroke-[1.5]" />
                    <p className="text-sm text-slate-400">Your cart is empty. Browse the marketplace.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cart.map(item => {
                      const u = item.cartUnit || 'qtl';
                      const rate = u === 'kg' ? item.pricePerQuintal / 100 : item.pricePerQuintal;
                      const total = rate * item.cartQty;
                      return (
                        <div key={item.id} className="p-4 border border-slate-100 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors">
                          <div className="space-y-0.5 min-w-0">
                            <h4 className="font-extrabold text-slate-800 text-sm">{item.cropName}</h4>
                            <span className="text-[10px] text-slate-400 font-bold uppercase block">{item.variety}</span>
                            <span className="text-xs text-slate-500">{item.farmerName} · {item.location}</span>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 sm:gap-4 justify-between sm:justify-end">
                            <div>
                              <span className="block text-[9px] text-slate-400 font-black uppercase tracking-wider">Rate</span>
                              <span className="text-xs font-extrabold text-slate-800">₹{rate.toLocaleString('en-IN', { maximumFractionDigits: 2 })}/{u}</span>
                            </div>
                            <div className="flex items-center space-x-1.5">
                              <div>
                                <span className="block text-[9px] text-slate-400 font-black uppercase tracking-wider mb-0.5">Qty</span>
                                <input
                                  type="number"
                                  step={u === 'kg' ? '1' : '0.1'}
                                  min={u === 'kg' ? '1' : '0.1'}
                                  max={u === 'kg' ? item.quantityQuintals * 100 : item.quantityQuintals}
                                  value={item.cartQty}
                                  onChange={e => handleCartQtyChange(item.id, e.target.value, item.quantityQuintals, u)}
                                  className="w-16 px-2 py-1.5 rounded-lg border border-slate-200 text-xs font-bold focus:outline-none"
                                />
                              </div>
                              <div>
                                <span className="block text-[9px] text-slate-400 font-black uppercase tracking-wider mb-0.5">Unit</span>
                                <select
                                  value={u}
                                  onChange={e => handleCartUnitChange(item.id, e.target.value)}
                                  className="px-2 py-1.5 rounded-lg border border-slate-200 text-xs font-bold bg-white focus:outline-none"
                                >
                                  <option value="qtl">qtl</option>
                                  <option value="kg">kg</option>
                                </select>
                              </div>
                            </div>
                            <div className="text-right min-w-[70px]">
                              <span className="block text-[9px] text-slate-400 font-black uppercase tracking-wider">Total</span>
                              <span className="text-sm font-black text-emerald-700">₹{total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                            </div>
                            <button onClick={() => handleRemoveFromCart(item.id)} className="bg-rose-50 hover:bg-rose-100 text-rose-500 p-2 rounded-lg transition-colors">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Checkout Summary Panel */}
              <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-5">
                <h3 className="text-base font-black text-slate-800 tracking-tight">Order Summary</h3>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-slate-500 font-medium">
                    <span>Subtotal</span>
                    <span className="font-bold text-slate-800">₹{cartTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-slate-500 font-medium">
                    <span>Logistics</span>
                    <span className="font-bold text-emerald-600">FREE</span>
                  </div>
                  <div className="border-t border-slate-100 pt-2 flex justify-between font-black text-slate-800">
                    <span>Total</span>
                    <span className="text-emerald-700">₹{cartTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                  </div>
                </div>

                <button
                  onClick={handleCartCheckout}
                  disabled={cart.length === 0}
                  className="w-full bg-[#0a2d1e] hover:bg-[#0d3825] text-white font-black py-4 rounded-xl text-sm transition-all flex items-center justify-center space-x-2 shadow-md shadow-emerald-900/20 disabled:opacity-50"
                >
                  <ChevronRight className="h-4 w-4" />
                  <span>Proceed to Checkout</span>
                </button>

                <p className="text-[10px] text-slate-400 text-center font-medium">Razorpay & Cash on Delivery available</p>
              </div>
            </div>
          )}

          {/* ══════════════════ TAB: COLD STORAGE ══════════════════ */}
          {tab === 'cold-storage' && (
            <div className="space-y-6">

              <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm text-left max-w-2xl">
                <h3 className="text-lg font-black text-slate-800 mb-5 tracking-tight">Reserve Cold Storage</h3>

                {bookingMessage && (
                  <div className="bg-indigo-50 border border-indigo-100 text-indigo-700 p-4 rounded-xl text-sm font-semibold mb-5">
                    {bookingMessage}
                  </div>
                )}

                <form onSubmit={handleBookStorageSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Storage Facility</label>
                    <select required value={selectedFacility} onChange={e => setSelectedFacility(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none text-sm">
                      <option value="">-- Choose Facility --</option>
                      {facilities.map(f => {
                        const isFull = f.availableCapacityTons <= 0;
                        return (
                          <option key={f.id} value={f.id} disabled={isFull}>
                            {f.name} - {f.location} {isFull ? '(No Space - Check for another)' : `(₹${f.pricePerTonDay}/ton/day, Avail: ${f.availableCapacityTons}t)`}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Capacity (Tons)</label>
                    <input type="number" required placeholder="e.g. 10" value={bookingQty} onChange={e => setBookingQty(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Start Date</label>
                      <input type="date" required value={startDate} onChange={e => setStartDate(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none text-sm text-slate-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">End Date</label>
                      <input type="date" required value={endDate} onChange={e => setEndDate(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none text-sm text-slate-500" />
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-indigo-900 hover:bg-indigo-800 text-white py-3.5 rounded-xl font-black text-sm transition-all shadow-sm">
                    Submit Booking Request
                  </button>
                </form>
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm text-left">
                <h3 className="text-lg font-black text-slate-800 mb-5 tracking-tight">Your Bookings</h3>
                {bookings.length === 0 ? (
                  <p className="text-sm text-slate-400">No bookings yet.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {bookings.map(b => (
                      <div key={b.id} className="p-5 border border-slate-100 rounded-2xl space-y-3 hover:shadow-sm transition-shadow">
                        <div className="flex justify-between items-center">
                          <span className="font-black text-sm text-slate-800">{b.storageName}</span>
                          <span className={`px-2.5 py-1 text-[9px] font-black rounded-lg ${
                            b.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600' :
                            b.status === 'PENDING'  ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                          }`}>{b.status}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-semibold uppercase block">{b.storageLocation}</span>
                        <div className="grid grid-cols-2 gap-3 text-xs text-slate-500 border-y border-slate-50 py-3">
                          <div>
                            <span className="block text-[9px] font-black uppercase tracking-wider text-slate-400">Duration</span>
                            <span className="font-bold">{b.startDate} → {b.endDate}</span>
                          </div>
                          <div>
                            <span className="block text-[9px] font-black uppercase tracking-wider text-slate-400">Capacity</span>
                            <span className="font-bold">{b.quantityTons} Tons</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-400 font-medium">Booking Fee</span>
                          <span className="font-black text-slate-800">₹{b.totalPrice.toLocaleString('en-IN')}</span>
                        </div>
                        {b.status === 'REJECTED' && b.rejectionReason && (
                          <div className="bg-rose-50 border border-rose-100/50 p-3 rounded-2xl text-[11px] text-rose-700 font-medium text-left mt-2">
                            <strong>Reason:</strong> {b.rejectionReason}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: COMPLAINTS */}
          {tab === 'complaints' && (
            <ComplaintsDesk />
          )}

        </main>
      </div>

      {/* Product Detail Modal */}
      {detailProduct && (
        <ProductDetailModal
          product={detailProduct}
          allProducts={products}
          onClose={() => setDetailProduct(null)}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
          favorites={favorites}
          onToggleFavorite={handleToggleFavorite}
          onSelectProduct={setDetailProduct}
        />
      )}

      {/* Unified Checkout Flow Modal */}
      <CheckoutFlowModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        product={checkoutProduct}
        cart={cart}
        mode={checkoutMode}
        onSuccess={() => {
          if (checkoutMode === 'cart') {
            setCart([]);
            localStorage.removeItem('agrolink_cart');
          }
          fetchBuyerData();
        }}
      />
    </div>
  );
}
