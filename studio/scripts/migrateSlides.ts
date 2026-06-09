/**
 * One-off: replace the homepage `slides` (featured testimonial carousel) with
 * the real 4 slides from the live saganpassport.com Framer build. Downloads the
 * Framer images, uploads them as Sanity assets, and patches homepage.slides.
 *
 * Run from the studio dir (after `sanity login`):
 *   npx sanity exec scripts/migrateSlides.ts --with-user-token
 */
import {getCliClient} from 'sanity/cli'

const client = getCliClient()

// Every object inside a Sanity array needs a unique `_key`.
let keySeq = 0
const k = () => `k${(keySeq++).toString(36)}${Math.random().toString(36).slice(2, 8)}`

async function uploadImage(url: string) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`)
  const buffer = Buffer.from(await res.arrayBuffer())
  const filename = url.split('/').pop()?.split('?')[0] || 'image'
  const asset = await client.assets.upload('image', buffer, {filename})
  console.log(`  ↑ ${filename} → ${asset._id}`)
  return {_type: 'image' as const, asset: {_type: 'reference' as const, _ref: asset._id}}
}

// Verbatim from the live saganpassport.com slideshow (the real 4 testimonials).
const SLIDES = [
  {
    image: 'https://framerusercontent.com/images/YI6y9EVuVBqF21G3SSj7HwhqBs.jpeg',
    name: 'Jameson Haslam',
    title: 'West Coast Deck',
    quote: `"The best part about Sagan Passport is the quality of talent they surface and how streamlined the hiring process is. The candidates we’ve found through Sagan have consistently exceeded expectations in terms of professionalism, communication, and capability."`,
  },
  {
    image: 'https://framerusercontent.com/images/4DyO4SaiWcB5mvaGUp0hA2KPVpU.jpeg',
    name: 'Cathyrn Lavery',
    title: 'BestSelf Co.',
    quote: `"I love that I've hired five great people without breaking the bank - two through their recruiting help and three straight from their talent pool. The credit system saves us so much money compared to regular recruiters. My whole team is taking their AI and automation courses right now, which is a huge bonus on top of the hiring help. They're also super responsive whenever we need anything. I've been a member for over a year now, and honestly, I don't even use half of what they offer, but it's still totally worth every penny!"`,
  },
  {
    image: 'https://framerusercontent.com/images/YQpHrWvqPtm3B1RHFtuu75pvScQ.jpeg',
    name: 'Dylan Scroggins',
    title: 'The Kalmar Group',
    quote: `"The team in place to help you organize everything before a search, interview people during the search, and even deal with the offer letter and logistics of hiring internationally are all 5-stars. I think I was in touch with 4-5 different Sagan members the whole time and they were all top-notch."`,
  },
  {
    image: 'https://framerusercontent.com/images/NYMuIOwQTBYSMXpqS3zQyRve6w.jpg',
    name: 'Khalil Benalioulhaj',
    title: 'Benali',
    quote: `"The talent pool and the training and development have been fantastic. Being a Sagan member feels like a huge unlock for finding talent and resources that previously felt unattainable."`,
  },
]

async function run() {
  const doc = await client.fetch<{_id: string} | null>(`*[_type=="homepage"][0]{_id}`)
  if (!doc?._id) throw new Error('homepage singleton not found')

  console.log(`Uploading ${SLIDES.length} carousel images…`)
  const slides = []
  for (const s of SLIDES) {
    const image = await uploadImage(s.image)
    slides.push({_key: k(), _type: 'slide', image, quote: s.quote, name: s.name, title: s.title})
  }

  await client.patch(doc._id).set({slides}).commit()
  console.log(`✓ patched ${doc._id} with ${slides.length} slides`)
}

run()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
