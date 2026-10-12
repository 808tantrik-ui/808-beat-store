import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Lock, 
  AlertCircle, 
  ArrowLeft, 
  Loader2, 
  UserCheck,
  Smartphone,
  QrCode,
  Copy,
  Check,
  CheckCircle2,
  ExternalLink,
  Zap
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

  // Direct Instant UPI state
  const upiId = '9754303398@ybl';
  const upiPayeeName = 'MANOJ KUMAR KAITHAL';
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');
  const [showUtrField, setShowUtrField] = useState(false);
  const [isUpiVerifying, setIsUpiVerifying] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
  };

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
        <h2 className="text-xl font-bold text-white mb-2">Cart is empty</h2>
        <p className="text-xs text-text-muted mb-4">Please add beats to your cart before proceeding to checkout.</p>
        <Link
          to="/beats"
          className="inline-block px-5 py-2.5 rounded-xl bg-electric-blue text-white text-xs font-bold"
        >
          Browse Beats
        </Link>
      </div>
    );
  }

  const handlePayWithRazorpay = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!customerName.trim() || customerName.trim().length < 2) {
      setErrorMessage('Please enter your full artist/company name above.');
      return;
    }

    if (!customerEmail.trim() || !/^\S+@\S+\.\S+$/.test(customerEmail.trim())) {
      setErrorMessage('Please enter a valid email address for delivery.');
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

      // 2. Dynamically load Razorpay SDK only when checking out
      await loadRazorpay();

      // Open Official Razorpay Checkout if window.Razorpay is loaded and order was created live with Razorpay
      if (typeof window !== 'undefined' && (window as any).Razorpay && isLiveOrder && !keyId.includes('placeholder')) {
        const options = {
          key: keyId,
          amount,
          currency,
          name: producerName,
          description: `Order ${orderNumber} - High Fidelity Instrumentals`,
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
            // 3. Cryptographically verify signature on backend (Server Verification)
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
              setErrorMessage('Payment was cancelled or closed. Your digital audio files and licenses remain strictly locked.');
            },
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else {
        // Gateway unavailable - do NOT simulate or bypass payment!
        setIsProcessing(false);
        setErrorMessage('Online Payment Gateway is temporarily unavailable. Please use the Direct Instant UPI (PhonePe / GPay / Paytm) option above for instant payment.');
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      const isFetchError = err?.message && err.message.toLowerCase().includes('fetch');
      setErrorMessage(
        isFetchError
          ? 'Server se connect ho raha hai. Kripya 2 second ruk kar dobara tap karein.'
          : (err.message || 'Payment initialize karne me dikkat aayi. Kripya dobara try karein.')
      );
      setIsProcessing(false);
    }
  };

  const ensureOrderCreated = async () => {
    if (createdOrderId) return createdOrderId;
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
    setCreatedOrderId(checkoutData.data.orderId);
    return checkoutData.data.orderId;
  };

  const handleDirectUpiVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    if (!customerName.trim() || customerName.trim().length < 2) {
      setErrorMessage('Please enter your artist or company name above.');
      return;
    }

    if (!customerEmail.trim() || !/^\S+@\S+\.\S+$/.test(customerEmail.trim())) {
      setErrorMessage('Please enter a valid email address for delivery.');
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

    const cleanUtr = utrNumber.trim();
    if (!cleanUtr || cleanUtr.length < 8 || !/^[A-Za-z0-9]{8,24}$/.test(cleanUtr)) {
      setErrorMessage('Kripya UPI payment complete karne ke baad PhonePe, GPay ya Paytm se apna 12-digit UTR / Reference Number enter karein.');
      return;
    }

    setIsUpiVerifying(true);
    try {
      const orderId = await ensureOrderCreated();
      const verifyRes = await fetch(apiUrl('/api/payments/upi/verify'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          utrNumber: cleanUtr,
        }),
      });

      const verifyData = await verifyRes.json();
      if (verifyData.success) {
        clearCart();
        handleNavigate(`/order/success/${orderId}`);
      } else {
        setErrorMessage(verifyData.error?.message || 'UPI Payment verification failed. Access denied.');
        setIsUpiVerifying(false);
      }
    } catch (err: any) {
      console.error('UPI Verify error:', err);
      const isFetchError = err?.message && err.message.toLowerCase().includes('fetch');
      setErrorMessage(
        isFetchError
          ? 'Server se connect ho raha hai. Kripya 2 second ruk kar dobara tap karein.'
          : (err.message || 'UPI transaction verify karne me dikkat aayi. Kripya dobara try karein.')
      );
      setIsUpiVerifying(false);
    }
  };

  const totalAmount = getTotal();
  const upiDeepLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(upiPayeeName)}&am=${totalAmount.toFixed(2)}&cu=INR&mode=02&purpose=00&tn=${encodeURIComponent('Beat License Purchase')}`;
  const upiQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=10&data=${encodeURIComponent(upiDeepLink)}`;

  const getButtonPaymentText = () => {
    switch (selectedPaymentMethod) {
      case 'upi':
        return `Pay ₹${totalAmount.toLocaleString()} via Razorpay Gateway`;
      case 'card':
        return `Pay ₹${totalAmount.toLocaleString()} via Card`;
      case 'netbanking':
        return `Pay ₹${totalAmount.toLocaleString()} via Net Banking`;
      case 'wallet':
        return `Pay ₹${totalAmount.toLocaleString()} via Wallet / EMI`;
      default:
        return `Pay ₹${totalAmount.toLocaleString()} Securely`;
    }
  };

  return (
    <div className="pt-28 pb-24 px-4 sm:px-6 max-w-4xl mx-auto">
      <Link
        to="/cart"
        className="inline-flex items-center gap-2 text-xs font-semibold text-text-muted hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Cart</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Customer Information & Payment Action */}
        <div className="lg:col-span-7 bg-surface p-6 sm:p-8 rounded-2xl border border-surface-border shadow-xl space-y-6">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Checkout & Delivery</h1>
            <p className="text-xs text-text-muted mt-1">
              Your high-fidelity masters and legal license will be delivered to this email.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handlePayWithRazorpay} className="space-y-5">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase tracking-wider">
                  Artist / Legal Entity Name *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Kendrick / Aftermath Ent."
                  className="w-full bg-surface-light border border-surface-border rounded-xl px-4 py-3 text-sm text-white placeholder-text-subtle focus:outline-none focus:border-electric-blue focus:ring-1 focus:ring-electric-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase tracking-wider">
                  Delivery Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="artist@musiclabel.com"
                  className="w-full bg-surface-light border border-surface-border rounded-xl px-4 py-3 text-sm text-white placeholder-text-subtle focus:outline-none focus:border-electric-blue focus:ring-1 focus:ring-electric-blue"
                />
                <span className="text-[10px] text-text-subtle mt-1 block">
                  Download links and signed license PDF will be sent here immediately.
                </span>
              </div>
            </div>

            {/* Payment Method Selector (UPI, Card, Net Banking, Wallet) */}
            <PaymentMethodSelector
              selectedMethod={selectedPaymentMethod}
              onSelectMethod={(method) => setSelectedPaymentMethod(method)}
            />

            {/* Direct Instant UPI (PhonePe, GPay, Paytm) Hub */}
            {selectedPaymentMethod === 'upi' && (
              <div className="p-5 rounded-2xl bg-gradient-to-b from-surface-light via-surface to-surface border border-emerald-500/30 shadow-2xl space-y-4 animate-in fade-in-50 duration-300">
                <div className="flex items-center justify-between pb-3 border-b border-surface-border">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-xs border border-emerald-500/30 shadow-glow-emerald">
                      UPI
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <span>Direct Instant UPI</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold">
                          0% Gateway Fee
                        </span>
                      </h3>
                      <p className="text-[11px] text-text-muted">Exact amount pre-filled automatically</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono uppercase text-text-subtle">Payable</span>
                    <div className="text-xl font-black text-emerald-400 font-mono">
                      ₹{totalAmount.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* 1-Tap Mobile Link (Opens PhonePe / GPay / Paytm directly) */}
                <a
                  href={upiDeepLink}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all text-center group"
                >
                  <Smartphone className="w-4 h-4 transition-transform group-hover:scale-110" />
                  <span>Open in UPI App (PhonePe / GPay / Paytm)</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </a>

                {/* Dynamic QR Code & UPI ID Copy for Desktop / Scanner */}
                <div className="p-4 rounded-xl bg-surface/90 border border-surface-border flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                  <div className="p-2.5 rounded-2xl bg-white shadow-xl shrink-0 border border-emerald-500/20">
                    <img
                      src={upiQrUrl}
                      alt={`Scan to pay ₹${totalAmount}`}
                      className="w-32 h-32 object-contain rounded-lg"
                      loading="eager"
                    />
                  </div>

                  <div className="space-y-2 text-xs flex-1">
                    <div>
                      <span className="text-text-subtle text-[11px] font-semibold">Official Payee UPI ID:</span>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="text-emerald-400 font-mono font-black text-xs sm:text-sm bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 select-all">
                          {upiId}
                        </code>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(upiId)}
                          className="px-3 py-1.5 rounded-lg bg-surface-light hover:bg-surface-lighter border border-surface-border text-text-muted hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                        >
                          {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedUpi ? 'Copied!' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>
                    <p className="text-[11px] text-text-muted leading-relaxed">
                      QR code scan karte hi phone mein exact <strong className="text-emerald-400 font-mono">₹{totalAmount.toLocaleString()}</strong> likha aayega.
                    </p>
                  </div>
                </div>

                {/* Locked Amount Badge */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-surface/70 border border-emerald-500/20 text-xs">
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                    <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Amount Locked: <strong className="text-white font-mono">₹{totalAmount.toLocaleString()}</strong></span>
                  </div>
                  <span className="text-[10px] text-text-muted bg-surface px-2 py-0.5 rounded-full border border-surface-border">
                    🔒 Non-Editable Fixed Bill
                  </span>
                </div>

                {/* Step 2: Enter Transaction UTR / Ref Number */}
                <div className="p-4 rounded-xl bg-surface/90 border border-emerald-500/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-white uppercase tracking-wider">
                      Step 2: Enter 12-Digit UPI Reference (UTR) *
                    </label>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold">Required for Verification</span>
                  </div>
                  <input
                    type="text"
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value.replace(/[^0-9A-Za-z]/g, '').slice(0, 24))}
                    placeholder="e.g. 428910283921 (12 digits from PhonePe/GPay/Paytm)"
                    className="w-full bg-surface-light border border-surface-border rounded-xl px-4 py-3 text-sm text-white font-mono placeholder-text-subtle focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                  <p className="text-[11px] text-text-muted leading-relaxed">
                    UPI App (PhonePe / GPay / Paytm) mein payment complete hone ke baad transaction receipt par likha <strong className="text-emerald-400">12-Digit UTR Number</strong> yahan enter karein.
                  </p>
                </div>

                {/* Secure Verification Submission Button */}
                <div className="pt-1 space-y-2.5">
                  {errorMessage && (
                    <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 flex items-start gap-2 text-xs text-rose-300 animate-in fade-in">
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <span>{errorMessage}</span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={handleDirectUpiVerify}
                    disabled={isUpiVerifying || !utrNumber.trim()}
                    className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-40 text-white text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-glow-emerald shadow-lg transition-all"
                  >
                    {isUpiVerifying ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Submitting & Verifying Transaction...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        <span>Verify UPI Payment & Submit Order</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="relative py-2 flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-surface-border"></div>
                  </div>
                  <span className="relative bg-surface px-3 text-[10px] font-mono uppercase text-text-subtle">
                    Or pay via Razorpay Gateway below
                  </span>
                </div>
              </div>
            )}

            <div className="pt-2">
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
                    className="text-electric-cyan underline hover:text-white cursor-pointer"
                  >
                    Licensing Terms & Conditions
                  </span>{' '}
                  and acknowledge that digital downloads are delivered immediately upon verified payment.
                </span>
              </label>
            </div>

            <div className="pt-2 space-y-2">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 flex items-start gap-2 text-xs text-rose-300 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-4 rounded-xl bg-electric-blue hover:bg-electric-blue/90 disabled:opacity-50 text-white font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-glow-blue transition-all"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Secure Transaction...</span>
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

          <div className="pt-3 border-t border-surface-border flex items-center justify-center gap-3 text-xs text-text-subtle flex-wrap">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-electric-cyan" />
              <span>Razorpay Verified</span>
            </span>
            <span>•</span>
            <span>256-Bit SSL</span>
            <span>•</span>
            <span>UPI / Card / NetBanking</span>
          </div>
        </div>

        {/* Order Items Review */}
        <div className="lg:col-span-5 bg-surface/60 p-6 rounded-2xl border border-surface-border space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider pb-3 border-b border-surface-border">
            Review Order ({items.length} Beats)
          </h2>

          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={item.beat.id} className="flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 truncate">
                  <img
                    src={item.beat.artwork}
                    alt={item.beat.title}
                    width={40}
                    height={40}
                    loading="lazy"
                    decoding="async"
                    className="w-10 h-10 rounded-lg object-cover border border-surface-border shrink-0"
                  />
                  <div className="truncate">
                    <div className="font-bold text-white truncate">{item.beat.title}</div>
                    <div className="text-[11px] text-electric-cyan font-mono">{item.license.displayName}</div>
                  </div>
                </div>

                <div className="font-bold text-white shrink-0">
                  ₹{item.price.toLocaleString()}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-surface-border space-y-2 text-xs text-text-muted">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="text-white font-mono">₹{getTotal().toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Digital Delivery:</span>
              <span className="text-electric-cyan font-mono">FREE / INSTANT</span>
            </div>
          </div>

          <div className="pt-3 border-t border-surface-border flex justify-between items-center">
            <span className="text-sm font-bold text-white">Total:</span>
            <span className="text-2xl font-black text-white">₹{getTotal().toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
