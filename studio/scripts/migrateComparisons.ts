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

const growthAssistant = {
  _id: 'comparison-growth-assistant-vs-sagan',
  _type: 'comparison',
  title: 'Growth Assistant vs Sagan',
  slug: {_type: 'slug', current: 'growth-assistant-vs-sagan'},
  competitor: 'Growth Assistant',
  seoTitle: 'GrowthAssistant versus Sagan Comparison',
  seoDescription:
    'Growth Assistant charges you $3,000/mo but pays your assistant just $800. With Sagan, you hire directly — no middleman forever tax. See the real numbers.',
  canonical: 'https://saganpassport.com/vs/growth-assistant-vs-sagan',
  calendlyUrl: 'https://calendly.com/d/5j7-3xv-p5k/global-talent-hiring-consultation',
  heroHeadlineLead: 'Growth Assistant bills you $3,000.',
  heroHeadlineEm: 'Your talent sees $800.',
  heroBody:
    'Growth Assistant pockets $2,200 of every $3,000 you pay. Your assistant gets $800. Their own people called it "diabolical."',
  heroSub: 'No commitment. No pressure. Just the truth.',
  calc: {talentMonthly: 800, middlemanMonthly: 2200, membershipMonthly: 499, finderFeePct: 18},
  comparisonRows: withKeys([
    {_type: 'comparisonRow', label: 'What Is It?', competitorState: 'cross', competitorText: 'Staffing agency. You rent a person for $3,000/mo. They work for GA.', saganState: 'check', saganText: `${CHECK}Hiring service. They find you someone great, you pay once, and that person is <strong>yours</strong>.`},
    {_type: 'comparisonRow', label: 'What Talent Gets Paid', competitorState: 'cross', competitorText: '~$800/mo', competitorSmall: 'Identical either way', saganState: 'check', saganText: `${CHECK}~$800/mo`, saganSmall: 'Identical — same caliber person'},
    {_type: 'comparisonRow', label: 'Membership', competitorState: 'cross', competitorText: 'N/A — locked in at $3K/mo per person', competitorSmall: '90-day minimum', saganState: 'check', saganText: `${CHECK}$499/mo — same price for 1 or 10 hires`, saganSmall: 'Cancel anytime — keep your team'},
    {_type: 'comparisonRow', label: "Finder's Fee", competitorState: 'plain', competitorText: '$0', competitorSmall: "Because you're renting, not hiring", saganState: 'plain', saganText: '$1,728 per person', saganSmall: 'One-time'},
    {_type: 'comparisonRow', label: 'Monthly Per-Person', competitorState: 'cross', competitorText: '$2,200/mo — forever', competitorSmall: '$26,400/yr to the middleman', saganState: 'check', saganText: `${CHECK}$0`, saganSmall: 'Direct pay. No middleman.'},
    {_type: 'comparisonRow', label: 'Cancel?', competitorState: 'cross', competitorText: 'Lose your assistant immediately', saganState: 'check', saganText: `${CHECK}Keep every hire. They're yours.`},
    {_type: 'comparisonRow', label: 'Year 1 Total', labelSmall: 'Not counting salary', competitorState: 'cross', competitorText: '$26,400 to GA', saganState: 'plain', saganText: '<strong class="check">$7,716 to Sagan</strong>'},
    {_type: 'comparisonRow', label: 'Year 2', competitorState: 'cross', competitorText: '$26,400 to GA — again', saganState: 'plain', saganText: '<strong class="check">$5,988 to Sagan</strong>'},
    {_type: 'comparisonRow', label: 'Over 3 Years', competitorState: 'cross', competitorText: '$79,200 to GA', saganState: 'plain', saganText: '<strong class="check">$19,692 to Sagan</strong>', saganSmall: 'Save over $59,000'},
    {_type: 'comparisonRow', label: 'Who Employs Them?', competitorState: 'cross', competitorText: 'Growth Assistant', saganState: 'check', saganText: `${CHECK}YOU employ them directly`},
    {_type: 'comparisonRow', label: 'If You Cancel', competitorState: 'cross', competitorText: 'Lose your assistant', saganState: 'check', saganText: `${CHECK}Your team member stays. Forever.`},
    {_type: 'comparisonRow', label: 'Post-Hire Support', competitorState: 'plain', competitorText: 'Basic PM', saganState: 'check', saganText: `${CHECK}Training, playbooks, community`},
    {_type: 'comparisonRow', label: 'Talent Regions', competitorState: 'plain', competitorText: 'Philippines, Latin America', saganState: 'plain', saganText: 'Latin America, Africa, Asia — global'},
  ]),
  testimonials: withKeys([
    {_type: 'comparisonTestimonial', text: "The peace of mind that we're able to deliver to our clients starts with the partnership with your company.", author: 'Vish Mazumder', role: 'Franchisee, Mighty Dog Roofing'},
    {_type: 'comparisonTestimonial', text: 'I had VERY high expectations when choosing a global talent provider and Sagan Passport has surpassed even those. I have recommended Sagan to 10+ friends.', author: 'DeAnn Gruber', role: 'Franchisee, Massage Envy'},
    {_type: 'comparisonTestimonial', text: 'I have hired well over 100 people in my career. Sagan led the way for us the entire time. The team is collaborative and communicative.', author: 'Warren Lzo', role: 'Franchisee, PropertyCraft Management'},
    {_type: 'comparisonTestimonial', text: 'The time to hire was faster than we have ever accomplished internally. The quality appears to be as good or better than local hiring.', author: 'Mark Miller', role: 'Franchisee, Soccer Shots Buffalo'},
    {_type: 'comparisonTestimonial', text: 'As a new business owner, it has been worth every penny. Sagan strives to blow us away with valuable work that improves every month.', author: 'John Kelly', role: 'Franchisee, Rolling Suds'},
  ]),
}

const scalesource = {
  _id: 'comparison-scalesource-vs-sagan',
  _type: 'comparison',
  title: 'Scale Source vs Sagan',
  slug: {_type: 'slug', current: 'scalesource-vs-sagan'},
  competitor: 'Scale Source',
  seoTitle: 'Scalesource versus Sagan Comparison',
  seoDescription:
    'Superior Fence franchises are switching from Scale Source to Sagan. See why direct hiring beats staffing markup — same talent, fraction of the cost.',
  canonical: 'https://saganpassport.com/vs/scalesource-vs-sagan',
  calendlyUrl: 'https://calendly.com/d/5j7-3xv-p5k/global-talent-hiring-consultation',
  heroHeadlineLead: 'Scale Source Bills You',
  heroHeadlineEm: '$900.',
  heroBody:
    "Every month, Scale Source keeps ~$1,100+ of what you pay. Your office admin gets the rest. Other Superior Fence franchises already figured this out. Here's the math.",
  heroSub: 'No commitment. No pressure. Just the truth.',
  // NOTE: this page's calculator is NOT %-based. middlemanMonthly (1183) and
  // membershipMonthly (499) are the only values consumed by the calc; talentMonthly
  // (~900) and finderFeePct are recorded for editorial parity but the page uses a
  // flat per-hire finder's fee ($1,728) hardcoded inline in the component.
  calc: {talentMonthly: 900, middlemanMonthly: 1183, membershipMonthly: 499, finderFeePct: 18},
  comparisonRows: withKeys([
    {_type: 'comparisonRow', label: 'What Is It?', competitorState: 'plain', competitorText: 'Staffing agency. You rent a person for $2,083/mo. They work for Scale Source.', saganState: 'plain', saganText: 'Hiring service. They find you someone great. That person is <strong>yours</strong>.'},
    {_type: 'comparisonRow', label: 'What Talent Gets Paid', competitorState: 'plain', competitorText: '~$900/mo', competitorSmall: 'Identical either way', saganState: 'plain', saganText: '~$900/mo', saganSmall: 'Same caliber. Same person.'},
    {_type: 'comparisonRow', label: 'Membership', competitorState: 'plain', competitorText: "N/A — you're locked in at $2,083+/mo per person", saganState: 'plain', saganText: '$499/mo — same price for 1 or 10 hires', saganSmall: 'Cancel anytime. Keep your team.'},
    {_type: 'comparisonRow', label: "Finder's Fee", competitorState: 'plain', competitorText: '$0', competitorSmall: "Because you're renting, not hiring", saganState: 'plain', saganText: 'One-time per person', saganSmall: "That's the cost of finding someone great."},
    {_type: 'comparisonRow', label: 'Monthly Fee Per Person', competitorState: 'plain', competitorText: '~$1,183/mo — forever', competitorSmall: "That's $14,196/yr not going to your hire", saganState: 'plain', saganText: '$0', saganSmall: 'Once hired, you pay them directly.'},
    {_type: 'comparisonRow', label: 'Year 1 Total', labelSmall: '(beyond salary)', competitorState: 'plain', competitorText: '<span style="color: var(--red); font-weight: 700;">$14,196 to Scale Source</span>', saganState: 'plain', saganText: '<span style="color: var(--green); font-weight: 700;">~$7,716 to Sagan</span>', saganSmall: "Finder's fee + membership"},
    {_type: 'comparisonRow', label: 'Year 2 Total', competitorState: 'plain', competitorText: '<span style="color: var(--red); font-weight: 700;">$14,196 to Scale Source — again</span>', saganState: 'plain', saganText: '<span style="color: var(--green); font-weight: 700;">$5,988 to Sagan</span>', saganSmall: 'Just the membership. No new fees.'},
    {_type: 'comparisonRow', label: 'Over 3 Years', competitorState: 'plain', competitorText: '<span style="color: var(--red); font-weight: 700;">$42,588 to Scale Source</span>', saganState: 'plain', saganText: '<span style="color: var(--green); font-weight: 700;">$13,704 to Sagan</span>'},
    {_type: 'comparisonRow', label: 'If You Cancel', competitorState: 'plain', competitorText: 'You lose your person immediately', saganState: 'plain', saganText: "<strong>Your team member stays.</strong> They're yours. Forever."},
    {_type: 'comparisonRow', label: 'Who Employs Talent?', competitorState: 'plain', competitorText: 'Scale Source employs them', saganState: 'plain', saganText: '<strong>YOU</strong> employ them directly'},
    {_type: 'comparisonRow', label: 'Post-Hire Support', competitorState: 'plain', competitorText: '"We stay in touch" — basic PM', saganState: 'plain', saganText: 'Training, playbooks, community, 90-day guarantee'},
    {_type: 'comparisonRow', label: 'Talent Regions', competitorState: 'plain', competitorText: 'Latin America (narrow pool)', saganState: 'plain', saganText: 'Latin America, Africa, Asia — global'},
  ]),
  testimonials: withKeys([
    {_type: 'comparisonTestimonial', text: "<strong>The peace of mind that we're able to deliver to our clients starts with the partnership with your company.</strong> I want to say thank you from the bottom of our heart.", author: 'Vish Mazumder', role: 'Franchisee, Mighty Dog Roofing'},
    {_type: 'comparisonTestimonial', text: '<strong>I had VERY high expectations when choosing a global talent provider and Sagan Passport has surpassed even those.</strong> I have recommended Sagan to 10+ friends.', author: 'DeAnn Gruber', role: 'Franchisee, Massage Envy'},
    {_type: 'comparisonTestimonial', text: '<strong>They challenge you to think differently about global talent.</strong> They knocked it out of the park. Both candidates were brought to me in 7–10 days.', author: 'Greg Van Horn', role: 'Franchisee, Bumble Roofing'},
    {_type: 'comparisonTestimonial', text: '<strong>The time to hire was faster than we have ever been able to accomplish internally.</strong> The quality of hire appears to be as good or better than locally.', author: 'Mark Miller', role: 'Franchisee, Soccer Shots Buffalo'},
    {_type: 'comparisonTestimonial', text: '<strong>As a new business owner, it has been worth every penny.</strong> Sagan Passport strives to just blow us away with valuable work that seems to improve every month.', author: 'John Kelly', role: 'Franchisee, Rolling Suds'},
    {_type: 'comparisonTestimonial', text: '<strong>I have hired well over 100 people in my career. Sagan led the way for us the entire time.</strong> The team is collaborative and communicative at each step.', author: 'Warren Lzo', role: 'Franchisee, PropertyCraft Management'},
  ]),
}

const somewhere = {
  _id: 'comparison-somewhere-vs-sagan',
  _type: 'comparison',
  title: 'Somewhere vs Sagan',
  slug: {_type: 'slug', current: 'somewhere-vs-sagan'},
  competitor: 'Somewhere',
  seoTitle: 'Somewhere versus Sagan Comparison',
  seoDescription:
    "Compare Somewhere and Sagan for hiring global talent. See how Sagan's membership model saves you more on every hire — plus ongoing post-hire support Somewhere doesn't offer.",
  canonical: 'https://saganpassport.com/vs/somewhere-vs-sagan',
  calendlyUrl: 'https://calendly.com/d/5j7-3xv-p5k/global-talent-hiring-consultation',
  heroHeadlineLead: 'Somewhere Charges More.',
  heroHeadlineEm: 'Sagan Gives You More.',
  heroBody:
    'Both companies recruit global talent directly for your team. The difference? Sagan costs less per hire, saves you more as you scale, and supports you long after the hire.',
  heroSub: 'No commitment. No pressure. See if Sagan is the right fit.',
  // NOTE: source calculator uses a salary-input model (35% competitor rate vs 18%
  // Sagan rate + $499/mo membership). Only membershipMonthly + finderFeePct map to
  // the schema; the 35% competitor rate + $2,000 default salary input stay inline.
  calc: {membershipMonthly: 499, finderFeePct: 18},
  comparisonRows: withKeys([
    {_type: 'comparisonRow', label: 'Hiring Fee', competitorState: 'cross', competitorText: '35% of Year 1 salary', saganState: 'check', saganText: '18% of Year 1 salary'},
    {_type: 'comparisonRow', label: 'Direct Hire', competitorState: 'plain', competitorText: '&#10003;&ensp;Yes', saganState: 'check', saganText: '&#10003;&ensp;Yes'},
    {_type: 'comparisonRow', label: 'Unlimited Hires From Talent Pool', competitorState: 'cross', competitorText: '&#10007;&ensp;No', saganState: 'check', saganText: '&#10003;&ensp;Yes, included with membership'},
    {_type: 'comparisonRow', label: 'Cost for 1 Hire', labelSmall: '@ $24K/yr salary', competitorState: 'plain', competitorText: '$8,400', saganState: 'plain', saganText: '<strong class="check">$4,320</strong> + $499/mo'},
    {_type: 'comparisonRow', label: 'Cost for 3 Hires', labelSmall: '@ $24K/yr salary each', competitorState: 'plain', competitorText: '$25,200', saganState: 'plain', saganText: '<strong class="check">$12,960</strong> + $499/mo'},
    {_type: 'comparisonRow', label: 'Cost for 6 Hires', labelSmall: '@ $24K/yr salary each', competitorState: 'plain', competitorText: '$50,400', saganState: 'plain', saganText: '<strong class="check">$25,920</strong> + $499/mo'},
    {_type: 'comparisonRow', label: 'Post-Hire Support', competitorState: 'cross', competitorText: '&#10007;&ensp;None', saganState: 'check', saganText: '&#10003;&ensp;Community, playbooks, live Q&As'},
    {_type: 'comparisonRow', label: 'Onboarding Help', competitorState: 'cross', competitorText: "&#10007;&ensp;You're on your own", saganState: 'check', saganText: '&#10003;&ensp;Systems &amp; playbooks included'},
    {_type: 'comparisonRow', label: 'Ongoing Training Resources', competitorState: 'cross', competitorText: '&#10007;&ensp;None', saganState: 'check', saganText: '&#10003;&ensp;For you and your hires'},
    {_type: 'comparisonRow', label: 'Peer Community of Executives', competitorState: 'cross', competitorText: '&#10007;&ensp;No', saganState: 'check', saganText: '&#10003;&ensp;Founder &amp; CEO network'},
    {_type: 'comparisonRow', label: 'Replacement Guarantee', competitorState: 'plain', competitorText: '6 months (1 replacement)', saganState: 'check', saganText: '&#10003;&ensp;Unlimited for members'},
    {_type: 'comparisonRow', label: 'Talent Regions', competitorState: 'plain', competitorText: 'Philippines, South Africa, Latin America', saganState: 'plain', saganText: 'Latin America, Africa, Asia &mdash; global'},
  ]),
  testimonials: withKeys([
    {_type: 'comparisonTestimonial', text: 'Very differentiated by including training and assessing as part of their offering. Many firms just source candidates and that is it.', author: 'Mike Smith', role: 'Managing Partner, Scrappy Capital'},
    {_type: 'comparisonTestimonial', text: 'The business model makes it extremely affordable to enter the global talent pool without significant one-time fees. Great ongoing resources, and they continue to develop tools as part of the membership.', author: 'Ryan Shackelford', role: 'Owner & CPA, Shack Accounting'},
    {_type: 'comparisonTestimonial', text: 'They challenge you to think differently about global talent. They educate you on a complicated market. And they deliver the goods.', author: 'Greg Van Horn', role: 'Owner, Bumble Roofing'},
  ]),
}

async function main() {
  for (const doc of [athena, growthAssistant, scalesource, somewhere]) {
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
