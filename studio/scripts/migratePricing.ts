/**
 * One-off migration: create/replace the `pricing` singleton with the page copy
 * and the three plans (verbatim from web/src/components/pricing/pricing.ts).
 *
 * Run from the studio dir (after `sanity login`):
 *   npx sanity exec scripts/migratePricing.ts --with-user-token
 */
import {getCliClient} from 'sanity/cli'

const client = getCliClient()

// Every object inside a Sanity array needs a unique `_key`.
let keySeq = 0
const k = () => `k${(keySeq++).toString(36)}${Math.random().toString(36).slice(2, 8)}`
const withKeys = <T extends Record<string, any>>(arr: T[]) => arr.map((item) => ({_key: k(), ...item}))

const CTA =
  'https://calendly.com/d/5j7-3xv-p5k/global-talent-hiring-consultation?utm_source=saganpassportdotcom&utm_term=talent'

const PLANS = [
  {
    title: 'One-time Placement',
    accent: 'rgb(121, 106, 255)',
    accentDots: 1,
    recommended: false,
    priceMonthly: '$500 Deposit',
    priceAnnual: '$500 Deposit',
    description:
      'Get a dedicated white-glove headhunt to secure a high-caliber professional tailored to your needs. The ideal way to experience the quality of our talent and process.',
    bestFor: 'Making a single, critical hire or trying our process for the first time.',
    featuresMonthly: [
      '1 on-demand "White Glove" custom headhunt',
      '35% success fee with a 90-day free replacement guarantee',
      '1 month of Sagan community access',
    ],
    featuresAnnual: [
      '1 on-demand "White Glove" custom headhunt',
      '35% success fee with a 90-day free replacement guarantee',
      '1 month of Passport community access',
    ],
    ctaHref: CTA,
    ctaExternal: true,
  },
  {
    title: 'Sagan Membership',
    accent: 'rgb(33, 151, 255)',
    accentDots: 2,
    recommended: true,
    priceMonthly: '$499 Per Month',
    priceAnnual: '$5,390 Per Year',
    description:
      'Our most popular option for SMBs. Get consistent, high-quality hiring support year-round at the lowest per-headhunt cost, plus full partnership benefits.',
    bestFor: 'Growing businesses committed to building a core team and scaling efficiently.',
    featuresMonthly: [
      'Sagan AI - custom-built and hosted AI agents with no retainers, no seats, no lock-in; pay only for what you use',
      '18% success fee per hire with unlimited access to the Talent Pool',
      '90-day free replacement guarantee',
      'Includes all membership benefits',
    ],
    featuresAnnual: [
      'Sagan AI - custom-built and hosted AI agents with no retainers, no seats, no lock-in; pay only for what you use',
      '18% success fee per hire with unlimited access to the Talent Pool',
      '90-day free replacement guarantee',
      'Includes all membership benefits',
    ],
    ctaHref: CTA,
    ctaExternal: true,
  },
  {
    title: 'Institutional Platform Membership',
    accent: 'rgb(255, 116, 85)',
    accentDots: 3,
    recommended: false,
    priceMonthly: 'Custom Pricing',
    priceAnnual: 'Custom Pricing',
    description:
      "Sagan's specialized offering of bespoke features and pricing to support the needs of private equity, venture capital, and franchisor platforms",
    bestFor:
      'PE funds, VC funds, and Franchisors building an unfair talent and leverage advantage across their portfolios.',
    featuresMonthly: [
      'Sagan AI - custom-built and hosted AI agents with no retainers, no seats, no lock-in; pay only for what you use',
      'Private Talent Pipelines & Unlimited Hires from the Talent Pool',
      '90-day free replacement guarantee',
      'Includes all membership benefits',
    ],
    featuresAnnual: [
      'Sagan AI - custom-built and hosted AI agents with no retainers, no seats, no lock-in; pay only for what you use',
      'Private Talent Pipelines & Unlimited Hires from the Talent Pool',
      '90-day free replacement guarantee',
      'Includes all membership benefits',
    ],
    ctaHref: CTA,
    ctaExternal: true,
  },
]

async function main() {
  const doc = {
    _id: 'pricing',
    _type: 'pricing',
    seoTitle: 'Pricing — Sagan Passport',
    heading: 'An investment in your growth, not just a hiring fee',
    subcopy:
      'We offer transparent, flexible options designed to help you build a world-class team. Choose the path that matches your hiring needs and unlock your potential.',
    plans: withKeys(PLANS.map((p) => ({_type: 'planItem', ...p}))),
  }

  console.log('Writing pricing document…')
  await client.createOrReplace(doc)
  console.log('✓ Done. Pricing singleton created/replaced.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
