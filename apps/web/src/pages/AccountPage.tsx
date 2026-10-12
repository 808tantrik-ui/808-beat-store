import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Package, Download, ShieldCheck, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { apiUrl } from '../config/api';

interface AccountPageProps {
  onNavigate?: (route: string) => void;
}

export function AccountPage({ onNavigate }: AccountPageProps) {
  const routerNavigate = useNavigate();
  const navigate = onNavigate || routerNavigate;
  const { user, token, isAuthenticated, logout, setAuth } = useAuthStore();

  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [orders, setOrders] = useState<any[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      setIsLoadingOrders(true);
      // Fetch customer orders
      const emailQuery = user?.email ? `?email=${encodeURIComponent(user.email)}` : '';
      fetch(apiUrl(`/api/orders${emailQuery}`), {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
        .then((r) => r.json())
        .then((res) => {
          if (res.success && res.data) {
            setOrders(res.data);
          }
        })
        .catch(console.error)
        .finally(() => setIsLoadingOrders(false));
    }
  }, [isAuthenticated, token, user?.email]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/register';
    const body = authMode === 'login' ? { email, password } : { email, password, name };

    try {
      const res = await fetch(apiUrl(endpoint), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Authentication failed');
      }

      setAuth(data.data.token, data.data.user);
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="pt-32 pb-24 px-4 max-w-md mx-auto">
        <div className="bg-surface p-6 sm:p-8 rounded-2xl border border-surface-border shadow-2xl space-y-6">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-surface-light border border-surface-border text-electric-cyan flex items-center justify-center mx-auto mb-3">
              <User className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black text-white">
              {authMode === 'login' ? 'Customer Account' : 'Create Account'}
            </h1>
            <p className="text-xs text-text-muted mt-1">
              Access your purchased beats, master audio files, and legal license agreements.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {authMode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1 uppercase tracking-wider">
                  Full Name / Artist Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Kendrick / Producer"
                  className="w-full bg-surface-light border border-surface-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-electric-blue"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1 uppercase tracking-wider">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="artist@music.com"
                className="w-full bg-surface-light border border-surface-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-electric-blue"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1 uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-surface-light border border-surface-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-electric-blue"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-electric-blue hover:bg-electric-blue/90 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider shadow-glow-blue transition-all"
            >
              {isSubmitting ? 'Please wait...' : authMode === 'login' ? 'Sign In' : 'Register Account'}
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-text-muted border-t border-surface-border">
            {authMode === 'login' ? (
              <p>
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  onClick={() => setAuthMode('register')}
                  className="text-electric-cyan font-bold hover:underline"
                >
                  Create one
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className="text-electric-cyan font-bold hover:underline"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-24 px-4 sm:px-6 max-w-5xl mx-auto">
      {/* Account Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-surface-border">
        <div>
          <span className="text-[10px] font-mono text-electric-cyan uppercase">Verified Artist Portal</span>
          <h1 className="text-2xl sm:text-3xl font-black text-white">{user?.name || 'Customer Account'}</h1>
          <p className="text-xs text-text-muted mt-0.5">{user?.email}</p>
        </div>

        <div className="flex items-center gap-3">
          {user?.role === 'ADMIN' && (
            <button
              onClick={() => navigate('/admin')}
              className="px-4 py-2 rounded-xl bg-electric-violet text-white text-xs font-bold shadow-glow-violet transition-all"
            >
              Admin Portal
            </button>
          )}

          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface-light hover:bg-surface-border text-white text-xs font-semibold border border-surface-border transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Orders & Purchases List */}
      <div className="space-y-6">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Package className="w-5 h-5 text-electric-cyan" />
          <span>Purchased Beats & Download Vault</span>
        </h2>

        {orders.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-surface border border-surface-border">
            <Package className="w-10 h-10 text-text-subtle mx-auto mb-3" />
            <h3 className="font-bold text-white text-base">No orders yet</h3>
            <p className="text-xs text-text-muted mt-1 max-w-sm mx-auto">
              Any beats you purchase will be permanently accessible here with instantaneous download links.
            </p>
            <button
              onClick={() => navigate('/beats')}
              className="mt-4 px-5 py-2.5 rounded-xl bg-electric-blue text-white text-xs font-bold"
            >
              Explore Catalog
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((ord) => (
              <div
                key={ord.id}
                className="p-5 rounded-2xl bg-surface/70 border border-surface-border space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-surface-border/60 text-xs">
                  <div>
                    <span className="font-mono font-bold text-white text-sm">{ord.orderNumber}</span>
                    <span className="text-text-subtle ml-2">
                      {new Date(ord.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[11px] font-bold">
                      {ord.status}
                    </span>
                    <span className="font-bold text-white font-mono text-sm">
                      ₹{ord.total.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Items in order */}
                <div className="space-y-2">
                  {ord.items?.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-white">{item.beatTitle}</span>
                        <span className="text-text-muted ml-2 font-mono">({item.licenseName})</span>
                      </div>
                      <span className="font-mono text-white">₹{item.price.toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    onClick={() => navigate(`/order/success/${ord.id}`)}
                    className="px-4 py-2 rounded-xl bg-surface-lighter hover:bg-surface-border text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
                  >
                    <Download className="w-3.5 h-3.5 text-electric-cyan" />
                    <span>Access Files & License</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
