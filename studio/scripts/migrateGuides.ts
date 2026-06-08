/**
 * One-off migration: create/replace the three lead-magnet `guide` documents
 * (hiring, compensation, delegation). Text is copied verbatim from the source
 * HTML in "Sagan passport Domain/guides/<slug>/index.html"; cover images come
 * from the Supabase CDN used by the source pages; the delivered PDFs are read
 * from "Sagan passport Domain/api/_assets/" and uploaded as Sanity file assets
 * (so /api/send-guide can fetch them server-side — the PDF is never linked from
 * the public page).
 *
 * Multi-entry: 3 documents, one per guide, fixed dot-free _id so createOrReplace
 * overwrites just that doc and the tokenless build can read it.
 *
 * Run from the studio dir (after `sanity login`):
 *   npx sanity exec scripts/migrateGuides.ts --with-user-token
 */
import {getCliClient} from 'sanity/cli'
import {readFileSync} from 'node:fs'
import {resolve} from 'node:path'

const client = getCliClient()

// Every object inside a Sanity array needs a unique `_key`.
let keySeq = 0
const k = () => `k${(keySeq++).toString(36)}${Math.random().toString(36).slice(2, 8)}`
const withKeys = <T extends Record<string, any>>(arr: T[]) => arr.map((item) => ({_key: k(), ...item}))

// PDFs live in the (read-only) source repo, relative to the studio cwd.
const ASSETS_DIR = resolve(process.cwd(), '..', 'Sagan passport Domain', 'api', '_assets')

// ---- image upload (dedup by source URL) -----------------------------------
const imageCache = new Map<string, {_type: 'image'; asset: {_type: 'reference'; _ref: string}}>()
async function uploadImage(url: string) {
  const cached = imageCache.get(url)
  if (cached) return cached
  const res = await fetch(url)
  if (!res.ok) throw new Error(`fetch ${url}: ${res.status} ${res.statusText}`)
  const buffer = Buffer.from(await res.arrayBuffer())
  const filename = decodeURIComponent(url.split('/').pop()?.split('?')[0] || 'image')
  const asset = await client.assets.upload('image', buffer, {filename})
  const ref = {_type: 'image' as const, asset: {_type: 'reference' as const, _ref: asset._id}}
  imageCache.set(url, ref)
  console.log(`  ↑ image ${filename} → ${asset._id}`)
  return ref
}

// ---- pdf upload from local disk -------------------------------------------
async function uploadPdf(filename: string) {
  const buffer = readFileSync(resolve(ASSETS_DIR, filename))
  const asset = await client.assets.upload('file', buffer, {filename, contentType: 'application/pdf'})
  const ref = {_type: 'file' as const, asset: {_type: 'reference' as const, _ref: asset._id}}
  console.log(`  ↑ pdf ${filename} → ${asset._id}`)
  return ref
}

const PORTAL_ID = '50517161'
const FORM_GUID = 'daac2804-e5c3-48e7-8ab7-a5b41c9e7c38'

async function main() {
  // ---- hiring (designed cover, red) ----
  const hiring = {
    _id: 'guide-hiring',
    _type: 'guide',
    title: 'Hiring Swipe File',
    slug: {_type: 'slug', current: 'hiring-guide'},
    seoTitle: 'The Global Talent Hiring Swipe File — 50 Job Descriptions Ready to Post',
    seoDescription: undefined,
    canonical: 'https://saganpassport.com/guides/hiring-guide',
    accent: {cta: '#B71C1C', ctaHover: '#8E0000', ctaActive: '#6D0000', focus: '#E53935', bright: '#E53935'},
    intro: 'Writing job descriptions from scratch is a waste of your time.',
    headline: '50 Job Descriptions. Copy. Paste. Hire.',
    valueProp:
      'Every JD in this file came from a real hire that actually worked. Salary ranges, target regions, and requirements included. Just change the company name and post.',
    bullets: [
      '11 categories — admin, sales, finance, ops, marketing, dev, and more',
      'Real salary data from 1,358 placements across 30+ countries',
      'Average time to fill: 14 days',
    ],
    bulletStyle: 'squares',
    coverVariant: 'designed',
    designed: {
      tag: 'Resource Guide · 2026',
      titleLead: 'The Global Talent',
      titleAccent: 'Hiring Swipe File',
      subtitle: '50 job descriptions you can\ncopy, paste, and post today.',
      stats: withKeys([
        {_type: 'guideStat', num: '1,358+', label: 'Placements'},
        {_type: 'guideStat', num: '50', label: 'Job Descriptions'},
        {_type: 'guideStat', num: '14', label: 'Avg. Days to Fill'},
        {_type: 'guideStat', num: '30+', label: 'Countries'},
      ]),
      brand: 'Sagan',
      badge: 'Free Download',
    },
    formLabel: 'Get the swipe file',
    formLabelNote: '(free for now, not forever)',
    buttonText: 'Send me the swipe file',
    successMessage: '✓ Check your inbox — the Hiring Swipe File is on its way.',
    guideSlug: 'hiring',
    portalId: PORTAL_ID,
    formGuid: FORM_GUID,
    pdfFile: await uploadPdf('Sagan_GlobalTalent_HiringSwipeFile_v2.pdf'),
    emailSubject: 'Your Hiring Swipe File is here',
    emailTitle: 'The Sagan Hiring Swipe File',
    emailIntro: 'The playbook we use to source, vet, and place global talent for US small businesses.',
  }

  // ---- compensation (single image, navy) ----
  const compensation = {
    _id: 'guide-compensation',
    _type: 'guide',
    title: 'Compensation Guide',
    slug: {_type: 'slug', current: 'compensation-guide'},
    seoTitle: '2026 Global Talent Compensation Guide — Sagan Passport',
    canonical: 'https://saganpassport.com/guides/compensation-guide',
    accent: {cta: '#1B3A5C', ctaHover: '#0F2740', ctaActive: '#0A1C30', focus: '#1B3A5C'},
    intro: "You're either overpaying or losing the hire.",
    headline: 'The 2026 Global Compensation Guide',
    valueProp:
      'Exact salary ranges for 50+ roles across 30+ countries. Not scraped from job boards — built from 2,000+ placements we actually made.',
    bullets: [
      'Benchmarks for every department — ops, finance, engineering, marketing, sales',
      "Region-by-region breakdowns so you don't overpay or lowball",
      'The hiring hotspots your competitors are already using',
    ],
    bulletStyle: 'disc',
    coverVariant: 'image',
    coverImage: await uploadImage(
      'https://wiwfkcbcplgrbqhjaqbx.supabase.co/storage/v1/object/public/Public%20Image/personality%20(1).jpg',
    ),
    coverImageAlt: '2026 Global Talent Compensation Guide',
    formLabel: 'Get the guide',
    formLabelNote: '(free for now, not forever)',
    buttonText: 'Send me the guide',
    successMessage: '✓ Check your inbox — the 2026 Global Compensation Guide is on its way.',
    guideSlug: 'compensation',
    portalId: PORTAL_ID,
    formGuid: FORM_GUID,
    pdfFile: await uploadPdf('Global Talent Compensation Guide 2026 - SAGAN PASSPORT.pdf'),
    emailSubject: 'Your 2026 Global Compensation Guide is here',
    emailTitle: 'The 2026 Global Compensation Guide',
    emailIntro:
      'Exact salary ranges for 50+ roles across 30+ countries — built from 2,000+ placements we actually made.',
  }

  // ---- delegation (layered photo + product card, green) ----
  const delegation = {
    _id: 'guide-delegation',
    _type: 'guide',
    title: 'Delegation Database',
    slug: {_type: 'slug', current: 'delegation-guide'},
    seoTitle: 'The Delegation Database — 50 Tasks to Stop Doing Yourself',
    canonical: 'https://saganpassport.com/guides/delegation-guide',
    accent: {cta: '#1B5E3B', ctaHover: '#14472D', ctaActive: '#061C1E', focus: '#1B5E3B'},
    intro: "This is you, isn't it?",
    headline: 'The Delegation Database',
    valueProp:
      'Built from 2,000+ real hires we placed for US small businesses. These are the exact tasks owners were doing themselves — and the exact dollar amounts they saved after they stopped.',
    bullets: [
      'The 50 highest-ROI tasks to hand off this week',
      'Exact cost savings for each (US vs. global talent)',
      'A 5-day delegation starter pack',
    ],
    bulletStyle: 'disc',
    coverVariant: 'layered',
    layered: {
      photo: await uploadImage(
        'https://wiwfkcbcplgrbqhjaqbx.supabase.co/storage/v1/object/public/Public%20Image/personality.jpg',
      ),
      logo: 'Sagan',
      title: '50 Tasks to Stop Doing Yourself This Week',
      subtitle: 'The Delegation Database for Business Owners',
      learn: [
        '50 tasks ranked by ROI',
        'Exact cost savings per task',
        '"First Five" starter pack',
        'The $100K calculator',
      ],
      badge: 'FREE DOWNLOAD',
      brand: 'getsagan.com',
    },
    formLabel: 'Get the database',
    formLabelNote: '(free for now, not forever)',
    buttonText: 'Get it now',
    successMessage: '✓ Check your inbox — the Delegation Database is on its way.',
    guideSlug: 'delegation',
    portalId: PORTAL_ID,
    formGuid: FORM_GUID,
    pdfFile: await uploadPdf('TheDelegationDatabase_Sagan.pdf'),
    emailSubject: 'Your Delegation Database is here',
    emailTitle: 'The Delegation Database',
    emailIntro:
      'Built from 2,000+ real hires we placed for US small businesses — the exact tasks owners were doing themselves, and the dollar amounts they saved after they stopped.',
  }

  for (const doc of [hiring, compensation, delegation]) {
    const res = await client.createOrReplace(doc)
    console.log(`✓ ${doc._id} written. _rev=${res._rev}`)
  }
  const count = await client.fetch('count(*[_type == "guide"])')
  console.log(`\n✓ Done. guide docs now in dataset: ${count}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
