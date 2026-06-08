/**
 * Replace each customer vertical's `logos` with the real 5 logos pulled from the
 * live saganpassport.com/customers/<slug> pages (the earlier migration used a
 * shared 4-logo placeholder set with one blank slot). Hero images already match
 * the live site, so they are left untouched.
 *
 * Patches the existing customer-<slug> documents in place (logos field only).
 *
 * Run from the studio dir (after `sanity login`):
 *   npx sanity exec scripts/updateCustomerLogos.ts --with-user-token
 */
import {getCliClient} from 'sanity/cli'

const client = getCliClient()

let keySeq = 0
const k = () => `k${(keySeq++).toString(36)}${Math.random().toString(36).slice(2, 8)}`

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

const BASE = 'https://framerusercontent.com/images/'

// Real 5 logos per vertical, in display order (pulled from the live pages).
const LOGOS: Record<string, string[]> = {
  'home-services': [
    'yIhJMsUzuwiMaAdyKUvBnQyVg.png',
    'NbWsPL76Rh6o2shiDcBHo8Xwj0.png',
    'o1oxigOg0MV4Cq2qlLbROui3l4s.png',
    'PzVAl12SAstQ7nnEX5AqNPYu4.png',
    'PejKFYc6OV9IZKBZFr44pI1Cwc.png',
  ],
  'private-equity': [
    'DRydWEFu7fatfMtFApDlDYzGzig.png',
    'NZkeheAmhPBoZHuWQLXKQB7dH4.png',
    'mdnhnAtuSk03xxhYanQhbg0h1o.png',
    '9nEcbQEw2QuNhClOczVDcCjE138.png',
    'pBluLs6TgHLR5qsZJEZ4GNITkTc.png',
  ],
  'small-businesses': [
    '2SgykQmH6rJwHHB8c0CEWJMQM.png',
    'sv7huYRwcjcJNyVAUEPToHfNw.png',
    'y22fonz0BtKH1F8FD1rQmn3NRY.jpg',
    'ntKLxHpTkyzNEePTd6pSRTRAI.jpeg',
    '09hd7pXcpFPF0HorgOpJA6kKoI.jpg',
  ],
  'health-wellness': [
    'vIDSh5hNndQZW279TNsqVvw5g.png',
    'EzqSJC77ZMM6vsSenLl9fZpTW6I.png',
    'JU8kOvAj1pGXFLYIwnN89hD8w.jpeg',
    'kLw7kC4sfK90VEhHv9j2QkesF1o.png',
    '4mGXBvyO5aqXXgIcRrcKTrqGq0.jpg',
  ],
  franchises: [
    'Vi7byJJHYVVsqr1fTEWlQlHa04.png',
    'GMftyw68ySfOsswOIvPkqg9z2k.png',
    'dFyqdGPrllU6njscYoiwnJcyUHs.png',
    'Ol5PvEqLgT0BaRGFJjblRhayLLQ.png',
    'hxplClC4lQirhaHuyME1BN3PIc.jpeg',
  ],
  'professional-services': [
    'dbqOaBXhoiVm6TevmjlVuglysYY.png',
    '2HahN20N1hQsuaT05BdWv23pohA.jpg',
    'TFo8xlweeH3aBBi4424qEAWb3w.jpg',
    'RrubIgCTwPDLQwVEG4M7hThEac.png',
    'qTfznHwB4NvRQdM7HpnelIk6zvs.png',
  ],
  'real-estate': [
    'NZkeheAmhPBoZHuWQLXKQB7dH4.png',
    'JewUTaz53VrONnUER9F9H2YTg.png',
    'tuC6CUvZq6Wle0kz6yUCYJJ9A.jpg',
    'AUtOLZHvydyPe9kAtATaDAaNQ.jpg',
    'bzWt3idJvGZVhFynTi0oRVMX56A.webp',
  ],
}

async function main() {
  for (const [slug, files] of Object.entries(LOGOS)) {
    console.log(`\nUpdating logos for customer-${slug}…`)
    const logos = []
    for (const f of files) logos.push({_key: k(), ...(await uploadImage(BASE + f))})
    await client.patch(`customer-${slug}`).set({logos}).commit()
    console.log(`✓ customer-${slug}: ${logos.length} logos set.`)
  }
  console.log('\n✓ Done. All customer logo strips updated.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
