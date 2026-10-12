import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Layers,
  ShoppingBag,
  DollarSign,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Search,
  FileText,
  ExternalLink,
  Printer,
} from 'lucide-react';
import { producerBrand, brandHelpers } from '@config/brand';
import { BeatDTO } from '@shared/types';
import { INDUSTRY_GENRES, INDUSTRY_MOODS, INDUSTRY_KEYS } from '../data/beatTaxonomy';
import { useAuthStore } from '../store/useAuthStore';
import { useModalStore } from '../store/useModalStore';
import { apiUrl } from '../config/api';

interface AdminDashboardPageProps {
  onNavigate?: (route: string) => void;
}

export function AdminDashboardPage({ onNavigate }: AdminDashboardPageProps) {
  const routerNavigate = useNavigate();
  const navigate = onNavigate || routerNavigate;
  const { token, user, isAdmin, isAuthenticated } = useAuthStore();
  const { openAuthModal } = useModalStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'beats' | 'orders' | 'licenses' | 'branding'>('overview');
  const [stats, setStats] = useState<any>(null);
  const [beats, setBeats] = useState<BeatDTO[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [licenses, setLicenses] = useState<any[]>([]);
  const [licenseSearch, setLicenseSearch] = useState('');
  const [brandingAudit, setBrandingAudit] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form states for adding beat
  const [isAddBeatOpen, setIsAddBeatOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newBpm, setNewBpm] = useState('138');
  const [newKey, setNewKey] = useState('C Minor');
  const [newGenre, setNewGenre] = useState('Trap');
  const [newMood, setNewMood] = useState('Dark');
  const [newStyle, setNewStyle] = useState('Modern 808 Trap');
  const [newDesc, setNewDesc] = useState('');
  const [newArtwork, setNewArtwork] = useState('');
  const [newAudioUrl, setNewAudioUrl] = useState('');
  const [newFeatured, setNewFeatured] = useState(false);

  const fetchAdminData = () => {
    if (!token) return;
    setIsLoading(true);
    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      fetch(apiUrl('/api/admin/overview'), { headers }).then((r) => r.json()),
      fetch(apiUrl('/api/admin/beats'), { headers }).then((r) => r.json()),
      fetch(apiUrl('/api/admin/orders'), { headers }).then((r) => r.json()),
      fetch(apiUrl('/api/admin/licenses'), { headers }).then((r) => r.json()),
      fetch(apiUrl('/api/branding')).then((r) => r.json()),
    ])
      .then(([statsRes, beatsRes, ordersRes, licRes, brandRes]) => {
        if (statsRes.success) setStats(statsRes.data);
        if (beatsRes.success) setBeats(beatsRes.data);
        if (ordersRes.success) setOrders(ordersRes.data);
        if (licRes.success) setLicenses(licRes.data);
        if (brandRes.success) setBrandingAudit(brandRes.data);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    if (isAdmin && token) {
      fetchAdminData();
    }
  }, [isAdmin, token]);

  // If visitor is not logged in as Admin, show restricted access portal
  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="pt-36 pb-28 px-4 max-w-lg mx-auto text-center">
        <div className="p-8 rounded-3xl bg-surface/90 border border-white/10 shadow-2xl backdrop-blur-xl">
          <div className="w-16 h-16 rounded-2xl bg-electric-violet/15 border border-electric-violet/30 text-electric-violet flex items-center justify-center mx-auto mb-5 shadow-glow-violet">
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Admin & Studio Access Only</h2>
          <p className="text-xs text-text-muted mt-2 leading-relaxed">
            This dashboard is restricted to the platform owner. Normal customers are restricted to listening, browsing, and buying beats.
          </p>

          <div className="mt-6 space-y-3">
            <button
              type="button"
              onClick={() => openAuthModal('admin')}
              className="w-full py-3.5 rounded-xl bg-electric-blue hover:bg-electric-blue/90 text-white text-xs font-bold uppercase tracking-wider shadow-glow-blue transition-all"
            >
              Sign In as Studio Owner / Admin
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-full py-3 rounded-xl bg-surface-light border border-surface-border text-text-muted hover:text-white text-xs font-semibold transition-all"
            >
              Return to Beat Store
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleCreateBeat = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(apiUrl('/api/admin/beats'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newTitle,
          bpm: parseInt(newBpm, 10),
          key: newKey,
          genre: newGenre,
          mood: newMood,
          style: newStyle,
          description: newDesc,
          featured: newFeatured,
          artwork: newArtwork.trim() || undefined,
          previewAudio: newAudioUrl.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsAddBeatOpen(false);
        setNewTitle('');
        setNewDesc('');
        setNewArtwork('');
        setNewAudioUrl('');
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleArchiveBeat = async (id: string) => {
    if (confirm('Archive this beat from the store?')) {
      await fetch(apiUrl(`/api/admin/beats/${id}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchAdminData();
    }
  };

  return (
    <div className="pt-28 pb-24 px-4 sm:px-6 max-w-7xl mx-auto">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-surface-border">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-electric-violet">
            <Shield className="w-4 h-4" />
            <span>Master Administration Portal</span>
          </div>
          <h1 className="text-3xl font-black text-white mt-1">Producer Control Center</h1>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-surface border border-surface-border overflow-x-auto">
          {(['overview', 'beats', 'orders', 'licenses', 'branding'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-electric-blue text-white shadow-glow-blue'
                  : 'text-text-muted hover:text-white'
              }`}
            >
              {tab === 'branding' ? 'Brand & Placeholders' : tab === 'licenses' ? 'License Agreements' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-8">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-surface border border-surface-border">
              <span className="text-[11px] font-mono uppercase text-text-subtle">Total Gross Revenue</span>
              <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1">
                ₹{stats.totalRevenue.toLocaleString()}
              </div>
              <span className="text-[10px] text-text-muted mt-1 block">Verified via Razorpay</span>
            </div>

            <div className="p-5 rounded-2xl bg-surface border border-surface-border">
              <span className="text-[11px] font-mono uppercase text-text-subtle">Completed Orders</span>
              <div className="text-2xl sm:text-3xl font-black text-white mt-1">
                {stats.totalOrders}
              </div>
              <span className="text-[10px] text-text-muted mt-1 block">Commercial clearances</span>
            </div>

            <div className="p-5 rounded-2xl bg-surface border border-surface-border">
              <span className="text-[11px] font-mono uppercase text-text-subtle">Active Beats Catalog</span>
              <div className="text-2xl sm:text-3xl font-black text-white mt-1">
                {stats.totalBeats}
              </div>
              <span className="text-[10px] text-electric-cyan mt-1 block">Strictly Hip-Hop</span>
            </div>

            <div className="p-5 rounded-2xl bg-surface border border-surface-border">
              <span className="text-[11px] font-mono uppercase text-text-subtle">Total Downloads</span>
              <div className="text-2xl sm:text-3xl font-black text-white mt-1">
                {stats.totalDownloads}
              </div>
              <span className="text-[10px] text-text-muted mt-1 block">WAV + MP3 Masters</span>
            </div>
          </div>

          {/* Recent Orders & Top Beats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="p-6 rounded-2xl bg-surface border border-surface-border">
              <h3 className="font-bold text-white text-base mb-4">Recent Verified Orders</h3>
              <div className="space-y-3">
                {stats.recentOrders?.map((ord: any) => (
                  <div
                    key={ord.id}
                    className="p-3 rounded-xl bg-surface-light border border-surface-border/60 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-white font-mono">{ord.orderNumber}</div>
                      <div className="text-text-subtle text-[11px]">{ord.customerEmail}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-white font-mono">₹{ord.total.toLocaleString()}</div>
                      <span className="px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                        {ord.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-surface border border-surface-border">
              <h3 className="font-bold text-white text-base mb-4">Top Performing Beats</h3>
              <div className="space-y-3">
                {stats.topBeats?.map((b: any) => (
                  <div
                    key={b.id}
                    className="p-3 rounded-xl bg-surface-light border border-surface-border/60 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <img src={b.artwork} alt={b.title} className="w-10 h-10 rounded-lg object-cover" />
                      <div>
                        <div className="font-bold text-white">{b.title}</div>
                        <div className="text-text-subtle text-[11px] font-mono">{b.bpm} BPM • {b.style}</div>
                      </div>
                    </div>
                    <div className="text-right font-mono">
                      <div className="font-bold text-electric-cyan">{b.salesCount} Sales</div>
                      <div className="text-text-subtle text-[10px]">{b.playsCount} Plays</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BEATS MANAGEMENT */}
      {activeTab === 'beats' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Beat Store Catalog ({beats.length})</h2>
            <button
              onClick={() => setIsAddBeatOpen(true)}
              className="px-4 py-2 rounded-xl bg-electric-blue hover:bg-electric-blue/90 text-white text-xs font-bold flex items-center gap-1.5 shadow-glow-blue transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Upload New Beat</span>
            </button>
          </div>

          {/* Add Beat Modal */}
          {isAddBeatOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <div className="w-full max-w-lg bg-surface border border-surface-border rounded-2xl p-6 shadow-2xl">
                <h3 className="font-bold text-white text-lg mb-4">Add New Hip-Hop Beat</h3>
                <form onSubmit={handleCreateBeat} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-text-muted mb-1">Beat Title *</label>
                    <input
                      type="text"
                      required
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="e.g. Renaissance Groove"
                      className="w-full bg-surface-light border border-surface-border rounded-xl px-3 py-2 text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-text-muted mb-1">Tempo (BPM) *</label>
                      <input
                        type="number"
                        required
                        min="50"
                        max="220"
                        value={newBpm}
                        onChange={(e) => setNewBpm(e.target.value)}
                        placeholder="e.g. 138"
                        className="w-full bg-surface-light border border-surface-border rounded-xl px-3 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-text-muted mb-1">Musical Key (Scale) *</label>
                      <select
                        value={newKey}
                        onChange={(e) => setNewKey(e.target.value)}
                        className="w-full bg-surface-light border border-surface-border rounded-xl px-3 py-2 text-white"
                      >
                        {INDUSTRY_KEYS.filter((k) => k !== 'All').map((k) => (
                          <option key={k} value={k}>{k}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-text-muted mb-1">Genre (शैली) *</label>
                      <select
                        value={newGenre}
                        onChange={(e) => setNewGenre(e.target.value)}
                        className="w-full bg-surface-light border border-surface-border rounded-xl px-3 py-2 text-white"
                      >
                        {INDUSTRY_GENRES.filter((g) => g.id !== 'All').map((g) => (
                          <option key={g.id} value={g.id}>{g.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-text-muted mb-1">Mood (Vibe) *</label>
                      <select
                        value={newMood}
                        onChange={(e) => setNewMood(e.target.value)}
                        className="w-full bg-surface-light border border-surface-border rounded-xl px-3 py-2 text-white"
                      >
                        {INDUSTRY_MOODS.filter((m) => m.id !== 'All').map((m) => (
                          <option key={m.id} value={m.name}>{m.emoji} {m.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-text-muted mb-1">Specific Sub-Style / Type Beat *</label>
                    <input
                      type="text"
                      required
                      value={newStyle}
                      onChange={(e) => setNewStyle(e.target.value)}
                      placeholder="e.g. Modern 808 Trap, Travis Scott Type Beat, UK Drill"
                      className="w-full bg-surface-light border border-surface-border rounded-xl px-3 py-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-text-muted mb-1">Audio Preview MP3 URL (or local file)</label>
                    <input
                      type="url"
                      value={newAudioUrl}
                      onChange={(e) => setNewAudioUrl(e.target.value)}
                      placeholder="https://.../beat.mp3 or /assets/audio/beat.mp3"
                      className="w-full bg-surface-light border border-surface-border rounded-xl px-3 py-2 text-white text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-text-muted mb-1">Cover Artwork Image URL</label>
                    <input
                      type="url"
                      value={newArtwork}
                      onChange={(e) => setNewArtwork(e.target.value)}
                      placeholder="https://images.unsplash.com/... or image link"
                      className="w-full bg-surface-light border border-surface-border rounded-xl px-3 py-2 text-white text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-text-muted mb-1">Description</label>
                    <textarea
                      rows={2}
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                      placeholder="Instrumentation, vibe, and artist inspiration..."
                      className="w-full bg-surface-light border border-surface-border rounded-xl p-3 text-white resize-none"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddBeatOpen(false)}
                      className="px-4 py-2 rounded-xl bg-surface-light text-text-muted hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-electric-blue text-white font-bold"
                    >
                      Save Beat
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Beats Table */}
          <div className="overflow-x-auto rounded-2xl border border-surface-border bg-surface/50">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-light text-text-subtle font-mono uppercase">
                <tr className="border-b border-surface-border">
                  <th className="py-3 px-4">Beat</th>
                  <th className="py-3 px-4">BPM / Key</th>
                  <th className="py-3 px-4">Style / Mood</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Plays / Sales</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/40">
                {beats.map((b) => (
                  <tr key={b.id} className="hover:bg-surface-light/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img src={b.artwork} alt={b.title} className="w-10 h-10 rounded-lg object-cover" />
                        <div>
                          <div className="font-bold text-white">{b.title}</div>
                          <div className="text-text-subtle text-[10px] font-mono">{b.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-text-muted">
                      {b.bpm} BPM • {b.key}
                    </td>
                    <td className="py-3 px-4 text-text-muted">
                      {b.style} / {b.mood}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                        b.status === 'PUBLISHED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-surface-lighter text-text-subtle'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-text-muted">
                      {b.playsCount} / {b.salesCount}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleArchiveBeat(b.id)}
                        className="text-text-subtle hover:text-rose-400 p-1"
                        aria-label="Archive Beat"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white">Commercial Order Ledger ({orders.length})</h2>
          <div className="overflow-x-auto rounded-2xl border border-surface-border bg-surface/50">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-light text-text-subtle font-mono uppercase">
                <tr className="border-b border-surface-border">
                  <th className="py-3 px-4">Order Number</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/40">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-surface-light/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-white">{ord.orderNumber}</td>
                    <td className="py-3 px-4">
                      <div className="text-white font-medium">{ord.customerName}</div>
                      <div className="text-text-subtle text-[10px]">{ord.customerEmail}</div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-electric-cyan">
                      ₹{ord.total.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold">
                        {ord.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-text-subtle">
                      {new Date(ord.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => navigate(`/order/success/${ord.id}`)}
                        className="text-xs text-electric-cyan hover:underline"
                      >
                        Delivery Vault
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: LICENSES & LEGAL AGREEMENTS */}
      {activeTab === 'licenses' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">Legal License Agreements ({licenses.length})</h2>
              <p className="text-xs text-text-muted mt-0.5">
                Cryptographically registered commercial rights certificates, SHA-256 integrity hashes, and Razorpay payment mappings.
              </p>
            </div>

            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-text-subtle absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={licenseSearch}
                onChange={(e) => setLicenseSearch(e.target.value)}
                placeholder="Search License ID, Email, Payment ID..."
                className="w-full bg-surface-light border border-surface-border rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-text-subtle font-mono focus:outline-none focus:border-electric-blue"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-surface-border bg-surface/50">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-light text-text-subtle font-mono uppercase">
                <tr className="border-b border-surface-border">
                  <th className="py-3 px-4">License ID</th>
                  <th className="py-3 px-4">Beat Title</th>
                  <th className="py-3 px-4">Licensee (Buyer)</th>
                  <th className="py-3 px-4">Payment Reference</th>
                  <th className="py-3 px-4">SHA-256 Hash</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/40">
                {licenses
                  .filter((lic) => {
                    if (!licenseSearch.trim()) return true;
                    const q = licenseSearch.toLowerCase();
                    return (
                      lic.licenseId?.toLowerCase().includes(q) ||
                      lic.buyerEmail?.toLowerCase().includes(q) ||
                      lic.buyerName?.toLowerCase().includes(q) ||
                      lic.beatTitle?.toLowerCase().includes(q) ||
                      lic.razorpayPaymentId?.toLowerCase().includes(q) ||
                      lic.orderNumber?.toLowerCase().includes(q)
                    );
                  })
                  .map((lic) => (
                    <tr key={lic.id} className="hover:bg-surface-light/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-white flex items-center gap-2">
                          <span>{lic.licenseId}</span>
                          <span
                            className={`px-2 py-0.2 rounded-full text-[9px] font-bold uppercase ${
                              lic.licenseType === 'EXCLUSIVE'
                                ? 'bg-electric-violet/20 text-electric-violet border border-electric-violet/40'
                                : 'bg-electric-blue/20 text-electric-cyan border border-electric-blue/40'
                            }`}
                          >
                            {lic.licenseType}
                          </span>
                        </div>
                        <div className="text-[10px] text-text-subtle font-mono mt-0.5">
                          Executed: {new Date(lic.issuedAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-bold text-white">
                        {lic.beatTitle}
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-white font-semibold">{lic.buyerName}</div>
                        <div className="text-text-subtle text-[11px] font-mono">{lic.buyerEmail}</div>
                      </td>
                      <td className="py-3 px-4 font-mono">
                        <div className="font-bold text-electric-cyan">₹{lic.amountPaid.toLocaleString()}</div>
                        <div className="text-[10px] text-text-subtle truncate max-w-[140px]">
                          Pay ID: {lic.razorpayPaymentId}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-[10px] text-text-subtle">
                        <span className="p-1 rounded bg-black/40 border border-white/5 inline-block max-w-[120px] truncate">
                          {lic.signatureHash}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={apiUrl(lic.viewUrl)}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-1.5 rounded-lg bg-surface-lighter hover:bg-surface-border text-white text-[11px] font-semibold flex items-center gap-1 transition-all"
                            title="Open Printable License Document"
                          >
                            <Printer className="w-3.5 h-3.5 text-electric-cyan" />
                            <span>PDF</span>
                          </a>
                          <button
                            onClick={() => navigate(lic.verifyUrl)}
                            className="px-2.5 py-1.5 rounded-lg bg-electric-blue/20 hover:bg-electric-blue/30 text-electric-cyan border border-electric-blue/30 text-[11px] font-semibold flex items-center gap-1 transition-all"
                            title="Open Public Verification Certificate"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Verify</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                {licenses.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-text-subtle">
                      No licenses have been issued yet. Complete a checkout purchase to generate the first legal license.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: BRANDING & PLACEHOLDER AUDIT (Requirements 83, 84, 85) */}
      {activeTab === 'branding' && brandingAudit && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-surface border border-surface-border space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-surface-border">
              <div>
                <h2 className="text-lg font-bold text-white">Centralized Producer Brand Configuration</h2>
                <p className="text-xs text-text-muted mt-0.5">
                  Audited fields: CONFIGURED, EMPTY, or PLACEHOLDER. Unresolved tokens are shielded by neutral fallbacks.
                </p>
              </div>

              <button
                onClick={fetchAdminData}
                className="px-3 py-1.5 rounded-xl bg-surface-light hover:bg-surface-border text-white text-xs font-semibold flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Re-scan Placeholders</span>
              </button>
            </div>

            {/* Audit List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(brandingAudit.audit || {}).map(([key, field]: [string, any]) => {
                const isPlaceholder = field.status === 'PLACEHOLDER';
                const isConfigured = field.status === 'CONFIGURED';

                return (
                  <div
                    key={key}
                    className="p-4 rounded-xl bg-surface-light/60 border border-surface-border flex items-start justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-mono font-bold text-white capitalize">{key}</div>
                      <div className="font-mono text-text-subtle text-[11px] mt-0.5 truncate max-w-[220px]">
                        Value: {field.value || '(null)'}
                      </div>
                      <div className="text-[10px] text-text-muted mt-1">
                        Fallback in UI: <strong className="text-electric-cyan">{field.fallback}</strong>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold uppercase ${
                        isConfigured
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : isPlaceholder
                          ? 'bg-sky-500/20 text-sky-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {field.status}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Safety Verification Badge */}
            <div className="p-4 rounded-xl bg-surface-lighter/70 border border-surface-border flex items-center gap-3 text-xs">
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <span className="font-bold text-white">Production Placeholder Protection Active</span>
                <p className="text-[11px] text-text-subtle">
                  Raw placeholder strings matching <code>\[[A-Z0-9_]+\]</code> are strictly prevented from appearing in customer-facing components.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
