import {defineField, defineType} from 'sanity'

/** A single FAQ question + answer. Blank lines in the answer split paragraphs. */
export const faqItem = defineType({
  name: 'faqItem',
  title: 'FAQ item',
  type: 'object',
  fields: [
    defineField({
      name: 'question',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'answer',
      type: 'text',
      rows: 8,
      description: 'Separate paragraphs with blank lines.',
    }),
  ],
  preview: {
    select: {title: 'question'},
  },
})
