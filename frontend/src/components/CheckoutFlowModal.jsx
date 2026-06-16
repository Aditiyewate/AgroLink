import React, { useState, useEffect } from 'react';
import {
  X, MapPin, CreditCard, Truck, CheckCircle2,
  ChevronRight, Package, Banknote, Shield, ArrowLeft,
  User, Phone, AlertCircle
} from 'lucide-react';
import api from '../services/api';

/* ─── STEP INDICATOR ──────────────────────────────────────────────── */
function StepBadge({ num, label, active, done }) {
  return (
    <div className="flex flex-col items-center space-y-1.5">
      <div className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-black transition-all duration-500 ${
        done  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200' :
        active ? 'bg-[#0a2d1e] text-white shadow-md shadow-slate-300/40' :
                 'bg-slate-100 text-slate-400'
      }`}>
        {done ? <CheckCircle2 className="h-4.5 w-4.5" /> : num}
      </div>
      <span className={`text-[10px] font-bold uppercase tracking-wider ${active || done ? 'text-slate-700' : 'text-slate-400'}`}>{label}</span>
    </div>
  );
}

/* ─── TRUCK SUCCESS ANIMATION ─────────────────────────────────────── */
function TruckSuccessScreen({ onDone, paymentMethod }) {
  const [phase, setPhase] = useState('driving'); // driving → arrived → done

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('arrived'), 3500);
    const t2 = setTimeout(() => { setPhase('done'); onDone(); }, 5500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  return (
    <div className="fixed inset-0 z-[400] flex flex-col items-center justify-center bg-gradient-to-b from-[#f0fdf4] to-[#ecfdf5] overflow-hidden">
      
      {/* Sky background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-8 left-1/4 h-20 w-32 bg-white/60 rounded-full blur-2xl" />
        <div className="absolute top-12 right-1/3 h-16 w-24 bg-white/50 rounded-full blur-2xl" />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center space-y-8 px-8 text-center">
        {phase === 'driving' && (
          <div className="animate-step-enter">
            <h2 className="text-2xl font-black text-[#0a2d1e] mb-2">Order Placed! 🎉</h2>
            <p className="text-slate-500 text-sm font-medium">Your delivery is on the way...</p>
          </div>
        )}
        {phase === 'arrived' && (
          <div className="animate-step-enter">
            <div className="h-20 w-20 rounded-full bg-emerald-500 flex items-center justify-center mx-auto mb-4 animate-check-pop shadow-xl shadow-emerald-200">
              <CheckCircle2 className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl font-black text-[#0a2d1e] mb-2">
              {paymentMethod === 'COD' ? 'Order Confirmed!' : 'Payment Successful!'}
            </h2>
            <p className="text-slate-600 text-sm font-medium max-w-xs">
              {paymentMethod === 'COD'
                ? 'Your order has been placed. Pay cash on delivery.'
                : 'Escrow funds secured. Farmer will be notified shortly.'}
            </p>
          </div>
        )}
      </div>

      {/* Road */}
      <div className="absolute bottom-0 left-0 right-0">
        {/* Road surface */}
        <div className="h-20 bg-slate-700 relative overflow-hidden">
          {/* Center dashed line */}
          <div
            className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1.5 animate-road"
            style={{
              backgroundImage: 'repeating-linear-gradient(90deg, #f1f5f9 0px, #f1f5f9 30px, transparent 30px, transparent 60px)',
            }}
          />
        </div>
        {/* Ground */}
        <div className="h-4 bg-emerald-800" />
      </div>

      {/* Truck */}
      {phase === 'driving' && (
        <div className="absolute bottom-16 left-0 animate-truck">
          <div className="text-7xl select-none">🚛</div>
        </div>
      )}
      {phase === 'arrived' && (
        <div className="absolute bottom-16 right-16 transition-all duration-500">
          <div className="text-5xl select-none">🚛</div>
        </div>
      )}
    </div>
  );
}

/* ─── MAIN COMPONENT ──────────────────────────────────────────────── */
export default function CheckoutFlowModal({
  isOpen,
  onClose,
  product,       // for Buy Now (single product)
  cart,          // for cart checkout
  mode,          // 'buynow' | 'cart'
  onSuccess,     // callback after successful order
}) {
  const [step, setStep] = useState(1); // 1=product, 2=address, 3=payment
  const [qty, setQty] = useState('1');
  const [unit, setUnit] = useState('qtl');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showTruck, setShowTruck] = useState(false);

  // Razorpay mock state variables
  const [showRazorpayMockModal, setShowRazorpayMockModal] = useState(false);
  const [razorpayMockData, setRazorpayMockData] = useState(null);
  const [mockSelectedMethod, setMockSelectedMethod] = useState('upi');
  const [mockUpiId, setMockUpiId] = useState('buyer@oksbi');
  const [mockCardNum, setMockCardNum] = useState('4321 8876 5432 1098');
  const [mockCardExpiry, setMockCardExpiry] = useState('12/29');
  const [mockCardCvv, setMockCardCvv] = useState('123');
  const [mockBank, setMockBank] = useState('SBI');
  const [mockPaymentState, setMockPaymentState] = useState('form');
  const [mockOtp, setMockOtp] = useState('');

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setQty('1');
      setUnit('qtl');
      setError('');
      setPaymentMethod('razorpay');
      setShowTruck(false);
      setShowRazorpayMockModal(false);
      setRazorpayMockData(null);
      setMockPaymentState('form');
      setMockOtp('');
      // Pre-load address
      api.get('/auth/profile').then(r => {
        if (r.data?.address) setAddress(r.data.address);
      }).catch(() => {});
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;
  if (showTruck) return <TruckSuccessScreen paymentMethod={paymentMethod} onDone={() => { setShowTruck(false); onClose(); onSuccess(); }} />;

  /* ── Computed totals ── */
  const getTotal = () => {
    if (mode === 'buynow' && product) {
      const qtyVal = parseFloat(qty) || 0;
      const inQtl = unit === 'kg' ? qtyVal / 100 : qtyVal;
      return inQtl * product.pricePerQuintal;
    }
    if (mode === 'cart' && cart) {
      return cart.reduce((s, item) => {
        const r = item.cartUnit === 'kg' ? item.pricePerQuintal / 100 : item.pricePerQuintal;
        return s + r * item.cartQty;
      }, 0);
    }
    return 0;
  };

  const total = getTotal();
  const maxQty = product ? (unit === 'kg' ? product.quantityQuintals * 100 : product.quantityQuintals) : 0;

  /* ── Validation ── */
  const validateStep1 = () => {
    if (mode === 'buynow') {
      const q = parseFloat(qty);
      if (!q || q <= 0 || q > maxQty) {
        setError(`Please enter a valid quantity (1 – ${maxQty} ${unit}).`);
        return false;
      }
    }
    setError('');
    return true;
  };

  const validateStep2 = () => {
    if (!address.trim() || address.trim().length < 10) {
      setError('Please provide a complete delivery address (at least 10 characters).');
      return false;
    }
    setError('');
    return true;
  };

  /* ── Load Razorpay ── */
  const loadRazorpay = () => new Promise(resolve => {
    if (window.Razorpay) { resolve(true); return; }
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });

  /* ── Place order via Razorpay ── */
  const placeWithRazorpay = async () => {
    setLoading(true);
    setError('');
    try {
      const loaded = await loadRazorpay();
      if (!loaded) throw new Error('Failed to load Razorpay SDK.');

      const res = await api.post(`/buyer/payment/create-order?amount=${total}`);
      const { orderId, amount: oAmt, currency, keyId } = res.data;

      const options = {
        key: keyId,
        amount: oAmt,
        currency,
        name: 'AgroLink',
        description: 'Fresh Produce Purchase',
        order_id: orderId,
        handler: async (response) => {
          await submitOrder({
            razorpayPaymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id,
            razorpaySignature: response.razorpay_signature,
          });
        },
        theme: { color: '#0a2d1e' },
        modal: {
          ondismiss: () => { setLoading(false); setError('Payment cancelled.'); }
        }
      };
      new window.Razorpay(options).open();
    } catch (err) {
      setError(err.response?.data || err.message || 'Payment failed.');
      setLoading(false);
    }
  };

  /* ── Place order via COD ── */
  const placeWithCOD = async () => {
    setLoading(true);
    setError('');
    try {
      await submitOrder({ paymentMethod: 'COD' });
    } catch (err) {
      setError(err.response?.data || err.message || 'Order placement failed.');
      setLoading(false);
    }
  };

  /* ── Core submit ── */
  const submitOrder = async (paymentDetails) => {
    // Save address to profile
    try {
      const profileRes = await api.get('/auth/profile');
      await api.put('/auth/profile', { ...profileRes.data, address });
    } catch (_) {}

    if (mode === 'buynow' && product) {
      const qtyInQtl = unit === 'kg' ? parseFloat(qty) / 100 : parseFloat(qty);
      const payload = {
        ...paymentDetails,
        orderDTO: { productId: product.id, quantityQuintals: qtyInQtl }
      };
      await api.post('/buyer/payment/verify', payload);
    } else if (mode === 'cart' && cart) {
      const payload = {
        ...paymentDetails,
        orders: cart.map(item => ({
          productId: item.id,
          quantityQuintals: item.cartUnit === 'kg' ? item.cartQty / 100 : item.cartQty,
        }))
      };
      await api.post('/buyer/payment/verify', payload);
    }

    setLoading(false);
    setShowTruck(true);
  };

  const handleMockPaySubmit = (e) => {
    e.preventDefault();
    setMockPaymentState('loading');
    setTimeout(() => {
      setMockPaymentState('otp');
    }, 1200);
  };

  const handleMockOtpSubmit = async (e) => {
    e.preventDefault();
    setMockPaymentState('loading');
    setTimeout(async () => {
      try {
        setMockPaymentState('success');
        setTimeout(async () => {
          await submitOrder({
            razorpayPaymentId: 'pay_mock_' + Math.random().toString(36).substr(2, 9),
            razorpayOrderId: razorpayMockData.orderId,
            razorpaySignature: 'sig_mock_verified',
          });
          setShowRazorpayMockModal(false);
        }, 1200);
      } catch (err) {
        setError(err.response?.data || err.message || 'Payment submission failed.');
        setShowRazorpayMockModal(false);
      }
    }, 1200);
  };

  /* ── Handle Next ── */
  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep(s => s + 1);
  };

  /* ── Render ── */
  return (
    <div className="fixed inset-0 z-[300] bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-[28px] w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 bg-white shrink-0">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-black text-slate-800 tracking-tight">Checkout</h3>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Step indicator */}
          <div className="flex items-center">
            <StepBadge num="1" label="Product" active={step === 1} done={step > 1} />
            <div className={`flex-1 h-0.5 mx-2 rounded-full transition-all duration-500 ${step > 1 ? 'bg-emerald-400' : 'bg-slate-100'}`} />
            <StepBadge num="2" label="Address" active={step === 2} done={step > 2} />
            <div className={`flex-1 h-0.5 mx-2 rounded-full transition-all duration-500 ${step > 2 ? 'bg-emerald-400' : 'bg-slate-100'}`} />
            <StepBadge num="3" label="Payment" active={step === 3} done={false} />
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-8 py-6">

          {/* Error banner */}
          {error && (
            <div className="flex items-start space-x-2 bg-rose-50 border border-rose-100 text-rose-600 p-3.5 rounded-2xl text-xs font-semibold mb-4">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* ═══ STEP 1: PRODUCT & QTY ═══ */}
          {step === 1 && (
            <div className="space-y-5 animate-step-enter">
              {mode === 'buynow' && product && (
                <>
                  {/* Product summary */}
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 flex space-x-4">
                    <div className="h-16 w-16 rounded-2xl overflow-hidden bg-white border border-slate-100 shrink-0 flex items-center justify-center">
                      {product.imageUrl
                        ? <img src={product.imageUrl} alt={product.cropName} className="h-full w-full object-cover" />
                        : <Package className="h-7 w-7 text-slate-300" />
                      }
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-black text-slate-800 text-base">{product.cropName}</h4>
                      <p className="text-xs text-slate-400 font-medium">{product.variety}</p>
                      <p className="text-sm font-extrabold text-emerald-700 mt-1">₹{product.pricePerQuintal}/qtl · ₹{(product.pricePerQuintal/100).toFixed(2)}/kg</p>
                    </div>
                  </div>

                  {/* Quantity + Unit toggle */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Quantity</label>
                      <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200/40">
                        {['qtl', 'kg'].map(u => (
                          <button
                            key={u}
                            type="button"
                            onClick={() => {
                              if (unit === u) return;
                              const q = parseFloat(qty) || 0;
                              setQty(u === 'kg' ? Math.round(q * 100).toString() : (q / 100).toFixed(2));
                              setUnit(u);
                            }}
                            className={`px-4 py-1.5 rounded-lg text-[11px] font-black uppercase transition-all ${
                              unit === u ? 'bg-[#0a2d1e] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                            }`}
                          >
                            {u}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        min={unit === 'kg' ? '1' : '0.1'}
                        max={maxQty}
                        step={unit === 'kg' ? '1' : '0.1'}
                        value={qty}
                        onChange={e => setQty(e.target.value)}
                        className="w-full pl-4 pr-16 py-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-sm font-bold text-slate-800"
                        placeholder={`Max: ${maxQty} ${unit}`}
                      />
                      <span className="absolute inset-y-0 right-4 flex items-center text-xs font-black text-slate-400 uppercase">{unit}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium">Available: {product.quantityQuintals} qtl ({product.quantityQuintals * 100} kg)</p>
                  </div>
                </>
              )}

              {mode === 'cart' && cart && (
                <div className="space-y-3">
                  <span className="text-xs font-black text-slate-500 uppercase tracking-wider block">Order Summary ({cart.length} items)</span>
                  {cart.map(item => {
                    const r = item.cartUnit === 'kg' ? item.pricePerQuintal / 100 : item.pricePerQuintal;
                    return (
                      <div key={item.id} className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-xl p-3.5">
                        <div>
                          <span className="font-extrabold text-slate-800 text-sm">{item.cropName}</span>
                          <span className="block text-xs text-slate-400 font-medium">{item.cartQty} {item.cartUnit || 'qtl'}</span>
                        </div>
                        <span className="font-black text-slate-700 text-sm">₹{(r * item.cartQty).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Total preview */}
              {total > 0 && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex justify-between items-center">
                  <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Estimated Total</span>
                  <span className="text-xl font-black text-emerald-700">₹{total.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                </div>
              )}
            </div>
          )}

          {/* ═══ STEP 2: DELIVERY ADDRESS ═══ */}
          {step === 2 && (
            <div className="space-y-5 animate-step-enter">
              <div className="flex items-center space-x-3 mb-2">
                <div className="h-10 w-10 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-black text-slate-800">Delivery Address</h4>
                  <p className="text-xs text-slate-400 font-medium">Where should we deliver your produce?</p>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Full Delivery Address *</label>
                <textarea
                  rows={4}
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="Plot No., Street, Area, City, State, PIN Code..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-sm text-slate-800 resize-none leading-relaxed placeholder:text-slate-300"
                />
                <p className="text-[11px] text-slate-400 mt-1.5 font-medium">{address.length}/200 characters · min 10 required</p>
              </div>

              {/* Order summary chip */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex justify-between items-center">
                <span className="text-xs text-slate-500 font-bold">Order Total</span>
                <span className="font-black text-slate-800">₹{total.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          )}

          {/* ═══ STEP 3: PAYMENT METHOD ═══ */}
          {step === 3 && (
            <div className="space-y-5 animate-step-enter">
              <div className="flex items-center space-x-3 mb-2">
                <div className="h-10 w-10 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <h4 className="font-black text-slate-800">Choose Payment</h4>
                  <p className="text-xs text-slate-400 font-medium">Select your preferred payment method</p>
                </div>
              </div>

              {/* Payment options */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('razorpay')}
                  className={`w-full flex items-center space-x-4 p-4 rounded-2xl border-2 transition-all ${
                    paymentMethod === 'razorpay'
                      ? 'border-[#0a2d1e] bg-emerald-50/50'
                      : 'border-slate-100 bg-white hover:border-slate-200'
                  }`}
                >
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                    paymentMethod === 'razorpay' ? 'bg-[#0a2d1e]' : 'bg-slate-100'
                  }`}>
                    <CreditCard className={`h-5 w-5 ${paymentMethod === 'razorpay' ? 'text-white' : 'text-slate-400'}`} />
                  </div>
                  <div className="text-left flex-1">
                    <span className="block font-black text-slate-800 text-sm">Pay with Razorpay</span>
                    <span className="text-xs text-slate-400 font-medium">Cards · UPI · Netbanking · Wallets</span>
                  </div>
                  <Shield className={`h-4 w-4 ${paymentMethod === 'razorpay' ? 'text-emerald-600' : 'text-slate-300'}`} />
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('COD')}
                  className={`w-full flex items-center space-x-4 p-4 rounded-2xl border-2 transition-all ${
                    paymentMethod === 'COD'
                      ? 'border-amber-400 bg-amber-50/50'
                      : 'border-slate-100 bg-white hover:border-slate-200'
                  }`}
                >
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                    paymentMethod === 'COD' ? 'bg-amber-500' : 'bg-slate-100'
                  }`}>
                    <Banknote className={`h-5 w-5 ${paymentMethod === 'COD' ? 'text-white' : 'text-slate-400'}`} />
                  </div>
                  <div className="text-left flex-1">
                    <span className="block font-black text-slate-800 text-sm">Cash on Delivery</span>
                    <span className="text-xs text-slate-400 font-medium">Pay when your produce arrives</span>
                  </div>
                  <Truck className={`h-4 w-4 ${paymentMethod === 'COD' ? 'text-amber-500' : 'text-slate-300'}`} />
                </button>
              </div>

              {/* Grand total */}
              <div className="bg-gradient-to-br from-[#f0fdf4] to-[#ecfdf5] border border-emerald-100 rounded-2xl p-5 space-y-2">
                <div className="flex justify-between text-xs text-slate-500 font-bold">
                  <span>Produce Cost</span>
                  <span>₹{total.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500 font-bold">
                  <span>Logistics Fee</span>
                  <span className="text-emerald-600">FREE</span>
                </div>
                <div className="border-t border-emerald-100 pt-2 flex justify-between items-center">
                  <span className="font-black text-slate-700 text-sm">Grand Total</span>
                  <span className="text-xl font-black text-emerald-700">₹{total.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Delivery address review */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex space-x-3">
                <MapPin className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Delivering to</span>
                  <span className="text-xs text-slate-700 font-medium leading-relaxed">{address}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer buttons */}
        <div className="px-8 py-5 border-t border-slate-100 bg-white shrink-0">
          <div className={`flex ${step > 1 ? 'space-x-3' : ''}`}>
            {step > 1 && (
              <button
                type="button"
                onClick={() => { setStep(s => s - 1); setError(''); }}
                className="flex items-center space-x-1.5 px-5 py-3.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-sm font-bold text-slate-600 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </button>
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 bg-[#0a2d1e] hover:bg-[#0d3825] text-white font-black py-3.5 rounded-xl text-sm transition-all flex items-center justify-center space-x-2 shadow-md shadow-emerald-900/20"
              >
                <span>Continue</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={loading}
                onClick={() => paymentMethod === 'COD' ? placeWithCOD() : placeWithRazorpay()}
                className={`flex-1 font-black py-3.5 rounded-xl text-sm transition-all flex items-center justify-center space-x-2 shadow-md ${
                  paymentMethod === 'COD'
                    ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-200 disabled:opacity-60'
                    : 'bg-[#0a2d1e] hover:bg-[#0d3825] text-white shadow-emerald-900/20 disabled:opacity-60'
                }`}
              >
                {loading ? (
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : paymentMethod === 'COD' ? (
                  <>
                    <Truck className="h-4 w-4" />
                    <span>Place Order (COD)</span>
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4" />
                    <span>Pay ₹{total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── MOCK RAZORPAY PAYMENT GATEWAY MODAL ── */}
      {showRazorpayMockModal && razorpayMockData && (
        <div className="fixed inset-0 z-[500] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden border border-slate-100 shadow-2xl relative flex flex-col font-sans text-left">
            {/* Razorpay Brand Header */}
            <div className="bg-[#0c2340] text-white px-6 py-4 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className="bg-blue-500 p-1.5 rounded-lg text-white font-extrabold text-xs">R</div>
                <div>
                  <h4 className="font-extrabold text-sm tracking-wide">Razorpay Secure</h4>
                  <p className="text-[9px] text-blue-200 uppercase tracking-widest font-semibold">AgroLink Secure Escrow</p>
                </div>
              </div>
              <div className="text-right">
                <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider">Amount to Pay</span>
                <span className="block text-base font-black text-white">₹{razorpayMockData.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Mock Payment Body */}
            <div className="p-6">
              {mockPaymentState === 'form' && (
                <form onSubmit={handleMockPaySubmit} className="space-y-4">
                  <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200/55 mb-2">
                    {['upi', 'card', 'netbanking'].map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setMockSelectedMethod(method)}
                        className={`flex-1 py-2 text-center rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                          mockSelectedMethod === method
                            ? 'bg-[#0c2340] text-white'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        {method}
                      </button>
                    ))}
                  </div>

                  {mockSelectedMethod === 'upi' && (
                    <div className="space-y-3.5">
                      <div>
                        <label className="block text-[9px] font-black text-slate-450 uppercase tracking-wider mb-1.5">Enter Virtual Payment Address (UPI ID)</label>
                        <input
                          type="text"
                          required
                          value={mockUpiId}
                          onChange={(e) => setMockUpiId(e.target.value)}
                          placeholder="e.g. buyer@oksbi"
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-600 transition-colors"
                        />
                      </div>
                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-[10px] text-slate-500 leading-relaxed">
                        💡 <strong>Simulated Flow:</strong> You can enter any UPI ID. A mock verification prompt will be sent to confirm payment.
                      </div>
                    </div>
                  )}

                  {mockSelectedMethod === 'card' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[9px] font-black text-slate-450 uppercase tracking-wider mb-1.5">Card Number</label>
                        <input
                          type="text"
                          required
                          value={mockCardNum}
                          onChange={(e) => setMockCardNum(e.target.value)}
                          placeholder="4321 8876 5432 1098"
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-600 transition-colors"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[9px] font-black text-slate-450 uppercase tracking-wider mb-1.5">Expiry Date</label>
                          <input
                            type="text"
                            required
                            value={mockCardExpiry}
                            onChange={(e) => setMockCardExpiry(e.target.value)}
                            placeholder="MM/YY"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-600 transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-black text-slate-450 uppercase tracking-wider mb-1.5">CVV</label>
                          <input
                            type="password"
                            maxLength="3"
                            required
                            value={mockCardCvv}
                            onChange={(e) => setMockCardCvv(e.target.value)}
                            placeholder="•••"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-600 transition-colors"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {mockSelectedMethod === 'netbanking' && (
                    <div>
                      <label className="block text-[9px] font-black text-slate-450 uppercase tracking-wider mb-2">Select Your Bank</label>
                      <select
                        value={mockBank}
                        onChange={(e) => setMockBank(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none bg-white"
                      >
                        <option value="SBI">State Bank of India</option>
                        <option value="HDFC">HDFC Bank</option>
                        <option value="ICICI">ICICI Bank</option>
                        <option value="Axis">Axis Bank</option>
                        <option value="PNB">Punjab National Bank</option>
                      </select>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowRazorpayMockModal(false)}
                      className="border border-slate-200 hover:bg-slate-50 py-3.5 rounded-xl font-bold text-xs text-center text-slate-650 transition-colors"
                    >
                      Cancel Payment
                    </button>
                    <button
                      type="submit"
                      className="bg-[#0c2340] hover:bg-[#153459] text-white font-bold py-3.5 rounded-xl text-xs transition-colors flex items-center justify-center space-x-1.5 shadow-md shadow-slate-100"
                    >
                      <span>Pay ₹{razorpayMockData.amount.toLocaleString('en-IN')}</span>
                    </button>
                  </div>
                </form>
              )}

              {mockPaymentState === 'loading' && (
                <div className="py-12 text-center space-y-5">
                  <div className="h-10 w-10 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin mx-auto" />
                  <div className="space-y-1">
                    <h5 className="font-extrabold text-slate-800 text-sm">Processing Transaction</h5>
                    <p className="text-[10px] text-slate-450">Connecting to secure simulated payment gateway node...</p>
                  </div>
                </div>
              )}

              {mockPaymentState === 'otp' && (
                <form onSubmit={handleMockOtpSubmit} className="space-y-5 py-2">
                  <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 space-y-1.5">
                    <h5 className="font-extrabold text-blue-900 text-xs flex items-center space-x-1.5">
                      <span>🔒 Bank 3D Secure verification</span>
                    </h5>
                    <p className="text-[10px] text-blue-700 leading-relaxed">
                      A simulated OTP request has been initiated for your transaction. Enter any 6 digits to verify and clear the payment hold.
                    </p>
                  </div>

                  <div>
                    <label className="block text-[9px] font-black text-slate-450 uppercase tracking-wider mb-1.5">Enter Mock OTP (e.g. 123456)</label>
                    <input
                      type="text"
                      maxLength="6"
                      required
                      value={mockOtp}
                      onChange={(e) => setMockOtp(e.target.value)}
                      placeholder="123456"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold text-center tracking-widest text-slate-800 focus:outline-none focus:border-blue-600 transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3.5 rounded-xl text-xs transition-colors shadow-md shadow-slate-100"
                  >
                    Verify & Complete Payment
                  </button>
                </form>
              )}

              {mockPaymentState === 'success' && (
                <div className="py-12 text-center space-y-4 animate-pulse-slow">
                  <div className="h-12 w-12 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mx-auto text-xl font-bold animate-bounce">
                    ✓
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-black text-slate-800 text-base">Payment Authorized</h5>
                    <p className="text-[10px] text-slate-400">Escrow funds allocated successfully. Finalizing order...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer brand secure */}
            <div className="bg-slate-50 border-t border-slate-100 py-3.5 px-6 flex justify-between items-center text-[9px] text-slate-400 font-bold uppercase tracking-wider">
              <span>Razorpay Secured Node</span>
              <span>PCI-DSS Compliant</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
