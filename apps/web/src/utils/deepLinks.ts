import type React from 'react';

/**
 * Social Media Deep Linking Utility for 808 Beat Store
 * Enables mobile deep-linking to native Instagram and YouTube apps with web fallback.
 */

export const OFFICIAL_SOCIALS = {
  instagram: {
    handle: '808_beatstore',
    webUrl: 'https://www.instagram.com/808_beatstore?stkn=MWxnMmFqaWJjbWZlOQ%3D%3D&utm_source=qr',
    iosAppUrl: 'instagram://user?username=808_beatstore',
    androidIntentUrl: 'intent://instagram.com/_u/808_beatstore/#Intent;package=com.instagram.android;scheme=https;end',
  },
  youtube: {
    handle: '@808beatstore',
    webUrl: 'https://youtube.com/@808beatstore?si=Gm2bZSIbAbnFDHN5',
    iosAppUrl: 'vnd.youtube://youtube.com/@808beatstore',
    androidIntentUrl: 'intent://youtube.com/@808beatstore#Intent;package=com.google.android.youtube;scheme=https;end',
  },
};

/**
 * Opens Instagram in the native mobile app if available, with smooth fallback to the official web URL.
 */
export function openInstagram(e?: React.MouseEvent) {
  if (e && typeof e.preventDefault === 'function') {
    e.preventDefault();
  }

  const ua = typeof navigator !== 'undefined' ? navigator.userAgent || '' : '';
  const isAndroid = /Android/i.test(ua);
  const isIOS = /iPhone|iPad|iPod/i.test(ua);

  if (isAndroid) {
    try {
      window.location.href = OFFICIAL_SOCIALS.instagram.androidIntentUrl;
      setTimeout(() => {
        window.open(OFFICIAL_SOCIALS.instagram.webUrl, '_blank', 'noopener,noreferrer');
      }, 1200);
    } catch {
      window.open(OFFICIAL_SOCIALS.instagram.webUrl, '_blank', 'noopener,noreferrer');
    }
    return;
  }

  if (isIOS) {
    const start = Date.now();
    try {
      window.location.href = OFFICIAL_SOCIALS.instagram.iosAppUrl;
      setTimeout(() => {
        if (Date.now() - start < 1800 && !document.hidden) {
          window.open(OFFICIAL_SOCIALS.instagram.webUrl, '_blank', 'noopener,noreferrer');
        }
      }, 1000);
    } catch {
      window.open(OFFICIAL_SOCIALS.instagram.webUrl, '_blank', 'noopener,noreferrer');
    }
    return;
  }

  // Desktop or fallback
  window.open(OFFICIAL_SOCIALS.instagram.webUrl, '_blank', 'noopener,noreferrer');
}

/**
 * Opens YouTube in the native mobile app if available, with smooth fallback to the official web URL.
 */
export function openYouTube(e?: React.MouseEvent) {
  if (e && typeof e.preventDefault === 'function') {
    e.preventDefault();
  }

  const ua = typeof navigator !== 'undefined' ? navigator.userAgent || '' : '';
  const isAndroid = /Android/i.test(ua);
  const isIOS = /iPhone|iPad|iPod/i.test(ua);

  if (isAndroid) {
    try {
      window.location.href = OFFICIAL_SOCIALS.youtube.androidIntentUrl;
      setTimeout(() => {
        window.open(OFFICIAL_SOCIALS.youtube.webUrl, '_blank', 'noopener,noreferrer');
      }, 1200);
    } catch {
      window.open(OFFICIAL_SOCIALS.youtube.webUrl, '_blank', 'noopener,noreferrer');
    }
    return;
  }

  if (isIOS) {
    const start = Date.now();
    try {
      window.location.href = OFFICIAL_SOCIALS.youtube.iosAppUrl;
      setTimeout(() => {
        if (Date.now() - start < 1800 && !document.hidden) {
          window.open(OFFICIAL_SOCIALS.youtube.webUrl, '_blank', 'noopener,noreferrer');
        }
      }, 1000);
    } catch {
      window.open(OFFICIAL_SOCIALS.youtube.webUrl, '_blank', 'noopener,noreferrer');
    }
    return;
  }

  // Desktop or fallback
  window.open(OFFICIAL_SOCIALS.youtube.webUrl, '_blank', 'noopener,noreferrer');
}
