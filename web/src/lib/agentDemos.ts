import { sanityClient } from 'sanity:client';

export interface AgentDemoData {
  slug: string;
  seoTitle?: string;
  seoDescription?: string;
  canonical?: string;
  heroEyebrow?: string;
  heroHeadlineHtml?: string;
  heroLeadHtml?: string;
  ctaUrl?: string;
}

const AGENT_FIELDS = `
  "slug": slug.current,
  seoTitle,
  seoDescription,
  canonical,
  heroEyebrow,
  heroHeadlineHtml,
  heroLeadHtml,
  ctaUrl
`;

/** All agent-demo slugs (for getStaticPaths if needed). */
export async function getAllAgentDemoSlugs(): Promise<string[]> {
  const rows = await sanityClient.fetch<{ slug: string }[]>(
    `*[_type == "agentDemo" && defined(slug.current)]{ "slug": slug.current }`,
  );
  return (rows ?? []).map((r) => r.slug);
}

/** Fetch one agent demo by slug (queried at build time). */
export async function getAgentDemoBySlug(slug: string): Promise<AgentDemoData | null> {
  return (
    (await sanityClient.fetch<AgentDemoData | null>(
      `*[_type == "agentDemo" && slug.current == $slug][0]{${AGENT_FIELDS}}`,
      { slug },
    )) ?? null
  );
}
