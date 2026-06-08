import {defineField, defineType} from 'sanity'

/** A cost card in a blog post's intro (title + price + unit). */
export const blogCostCard = defineType({
  name: 'blogCostCard',
  title: 'Cost card',
  type: 'object',
  fields: [
    defineField({name: 'title', type: 'string'}),
    defineField({name: 'price', type: 'string', description: 'e.g. $800–$1,500'}),
    defineField({name: 'unit', type: 'string', description: 'e.g. / month'}),
  ],
  preview: {
    select: {title: 'title', subtitle: 'price'},
  },
})
