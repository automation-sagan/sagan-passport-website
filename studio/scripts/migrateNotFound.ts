/**
 * One-off migration: create/replace the `notFound` singleton with the 404 page
 * copy (verbatim from web/src/pages/404.astro). No images.
 *
 * Run from the studio dir (after `sanity login`):
 *   npx sanity exec scripts/migrateNotFound.ts --with-user-token
 */
import {getCliClient} from 'sanity/cli'

const client = getCliClient()

async function main() {
  const doc = {
    _id: 'notFound',
    _type: 'notFound',
    seoTitle: 'Page Not Found — Sagan Passport',
    heading: 'We couldn’t find this page.',
    body: 'Sorry, this page doesn’t exist. Click the button below to go back to the homepage.',
    button: {_type: 'button', label: 'Back to home', href: '/', variant: 'fill', external: false},
  }

  console.log('Writing notFound document…')
  await client.createOrReplace(doc)
  console.log('✓ Done. 404 singleton created/replaced.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
