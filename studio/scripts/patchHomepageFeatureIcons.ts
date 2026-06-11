/**
 * One-off patch: upload the default feature-card icon (from web/public/images)
 * and set it as `icon` on every homepage features[] item that doesn't have one,
 * so the icons become editable in the Studio.
 *
 * Run from the studio dir (after `sanity login`):
 *   npx sanity exec scripts/patchHomepageFeatureIcons.ts --with-user-token
 */
import {readFileSync} from 'node:fs'
import {resolve} from 'node:path'
import {getCliClient} from 'sanity/cli'

const client = getCliClient()

async function run() {
  const homepage = await client.getDocument('homepage')
  if (!homepage) throw new Error('homepage document not found')
  const features: any[] = homepage.features ?? []
  if (!features.length) throw new Error('homepage has no features[]')

  const missing = features.filter((f) => !f.icon)
  if (!missing.length) {
    console.log('All homepage features already have icons — nothing to do.')
    return
  }

  const abs = resolve(__dirname, '../../web/public/images/feature-icon-default.png')
  const asset = await client.assets.upload('image', readFileSync(abs), {
    filename: 'feature-icon-default.png',
  })
  console.log(`  ↑ feature-icon-default.png → ${asset._id}`)
  const ref = {_type: 'image', asset: {_type: 'reference', _ref: asset._id}}

  let patch = client.patch('homepage')
  for (const f of missing) {
    patch = patch.set({[`features[_key=="${f._key}"].icon`]: ref})
  }
  await patch.commit()
  console.log(`✓ icon set on ${missing.length} homepage feature(s)`)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
