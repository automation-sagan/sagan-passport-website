/**
 * One-off migration: create/replace the `comparison` documents (one per
 * competitor). Holds the key editable fields for each "vs" page — identity,
 * hero, calculator numbers, comparison-table rows, testimonials. The bespoke
 * layout + long-form copy lives in each page's Astro component.
 *
 * Run from the studio dir (after `sanity login`):
 *   npx sanity exec scripts/migrateComparisons.ts --with-user-token
 */
import {getCliClient} from 'sanity/cli'

const client = getCliClient()

let keySeq = 0
const k = () => `k${(keySeq++).toString(36)}${Math.random().toString(36).slice(2, 8)}`
const withKeys = <T extends Record<string, any>>(arr: T[]) => arr.map((item) => ({_key: k(), ...item}))

const CHECK = '✓ ' // ✓ + en-space, matching the source &#10003;&ensp;

const athena = {
  _id: 'comparison-athena-vs-sagan',
  _type: 'comparison',
  title: 'Athena vs Sagan',
  slug: {_type: 'slug', current: 'athena-vs-sagan'},
  competitor: 'Athena',
  seoTitle: 'Athena versus Sagan Comparison',
  seoDescription:
    'Athena charges you $3,000/mo but pays your assistant just $800. With Sagan, you hire directly — no middleman forever tax. See the real numbers.',
  canonical: 'https://saganpassport.com/vs/athena-vs-sagan',
  calendlyUrl: 'https://calendly.com/d/5j7-3xv-p5k/global-talent-hiring-consultation',
  heroHeadlineLead: 'Athena Bills You $3,000.',
  heroHeadlineEm: 'Your Talent Sees $800.',
  heroBody:
    "Every month, Athena keeps $2,200 of the $3,000 you pay. Your assistant only gets $800. Here's what they don't want you to know.",
  heroSub: 'No commitment. No pressure. Just the truth.',
  calc: {talentMonthly: 800, middlemanMonthly: 2200, membershipMonthly: 499, finderFeePct: 18},
  comparisonRows: withKeys([
    {
      _type: 'comparisonRow',
      label: 'What Is It?',
      competitorState: 'cross',
      competitorText: 'Staffing agency. You rent a person for $3,000/mo. They work for Athena.',
      saganState: 'check',
      saganText: `${CHECK}Hiring service. They find you someone great, you pay once, and that person is <strong>yours</strong>.`,
    },
    {
      _type: 'comparisonRow',
      label: 'What Talent Gets Paid',
      competitorState: 'cross',
      competitorText: '~$800/mo',
      competitorSmall: 'Identical either way',
      saganState: 'check',
      saganText: `${CHECK}~$800/mo`,
      saganSmall: 'Identical either way — same caliber person',
    },
    {
      _type: 'comparisonRow',
      label: 'Membership',
      competitorState: 'cross',
      competitorText: "N/A — you're locked in at $3K/mo per person",
      competitorSmall: '12-month commitment required',
      saganState: 'check',
      saganText: `${CHECK}$499/mo — same price whether you hire 1 or 10`,
      saganSmall: 'Hiring help, training support, community, 90-day guarantee. Cancel anytime — keep your team.',
    },
    {
      _type: 'comparisonRow',
      label: "Finder's Fee",
      competitorState: 'plain',
      competitorText: '$0',
      competitorSmall: "Because you're renting, not hiring",
      saganState: 'plain',
      saganText: '$1,728 per person',
      saganSmall: "One-time. That's the cost of Sagan finding you someone great.",
    },
    {
      _type: 'comparisonRow',
      label: 'Monthly Fee Per Person',
      competitorState: 'cross',
      competitorText: '$2,200/mo — forever',
      competitorSmall: "That's $26,400/yr that doesn't go to your hire",
      saganState: 'check',
      saganText: `${CHECK}$0`,
      saganSmall: "Once they're hired, you pay them directly. No middleman.",
    },
    {
      _type: 'comparisonRow',
      label: 'Cancel?',
      competitorState: 'cross',
      competitorText: 'Lose your assistant — or pay $24,000 buyout',
      saganState: 'check',
      saganText: `${CHECK}Keep every hire. Membership is separate from your team.`,
    },
    {
      _type: 'comparisonRow',
      label: 'Year 1: What the Company Gets',
      labelSmall: "Not counting your hire's salary",
      competitorState: 'cross',
      competitorText: '$26,400 to Athena',
      saganState: 'plain',
      saganText: '<strong class="check">$7,716 to Sagan</strong>',
      saganSmall: "Finder's fee + membership. And the person is <strong>yours</strong>.",
    },
    {
      _type: 'comparisonRow',
      label: 'Year 2',
      competitorState: 'cross',
      competitorText: '$26,400 to Athena — again',
      saganState: 'plain',
      saganText: '<strong class="check">$5,988 to Sagan</strong>',
      saganSmall: 'Just the membership. No new fees.',
    },
    {
      _type: 'comparisonRow',
      label: 'Over 3 Years',
      competitorState: 'cross',
      competitorText: '$79,200 to Athena',
      saganState: 'plain',
      saganText: '<strong class="check">$19,692 to Sagan</strong>',
      saganSmall: 'You save over $59,000.',
    },
    {
      _type: 'comparisonRow',
      label: 'Who Employs the Talent?',
      competitorState: 'cross',
      competitorText: 'Athena employs them',
      saganState: 'check',
      saganText: `${CHECK}YOU employ them directly`,
    },
    {
      _type: 'comparisonRow',
      label: 'If You Cancel',
      competitorState: 'cross',
      competitorText: 'You lose your assistant (or pay $24,000 buyout)',
      saganState: 'check',
      saganText: `${CHECK}Your team member stays. They're yours. Forever.`,
    },
    {
      _type: 'comparisonRow',
      label: 'Post-Hire Support',
      competitorState: 'neutral',
      competitorText: 'Performance management only',
      saganState: 'check',
      saganText: `${CHECK}Training, playbooks, community (with membership)`,
    },
    {
      _type: 'comparisonRow',
      label: 'Talent Regions',
      competitorState: 'plain',
      competitorText: 'Philippines and Kenya',
      saganState: 'plain',
      saganText: 'Latin America, Africa, Asia — global',
    },
  ]),
  testimonials: withKeys([
    {
      _type: 'comparisonTestimonial',
      text: 'Very differentiated by including training and assessing as part of their offering. Many firms just source candidates and that is it.',
      author: 'Mike Smith',
      role: 'Managing Partner, Scrappy Capital',
    },
    {
      _type: 'comparisonTestimonial',
      text: 'The business model makes it extremely affordable to enter the global talent pool without significant one-time fees. Great ongoing resources, and they continue to develop tools as part of the membership.',
      author: 'Ryan Shackelford',
      role: 'Owner & CPA, Shack Accounting',
    },
    {
      _type: 'comparisonTestimonial',
      text: 'They challenge you to think differently about global talent. They educate you on a complicated market. And they deliver the goods.',
      author: 'Greg Van Horn',
      role: 'Owner, Bumble Roofing',
    },
  ]),
}

async function main() {
  for (const doc of [athena]) {
    const res = await client.createOrReplace(doc)
    console.log(`✓ ${doc._id} written. _rev=${res._rev}`)
  }
  const count = await client.fetch('count(*[_type == "comparison"])')
  console.log(`\n✓ Done. comparison docs now in dataset: ${count}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
