import {defineField, defineType} from 'sanity'

/** A single stat shown on the "designed" guide cover (e.g. 1,358+ Placements). */
export const guideStat = defineType({
  name: 'guideStat',
  title: 'Cover stat',
  type: 'object',
  fields: [
    defineField({name: 'num', title: 'Number', type: 'string'}),
    defineField({name: 'label', title: 'Label', type: 'string'}),
  ],
  preview: {
    select: {title: 'num', subtitle: 'label'},
  },
})
