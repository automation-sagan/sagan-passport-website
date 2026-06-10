import { sanityClient } from 'sanity:client';
import { inlineBodyHtml, type RichTextBody } from './richTextHtml';

/** Cell text is inline rich text in Sanity; getComparisonBySlug() serializes
 * it to HTML strings before the vs components see it. */
export interface ComparisonRow {
  label?: string;
  labelSmall?: string;
  competitorState?: 'cross' | 'neutral' | 'plain';
  competitorText?: string;
  competitorSmall?: string;
  saganState?: 'check' | 'neutral' | 'plain';
  saganText?: string;
  saganSmall?: string;
}

export interface ComparisonTestimonial {
  text?: string;
  author?: string;
  role?: string;
}

export interface ComparisonData {
  slug: string;
  competitor?: string;
  seoTitle?: string;
  seoDescription?: string;
  canonical?: string;
  calendlyUrl?: string;
  heroHeadlineLead?: string;
  heroHeadlineEm?: string;
  heroBody?: string;
  heroSub?: string;
  calc?: {
    talentMonthly?: number;
    middlemanMonthly?: number;
    membershipMonthly?: number;
    finderFeePct?: number;
  };
  comparisonRows?: ComparisonRow[];
  testimonials?: ComparisonTestimonial[];
}

const COMPARISON_FIELDS = `
  "slug": slug.current,
  competitor,
  seoTitle,
  seoDescription,
  canonical,
  calendlyUrl,
  heroHeadlineLead,
  heroHeadlineEm,
  heroBody,
  heroSub,
  calc,
  comparisonRows[]{ label, labelSmall, competitorState, competitorText, competitorSmall, saganState, saganText, saganSmall },
  testimonials[]{ text, author, role }
`;

/** All comparison slugs (for getStaticPaths). */
export async function getAllComparisonSlugs(): Promise<string[]> {
  const rows = await sanityClient.fetch<{ slug: string }[]>(
    `*[_type == "comparison" && defined(slug.current)]{ "slug": slug.current }`,
  );
  return (rows ?? []).map((r) => r.slug);
}

/** Fetch one comparison by slug (queried at build time). */
export async function getComparisonBySlug(slug: string): Promise<ComparisonData | null> {
  const doc = await sanityClient.fetch<ComparisonData | null>(
    `*[_type == "comparison" && slug.current == $slug][0]{${COMPARISON_FIELDS}}`,
    { slug },
  );
  if (!doc) return null;
  doc.comparisonRows = doc.comparisonRows?.map((r) => ({
    ...r,
    competitorText: inlineBodyHtml(r.competitorText as RichTextBody | string | undefined),
    saganText: inlineBodyHtml(r.saganText as RichTextBody | string | undefined),
  }));
  return doc;
}
