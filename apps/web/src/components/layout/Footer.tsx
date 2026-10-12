import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock } from 'lucide-react';
import { producerBrand, brandHelpers } from '@config/brand';

interface FooterProps {
  onNavigate?: (route: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  const copyrightOwner = brandHelpers.getCopyrightOwner(producerBrand);

  const activeSocials = [
    {
      name: 'Instagram',
      url: 'https://www.instagram.com/808_beatstore?stkn=MWxnMmFqaWJjbWZlOQ%3D%3D&utm_source=qr',
      color: 'hover:text-pink-400 hover:border-pink-500/40 hover:bg-pink-500/10',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      ),
    },
    {
      name: 'YouTube',
      url: 'https://youtube.com/@808beatstore?si=Gm2bZSIbAbnFDHN5',
      color: 'hover:text-red-400 hover:border-red-500/40 hover:bg-red-500/10',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      ),
    },
  ];

  return (
    <footer className="border-t border-surface-border bg-[#070710]/95 backdrop-blur-xl pt-14 pb-28 sm:pb-20 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Consolidated 4-Column Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-white/10">
          {/* Column 1: Brand & Identity */}
          <div className="space-y-3.5">
            <Link to="/" className="flex items-center gap-2.5 group select-none">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#00F0FF] via-[#0066FF] to-[#8A2BE2] p-[1.5px] shadow-[0_0_15px_rgba(0,102,255,0.4)] group-hover:scale-105 transition-all shrink-0">
                <div className="w-full h-full rounded-[10px] bg-[#080815] flex items-center justify-center">
                  <div className="flex items-center gap-[2px]">
                    <span className="w-0.5 h-2.5 rounded-full bg-[#00F0FF]" />
                    <span className="w-0.5 h-4 rounded-full bg-white shadow-[0_0_6px_#fff]" />
                    <span className="w-0.5 h-2.5 rounded-full bg-[#0066FF]" />
                  </div>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-display font-black text-lg text-white tracking-tight flex items-center gap-1.5">
                  <span className="bg-gradient-to-r from-[#00F0FF] to-[#0066FF] bg-clip-text text-transparent">808</span>
                  <span>BEAT STORE</span>
                </span>
                <span className="text-[8px] font-bold tracking-[0.2em] text-slate-400 uppercase -mt-0.5">
                  Industry Master Audio
                </span>
              </div>
            </Link>

            <p className="text-xs text-slate-400 leading-relaxed">
              Curated studio master hip-hop instrumentals with instantaneous commercial licensing and complete sync clearance.
            </p>

            {/* Official Active Social Links */}
            <div className="pt-2">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-2">
                Official Channels
              </div>
              <div className="flex items-center gap-2">
                {activeSocials.map((s) => (
                  <a
                    key={s.name}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-slate-300 transition-all ${s.color}`}
                    aria-label={s.name}
                  >
                    {s.icon}
                    <span>{s.name}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Column 2: Beat Store Catalog */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-widest text-white mb-4">
              Beat Store Catalog
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link to="/beats" className="hover:text-cyan-400 transition-colors">
                  Explore Beat Catalog
                </Link>
              </li>
              <li>
                <Link to="/licensing" className="hover:text-cyan-400 transition-colors">
                  License Rights & Pricing
                </Link>
              </li>
              <li>
                <Link to="/licensing-terms" className="hover:text-cyan-400 transition-colors">
                  Full Licensing Terms
                </Link>
              </li>
              <li>
                <Link to="/verify-license" className="hover:text-cyan-400 transition-colors">
                  Verify License Certificate
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Account & Support */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-widest text-white mb-4">
              Account & Legal
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link to="/account" className="hover:text-cyan-400 transition-colors">
                  Customer Account & Downloads
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-cyan-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-cyan-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-cyan-400 transition-colors">
                  Support & Custom Inquiries
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Payment & Security Settlement Verification */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-widest text-white mb-4">
              Security & Settlement
            </h4>
            <div className="p-4 rounded-2xl bg-[#0e1022] border border-white/10 space-y-2.5 text-xs shadow-lg">
              <div className="flex items-center gap-2 text-white font-bold">
                <Lock className="w-4 h-4 text-cyan-400" />
                <span>256-Bit SSL Encrypted</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Transactions securely settled via official Razorpay gateway with cryptographic HMAC validation and instant file release.
              </p>
              <div className="pt-2 border-t border-white/10 flex items-center gap-1.5 text-[11px] text-cyan-300 font-mono font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Settled via Razorpay • 100% Secure</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Verified Badges */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            &copy; {new Date().getFullYear()} {copyrightOwner} • 808 Beat Store. All musical master copyrights reserved.
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400 font-mono">
            <span>Non-Exclusive from ₹499</span>
            <span>•</span>
            <span>Exclusive ₹4,999</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
