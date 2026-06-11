/**
 * One-off seed: upload the footer wordmark (from web/public/images) as a Sanity
 * asset and create/replace the `footer` singleton with the link columns that
 * are currently hardcoded in web/src/components/Footer.astro.
 *
 * Run from the studio dir (after `sanity login`):
 *   npx sanity exec scripts/migrateFooter.ts --with-user-token
 */
import {readFileSync} from 'node:fs'
import {resolve} from 'node:path'
import {getCliClient} from 'sanity/cli'

const client = getCliClient()

let keySeq = 0
const k = () => `k${(keySeq++).toString(36)}${Math.random().toString(36).slice(2, 8)}`

async function uploadLocalImage(relPath: string) {
  const abs = resolve(__dirname, relPath)
  const asset = await client.assets.upload('image', readFileSync(abs), {
    filename: abs.split('/').pop(),
  })
  console.log(`  ↑ ${abs.split('/').pop()} → ${asset._id}`)
  return {_type: 'image' as const, asset: {_type: 'reference' as const, _ref: asset._id}}
}

const PORTAL_URL = 'https://portal.saganpassport.com'
const CALENDLY_URL =
  'https://calendly.com/d/5j7-3xv-p5k/global-talent-hiring-consultation?utm_source=saganpassportdotcom&utm_term=talent'

const link = (label: string, href: string, external = false) => ({
  _type: 'footerLink',
  _key: k(),
  label,
  href,
  external,
})
const section = (heading: string, links: ReturnType<typeof link>[]) => ({
  _type: 'footerSection',
  _key: k(),
  heading,
  links,
})
const column = (sections: ReturnType<typeof section>[]) => ({
  _type: 'footerColumn',
  _key: k(),
  sections,
})

async function run() {
  console.log('Uploading wordmark…')
  const wordmark = await uploadLocalImage('../../web/public/images/footer-wordmark.png')

  const doc = {
    _id: 'footer',
    _type: 'footer',
    tagline: 'Source and scale with Sagan.',
    wordmark,
    columns: [
      column([
        section('Sagan', [
          link('How it Works', '/how-it-works'),
          link('Pricing', '/pricing'),
          link('Sagan University', '/sagan-university'),
          link('Resources', '/resources'),
          link('Blog', '/blog'),
        ]),
        section('Hire', [
          link('Hire Talent', '/hire-talent'),
          link('Hire Global Talent', '/hire-global-talent'),
          link('Free Consultation', '/free-consultation'),
        ]),
      ]),
      column([
        section('Services', [
          link('Home Services', '/customers/home-services'),
          link('Private Equity & Holding', '/customers/private-equity'),
          link('Small Businesses', '/customers/small-businesses'),
          link('Franchises', '/customers/franchises'),
          link('Professional Services', '/customers/professional-services'),
          link('Real Estate', '/customers/real-estate'),
          link('Health & Wellness', '/customers/health-wellness'),
        ]),
        section('Compare', [
          link('Athena vs Sagan', '/vs/athena-vs-sagan'),
          link('GrowthAssistant vs Sagan', '/vs/growth-assistant-vs-sagan'),
          link('Scalesource vs Sagan', '/vs/scalesource-vs-sagan'),
          link('Somewhere vs Sagan', '/vs/somewhere-vs-sagan'),
        ]),
      ]),
      column([
        section('AI Agents', [
          link('AI Answering', '/agent/ai-answering'),
          link('Freight Quoting', '/agent/freight'),
          link('Lead Intake', '/agent/lead-intake'),
          link('Order Monitoring', '/agent/order-monitor'),
          link('Pool QC Second Brain', '/agent/pool-qc-second-brain'),
          link('Quality of Earnings', '/agent/qoe'),
          link('RoofQuote AI', '/agent/roofquote-ai'),
          link('Deal Signal', '/agent/signal'),
        ]),
        section('Contact', [
          link('Schedule a Call', CALENDLY_URL, true),
          link('Member Portal', PORTAL_URL, true),
        ]),
      ]),
    ],
  }

  await client.createOrReplace(doc)
  console.log('✓ footer singleton created')
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
