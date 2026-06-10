import { sanityClient } from 'sanity:client';
import type { SanityImageSource } from '@sanity/image-url';
import { richBodyHtml, type RichTextBody } from './richTextHtml';

/** Section content is rich text in Sanity; getResource() serializes it to an
 * HTML string before the component sees it. */
export interface ResourceSection {
  tag?: string;
  title?: string;
  content?: string;
}

export interface ResourceTestimonial {
  content?: string;
  personName?: string;
}

/** Card/summary shape for the /resources listing grid. */
export interface ResourceSummary {
  slug: string;
  title?: string;
  category?: string;
  authorName?: string;
  authorImage?: SanityImageSource;
  date?: string;
  mainImage?: SanityImageSource;
}

/** Full article shape for the /resources/[slug] detail page. */
export interface ResourceFull extends ResourceSummary {
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: SanityImageSource;
  shareLink?: string;
  youtubeId?: string;
  mainImageAlt?: string;
  authorImageAlt?: string;
  sections?: ResourceSection[];
  testimonials?: ResourceTestimonial[];
}

/** SEO meta for the /resources listing page (resourcesIndex singleton). */
export interface ResourcesIndexData {
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: SanityImageSource;
}

const LIST_QUERY = `*[_type == "resource" && defined(slug.current)] | order(coalesce(date, "") desc){
  "slug": slug.current,
  title, category, authorName, authorImage, date, mainImage
}`;

const FULL_FIELDS = `
  "slug": slug.current,
  title, seoTitle, seoDescription, ogImage,
  category, authorName, authorImage, date, mainImage, shareLink, youtubeId,
  "mainImageAlt": mainImage.alt, "authorImageAlt": authorImage.alt,
  sections[]{ tag, title, content },
  testimonials[]{ content, personName }
`;

/** All published resources as card summaries (newest first), for the listing. */
export async function getResourceList(): Promise<ResourceSummary[]> {
  return (await sanityClient.fetch<ResourceSummary[]>(LIST_QUERY)) ?? [];
}

/** SEO meta for the /resources listing page (queried at build time). */
export async function getResourcesIndex(): Promise<ResourcesIndexData> {
  return (
    (await sanityClient.fetch<ResourcesIndexData | null>(
      `*[_type == "resourcesIndex"][0]{ seoTitle, seoDescription, ogImage }`,
    )) ?? {}
  );
}

/** All published resource slugs (for getStaticPaths). */
export async function getResourceSlugs(): Promise<string[]> {
  const rows = await sanityClient.fetch<{ slug: string }[]>(
    `*[_type == "resource" && defined(slug.current)]{ "slug": slug.current }`,
  );
  return (rows ?? []).map((r) => r.slug);
}

/** One resource article by slug (queried at build time). */
export async function getResource(slug: string): Promise<ResourceFull | null> {
  const doc = await sanityClient.fetch<ResourceFull | null>(
    `*[_type == "resource" && slug.current == $slug][0]{${FULL_FIELDS}}`,
    { slug },
  );
  if (!doc) return null;
  doc.sections = doc.sections?.map((s) => ({
    ...s,
    content: richBodyHtml(s.content as RichTextBody | string | undefined),
  }));
  return doc;
}

/** Format an ISO date as "Mon D, YYYY" (empty string if unset). */
export function formatDate(iso?: string): string {
  if (!iso) return '';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const d = new Date(iso);
  return `${months[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}
