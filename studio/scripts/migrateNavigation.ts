/**
 * One-off seed: upload the navbar logo icon + dropdown menu icons (from
 * web/public/images) as Sanity assets and create/replace the `navigation`
 * singleton, mirroring the DEFAULT_NAV hardcoded in web/src/components/Navbar.astro.
 *
 * Run from the studio dir (after `sanity login`):
 *   npx sanity exec scripts/migrateNavigation.ts --with-user-token
 */
import {readFileSync} from 'node:fs'
import {resolve} from 'node:path'
import {getCliClient} from 'sanity/cli'

const client = getCliClient()

let keySeq = 0
const k = () => `k${(keySeq++).toString(36)}${Math.random().toString(36).slice(2, 8)}`

const uploadCache = new Map<string, {_type: 'image'; asset: {_type: 'reference'; _ref: string}}>()
async function uploadLocalImage(relPath: string) {
  const cached = uploadCache.get(relPath)
  if (cached) return cached
  const abs = resolve(__dirname, relPath)
  const asset = await client.assets.upload('image', readFileSync(abs), {
    filename: abs.split('/').pop(),
  })
  const ref = {_type: 'image' as const, asset: {_type: 'reference' as const, _ref: asset._id}}
  uploadCache.set(relPath, ref)
  console.log(`  ↑ ${abs.split('/').pop()} → ${asset._id}`)
  return ref
}

const icon = (name: string) => uploadLocalImage(`../../web/public/images/nav-icon-${name}.png`)

const PORTAL_URL = 'https://portal.saganpassport.com'
const CALENDLY_URL =
  'https://calendly.com/d/5j7-3xv-p5k/global-talent-hiring-consultation?utm_source=saganpassportdotcom&utm_term=talent'
const AI_AGENTS_URL = 'https://saganpassport.com/ai-agent'

async function card(title: string, description: string, iconName: string, href: string) {
  return {
    _type: 'navCard',
    _key: k(),
    title,
    description,
    icon: await icon(iconName),
    href,
    external: false,
  }
}

const linkItem = (label: string, href: string, external = false) => ({
  _type: 'navItem',
  _key: k(),
  label,
  type: 'link',
  href,
  external,
})

async function run() {
  console.log('Uploading navbar images…')
  const logoIcon = await uploadLocalImage('../../web/public/images/navbar-logo-icon.png')

  const doc = {
    _id: 'navigation',
    _type: 'navigation',
    logoIcon,
    items: [
      linkItem('How It Works', '/how-it-works'),
      linkItem('Pricing', '/pricing'),
      {
        _type: 'navItem',
        _key: k(),
        label: 'Customers',
        type: 'dropdown',
        wide: true,
        cards: [
          await card('Home Services', 'HVAC, plumbing, electrical, roofing, pest control, landscaping.', 'generic', '/customers/home-services'),
          await card('Private Equity & Holding', 'For firms that acquire and manage a portfolio of operating companies.', 'private-equity', '/customers/private-equity'),
          await card('Small Businesses', 'Startups, local agencies, solo consultants, healthcare.', 'small-businesses', '/customers/small-businesses'),
          await card('Health & Wellness', 'Medical practices, dental groups, clinics, pharmacies, and functional medicine.', 'health-wellness', '/customers/health-wellness'),
          await card('Franchises', 'Multi-location QSR, fitness, retail, and service franchisors and franchisees.', 'franchises', '/customers/franchises'),
          await card('Professional Services', 'Law firms, accounting firms, and consulting practices.', 'professional-services', '/customers/professional-services'),
          await card('Real Estate', 'Residential, commercial, property management, and real estate investment firms.', 'real-estate', '/customers/real-estate'),
        ],
      },
      linkItem('Sagan University', '/sagan-university'),
      {
        _type: 'navItem',
        _key: k(),
        label: 'Resources',
        type: 'dropdown',
        wide: false,
        cards: [
          await card('Resources', 'Case studies, guides, and thought leadership from our team.', 'generic', '/resources'),
          await card('Blog', 'Hiring insights, guides, and updates from Sagan Passport.', 'generic', '/blog'),
        ],
      },
      linkItem('AI Agents', AI_AGENTS_URL, true),
    ],
    signIn: {label: 'Sign In', url: PORTAL_URL},
    scheduleCall: {label: 'Schedule a Call', url: CALENDLY_URL},
  }

  await client.createOrReplace(doc)
  console.log('✓ navigation singleton created')
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
