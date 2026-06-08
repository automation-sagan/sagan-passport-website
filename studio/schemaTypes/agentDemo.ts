import {defineField, defineType} from 'sanity'

/** An AI-agent demo landing page (/agent/<slug>). Multi-entry, one doc per
 * vertical. These pages are bespoke (each has its own demo UI + persuasive copy
 * in its Astro component); this document holds the key editable fields: meta,
 * the hero copy, and the primary CTA/waitlist URL. The hero head/lead are stored
 * as HTML (rendered with set:html) so the original inline emphasis is preserved
 * while staying editable. */
export const agentDemo = defineType({
  name: 'agentDemo',
  title: 'AI Agent demo',
  type: 'document',
  groups: [
    {name: 'meta', title: 'Meta'},
    {name: 'hero', title: 'Hero'},
    {name: 'cta', title: 'CTA'},
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Internal title',
      type: 'string',
      description: 'e.g. AI Answering, Freight.',
      group: 'meta',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: {source: 'title'},
      description: 'URL path under /agent/ — e.g. freight. Must match a page component.',
      group: 'meta',
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'seoTitle', title: 'Page title (SEO)', type: 'string', group: 'meta'}),
    defineField({name: 'seoDescription', title: 'Meta description (SEO)', type: 'text', rows: 2, group: 'meta'}),
    defineField({name: 'canonical', title: 'Canonical URL', type: 'url', group: 'meta'}),

    defineField({name: 'heroEyebrow', title: 'Hero eyebrow', type: 'string', group: 'hero'}),
    defineField({
      name: 'heroHeadlineHtml',
      title: 'Hero headline (HTML allowed)',
      type: 'text',
      rows: 3,
      description: 'Inline HTML (<span>, <br>, <em>) is preserved.',
      group: 'hero',
    }),
    defineField({
      name: 'heroLeadHtml',
      title: 'Hero lead paragraph (HTML allowed)',
      type: 'text',
      rows: 4,
      group: 'hero',
    }),

    defineField({
      name: 'ctaUrl',
      title: 'Primary CTA / waitlist URL',
      type: 'url',
      description: 'The link the hero/nav/footer CTAs point at.',
      group: 'cta',
    }),
  ],
  preview: {
    select: {title: 'title', subtitle: 'slug.current'},
  },
})
