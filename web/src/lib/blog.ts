import { sanityClient } from 'sanity:client';
import type { SanityImageSource } from '@sanity/image-url';

export interface BlogCostCard {
  title?: string;
  price?: string;
  unit?: string;
}

export interface BlogSection {
  label?: string;
  title?: string;
  content?: string;
}

/** Card/summary shape for the /blog grid and the "More from the blog" sidebar. */
export interface BlogSummary {
  slug: string;
  title?: string;
  category?: string;
  date?: string;
  readTime?: string;
  author?: string;
  authorImage?: SanityImageSource;
  image?: SanityImageSource;
}

export interface BlogCTAData {
  title?: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
}

/** Full article shape for /blog/[slug]. */
export interface BlogFull extends BlogSummary {
  introHtml?: string;
  costCards?: BlogCostCard[];
  costNote?: string;
  sections?: BlogSection[];
  cta?: BlogCTAData;
}

const LIST_QUERY = `*[_type == "blog" && defined(slug.current)] | order(coalesce(date, "") desc){
  "slug": slug.current,
  title, category, date, readTime, author, authorImage, image
}`;

const FULL_FIELDS = `
  "slug": slug.current,
  title, category, date, readTime, author, authorImage, image,
  introHtml, costNote,
  costCards[]{ title, price, unit },
  sections[]{ label, title, content },
  cta{ title, description, buttonText, buttonLink }
`;

/** All blog posts as card summaries (newest first). */
export async function getBlogList(): Promise<BlogSummary[]> {
  return (await sanityClient.fetch<BlogSummary[]>(LIST_QUERY)) ?? [];
}

/** All blog slugs (for getStaticPaths). */
export async function getBlogSlugs(): Promise<string[]> {
  const rows = await sanityClient.fetch<{ slug: string }[]>(
    `*[_type == "blog" && defined(slug.current)]{ "slug": slug.current }`,
  );
  return (rows ?? []).map((r) => r.slug);
}

/** One blog post by slug (queried at build time). */
export async function getBlog(slug: string): Promise<BlogFull | null> {
  return (
    (await sanityClient.fetch<BlogFull | null>(
      `*[_type == "blog" && slug.current == $slug][0]{${FULL_FIELDS}}`,
      { slug },
    )) ?? null
  );
}

/** Format an ISO date as "Mon D, YYYY" (empty string if unset). */
export function formatDate(iso?: string): string {
  if (!iso) return '';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const d = new Date(iso);
  return `${months[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}
