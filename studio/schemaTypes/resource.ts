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
    }),
    defineField({
      name: 'mainImage',
      type: 'image',
      options: {hotspot: true},
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
