import { sanityClient } from 'sanity:client';

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
  heroHeadlineHtml,
  heroLeadHtml,
  ctaUrl
`;

export async function getLandingPageBySlug(slug: string): Promise<LandingPageData | null> {
  return (
    (await sanityClient.fetch<LandingPageData | null>(
      `*[_type == "landingPage" && slug.current == $slug][0]{${FIELDS}}`,
      { slug },
    )) ?? null
  );
}
