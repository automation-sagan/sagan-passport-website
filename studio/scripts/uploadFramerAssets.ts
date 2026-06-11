/**
 * One-off: download every remaining framerusercontent.com image still hardcoded
 * in web/src (hire-talent landing page + component fallback defaults), upload
 * each as a Sanity asset, and write a {framerUrl: sanityCdnUrl} mapping to
 * scripts/framerAssetMap.json so the web components can be rewritten.
 *
 * Run from the studio dir (after `sanity login`):
 *   npx sanity exec scripts/uploadFramerAssets.ts --with-user-token
 */
import {writeFileSync} from 'node:fs'
import {resolve} from 'node:path'
import {getCliClient} from 'sanity/cli'

const client = getCliClient()

// Verbatim src URLs (including resize params, so the uploaded pixels match what
// the site renders today). Grouped by where they appear.
const URLS = [
  // HireTalentPage.astro — inline navbar logo + footer wordmark
  'https://framerusercontent.com/images/ECyEDC4V3Il9rjq10opn3xtlDPY.png?width=80&height=80',
  'https://framerusercontent.com/images/jBgV1WJ5AIUfSz7porI87LWTNXk.png?width=4165&height=983',
  // HireTalentPage.astro — talent ticker photos
  'https://framerusercontent.com/images/vSt7nb9t3DaHFuzc1y56VQGwm18.jpg',
  'https://framerusercontent.com/images/TiA6S2G3USn1z6Yfkh3iXHFNmw.png',
  'https://framerusercontent.com/images/9B4nbheGCkylXPMEqKfeQL4264.png',
  'https://framerusercontent.com/images/DAMgEM6rQq4fpZSwkUXKGsxLmE.png',
  'https://framerusercontent.com/images/nRWIyMkOuHG7M0pozlFagicyHM.png',
  // HireTalentPage.astro — testimonial avatars + shared badge
  'https://framerusercontent.com/images/8u1vEzAJ5XyEKVBEqsRhqSHQfk.jpg?width=400&height=400',
  'https://framerusercontent.com/images/JiagS7bDXgNobinX4lv8WgLa6I.jpg?width=400&height=400',
  'https://framerusercontent.com/images/M4cIFNZXUxMzzn7dGC1zoRJIi8Q.jpg?width=400&height=400',
  'https://framerusercontent.com/images/mbnSG60dpb8dSFDSkCCBCWkXR1M.jpg?width=400&height=400',
  'https://framerusercontent.com/images/Kg9WMmkC5z1qATu9mNnvdsVAgEU.jpg?width=400&height=400',
  'https://framerusercontent.com/images/mkJtGkJh0keM0Uox84qlN8mdxU.jpg?width=400&height=400',
  'https://framerusercontent.com/images/yJo3UUAYt6EgqcY1psGtJijPAbQ.jpg?width=733&height=716',
  // saganuniversity defaults
  'https://framerusercontent.com/images/l0yEQ46rzKhkZhDNoXzKOZYj0.png?width=32&height=32',
  'https://framerusercontent.com/images/1i53LccbVs7fHThj7a2TfwA.png?width=40&height=40',
  'https://framerusercontent.com/images/fwXvNEkxwq2uHuPe7Po7HHbOtTA.png?width=1440&height=1092',
  'https://framerusercontent.com/images/MSqCWMpX1xnbTTDzvPcPpc0E6ss.jpeg?width=200&height=200',
  // customer card defaults. (TalentPersonCard's old default photo is excluded:
  // it already 404s on Framer's CDN, and every talent person in Sanity has a
  // photo, so the fallback is dropped from the component instead.)
  'https://framerusercontent.com/images/80tGl76lgut9WBZKtZIOEFsvhbI.png?width=195&height=195',
  'https://framerusercontent.com/images/C3vAoYJYsF4rpvNVqxbIEXsRGaE.png?width=72&height=72',
]

async function run() {
  const map: Record<string, string> = {}
  for (const url of URLS) {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`)
    const buffer = Buffer.from(await res.arrayBuffer())
    const filename = url.split('/').pop()!.split('?')[0]
    const asset = await client.assets.upload('image', buffer, {filename})
    map[url] = asset.url
    console.log(`  ↑ ${filename} → ${asset.url}`)
  }
  const out = resolve(__dirname, 'framerAssetMap.json')
  writeFileSync(out, JSON.stringify(map, null, 2))
  console.log(`✓ ${URLS.length} assets uploaded — mapping written to ${out}`)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
