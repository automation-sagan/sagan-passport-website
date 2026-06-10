import {defineField, defineType} from 'sanity'

/** Singleton holding SEO meta for the /resources listing page (one document,
 * id "resourcesIndex"). The page's cards come from the `resource` documents;
 * this only covers the page-level head tags. */
export const resourcesIndex = defineType({
  name: 'resourcesIndex',
  title: 'Resources page',
  type: 'document',
  fields: [
    defineField({
      name: 'seoTitle',
      title: 'Page title (SEO)',
      type: 'string',
      description: 'Shown in the browser tab and search results.',
    }),
    defineField({
      name: 'seoDescription',
      title: 'Meta description (SEO)',
      type: 'text',
      rows: 3,
      description: 'Shown under the title in search results and social shares. Aim for 150–160 characters.',
    }),
    defineField({
      name: 'ogImage',
      title: 'Social share image',
      type: 'image',
      description: 'Overrides the sitewide default from Site settings. 1200×630 recommended.',
    }),
  ],
  preview: {
    prepare: () => ({title: 'Resources page (SEO)'}),
  },
})
