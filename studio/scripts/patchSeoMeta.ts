/**
 * One-off backfill: bring the SEO head data over from the live Framer site
 * (saganpassport.com, captured 2026-06-11).
 *
 *   1. Downloads the Framer social-share card + org logo and uploads both as
 *      Sanity image assets (so they are editable in the Studio from then on).
 *   2. Creates the `siteSettings` singleton (site name, site URL, default
 *      og image, Organization logo for JSON-LD).
 *   3. Patches the homepage / pricing / howItWorks / saganUniversity
 *      singletons with the live page titles and meta descriptions.
 *
 * Run from the studio dir (after `sanity login`):
 *   npx sanity exec scripts/patchSeoMeta.ts --with-user-token
 */
import {getCliClient} from 'sanity/cli'

const client = getCliClient()

// Live Framer CDN sources (verified against the production pages).
const OG_IMAGE_URL = 'https://framerusercontent.com/images/QiLHdBjoT2MhVEIhkenHDfEvUWk.png'
const LOGO_URL = 'https://framerusercontent.com/images/S1c1B9DfvYAUAWhvNHvghzfQBjQ.png'

// Live <title> + <meta name="description"> per page.
const PAGE_SEO: Record<string, {seoTitle: string; seoDescription: string}> = {
  homepage: {
    seoTitle: 'Sagan Passport — Hire World-Class International Talent',
    seoDescription:
      'Hire vetted, full-time international talent from $1,100/month. Sagan Passport finds, vets, and places global A-players for founders, executives, and growing companies.',
  },
  pricing: {
    seoTitle: 'Sagan Passport Pricing — International Hiring from $499/Mo',
    seoDescription:
      'Transparent pricing for hiring vetted global talent. One-time placements from $500 deposit, or monthly membership from $499. No hidden fees. 90-day replacement guarantee included.',
  },
  howItWorks: {
    seoTitle: 'How Sagan Passport Works — Global Hiring Made Simple',
    seoDescription:
      'See exactly how Sagan Passport finds, vets, and delivers your next world-class international hire. Strategy call, 360 candidate profiles, offer templates, and 30-90 day onboarding plans included.',
  },
  saganUniversity: {
    seoTitle: 'Sagan University — Training for Leaders and Global Teams',
    seoDescription:
      'Sagan University offers practical training for founders, executives, and international hires. Courses in AI and automation, leadership, sales, and global talent management — taught by operators.',
  },
}

async function uploadImage(url: string, filename: string) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to download ${url}: ${res.status}`)
  const buffer = Buffer.from(await res.arrayBuffer())
  const asset = await client.assets.upload('image', buffer, {filename})
  console.log(`Uploaded ${filename} → ${asset._id}`)
  return asset._id
}

async function run() {
  const [ogAssetId, logoAssetId] = await Promise.all([
    uploadImage(OG_IMAGE_URL, 'social-share-card.png'),
    uploadImage(LOGO_URL, 'sagan-passport-logo.png'),
  ])

  const imageRef = (assetId: string) => ({
    _type: 'image' as const,
    asset: {_type: 'reference' as const, _ref: assetId},
  })

  await client.createOrReplace({
    _id: 'siteSettings',
    _type: 'siteSettings',
    siteName: 'Sagan Passport',
    siteUrl: 'https://saganpassport.com',
    ogImage: imageRef(ogAssetId),
    logo: imageRef(logoAssetId),
  })
  console.log('Created siteSettings singleton')

  for (const [id, seo] of Object.entries(PAGE_SEO)) {
    await client.patch(id).set(seo).commit()
    console.log(`Patched ${id}: "${seo.seoTitle}"`)
  }

  console.log('Done.')
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
