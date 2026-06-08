/* ----------------------------------------------------------------------------
 * pricing.ts — shape of a pricing plan column. Content now lives in Sanity
 * (the `pricing` singleton) and is fetched in pricing.astro; PricingTable maps
 * the Sanity plans into this shape before handing them to PricingCard. Prices
 * and a couple of feature lines differ between monthly and annual billing, so
 * those fields are keyed by `Billing`.
 * ------------------------------------------------------------------------- */

export type Billing = 'monthly' | 'annual';

export interface Plan {
  id?: string;
  title: string;
  /** accent tint used for dots, price label, checkmarks, and the CTA arrow */
  accent: string;
  /** number of small accent dots shown at the card's top-left (1 / 2 / 3) */
  accentDots: number;
  recommended?: boolean;
  /** the colored price/tag label, per billing period */
  price: Record<Billing, string>;
  description: string;
  bestFor: string;
  /** "WHAT'S INCLUDED" rows, per billing period */
  features: Record<Billing, string[]>;
  ctaHref: string;
  ctaExternal?: boolean;
}

