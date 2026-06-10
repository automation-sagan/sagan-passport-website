/* Portable Text → HTML for blog bodies (intro + section content). Blog content
 * is authored as rich text in Sanity (blogBody) and serialized to an HTML
 * string here at build time, then inserted with set:html — same classes the
 * old Framer HTML relied on (.article-content rules in blog.css). */
import { toHTML, type PortableTextComponents } from '@portabletext/to-html';

/** One Portable Text block as stored in Sanity (loose — content is build-time only). */
export interface BlogBodyBlock {
  _type: string;
  _key?: string;
  [key: string]: unknown;
}

export type BlogBody = BlogBodyBlock[];

const components: PortableTextComponents = {
  marks: {
    link: ({ children, value }) => {
      const href: string = value?.href ?? '#';
      const external = /^https?:\/\//.test(href);
      const attrs = external ? ' target="_blank" rel="noreferrer"' : '';
      return `<a href="${href}"${attrs}>${children}</a>`;
    },
  },
};

/** Serialize a blogBody (Portable Text) to HTML; empty string when unset.
 * Legacy documents (pre-backfill) store these fields as raw HTML strings —
 * pass those through so deploys don't depend on the data migration order. */
export function blogBodyHtml(body?: BlogBody | string | null): string {
  if (!body || body.length === 0) return '';
  if (typeof body === 'string') return body;
  return toHTML(body as Parameters<typeof toHTML>[0], { components });
}
