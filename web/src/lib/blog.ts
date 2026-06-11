import { sanityClient } from 'sanity:client';
import type { SanityImageSource } from '@sanity/image-url';
import { richBodyHtml, type RichTextBody } from './richTextHtml';

export interface BlogCostCard {
  title?: string;
  price?: string;
  unit?: string;
}

/* content/content2 are Portable Text; legacy documents (pre-backfill) still
 * hold raw HTML strings — richBodyHtml() accepts both. */
export interface BlogSection {
  label?: string;
  title?: string;
  intro?: string;
  content?: RichTextBody | string;
  quote?: string;
  content2?: RichTextBody | string;
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
  imageAlt?: string;
  featured?: boolean;
}

export interface BlogCTAData {
  title?: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
}

/** Full article shape for /blog/[slug]. */
export interface BlogFull extends BlogSummary {
  intro?: RichTextBody | string;
  costCards?: BlogCostCard[];
  costNote?: string;
  sections?: BlogSection[];
  cta?: BlogCTAData;
  authorImageAlt?: string;
  useH2Headings?: boolean;
  showSidebar?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: SanityImageSource;
  schemaMarkup?: string;
}

/** SEO meta for the /blog listing page (blogIndex singleton). */
export interface BlogIndexData {
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: SanityImageSource;
}

const LIST_QUERY = `*[_type == "blog" && defined(slug.current)] | order(coalesce(date, "") desc){
  "slug": slug.current,
  title, category, date, readTime, author, authorImage, image,
  "imageAlt": image.alt, featured
}`;

const FULL_FIELDS = `
  "slug": slug.current,
  title, category, date, readTime, author, authorImage, image,
  "imageAlt": image.alt, "authorImageAlt": authorImage.alt, featured,
  "intro": coalesce(intro, introHtml),
  costNote,
  costCards[]{ title, price, unit },
  sections[]{ label, title, intro, content, quote, content2 },
  cta{ title, description, buttonText, buttonLink },
  useH2Headings, showSidebar,
  seoTitle, seoDescription, ogImage, schemaMarkup
`;

/** All blog posts as card summaries (newest first). */
export async function getBlogList(): Promise<BlogSummary[]> {
  return (await sanityClient.fetch<BlogSummary[]>(LIST_QUERY)) ?? [];
}

/** SEO meta for the /blog listing page (queried at build time). */
export async function getBlogIndex(): Promise<BlogIndexData> {
  return (
    (await sanityClient.fetch<BlogIndexData | null>(
      `*[_type == "blogIndex"][0]{ seoTitle, seoDescription, ogImage }`,
    )) ?? {}
  );
}

/** All blog slugs (for getStaticPaths). */
export async function getBlogSlugs(): Promise<string[]> {
  const rows = await sanityClient.fetch<{ slug: string }[]>(
    `*[_type == "blog" && defined(slug.current)]{ "slug": slug.current }`,
  );
  return (rows ?? []).map((r) => r.slug);
}

async function fetchBlog(client: typeof sanityClient, slug: string): Promise<BlogFull | null> {
  const post = await client.fetch<BlogFull | null>(
    `*[_type == "blog" && slug.current == $slug][0]{${FULL_FIELDS}}`,
    { slug },
  );
  if (!post) return null;
  // cta.description is rich text in Sanity; BlogCTA renders an HTML string.
  if (post.cta?.description) {
    post.cta = { ...post.cta, description: richBodyHtml(post.cta.description as RichTextBody | string) };
  }
  return post;
}

/** One blog post by slug (queried at build time). */
export async function getBlog(slug: string): Promise<BlogFull | null> {
  return fetchBlog(sanityClient, slug);
}

/** One blog post by slug with DRAFT content (the editor's unpublished state
 * layered over the published doc). Used only by the SSR preview route — needs
 * the server-side SANITY_API_READ_TOKEN since drafts are private. */
export async function getBlogDraft(slug: string): Promise<BlogFull | null> {
  const token = import.meta.env.SANITY_API_READ_TOKEN;
  if (!token) return null;
  const draftsClient = sanityClient.withConfig({
    token,
    useCdn: false,
    perspective: 'drafts',
  });
  return fetchBlog(draftsClient, slug);
}

/** Format an ISO date as "Mon D, YYYY" (empty string if unset). */
export function formatDate(iso?: string): string {
  if (!iso) return '';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const d = new Date(iso);
  return `${months[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}
