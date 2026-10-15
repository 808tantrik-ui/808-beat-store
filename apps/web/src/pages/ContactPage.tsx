import React, { useState } from 'react';
import { Mail, MapPin, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { producerBrand, brandHelpers } from '@config/brand';
import { contactFormSchema } from '@shared/schemas';
import { apiUrl } from '../config/api';
import { openInstagram, openYouTube, OFFICIAL_SOCIALS } from '../utils/deepLinks';

interface ContactPageProps {
  onNavigate?: (route: string) => void;
}

export function ContactPage({ onNavigate }: ContactPageProps) {
  const producerName = brandHelpers.getProducerName(producerBrand);
  const contactEmail = brandHelpers.getContactEmail(producerBrand);
  const supportEmail = brandHelpers.getSupportEmail(producerBrand);
  const location = brandHelpers.getLocation(producerBrand);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const validation = contactFormSchema.safeParse({ name, email, subject, message });
    if (!validation.success) {
      setErrorMsg(validation.error.errors[0]?.message || 'Please check form fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(apiUrl('/api/contact'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to send inquiry.');
      }
      setIsSent(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-28 pb-24 px-4 sm:px-6 max-w-4xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Direct Studio Inquiry
        </h1>
        <p className="text-xs sm:text-sm text-text-muted mt-2">
          Contact {producerName} for custom hip-hop production, exclusive master buyouts, or licensing inquiries.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Contact Info (Only configured fields are shown) */}
        <div className="md:col-span-5 space-y-4">
          <div className="p-6 rounded-2xl bg-surface border border-surface-border space-y-4">
            <h3 className="font-bold text-white text-base">Direct Channels</h3>

            {contactEmail && (
              <div className="flex items-start gap-3 text-xs">
                <Mail className="w-4 h-4 text-electric-cyan shrink-0 mt-0.5" />
                <div>
                  <div className="text-text-subtle font-mono text-[10px] uppercase">Business Email</div>
                  <a href={`mailto:${contactEmail}`} className="text-white hover:text-electric-cyan font-semibold">
                    {contactEmail}
                  </a>
                </div>
              </div>
            )}

            {supportEmail && (
              <div className="flex items-start gap-3 text-xs">
                <Mail className="w-4 h-4 text-electric-cyan shrink-0 mt-0.5" />
                <div>
                  <div className="text-text-subtle font-mono text-[10px] uppercase">Client Support</div>
                  <a href={`mailto:${supportEmail}`} className="text-white hover:text-electric-cyan font-semibold">
                    {supportEmail}
                  </a>
                </div>
              </div>
            )}

            {location && (
              <div className="flex items-start gap-3 text-xs">
                <MapPin className="w-4 h-4 text-electric-cyan shrink-0 mt-0.5" />
                <div>
                  <div className="text-text-subtle font-mono text-[10px] uppercase">Location</div>
                  <div className="text-white font-semibold">{location}</div>
                </div>
              </div>
            )}

            {/* Official Social Links */}
            <div className="pt-2 flex flex-col gap-2 border-t border-surface-border">
              <div className="text-text-subtle font-mono text-[10px] uppercase">Social & Updates</div>
              <div className="flex flex-wrap gap-2">
                <a
                  href={OFFICIAL_SOCIALS.instagram.webUrl}
                  onClick={openInstagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-pink-600/15 hover:bg-pink-600/25 border border-pink-500/30 text-white text-xs font-semibold transition-all hover:scale-105 cursor-pointer"
                  title="Open Instagram App"
                >
                  <svg className="w-3.5 h-3.5 fill-pink-500" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  <span>Instagram</span>
                </a>
                <a
                  href={OFFICIAL_SOCIALS.youtube.webUrl}
                  onClick={openYouTube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-600/15 hover:bg-red-600/25 border border-red-500/30 text-white text-xs font-semibold transition-all hover:scale-105 cursor-pointer"
                  title="Open YouTube App"
                >
                  <svg className="w-3.5 h-3.5 fill-red-500" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  <span>YouTube</span>
                </a>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-text-subtle border-t border-surface-border leading-relaxed">
              Inquiries regarding custom production or exclusivity are reviewed within 24 business hours.
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="md:col-span-7 bg-surface p-6 sm:p-8 rounded-2xl border border-surface-border shadow-xl">
          {isSent ? (
            <div className="py-10 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Inquiry Received</h3>
              <p className="text-xs text-text-muted max-w-sm mx-auto">
                Thank you for reaching out. We have received your message and will respond to your provided email shortly.
              </p>
              <button
                onClick={() => {
                  setIsSent(false);
                  setName('');
                  setEmail('');
                  setSubject('');
                  setMessage('');
                }}
                className="mt-4 px-4 py-2 rounded-xl bg-surface-light text-white text-xs font-semibold hover:bg-surface-border"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-300">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1 uppercase tracking-wider">
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Artist or Manager Name"
                  className="w-full bg-surface-light border border-surface-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-electric-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1 uppercase tracking-wider">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@email.com"
                  className="w-full bg-surface-light border border-surface-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-electric-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1 uppercase tracking-wider">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Custom Beat Inquiry / Sync Clearance"
                  className="w-full bg-surface-light border border-surface-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-electric-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1 uppercase tracking-wider">
                  Message *
                </label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your project, timeline, and production requirements..."
                  className="w-full bg-surface-light border border-surface-border rounded-xl p-4 text-sm text-white focus:outline-none focus:border-electric-blue resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-electric-blue hover:bg-electric-blue/90 disabled:opacity-50 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-glow-blue transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Sending Alert...' : 'Submit Inquiry'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
