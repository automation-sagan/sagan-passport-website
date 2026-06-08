import {defineField, defineType} from 'sanity'

/** A review-platform proof card: logo + star rating + "Read Reviews" button. */
export const ratingCard = defineType({
  name: 'ratingCard',
  title: 'Rating card',
  type: 'object',
  fields: [
    defineField({
      name: 'logo',
      type: 'image',
      options: {hotspot: true},
    }),
    defineField({
      name: 'logoAlt',
      title: 'Logo alt text',
      type: 'string',
    }),
    defineField({
      name: 'rating',
      title: 'Rating label',
      type: 'string',
      description: 'e.g. 4.9 star rating',
    }),
    defineField({
      name: 'buttonLabel',
      type: 'string',
    }),
    defineField({
      name: 'buttonHref',
      title: 'Button link',
      type: 'string',
    }),
  ],
  preview: {
    select: {title: 'logoAlt', subtitle: 'rating', media: 'logo'},
  },
})
