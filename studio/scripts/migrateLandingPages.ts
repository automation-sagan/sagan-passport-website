/**
 * One-off migration: create/replace the generic `landingPage` documents
 * (hire-talent, hire-global-talent, agency-referrals). Key editable fields only;
 * bespoke layout lives in each page component.
 *
 * Run from the studio dir (after `sanity login`):
 *   npx sanity exec scripts/migrateLandingPages.ts --with-user-token
 */
import {getCliClient} from 'sanity/cli'

const client = getCliClient()

const hireTalent = {
  _id: 'landing-hire-talent',
  _type: 'landingPage',
  title: 'Hire Talent',
  slug: {_type: 'slug', current: 'hire-talent'},
  seoTitle: 'Hire World-Class Global Talent from $1,100/mo | Sagan Passport',
  seoDescription:
    'Hire vetted, full-time global talent from $1,100/month. Sagan finds, vets, and places A-players in 2-4 weeks. 90-day replacement guarantee.',
  heroHeadlineHtml: "Stop settling for less,<br> scale the business <em>you've envisioned.</em>",
  heroLeadHtml:
    'Hire outstanding, full-time global talent from <strong>$1,100/month</strong>, without the US hiring tax, without months of recruiting, and without the risk. Your next A-player placed in 2-4 weeks.',
  ctaUrl:
    'https://calendly.com/d/5j7-3xv-p5k/global-talent-hiring-consultation?utm_source=meta_retargeting&utm_medium=paid&utm_campaign=retargeting-v1&hide_gdpr_banner=1&hide_event_type_details=1&background_color=ffffff&text_color=093a3e&primary_color=093a3e',
}

const hireGlobalTalent = {
  _id: 'landing-hire-global-talent',
  _type: 'landingPage',
  title: 'Hire Global Talent',
  slug: {_type: 'slug', current: 'hire-global-talent'},
  seoTitle: 'Sagan | Hire Global Talent Directly',
  seoDescription:
    'Map the global hire your company needs next. Sagan helps operators define the role, salary band, market fit, and path to a shortlist.',
  canonical: 'https://www.saganpassport.com/hire-global-talent',
  heroEyebrow: 'global talent hiring consultation',
  heroHeadlineHtml: 'Hire the person. Skip the staffing markup.',
  heroLeadHtml:
    'Sagan helps HVAC, plumbing, roofing, cleaning, and home service operators hire career-caliber professionals across Latin America, South Africa, the Philippines, and beyond. Dispatch, phones, books, estimates, follow-up, and ops support without the staffing markup.',
  ctaUrl: 'https://calendly.com/d/cmcb-jfm-gs8/global-talent-hiring-consultation-rene',
}

const agencyReferrals = {
  _id: 'landing-agency-referrals',
  _type: 'landingPage',
  title: 'Agency Referrals',
  slug: {_type: 'slug', current: 'agency-referrals'},
  seoTitle: 'Sagan Agency Referral Partners',
  seoDescription:
    'Help your home service clients handle growth with dedicated remote talent. Refer clients to Sagan and improve retention.',
  canonical: 'https://saganpassport.com/agency-referrals',
}

const DOCS = [hireTalent, hireGlobalTalent, agencyReferrals]

async function main() {
  for (const doc of DOCS) {
    const res = await client.createOrReplace(doc)
    console.log(`✓ ${doc._id} written. _rev=${res._rev}`)
  }
  const count = await client.fetch('count(*[_type == "landingPage"])')
  console.log(`\n✓ Done. landingPage docs now in dataset: ${count}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
