import {defineArrayMember, defineType} from 'sanity'

/** Rich-text body for blog content (intro + section content). Replaces the raw
 * Framer HTML textareas — the web build converts these blocks back to HTML. */
export const blogBody = defineType({
  name: 'blogBody',
  title: 'Body',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [
        {title: 'Normal', value: 'normal'},
        {title: 'H2', value: 'h2'},
        {title: 'H3', value: 'h3'},
        {title: 'H4', value: 'h4'},
        {title: 'Quote', value: 'blockquote'},
      ],
      lists: [
        {title: 'Bullet', value: 'bullet'},
        {title: 'Numbered', value: 'number'},
      ],
      marks: {
        decorators: [
          {title: 'Bold', value: 'strong'},
          {title: 'Italic', value: 'em'},
        ],
        annotations: [
          {
            name: 'link',
            type: 'object',
            title: 'Link',
            fields: [{name: 'href', type: 'url', title: 'URL', validation: (rule: any) => rule.uri({allowRelative: true, scheme: ['http', 'https', 'mailto', 'tel']})}],
          },
        ],
      },
    }),
  ],
})
