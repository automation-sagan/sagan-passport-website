/**
 * One-off backfill for the resource articles + /resources listing page,
 * matching the live Framer site (saganpassport.com/resources/*, captured
 * 2026-06-11):
 *
 *   1. Creates the `resourcesIndex` singleton with the live listing-page
 *      title + meta description.
 *   2. Sets each resource document's live SEO title + meta description.
 *      Live descriptions are Framer's sitewide default on every article;
 *      three articles had no SEO title on Framer (fell back to the generic
 *      site title), so those get "<Article title> - Sagan Passport" to match
 *      the convention used by the other ten.
 *
 * Data lives in resourcesSeoPayload.json next to this script (scraped from
 * the live pages).
 *
 * Run from the studio dir (after `sanity login`):
 *   npx sanity exec scripts/patchResourcesSeo.ts --with-user-token
 */
import {readFileSync} from 'node:fs'
import {join} from 'node:path'
import {getCliClient} from 'sanity/cli'

const client = getCliClient()

interface Entry {
  seoTitle: string
  seoDescription: string
}

const payload: Record<string, Entry> = JSON.parse(
  readFileSync(join(__dirname, 'resourcesSeoPayload.json'), 'utf8'),
)

async function run() {
  const {seoTitle, seoDescription} = payload['__index']
  await client.createOrReplace({
    _id: 'resourcesIndex',
    _type: 'resourcesIndex',
    seoTitle,
    seoDescription,
  })
  console.log('Created resourcesIndex singleton')

  for (const [slug, entry] of Object.entries(payload)) {
    if (slug === '__index') continue
    const id = await client.fetch(
      `*[_type == "resource" && slug.current == $slug][0]._id`,
      {slug},
    )
    if (!id) {
      console.error(`!! no resource doc for ${slug}, skipping`)
      continue
    }
    await client
      .patch(id)
      .set({seoTitle: entry.seoTitle, seoDescription: entry.seoDescription})
      .commit()
    console.log(`Patched ${slug.slice(0, 60)}`)
  }
  console.log('Done.')
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
