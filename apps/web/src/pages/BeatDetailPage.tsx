import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Play,
  Pause,
  ShoppingCart,
  Check,
  ShieldCheck,
  Share2,
  Layers,
  ArrowLeft,
  Volume2,
} from 'lucide-react';
import { producerBrand, brandHelpers } from '@config/brand';
import { BeatDTO, LicenseDTO } from '@shared/types';
import { useAudioStore } from '../store/useAudioStore';
import { useCartStore } from '../store/useCartStore';
import { useModalStore } from '../store/useModalStore';
import { AudioWaveform } from '../components/player/AudioWaveform';
import { apiUrl } from '../config/api';
import { FALLBACK_BEATS } from '../data/fallbackData';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface BeatDetailPageProps {
  slug?: string;
  onNavigate?: (route: string) => void;
  onOpenLicenseModal?: (beat: BeatDTO) => void;
}

export function BeatDetailPage({ slug: propSlug, onNavigate, onOpenLicenseModal }: BeatDetailPageProps) {
  const params = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { openLicenseModal } = useModalStore();
  const slug = propSlug || params.slug || '';

  const handleNavigate = (route: string) => {
    if (onNavigate) {
      onNavigate(route);
    } else {
      navigate(route);
    }
  };
  const [beat, setBeat] = useState<BeatDTO | null>(null);
  const [relatedBeats, setRelatedBeats] = useState<BeatDTO[]>([]);
  const [selectedLicenseId, setSelectedLicenseId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const currentTrack = useAudioStore((s) => s.currentTrack);
  const isPlaying = useAudioStore((s) => s.isPlaying);
  const playTrack = useAudioStore((s) => s.playTrack);
  const pauseTrack = useAudioStore((s) => s.pauseTrack);
  const { addItem } = useCartStore();

  const producerName = brandHelpers.getProducerName(producerBrand);

  const fetchBeatDetail = () => {
    if (!slug) return;
    setIsLoading(true);
    setErrorMessage(null);
    fetch(apiUrl(`/api/beats/${slug}`))
      .then(async (r) => {
        if (!r.ok) {
          throw new Error(`Failed to load beat details (HTTP ${r.status})`);
        }
        return r.json();
      })
      .then((res) => {
        if (res.success && res.data) {
          setBeat(res.data);
          setRelatedBeats(res.data.relatedBeats || []);
          if (res.data.availableLicenses?.[0]) {
            setSelectedLicenseId(res.data.availableLicenses[0].id);
          }
        } else {
          const fallback = FALLBACK_BEATS.find((b: any) => b.slug === slug || b.id === slug);
          if (fallback) {
            setBeat(fallback as any);
            setRelatedBeats(FALLBACK_BEATS.filter((b: any) => b.id !== fallback.id).slice(0, 3) as any);
            if (fallback.availableLicenses?.[0]) {
              setSelectedLicenseId(fallback.availableLicenses[0].id);
            }
          } else {
            setErrorMessage(res.error?.message || 'Beat not found');
          }
        }
      })
      .catch((err) => {
        console.error(err);
        const fallback = FALLBACK_BEATS.find((b: any) => b.slug === slug || b.id === slug);
        if (fallback) {
          setBeat(fallback as any);
          setRelatedBeats(FALLBACK_BEATS.filter((b: any) => b.id !== fallback.id).slice(0, 3) as any);
          if (fallback.availableLicenses?.[0]) {
            setSelectedLicenseId(fallback.availableLicenses[0].id);
          }
        } else {
          setErrorMessage(err.message || 'Unable to connect to the audio server. Please check your connection or backend URL.');
        }
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchBeatDetail();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="pt-32 pb-24 text-center">
        <div className="w-12 h-12 rounded-full border-2 border-electric-blue border-t-transparent animate-spin mx-auto mb-4" />
        <p className="text-xs text-text-muted font-mono uppercase tracking-widest">Loading Master Instrumental...</p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="pt-32 pb-24 text-center max-w-md mx-auto px-4">
        <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-4 border border-amber-500/30">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Error Loading Beat</h2>
        <p className="text-xs text-text-muted mb-6 leading-relaxed">{errorMessage}</p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={fetchBeatDetail}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-electric-blue hover:bg-electric-blue/90 text-white text-xs font-bold transition-all shadow-glow-blue"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Connection</span>
          </button>
          <Link
            to="/beats"
            className="inline-block px-5 py-2.5 rounded-xl bg-surface-light border border-surface-border text-white text-xs font-bold hover:bg-surface-lighter transition-all"
          >
            Back to Beats
          </Link>
        </div>
      </div>
    );
  }

  if (!beat) {
    return (
      <div className="pt-32 pb-24 text-center max-w-md mx-auto px-4">
        <h2 className="text-xl font-bold text-white mb-2">Beat Not Found</h2>
        <p className="text-xs text-text-muted mb-6">The requested hip-hop beat does not exist or has been archived.</p>
        <Link
          to="/beats"
          className="inline-block px-5 py-2.5 rounded-xl bg-electric-blue text-white text-xs font-bold"
        >
          Return to Beat Store
        </Link>
      </div>
    );
  }

  const isCurrentPlaying = currentTrack?.id === beat.id && isPlaying;
  const activeLicense = beat.availableLicenses?.find((l) => l.id === selectedLicenseId) || beat.availableLicenses?.[0];

  const handlePlayToggle = () => {
    if (isCurrentPlaying) {
      pauseTrack();
    } else {
      playTrack(beat);
    }
  };

  const handleAddToCart = (redirect = false) => {
    if (activeLicense) {
      addItem(beat, activeLicense);
      if (redirect) {
        handleNavigate('/checkout');
      }
    }
  };

  const stemGroups = [
    { name: 'Drum Kit & Percussion (Kick, Snare, Hi-Hats, Perc)', icon: '🥁' },
    { name: 'Bass & Sub Harmonics (808 / Analog Upright)', icon: '🔊' },
    { name: 'Main Melodic Lead & Hooks', icon: '🎹' },
    { name: 'Chords, Strings & Keys Arrangement', icon: '🎻' },
    { name: 'Atmospheric Textures & FX Risers', icon: '✨' },
  ];

  return (
    <div className="pt-28 pb-28 px-4 sm:px-6 max-w-7xl mx-auto">
      {/* Back button */}
      <Link
        to="/beats"
        className="inline-flex items-center gap-2 text-xs font-semibold text-text-muted hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Beat Store</span>
      </Link>

      {/* Main Beat Showcase Header */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
        {/* Left: Big Artwork */}
        <div className="lg:col-span-5 relative group">
          <div className="aspect-square w-full rounded-2xl overflow-hidden border border-surface-border bg-surface-light shadow-2xl relative">
            <img
              src={beat.artwork}
              alt={beat.title}
              width={500}
              height={500}
              decoding="async"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {/* Center Play Overlay */}
            <div
              onClick={handlePlayToggle}
              className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
            >
              <div className="w-16 h-16 rounded-full bg-electric-blue text-white flex items-center justify-center shadow-glow-blue transform hover:scale-110 active:scale-95 transition-all">
                {isCurrentPlaying ? (
                  <Pause className="w-7 h-7 fill-current" />
                ) : (
                  <Play className="w-7 h-7 fill-current translate-x-0.5" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Details & Waveform Player */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <div className="flex items-center gap-2 text-xs text-electric-cyan font-mono uppercase tracking-widest mb-1.5">
              <span>{beat.style}</span>
              <span>•</span>
              <span>{beat.mood}</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              {beat.title}
            </h1>
            <p className="text-xs sm:text-sm text-text-muted mt-1">
              Prod. by <span className="text-white font-semibold">{producerName}</span>
            </p>
          </div>

          {/* Interactive Large Waveform */}
          <div className="p-4 rounded-2xl bg-surface-light/80 border border-surface-border">
            <div className="flex items-center justify-between text-xs text-text-muted mb-2 font-mono">
              <span className="flex items-center gap-1.5 text-white font-semibold">
                <Volume2 className="w-4 h-4 text-electric-cyan" />
                <span>Lossless 320kbps Stream Preview</span>
              </span>
              <span>
                {Math.floor((isCurrentPlaying ? currentTime : 0) / 60)}:
                {String(Math.floor((isCurrentPlaying ? currentTime : 0) % 60)).padStart(2, '0')} /{' '}
                {Math.floor(beat.duration / 60)}:{String(beat.duration % 60).padStart(2, '0')}
              </span>
            </div>

            <AudioWaveform
              currentTime={currentTrack?.id === beat.id ? currentTime : 0}
              duration={beat.duration}
              onSeek={(t) => {
                if (currentTrack?.id !== beat.id) {
                  playTrack(beat);
                }
                seek(t);
              }}
              height={44}
            />

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-surface-border/50 text-xs">
              <div className="flex items-center gap-4 text-text-subtle font-mono text-[11px]">
                <span>BPM: <strong className="text-white">{beat.bpm}</strong></span>
                <span>Key: <strong className="text-white">{beat.key}</strong></span>
                <span>Plays: <strong className="text-white">{beat.playsCount.toLocaleString()}</strong></span>
              </div>

              <button
                onClick={handlePlayToggle}
                className="flex items-center gap-1.5 text-xs font-bold text-electric-cyan hover:text-white"
              >
                {isCurrentPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isCurrentPlaying ? 'Pause Stream' : 'Play Instrumental'}</span>
              </button>
            </div>
          </div>

          {/* Beat Description */}
          {beat.description && (
            <div className="text-xs sm:text-sm text-text-muted leading-relaxed">
              {beat.description}
            </div>
          )}

          {/* Master Audio Inclusion Note */}
          <div className="p-4 rounded-xl bg-surface/50 border border-surface-border">
            <h4 className="text-xs font-mono uppercase tracking-widest text-white mb-1.5 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-electric-cyan" />
              <span>Commercial Studio Master Files</span>
            </h4>
            <p className="text-xs text-text-muted leading-relaxed">
              Mastered 24-Bit WAV and 320kbps MP3 audio files with headroom for vocal recording and streaming release.
            </p>
          </div>
        </div>
      </div>

      {/* License Selection & Checkout Module */}
      <section className="mt-12 pt-12 border-t border-surface-border">
        <h2 className="text-2xl font-black text-white mb-2">Select Your Rights Package</h2>
        <p className="text-xs text-text-muted mb-6">
          Choose between standard Non-Exclusive licensing or complete Sole Exclusive Ownership.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 max-w-3xl gap-6 mb-8">
          {(beat.availableLicenses || [
            {
              id: 'non-exclusive-def',
              name: 'NON_EXCLUSIVE',
              displayName: 'Non-Exclusive License',
              price: brandHelpers.getNonExclusivePrice(producerBrand),
              description: 'Commercial release rights for streaming platforms and music videos.',
              includedFiles: ['MP3', 'WAV', 'LICENSE_PDF'],
              commercialUsage: 'Up to 500,000 streams on Spotify/Apple Music',
              isExclusive: false,
            },
            {
              id: 'exclusive-def',
              name: 'EXCLUSIVE',
              displayName: 'Exclusive License',
              price: brandHelpers.getExclusivePrice(producerBrand),
              description: 'Sole ownership transfer. Beat is permanently archived upon purchase.',
              includedFiles: ['MP3', 'WAV', 'LICENSE_PDF', 'LEGAL_CONTRACT'],
              commercialUsage: 'Unlimited commercial streams, sync & broadcast',
              isExclusive: true,
            },
          ] as any[]).map((lic) => {
            const isSelected = lic.id === activeLicense?.id;
            const isEx = !!lic.isExclusive || lic.name === 'EXCLUSIVE';
            const includedFilesList = Array.isArray(lic.includedFiles)
              ? lic.includedFiles
              : ['MP3', 'WAV'];

            return (
              <div
                key={lic.id}
                onClick={() => setSelectedLicenseId(lic.id)}
                className={`p-6 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${isSelected
                  ? isEx
                    ? 'bg-electric-violet/10 border-electric-violet shadow-glow-violet/20'
                    : 'bg-electric-blue/10 border-electric-blue shadow-glow-blue/20'
                  : 'bg-surface-light/40 border-surface-border hover:bg-surface-light'
                  }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono text-electric-cyan uppercase">
                      {isEx ? 'Sole Ownership' : 'Standard License'}
                    </span>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-electric-cyan animate-pulse" />
                    )}
                  </div>
                  <h3 className="font-bold text-white text-lg">{lic.displayName}</h3>
                  <div className="text-3xl font-black text-white mt-1 mb-2">
                    {brandHelpers.formatCurrency(lic.price, producerBrand)}
                  </div>
                  <p className="text-xs text-text-muted leading-relaxed">{lic.description}</p>

                  <div className="text-[11px] font-mono text-electric-cyan mt-3 pt-3 border-t border-surface-border/60">
                    Files: {includedFilesList.filter((f: string) => f !== 'LICENSE_PDF' && f !== 'LEGAL_CONTRACT').join(' + ')} + Signed PDF
                  </div>

                  {isEx && (
                    <div className="mt-2 text-[11px] text-electric-violet font-semibold">
                      ⚡ Automatically archived from store upon purchase
                    </div>
                  )}
                </div>

                <div className="mt-5">
                  <div className={`text-center py-2.5 rounded-xl text-xs font-bold transition-all ${isSelected
                    ? isEx
                      ? 'bg-electric-violet text-white shadow-glow-violet'
                      : 'bg-electric-blue text-white shadow-glow-blue'
                    : 'bg-surface-lighter text-text-muted'
                    }`}>
                    {isSelected ? 'Selected' : 'Select'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Tier Action Box */}
        {activeLicense && (
          <div className="p-6 rounded-2xl bg-surface border border-surface-border flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl max-w-3xl">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-lg font-bold text-white">{activeLicense.displayName}</h4>
                <span className="text-2xl font-black text-white">
                  {brandHelpers.formatCurrency(activeLicense.price, producerBrand)}
                </span>
              </div>
              <p className="text-xs text-text-muted mt-1">
                {activeLicense.commercialUsage} • Cryptographically signed PDF license agreement included.
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => handleAddToCart(false)}
                className="flex-1 sm:flex-none px-5 py-3 rounded-xl bg-surface-lighter hover:bg-surface-border text-white text-xs font-bold border border-surface-border flex items-center justify-center gap-2 transition-all"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>

              <button
                onClick={() => handleAddToCart(true)}
                className="flex-1 sm:flex-none px-8 py-3 rounded-xl bg-electric-blue hover:bg-electric-blue/90 text-white text-xs font-extrabold uppercase tracking-wider shadow-glow-blue transition-all"
              >
                Buy Now
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Related Beats */}
      {relatedBeats.length > 0 && (
        <section className="mt-16 pt-12 border-t border-surface-border content-auto">
          <h3 className="text-xl font-bold text-white mb-6">More Like This</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {relatedBeats.map((rb) => (
              <Link
                key={rb.id}
                to={`/beats/${rb.slug}`}
                className="glass-card rounded-xl p-3 block group"
              >
                <img
                  src={rb.artwork}
                  alt={rb.title}
                  width={240}
                  height={240}
                  loading="lazy"
                  decoding="async"
                  className="w-full aspect-square rounded-lg object-cover mb-2.5"
                />
                <h4 className="font-bold text-white text-sm truncate group-hover:text-electric-cyan transition-colors">
                  {rb.title}
                </h4>
                <div className="flex items-center justify-between text-[11px] text-text-subtle font-mono mt-1">
                  <span>{rb.bpm} BPM</span>
                  <span className="text-white font-semibold">
                    ₹{rb.availableLicenses?.[0]?.price?.toLocaleString() || '1,999'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
