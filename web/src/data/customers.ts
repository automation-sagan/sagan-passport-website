/* Content for the per-vertical customer landing pages — real copy and assets
 * extracted from the live saganpassport.com/customers/* pages. All verticals
 * share one template (CustomerPage / CustomerTemplate). Logo strips reuse a
 * shared placeholder set; person photos and role flags fall back to the Framer
 * component defaults. */

export interface ServiceCard { title: string; body: string }
export interface TalentPerson { role: string; from: string; rate: string }
export interface RoleEntry { title: string; country: string; rate: string }
export interface Testimonial { image: string; quote: string; name: string; title: string }
export interface CustomerData {
  eyebrow: string
  hero: { title: string; body: string; image: string }
  logosHeading: string
  logos: string[]
  serviceCards: ServiceCard[]
  talent: { heading: string; subheading: string; people: TalentPerson[]; ticker1: string[]; ticker2: string[] }
  caseStudy: { title: string; body: string; image: string; youtubeId: string }
  roles: { heading: string; body: string; entries: RoleEntry[] }
  testimonials?: Testimonial[]
}

const PLACEHOLDER_LOGOS = [
  "https://framerusercontent.com/images/yIhJMsUzuwiMaAdyKUvBnQyVg.png",
  "https://framerusercontent.com/images/NbWsPL76Rh6o2shiDcBHo8Xwj0.png",
  "https://framerusercontent.com/images/o1oxigOg0MV4Cq2qlLbROui3l4s.png",
  "",
  "https://framerusercontent.com/images/PejKFYc6OV9IZKBZFr44pI1Cwc.png",
]


export const homeServices: CustomerData = {
  eyebrow: "Home Services",
  hero: { title: "Build Your Operations Team. Scale Your Business.", body: "You’re a trades expert who should be growing revenue, not buried in schedules, phones, and paperwork. Hire operations coordinators, dispatchers, and customer service reps who run the office so you can run the business.", image: "https://framerusercontent.com/images/kIVycQQJwan9YybKGC5UbTVU8ls.png" },
  logosHeading: "Trusted by Leading Home Service Companies",
  logos: PLACEHOLDER_LOGOS,
  serviceCards: [
    { title: "One Role. One Function. Done Right.", body: "Stop giving one person five jobs. Hire hyper-focused roles for permits, fleet coordination, safety audits, and more flawlessly executed at a fraction of U.S. costs." },
    { title: "Every Call Answered. Every Lead Closed.", body: "We build overseas call center teams that book jobs and drive sales. Get a sales \"shark\" making 300–400 cold calls a day or a marketing team keeping your pipeline full." },
    { title: "Win the Talent War for Skilled Trades", body: "We build you a recruiting engine with global sourcing experts. One member hired a single tech role that drove $1M in revenue." },
    { title: "Big-Company Talent. SMB Budget.", body: "Controllers. Accountants. Web Developers. Top global talent that brings expertise and best practices, not just savings." },
  ],
  talent: {
    heading: "Extraordinary talent, exceptional cost",
    subheading: "Examples of talent we’ve recently sourced:",
    people: [
      { role: "Dispatch & Operations Coordinator", from: "Mayra from Ecuador", rate: "Full Time - $1,800/month" },
      { role: "Construction Project Coordinator", from: "Alejandro from Mexico", rate: "Full Time - $2,900/month" },
      { role: "Dispatcher", from: "Darcy from Philippines", rate: "Full Time - $2,000/month" },
    ],
    ticker1: ["Inbound Call Center Agent", "Quality Control Auditor", "Controller", "Bookkeeper & Accountant", "Permit & Compliance Coordinator"],
    ticker2: ["Fleet Coordinator", "Controller", "Web & Software Developer", "Executive Admin", "Skilled Trades Recruiter"],
  },
  caseStudy: { title: "How a Plumbing Business Grew Revenue from $6M to $25M in 3 Years", body: "Aizik Zimerman acquired a plumbing business and grew it to $25M in three years using global talent. Today, nearly half of his 100-person team came through Sagan. His approach: stop thinking “hiring people” and start thinking “buying business functions.” Instead of asking how to keep someone busy 40 hours a week, he asks: “What single thing, done every day, would be worth $18,000 a year to my business?” That mindset let him build entire departments for call handling, recruiting, finance, and quality control without inflating overhead.", image: "https://framerusercontent.com/images/6Ve4I8cSeWu9kEP8oCNTVhmngI.jpeg", youtubeId: "ngO1dtGfkcc" },
  roles: {
    heading: "Roles That Power Home Service Businesses",
    body: "Here are just a few of the roles we’ve successfully placed for businesses like yours, freeing up owners to focus on growth.",
    entries: [
      { title: "Inbound Sales Representative", country: "Egypt", rate: "Full Time $1,000/month" },
      { title: "SEO and Web Design Specialist", country: "Nigeria", rate: "Full Time $1,500/month" },
      { title: "Customer Support & Sales Specialist", country: "El Salvador", rate: "Full Time $1,400/month" },
      { title: "Technical Support Specialist", country: "Pakistan", rate: "Full Time $3,000/month" },
      { title: "Tier II Support Engineer (MSP)", country: "South Africa", rate: "Full Time $2,700/month" },
    ],
  },
  testimonials: [
    { image: "https://framerusercontent.com/images/mbnSG60dpb8dSFDSkCCBCWkXR1M.jpg?width=400&height=400", quote: "\"We recently hired our first controller. That was a very high-impact, very important role. Sagan searched, vetted, and presented a handful of candidates... it was actually difficult to select one because they were all strong.\"", name: "Rich Jordan", title: "Founder, StrongPoint Services" },
  ],
};

export const privateEquity: CustomerData = {
  eyebrow: "Private Equity",
  hero: { title: "Build the Team to Execute Your Portfolio Playbook", body: "You acquire businesses with potential. We provide the finance, operations, and integration talent to professionalize portfolio companies and execute your value creation plan without inflating overhead.", image: "https://framerusercontent.com/images/GVDRkNSsUTbMN2iQmZvmv6oow.png" },
  logosHeading: "Trusted by Top-Rated Private Equity Firms",
  logos: PLACEHOLDER_LOGOS,
  serviceCards: [
    { title: "Professionalize Your Portfolio Fast", body: "Your portfolio companies need to unwind founder-led habits. We place finance and operations talent who build scalable systems, freeing your US CFO to focus on growth strategy instead of cleanup." },
    { title: "Build a Centralized Growth Engine", body: "Stop reinventing the wheel with each acquisition. We build centralized teams for marketing, customer support, and franchisee relations that can be deployed across your portfolio for faster playbook execution." },
    { title: "Redeploy Capital Into Growth", body: "This is intelligent resource allocation. Leverage world-class global talent at an average 70% savings to invest more in your US-based leaders and create a powerful engine for growth." },
    { title: "Build Stable Teams in Critical Roles", body: "High turnover kills momentum in portfolio companies. We place full-time professionals in critical roles with near-zero churn and strong engagement. Stability you can count on." },
  ],
  talent: {
    heading: "Extraordinary talent, exceptional cost",
    subheading: "Examples of talent we've recently sourced:",
    people: [
      { role: "Digital Marketing Manager", from: "Federico from Colombia", rate: "Full Time - $2,200/month" },
      { role: "Business Process Analyst", from: "Juan Luis from Mexico", rate: "Full Time - $1,500/month" },
      { role: "Controller", from: "Luisa from Guatemala", rate: "Full Time - $4,000/month" },
    ],
    ticker1: ["Controller", "Private Equity Execution Analyst", "Salesforce Administrator", "FP&A Analyst"],
    ticker2: ["Staff Accountant", "Project Coordinator", "AR & AP Specialist", "M&A Analyst"],
  },
  caseStudy: { title: "How Galleon Built a World-Class Remote Team Without the Premium Price Tag", body: "Amanda Orson is building Galleon, a real estate platform designed to blow up the traditional commission model. Instead of homeowners paying $25,000+ to sell their house, Galleon's Navigator software lets them do it themselves for $899. It's a classic disruptive play: take advantage of lower transaction costs that incumbents won't pass along to consumers, build a more efficient operating model, and scale fast. But to pull that off, Galleon needed to move quickly. They needed AI engineers to build their multi-agent platform. Operations specialists to optimize workflows. Technical talent who could execute without the overhead of traditional Silicon Valley salaries. Traditional hiring methods were too slow and too expensive. Recruiting agencies wanted $8,000 per hire. Local tech talent in major markets commanded six-figure salaries. The math didn't work for a lean startup trying to disrupt a 112-year-old industry. That's when Amanda found Sagan.", image: "https://framerusercontent.com/images/5t80r1dlayEHymWLOJOwvAYCs.jpg", youtubeId: "g5_N1y2DM58" },
  roles: {
    heading: "The Roles That Drive Portfolio Value",
    body: "We place the talent you need to execute your growth playbook, with most roles filled for under $2,500/month.",
    entries: [
      { title: "Service Dispatcher", country: "Honduras", rate: "Full Time $2,000/month" },
      { title: "Senior Salesforce Administrator", country: "Philippies", rate: "Full Time $4,000/month" },
      { title: "Video Editor - Longform + Shortform Specialist", country: "South Africa", rate: "Full Time $2,400/month" },
      { title: "Digital Marketing Manager", country: "Argentina", rate: "Full Time $3,250/month" },
    ],
  },
  testimonials: [
    { image: "https://framerusercontent.com/images/4xcjJHO001E5pzLdnH3ZpD1eK9Q.jpeg?width=800", quote: "“The reason why I like Sagan was because there were more frameworks as it relates to hiring globally. Sagan has a lot of the templates and frameworks of how to onboard someone and bring them into western business culture.”", name: "Clayton Hepler", title: "Founder, Hepler Land Holdings" },
  ],
};

export const smallBusinesses: CustomerData = {
  eyebrow: "Small Businesses",
  hero: { title: "Stop Wearing All the Hats. Start Being the CEO", body: "You started a business to grow it, not get buried in daily operations. Hire dedicated operations coordinators, bookkeepers, and executive assistants who run the day to day so you can focus on what actually drives revenue.", image: "https://framerusercontent.com/images/4iVKVolFynx3PUhmZaawP3IFPuM.png" },
  logosHeading: "Trusted by Hundreds of Ambitious Small Businesses",
  logos: PLACEHOLDER_LOGOS,
  serviceCards: [
    { title: "Big-Company Talent. Small-Business Speed.", body: "Access the talent you thought you couldn't afford yet. We place marketing coordinators, bookkeepers, and executive assistants who bring professional systems to your business. Build your big company team without big company overhead." },
    { title: "Go From Founder to CEO", body: "Get out of the day-to-day and into growth mode. Hire dedicated professionals to handle admin, bookkeeping, and operations. You focus on sales, strategy, and the work that actually grows your business." },
    { title: "Hire an A-Player, Not a Paper-Pusher", body: "We vet thousands so you don't have to. You get a shortlist of the top 1% with video intros so you see personality and drive before the first call." },
  ],
  talent: {
    heading: "Extraordinary talent, exceptional cost",
    subheading: "Examples of talent we've recently sourced:",
    people: [
      { role: "Appointment Setter", from: "Sebastian from Colombia", rate: "Full Time - $1,600/month" },
      { role: "Commercial & Digital Law Specialist", from: "Johanna from Argentina", rate: "Full Time / $2,600/month" },
      { role: "Content Creator", from: "Santiago from Colombia", rate: "Full Time - $2,000/month" },
    ],
    ticker1: ["Executive Admin", "Marketing Coordinator", "Social Media Manager", "Bookkeeper & Accountant"],
    ticker2: ["Customer Service Representative", "Sales Development Representative", "Operations Manager", "SEO/Ads Specialist:"],
  },
  caseStudy: { title: "How an Architect Bought Back Her Business and Rebuilt It Leaner using AI and Sagan as a partner", body: "Cathryn Lavery sold her e-commerce business to a PE firm. They laid off her team and changed the strategy. She bought it back and decided to run it differently. Through Sagan, she built a small core team with AI tools integrated from day one. She hired three people from South America: a video editor, an operations coordinator, and a customer success manager. Her approach: hire smart, hungry, coachable people who can grow with the company instead of expensive mid-level US hires who plateau. The result: a leaner business that moves faster and costs less to operate.", image: "https://framerusercontent.com/images/zC6ZDQQk4vzkB120zAFyuY2nU.png", youtubeId: "o7qt4Gz-aPo" },
  roles: {
    heading: "The Roles That Power Small Business Growth",
    body: "Here are just a few of the roles we’ve successfully placed for businesses like yours.",
    entries: [
      { title: "Marketing and Operations Coordinator", country: "Columbia", rate: "Full Time $900/month" },
      { title: "Digital Marketing and SEO Services Industry", country: "Kenya", rate: "Full Time $2,000/month" },
      { title: "Marketing Coordinator", country: "Argentina", rate: "FULL TIME $1,800/month" },
    ],
  },
  testimonials: [
    { image: "https://framerusercontent.com/images/pvvzAkVNLRljq07sCVVMN7hJe8.jpg?width=1698", quote: "\"That first amazing hire will completely change your mind and will just unlock a lot for you. I'm surprised now how strong our team is and how much cool stuff we're able to do.\"", name: "Justin Goodhart", title: "Owner, Goodhart Coffee" },
  ],
};

export const healthWellness: CustomerData = {
  eyebrow: "Health & Wellness",
  hero: { title: "Build Your Clinical Team. Grow Your Practice.", body: "You went to medical school to treat patients, not chase insurance claims. Hire medical billing specialists, patient coordinators, and virtual receptionists who handle the chaos so you can focus on patient care and growth.", image: "https://framerusercontent.com/images/O5IYIt2nOOqcbfrzB7Kt7SXrgM.png" },
  logosHeading: "Trusted by Leading Healthcare Practices, Wellness Brands, and DSOs",
  logos: PLACEHOLDER_LOGOS,
  serviceCards: [
    { title: "Master Your Revenue Cycle", body: "Stop losing revenue to claim denials and billing errors. We place Medical Billing Specialists and Coders who know your software (Open Dental, Dentrix, NetSuite) and get claims paid faster." },
    { title: "Stabilize Your Front Desk", body: "Front desk turnover kills patient satisfaction and costs you money. We place Virtual Receptionists and Patient Coordinators who answer every call, manage scheduling, and stay long term. No more training replacements every six months." },
    { title: "Scale Your Financial Rigor", body: "Growing from one location to multiple requires professional finance functions. We place Staff Accountants and Controllers who manage multi-location P&Ls, payroll compliance, and financial reporting without the six-figure salary." },
    { title: "Amplify Your Brand Voice", body: "Whether you are a \"celebrity doctor\" or a growing franchise, patient acquisition starts with visibility. We place Video Editors and Social Media Managers who turn your expertise into content that attracts patients. Build your brand without hiring a full marketing team." },
  ],
  talent: {
    heading: "Extraordinary talent, exceptional cost",
    subheading: "Examples of talent we've recently sourced:",
    people: [
      { role: "Administrative Assistant (Patient Scheduling)", from: "Carlos from Honduras", rate: "Full Time / $1,700/month" },
      { role: "Marketing Coordinator", from: "Amber from Nicaragua", rate: "Full Time / $3,000/month" },
      { role: "Medical Virtual Assistant", from: "Josephine from Philippines", rate: "Full Time - $1,200/month" },
    ],
    ticker1: ["Dental Billing Specialist", "Virtual Receptionist", "Senior Staff Accountant", "Chief of Staff"],
    ticker2: ["Video Editor & Social Strategist", "HR & Payroll Specialist", "Compliance Officer", "Clinical Data Analyst"],
  },
  caseStudy: { title: "How a Doctor-Owned DSO Group with 22 Practices is Leveraging Global Talent to Scale and Provide Affordable Care", body: "Dr. Dave Ensley runs Celebrate Dental & Braces, a 22-location DSO doing $70M in revenue. His biggest constraint wasn't demand or capital. It was recruiting orthodontists fast enough to keep expanding. Before Sagan, Dave had already built global teams: a 15-person call center in Mexico and a 20-person billing team in the Philippines. He chose Sagan to avoid staffing markup fees and deal directly with employees. Through Sagan, Dave hired a senior accountant in Pakistan to strengthen his finance team and ensure clean, timely books. But the real strategic move was using labor arbitrage to solve recruiting. By building efficient operations with global talent, Dave freed up capital to pay orthodontists above market rates. Now he's the most attractive employer in his markets. His growth constraint shifted from \"we can't find doctors\" to \"how fast can we open locations?\".", image: "https://framerusercontent.com/images/HJOhObfqKWtvck5d49mtBCS4.png", youtubeId: "dWunPWE9sYM" },
  roles: {
    heading: "Roles That Power Modern Healthcare Practices",
    body: "Here are the roles we place to help owners reclaim their time.",
    entries: [
      { title: "Social Media Content Specialist", country: "Colombia", rate: "Full Time $2,000/month" },
      { title: "Revenue Cycle Manager", country: "Philippines", rate: "Full Time $3,500/month" },
      { title: "Operations Coordinator", country: "Philippines", rate: "Full Time $1,300/month" },
      { title: "Operations Project Coordinator", country: "Colombia", rate: "Full Time $3,200/month" },
    ],
  },
  testimonials: [
    { image: "https://framerusercontent.com/images/GIcOAn0NkFAgtTxbK6w9McaRqg.jpeg?width=200", quote: "\"You get a lot of great hires for a great price from all over the globe.\"", name: "David Ensley", title: "Partner, Celebrate Dental" },
  ],
};

export const franchises: CustomerData = {
  eyebrow: "Franchises",
  hero: { title: "You Didn't Buy a Franchise to Answer Phones", body: "You invested in a proven franchise system, but you're stuck answering phones, scheduling jobs, and chasing invoices. Hire operations coordinators, appointment setters, and bookkeepers at a lower cost than US rates.", image: "https://framerusercontent.com/images/R9wpqGpAhSn3uRWi4ip5uNwMfM.png" },
  logosHeading: "Trusted by America's Most Innovative Franchise Brands",
  logos: PLACEHOLDER_LOGOS,
  serviceCards: [
    { title: "Solve the Execution Bottleneck", body: "Your playbook is collecting dust because you're too busy putting out fires. Hire operations coordinators who execute the system while you focus on growth, recruiting, and opening new locations." },
    { title: "Break the Growth Bottleneck", body: "You can't sell, coach, or scout new locations from behind a screen. We build your growth engine with Appointment Setters and SDRs who keep your pipeline full." },
    { title: "Fix the Consistency Bottleneck", body: "Multi-unit franchises need brand consistency across locations. Build centralized marketing, customer service, or scheduling teams that support all your locations without multiplying overhead." },
    { title: "End the Expertise Bottleneck", body: "You need senior-level help but can't afford six-figure salaries. Hire Financial Analysts, Accountants, and Digital Marketers who professionalize your operations at a lower cost." },
  ],
  talent: {
    heading: "Extraordinary talent, exceptional cost",
    subheading: "Examples of talent we've recently sourced:",
    people: [
      { role: "Operations Coordinator", from: "Samuel from Colombia", rate: "Full Time - $1,800/month" },
      { role: "Customer Support Specialist", from: "Mina from Egypt", rate: "Full Time - $1,500/month" },
      { role: "Project Manager", from: "Carlos from Honduras", rate: "Full Time - $2,200/month" },
    ],
    ticker1: ["Operations Assistant", "Virtual Assistant", "Business Development Representative", "Franchise Development SDR"],
    ticker2: ["Digital Marketing Coordinator", "Installation Manager", "Tech Lead", "HR Recruiter"],
  },
  caseStudy: { title: "How Former Pro Baseball Player Brandon Beachy Scaled His Koala Insulation Franchise and Upgraded Staff Quality with Sagan Talent", body: "Brandon Beachy, a former professional baseball player turned Koala Insulation franchise owner in Nashville and franchise consultant, found himself in a bind when his local receptionist quit suddenly. He turned to Sagan and replaced that single employee with two full-time global team members for less than the previous hire's cost. One handles phone calls and scheduling from Argentina. The other, based in Colombia, manages takeoffs for single-family homes and large commercial projects, and is plugged directly into the sales reps' CRM to ensure estimates go out fast and follow-up never falls through the cracks. Brandon plans to use Sagan University's training tracks to develop his global hires into junior leaders.", image: "https://framerusercontent.com/images/F9gF98Nah08zb0D2AvhAt6Bn9k.png", youtubeId: "-Jx8ql65PYw" },
  roles: {
    heading: "Roles That Support Scalable Franchise Operations",
    body: "Here are some of the roles we’ve successfully placed for franchise brands.",
    entries: [
      { title: "Waiting for Corz", country: "South Africa", rate: "Full Time $3,000/month" },
      { title: "Inbound Sales Associate", country: "South Africa", rate: "Full Time $3,000/month" },
      { title: "Chief of Staff", country: "Mexico", rate: "Full Time $3,000-4,000/month" },
      { title: "Technical Support Specialist", country: "Pakistan", rate: "Full Time $3,000/month" },
      { title: "Tier II Support Engineer (MSP)", country: "South Africa", rate: "Full Time $2,700/month" },
    ],
  },
  testimonials: [
    { image: "https://framerusercontent.com/images/nLZezpTxS5OgnyOnHEfhLRDFug.jpeg?width=200", quote: "\"Sagan Passport strives to just blow us away with valuable work that seems to improve every month.\"", name: "John Kelly", title: "Owner, Rolling Suds of Montgomery County" },
  ],
};

export const professionalServices: CustomerData = {
  eyebrow: "Professional Services",
  hero: { title: "Stop Doing Admin Work. Start Billing Hours.", body: "Your time belongs on strategy, not ops. Sagan places high-caliber global talent to run your systems so you can focus on growth and scale with confidence.", image: "https://framerusercontent.com/images/CuH3ujtJKRi1FsGbBfso2lJ99V4.png" },
  logosHeading: "Trusted by Leading Service-Based Businesses",
  logos: PLACEHOLDER_LOGOS,
  serviceCards: [
    { title: "A Hiring Model That Actually Scales", body: "One member used to pay $10,000 per hire. With Sagan, they made six hires and gained access to additional resources for a fraction of that cost." },
    { title: "We Are Your Partners, Not Just Providers", body: "We adapt as your needs evolve. Building a new practice area? Launching a new service line? We help you refine job descriptions, iterate on roles, and adjust as you grow. You get flexibility, not a rigid hiring process." },
    { title: "Go Global. Get Stronger.", body: "Distributed teams win with diversity of thought and experience. We help you build a culturally rich team with top talent from around the world, making your entire organization sharper." },
    { title: "Scale with Confidence and Speed", body: "Talent and infrastructure are no longer your limiting factors. With a proven recruiting system and the ability to build your team at scale, you grow faster and signal strength to partners and clients." },
  ],
  talent: {
    heading: "Extraordinary talent, exceptional cost",
    subheading: "Examples of talent we've recently sourced:",
    people: [
      { role: "Customer Experience Specialist", from: "Consolata from Kenya", rate: "Full Time - $900/month" },
      { role: "Operations and Team Development Manager", from: "Jonathan from Guatemala", rate: "Full Time / $1,800/month" },
      { role: "Full Stack Developer", from: "Juan Pablo from Colombia", rate: "Full Time / $3,500/month" },
    ],
    ticker1: ["Executive Assistant", "Operations Manager", "Web Developer", "Content Coordinator"],
    ticker2: ["Staff Accountant", "Controller", "Marketing Support", "Business Development Manager"],
  },
  caseStudy: { title: "How an Anonymous Twitter Account Became a Profitable Franchise Consulting Firm", body: "Patrick built an audience as Franchise Wolf—an anonymous Twitter account breaking down franchise deals, industry trends, and business opportunities. He had insights. He had engagement. He had credibility in the franchise space. What he didn't have was a scalable business model. His first attempt was a data-driven franchise research platform. Makes sense, right? He had all this knowledge. People wanted franchise information. Sell them research. Except nobody bought it. \"I learned the hard way that prospective franchise buyers don't want to pay for data,\" Patrick said. \"They want expert guidance. They'll pay a broker or consultant way more money for high-touch advice than they'll pay for a research subscription.\" That realization led Patrick to pivot. Instead of selling data, he co-founded FranDogs—a franchise consulting firm that helps people buy, sell, and scale franchise businesses. But to make it work, he needed leverage. He couldn't just trade his time for money. He needed systems, automation, and the right team. That's where Sagan came in.", image: "https://framerusercontent.com/images/tO0KXQscxHLNKe2wRBafnbAtQh0.jpg", youtubeId: "nQVe7FesTi8" },
  roles: {
    heading: "The Roles That Drive Operational Excellence",
    body: "A few examples of the roles we've filled for businesses like yours.",
    entries: [
      { title: "Sales Development Associate - M&A Financing", country: "Mexico", rate: "Full Time $2,100/month" },
      { title: "CRM & Web Integration Specialist", country: "Mexico", rate: "Full Time $3,500/month" },
      { title: "Tier II Support Engineer (MSP)", country: "South Africa", rate: "Full Time $2,700/month" },
      { title: "Senior Bookkeeper", country: "Philippines", rate: "Full Time $2,400/month" },
    ],
  },
  testimonials: [
    { image: "https://framerusercontent.com/images/TqtMUcIvxB3ehgsc9SZfZO2w2U.jpeg?width=200", quote: "\"Sagan has been 'game-changing' for our hiring process. We’ve made six hires for what we used to pay for one. The value is significant.\"", name: "Founder, Lane Rizzardini", title: "Marian Relationship Marketing" },
  ],
};

export const realEstate: CustomerData = {
  eyebrow: "Real Estate",
  hero: { title: "Build Your Operations Team. Scale Your Portfolio.", body: "Your focus should be closing deals, filling units, and breaking ground. Hire operations coordinators, leasing agents, and transaction coordinators who handle the admin so you can focus on what drives revenue.", image: "https://framerusercontent.com/images/NFjCk3wVH2CWFRTAYIXUB6eUMh4.png" },
  logosHeading: "Trusted by the Industry’s Fastest-Growing Firms",
  logos: PLACEHOLDER_LOGOS,
  serviceCards: [
    { title: "Systematize Your Operations", body: "The secret to scaling past 1,000 units? Hyper-focused roles. Whether you manage rentals, flip properties, or develop from the ground up, we build your operational machine at a fraction of U.S. hiring costs." },
    { title: "Build a Well-Oiled Leasing Funnel", body: "Every inquiry answered in minutes. Every lead followed up. We build leasing, sales, and acquisitions teams that respond fast, nurture prospects, and keep your pipeline full, from tenant leads to investor outreach." },
    { title: "Build a Back Office That Actually Works", body: "Work orders getting lost. Owner reports delayed. Transactions falling through the cracks. Hire operations coordinators who live in your property management software, track every detail, and keep everyone informed without you having to chase them down." },
    { title: "Big-Firm Team. SMB Budget.", body: "Level the playing field. We place Property Bookkeepers, Transaction Coordinators, and Revenue Managers who professionalize your operations and impress your clients at a fraction of the cost." },
  ],
  talent: {
    heading: "Extraordinary talent, exceptional cost",
    subheading: "Examples of talent we've recently sourced:",
    people: [
      { role: "Senior Bookkeeper", from: "Johana from Mexico", rate: "Full Time - $2,900/month" },
      { role: "Property Manager Assistant", from: "Ayssen from Nicaragua", rate: "Full Time - $1,300/month" },
      { role: "Leasing and Accounts Payable Coordinator", from: "Paola from Mexico", rate: "Full Time - $1,120/month" },
    ],
    ticker1: ["Assistant Property Manager", "Property Bookkeeper", "Maintenance Coordinator", "Acquisitions Analyst"],
    ticker2: ["Sales Closer", "Rental Revenue Manager", "Transaction Coordinator", "Inside Sales Associate"],
  },
  caseStudy: { title: "How Incline Homes Owner Jacob Klein Scaled His Real Estate Businesses and Affordable Luxury Product Using Sagan Talent", body: "Jacob Kline runs Incline Homes, a new construction company delivering a \"luxury product\" at bottom-10% pricing, and One Properties, a real estate acquisition business. He's spent five years building with global talent, using it to scale and access specialized labor at lower revenue thresholds. Through Sagan, he's hired roles like a controller from Pakistan starting at $1,200 a month. His longest-tenured global hire, an assistant from the Philippines, has grown into a key operational role. Jacob actively uses Sagan University training tracks to develop leadership and management skills across his team, and the conversation digs into how the behaviors that helped you survive as a founder can eventually hold your organization back.", image: "https://framerusercontent.com/images/E9CoYrMexRQOsp9SJnMbpNoaqeA.png", youtubeId: "dUaj-5u-5tc" },
  roles: {
    heading: "Roles That Power Real Estate Growth",
    body: "Here are some of the roles we’ve successfully placed for real estate businesses.",
    entries: [
      { title: "Staff Accountant (Property Management)", country: "Philippines", rate: "Full Time $1,840/month" },
      { title: "Social Media Growth Manager", country: "Argentina", rate: "Full Time $3,500/month" },
      { title: "Property Management Bookkeeper", country: "Philippines", rate: "Full Time $1,500/month" },
      { title: "Video Editor - Longform & Shortform Specialist", country: "Philippines", rate: "Full Time $2,400/month" },
    ],
  },
  testimonials: [
    { image: "https://framerusercontent.com/images/6r0tz1Bg5ugh6g77oSzsDnem00w.jpeg?width=200", quote: "\"I’m impressed with the learning we got from the highly intelligent people within their community.\"", name: "Dawn Duerksen", title: "Property Manager, Duerksen & Associates" },
  ],
};

export const customers = {
  "home-services": homeServices,
  "private-equity": privateEquity,
  "small-businesses": smallBusinesses,
  "health-wellness": healthWellness,
  "franchises": franchises,
  "professional-services": professionalServices,
  "real-estate": realEstate,
} as const;

export type CustomerSlug = keyof typeof customers;
