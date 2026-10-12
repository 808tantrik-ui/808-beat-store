import React, { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { StickyAudioPlayer } from './components/player/StickyAudioPlayer';
import { CartDrawer } from './components/cart/CartDrawer';
import { LicenseModal } from './components/ui/LicenseModal';
import { AuthModal } from './components/auth/AuthModal';
import { GlowingCursor } from './components/ui/GlowingCursor';
import { HomePage } from './pages/HomePage';
import { BeatDTO, LicenseDTO } from '@shared/types';
import { useAuthStore } from './store/useAuthStore';
import { useModalStore } from './store/useModalStore';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { apiUrl } from './config/api';
import { FALLBACK_BEATS, FALLBACK_LICENSES } from './data/fallbackData';
import { AlertTriangle, RefreshCw, Loader2 } from 'lucide-react';

// Code-split secondary pages for instant initial bundle loading
const BeatStorePage = lazy(() => import('./pages/BeatStorePage').then(m => ({ default: m.BeatStorePage })));
const BeatDetailPage = lazy(() => import('./pages/BeatDetailPage').then(m => ({ default: m.BeatDetailPage })));
const LicensingPage = lazy(() => import('./pages/LicensingPage').then(m => ({ default: m.LicensingPage })));
const LicensingTermsPage = lazy(() => import('./pages/LicensingTermsPage').then(m => ({ default: m.LicensingTermsPage })));
const CartPage = lazy(() => import('./pages/CartPage').then(m => ({ default: m.CartPage })));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage').then(m => ({ default: m.CheckoutPage })));
const OrderSuccessPage = lazy(() => import('./pages/OrderSuccessPage').then(m => ({ default: m.OrderSuccessPage })));
const DownloadPage = lazy(() => import('./pages/DownloadPage').then(m => ({ default: m.DownloadPage })));
const AccountPage = lazy(() => import('./pages/AccountPage').then(m => ({ default: m.AccountPage })));
const AboutPage = lazy(() => import('./pages/AboutPage').then(m => ({ default: m.AboutPage })));
const ContactPage = lazy(() => import('./pages/ContactPage').then(m => ({ default: m.ContactPage })));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage').then(m => ({ default: m.PrivacyPage })));
const TermsPage = lazy(() => import('./pages/TermsPage').then(m => ({ default: m.TermsPage })));
const VerifyLicensePage = lazy(() => import('./pages/VerifyLicensePage').then(m => ({ default: m.VerifyLicensePage })));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage').then(m => ({ default: m.AdminDashboardPage })));

function PageFallback() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-8">
      <Loader2 className="w-8 h-8 text-electric-blue animate-spin mb-3" />
      <span className="text-xs text-text-muted font-mono tracking-wider">Loading...</span>
    </div>
  );
}

/**
 * Idiomatic React Router helper: Automatically scrolls window to top on route change.
 */
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, checkAuth } = useAuthStore();
  const { activeLicenseBeat, closeLicenseModal, openLicenseModal, openAuthModal } = useModalStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Backward compatibility for hash URLs (e.g. bookmarks or legacy links '#/beats')
  useEffect(() => {
    if (window.location.hash.startsWith('#/')) {
      const cleanPath = window.location.hash.replace(/^#/, '');
      navigate(cleanPath, { replace: true });
    }
  }, [navigate]);

  // Fetch beats catalog with React Query
  const {
    data: beats = FALLBACK_BEATS,
    isLoading: isBeatsLoading,
    isError: isBeatsError,
    refetch: refetchBeats,
  } = useQuery<BeatDTO[]>({
    queryKey: ['beats'],
    queryFn: async () => {
      try {
        const res = await fetch(apiUrl('/api/beats?limit=50'));
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data.data?.beats && data.data.beats.length > 0) {
          return data.data.beats;
        }
        return FALLBACK_BEATS;
      } catch {
        return FALLBACK_BEATS;
      }
    },
    initialData: FALLBACK_BEATS,
    retry: 1,
  });

  // Fetch licenses with React Query
  const {
    data: licenses = FALLBACK_LICENSES,
    isError: isLicensesError,
    refetch: refetchLicenses,
  } = useQuery<LicenseDTO[]>({
    queryKey: ['licenses'],
    queryFn: async () => {
      try {
        const res = await fetch(apiUrl('/api/licenses'));
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data.data && data.data.length > 0) {
          return data.data;
        }
        return FALLBACK_LICENSES;
      } catch {
        return FALLBACK_LICENSES;
      }
    },
    initialData: FALLBACK_LICENSES,
    retry: 1,
  });

  const handleRetryAll = () => {
    refetchBeats();
    refetchLicenses();
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-text selection:bg-electric-blue selection:text-white relative overflow-x-hidden">
      {/* Scroll restoration */}
      <ScrollToTop />

      {/* Global Hip-Hop Studio Background Layer (Acoustic Panels, Film Grain & Electric-Blue Glows) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10 select-none bg-studio-panels" aria-hidden="true">
        {/* Top-Left: Soft Electric Blue Radial Studio Glow (Static) */}
        <div
          className="absolute -top-[10%] -left-[10%] w-[55vw] h-[55vw] max-w-[700px] max-h-[700px] rounded-full bg-[#0066FF] opacity-[0.09] blur-[140px] transform-gpu"
        />
        {/* Mid-Right: Subtle Electric Blue Diffuser Glow */}
        <div
          className="absolute top-[35%] -right-[10%] w-[45vw] h-[45vw] max-w-[600px] max-h-[600px] rounded-full bg-[#0066FF] opacity-[0.06] blur-[150px] transform-gpu"
        />
        {/* Bottom-Left: Electric Blue Bottom Glow */}
        <div
          className="absolute -bottom-[12%] -left-[5%] w-[50vw] h-[50vw] max-w-[650px] max-h-[650px] rounded-full bg-[#0066FF] opacity-[0.08] blur-[160px] transform-gpu"
        />
        {/* Light Film Grain Overlay (2-3%) */}
        <div className="absolute inset-0 bg-film-grain pointer-events-none" />
      </div>

      {/* Desktop Glowing Cursor */}
      <GlowingCursor />

      {/* Modern Accessible Navigation Header */}
      <Navbar
        currentRoute={location.pathname}
        onNavigate={navigate}
        onOpenSearch={() => navigate('/beats')}
      />

      {/* Backend Connection Error Banner (only shown if zero beats available) */}
      {isBeatsError && beats.length === 0 && (
        <div className="bg-amber-500/10 border-b border-amber-500/30 px-4 py-3 relative z-30 text-amber-200">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>API Server Unavailable:</strong> Could not connect to the backend API. If deployed on Netlify, ensure your backend is hosted (Render/Railway) and <code>VITE_API_URL</code> is set in Netlify environment variables.
              </span>
            </div>
            <button
              onClick={handleRetryAll}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-semibold transition-colors shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Connection</span>
            </button>
          </div>
        </div>
      )}

      {/* Declarative React Router Pages */}
      <main className="flex-1 relative z-10">
        <ErrorBoundary>
          <Suspense fallback={<PageFallback />}>
            <Routes>
              <Route
                path="/"
                element={
                  <HomePage
                    beats={beats}
                    licenses={licenses}
                    onNavigate={navigate}
                    onOpenLicenseModal={openLicenseModal}
                  />
                }
              />
              <Route
                path="/beats"
                element={
                  <BeatStorePage
                    beats={beats}
                    onNavigate={navigate}
                    onOpenLicenseModal={openLicenseModal}
                  />
                }
              />
              <Route
                path="/beats/:slug"
                element={
                  <BeatDetailPage
                    onNavigate={navigate}
                    onOpenLicenseModal={openLicenseModal}
                  />
                }
              />
              <Route
                path="/licensing"
                element={<LicensingPage licenses={licenses} onNavigate={navigate} />}
              />
              <Route
                path="/licensing-terms"
                element={<LicensingTermsPage onNavigate={navigate} />}
              />
              <Route path="/cart" element={<CartPage onNavigate={navigate} />} />
              <Route path="/checkout" element={<CheckoutPage onNavigate={navigate} />} />
              <Route
                path="/order/success/:orderId"
                element={<OrderSuccessPage onNavigate={navigate} />}
              />
              <Route path="/download" element={<DownloadPage onNavigate={navigate} />} />
              <Route path="/account" element={<AccountPage onNavigate={navigate} />} />
              <Route path="/about" element={<AboutPage onNavigate={navigate} />} />
              <Route path="/contact" element={<ContactPage onNavigate={navigate} />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/verify-license" element={<VerifyLicensePage />} />
              <Route path="/verify-license/:licenseId" element={<VerifyLicensePage />} />
              <Route path="/admin" element={<AdminDashboardPage onNavigate={navigate} />} />
              <Route path="/admin/*" element={<AdminDashboardPage onNavigate={navigate} />} />

              {/* Catch-all redirect to Home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>

      {/* Semantic Footer */}
      <Footer onNavigate={navigate} />

      {/* Global Sticky Bottom Audio Player */}
      <StickyAudioPlayer onOpenLicenseModal={openLicenseModal} />

      {/* Slide-in Cart Drawer */}
      <CartDrawer
        onNavigateCart={() => navigate('/cart')}
        onNavigateCheckout={() => navigate('/checkout')}
      />

      {/* Quick License Selector Modal */}
      <LicenseModal
        beat={activeLicenseBeat}
        onClose={closeLicenseModal}
        onNavigateCheckout={() => navigate('/checkout')}
      />

      {/* Glassmorphic Sign-In / Register Modal */}
      <AuthModal />
    </div>
  );
}
