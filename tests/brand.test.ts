import { describe, it, expect } from 'vitest';
import { producerBrand, isPlaceholder, getDisplayValue, brandHelpers } from '../packages/config/src/brand.js';

describe('Centralized Brand Configuration & Placeholder Shielding', () => {
  it('correctly identifies placeholder strings', () => {
    expect(isPlaceholder('[PRODUCER_NAME]')).toBe(true);
    expect(isPlaceholder('[CONTACT_EMAIL]')).toBe(true);
    expect(isPlaceholder('[PRIMARY_ACCENT]')).toBe(true);
    expect(isPlaceholder('')).toBe(true);
    expect(isPlaceholder(null)).toBe(true);
    expect(isPlaceholder(undefined)).toBe(true);

    expect(isPlaceholder('808 Mafia')).toBe(false);
    expect(isPlaceholder('Metro Boomin')).toBe(false);
    expect(isPlaceholder('contact@studio.com')).toBe(false);
  });

  it('safely falls back to neutral copy without inventing fake producer identities', () => {
    const unconfiguredBrand = {
      ...producerBrand,
      identity: {
        ...producerBrand.identity,
        name: '[PRODUCER_NAME]',
        heroSubtitle: '[HERO_SUBTITLE]',
      },
      seo: {
        ...producerBrand.seo,
        siteTitle: '[SITE_TITLE]',
      },
      contact: {
        ...producerBrand.contact,
        email: '[CONTACT_EMAIL]',
        location: '[LOCATION]',
      },
    };

    expect(brandHelpers.getProducerName(unconfiguredBrand)).toBe('808 Tantrik');
    expect(brandHelpers.getHeroSubtitle(unconfiguredBrand)).toBe(
      'Elevate your sound with studio-ready instrumentals and instant commercial licensing.'
    );
    expect(brandHelpers.getSiteTitle(unconfiguredBrand)).toBe('808 Tantrik | Premium Hip-Hop Beats');
  });

  it('returns correctly configured brand identity and social links', () => {
    expect(brandHelpers.getProducerName(producerBrand)).toBe('808 Tantrik');
    expect(brandHelpers.getContactEmail(producerBrand)).toBe('808beatstore@gmail.com');
    expect(brandHelpers.getLocation(producerBrand)).toBe('Mumbai, India');
    expect(brandHelpers.getSocialLinks(producerBrand).length).toBeGreaterThan(0);
  });

  it('formats currency according to configured business rules', () => {
    expect(brandHelpers.formatCurrency(1999, producerBrand)).toBe('₹1,999');
    expect(brandHelpers.formatCurrency(24999, producerBrand)).toBe('₹24,999');
  });
});
