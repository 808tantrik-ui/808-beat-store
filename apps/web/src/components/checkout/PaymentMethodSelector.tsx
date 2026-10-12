import React from 'react';
import { 
  CreditCard, 
  Smartphone, 
  Building2, 
  Wallet, 
  CheckCircle2, 
  ShieldCheck, 
  Zap,
  Sparkles
} from 'lucide-react';

export type PaymentMethodType = 'all' | 'upi' | 'card' | 'netbanking' | 'wallet';

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethodType;
  onSelectMethod: (method: PaymentMethodType) => void;
}

export function PaymentMethodSelector({ selectedMethod, onSelectMethod }: PaymentMethodSelectorProps) {
  const methods = [
    {
      id: 'upi' as PaymentMethodType,
      title: 'UPI / QR Code',
      subtitle: 'Google Pay, PhonePe, Paytm, BHIM & UPI ID',
      badge: 'Most Popular • 0% Fee',
      badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      icon: Smartphone,
      accent: 'from-emerald-500/20 to-teal-500/10',
      activeBorder: 'border-emerald-500 ring-1 ring-emerald-500',
      popular: true,
      supportedApps: ['GPay', 'PhonePe', 'Paytm', 'BHIM', 'Cred', 'Amazon Pay'],
    },
    {
      id: 'card' as PaymentMethodType,
      title: 'Credit / Debit Cards',
      subtitle: 'Visa, MasterCard, RuPay, Maestro & Amex',
      badge: 'All Banks Supported',
      badgeColor: 'text-electric-cyan bg-electric-cyan/10 border-electric-cyan/20',
      icon: CreditCard,
      accent: 'from-blue-500/20 to-indigo-500/10',
      activeBorder: 'border-electric-blue ring-1 ring-electric-blue',
      supportedApps: ['Visa', 'MasterCard', 'RuPay', 'Amex', 'Maestro'],
    },
    {
      id: 'netbanking' as PaymentMethodType,
      title: 'Net Banking',
      subtitle: 'HDFC, SBI, ICICI, Axis, Kotak & 50+ Banks',
      badge: 'Direct Bank Transfer',
      badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      icon: Building2,
      accent: 'from-purple-500/20 to-pink-500/10',
      activeBorder: 'border-purple-500 ring-1 ring-purple-500',
      supportedApps: ['HDFC', 'SBI', 'ICICI', 'Axis', 'Kotak', 'PNB', '50+ Banks'],
    },
    {
      id: 'wallet' as PaymentMethodType,
      title: 'Wallets & EMI',
      subtitle: 'Paytm Wallet, Mobikwik, Airtel Money & EMI',
      badge: 'Instant Checkout',
      badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      icon: Wallet,
      accent: 'from-amber-500/20 to-orange-500/10',
      activeBorder: 'border-amber-500 ring-1 ring-amber-500',
      supportedApps: ['Paytm', 'Mobikwik', 'Freecharge', 'Credit EMI'],
    },
  ];

  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-xs font-bold text-white uppercase tracking-wider">
            Select Preferred Payment Mode
          </label>
          <p className="text-[11px] text-text-muted mt-0.5">
            Card, UPI, Net Banking, and Wallets are all fully accepted.
          </p>
        </div>
        <span className="flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>RBI Compliant</span>
        </span>
      </div>

      {/* Grid of selectable payment modes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {methods.map((method) => {
          const Icon = method.icon;
          const isSelected = selectedMethod === method.id;

          return (
            <button
              key={method.id}
              type="button"
              onClick={() => onSelectMethod(method.id)}
              className={`text-left p-3.5 rounded-xl border transition-all duration-200 relative overflow-hidden group ${
                isSelected
                  ? `bg-surface-light ${method.activeBorder} shadow-lg`
                  : 'bg-surface/60 border-surface-border hover:border-text-subtle/50 hover:bg-surface-light/40'
              }`}
            >
              {/* Subtle gradient background on active */}
              {isSelected && (
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${method.accent} opacity-40 pointer-events-none`}
                />
              )}

              <div className="relative z-10 flex items-start gap-3">
                <div
                  className={`p-2 rounded-lg shrink-0 transition-colors ${
                    isSelected
                      ? 'bg-white/10 text-white shadow-inner'
                      : 'bg-surface-border/50 text-text-muted group-hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-bold text-sm text-white truncate">
                      {method.title}
                    </span>
                    {isSelected ? (
                      <CheckCircle2 className="w-4 h-4 text-electric-cyan shrink-0 animate-in fade-in" />
                    ) : null}
                  </div>

                  <p className="text-[11px] text-text-muted leading-tight truncate mb-2">
                    {method.subtitle}
                  </p>

                  <div className="flex flex-wrap gap-1 items-center">
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${method.badgeColor}`}
                    >
                      {method.badge}
                    </span>
                  </div>
                </div>
              </div>

              {/* Supported apps pill tag list */}
              <div className="relative z-10 mt-2.5 pt-2 border-t border-surface-border/40 flex flex-wrap gap-1.5 items-center">
                {method.supportedApps.map((app) => (
                  <span
                    key={app}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-surface/80 border border-surface-border/60 text-text-muted group-hover:text-text font-mono"
                  >
                    {app}
                  </span>
                ))}
              </div>
            </button>
          );
        })}
      </div>

      {/* Feature reassurance bar */}
      <div className="p-3 rounded-xl bg-surface-light/40 border border-surface-border flex items-center justify-between text-[11px] text-text-muted">
        <div className="flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-electric-cyan" />
          <span>Instant Master audio download & License PDF after payment</span>
        </div>
        <div className="flex items-center gap-1.5 text-text-subtle font-mono text-[10px]">
          <span>256-Bit SSL</span>
          <span>•</span>
          <span>Razorpay Hosted</span>
        </div>
      </div>
    </div>
  );
}
