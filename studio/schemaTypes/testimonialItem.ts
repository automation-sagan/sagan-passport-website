import {defineField, defineType} from 'sanity'

/** A testimonial wall card: avatar (+ optional platform badge), name, source and quote. */
export const testimonialItem = defineType({
  name: 'testimonialItem',
  title: 'Testimonial',
  type: 'object',
  fields: [
    defineField({
      name: 'name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'subtitle',
      type: 'string',
      description: 'e.g. From X',
    }),
    defineField({
      name: 'quote',
      type: 'text',
      rows: 4,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'avatar',
      type: 'image',
      options: {hotspot: true},
    }),
    defineField({
      name: 'logo',
      title: 'Platform badge',
      type: 'image',
      description: 'Small badge shown over the avatar (e.g. the X logo).',
      options: {hotspot: true},
    }),
  ],
  preview: {
    select: {title: 'name', subtitle: 'quote', media: 'avatar'},
  },
})
