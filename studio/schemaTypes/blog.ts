import {defineArrayMember, defineField, defineType} from 'sanity'

/** A blog post (multi-entry). Mirrors the Framer "Blog" CMS collection. Rendered
 * by web's /blog/[slug] and listed on /blog. */
export const blog = defineType({
  name: 'blog',
  title: 'Blog post',
  type: 'document',
  groups: [
    {name: 'meta', title: 'Meta'},
    {name: 'content', title: 'Content'},
    {name: 'seo', title: 'SEO'},
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
      description: 'URL path under /blog/.',
      group: 'meta',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'category',
      type: 'string',
      description: 'e.g. BLOG POST',
      group: 'meta',
    }),
    defineField({
      name: 'date',
      type: 'datetime',
      group: 'meta',
    }),
    defineField({
      name: 'readTime',
      type: 'string',
      description: 'e.g. 10 min read',
      group: 'meta',
    }),
    defineField({
      name: 'author',
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
      name: 'image',
      title: 'Cover image',
      type: 'image',
      options: {hotspot: true},
      group: 'meta',
      fields: [defineField({name: 'alt', type: 'string', title: 'Alt text'})],
    }),
    defineField({
      name: 'featured',
      type: 'boolean',
      group: 'meta',
      description: 'Featured post — listed first on /blog.',
    }),
    defineField({
      name: 'intro',
      title: 'Intro',
      type: 'richBody',
      group: 'content',
      description: 'Lead paragraph(s) shown under the title.',
    }),
    defineField({
      name: 'costCards',
      type: 'array',
      group: 'content',
      of: [defineArrayMember({type: 'blogCostCard'})],
    }),
    defineField({
      name: 'costNote',
      type: 'string',
      group: 'content',
    }),
    defineField({
      name: 'sections',
      type: 'array',
      group: 'content',
      of: [defineArrayMember({type: 'blogSection'})],
    }),
    defineField({
      name: 'useH2Headings',
      title: 'Use H2 headings',
      type: 'boolean',
      group: 'content',
      initialValue: true,
      description: 'On: section titles render as H2 (recommended for SEO). Off: H3. Mirrors the Framer "Use H2 Headings" flag.',
    }),
    defineField({
      name: 'showSidebar',
      title: 'Show sidebar',
      type: 'boolean',
      group: 'content',
      initialValue: true,
      description: 'Off: full-width article with no sidebar (no "More from the blog" or CTA).',
    }),
    defineField({
      name: 'cta',
      title: 'Sidebar CTA',
      type: 'object',
      group: 'content',
      description: 'Editable per post. Blank fields fall back to the site default.',
      fields: [
        defineField({name: 'title', type: 'string'}),
        defineField({name: 'description', type: 'richBody'}),
        defineField({name: 'buttonText', type: 'string'}),
        defineField({
          name: 'buttonLink',
          type: 'string',
          description: 'Optional. Defaults to the consultation booking link.',
        }),
      ],
    }),
    defineField({
      name: 'seoTitle',
      title: 'SEO title',
      type: 'string',
      group: 'seo',
      description: 'Overrides the page <title>. Blank = "<Title> — Sagan Passport".',
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO description',
      type: 'text',
      rows: 3,
      group: 'seo',
      description: 'Meta description shown in search results.',
    }),
    defineField({
      name: 'ogImage',
      title: 'Social share image',
      type: 'image',
      group: 'seo',
      description: 'Overrides the sitewide default from Site settings. 1200×630 recommended.',
    }),
    defineField({
      name: 'schemaMarkup',
      title: 'Schema Markup (JSON-LD)',
      type: 'text',
      rows: 10,
      group: 'seo',
      description: 'Optional raw JSON-LD (e.g. an Article schema) injected into the page <head>.',
      validation: (rule) =>
        rule.custom((value) => {
          if (!value) return true
          try {
            JSON.parse(value)
            return true
          } catch {
            return 'Must be valid JSON'
          }
        }),
    }),
  ],
  preview: {
    select: {title: 'title', subtitle: 'category', media: 'image'},
  },
})
