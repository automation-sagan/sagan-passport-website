import {defineField, defineType} from 'sanity'

/**
 * Singleton holding sitewide SEO defaults (one document, id "siteSettings").
 * Pages fall back to these values when they don't set their own — the social
 * share image and the Organization structured data come from here.
 */
export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site settings',
  type: 'document',
  fields: [
    defineField({
      name: 'siteName',
      title: 'Site name',
      type: 'string',
      description: 'Used as og:site_name and as the Organization name in structured data.',
    }),
    defineField({
      name: 'siteUrl',
      title: 'Site URL',
      type: 'url',
      description:
        'Production origin (no trailing slash), e.g. https://saganpassport.com. Canonical URLs and og:url are built from this.',
    }),
    defineField({
      name: 'ogImage',
      title: 'Default social share image',
      type: 'image',
      description:
        'Shown when pages are shared on social media (Open Graph / Twitter). 1200×630 recommended. Pages can override it with their own image.',
    }),
    defineField({
      name: 'logo',
      title: 'Organization logo',
      type: 'image',
      description: 'Used in the Organization structured data (JSON-LD) for search engines.',
    }),
  ],
  preview: {
    prepare: () => ({title: 'Site settings'}),
  },
})
