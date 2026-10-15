import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingCart,
  Search,
  MoreVertical,
  X,
  User,
  Shield,
  LogOut,
  ChevronDown,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useModalStore } from '../../store/useModalStore';
import { openInstagram, openYouTube, OFFICIAL_SOCIALS } from '../../utils/deepLinks';

interface NavbarProps {
  currentRoute?: string;
  onNavigate?: (route: string) => void;
  onOpenSearch?: () => void;
}

function ProfileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated, isAdmin, logout } = useAuthStore();
  const { openAuthModal } = useModalStore();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isAuthenticated) {
    return (
      <button
        onClick={() => openAuthModal('manual')}
        className="flex items-center gap-1 sm:gap-1.5 px-2.5 py-1.5 sm:px-3.5 sm:py-1.5 rounded-xl bg-electric-blue text-white text-[11px] sm:text-xs font-bold hover:brightness-110 shadow-glow-blue active:scale-95 transition-all cursor-pointer whitespace-nowrap shrink-0"
        aria-label="Sign In"
      >
        <User className="w-3.5 h-3.5" />
        <span>Sign In</span>
      </button>
    );
  }

  return (
    <div className="relative shrink-0" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 sm:gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-xl bg-surface-light hover:bg-surface-border border border-white/10 text-white text-xs font-semibold transition-all cursor-pointer"
        aria-label="User Account Menu"
      >
        <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-tr from-electric-blue to-electric-cyan text-white text-[10px] sm:text-[11px] font-black flex items-center justify-center shrink-0">
          {user?.name ? user.name.charAt(0).toUpperCase() : user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
        </div>
        <span className="hidden sm:inline max-w-[80px] md:max-w-[110px] truncate text-slate-200">
          {user?.name || user?.email?.split('@')[0] || 'Account'}
        </span>
        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#0d0d1a]/95 border border-white/15 shadow-2xl backdrop-blur-2xl p-2 z-50 animate-fade-in text-xs space-y-1">
          <div className="px-3 py-2 border-b border-white/10 mb-1">
            <p className="font-bold text-white truncate">{user?.name || 'Producer / Artist'}</p>
            <p className="text-[11px] text-text-muted truncate">{user?.email}</p>
          </div>

          <button
            onClick={() => {
              setIsOpen(false);
              navigate('/account');
            }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-200 hover:text-white hover:bg-white/10 transition-colors text-left cursor-pointer"
          >
            <User className="w-4 h-4 text-electric-cyan" />
            <span>My Orders & Downloads</span>
          </button>

          {isAdmin && (
            <button
              onClick={() => {
                setIsOpen(false);
                navigate('/admin');
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-electric-violet hover:bg-electric-violet/10 transition-colors text-left font-semibold cursor-pointer"
            >
              <Shield className="w-4 h-4" />
              <span>Admin Management</span>
            </button>
          )}

          <div className="pt-1 border-t border-white/10">
            <button
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors text-left cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function Navbar({ currentRoute }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [headerSearchQuery, setHeaderSearchQuery] = useState('');

  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  const { items, toggleCart } = useCartStore();
  const { isAdmin, isAuthenticated } = useAuthStore();
  const { openAuthModal } = useModalStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-focus search input with virtual keyboard invocation when opened
  useEffect(() => {
    if (isSearchOpen) {
      const timer = setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
          searchInputRef.current.select?.();
        }
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [isSearchOpen]);

  // Close search and mobile drawer on route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
  }, [location.pathname]);

  // Click outside listener for search container
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (
        isSearchOpen &&
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isSearchOpen]);

  // Click outside listener for mobile drawer
  useEffect(() => {
    const handleOutsideMenuClick = (e: MouseEvent | TouchEvent) => {
      if (
        isMobileMenuOpen &&
        drawerRef.current &&
        !drawerRef.current.contains(e.target as Node) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(e.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideMenuClick);
    document.addEventListener('touchstart', handleOutsideMenuClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideMenuClick);
      document.removeEventListener('touchstart', handleOutsideMenuClick);
    };
  }, [isMobileMenuOpen]);

  const navLinks = [
    { label: 'Home', route: '/' },
    { label: 'Beat Store', route: '/beats' },
    { label: 'Licensing', route: '/licensing' },
    { label: 'About', route: '/about' },
    { label: 'Contact', route: '/contact' },
  ];

  const handleToggleSearch = () => {
    if (location.pathname === '/beats') {
      const el = document.getElementById('beat-search-input');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.focus();
      }
    } else {
      navigate('/beats?focus=true');
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = headerSearchQuery.trim();
    setIsSearchOpen(false);
    if (query) {
      navigate(`/beats?q=${encodeURIComponent(query)}&focus=true`);
    } else {
      navigate('/beats?focus=true');
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 backdrop-blur-[14px] border-b border-white/10 ${
          isScrolled
            ? 'py-2 bg-[#07070b]/95 shadow-[0_10px_35px_rgba(0,0,0,0.85)]'
            : 'py-2.5 sm:py-3 bg-[#07070b]/85 shadow-[0_4px_25px_rgba(0,0,0,0.5)]'
        }`}
      >
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 flex items-center justify-between gap-2 flex-nowrap w-full">
          {/* 1. Main Brand Logo: 808 Studio Emblem + Text */}
          <Link
            to="/"
            className="flex items-center gap-2 sm:gap-2.5 group select-none cursor-pointer shrink-0"
            aria-label="808 Beat Store Home"
          >
            {/* Professional 808 Studio Emblem */}
            <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-[#00F0FF] via-[#0066FF] to-[#8A2BE2] p-[1.5px] shadow-[0_0_18px_rgba(0,102,255,0.45)] group-hover:shadow-[0_0_26px_rgba(0,240,255,0.7)] group-hover:scale-105 transition-all duration-300 shrink-0">
              <div className="w-full h-full rounded-[10px] bg-[#080815] flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#00F0FF]/15 via-transparent to-[#8A2BE2]/15 pointer-events-none" />
                <div className="flex items-center gap-[2.5px] z-10 px-1">
                  <span className="w-0.5 sm:w-1 h-2 sm:h-3 rounded-full bg-[#00F0FF] animate-pulse" />
                  <span className="w-0.5 sm:w-1 h-3.5 sm:h-5 rounded-full bg-white shadow-[0_0_8px_#fff]" />
                  <span className="w-0.5 sm:w-1 h-2 sm:h-3 rounded-full bg-[#0066FF] animate-pulse" style={{ animationDelay: '0.3s' }} />
                </div>
              </div>
            </div>

            {/* Typography */}
            <div className="flex flex-col">
              <span className="font-display font-black text-sm sm:text-base md:text-lg tracking-tight text-white group-hover:text-electric-cyan transition-colors whitespace-nowrap flex items-center gap-1.5">
                <span className="bg-gradient-to-r from-[#00F0FF] via-[#38BDF8] to-[#0066FF] bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(0,240,255,0.3)]">
                  808
                </span>
                <span className="font-extrabold tracking-tight text-slate-100">
                  BEAT STORE
                </span>
              </span>
              <span className="hidden sm:inline-block text-[8px] font-bold tracking-[0.22em] text-slate-400 uppercase -mt-0.5">
                Beat Store
              </span>
            </div>
          </Link>

          {/* 2. Desktop Navigation Links (Centered, desktop screens md+) */}
          <nav className="hidden md:flex items-center gap-1 bg-surface/60 border border-surface-border/70 rounded-full px-4 py-1.5 backdrop-blur-md shrink-0">
            {navLinks.map((link) => (
              <NavLink
                key={link.route}
                to={link.route}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-electric-blue text-white shadow-glow-blue'
                      : 'text-text-muted hover:text-white hover:bg-surface-lighter'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* 3. Action Controls: Search, Cart, Sign In & Shifted 3-Dot Menu */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 flex-nowrap pr-1.5 sm:pr-0">
            {/* Interactive Search Bar Trigger (Opens auto-focused search interface) */}
            <button
              onClick={handleToggleSearch}
              className={`p-2 rounded-xl active:scale-95 transition-all cursor-pointer shrink-0 ${
                isSearchOpen
                  ? 'bg-electric-blue text-white shadow-glow-blue'
                  : 'text-slate-200 hover:text-white hover:bg-white/10'
              }`}
              aria-label="Search Beats"
              title="Search Beats"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-slate-100" strokeWidth={2.4} />
            </button>

            {/* Cart Badge Button */}
            <button
              onClick={toggleCart}
              className="relative p-2 rounded-xl text-slate-200 hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer shrink-0"
              aria-label="View Cart"
            >
              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-slate-100" strokeWidth={2.4} />
              {items.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-electric-blue text-white text-[9px] sm:text-[11px] font-extrabold flex items-center justify-center shadow-glow-blue animate-bounce">
                  {items.length}
                </span>
              )}
            </button>

            {/* Sign In / Profile Button */}
            <ProfileMenu />

            {/* Admin Badge Shortcut (Desktop only) */}
            {isAdmin && (
              <Link
                to="/admin"
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-electric-violet/20 border border-electric-violet/40 text-electric-violet text-xs font-bold hover:bg-electric-violet/30 transition-all cursor-pointer shrink-0"
              >
                <Shield className="w-4 h-4" strokeWidth={2.4} />
                <span>Admin</span>
              </Link>
            )}

            {/* 1. Mobile Three-Dot Menu Button - Shifted slightly inward with generous touch target */}
            <button
              ref={menuButtonRef}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-200 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 active:scale-95 transition-all cursor-pointer shrink-0 mr-1 sm:mr-0 ml-0.5"
              aria-label={isMobileMenuOpen ? "Close Menu" : "Open Navigation Menu"}
              title="Menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-white" strokeWidth={2.4} />
              ) : (
                <MoreVertical className="w-5 h-5 text-white" strokeWidth={2.4} />
              )}
            </button>
          </div>
        </div>

        {/* 3. FUNCTIONAL DROP-DOWN SEARCH BAR WITH IMMEDIATE KEYBOARD FOCUS */}
        {isSearchOpen && (
          <div
            ref={searchContainerRef}
            className="w-full bg-[#090915]/98 border-t border-b border-white/10 px-3.5 sm:px-6 py-3 shadow-[0_15px_35px_rgba(0,0,0,0.85)] backdrop-blur-2xl animate-fade-in"
          >
            <form onSubmit={handleSearchSubmit} className="max-w-3xl mx-auto flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-electric-cyan pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="search"
                  inputMode="search"
                  autoFocus
                  value={headerSearchQuery}
                  onChange={(e) => setHeaderSearchQuery(e.target.value)}
                  placeholder="Search by beat title, genre, mood, tempo..."
                  className="w-full bg-[#111224] border border-white/15 focus:border-electric-cyan rounded-xl pl-10 pr-9 py-2.5 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-electric-cyan shadow-inner transition-all"
                />
                {headerSearchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setHeaderSearchQuery('');
                      searchInputRef.current?.focus();
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                    aria-label="Clear Search Query"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-electric-blue hover:bg-electric-blue/90 text-white text-xs font-bold uppercase tracking-wider shrink-0 transition-all active:scale-95 shadow-glow-blue cursor-pointer flex items-center gap-1.5"
              >
                <span>Search</span>
                <ArrowRight className="w-3.5 h-3.5 hidden sm:inline" />
              </button>

              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 shrink-0 cursor-pointer"
                aria-label="Close Search Bar"
              >
                <X className="w-5 h-5" />
              </button>
            </form>
          </div>
        )}
      </header>

      {/* 1. MOBILE THREE-DOT DRAWER MENU WITH BACKDROP (Tapping outside dismisses automatically) */}
      {isMobileMenuOpen && (
        <>
          {/* Full-Screen Backdrop: Tapping anywhere outside immediately closes the menu */}
          <div
            className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm md:hidden animate-fade-in"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Menu Container */}
          <div
            ref={drawerRef}
            className="fixed top-[56px] sm:top-[62px] right-3 left-3 sm:left-auto sm:right-4 sm:w-80 z-50 md:hidden rounded-2xl border border-white/15 bg-[#0a0a16]/98 backdrop-blur-2xl p-4 shadow-[0_25px_60px_rgba(0,0,0,0.95)] space-y-3 animate-fade-in max-h-[calc(100vh-80px)] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/10 px-1">
              <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400">Navigation</span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
                aria-label="Close Menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Menu Links */}
            <nav className="space-y-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.route}
                  to={link.route}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `w-full flex items-center justify-between py-2.5 px-3.5 rounded-xl text-xs font-bold tracking-wide uppercase transition-all ${
                      isActive
                        ? 'bg-electric-blue text-white shadow-glow-blue'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`
                  }
                >
                  <span>{link.label}</span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </NavLink>
              ))}
            </nav>

            {/* Account / Sign In Status */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-text-muted px-1">
              {isAuthenticated ? (
                <Link
                  to="/account"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-1.5 text-white font-medium hover:text-electric-cyan"
                >
                  <User className="w-4 h-4" />
                  <span>My Orders & Account</span>
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    openAuthModal('manual');
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-electric-blue text-white font-bold"
                >
                  <User className="w-4 h-4" />
                  <span>Sign In</span>
                </button>
              )}

              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-1.5 text-electric-cyan font-medium hover:text-white"
                >
                  <Shield className="w-4 h-4" />
                  <span>Admin Portal</span>
                </Link>
              )}
            </div>

            {/* 2. RELOCATED SOCIAL MEDIA CHANNELS (YouTube & Instagram) */}
            <div className="pt-2.5 border-t border-white/10 space-y-2">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 px-1">
                Official Channels
              </div>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={OFFICIAL_SOCIALS.youtube.webUrl}
                  onClick={openYouTube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 py-2.5 px-2.5 rounded-xl bg-red-600/15 border border-red-500/25 text-red-400 hover:text-white hover:bg-red-600/25 text-xs font-semibold transition-all active:scale-95 cursor-pointer"
                  title="Open YouTube App"
                >
                  <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  <span>YouTube</span>
                </a>
                <a
                  href={OFFICIAL_SOCIALS.instagram.webUrl}
                  onClick={openInstagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 py-2.5 px-2.5 rounded-xl bg-pink-600/15 border border-pink-500/25 text-pink-400 hover:text-white hover:bg-pink-600/25 text-xs font-semibold transition-all active:scale-95 cursor-pointer"
                  title="Open Instagram App"
                >
                  <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  <span>Instagram</span>
                </a>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
