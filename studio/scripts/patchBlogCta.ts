/**
 * Patch the per-post sidebar CTA onto existing `blog` documents, sourced from the
 * Framer CSV (scripts/blogCta.json). Posts with no CTA in the CSV are left blank
 * and fall back to the site default in the component.
 *
 * Run from the studio dir (after `sanity login`):
 *   npx sanity exec scripts/patchBlogCta.ts --with-user-token
 */
import {readFileSync} from 'node:fs'
import {join} from 'node:path'
import {getCliClient} from 'sanity/cli'

const client = getCliClient()

const CTA: Record<string, {title?: string; description?: string; buttonText?: string; buttonLink?: string}> =
  JSON.parse(readFileSync(join(__dirname, 'blogCta.json'), 'utf-8'))

async function main() {
  for (const [slug, cta] of Object.entries(CTA)) {
    const id = `blog-${slug}`
    if (Object.keys(cta).length === 0) {
      await client.patch(id).unset(['cta']).commit()
      console.log(`· ${id}: no CTA in CSV (cleared)`)
    } else {
      await client.patch(id).set({cta}).commit()
      console.log(`✓ ${id}: CTA set`)
    }
  }
  console.log('\n✓ Done.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
