import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, ArrowRight, ShoppingBag, ShieldCheck } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useModalStore } from '../../store/useModalStore';

interface CartDrawerProps {
  onNavigateCheckout?: () => void;
  onNavigateCart?: () => void;
}

export function CartDrawer({ onNavigateCheckout, onNavigateCart }: CartDrawerProps) {
  const navigate = useNavigate();
  const { items, isCartOpen, setIsCartOpen, removeItem, updateLicense, getTotal } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const { openAuthModal } = useModalStore();

  if (!isCartOpen) return null;

  const handleGoToCart = () => {
    setIsCartOpen(false);
    if (onNavigateCart) {
      onNavigateCart();
    } else {
      navigate('/cart');
    }
  };

  const handleGoToCheckout = () => {
    setIsCartOpen(false);
    if (onNavigateCheckout) {
      onNavigateCheckout();
    } else {
      navigate('/checkout');
    }
  };

  const handleGoToBeats = () => {
    setIsCartOpen(false);
    navigate('/beats');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-md bg-surface border-l border-surface-border shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="p-5 border-b border-surface-border flex items-center justify-between bg-surface-light">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-electric-cyan" />
              <h2 className="text-base font-bold text-white">Your Cart ({items.length})</h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-lg text-text-muted hover:text-white hover:bg-surface-border transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Items */}
          <div className="p-5 flex-1 overflow-y-auto space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-text-muted">
                <div className="w-16 h-16 rounded-full bg-surface-light flex items-center justify-center mb-3">
                  <ShoppingBag className="w-7 h-7 text-text-subtle" />
                </div>
                <h3 className="text-white font-bold text-base">Your cart is empty</h3>
                <p className="text-xs text-text-subtle mt-1 max-w-xs">
                  Explore our premium hip-hop catalog and select the right commercial license for your track.
                </p>
                <button
                  onClick={handleGoToBeats}
                  className="mt-4 px-4 py-2 rounded-xl bg-electric-blue text-white text-xs font-bold hover:bg-electric-blue/90 shadow-glow-blue transition-all"
                >
                  Browse Beats
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.beat.id}
                  className="p-3.5 rounded-xl bg-surface-light/60 border border-surface-border flex gap-3 relative group"
                >
                  <img
                    src={item.beat.artwork}
                    alt={item.beat.title}
                    width={64}
                    height={64}
                    loading="lazy"
                    decoding="async"
                    className="w-16 h-16 rounded-lg object-cover border border-surface-border shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-white text-sm truncate">{item.beat.title}</h4>
                      <button
                        onClick={() => removeItem(item.beat.id)}
                        className="text-text-subtle hover:text-rose-400 p-1 transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="mt-2">
                      {/* License Selector dropdown */}
                      <select
                        value={item.license?.id || (item as any).selectedLicense?.id}
                        onChange={(e) => {
                          const lic = item.beat.availableLicenses?.find((l) => l.id === e.target.value);
                          if (lic) updateLicense(item.beat.id, lic);
                        }}
                        className="w-full text-xs bg-surface-lighter border border-surface-border rounded-lg px-2.5 py-1.5 text-white font-medium focus:outline-none focus:border-electric-blue transition-colors cursor-pointer"
                      >
                        {item.beat.availableLicenses?.map((lic) => (
                          <option key={lic.id} value={lic.id}>
                            {lic.displayName} - ₹{lic.price.toLocaleString()}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer */}
          {items.length > 0 && (
            <div className="p-5 border-t border-surface-border bg-surface-light space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-muted">Total (INR):</span>
                <span className="text-xl font-black text-white">₹{getTotal().toLocaleString()}</span>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-text-subtle">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Instant encrypted WAV/MP3 delivery after payment</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleGoToCart}
                  className="py-2.5 px-3 rounded-xl bg-surface-lighter hover:bg-surface-border text-white text-xs font-semibold border border-surface-border text-center transition-all"
                >
                  View Cart
                </button>

                <button
                  onClick={handleGoToCheckout}
                  className="py-2.5 px-3 rounded-xl bg-electric-blue hover:bg-electric-blue/90 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-glow-blue transition-all"
                >
                  <span>Checkout</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
