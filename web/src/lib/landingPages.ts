import { sanityClient } from 'sanity:client';
import { inlineBodyHtml, type RichTextBody } from './richTextHtml';

/** Hero copy is inline rich text in Sanity; getLandingPageBySlug() serializes
 * it to HTML strings, so components keep rendering heroHeadlineHtml/heroLeadHtml. */
export interface LandingPageData {
  slug: string;
  seoTitle?: string;
  seoDescription?: string;
  canonical?: string;
  heroEyebrow?: string;
  heroHeadlineHtml?: string;
  heroLeadHtml?: string;
  ctaUrl?: string;
}

const FIELDS = `
  "slug": slug.current,
  seoTitle,
  seoDescription,
  canonical,
  heroEyebrow,
  "heroHeadlineHtml": coalesce(heroHeadline, heroHeadlineHtml),
  "heroLeadHtml": coalesce(heroLead, heroLeadHtml),
  ctaUrl
`;

export async function getLandingPageBySlug(slug: string): Promise<LandingPageData | null> {
  const doc = await sanityClient.fetch<LandingPageData | null>(
    `*[_type == "landingPage" && slug.current == $slug][0]{${FIELDS}}`,
    { slug },
  );
  if (!doc) return null;
  doc.heroHeadlineHtml = inlineBodyHtml(doc.heroHeadlineHtml as RichTextBody | string | undefined);
  doc.heroLeadHtml = inlineBodyHtml(doc.heroLeadHtml as RichTextBody | string | undefined);
  return doc;
}
