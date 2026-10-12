import React, { useEffect, useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Download,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Disc,
  FileText,
  RefreshCw,
  ExternalLink,
  Lock,
  Headphones,
  Music,
  ArrowRight,
} from 'lucide-react';
import { apiUrl } from '../config/api';
import { producerBrand, brandHelpers } from '@config/brand';

interface DownloadInfo {
  beatTitle: string;
  artwork: string;
  bpm: number;
  key: string;
  genre: string;
  assetType: string;
  assetLabel: string;
  filename: string;
  orderNumber: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  expiresAt: string;
  remainingSeconds: number;
  remainingDownloads: number;
  maxDownloads: number;
  downloadUrl: string;
}

interface DownloadPageProps {
  onNavigate?: (route: string) => void;
}

export function DownloadPage({ onNavigate }: DownloadPageProps) {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [downloadInfo, setDownloadInfo] = useState<DownloadInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number>(0);
  const [hasStartedDownload, setHasStartedDownload] = useState(false);

  const producerName = brandHelpers.getProducerName(producerBrand);

  const fetchDownloadInfo = () => {
    if (!token) {
      setIsLoading(false);
      setErrorMessage('Missing download authorization token. Please access your download via your order confirmation link.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    fetch(apiUrl(`/api/downloads/info/${token}`))
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error?.message || 'Download authorization failed. Payment not confirmed or token expired.');
        }
        setDownloadInfo(data.data);
        setSecondsLeft(data.data.remainingSeconds || 900);
      })
      .catch((err: any) => {
        setErrorMessage(err.message || 'Unable to verify download authorization.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchDownloadInfo();
  }, [token]);

  // Live countdown timer for the 15-minute expiration
  useEffect(() => {
    if (!downloadInfo || secondsLeft <= 0) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setErrorMessage('This time-limited download token has expired (15-minute window ended). Please request a refresh from your order page.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [downloadInfo, secondsLeft]);

  const formattedTimeLeft = useMemo(() => {
    const mins = Math.floor(secondsLeft / 60);
    const secs = secondsLeft % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }, [secondsLeft]);

  // Trigger download stream securely
  const handleTriggerDownload = () => {
    if (!downloadInfo) return;
    setHasStartedDownload(true);
    const downloadEndpoint = apiUrl(downloadInfo.downloadUrl);
    window.location.href = downloadEndpoint;
  };

  if (isLoading) {
    return (
      <div className="pt-32 pb-24 text-center max-w-md mx-auto px-4">
        <div className="w-14 h-14 rounded-full border-2 border-electric-blue border-t-transparent animate-spin mx-auto mb-4" />
        <h2 className="text-lg font-bold text-white mb-1">Verifying Master Audio Token...</h2>
        <p className="text-xs text-text-muted font-mono tracking-wider">
          Validating cryptographic signature & payment authorization...
        </p>
      </div>
    );
  }

  // Error / Access Denied State
  if (errorMessage || !downloadInfo) {
    return (
      <div className="pt-28 pb-24 px-4 sm:px-6 max-w-xl mx-auto text-center">
        <div className="p-8 rounded-3xl bg-surface border border-rose-500/30 shadow-2xl space-y-6">
          <div className="w-16 h-16 rounded-full bg-rose-500/15 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/10">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-mono font-bold uppercase tracking-wider mb-2">
              🚫 Access Denied • Verification Required
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Download Unauthorized
            </h1>
            <p className="text-xs sm:text-sm text-text-muted mt-2 max-w-md mx-auto leading-relaxed">
              {errorMessage || 'File delivery requires verified payment and an active time-limited cryptographic token.'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-surface-light border border-surface-border text-left font-mono text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-text-subtle">Security Status:</span>
              <span className="font-bold text-rose-400">UNAUTHORIZED / EXPIRED</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-subtle">Protection Policy:</span>
              <span className="font-bold text-white">HMAC SHA-256 Gate (15-Min Window)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-subtle">Direct Cloud URL:</span>
              <span className="font-bold text-emerald-400">HIDDEN 🔒 (Zero Public Leakage)</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={fetchDownloadInfo}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-electric-blue hover:bg-electric-blue/90 text-white text-xs font-bold transition-all shadow-md"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Verification</span>
            </button>
            <Link
              to="/checkout"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-surface-light hover:bg-surface-lighter text-text-muted hover:text-white text-xs font-bold transition-all border border-surface-border"
            >
              <span>Return to Checkout</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-24 px-4 sm:px-6 max-w-3xl mx-auto">
      {/* Header Banner */}
      <div className="text-center mb-8 space-y-3">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10 animate-bounce">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold uppercase tracking-wider">
          Payment Verified • One-Time Token Active
        </span>

        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Secure Master Download Vault
        </h1>

        <p className="text-xs sm:text-sm text-text-muted max-w-lg mx-auto">
          Your payment has been cryptographically confirmed. Your uncompressed studio master audio file is packaged and ready for high-speed download below.
        </p>
      </div>

      {/* Countdown & Security Status Pill */}
      <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-surface-border mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-surface-light border border-surface-border flex items-center justify-center text-amber-400 shrink-0">
            <Clock className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="text-xs text-text-subtle uppercase font-mono">Token Expiration Window</div>
            <div className="text-base font-black text-white font-mono flex items-center gap-2">
              <span className="text-amber-400">{formattedTimeLeft}</span>
              <span className="text-xs text-text-muted font-normal">(15-Minute One-Time Window)</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="px-3 py-1.5 rounded-xl bg-surface-light border border-surface-border text-text-muted">
            Downloads Left: <strong className="text-white">{downloadInfo.remainingDownloads}</strong> / {downloadInfo.maxDownloads}
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>SECURE STREAM</span>
          </div>
        </div>
      </div>

      {/* Track & Download Showcase Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-surface-light/80 to-surface border border-surface-border/90 shadow-2xl mb-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Artwork */}
          <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-surface-lighter shadow-lg border border-white/10 shrink-0 relative group">
            <img
              src={downloadInfo.artwork}
              alt={downloadInfo.beatTitle}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to placeholder avatar if image not found
                (e.currentTarget as HTMLImageElement).src = '/favicon.svg';
              }}
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Disc className="w-8 h-8 text-electric-cyan animate-spin" />
            </div>
          </div>

          {/* Track Details */}
          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-electric-blue/15 border border-electric-blue/30 text-[11px] font-mono text-electric-cyan">
              <Headphones className="w-3 h-3" />
              <span>{downloadInfo.assetLabel}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
              {downloadInfo.beatTitle}
            </h2>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
              <span className="px-2.5 py-1 rounded-lg bg-surface text-xs font-mono text-text-muted border border-surface-border">
                🎹 {downloadInfo.bpm} BPM
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-surface text-xs font-mono text-text-muted border border-surface-border">
                🎼 Key: {downloadInfo.key}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-surface text-xs font-mono text-text-muted border border-surface-border">
                🏷️ {downloadInfo.genre || 'Hip-Hop'}
              </span>
            </div>

            <div className="text-xs text-text-subtle font-mono pt-1">
              File: <span className="text-white font-semibold">{downloadInfo.filename}</span>
            </div>
          </div>
        </div>

        {/* Primary Action Button */}
        <div className="pt-4 border-t border-surface-border">
          <button
            onClick={handleTriggerDownload}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-electric-blue via-[#0052cc] to-electric-cyan hover:opacity-95 text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-3 transition-all shadow-[0_0_25px_rgba(0,102,255,0.4)] active:scale-[0.99]"
          >
            <Download className="w-5 h-5 animate-bounce" />
            <span>Download Studio Master File Now</span>
          </button>

          {hasStartedDownload && (
            <p className="text-[11px] text-emerald-400 text-center font-mono mt-2 animate-fade-in">
              ✓ Direct secure backend stream initiated. Check your browser downloads.
            </p>
          )}
        </div>
      </div>

      {/* Security & Commercial License Box */}
      <div className="p-5 rounded-2xl bg-surface border border-surface-border mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-surface-light flex items-center justify-center text-electric-cyan shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-white">Official Rights & Licensing Document</div>
            <div className="text-text-subtle text-[11px]">
              Order #{downloadInfo.orderNumber} • Commercial rights cleared by {producerName}
            </div>
          </div>
        </div>

        <Link
          to={`/order/success/${downloadInfo.orderId}`}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface-light hover:bg-surface-lighter text-white font-bold transition-all border border-surface-border"
        >
          <span>View License & Order</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Security FAQ / Note */}
      <div className="text-center text-xs text-text-subtle space-y-1">
        <p>🔒 <strong>Zero Direct Cloud Links:</strong> Files are delivered via encrypted backend streaming tokens.</p>
        <p>Need assistance with your audio stems or license certificate? Contact: <a href="mailto:808beatstore@gmail.com" className="text-electric-cyan underline">808beatstore@gmail.com</a></p>
      </div>
    </div>
  );
}
