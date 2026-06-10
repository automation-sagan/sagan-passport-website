/**
 * One-off: create/replace the `comparison` document for /vs/oceans-vs-sagan.
 * Follows migrateComparisons.ts, but cell text is written as inlineBody
 * Portable Text (the schema's current shape after the sitewide rich-text
 * conversion). The cell colour spans (.bad/.good) are state-driven in
 * OceansVs.astro, so the cells here are plain text. The page has no
 * testimonial section, so `testimonials` is omitted.
 *
 * Run from the studio dir (after `sanity login`):
 *   npx sanity exec scripts/addOceansComparison.ts --with-user-token
 */
import {getCliClient} from 'sanity/cli'

const client = getCliClient()

let keySeq = 0
const k = () => `k${(keySeq++).toString(36)}${Math.random().toString(36).slice(2, 8)}`
const withKeys = <T extends Record<string, any>>(arr: T[]) => arr.map((item) => ({_key: k(), ...item}))

/** Plain text → one inlineBody block. */
const inline = (text: string) => [
  {
    _type: 'block',
    _key: k(),
    style: 'normal',
    markDefs: [],
    children: [{_type: 'span', _key: k(), text, marks: []}],
  },
]

const oceans = {
  _id: 'comparison-oceans-vs-sagan',
  _type: 'comparison',
  title: 'Oceans vs Sagan',
  slug: {_type: 'slug', current: 'oceans-vs-sagan'},
  competitor: 'Oceans',
  seoTitle: 'Oceans vs Sagan - Staffing Markup Math for Sri Lanka Talent',
  seoDescription:
    'Oceans charges $3,250/month plus a $1,500 equipment fee and 7% annual increases. See the Glassdoor and Reddit pay-gap numbers behind the staffing markup.',
  canonical: 'https://saganpassport.com/vs/oceans-vs-sagan',
  calendlyUrl: 'https://calendly.com/d/5j7-3xv-p5k/global-talent-hiring-consultation',
  heroHeadlineLead: 'Oceans vs Sagan',
  heroHeadlineEm: '$3,250/month changes the math.',
  heroBody:
    'Oceans can be a strong staffing option. The question is simpler: do you want to rent Sri Lanka talent through a recurring markup, or hire the person directly and build a real team?',
  heroSub: 'No pressure. Bring the quote. We will do the math with you.',
  // talentMonthly + middlemanMonthly = the $3,250/mo Oceans quote; the $1,500
  // equipment fee and 7% annual increase stay inline in the page component.
  calc: {talentMonthly: 1000, middlemanMonthly: 2250, membershipMonthly: 499, finderFeePct: 18},
  comparisonRows: withKeys([
    {
      _type: 'comparisonRow',
      label: 'What is it?',
      competitorState: 'cross',
      competitorText: inline('Managed staffing.'),
      competitorSmall: 'You pay Oceans monthly and the Diver works through Oceans.',
      saganState: 'check',
      saganText: inline('Direct-hire service.'),
      saganSmall: 'Sagan helps you find the person, then you hire and pay them directly.',
    },
    {
      _type: 'comparisonRow',
      label: 'Client bill',
      competitorState: 'cross',
      competitorText: inline('$3,250/month'),
      competitorSmall: 'Plus $1,500 equipment fee and 7% annual service increase.',
      saganState: 'check',
      saganText: inline("$499/month + one-time finder's fee"),
      saganSmall: 'Salary is paid directly to your hire.',
    },
    {
      _type: 'comparisonRow',
      label: 'Year-one non-salary cost',
      competitorState: 'cross',
      competitorText: inline('$28,500'),
      competitorSmall: 'Using $1,000/month assumed salary: $40,500 total bill minus $12,000 salary.',
      saganState: 'check',
      saganText: inline('$8,148'),
      saganSmall: "$5,988 membership plus $2,160 finder's fee at the same salary assumption.",
    },
    {
      _type: 'comparisonRow',
      label: 'Year two',
      competitorState: 'cross',
      competitorText: inline('$29,730 non-salary spend'),
      competitorSmall: '$3,477.50/month after 7% increase minus assumed salary.',
      saganState: 'check',
      saganText: inline('$5,988'),
      saganSmall: 'Just membership if you are not making another hire.',
    },
    {
      _type: 'comparisonRow',
      label: 'Three-year non-salary cost',
      competitorState: 'cross',
      competitorText: inline('$90,881'),
      competitorSmall: 'Includes $1,500 equipment fee and two years of compounded service increases.',
      saganState: 'check',
      saganText: inline('$20,124'),
      saganSmall: "Membership plus one finder's fee. Savings: about $70.8K for one hire.",
    },
    {
      _type: 'comparisonRow',
      label: 'Who owns the relationship?',
      competitorState: 'cross',
      competitorText: inline('Oceans mediates it.'),
      competitorSmall: 'Your Diver works exclusively for you through Oceans.',
      saganState: 'check',
      saganText: inline('You do.'),
      saganSmall: 'The hire is your team member and stays with you.',
    },
    {
      _type: 'comparisonRow',
      label: 'Scale',
      competitorState: 'plain',
      competitorText: inline('Every additional Diver adds another monthly service bill.'),
      saganState: 'plain',
      saganText: inline('Membership stays flat while you add hires through the same hiring system.'),
    },
    {
      _type: 'comparisonRow',
      label: 'Best fit',
      competitorState: 'plain',
      competitorText: inline('Companies that want a managed staffing vendor.'),
      saganState: 'plain',
      saganText: inline('Companies that want to own the team, the salary path, and the relationship.'),
    },
  ]),
}

async function main() {
  const res = await client.createOrReplace(oceans)
  console.log(`✓ ${oceans._id} written. _rev=${res._rev}`)
  const count = await client.fetch('count(*[_type == "comparison"])')
  console.log(`✓ Done. comparison docs now in dataset: ${count}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
