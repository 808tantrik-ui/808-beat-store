import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, ArrowRight, ShieldCheck, ArrowLeft } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { useModalStore } from '../store/useModalStore';

interface CartPageProps {
  onNavigate?: (route: string) => void;
}

export function CartPage({ onNavigate }: CartPageProps) {
  const navigate = useNavigate();
  const { items, removeItem, updateLicense, clearCart, getTotal } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const { openAuthModal } = useModalStore();

  const handleCheckout = () => {
    if (onNavigate) {
      onNavigate('/checkout');
    } else {
      navigate('/checkout');
    }
  };

  if (items.length === 0) {
    return (
      <div className="pt-32 pb-24 px-4 max-w-xl mx-auto text-center">
        <div className="w-16 h-16 rounded-full bg-surface-light flex items-center justify-center mx-auto mb-4 border border-surface-border">
          <ShoppingBag className="w-8 h-8 text-text-subtle" />
        </div>
        <h2 className="text-2xl font-black text-white mb-2">Your Cart is Empty</h2>
        <p className="text-xs text-text-muted mb-6">
          Explore our hip-hop beat store and choose the commercial rights you need for your release.
        </p>
        <Link
          to="/beats"
          className="inline-block px-6 py-3 rounded-xl bg-electric-blue text-white text-xs font-bold shadow-glow-blue transition-all"
        >
          Browse Hip-Hop Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-24 px-4 sm:px-6 max-w-5xl mx-auto">
      <Link
        to="/beats"
        className="inline-flex items-center gap-2 text-xs font-semibold text-text-muted hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Continue Shopping</span>
      </Link>

      <div className="flex items-center justify-between mb-8 pb-4 border-b border-surface-border">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Shopping Cart</h1>
          <p className="text-xs text-text-muted mt-1">{items.length} items ready for instant license clearance</p>
        </div>

        <button
          onClick={clearCart}
          className="text-xs text-text-subtle hover:text-rose-400 transition-colors"
        >
          Clear All
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Items List */}
        <div className="lg:col-span-8 space-y-4">
          {items.map((item) => (
            <div
              key={item.beat.id}
              className="glass-card rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4 min-w-0">
                <img
                  src={item.beat.artwork}
                  alt={item.beat.title}
                  width={80}
                  height={80}
                  loading="lazy"
                  decoding="async"
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border border-surface-border shadow-md shrink-0"
                />

                <div className="min-w-0">
                  <Link
                    to={`/beats/${item.beat.slug}`}
                    className="font-bold text-white text-base hover:text-electric-cyan transition-colors truncate block"
                  >
                    {item.beat.title}
                  </Link>
                  <div className="flex items-center gap-2 text-xs text-text-muted font-mono mt-0.5">
                    <span className="text-electric-cyan">{item.beat.bpm} BPM</span>
                    <span>•</span>
                    <span>{item.beat.key}</span>
                  </div>

                  {/* License Dropdown */}
                  <div className="mt-2">
                    <select
                      value={item.license?.id || (item as any).selectedLicense?.id}
                      onChange={(e) => {
                        const newLic = item.beat.availableLicenses?.find((l) => l.id === e.target.value);
                        if (newLic) updateLicense(item.beat.id, newLic);
                      }}
                      className="text-xs bg-surface-lighter border border-surface-border rounded-lg px-2.5 py-1.5 text-white font-medium focus:outline-none focus:border-electric-blue transition-colors cursor-pointer"
                    >
                      {item.beat.availableLicenses?.map((lic) => (
                        <option key={lic.id} value={lic.id}>
                          {lic.displayName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-surface-border/40">
                <div className="text-right">
                  <span className="text-[10px] text-text-subtle uppercase block">License Price</span>
                  <div className="flex items-baseline gap-1.5 justify-end">
                    <span className="text-xs line-through text-slate-400 font-mono">
                      ₹{((item.license?.isExclusive || item.license?.name === 'EXCLUSIVE') ? 5999 : 499).toLocaleString()}
                    </span>
                    <span className="text-lg font-black text-white">
                      ₹{(item.license?.price || item.price || 0).toLocaleString()}
                    </span>
                  </div>
                  <span className="text-[9px] text-orange-400 font-bold block mt-0.5">Limited Time 🔥</span>
                </div>

                <button
                  onClick={() => removeItem(item.beat.id)}
                  className="p-2 rounded-lg text-text-subtle hover:text-rose-400 hover:bg-surface-lighter transition-colors"
                  aria-label="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Cart Summary */}
        <div className="lg:col-span-4 glass-card rounded-2xl p-6 space-y-4">
          <h3 className="font-bold text-white text-base">Order Summary</h3>

          <div className="space-y-2 text-xs text-text-muted">
            <div className="flex justify-between">
              <span>Selected Beats:</span>
              <span className="text-white font-mono">{items.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Catalog Value:</span>
              <span className="text-slate-400 line-through font-mono">
                ₹{items.reduce((acc, i) => acc + ((i.license?.isExclusive || i.license?.name === 'EXCLUSIVE') ? 5999 : 499), 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-emerald-400 font-bold">
              <span>Promo Savings:</span>
              <span className="font-mono">
                -₹{Math.max(0, items.reduce((acc, i) => acc + ((i.license?.isExclusive || i.license?.name === 'EXCLUSIVE') ? 5999 : 499), 0) - getTotal()).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Delivery:</span>
              <span className="text-electric-cyan font-mono">INSTANT DIGITAL</span>
            </div>
          </div>

          <div className="pt-3 border-t border-surface-border flex justify-between items-center text-sm">
            <span className="font-bold text-white">Total Amount:</span>
            <span className="text-2xl font-black text-white">₹{getTotal().toLocaleString()}</span>
          </div>

          <button
            onClick={handleCheckout}
            className="w-full py-3.5 rounded-xl bg-electric-blue hover:bg-electric-blue/90 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-glow-blue transition-all"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="pt-2 flex items-center gap-2 text-[11px] text-text-subtle">
            <ShieldCheck className="w-4 h-4 text-electric-cyan shrink-0" />
            <span>Official Razorpay gateway with cryptographic HMAC verification.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
