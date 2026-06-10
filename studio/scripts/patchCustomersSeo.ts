/**
 * One-off backfill for the 7 customer-vertical pages, matching the live Framer
 * site exactly (saganpassport.com/customers/*, captured 2026-06-11):
 *
 *   1. Sets the live SEO page titles + meta descriptions on every doc
 *      (Sanity had "<Vertical> — Sagan Passport" placeholders and no
 *      descriptions).
 *   2. Fixes the handful of home-services text fields where Sanity drifted
 *      from the live copy (straight vs curly quotes).
 *   3. Downloads each talent person's card photo from the Framer CDN, uploads
 *      it as a Sanity asset, and sets it on talent.people[i].photo (the web
 *      template previously hardcoded one shared stock photo).
 *
 * The data lives in customersSeoPayload.json next to this script, generated
 * by scraping the live pages.
 *
 * Run from the studio dir (after `sanity login`):
 *   npx sanity exec scripts/patchCustomersSeo.ts --with-user-token
 */
import {readFileSync} from 'node:fs'
import {join} from 'node:path'
import {getCliClient} from 'sanity/cli'

const client = getCliClient()

interface Entry {
  seoTitle: string
  seoDescription: string
  set: Record<string, string>
  photos: string[] // framerusercontent URLs, index-aligned with talent.people
}

const payload: Record<string, Entry> = JSON.parse(
  readFileSync(join(__dirname, 'customersSeoPayload.json'), 'utf8'),
)

// Upload each unique photo once, even if it appears on several pages.
const assetCache = new Map<string, string>()
async function uploadPhoto(url: string): Promise<string> {
  const hit = assetCache.get(url)
  if (hit) return hit
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to download ${url}: ${res.status}`)
  const buffer = Buffer.from(await res.arrayBuffer())
  const filename = url.split('/').pop() ?? 'talent-photo.jpg'
  const asset = await client.assets.upload('image', buffer, {filename})
  assetCache.set(url, asset._id)
  console.log(`  uploaded ${filename} → ${asset._id}`)
  return asset._id
}

async function run() {
  for (const [slug, entry] of Object.entries(payload)) {
    const doc = await client.fetch(
      `*[_type == "customer" && slug.current == $slug][0]{_id, talent}`,
      {slug},
    )
    if (!doc?._id) {
      console.error(`!! no customer doc for ${slug}, skipping`)
      continue
    }
    console.log(`Patching ${slug} (${doc._id})`)

    const sets: Record<string, unknown> = {
      seoTitle: entry.seoTitle,
      seoDescription: entry.seoDescription,
      ...entry.set,
    }

    const people: {_key: string}[] = doc.talent?.people ?? []
    if (people.length !== entry.photos.length) {
      console.warn(
        `  !! people count mismatch (sanity=${people.length}, live=${entry.photos.length}) — skipping photos`,
      )
    } else {
      for (let i = 0; i < people.length; i++) {
        if (!entry.photos[i]) continue
        const assetId = await uploadPhoto(entry.photos[i])
        sets[`talent.people[_key=="${people[i]._key}"].photo`] = {
          _type: 'image',
          asset: {_type: 'reference', _ref: assetId},
        }
      }
    }

    await client.patch(doc._id).set(sets).commit()
    console.log(`  set: ${Object.keys(sets).join(', ')}`)
  }
  console.log('Done.')
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
