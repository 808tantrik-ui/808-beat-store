import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  XCircle,
  FileText,
  Lock,
  ExternalLink,
  Printer,
  Calendar,
  User,
  Music2,
  CreditCard,
  Hash,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { apiUrl } from '../config/api';

interface LicenseVerificationData {
  isValid: boolean;
  licenseId: string;
  beatId: string;
  beatTitle: string;
  licenseType: 'NON_EXCLUSIVE' | 'EXCLUSIVE';
  licenseDisplayName: string;
  buyerName: string;
  buyerEmailMasked: string;
  amountPaid: number;
  currency: string;
  razorpayPaymentId: string;
  razorpayOrderId: string;
  issuedAt: string;
  purchasedAtIST: string;
  signatureHash: string;
  termsVersion: string;
  producerName: string;
  copyrightOwner: string;
  viewDocumentUrl: string;
}

export function VerifyLicensePage() {
  const { licenseId: paramLicenseId } = useParams<{ licenseId?: string }>();
  const navigate = useNavigate();

  const [searchInput, setSearchInput] = useState(paramLicenseId || '');
  const [data, setData] = useState<LicenseVerificationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleVerify = async (idToVerify: string) => {
    const cleanId = idToVerify.trim();
    if (!cleanId) return;

    setIsLoading(true);
    setError(null);
    setData(null);
    setHasSearched(true);

    try {
      const res = await fetch(apiUrl(`/api/licenses/verify/${encodeURIComponent(cleanId)}`));
      const json = await res.json();

      if (res.ok && json.success) {
        setData(json.data);
      } else {
        setError(json.error?.message || `No license record found matching ID "${cleanId}".`);
      }
    } catch (err: any) {
      setError(err.message || 'Unable to connect to license verification registry.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (paramLicenseId) {
      setSearchInput(paramLicenseId);
      handleVerify(paramLicenseId);
    }
  }, [paramLicenseId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/verify-license/${encodeURIComponent(searchInput.trim())}`);
      handleVerify(searchInput.trim());
    }
  };

  return (
    <div className="pt-28 pb-24 px-4 sm:px-6 max-w-4xl mx-auto">
      {/* Back button */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-xs font-semibold text-text-muted hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Beat Store</span>
      </Link>

      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-electric-blue/15 border border-electric-blue/30 text-electric-cyan text-xs font-semibold uppercase tracking-wider mb-3">
          <ShieldCheck className="w-4 h-4" />
          <span>Cryptographic Rights Registry</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          License Verification Authority
        </h1>

        <p className="text-xs sm:text-sm text-text-muted mt-2">
          Verify authentic commercial usage clearance, master assignment certificates, and SHA-256 integrity hashes issued by the Beat Store.
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-surface/80 border border-surface-border rounded-2xl p-4 sm:p-6 mb-10 shadow-xl backdrop-blur-md">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-5 h-5 text-text-subtle absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Enter License ID (e.g. 808T-2026-000001)"
              className="w-full bg-surface-light border border-surface-border rounded-xl pl-12 pr-4 py-3.5 text-sm text-white placeholder-text-subtle font-mono focus:outline-none focus:border-electric-blue focus:ring-1 focus:ring-electric-blue transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !searchInput.trim()}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-electric-blue hover:bg-electric-blue/90 disabled:opacity-50 text-white text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 shadow-glow-blue transition-all shrink-0"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Verify License</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Verification Results */}
      {isLoading && (
        <div className="py-16 text-center">
          <div className="w-12 h-12 rounded-full border-2 border-electric-cyan border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-xs font-mono uppercase tracking-widest text-electric-cyan">
            Querying Master Certificate Ledger...
          </p>
        </div>
      )}

      {error && !isLoading && (
        <div className="p-8 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-center max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-3">
            <XCircle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">License Verification Failed</h3>
          <p className="text-xs text-rose-300 leading-relaxed mb-4">{error}</p>
          <div className="text-[11px] text-text-subtle font-mono">
            Ensure you entered the full identifier formatted as <code>808T-YYYY-XXXXXX</code>.
          </div>
        </div>
      )}

      {data && !isLoading && (
        <div className="space-y-6 animate-fade-in">
          {/* Certificate Validity Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-surface to-emerald-950/30 border border-emerald-500/40 shadow-xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest">
                      Authentic Certificate
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                      ACTIVE & VALID
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                    {data.licenseId}
                  </h2>
                </div>
              </div>

              <a
                href={apiUrl(data.viewDocumentUrl)}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2.5 rounded-xl bg-electric-blue hover:bg-electric-blue/90 text-white text-xs font-bold flex items-center gap-2 shadow-glow-blue transition-all shrink-0"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>View Official License PDF</span>
              </a>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Beat & Licensing Rights */}
            <div className="p-6 rounded-2xl bg-surface border border-surface-border space-y-4">
              <h4 className="text-xs font-mono uppercase tracking-widest text-electric-cyan flex items-center gap-2">
                <Music2 className="w-4 h-4" />
                <span>Licensed Musical Composition</span>
              </h4>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-text-subtle uppercase text-[10px] block">Master Beat Title</span>
                  <span className="text-base font-bold text-white">{data.beatTitle}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-surface-border/60">
                  <div>
                    <span className="text-text-subtle uppercase text-[10px] block">License Tier</span>
                    <span className="font-bold text-white">{data.licenseDisplayName}</span>
                  </div>
                  <div>
                    <span className="text-text-subtle uppercase text-[10px] block">Rights Tier</span>
                    <span className={`font-bold ${data.licenseType === 'EXCLUSIVE' ? 'text-electric-violet' : 'text-electric-cyan'}`}>
                      {data.licenseType}
                    </span>
                  </div>
                </div>

                <div className="pt-1 border-t border-surface-border/60">
                  <span className="text-text-subtle uppercase text-[10px] block">Producer & Copyright Administrator</span>
                  <span className="text-text-muted">{data.producerName} ({data.copyrightOwner})</span>
                </div>
              </div>
            </div>

            {/* Grantee & Verification Timeline */}
            <div className="p-6 rounded-2xl bg-surface border border-surface-border space-y-4">
              <h4 className="text-xs font-mono uppercase tracking-widest text-electric-cyan flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>Licensee & Issuance Record</span>
              </h4>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-text-subtle uppercase text-[10px] block">Licensed Grantee (Artist / Entity)</span>
                  <span className="text-base font-bold text-white">{data.buyerName}</span>
                  <span className="text-text-subtle text-[11px] block">{data.buyerEmailMasked}</span>
                </div>

                <div className="pt-1 border-t border-surface-border/60">
                  <span className="text-text-subtle uppercase text-[10px] block">Execution Timestamp (IST)</span>
                  <span className="font-mono text-white flex items-center gap-1.5 mt-0.5">
                    <Calendar className="w-3.5 h-3.5 text-text-subtle" />
                    <span>{data.purchasedAtIST}</span>
                  </span>
                </div>

                <div className="pt-1 border-t border-surface-border/60">
                  <span className="text-text-subtle uppercase text-[10px] block">Payment Gateway Reference</span>
                  <span className="font-mono text-text-muted flex items-center gap-1.5 mt-0.5">
                    <CreditCard className="w-3.5 h-3.5 text-text-subtle" />
                    <span>{data.razorpayPaymentId}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Cryptographic SHA-256 Signature Card */}
          <div className="p-6 rounded-2xl bg-surface-light border border-surface-border space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono uppercase tracking-widest text-text-muted flex items-center gap-2">
                <Lock className="w-4 h-4 text-electric-cyan" />
                <span>SHA-256 Digital Verification Hash</span>
              </h4>
              <span className="text-[10px] text-text-subtle font-mono">Standard Version {data.termsVersion}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 font-mono text-xs text-electric-cyan break-all">
              {data.signatureHash}
            </div>

            <p className="text-[11px] text-text-subtle leading-relaxed">
              This signature is mathematically derived from the immutable transaction parameters (License ID, Beat ID, Artist Name, Payment ID, and Timestamp). Any modification invalidates this certificate.
            </p>
          </div>
        </div>
      )}

      {/* Default State Instructions */}
      {!hasSearched && (
        <div className="p-8 rounded-2xl bg-surface/40 border border-surface-border text-center text-xs text-text-muted space-y-2">
          <p className="font-semibold text-white">How License Verification Works</p>
          <p className="max-w-md mx-auto leading-relaxed">
            Every beat purchase processed via Razorpay generates a unique sequential License ID (<code>808T-YYYY-000001</code>) with cryptographic SHA-256 checksum validation for commercial streaming distribution and sync clearance.
          </p>
        </div>
      )}
    </div>
  );
}
