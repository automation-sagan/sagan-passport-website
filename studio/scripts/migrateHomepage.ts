/**
 * One-off migration: download the homepage images from Framer, upload them as
 * Sanity assets, and create/replace the `homepage` singleton with all the text +
 * uploaded image references.
 *
 * Run from the studio dir (after `sanity login`):
 *   npx sanity exec scripts/migrateHomepage.ts --with-user-token
 */
import {getCliClient} from 'sanity/cli'

const client = getCliClient()

// Every object inside a Sanity array needs a unique `_key`. The Studio adds
// these automatically in the UI, but an API client must supply them.
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

/** Resolve an array of objects, uploading the image at `key` (a URL) in place. */
async function withImages<T extends Record<string, any>>(items: T[], key: string) {
  const out: any[] = []
  for (const item of items) {
    const {[key]: url, ...rest} = item
    out.push(url ? {...rest, [key === 'img' ? 'image' : key]: await uploadImage(url)} : rest)
  }
  return out
}

// ---- source content (verbatim from the Astro components) -------------------
const SCALE_COPY =
  'You know you need to build infrastructure, launch a marketing department, and stop wearing multiple hats. But hiring in the US is costly and slow. It feels like you must be “three or four times larger” just to afford the team you need today.'

const TALENT = [
  {name: 'Marjorie', role: 'Paralegal', rate: '$1,750/month', img: 'https://framerusercontent.com/images/vSt7nb9t3DaHFuzc1y56VQGwm18.jpg'},
  {name: 'Agostina', role: 'Customer Service Rep.', rate: '$1,200/month', img: 'https://framerusercontent.com/images/TiA6S2G3USn1z6Yfkh3iXHFNmw.png'},
  {name: 'Nivah', role: 'Sr. Product Designer', rate: '$2,250/month', img: 'https://framerusercontent.com/images/9B4nbheGCkylXPMEqKfeQL4264.png'},
  {name: 'Sreejith', role: 'Certified Accountant', rate: '$1,950/month', img: 'https://framerusercontent.com/images/DAMgEM6rQq4fpZSwkUXKGsxLmE.png'},
  {name: 'Franco', role: 'Executive Assistant', rate: '$1,120/month', img: 'https://framerusercontent.com/images/nRWIyMkOuHG7M0pozlFagicyHM.png'},
]

const LOGOS = [
  'https://framerusercontent.com/images/eKAeZu7CeNNNgvsG2gnPRbA54U.png',
  'https://framerusercontent.com/images/2AOlCwL47gQ0UV2t9PF9gKHsEw.png',
  'https://framerusercontent.com/images/tLdIHarwClKTRzfRrxckYjcjF4.png',
  'https://framerusercontent.com/images/oEANEkU4euPX8SBX3TFHdDTXGSA.png',
  'https://framerusercontent.com/images/whZAmHH8URes7INoZwn3QF0orSA.png',
  'https://framerusercontent.com/images/t812LjBNw9KO2N4RGgagK2BXM.png',
  'https://framerusercontent.com/images/1Jp2sAmgsZ0i21svt61V4ZHp8YU.png',
  'https://framerusercontent.com/images/UedK6cz2sLttbl5hnRwSCg5K1OI.png',
  'https://framerusercontent.com/images/oiNpaNnoLxUqG87c0sjTzTVFt34.png',
  'https://framerusercontent.com/images/IxBSpMDbhMRwiU7ZRubFFTxgIfE.png',
  'https://framerusercontent.com/images/g6nGUAXRrr6hiWIRf2j2nMjc.png',
  'https://framerusercontent.com/images/ifricpR8ZnE7oUO6ZSnRepiQFY.png',
]

const BIGCARD_BG = 'https://framerusercontent.com/images/9QuYDHuySTjqfg5yR0A6IAc235E.png'

const FEATURES = [
  {title: 'Outstanding Vetted Talent', description: 'We screen hundreds so you only meet the best. No more sorting through the "riff-raff".'},
  {title: 'True Team Members', description: 'Find loyal, full-time hires who integrate with your team, not temporary freelancers.'},
  {title: 'An Entire Growth Ecosystem', description: 'Access to leadership training, a community of founders, and proven success frameworks.'},
]

const SLIDES = [
  {
    image: 'https://framerusercontent.com/images/GfGkADagM4KEibNcIiRUWlfrR0.jpg',
    quote:
      '"Global talent allows us to punch far above our weight class. We’re now able to do things that we shouldn’t be able to do until we’re much larger. It’s this flywheel that keeps spinning and pushes growth across the business."',
    name: 'Nick Fedele',
    title: 'Metal Alliance',
  },
  {
    image: 'https://framerusercontent.com/images/mbnSG60dpb8dSFDSkCCBCWkXR1M.jpg?width=400&height=400',
    quote:
      '"Sagan’s easily the highest value service we use — and I wouldn’t say that if it wasn’t far-and-away true."',
    name: 'Rich Jordan',
    title: 'From X',
  },
  {
    image: 'https://framerusercontent.com/images/8u1vEzAJ5XyEKVBEqsRhqSHQfk.jpg?width=400&height=400',
    quote:
      '"My global talent team is up to 5 now, all thanks to @MatznerJon and Sagan. Amazing people — much more skilled than I ever dreamed."',
    name: 'Alex Kirby',
    title: 'From X',
  },
]

const X_LOGO = 'https://framerusercontent.com/images/yJo3UUAYt6EgqcY1psGtJijPAbQ.jpg?width=733&height=716'

const TESTIMONIALS = [
  {name: 'Matthias Smith', subtitle: 'From X', quote: 'Quoting @SaganPassport. I’ve saved myself thousands of dollars in time and lost productivity working with @MatznerJon and his team to hire talent at @PIONEERCAPADV since the start of 2025. Many SMB owners undervalue their time in the hiring process—beyond just the recruiting fee, it’s critical not to underestimate the opportunity cost of your own hours. I’m very bullish on both Sagan and what @pinpulleddrmf is building at Uncommon Elite, placing former special forces operators with growing companies', avatar: 'https://framerusercontent.com/images/ipo7yh2BwBHlryqNrybfc9s.jpg?width=400&height=400', logo: X_LOGO},
  {name: 'JC Sutherland', subtitle: 'From X', quote: "This is sick. We just hired our first ops coordinator through Sagan and it's been amazing, but to see it impact the top of the sales funnel is another level. Could see this being an intro into light design + build for us", avatar: 'https://framerusercontent.com/images/T29790yq9EDbOHd7AJEn1TZWack.jpg?width=400&height=400', logo: X_LOGO},
  {name: 'Alex Kirby', subtitle: 'From X', quote: 'My global talent team is up to 5 now, all thanks to @MatznerJon and Sagan. I’ve found a lot of success with Argentians; and they are only a one hour time difference. Amazing people. Much more skilled than I ever dreamed.', avatar: 'https://framerusercontent.com/images/8u1vEzAJ5XyEKVBEqsRhqSHQfk.jpg?width=400&height=400', logo: X_LOGO},
  {name: 'Charles Miller', subtitle: 'From X', quote: 'Another day, another project that my @SaganPassport PM delivered a project with 50% higher GM than my in-person team', avatar: 'https://framerusercontent.com/images/5FnBpLpo5yqZf4U2ykCsQXZBPc.jpeg?width=400&height=400', logo: X_LOGO},
  {name: 'Brad Smith', subtitle: 'From X', quote: 'Franchisees getting value means this stuff is legit, not just hype.', avatar: 'https://framerusercontent.com/images/xWQEnPVGGMBgW35f1O9j3nRsu8.jpg?width=400&height=400', logo: X_LOGO},
  {name: 'Wes Gay', subtitle: 'From X', quote: 'I’ve been a solo consultant since 2016 Hired a BELAY VA in 2017 Just hired a PM through @SaganPassport last month. Probably 6 years too late Next up is an AI/automation person & marketing coordinator. Finally building a team Let’s go', avatar: 'https://framerusercontent.com/images/mkJtGkJh0keM0Uox84qlN8mdxU.jpg?width=400&height=400', logo: X_LOGO},
  {name: 'Rich Jordan', subtitle: 'From X', quote: "Sagan's easily the highest value service we use - and I wouldn't say that if it wasn't far-and-away true.", avatar: 'https://framerusercontent.com/images/mbnSG60dpb8dSFDSkCCBCWkXR1M.jpg?width=400&height=400', logo: X_LOGO},
  {name: 'Abhi Ravishankar', subtitle: 'From X', quote: "Just spent 45 mins talking to @MatznerJon and he's authentic to his X persona in real life. A fireball of energy and ideas - absolutely awesome conversation! And yes, I signed up for @SaganPassport (knew I was doing that even before I spoke to him!) LFGial", avatar: 'https://framerusercontent.com/images/T9pMJMnYsHxk7JjN7cgOoDgFUXo.jpg?width=400&height=400', logo: X_LOGO},
  {name: 'Greg Van Horn', subtitle: 'From X', quote: "Onboarded an executive admin today. (Thank you @SaganPassport ) She's from Colombia and is going to be a star.", avatar: 'https://framerusercontent.com/images/M4cIFNZXUxMzzn7dGC1zoRJIi8Q.jpg?width=400&height=400', logo: X_LOGO},
  {name: 'Ken Otto', subtitle: 'From X', quote: '1st week in the books with our new hire from @SaganPassport @MatznerJon - @BinsiDevadasan and team did a great job finding JN. They found him faster than we were ready to take him on! And now he’s pumping out work faster than we can feed it to him! Game changer all around', avatar: 'https://framerusercontent.com/images/jy57YTBtxNMH7ghxC5lsH0qy91g.jpg?width=400&height=400', logo: X_LOGO},
  {name: 'Josh Schulz', subtitle: 'From X', quote: "The economics on hiring through Passport are crazy. I've used them for 4 hires - each one amazing and crushing it!", avatar: 'https://framerusercontent.com/images/JiagS7bDXgNobinX4lv8WgLa6I.jpg?width=400&height=400', logo: X_LOGO},
  {name: 'Chad Nelson', subtitle: 'From X', quote: "In the past two weeks I've received several cold DMs and emails pitching me on hiring remote talent. If we ever made the decision to hire remote talent, Sagan Passport is the only company we would ever use.", avatar: 'https://framerusercontent.com/images/Kg9WMmkC5z1qATu9mNnvdsVAgEU.jpg?width=400&height=400', logo: X_LOGO},
  {name: 'Ben Billups', subtitle: 'From X', quote: "We're hiring 5 roles this month. Sagan is our #1 pipeline for high quality talent without the leg work.", avatar: 'https://framerusercontent.com/images/CEfz7SC3tBBO46ZpnOcer9HLpIA.jpg?width=400&height=400', logo: X_LOGO},
  {name: 'Brock Briggs', subtitle: 'From X', quote: '@MatznerJon is your guy - better service, better price, and better for your prospective hire.', avatar: 'https://framerusercontent.com/images/HH2WjHlaGOpSI1dYOacnQ0tzJVg.png?width=400&height=400', logo: X_LOGO},
  {name: 'Nick Garren', subtitle: 'From X', quote: "While we haven't started yet (we will), I gotta give Sagan a shout out. We've talked to several companies about overseas talent and Sagan had the best offer with the best perks for the least amount of cost to us. Plus Rene really made me feel comfortable and welcome. Let's go!", avatar: 'https://framerusercontent.com/images/bJmhfVJM7EtQFDelEapkz6BHtJg.jpg?width=400&height=400', logo: X_LOGO},
  {name: 'John Kelly', subtitle: 'From X', quote: 'Thanks! I’d argue that the hiring is a really small component of the value of @SaganPassport . The trainings, the Skool community, and the network have been terrific. I’m really learning how to manage as well. I truly believe this remote hire would have failed without that support', avatar: 'https://framerusercontent.com/images/wcPnKfL00hSNfaSwP6wt6Thhrc.jpg?width=400&height=400', logo: X_LOGO},
  {name: 'Neel Parekh', subtitle: 'From X', quote: "At the risk of making his head even bigger, @MatznerJon is a walking knowledge bomb when it comes to practical use of AI in business. Some of my franchisees were on the Sagan AI call yesterday and shared the below. @ Jon - chill, don't frame this, be cool.", avatar: 'https://framerusercontent.com/images/wvdRtxAsxMbKwRPsbVCnzcUQ.jpg?width=400&height=400', logo: X_LOGO},
  {name: 'Tyler Groce', subtitle: 'From X', quote: 'Rarely do you find yourself increasingly pleased as time goes on when you buy a membership. Especially one paid annually. But I am just that! Thank you.', avatar: 'https://framerusercontent.com/images/x8eqTvSqeSO7uxPgk1yFBtWRc.jpg?width=400&height=400', logo: X_LOGO},
  {name: 'Brandon Dixon', subtitle: 'From X', quote: 'We made our first overseas hire through @SaganPassport this week. Here’s a few takeaways so far. My goal was to offload all scheduling/dispatch/invoicing (jobber). Also to be able to communicate with drivers in English or Spanish so we had more options with hiring. On day 1 we did some training and I had her go through our very rough draft of notion SOPs. On her own she created a notion page of questions that weren’t covered or needed more explaining. She is now building out our onboarding system as she walks through it. Day 2 she managed the entire process of creating new customers, adding jobs and editing the invoice. Then build out our customer list with rules on who and how we can adjust their schedule if needed. I was waiting to hire because I wasn’t sure we needed it. I’m now super excited because she will be better than I am at these tasks. I will now get to look into adding other service lines or buying additional businesses with similar customers. A side benefit is it’s forcing me to become more organized in every area. I shouldn’t have waited as long as I did.', avatar: 'https://framerusercontent.com/images/t8LuYMjcU2LRpA27UTbQ5wuZpM.jpg?width=400&height=400', logo: X_LOGO},
  {name: 'Dennis Unrein', subtitle: 'From X', quote: 'Figuring out remote hiring has been rewarding and a challenge Direct hiring is better if you can swing it. Can also take more time. Agency can work for project based work or specific work (I.e web development, Facebook ads) Upwork works well for short term projects and project based items (similar to agency, less vetted than agency) Services like @SaganPassport allow you to pay a membership for vetted candidates that you can then choose as a “hybrid direct” strategy I learned a lot along the way and still learning', avatar: 'https://framerusercontent.com/images/Nbwb6eXxLJuLDaJydE5yiGkDIc.jpg?width=400&height=400', logo: X_LOGO},
  {name: 'Jan Ziegler', subtitle: 'From X', quote: 'Had the best time talking to @BrianWiki about all things automation and AI - that alone is worth at least 6 months of @SaganPassport Can’t wait to see how much “dumb stuff” we can automate.', avatar: 'https://framerusercontent.com/images/145xYuDpYYs92wyxWN42d3GUQ.jpg?width=400&height=400', logo: X_LOGO},
]

// ---- build + write ---------------------------------------------------------
async function main() {
  console.log('Uploading talent photos…')
  const talent = await withImages(TALENT, 'img')

  console.log('Uploading customer logos…')
  const logos = []
  for (const url of LOGOS) logos.push(await uploadImage(url))

  console.log('Uploading big-card background…')
  const bigCardImage = await uploadImage(BIGCARD_BG)

  console.log('Uploading carousel slides…')
  const slides = await withImages(SLIDES, 'image')

  console.log('Uploading testimonial avatars + badges…')
  const testimonials = []
  for (const t of TESTIMONIALS) {
    testimonials.push({
      name: t.name,
      subtitle: t.subtitle,
      quote: t.quote,
      avatar: await uploadImage(t.avatar),
      logo: await uploadImage(t.logo),
    })
  }

  const doc = {
    _id: 'homepage',
    _type: 'homepage',
    seoTitle: 'Sagan Passport',
    hero: {
      headline: 'Stop settling for less—scale the business you’ve envisioned.',
      body: 'We help you apply leverage by hiring outstanding, remote full-time global talent (and AI Agents), so you can finally build the world-class team you need to win.',
      buttons: withKeys([
        {_type: 'button', label: 'How It Works', href: '/how-it-works', variant: 'outline', external: false},
        {_type: 'button', label: 'Find Your Next Hire', href: '/pricing', variant: 'fill', external: false},
      ]),
    },
    talent: withKeys(talent.map((t) => ({_type: 'person', ...t}))),
    logosTagline: 'The unfair advantage behind today’s fastest-growing companies',
    logos: withKeys(logos),
    infoRows: withKeys([
      {_type: 'infoRow', heading: 'You’re ready to scale.  Your local talent budget isn’t.', body: SCALE_COPY},
      {_type: 'infoRow', heading: 'We’re not a recruiter.  We’re your force multiplier.', body: SCALE_COPY},
    ]),
    bigCard: {
      heading: 'We don’t stop at hiring.',
      body: 'We provide professional training and development opportunities to your new team members through Sagan University, helping you build your people into the leaders you need. This is how you build a stronger, more capable team for a fraction of the cost.',
      button: {_type: 'button', label: 'About Sagan University', href: '/sagan-university', variant: 'white', external: false},
      image: bigCardImage,
    },
    features: withKeys(FEATURES.map((f) => ({_type: 'feature', ...f}))),
    slides: withKeys(slides.map((s) => ({_type: 'slide', ...s}))),
    testimonials: withKeys(testimonials.map((t) => ({_type: 'testimonialItem', ...t}))),
    cta: {
      heading: 'Ready to unlock your growth?',
      body: 'Stop compromising and start building. Schedule a call to learn how our global talent network can help you achieve your most ambitious goals.',
    },
  }

  console.log('Writing homepage document…')
  await client.createOrReplace(doc)
  console.log('✓ Done. Homepage singleton created/replaced.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
