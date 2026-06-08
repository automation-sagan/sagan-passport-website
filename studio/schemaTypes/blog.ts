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
    }),
    defineField({
      name: 'image',
      title: 'Cover image',
      type: 'image',
      options: {hotspot: true},
      group: 'meta',
    }),
    defineField({
      name: 'introHtml',
      title: 'Intro (HTML)',
      type: 'text',
      rows: 5,
      group: 'content',
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
  ],
  preview: {
    select: {title: 'title', subtitle: 'category', media: 'image'},
  },
})
