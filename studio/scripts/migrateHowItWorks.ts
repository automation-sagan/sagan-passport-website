/**
 * One-off migration: download the How It Works images from Framer, upload them as
 * Sanity assets, and create/replace the `howItWorks` singleton with all the text +
 * uploaded image references. (The Membership section is migrated separately by
 * migrateMembership.ts since it is shared with the Pricing page.)
 *
 * Run from the studio dir (after `sanity login`):
 *   npx sanity exec scripts/migrateHowItWorks.ts --with-user-token
 */
import {getCliClient} from 'sanity/cli'

const client = getCliClient()

// Every object inside a Sanity array needs a unique `_key`.
let keySeq = 0
const k = () => `k${(keySeq++).toString(36)}${Math.random().toString(36).slice(2, 8)}`
const withKeys = <T extends Record<string, any>>(arr: T[]) => arr.map((item) => ({_key: k(), ...item}))

// ---- image upload (dedup by source URL) -----------------------------------
const uploadCache = new Map<string, {_type: 'image'; asset: {_type: 'reference'; _ref: string}}>()

async function uploadImage(url: string) {
  const cached = uploadCache.get(url)
  if (cached) return cached

  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`)
  const buffer = Buffer.from(await res.arrayBuffer())
  const filename = url.split('/').pop()?.split('?')[0] || 'image'

  const asset = await client.assets.upload('image', buffer, {filename})
  const ref = {_type: 'image' as const, asset: {_type: 'reference' as const, _ref: asset._id}}
  uploadCache.set(url, ref)
  console.log(`  ↑ ${filename} → ${asset._id}`)
  return ref
}

const IMG = (id: string, q: string) => `https://framerusercontent.com/images/${id}${q}`

// ---- source content (verbatim from the Astro components) -------------------
const STEPS = [
  {
    step: '1. Define & Search',
    title: 'We Build Your Scorecard',
    body: 'One strategy call. We define the exact skills and traits of your perfect hire, build a detailed scorecard, and run a tailored search. No resume sifting required.',
    badgeColor: 'rgb(245, 184, 0)',
    icon: IMG('tMPTWbJMmWz7kgod9viysJbJ0Q4.png', '?width=116&height=91'),
    image: IMG('bFO4Z0NE1pTuVFwa9fZBV5pYfYM.jpg', '?width=584&height=389'),
  },
  {
    step: '2. Review & Interview',
    title: 'See the Full Picture, Not Just a Resume',
    body: 'Every candidate comes with a 360 profile: resume, video intro, strengths assessment, and recruiter evaluation. Review, pick your favorites, and go straight to final interviews.',
    badgeColor: 'rgb(92, 227, 176)',
    icon: IMG('0eXn9Gi0YXPQvSgyorPcfmCXQ8.png', '?width=135&height=95'),
    image: IMG('8mSHknuaPCTtSfyG3aEqc9jo.png', '?width=992&height=982'),
  },
  {
    step: '3. Hire & Onboard',
    title: 'Hit the Ground Running',
    body: 'Make the offer with our ready-to-go templates. Then we hand you a custom 30 to 90 day onboarding plan with clear milestones so your new hire ramps fast and stays long.',
    badgeColor: 'rgb(158, 152, 143)',
    icon: IMG('y748aq8arJEUxGeIq3UlUVboY.png', '?width=102&height=128'),
    image: IMG('G16I7eeZsAqgZOBPLwyMQwjJuo.png', '?width=992&height=982'),
  },
]

const TESTIMONIAL_AVATAR = 'https://framerusercontent.com/images/9x9lgYpbdPLt7Boj8OaTcDihg8.jpeg'

const RATING_CARDS = [
  {
    logo: 'https://framerusercontent.com/images/hH7NOswMFSZR1HNVnU3lAmkjs.png',
    logoAlt: 'G2',
    rating: '4.9 star rating',
    buttonLabel: 'Read G2 Reviews',
    buttonHref: 'https://www.g2.com/products/sagan-passport/reviews#reviews',
  },
  {
    logo: 'https://framerusercontent.com/images/aPaXgdHl45Ipxpu41l5DCZnRjMg.png',
    logoAlt: 'Clutch',
    rating: '4.8 star rating',
    buttonLabel: 'Read Clutch Reviews',
    buttonHref: 'https://clutch.co/profile/sagan-passport',
  },
]

const FAQS = [
  {
    question: 'What’s your vetting process for candidates?',
    answer:
      'We don’t send resumes. We send finalists.\n\nEvery candidate goes through a structured, multi-step screening process before you ever meet them:\n\nDirect sourcing from proven global markets (LATAM, South Africa, Eastern Europe, Asia-Pacific, and beyond)\n\nRole-specific experience validation\n\nLive English and communication interviews\n\nU.S. business culture alignment screening\n\nSkills assessments or portfolio review when applicable\n\nWe evaluate for competence, communication, and accountability. Only candidates who meet our standards are introduced to you.',
  },
  {
    question: 'What happens if Sagan can’t find the right role for my business requirements?',
    answer:
      'We are transparent from the start.\n\nBefore launching a search, we calibrate role scope, compensation, and expectations with you. If something is unrealistic, we’ll tell you upfront.\n\nIf we begin a search and the market requires adjustment, we provide:\n\nReal-time salary benchmarking\n\nMarket availability feedback\n\nRecommended refinements\n\nIf you don’t hire, there’s no obligation under our placement model. We succeed when you do.',
  },
  {
    question: 'Do you provide ongoing support after placement?',
    answer:
      'Yes. Our goal is long-term success, not a transaction.\n\nAfter placement, we provide:\n\nOnboarding guidance\n\nRemote management best practices\n\nSupport during the guarantee window\n\nOngoing hiring support for members\n\nWe stay involved to ensure the hire works.',
  },
  {
    question: 'What makes your talent pool different from other placement agencies?',
    answer:
      'Three things:\n\nFocus. We specialize in remote global talent for U.S. companies. It’s not an add-on. It’s our core business.\n\nPrecision. We present a curated shortlist, not a flood of unqualified applicants.\n\nDual alignment. We prepare both the employer and the candidate for a successful working relationship. That reduces friction and increases retention.',
  },
  {
    question: 'Can I request specialized or niche skills?',
    answer:
      'Yes.\n\nWe place talent across:\n\nIT and engineering\n\nFinance and accounting\n\nSales development and closers\n\nOperations and executive support\n\nMarketing, analytics, and growth roles\n\nIndustry-specific roles (home services, PE-backed platforms, real estate, and more)\n\nFor niche roles, we validate feasibility, confirm compensation ranges, and set realistic timelines before launching the search.',
  },
  {
    question: 'Do you offer a satisfaction or replacement guarantee?',
    answer:
      'Yes.\n\nAll placements are backed by a 90-day replacement guarantee. If the hire does not work out within that period due to performance or fit, we will conduct a replacement search at no additional placement fee.\n\nWe are aligned with you from day one. Our objective is a durable, high-performing hire.\n\nAnd for Sagan members we offer unlimited replacements for voluntary departures. At no additional cost, as long as a membership is active, any team member who resigns can be replaced with no time limits and no extra fees.',
  },
]

// ---- build + write ---------------------------------------------------------
async function main() {
  console.log('Uploading process step images…')
  const steps = []
  for (const s of STEPS) {
    steps.push({
      _type: 'processStep',
      step: s.step,
      title: s.title,
      body: s.body,
      badgeColor: s.badgeColor,
      icon: await uploadImage(s.icon),
      image: await uploadImage(s.image),
    })
  }

  console.log('Uploading proof images…')
  const avatar = await uploadImage(TESTIMONIAL_AVATAR)
  const ratingCards = []
  for (const r of RATING_CARDS) {
    ratingCards.push({
      _type: 'ratingCard',
      logo: await uploadImage(r.logo),
      logoAlt: r.logoAlt,
      rating: r.rating,
      buttonLabel: r.buttonLabel,
      buttonHref: r.buttonHref,
    })
  }

  const doc = {
    _id: 'howItWorks',
    _type: 'howItWorks',
    seoTitle: 'How It Works — Sagan Passport',
    hero: {
      heading: 'Stop Sifting.',
      body: 'Hiring shouldn’t be a second job. We do the heavy lifting and deliver a vetted shortlist of high-caliber talent, saving you dozens of hours.',
    },
    process: {
      heading: 'From Wishlist to A-Player',
      subcopy:
        'Our proven process finds, vets, and delivers your next great hire. You never have to touch a job board again.',
      steps: withKeys(steps),
    },
    proof: {
      eyebrow: 'Read the proof',
      heading: 'An Experience That’s “100 out of 100”',
      avatar,
      quote:
        '“The hiring process is honestly a little bit ridiculous in a good way. I wrote out a massive wish list for an executive admin... and Sagan came back in under a week with a candidate who matched my description almost exactly.”',
      name: 'Nick Fedele',
      org: 'Metal Alliance',
      ratingCards: withKeys(ratingCards),
    },
    faq: {
      heading: 'Frequently Asked Questions',
      items: withKeys(FAQS.map((f) => ({_type: 'faqItem', ...f}))),
    },
  }

  console.log('Writing howItWorks document…')
  await client.createOrReplace(doc)
  console.log('✓ Done. How It Works singleton created/replaced.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
