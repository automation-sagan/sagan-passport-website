import {defineField, defineType} from 'sanity'

/** A generic one-off landing page (e.g. /hire-talent, /hire-global-talent,
 * /agency-referrals). Multi-entry, one doc per page, rendered by its own bespoke
 * Astro component. Holds the key editable fields (meta, hero copy, CTA URL); the
 * bespoke layout lives in the component. */
export const landingPage = defineType({
  name: 'landingPage',
  title: 'Landing page',
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
      group: 'meta',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: {source: 'title'},
      description: 'URL path — e.g. hire-talent. Must match a page component.',
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
      group: 'hero',
    }),
    defineField({
      name: 'heroLeadHtml',
      title: 'Hero lead (HTML allowed)',
      type: 'text',
      rows: 4,
      group: 'hero',
    }),

    defineField({name: 'ctaUrl', title: 'Primary CTA URL', type: 'url', group: 'cta'}),
  ],
  preview: {
    select: {title: 'title', subtitle: 'slug.current'},
  },
})
