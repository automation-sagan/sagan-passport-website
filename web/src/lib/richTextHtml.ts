/* Portable Text → HTML for all CMS rich text. Content is authored as rich text
 * in Sanity (richBody for long-form bodies, inlineBody for hero copy and
 * comparison-table cells) and serialized to HTML strings here at build time,
 * then inserted with set:html — emitting the same markup the pages' CSS (and
 * the agent pages' Tailwind CDN) already styles.
 *
 * Every serializer also passes raw strings through unchanged, so legacy
 * documents that still hold HTML keep rendering regardless of whether the data
 * migration or the code deploy lands first. */
import { toHTML, type PortableTextComponents } from '@portabletext/to-html';

/** One Portable Text block as stored in Sanity (loose — content is build-time only). */
export interface RichTextBlock {
  _type: string;
  _key?: string;
  [key: string]: unknown;
}

export type RichTextBody = RichTextBlock[];

const linkComponent = ({ children, value }: { children: string; value?: { href?: string } }) => {
  const href = value?.href ?? '#';
  const external = /^https?:\/\//.test(href);
  const attrs = external ? ' target="_blank" rel="noreferrer"' : '';
  return `<a href="${href}"${attrs}>${children}</a>`;
};

const blockComponents: PortableTextComponents = {
  marks: { link: linkComponent },
};

/** Long-form body (richBody): paragraphs, headings, lists, quotes, links. */
export function richBodyHtml(body?: RichTextBody | string | null): string {
  if (!body || body.length === 0) return '';
  if (typeof body === 'string') return body;
  return toHTML(body as Parameters<typeof toHTML>[0], { components: blockComponents });
}

/* inlineBody decorators → the exact markup the pages already style.
 * highlight/accent/muted appear in hero copy (agent + landing pages, styled by
 * the Tailwind CDN config there); check/good/bad appear in vs-table cells
 * (styled by src/styles/vs/*.css). */
const INLINE_MARKS: Record<string, (children: string) => string> = {
  strong: (c) => `<strong>${c}</strong>`,
  em: (c) => `<em>${c}</em>`,
  highlight: (c) => `<span style="color:#F5B800">${c}</span>`,
  accent: (c) => `<span class="text-glacier font-medium">${c}</span>`,
  muted: (c) => `<span class="text-muted">${c}</span>`,
  check: (c) => `<strong class="check">${c}</strong>`,
  good: (c) => `<span style="color: var(--green); font-weight: 700;">${c}</span>`,
  bad: (c) => `<span style="color: var(--red); font-weight: 700;">${c}</span>`,
};

const inlineComponents: PortableTextComponents = {
  marks: Object.fromEntries(
    Object.entries(INLINE_MARKS).map(([name, wrap]) => [name, ({ children }: { children: string }) => wrap(children)]),
  ),
};
inlineComponents.marks!.link = linkComponent;

/** Inline body (inlineBody): no block wrappers — spans only, with blocks
 * (Enter presses) joined by <br />. Used for hero headlines/leads and
 * comparison cells, which render inside their own h1/p/td containers. */
export function inlineBodyHtml(body?: RichTextBody | string | null): string {
  if (!body || body.length === 0) return '';
  if (typeof body === 'string') return body;
  return body
    .map((block) =>
      toHTML([block] as Parameters<typeof toHTML>[0], {
        components: {
          ...inlineComponents,
          block: { normal: ({ children }) => children ?? '' },
        },
      }),
    )
    .join('<br />');
}
