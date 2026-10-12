import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, LogOut, Package, FileText, Settings, LogIn, ChevronDown } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useModalStore } from '../../store/useModalStore';

export function ProfileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated, logout } = useAuthStore();
  const { openAuthModal } = useModalStore();

  // Strict onClickOutside logic
  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSignOut = async () => {
    setIsOpen(false);
    await logout();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`p-2 sm:p-2.5 rounded-xl border flex items-center gap-1.5 transition-all active:scale-95 ${
          isOpen || isAuthenticated
            ? 'bg-surface-lighter text-electric-cyan border-electric-cyan/40 shadow-glow-blue/20'
            : 'text-slate-200 hover:text-white hover:bg-surface-light border-transparent hover:border-surface-border'
        }`}
        aria-label="User Account Menu"
        aria-expanded={isOpen}
      >
        <User className="w-5 h-5" strokeWidth={2.4} />
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 text-text-muted ${
            isOpen ? 'rotate-180 text-electric-cyan' : ''
          }`}
        />
      </button>

      {/* 3D Glassmorphism Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-56 rounded-2xl bg-[#090912]/95 border border-white/12 backdrop-blur-2xl shadow-[0_15px_40px_rgba(0,0,0,0.85)] py-2 z-50 animate-fade-in divide-y divide-white/10 select-none">
          {/* User Header */}
          <div className="px-4 py-2.5">
            <p className="text-xs font-semibold text-white truncate">
              {isAuthenticated ? user?.name || user?.email : 'Guest Explorer'}
            </p>
            <p className="text-[10px] font-mono text-electric-cyan truncate mt-0.5">
              {isAuthenticated ? user?.email : 'Browse & listen freely'}
            </p>
          </div>

          {/* Menu Items */}
          <div className="py-1.5 space-y-0.5">
            <Link
              to="/account"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Settings className="w-4 h-4 text-electric-cyan" />
              <span>My Account</span>
            </Link>

            <Link
              to="/account"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Package className="w-4 h-4 text-electric-cyan" />
              <span>Purchases / Library</span>
            </Link>

            <Link
              to="/licensing"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
            >
              <FileText className="w-4 h-4 text-electric-cyan" />
              <span>Licenses</span>
            </Link>
          </div>

          {/* Sign In or Sign Out Action */}
          <div className="pt-1.5 pb-1">
            {isAuthenticated ? (
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-left"
              >
                <LogOut className="w-4 h-4 text-red-400" />
                <span>Sign Out</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  openAuthModal('manual');
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-electric-cyan hover:text-white hover:bg-white/10 transition-colors text-left"
              >
                <LogIn className="w-4 h-4 text-electric-cyan" />
                <span>Sign In / Register</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
