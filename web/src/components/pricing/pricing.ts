/* ----------------------------------------------------------------------------
 * pricing.ts — content for the 3 pricing plans, extracted verbatim from
 * saganpassport.com/pricing. Prices and a couple of feature lines differ
 * between monthly and annual billing, so those fields are keyed by `Billing`.
 *
 * Accent colors are the per-plan tints from the Framer source:
 *   One-time = purple, Sagan Membership = blue, Institutional = orange.
 * ------------------------------------------------------------------------- */

export type Billing = 'monthly' | 'annual';

export interface Plan {
  id: string;
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

/* All CTAs point at the same consultation booking the rest of the site uses.
   (Confirm the intended destination — placeholder until told otherwise.) */
const CTA =
  'https://calendly.com/d/5j7-3xv-p5k/global-talent-hiring-consultation?utm_source=saganpassportdotcom&utm_term=talent';

export const PLANS: Plan[] = [
  {
    id: 'one-time',
    title: 'One-time Placement',
    accent: 'rgb(121, 106, 255)',
    accentDots: 1,
    price: { monthly: '$500 Deposit', annual: '$500 Deposit' },
    description:
      'Get a dedicated white-glove headhunt to secure a high-caliber professional tailored to your needs. The ideal way to experience the quality of our talent and process.',
    bestFor: 'Making a single, critical hire or trying our process for the first time.',
    features: {
      monthly: [
        '1 on-demand "White Glove" custom headhunt',
        '35% success fee with a 90-day free replacement guarantee',
        '1 month of Sagan community access',
      ],
      annual: [
        '1 on-demand "White Glove" custom headhunt',
        '35% success fee with a 90-day free replacement guarantee',
        '1 month of Passport community access',
      ],
    },
    ctaHref: CTA,
    ctaExternal: true,
  },
  {
    id: 'sagan-membership',
    title: 'Sagan Membership',
    accent: 'rgb(33, 151, 255)',
    accentDots: 2,
    recommended: true,
    price: { monthly: '$499 Per Month', annual: '$5,390 Per Year' },
    description:
      'Our most popular option for SMBs. Get consistent, high-quality hiring support year-round at the lowest per-headhunt cost, plus full partnership benefits.',
    bestFor: 'Growing businesses committed to building a core team and scaling efficiently.',
    features: {
      monthly: [
        'Sagan AI - custom-built and hosted AI agents with no retainers, no seats, no lock-in; pay only for what you use',
        '18% success fee per hire with unlimited access to the Talent Pool',
        '90-day free replacement guarantee',
        'Includes all membership benefits',
      ],
      annual: [
        'Sagan AI - custom-built and hosted AI agents with no retainers, no seats, no lock-in; pay only for what you use',
        '18% success fee per hire with unlimited access to the Talent Pool',
        '90-day free replacement guarantee',
        'Includes all membership benefits',
      ],
    },
    ctaHref: CTA,
    ctaExternal: true,
  },
  {
    id: 'institutional',
    title: 'Institutional Platform Membership',
    accent: 'rgb(255, 116, 85)',
    accentDots: 3,
    price: { monthly: 'Custom Pricing', annual: 'Custom Pricing' },
    description:
      "Sagan's specialized offering of bespoke features and pricing to support the needs of private equity, venture capital, and franchisor platforms",
    bestFor:
      'PE funds, VC funds, and Franchisors building an unfair talent and leverage advantage across their portfolios.',
    features: {
      monthly: [
        'Sagan AI - custom-built and hosted AI agents with no retainers, no seats, no lock-in; pay only for what you use',
        'Private Talent Pipelines & Unlimited Hires from the Talent Pool',
        '90-day free replacement guarantee',
        'Includes all membership benefits',
      ],
      annual: [
        'Sagan AI - custom-built and hosted AI agents with no retainers, no seats, no lock-in; pay only for what you use',
        'Private Talent Pipelines & Unlimited Hires from the Talent Pool',
        '90-day free replacement guarantee',
        'Includes all membership benefits',
      ],
    },
    ctaHref: CTA,
    ctaExternal: true,
  },
];
