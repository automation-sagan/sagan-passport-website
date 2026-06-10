import {defineArrayMember, defineField, defineType} from 'sanity'

/** A resource article (multi-entry: case studies, podcasts, testimonials).
 * Mirrors the Framer "Resources" CMS collection. Rendered by web's
 * /resources/[slug] and listed on /resources. */
export const resource = defineType({
  name: 'resource',
  title: 'Resource',
  type: 'document',
  groups: [
    {name: 'meta', title: 'Meta'},
    {name: 'content', title: 'Content'},
  ],
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      group: 'meta',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: {source: 'title', maxLength: 200},
      description: 'URL path under /resources/.',
      group: 'meta',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'seoTitle',
      title: 'Page title (SEO)',
      type: 'string',
      description: 'Shown in the browser tab and search results. Blank = "<Title> - Sagan Passport".',
      group: 'meta',
    }),
    defineField({
      name: 'seoDescription',
      title: 'Meta description (SEO)',
      type: 'text',
      rows: 3,
      description: 'Shown under the title in search results and social shares. Aim for 150–160 characters.',
      group: 'meta',
    }),
    defineField({
      name: 'ogImage',
      title: 'Social share image',
      type: 'image',
      description: 'Overrides the sitewide default from Site settings. 1200×630 recommended.',
      group: 'meta',
    }),
    defineField({
      name: 'category',
      type: 'string',
      description: 'e.g. Case Studies, Podcasts, Testimonials',
      group: 'meta',
    }),
    defineField({
      name: 'date',
      type: 'datetime',
      group: 'meta',
    }),
    defineField({
      name: 'authorName',
      type: 'string',
      group: 'meta',
    }),
    defineField({
      name: 'authorImage',
      type: 'image',
      options: {hotspot: true},
      group: 'meta',
      fields: [defineField({name: 'alt', type: 'string', title: 'Alt text'})],
    }),
    defineField({
      name: 'mainImage',
      type: 'image',
      options: {hotspot: true},
      group: 'meta',
      fields: [defineField({name: 'alt', type: 'string', title: 'Alt text'})],
    }),
    defineField({
      name: 'shareLink',
      title: 'Share link',
      type: 'url',
      description: 'The copy-link button URL. Blank = https://saganpassport.com/resources/<slug>.',
      group: 'meta',
    }),
    defineField({
      name: 'youtubeId',
      title: 'YouTube video ID',
      type: 'string',
      description: 'e.g. jH_M9Wfm6Nc from https://youtu.be/jH_M9Wfm6Nc',
      group: 'meta',
    }),
    defineField({
      name: 'sections',
      type: 'array',
      group: 'content',
      of: [defineArrayMember({type: 'resourceSection'})],
    }),
    defineField({
      name: 'testimonials',
      type: 'array',
      group: 'content',
      of: [defineArrayMember({type: 'resourceTestimonial'})],
    }),
  ],
  preview: {
    select: {title: 'title', subtitle: 'category', media: 'mainImage'},
  },
})
