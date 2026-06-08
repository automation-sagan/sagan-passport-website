/**
 * One-off migration: download the Membership toggle tab photos from Framer, upload
 * them as Sanity assets, and create/replace the `membership` singleton with the
 * eyebrow/heading/subcopy + the 4 tabs and their benefits. This section is shared
 * by both the How It Works and Pricing pages. The benefit icons stay in code
 * (MembershipToggle.astro) — only the chosen `iconKey` is stored.
 *
 * Run from the studio dir (after `sanity login`):
 *   npx sanity exec scripts/migrateMembership.ts --with-user-token
 */
import {getCliClient} from 'sanity/cli'

const client = getCliClient()

let keySeq = 0
const k = () => `k${(keySeq++).toString(36)}${Math.random().toString(36).slice(2, 8)}`
const withKeys = <T extends Record<string, any>>(arr: T[]) => arr.map((item) => ({_key: k(), ...item}))

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

const IMG = (id: string, w: number, h: number) =>
  `https://framerusercontent.com/images/${id}.jpg?scale-down-to=1024&width=${w}&height=${h}`

// ---- source content (verbatim from MembershipToggle.astro) -----------------
const TABS = [
  {
    label: 'Hiring & Team Building',
    image: IMG('s5YEVMPmDbo6ye6I5pfcNqCOKI', 2731, 4096),
    items: [
      {iconKey: 'tag', title: 'Concierge Headhunting', description: 'Work 1:1 with our expert recruiters to define roles and run tailored searches for your perfect full-time team members.'},
      {iconKey: 'hand', title: 'Pathfinder Strategy Calls', description: 'Get 1-on-1 expert advice to clarify hiring needs, define roles, and structure your process.'},
      {iconKey: 'map', title: 'Custom Onboarding Support', description: 'Receive a tailored 30-90 day onboarding plan with templates and milestones for every new hire.'},
      {iconKey: 'doc', title: 'Offer Letter Templates', description: 'Streamline the formal hiring process with polished, ready-to-use offer letter templates designed to professionalize your offers.'},
    ],
  },
  {
    label: 'Education & Community',
    image: IMG('muCGFTkHW4JvyUrMvykUCx7b0', 4000, 6000),
    items: [
      {iconKey: 'chat', title: 'Sagan University Access', description: 'Daily live workshops and office hours covering leadership, knowledge worker organization, AI and automation for you and your entire team.'},
      {iconKey: 'star', title: 'Private Community', description: 'Connect with other Sagan members in a private network to ask questions, share strategies, and find practical advice on scaling.'},
      {iconKey: 'board', title: 'Sales Mastery Course', description: 'Gain free access to a legendary sales training program from John Costigan to master cold calling, objection handling, and closing deals.'},
      {iconKey: 'umbrella', title: 'EA Toolkit', description: 'Empower your Executive Assistant with a presentation packed with tools, training, and resources specifically designed to help your Executive Assistant thrive.'},
    ],
  },
  {
    label: 'Tools & Operations',
    image: IMG('DfiYG6f0XS5YLN0vJXe6l3VDKI8', 2048, 1365),
    items: [
      {iconKey: 'tools', title: 'Digital Power Tools', description: 'Access a suite of AI-enabled tools to streamline work, including Call Coach for analyzing sales calls and Road Recap for structured field updates.'},
      {iconKey: 'lock', title: 'Executive Coaching', description: 'Solve critical operational challenges with hands-on coaching to build systems for prioritization, delegation, and predictable execution.'},
    ],
  },
  {
    label: 'Compensation & Payroll',
    image: IMG('YGJIoW07iy1jRETsXW4zvYbMQ4', 4016, 6016),
    items: [
      {iconKey: 'layers', title: 'Global Compensation Guide', description: 'Eliminate the guesswork with a data-backed reference guide designed to help you set fair, competitive salaries for international talent.'},
      {iconKey: 'globe', title: 'Global Payment Solutions', description: 'Simplify contractor payments with our flat-fee Global Pay Direct solution or access exclusive discount rates for our partner payroll platforms.'},
    ],
  },
]

async function main() {
  console.log('Uploading membership tab photos…')
  const tabs = []
  for (const t of TABS) {
    tabs.push({
      _type: 'membershipTab',
      label: t.label,
      image: await uploadImage(t.image),
      items: withKeys(t.items.map((it) => ({_type: 'membershipItem', ...it}))),
    })
  }

  const doc = {
    _id: 'membership',
    _type: 'membership',
    eyebrow: 'Membership Benefits',
    heading: 'More Than a Recruiter:  A True Talent Partnership',
    subcopy:
      'Your membership is an investment in a rich support ecosystem that ensures retention and success. This is what sets Sagan apart. All benefits extend to your entire team.',
    tabs: withKeys(tabs),
  }

  console.log('Writing membership document…')
  await client.createOrReplace(doc)
  console.log('✓ Done. Membership singleton created/replaced.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
