import {defineArrayMember, defineField, defineType} from 'sanity'

/** Raw HTML embed block for rich-text bodies — the Framer-style escape hatch.
 * Editors paste a third-party snippet (YouTube iframe, Calendly widget,
 * HubSpot form, …) and the web build renders it verbatim inside the article.
 * Trusted-editor feature: the code executes on the page as pasted. */
export const htmlEmbed = defineType({
  name: 'htmlEmbed',
  title: 'HTML Embed',
  type: 'object',
  fields: [
    defineField({
      name: 'code',
      title: 'HTML code',
      type: 'text',
      rows: 6,
      description:
        'Paste the embed snippet from the service (iframe, script, widget). It renders exactly where this block sits in the article.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'caption',
      title: 'Caption',
      type: 'string',
      description: 'Optional. Shown under the embed.',
    }),
  ],
  preview: {
    select: {code: 'code', caption: 'caption'},
    prepare({code, caption}) {
      const snippet = (code ?? '').replace(/\s+/g, ' ').slice(0, 60)
      return {title: caption || 'HTML Embed', subtitle: snippet}
    },
  },
})

/** Rich-text body for long-form content (blog intro/sections, resource
 * sections, CTAs). Replaces the raw Framer HTML textareas — the web build
 * converts these blocks back to HTML (web/src/lib/richTextHtml.ts). */
export const richBody = defineType({
  name: 'richBody',
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
    defineArrayMember({type: 'htmlEmbed'}),
  ],
})
