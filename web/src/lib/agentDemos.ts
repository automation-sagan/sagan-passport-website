import { sanityClient } from 'sanity:client';
import { inlineBodyHtml, type RichTextBody } from './richTextHtml';

/** Hero copy is inline rich text in Sanity; getAgentDemoBySlug() serializes it
 * to HTML strings, so components keep rendering heroHeadlineHtml/heroLeadHtml. */
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
  "heroHeadlineHtml": coalesce(heroHeadline, heroHeadlineHtml),
  "heroLeadHtml": coalesce(heroLead, heroLeadHtml),
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
  const doc = await sanityClient.fetch<AgentDemoData | null>(
    `*[_type == "agentDemo" && slug.current == $slug][0]{${AGENT_FIELDS}}`,
    { slug },
  );
  if (!doc) return null;
  doc.heroHeadlineHtml = inlineBodyHtml(doc.heroHeadlineHtml as RichTextBody | string | undefined);
  doc.heroLeadHtml = inlineBodyHtml(doc.heroLeadHtml as RichTextBody | string | undefined);
  return doc;
}
