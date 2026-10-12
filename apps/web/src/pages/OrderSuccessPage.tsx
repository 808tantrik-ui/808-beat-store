import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  CheckCircle2,
  Download,
  FileText,
  ShieldCheck,
  Disc,
  Layers,
  ArrowRight,
  ExternalLink,
  Printer,
} from 'lucide-react';
import { producerBrand, brandHelpers } from '@config/brand';
import { OrderDTO } from '@shared/types';
import { apiUrl } from '../config/api';
import { FALLBACK_BEATS } from '../data/fallbackData';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface OrderSuccessPageProps {
  orderId?: string;
  onNavigate?: (route: string) => void;
}

export function OrderSuccessPage({ orderId: propOrderId, onNavigate }: OrderSuccessPageProps) {
  const params = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const orderId = propOrderId || params.orderId || '';

  const [order, setOrder] = useState<OrderDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const producerName = brandHelpers.getProducerName(producerBrand);

  const fetchOrder = () => {
    if (!orderId) return;
    setIsLoading(true);
    setErrorMessage(null);
    fetch(apiUrl(`/api/orders/${orderId}`))
      .then(async (r) => {
        if (!r.ok) {
          throw new Error(`Order fetch error (HTTP ${r.status})`);
        }
        return r.json();
      })
      .then((res) => {
        if (res.success && res.data) {
          setOrder(res.data);
        } else {
          setErrorMessage(res.error?.message || 'Order not found');
        }
      })
      .catch((err) => {
        console.error('Order verification fetch error:', err);
        const isFetchError = err?.message && err.message.toLowerCase().includes('fetch');
        setErrorMessage(
          isFetchError
            ? 'Order status server se connect ho raha hai. Kripya neeche "Retry Verification" par tap karein.'
            : (err.message || 'Unable to connect to order server.')
        );
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="pt-32 pb-24 text-center">
        <div className="w-12 h-12 rounded-full border-2 border-electric-blue border-t-transparent animate-spin mx-auto mb-4" />
        <p className="text-xs text-text-muted font-mono uppercase tracking-widest">
          Verifying Master Order & Cryptographic License...
        </p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="pt-32 pb-24 text-center max-w-md mx-auto px-4">
        <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-4 border border-amber-500/30">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Order Verification Required</h2>
        <p className="text-xs text-text-muted mb-6 leading-relaxed">{errorMessage}</p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={fetchOrder}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-electric-blue hover:bg-electric-blue/90 text-white text-xs font-bold transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Verification</span>
          </button>
          <Link
            to="/checkout"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-surface-light hover:bg-surface-lighter text-text-muted hover:text-white text-xs font-bold transition-all border border-surface-border"
          >
            <span>Return to Checkout</span>
          </Link>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="pt-32 pb-24 text-center max-w-md mx-auto px-4">
        <h2 className="text-xl font-bold text-white mb-2">Order Not Found</h2>
        <p className="text-xs text-text-muted mb-4">We were unable to locate this order record.</p>
        <Link
          to="/"
          className="inline-block px-5 py-2.5 rounded-xl bg-electric-blue text-white text-xs font-bold"
        >
          Return Home
        </Link>
      </div>
    );
  }

  // STRICT ACCESS CONTROL: If order is NOT paid, lock all downloads and show status
  const isOrderPaid = order.status === 'PAID';
  const isPendingVerification = order.status === 'PENDING_VERIFICATION' || order.status === 'VERIFYING';

  if (!isOrderPaid) {
    return (
      <div className="pt-28 pb-24 px-4 sm:px-6 max-w-2xl mx-auto text-center">
        {isPendingVerification ? (
          <div className="p-8 rounded-3xl bg-surface border border-amber-500/30 shadow-2xl space-y-6">
            <div className="w-16 h-16 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/10">
              <RefreshCw className="w-8 h-8 animate-spin" />
            </div>

            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-mono font-bold uppercase tracking-wider mb-2">
                ⏳ Payment Verification In Progress
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Order Received • Awaiting Bank Confirmation
              </h1>
              <p className="text-xs sm:text-sm text-text-muted mt-2 max-w-md mx-auto">
                Aapka payment reference register ho chuka hai. Hamari team bank se verify kar rahi hai. Jaise hi confirmation complete hoga, master WAV & MP3 downloads unlock ho jayenge.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-surface-light border border-surface-border text-left font-mono text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-text-subtle">Order Number:</span>
                <span className="font-bold text-white">{order.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-subtle">Payable Amount:</span>
                <span className="font-bold text-emerald-400">₹{order.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-subtle">Payment Status:</span>
                <span className="font-bold text-amber-400">PENDING_VERIFICATION</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-subtle">Downloads & Rights:</span>
                <span className="font-bold text-rose-400">LOCKED 🔒 (Requires Verified Payment)</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={fetchOrder}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-electric-blue hover:bg-electric-blue/90 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Check Verification Status</span>
              </button>
              <Link
                to="/beats"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-surface-light hover:bg-surface-lighter text-text-muted hover:text-white text-xs font-bold transition-all border border-surface-border"
              >
                <span>Browse Store</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="p-8 rounded-3xl bg-surface border border-rose-500/30 shadow-2xl space-y-6">
            <div className="w-16 h-16 rounded-full bg-rose-500/15 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/10">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-mono font-bold uppercase tracking-wider mb-2">
                ❌ Payment Incomplete or Cancelled
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Payment Not Confirmed
              </h1>
              <p className="text-xs sm:text-sm text-text-muted mt-2 max-w-md mx-auto">
                Is order ke liye payment complete ya verify nahi hua hai. Digital master files aur legal commercial license download karne ke liye verified payment anivarya hai.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-surface-light border border-surface-border text-left font-mono text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-text-subtle">Order Number:</span>
                <span className="font-bold text-white">{order.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-subtle">Status:</span>
                <span className="font-bold text-rose-400">{order.status || 'UNPAID'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-subtle">File Access:</span>
                <span className="font-bold text-rose-400">STRICTLY DENIED 🚫</span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to="/checkout"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-emerald-500/20"
              >
                <span>Return to Checkout & Complete Payment</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    );
  }

  const downloads = (order as any).downloads || [];
  const licenses = (order as any).licenses || [];

  return (
    <div className="pt-28 pb-24 px-4 sm:px-6 max-w-4xl mx-auto">
      {/* Success Banner */}
      <div className="text-center mb-10 space-y-3">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10 animate-bounce">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold uppercase tracking-wider">
          Payment Verified • Order Confirmed
        </span>

        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Your Beats & License Are Ready
        </h1>

        <p className="text-xs sm:text-sm text-text-muted max-w-lg mx-auto">
          Thank you for licensing with {producerName}. Your high-fidelity audio files and official copyright license documents are available below.
        </p>
      </div>

      {/* Order Meta Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-surface-border mb-8 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
        <div>
          <div className="text-text-subtle text-[11px] uppercase">Order Number</div>
          <div className="font-bold text-white mt-0.5">{order.orderNumber}</div>
        </div>
        <div>
          <div className="text-text-subtle text-[11px] uppercase">Customer Email</div>
          <div className="font-bold text-white mt-0.5 truncate">{order.customerEmail}</div>
        </div>
        <div>
          <div className="text-text-subtle text-[11px] uppercase">Total Paid</div>
          <div className="font-bold text-electric-cyan mt-0.5">₹{order.total.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-text-subtle text-[11px] uppercase">Payment Status</div>
          <div className="font-bold text-emerald-400 mt-0.5">VERIFIED / PAID</div>
        </div>
      </div>

      {/* Digital File Delivery Hub (Requirement 80) */}
      <div className="space-y-6 mb-12">
        <div className="flex items-center justify-between pb-3 border-b border-surface-border">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Download className="w-5 h-5 text-electric-cyan" />
            <span>Digital Delivery Vault</span>
          </h2>
          <span className="text-[11px] text-text-subtle font-mono">
            Signed Time-Limited Gateway Links
          </span>
        </div>

        {/* Download Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {downloads.map((d: any) => {
            const isAudio = d.assetType === 'MP3' || d.assetType === 'WAV';
            const isLicense = d.assetType === 'LICENSE_PDF';

            return (
              <div
                key={d.id}
                className="p-4 rounded-2xl bg-surface-light/80 border border-surface-border hover:border-surface-border/90 flex flex-col justify-between gap-4 transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-surface-lighter flex items-center justify-center text-electric-cyan shrink-0">
                    {isAudio && <Disc className="w-5 h-5" />}
                    {isLicense && <FileText className="w-5 h-5 text-amber-400" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{d.assetType} Asset</span>
                      <span className="px-2 py-0.2 rounded bg-surface-lighter text-[10px] text-electric-cyan font-mono">
                        {d.assetType === 'WAV' ? '24-Bit Studio Master' : d.assetType === 'MP3' ? '320kbps MP3' : 'Signed Agreement'}
                      </span>
                    </div>
                    <div className="text-xs text-text-muted mt-1 font-mono truncate max-w-[260px]">
                      {d.filename}
                    </div>
                    <div className="text-[10px] text-text-subtle mt-0.5">
                      Remaining Downloads: {d.remainingDownloads}
                    </div>
                  </div>
                </div>

                <a
                  href={apiUrl(d.downloadUrl)}
                  target={isLicense ? '_blank' : '_self'}
                  rel="noreferrer"
                  download={!isLicense}
                  className="w-full py-2.5 px-4 rounded-xl bg-surface-lighter hover:bg-electric-blue text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  {isLicense ? (
                    <>
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>View & Print License Certificate</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>Download {d.assetType} File</span>
                    </>
                  )}
                </a>
              </div>
            );
          })}
        </div>
      </div>

      {/* Official License Documents */}
      {licenses.length > 0 && (
        <div className="p-6 rounded-2xl bg-surface border border-surface-border mb-8 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-surface-border">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-electric-cyan" />
              <span>Official Rights Clearance Documents</span>
            </h3>
            <span className="text-[10px] font-mono text-emerald-400">CRYPTOGRAPHICALLY VERIFIED</span>
          </div>

          {licenses.map((lic: any) => (
            <div
              key={lic.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-text-muted p-3.5 rounded-xl bg-surface-light border border-surface-border/60"
            >
              <div>
                <div className="font-bold text-white">{lic.beatTitle}</div>
                <div className="text-[11px] font-mono text-text-subtle mt-0.5">
                  Certificate No: {lic.documentNumber}
                </div>
              </div>

              <a
                href={apiUrl(lic.viewUrl)}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-surface-lighter hover:bg-surface-border text-white text-xs font-semibold flex items-center gap-1.5 transition-all self-start sm:self-auto"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Open Printable License</span>
              </a>
            </div>
          ))}
        </div>
      )}

      {/* Footer Navigation */}
      <div className="flex items-center justify-between pt-6 border-t border-surface-border text-xs text-text-muted">
        <Link
          to="/account"
          className="hover:text-white transition-colors"
        >
          View in Your Account
        </Link>

        <Link
          to="/beats"
          className="px-5 py-2.5 rounded-xl bg-electric-blue hover:bg-electric-blue/90 text-white font-bold transition-all shadow-glow-blue"
        >
          Explore More Beats
        </Link>
      </div>
    </div>
  );
}
