import { sanityClient } from 'sanity:client';

export interface SanityPlan {
  title: string;
  recommended?: boolean;
  accent?: string;
  accentDots?: number;
  priceMonthly?: string;
  priceAnnual?: string;
  description?: string;
  bestFor?: string;
  featuresMonthly?: string[];
  featuresAnnual?: string[];
  ctaHref?: string;
  ctaExternal?: boolean;
}

export interface PricingData {
  seoTitle?: string;
  heading?: string;
  subcopy?: string;
  plans?: SanityPlan[];
}

const PRICING_QUERY = `*[_type == "pricing"][0]{
  seoTitle,
  heading,
  subcopy,
  plans[]{
    title, recommended, accent, accentDots,
    priceMonthly, priceAnnual, description, bestFor,
    featuresMonthly, featuresAnnual, ctaHref, ctaExternal
  }
}`;

/** Fetch the pricing singleton from Sanity (queried at build time). */
export async function getPricing(): Promise<PricingData> {
  return (await sanityClient.fetch<PricingData>(PRICING_QUERY)) ?? {};
}
