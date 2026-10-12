export interface ProducerBrandConfig {
  identity: {
    name: string;
    shortName: string;
    tagline: string;
    heroSubtitle: string;
    copyrightOwner: string;
  };
  assets: {
    logo: string;
    logoLight: string;
    logoDark: string;
    favicon: string;
    ogImage: string;
    audioTag: string;
  };
  website: {
    url: string;
    domain: string;
  };
  contact: {
    email: string;
    businessEmail: string;
    supportEmail: string;
    location: string;
  };
  social: {
    instagram: string;
    youtube: string;
    spotify: string;
    x: string;
    facebook: string;
    tiktok: string;
  };
  audioBranding: {
    enabled: boolean;
    tagFile: string;
    tagVolume: number;
  };
  seo: {
    siteTitle: string;
    defaultDescription: string;
    keywords: string[];
  };
  pricing: {
    nonExclusivePrice: number;
    nonExclusiveListPrice: number;
    exclusivePrice: number;
    exclusiveListPrice: number;
  };
  business: {
    currency: string;
    currencySymbol: string;
    country: string;
  };
  colors: {
    background: string;
    surface: string;
    primary: string;
    secondary: string;
    text: string;
    mutedText: string;
  };
}

export const producerBrand: ProducerBrandConfig = {
  identity: {
    name: "808 Tantrik",
    shortName: "808 Tantrik",
    tagline: "Industry Grade Hip-Hop Instrumentals & Commercial Licensing",
    heroSubtitle: "Elevate your sound with studio-ready instrumentals and instant commercial licensing.",
    copyrightOwner: "808 Tantrik",
  },
  assets: {
    logo: "/assets/branding/producer-logo.svg",
    logoLight: "/assets/branding/producer-logo-light.svg",
    logoDark: "/assets/branding/producer-logo-dark.svg",
    favicon: "/assets/branding/favicon.svg",
    ogImage: "/assets/branding/og-image.jpg",
    audioTag: "/assets/branding/producer-tag.mp3",
  },
  website: {
    url: "https://808tantrik.com",
    domain: "808tantrik.com",
  },
  contact: {
    email: "808beatstore@gmail.com",
    businessEmail: "808beatstore@gmail.com",
    supportEmail: "808beatstore@gmail.com",
    location: "Mumbai, India",
  },
  social: {
    instagram: "https://www.instagram.com/808_beatstore?stkn=MWxnMmFqaWJjbWZlOQ%3D%3D&utm_source=qr",
    youtube: "https://youtube.com/@808beatstore?si=Gm2bZSIbAbnFDHN5",
    spotify: "",
    x: "",
    facebook: "",
    tiktok: "",
  },
  audioBranding: {
    enabled: false,
    tagFile: "/assets/branding/producer-tag.mp3",
    tagVolume: 0.7,
  },
  seo: {
    siteTitle: "808 Tantrik | Premium Hip-Hop Beats",
    defaultDescription: "Explore exclusive and non-exclusive studio hip-hop beats produced by 808 Tantrik. High-fidelity master instrumentals with instant commercial licensing.",
    keywords: [
      "808 tantrik",
      "hip-hop beats",
      "rap beats",
      "buy beats",
      "instrumentals",
      "hip-hop producer",
    ],
  },
  pricing: {
    nonExclusivePrice: 49,
    nonExclusiveListPrice: 499,
    exclusivePrice: 499,
    exclusiveListPrice: 5999,
  },
  business: {
    currency: "INR",
    currencySymbol: "₹",
    country: "India",
  },
  colors: {
    background: "#050505",
    surface: "#0D0D12",
    primary: "#0066FF",
    secondary: "#8A2BE2",
    text: "#FFFFFF",
    mutedText: "#A1A1AA",
  },
};

/**
 * Checks if a string value is considered a placeholder token e.g. [PRODUCER_NAME] or empty.
 */
export function isPlaceholder(value?: string | number | null): boolean {
  if (value === undefined || value === null) return true;
  if (typeof value === "number") return false;
  const str = String(value).trim();
  if (str === "") return true;
  return /^\[[A-Z0-9_]+\]$/.test(str);
}

/**
 * Resolves a display value safely. If it is a placeholder or empty, returns fallback.
 */
export function getDisplayValue(
  value: string | number | undefined | null,
  fallback = ""
): string {
  return isPlaceholder(value) ? fallback : String(value);
}

/**
 * Production safe branding getters with exact fallback rules
 */
export const brandHelpers = {
  getProducerName: (config = producerBrand): string => {
    return getDisplayValue(config.identity.name, "808 Tantrik");
  },

  getProducerCredit: (config = producerBrand): string => {
    return `Prod. by ${brandHelpers.getProducerName(config)}`;
  },

  getProducerShortName: (config = producerBrand): string => {
    return getDisplayValue(
      config.identity.shortName,
      brandHelpers.getProducerName(config)
    );
  },

  getTagline: (config = producerBrand): string | null => {
    return isPlaceholder(config.identity.tagline) ? null : config.identity.tagline;
  },

  getHeroSubtitle: (config = producerBrand): string => {
    return getDisplayValue(
      config.identity.heroSubtitle,
      "Elevate your sound with studio-ready instrumentals and instant commercial licensing."
    );
  },

  getCopyrightOwner: (config = producerBrand): string => {
    return getDisplayValue(
      config.identity.copyrightOwner,
      brandHelpers.getProducerName(config)
    );
  },

  getNonExclusivePrice: (config = producerBrand): number => {
    const raw = config.pricing?.nonExclusivePrice;
    if (typeof raw === "number") return raw;
    const str = getDisplayValue(raw, "49");
    const parsed = parseInt(str, 10);
    return isNaN(parsed) ? 49 : parsed;
  },

  getNonExclusiveListPrice: (config = producerBrand): number => {
    const raw = config.pricing?.nonExclusiveListPrice;
    if (typeof raw === "number") return raw;
    const str = getDisplayValue(raw, "499");
    const parsed = parseInt(str, 10);
    return isNaN(parsed) ? 499 : parsed;
  },

  getExclusivePrice: (config = producerBrand): number => {
    const raw = config.pricing?.exclusivePrice;
    if (typeof raw === "number") return raw;
    const str = getDisplayValue(raw, "499");
    const parsed = parseInt(str, 10);
    return isNaN(parsed) ? 499 : parsed;
  },

  getExclusiveListPrice: (config = producerBrand): number => {
    const raw = config.pricing?.exclusiveListPrice;
    if (typeof raw === "number") return raw;
    const str = getDisplayValue(raw, "5999");
    const parsed = parseInt(str, 10);
    return isNaN(parsed) ? 5999 : parsed;
  },

  getPrimaryAccent: (config = producerBrand): string => {
    return getDisplayValue(config.colors.primary, "#0066FF"); // Premium Electric Blue
  },

  getSecondaryAccent: (config = producerBrand): string => {
    return getDisplayValue(config.colors.secondary, "#8A2BE2"); // Electric Violet
  },

  getSiteTitle: (config = producerBrand): string => {
    const name = brandHelpers.getProducerName(config);
    return `${name} | Premium Hip-Hop Beats`;
  },

  getSeoDescription: (config = producerBrand): string => {
    return getDisplayValue(
      config.seo.defaultDescription,
      "Explore exclusive and non-exclusive studio hip-hop beats produced by 808 Tantrik. High-fidelity master instrumentals with instant commercial licensing."
    );
  },

  getWebsiteUrl: (config = producerBrand): string => {
    return getDisplayValue(config.website.url, "http://localhost:5173");
  },

  getContactEmail: (config = producerBrand): string | null => {
    return isPlaceholder(config.contact.email) ? null : config.contact.email;
  },

  getBusinessEmail: (config = producerBrand): string | null => {
    return isPlaceholder(config.contact.businessEmail) ? null : config.contact.businessEmail;
  },

  getSupportEmail: (config = producerBrand): string | null => {
    return isPlaceholder(config.contact.supportEmail) ? null : config.contact.supportEmail;
  },

  getLocation: (config = producerBrand): string | null => {
    return isPlaceholder(config.contact.location) ? null : config.contact.location;
  },

  getSocialLinks: (config = producerBrand) => {
    const list: { platform: string; url: string }[] = [];
    if (!isPlaceholder(config.social.instagram)) list.push({ platform: "Instagram", url: config.social.instagram });
    if (!isPlaceholder(config.social.youtube)) list.push({ platform: "YouTube", url: config.social.youtube });
    if (!isPlaceholder(config.social.spotify)) list.push({ platform: "Spotify", url: config.social.spotify });
    if (!isPlaceholder(config.social.x)) list.push({ platform: "X", url: config.social.x });
    if (!isPlaceholder(config.social.facebook)) list.push({ platform: "Facebook", url: config.social.facebook });
    if (!isPlaceholder(config.social.tiktok)) list.push({ platform: "TikTok", url: config.social.tiktok });
    return list;
  },

  formatCurrency: (amount: number, config = producerBrand): string => {
    const symbol = config.business.currencySymbol || "₹";
    return `${symbol}${amount.toLocaleString("en-IN")}`;
  },
};
