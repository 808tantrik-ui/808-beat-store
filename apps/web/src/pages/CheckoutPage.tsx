import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Lock, 
  AlertCircle, 
  ArrowLeft, 
  Loader2, 
  Sparkles,
  Flame,
  Crown,
  CreditCard,
  Smartphone,
  Building2,
  Wallet,
  CheckCircle2,
  FileText,
  Music
} from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { useModalStore } from '../store/useModalStore';
import { producerBrand, brandHelpers } from '@config/brand';
import { PaymentMethodSelector, PaymentMethodType } from '../components/checkout/PaymentMethodSelector';
import { apiUrl } from '../config/api';
import { loadRazorpay } from '../utils/loadRazorpay';

interface CheckoutPageProps {
  onNavigate?: (route: string) => void;
}

export function CheckoutPage({ onNavigate }: CheckoutPageProps) {
  const navigate = useNavigate();
  const { items, getTotal, clearCart } = useCartStore();
  const { user, isAuthenticated, setAuth } = useAuthStore();
  const { openAuthModal } = useModalStore();
  const producerName = brandHelpers.getProducerName(producerBrand);

  const handleNavigate = (route: string) => {
    if (onNavigate) {
      onNavigate(route);
    } else {
      navigate(route);
    }
  };

  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethodType>('upi');
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If user state updates (e.g. after signing in), sync name & email
  useEffect(() => {
    if (user) {
      if (user.name && !customerName) setCustomerName(user.name);
      if (user.email && !customerEmail) setCustomerEmail(user.email);
    }
  }, [user]);

  // Prompt sign-in / registration modal on checkout arrival if unauthenticated
  useEffect(() => {
    if (!isAuthenticated) {
      openAuthModal('checkout');
    }
  }, [isAuthenticated, openAuthModal]);

  if (items.length === 0) {
    return (
      <div className="pt-32 pb-24 text-center max-w-md mx-auto px-4">
        <div className="w-16 h-16 rounded-2xl bg-surface-light border border-surface-border flex items-center justify-center mx-auto mb-4 text-text-muted">
          <Music className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-white mb-2">Your Cart is Empty</h2>
        <p className="text-xs text-text-muted mb-6 leading-relaxed">
          Select and add any studio master beat with promotional licensing rights before checking out.
        </p>
        <Link
          to="/beats"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-electric-blue hover:bg-electric-blue/90 text-white text-xs font-bold uppercase tracking-wider shadow-glow-blue transition-all"
        >
          <span>Explore Beats Catalog</span>
        </Link>
      </div>
    );
  }

  const totalAmount = getTotal();

  // Calculate promotional slashed total
  const originalTotal = items.reduce((acc, item) => {
    const isEx = item.license.isExclusive || item.license.name === 'EXCLUSIVE';
    return acc + (isEx ? 5999 : 499);
  }, 0);
  const savingsAmount = Math.max(0, originalTotal - totalAmount);

  const handlePayWithRazorpay = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!customerName.trim() || customerName.trim().length < 2) {
      setErrorMessage('Please enter your full artist/company name above.');
      return;
    }

    if (!customerEmail.trim() || !/^\S+@\S+\.\S+$/.test(customerEmail.trim())) {
      setErrorMessage('Please enter a valid email address for instant master audio delivery.');
      return;
    }

    if (!agreedToTerms) {
      setErrorMessage('You must review and agree to the licensing terms.');
      return;
    }

    if (!isAuthenticated && customerEmail.trim()) {
      setAuth(`guest_${Date.now().toString(36)}`, {
        id: `usr_${Date.now().toString(36)}`,
        email: customerEmail.trim(),
        name: customerName.trim() || customerEmail.split('@')[0],
        role: 'CUSTOMER',
      });
    }

    setIsProcessing(true);

    try {
      // 1. Create Order on Backend
      const checkoutRes = await fetch(apiUrl('/api/payments/checkout'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerName.trim(),
          customerEmail: customerEmail.trim(),
          items: items.map((i) => ({ beatId: i.beat.id, licenseId: i.license.id })),
        }),
      });

      const checkoutData = await checkoutRes.json();
      if (!checkoutRes.ok || !checkoutData.success) {
        throw new Error(checkoutData.error?.message || 'Failed to initiate checkout order.');
      }

      const { orderId, orderNumber, razorpayOrderId, amount, currency, keyId, isLiveOrder } = checkoutData.data;

      // 2. Dynamically load Razorpay SDK
      await loadRazorpay();

      const effectiveKeyId = (import.meta as any).env?.VITE_RAZORPAY_KEY_ID || keyId;

      if (typeof window !== 'undefined' && (window as any).Razorpay && isLiveOrder && !effectiveKeyId?.includes('placeholder')) {
        const options = {
          key: effectiveKeyId,
          amount,
          currency: currency || 'INR',
          name: producerName,
          description: `Order ${orderNumber} - High Fidelity Beats`,
          order_id: razorpayOrderId,
          prefill: {
            name: customerName,
            email: customerEmail,
            method: selectedPaymentMethod === 'all' ? undefined : selectedPaymentMethod,
          },
          theme: {
            color: '#0066FF',
            backdrop_color: '#050508',
          },
          handler: async (response: any) => {
            // 3. Cryptographically verify signature on backend
            try {
              const verifyRes = await fetch(apiUrl('/api/payments/razorpay/verify'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  orderId,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                }),
              });

              const verifyData = await verifyRes.json();
              if (verifyData.success) {
                clearCart();
                if (verifyData.data?.downloadToken) {
                  handleNavigate(`/download?token=${verifyData.data.downloadToken}`);
                } else {
                  handleNavigate(`/order/success/${orderId}`);
                }
              } else {
                setErrorMessage(verifyData.error?.message || 'Payment signature verification failed. Access denied.');
                setIsProcessing(false);
              }
            } catch (err: any) {
              setErrorMessage(err.message || 'Verification network error.');
              setIsProcessing(false);
            }
          },
          modal: {
            ondismiss: () => {
              setIsProcessing(false);
              setErrorMessage('Payment modal was closed. Your digital audio files and licenses remain strictly locked.');
            },
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', (response: any) => {
          console.error('[RAZORPAY PAYMENT FAILED]:', response.error);
          setIsProcessing(false);
          setErrorMessage(response.error?.description || 'Payment was declined or failed. Please check your bank/card or retry.');
        });
        rzp.open();
      } else {
        setIsProcessing(false);
        const reason = !(window as any).Razorpay
          ? 'Razorpay checkout script load nahi ho saka. Kripya page refresh karein.'
          : !isLiveOrder
          ? 'Razorpay gateway temporarily initializing. Please retry in a few seconds.'
          : 'Payment gateway configuration error. Key ID check karein.';
        setErrorMessage(reason);
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      const isFetchError = err?.message && err.message.toLowerCase().includes('fetch');
      setErrorMessage(
        isFetchError
          ? 'Server connection timeout. Please check your network and retry in 2 seconds.'
          : (err.message || 'Payment initialization error. Please retry.')
      );
      setIsProcessing(false);
    }
  };

  const getButtonPaymentText = () => {
    switch (selectedPaymentMethod) {
      case 'upi':
        return `Pay ₹${totalAmount.toLocaleString()} via UPI (PhonePe / GPay)`;
      case 'card':
        return `Pay ₹${totalAmount.toLocaleString()} via Card (Debit / Credit)`;
      case 'netbanking':
        return `Pay ₹${totalAmount.toLocaleString()} via Net Banking`;
      case 'wallet':
        return `Pay ₹${totalAmount.toLocaleString()} via Wallet`;
      default:
        return `Pay ₹${totalAmount.toLocaleString()} with Razorpay`;
    }
  };

  return (
    <div className="pt-24 sm:pt-28 pb-20 px-3 sm:px-6 max-w-6xl mx-auto">
      {/* Return Navigation */}
      <Link
        to="/cart"
        className="inline-flex items-center gap-2 text-xs font-semibold text-text-muted hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Cart</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column: Form & Payment Gateway Trigger */}
        <div className="lg:col-span-7 bg-[#0d0e17] p-5 sm:p-8 rounded-2xl border border-surface-border shadow-2xl space-y-6">
          <div className="border-b border-surface-border pb-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold flex items-center gap-1">
                <Lock className="w-3 h-3" />
                <span>256-Bit SSL Encrypted</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Checkout & Delivery</h1>
            <p className="text-xs text-text-muted mt-1 leading-relaxed">
              Enter your artist name and delivery email to receive cryptographically signed master WAVs, MP3s, and legal contracts.
            </p>
          </div>

          {errorMessage && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-xs text-rose-300 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handlePayWithRazorpay} className="space-y-6">
            {/* Customer Inputs */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1.5 uppercase tracking-wider flex items-center justify-between">
                  <span>Artist / Stage / Production Name *</span>
                  <span className="text-[10px] font-mono text-cyan-400 font-normal">Printed on License PDF</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. 808 Tantrik / Artist Name"
                    className="w-full bg-[#121320] border border-white/15 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 rounded-xl px-4 py-3.5 text-base sm:text-sm text-white placeholder-slate-500 transition-all outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1.5 uppercase tracking-wider flex items-center justify-between">
                  <span>Delivery Email Address *</span>
                  <span className="text-[10px] font-mono text-emerald-400 font-normal">Instant Vault Access</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="artist@gmail.com"
                    className="w-full bg-[#121320] border border-white/15 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 rounded-xl px-4 py-3.5 text-base sm:text-sm text-white placeholder-slate-500 transition-all outline-none"
                  />
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Uncompressed 24-bit WAVs, 320kbps MP3s & cryptographically signed PDF license contract will be sent here immediately.</span>
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-white mb-2 uppercase tracking-wider flex items-center justify-between">
                <span>Select Payment Method</span>
                <span className="text-[10px] text-electric-cyan font-mono font-normal">Razorpay Verified</span>
              </label>

              <PaymentMethodSelector
                selectedMethod={selectedPaymentMethod}
                onSelectMethod={(method) => setSelectedPaymentMethod(method)}
              />
            </div>

            {/* Terms Agreement */}
            <div className="p-3.5 rounded-xl bg-surface-light/40 border border-surface-border">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 rounded border-surface-border bg-surface-light text-electric-blue focus:ring-electric-blue"
                />
                <span className="text-xs text-text-muted leading-relaxed">
                  I agree to the{' '}
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNavigate('/licensing-terms');
                    }}
                    className="text-electric-cyan underline hover:text-white cursor-pointer font-semibold"
                  >
                    Licensing Terms & Conditions
                  </span>{' '}
                  and acknowledge that digital audio downloads are delivered immediately upon payment.
                </span>
              </label>
            </div>

            {/* Pay Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-glow-blue shadow-lg transition-all active:scale-[0.99] cursor-pointer border-0"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Opening Razorpay Secure Gateway...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>{getButtonPaymentText()}</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Trust Badges */}
          <div className="pt-4 border-t border-surface-border flex items-center justify-center gap-4 text-xs text-text-subtle flex-wrap">
            <span className="flex items-center gap-1.5 text-slate-300">
              <ShieldCheck className="w-4 h-4 text-electric-cyan" />
              <span>Official Razorpay Gateway</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-slate-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Instant Download Vault</span>
            </span>
            <span>•</span>
            <span className="text-slate-300">UPI / Card / NetBanking / EMI</span>
          </div>
        </div>

        {/* Right Column: Order Summary with Promotional Discounts */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#0d0e17] p-5 sm:p-6 rounded-2xl border border-surface-border shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-surface-border">
              <h2 className="text-sm font-black text-white uppercase tracking-wider">
                Order Summary ({items.length} {items.length === 1 ? 'Beat' : 'Beats'})
              </h2>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-orange-400 bg-orange-500/15 border border-orange-500/30 px-2 py-0.5 rounded-full">
                <Flame className="w-3 h-3 fill-orange-400" />
                <span>Limited Time Offer</span>
              </span>
            </div>

            {/* Beat Items List */}
            <div className="space-y-3.5 max-h-[340px] overflow-y-auto pr-1">
              {items.map((item) => {
                const isEx = item.license.isExclusive || item.license.name === 'EXCLUSIVE';
                const originalPrice = isEx ? 5999 : 499;

                return (
                  <div key={item.beat.id} className="p-3 rounded-xl bg-surface-light/30 border border-surface-border/60 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 truncate">
                      <img
                        src={item.beat.artwork}
                        alt={item.beat.title}
                        width={48}
                        height={48}
                        loading="lazy"
                        decoding="async"
                        className="w-12 h-12 rounded-lg object-cover border border-surface-border shrink-0"
                      />
                      <div className="truncate">
                        <div className="font-extrabold text-white text-sm truncate">{item.beat.title}</div>
                        <div className="text-[11px] text-electric-cyan font-mono flex items-center gap-1 mt-0.5">
                          {isEx ? (
                            <span className="text-amber-400 font-bold flex items-center gap-1">
                              <Crown className="w-3 h-3 fill-amber-400" />
                              Exclusive License
                            </span>
                          ) : (
                            <span>Non-Exclusive License</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[11px] line-through text-slate-400 font-mono block">
                        ₹{originalPrice.toLocaleString()}
                      </span>
                      <span className={`text-base font-black ${isEx ? 'text-amber-400' : 'text-white'}`}>
                        ₹{item.price.toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Calculations Breakdown */}
            <div className="pt-4 border-t border-surface-border space-y-2.5 text-xs text-text-muted">
              <div className="flex justify-between">
                <span>Standard Catalog Price:</span>
                <span className="text-slate-400 line-through font-mono">₹{originalTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-emerald-400 font-semibold">
                <span>Promotional Discount:</span>
                <span className="font-mono">-₹{savingsAmount.toLocaleString()} (90%+ OFF)</span>
              </div>
              <div className="flex justify-between">
                <span>Digital Delivery & License:</span>
                <span className="text-electric-cyan font-mono font-bold">FREE / INSTANT</span>
              </div>
            </div>

            {/* Total Payable Box */}
            <div className="pt-4 border-t border-surface-border flex justify-between items-baseline bg-surface-light/40 -mx-5 sm:-mx-6 -mb-5 sm:-mb-6 p-5 sm:p-6 rounded-b-2xl">
              <div>
                <span className="text-xs uppercase font-bold text-text-muted block">Final Total Payable</span>
                <span className="text-[10px] text-emerald-400 font-mono font-bold">Save ₹{savingsAmount.toLocaleString()} Today</span>
              </div>
              <span className="text-3xl font-black text-white font-mono">
                ₹{totalAmount.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Upsell Banner if only Non-Exclusive in cart */}
          {items.some((i) => !i.license.isExclusive && i.license.name !== 'EXCLUSIVE') && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 text-amber-300 font-black uppercase text-[11px]">
                <Crown className="w-3.5 h-3.5 fill-amber-300" />
                <span>UPSELL: Claim Full Exclusive Rights for ₹499</span>
              </div>
              <p className="text-text-muted leading-relaxed text-[11px]">
                Want 100% sole ownership so NO other artist can ever release with this beat? Upgrade to Exclusive in cart for only ₹499 (slashed from ₹5,999)!
              </p>
            </div>
          )}

          {/* Instant Guarantee */}
          <div className="p-4 rounded-xl bg-surface-light/30 border border-surface-border text-center space-y-1">
            <span className="text-xs font-bold text-white flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>100% Commercial Streaming Clearance</span>
            </span>
            <p className="text-[11px] text-text-muted">
              WAV and MP3 download links remain active in your secure vault with an official signed legal certificate.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
