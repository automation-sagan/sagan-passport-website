/**
 * One-off migration: download the Sagan University images from Framer, upload them
 * as Sanity assets, and create/replace the `saganUniversity` singleton with all the
 * text + uploaded image references.
 *
 * Run from the studio dir (after `sanity login`):
 *   npx sanity exec scripts/migrateSaganUniversity.ts --with-user-token
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

const IMG = 'https://framerusercontent.com/images/'

// ---- source content (verbatim from sagan-university.astro) -----------------
const COURSES = [
  {title: 'Founder & Executive Advanced Course', image: `${IMG}M9HEgTKIXEVmFypqOXJ1Gw2Q.png?width=1440&height=1092`},
  {title: 'AI & Automation Basics', image: `${IMG}yYz5a4qC5jzVKgOf6lzOSkqz8.png?width=1440&height=1092`},
  {title: 'Leadership & Management', image: `${IMG}FkFZKs0zthc8jijstdZYOYmjXVg.png?width=1440&height=1092`},
  {title: 'Sales Skills Sprint', image: `${IMG}pnAMupdd4VR8PpxVwj4W2tiXE.png?width=1440&height=1092`},
  {title: 'Global Talent Bootcamp GT 101', image: `${IMG}yvgtnYhcVlbs7N9HbtCFZQmUS4.png?width=1440&height=1092`},
  {title: 'Accent Reduction for Global Talent', image: `${IMG}FEBQHZBECq3Z5b6ftruoPxPJIt8.png?width=1440&height=1092`},
  {title: 'Content Skill Sprint', image: `${IMG}CryfaPLnFvEEILTbm47sbfsz8.png?width=1440&height=1092`},
]

const WHY_FEATURES = [
  {
    title: 'Taught by Operators',
    description:
      "Every instructor has built or scaled real businesses. Christian Ruff ran special operations teams. Jon runs a global workforce company. You're learning from people who do this work every day.",
    icon: `${IMG}Ek5Gd72myIK31IeBCl8vYhT3VQ.png?width=40&height=40`,
  },
  {
    title: 'For Business Owners and Their Teams',
    description:
      "Whether you're a founder who needs to delegate better or a global team member who wants to lead, Sagan U gives you practical skills that make you more valuable and more effective.",
    icon: `${IMG}fGLlswTUl3xMehUWiIQjDSPRJOY.png?width=40&height=40`,
  },
  {
    title: 'Immediate Application',
    description:
      "No theory lectures. Every session includes implementation assignments you apply to your actual work. You're not just learning concepts, you're building systems that make you more effective tomorrow.",
    icon: `${IMG}M4Ok34mQA59r46SvA16JT7SHsV8.png?width=40&height=40`,
  },
]

const PROGRAMS = [
  {
    title: 'Founder & Executive Program',
    tag: 'For business owners and C-level executives',
    body: 'Master strategic leadership, global talent integration, and operational excellence. Learn to delegate effectively, scale your business systems, and lead high-performance organizations across time zones and cultures. Our 3-year journey transforms how you think about growth, automation, and building sustainable business operations.',
    icon: `${IMG}l0yEQ46rzKhkZhDNoXzKOZYj0.png?width=32&height=32`,
  },
  {
    title: 'Team Leader Program',
    tag: 'For business owners and C-level executives',
    body: "Develop the skills to lead effectively in a global, remote-first world. From AI-enhanced leadership and project management to building accountability and managing cross-functional teams, you'll gain the tools to drive results while developing your people. Complete your leadership transformation in 2.5 years.",
    icon: `${IMG}M75SVdAYqm9mU6JNJHXalHyrNE.png?width=32&height=32`,
  },
  {
    title: 'Skilled Specialist Program',
    tag: 'For business owners and C-level executives',
    body: 'Excel in Western business environments with cultural fluency, advanced communication skills, and productivity mastery. Learn American business culture, professional development strategies, and how to become an indispensable team member who takes initiative and drives results.',
    icon: `${IMG}b0l4jDQXV1TjCI7tlgHIFlp0tY.png?width=32&height=32`,
  },
]

const CHECKS = [
  "Live sessions taught by operators who've built real businesses",
  'Implementation assignments you complete on your actual work',
  'Weekly office hours for specific questions on hiring, operations, finance, and systems',
  'AI and automation training focused on tools that actually create leverage',
  'Ongoing access to community, resources, and recordings',
]

const CHECK_ICON = `${IMG}1i53LccbVs7fHThj7a2TfwA.png?width=40&height=40`
const CARD_IMAGE = `${IMG}L89UbKY0FjhUiAEC8E9DYVzNcE.png`
const VIDEO_POSTER = `${IMG}4zpDK4lFBWCwhexbvuq8dSMtdQ.jpg`
const CASE_STUDY_YOUTUBE_ID = 'BS_UI7E4k2M'

const TESTIMONIALS = [
  {
    image: `${IMG}MSqCWMpX1xnbTTDzvPcPpc0E6ss.jpeg?width=200&height=200`,
    quote:
      '"This gave me a clear playbook for managing people better-not just in theory, but in the day-to-day work of leading a small team."',
    name: 'Wes Kauffman',
    title: 'CEO, Concordia Holdings Lancaster',
  },
]

// ---- build + write ---------------------------------------------------------
async function main() {
  console.log('Uploading course covers…')
  const courses = []
  for (const c of COURSES) courses.push({_type: 'course', title: c.title, image: await uploadImage(c.image)})

  console.log('Uploading why-feature icons…')
  const features = []
  for (const f of WHY_FEATURES) {
    features.push({_type: 'feature', title: f.title, description: f.description, icon: await uploadImage(f.icon)})
  }

  console.log('Uploading program icons…')
  const programs = []
  for (const p of PROGRAMS) {
    programs.push({_type: 'program', title: p.title, tag: p.tag, body: p.body, icon: await uploadImage(p.icon)})
  }

  console.log('Uploading approach + case-study images…')
  const checkIcon = await uploadImage(CHECK_ICON)
  const cardImage = await uploadImage(CARD_IMAGE)
  const poster = await uploadImage(VIDEO_POSTER)

  console.log('Uploading testimonial avatars…')
  const testimonials = []
  for (const t of TESTIMONIALS) {
    testimonials.push({_type: 'slide', image: await uploadImage(t.image), quote: t.quote, name: t.name, title: t.title})
  }

  const doc = {
    _id: 'saganUniversity',
    _type: 'saganUniversity',
    seoTitle: 'Sagan University — Sagan Passport',
    hero: {
      heading: 'Learn What Matters. Lead with Confidence.',
      subheading: 'Practical Training for Leaders Who Actually Do the Work.',
      body: 'Sagan University helps business leaders and global teams level up fast, with practical, modern training tailored for the real world.',
      buttons: withKeys([
        {_type: 'button', label: 'Learn More', href: '/sagan-university#why', variant: 'outline', external: false},
        {_type: 'button', label: 'Start Now', href: '/pricing', variant: 'fill', external: false},
      ]),
    },
    coursesLabel: 'Featured Sagan University Courses',
    courses: withKeys(courses),
    why: {
      heading: 'Why Sagan University?',
      body: 'We built Sagan U to train the 21st-century workforce, business owners, team leaders, and global hires alike. Our courses are practical, fast-paced, and built for action.',
      features: withKeys(features),
    },
    programs: withKeys(programs),
    approach: {
      eyebrow: 'Our Unique Approach',
      heading: 'Practical Implementation Over Theory',
      checks: CHECKS,
      checkIcon,
      cardImage,
      cardHeading: 'Why Sagan University Works',
      cardBody:
        'Sagan University is built on years of hands-on experience integrating global talent into real businesses. We teach teams how to execute with clear decision rights, strong ownership, and systems that turn strategy into action using AI and automation where they actually create leverage. Whether you’re scaling a business, leading a team, or developing as global talent, Sagan University delivers practical skills, operational clarity, and implementation support to help you perform at a higher level.',
    },
    testimonials: withKeys(testimonials),
    caseStudy: {
      heading: 'Voices at Sagan University',
      body: 'Practical, immediately useful training delivered fast. In just an hour, members gain knowledge they’d otherwise spend weeks hunting down, with sessions that translate directly into better communication, leadership, and day-to-day execution across both global and U.S.-based teams.',
      youtubeId: CASE_STUDY_YOUTUBE_ID,
      poster,
    },
  }

  console.log('Writing saganUniversity document…')
  await client.createOrReplace(doc)
  console.log('✓ Done. Sagan University singleton created/replaced.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
