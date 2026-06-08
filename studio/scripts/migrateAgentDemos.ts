/**
 * One-off migration: create/replace the `agentDemo` documents (one per
 * /agent/<slug> page). Holds the key editable fields (meta, hero copy, CTA URL);
 * the bespoke demo layout lives in each page's Astro component.
 *
 * Run from the studio dir (after `sanity login`):
 *   npx sanity exec scripts/migrateAgentDemos.ts --with-user-token
 */
import {getCliClient} from 'sanity/cli'

const client = getCliClient()

const freight = {
  _id: 'agent-freight',
  _type: 'agentDemo',
  title: 'Freight',
  slug: {_type: 'slug', current: 'freight'},
  seoTitle: 'Ranked freight quotes by lunch, not Thursday — a Sagan AI build',
  seoDescription:
    'An AI agent drafts RFQs, normalizes carrier quotes, and delivers a ranked comparison by lunch. Built for specialty distributors stuck in 48-hour quote cycles.',
  canonical: 'https://saganpassport.com/agent/freight',
  heroEyebrow: 'a Sagan program · currently in private beta',
  heroHeadlineHtml:
    'An RFQ hits your inbox &mdash; <span style="color:#F5B800">four</span> minutes later, you\'re still copy-pasting.<br /><span class="text-muted">Eighty a week. $98K a year gone.</span>',
  heroLeadHtml:
    'Your coordinator opens your inbox. Drafts another RFQ. Waits. Copies quotes into your ops workspace. Walks into your office Thursday with yesterday\'s best rate. <span class="text-glacier font-medium">An AI agent runs the same loop in minutes and delivers a ranked comparison by lunch.</span>',
  ctaUrl: 'https://www.shipyourweekendproject.com/',
}

const aiAnswering = {
  _id: 'agent-ai-answering',
  _type: 'agentDemo',
  title: 'AI Answering',
  slug: {_type: 'slug', current: 'ai-answering'},
  seoTitle: 'Every call answered. Every lead qualified. — a Sagan AI build',
  seoDescription:
    'An AI voice agent that picks up 24/7, qualifies the lead, checks service area, pulls your calendar, books the appointment, texts the customer and notifies you. Talk to it live on this page.',
  canonical: 'https://saganpassport.com/agent/ai-answering',
  heroEyebrow: 'a Sagan program · currently in private beta',
  heroHeadlineHtml:
    'Forty percent of calls<br /> to home services <span style="color:#F5B800">go unanswered.</span><br /> <span class="text-muted">Meet the agent that picks up every one.</span>',
  heroLeadHtml:
    'An AI voice agent answers your line 24/7. Confirms service area. Pulls your calendar. Books the appointment. Texts the customer. Alerts the owner. <span class="text-glacier font-medium">Talk to a live one below &mdash; the same agent we deployed for a real roofing company.</span>',
  ctaUrl: 'https://www.shipyourweekendproject.com/',
}

const leadIntake = {
  _id: 'agent-lead-intake',
  _type: 'agentDemo',
  title: 'Lead Intake',
  slug: {_type: 'slug', current: 'lead-intake'},
  seoTitle: 'A 60-second first reply on every lead — a Sagan AI build',
  seoDescription:
    'An AI agent reads, qualifies, and replies to residential service leads in under a minute across your paid lead channels, intake form, listings sites, and email — then drops them into your CRM with full context.',
  canonical: 'https://saganpassport.com/agent/lead-intake',
  heroEyebrow: 'a Sagan program · currently in private beta',
  heroHeadlineHtml:
    'A lead hits your form — <span style="color:#F5B800">nobody</span> answers.<br /> Fifteen minutes later,<br /> the job is gone.',
  heroLeadHtml:
    "You pull off a job site. Four lead pings stacked across three apps. Oldest came in at 7:12am. You get to them at noon, between stops. Two have gone cold. One already booked the competitor who replied first. <span class=\"text-glacier font-semibold\">An AI agent replies in under a minute on every channel.</span>",
  ctaUrl: 'https://www.shipyourweekendproject.com/',
}

const orderMonitor = {
  _id: 'agent-order-monitor',
  _type: 'agentDemo',
  title: 'Order Monitor',
  slug: {_type: 'slug', current: 'order-monitor'},
  seoTitle: 'Stop finding out from the customer — a Sagan AI build',
  seoDescription:
    'An AI agent that watches every shipment across Shopify and your fulfillment partners, catches silent delays before the customer does, and fires proactive updates through your email flow tool. For $5–20M DTC brands with split fulfillment.',
  canonical: 'https://saganpassport.com/agent/order-monitor',
  heroEyebrow: 'a Sagan program · currently in private beta',
  heroHeadlineHtml:
    'Fifty "where is my order?" tickets a day. Three percent silently late — <span style="color:#F5B800">you</span> hear about it last.',
  heroLeadHtml:
    'A customer emails asking where their order is. Support opens Shopify. The order is split between two fulfillment partners. They log into one portal. Then the other. Pull the tracking number. Paste it back into the ticket. Eight to twelve minutes per lookup, fifty times a day, on your dime. <span class="text-glacier font-medium">An AI agent watches every order and emails the customer before they ask.</span>',
  ctaUrl: 'https://www.shipyourweekendproject.com/',
}

const poolQc = {
  _id: 'agent-pool-qc-second-brain',
  _type: 'agentDemo',
  title: 'Pool QC Second Brain',
  slug: {_type: 'slug', current: 'pool-qc-second-brain'},
  seoTitle: 'Thirty years of judgment, captured before he retires — a Sagan AI build',
  seoDescription:
    "An AI agent trained on your best guy's QC protocols. So the business doesn't depend on whether he's picking up the phone today.",
  canonical: 'https://saganpassport.com/agent/pool-qc-second-brain',
  heroEyebrow: 'a Sagan program · currently in private beta',
  heroHeadlineHtml:
    'Your best QC guy<br /> has done this<br /> <span class="text-tide">for thirty years</span>.<br /> <span class="text-ash">He isn\'t yours forever.</span>',
  heroLeadHtml:
    "A seven-figure custom pool business runs on one guy's thirty years of judgment. He's the reason jobs come out right. He's also sixty-something, his back is going, and he's started asking about Florida. <span class=\"text-ink font-medium\">An AI agent captures his protocols — every callback, every correction, every \"that's a no-go because\" — so the business doesn't stop the day he does.</span>",
  ctaUrl: 'https://www.shipyourweekendproject.com/',
}

const qoe = {
  _id: 'agent-qoe',
  _type: 'agentDemo',
  title: 'QoE',
  slug: {_type: 'slug', current: 'qoe'},
  seoTitle: 'Quality of Earnings, Phase 1 in two days — a Sagan AI build for QoE providers',
  seoDescription:
    'An AI agent that normalizes a QuickBooks export, a trial balance PDF, a tax return, and a custom Excel into your Quality of Earnings databook. For QoE providers where the Phase 1 workup is the bottleneck.',
  canonical: 'https://saganpassport.com/agent/qoe',
  heroEyebrow: 'a Sagan program for QoE providers · currently in private beta',
  heroHeadlineHtml:
    'A QuickBooks export lands Friday &mdash; by <span style="color:#F5B800">Monday</span> you\'re still chasing tie-outs.',
  heroLeadHtml:
    "You run Quality of Earnings for PE buyers. A QuickBooks export, a trial balance PDF, a tax return, a custom Excel from the seller's controller &mdash; normalized into your QoE databook template. <span style=\"color: #093A3E; font-weight: 500;\">An AI agent delivers Phase 1 in 2&ndash;3 days.</span>",
  ctaUrl: 'https://www.shipyourweekendproject.com/',
}

const roofquoteAi = {
  _id: 'agent-roofquote-ai',
  _type: 'agentDemo',
  title: 'RoofQuote AI',
  slug: {_type: 'slug', current: 'roofquote-ai'},
  seoTitle: 'A repair quote in thirty minutes, not five hours — a Sagan AI build',
  seoDescription:
    'An AI agent that generates detailed repair quotes from CompanyCam photos and iRoof measurements. For roofing companies tired of losing weekends to estimates.',
  canonical: 'https://saganpassport.com/agent/roofquote-ai',
  heroEyebrow: 'a Sagan program · currently in private beta',
  heroHeadlineHtml:
    'Four and a half hours.<br /> Per&nbsp;quote.<br /> <span class="text-ember">Every single time.</span>',
  heroLeadHtml:
    'After the crew is home, you open CompanyCam. You match photos to scope. You pull iRoof measurements. You price each line by hand. You build the Google Sheet. You format it. You send it days late. <span class="text-ink font-medium">An AI agent does all of that in thirty minutes.</span>',
  ctaUrl: 'https://www.shipyourweekendproject.com/',
}

const signal = {
  _id: 'agent-signal',
  _type: 'agentDemo',
  title: 'Signal',
  slug: {_type: 'slug', current: 'signal'},
  seoTitle: 'See the deals before anyone else does — a Sagan AI build',
  seoDescription:
    'An AI agent that watches licensing databases, regulatory filings, and operational telemetry to surface medical-sector M&A deals weeks before they hit commercial lists. For buy-side advisory firms sourcing deals for their PE, family-office, and strategic-buyer clients.',
  canonical: 'https://saganpassport.com/agent/signal',
  heroEyebrow: 'a Sagan program · currently in private beta',
  heroHeadlineHtml:
    'Medical-sector deals<br /> are already moving —<br /> <span style="color:#F5B800">silently</span>.',
  heroLeadHtml:
    'You source medical-sector deals for your PE, family-office, and strategic-buyer clients. You burn 15 hours a week reading licensing updates, regulatory filings, and local obits. By the time a signal reaches your pipeline, another buy-side firm has already walked it into LOI. <span class="text-glacier font-medium">An AI agent watches the feeds and surfaces the ones that match.</span>',
  ctaUrl: 'https://www.shipyourweekendproject.com/',
}

const DOCS: any[] = [
  freight,
  aiAnswering,
  leadIntake,
  orderMonitor,
  poolQc,
  qoe,
  roofquoteAi,
  signal,
]

async function main() {
  for (const doc of DOCS) {
    const res = await client.createOrReplace(doc)
    console.log(`✓ ${doc._id} written. _rev=${res._rev}`)
  }
  const count = await client.fetch('count(*[_type == "agentDemo"])')
  console.log(`\n✓ Done. agentDemo docs now in dataset: ${count}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
