import {defineArrayMember, defineField, defineType} from 'sanity'

/** A lead-magnet guide landing page (multi-entry, one document per guide:
 * hiring, compensation, delegation). Rendered by web's /guides/[slug].
 *
 * The right-hand column (intro/headline/value-prop/bullets/form) is shared
 * across all guides. The left-hand "cover" has three bespoke designs, selected
 * by `coverVariant` — each variant exposes only the fields it needs. The PDF
 * itself + the delivery email copy live here too, so the whole lead magnet is
 * editable in the Studio. */
export const guide = defineType({
  name: 'guide',
  title: 'Guide (lead magnet)',
  type: 'document',
  groups: [
    {name: 'meta', title: 'Meta'},
    {name: 'content', title: 'Content'},
    {name: 'cover', title: 'Cover'},
    {name: 'form', title: 'Form'},
    {name: 'email', title: 'Delivery email'},
  ],
  fields: [
    // ---- Meta ----
    defineField({
      name: 'title',
      title: 'Internal title',
      type: 'string',
      description: 'Shown in the Studio list, e.g. Hiring Swipe File.',
      group: 'meta',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: {source: 'title'},
      description: 'URL path under /guides/ — e.g. hiring-guide.',
      group: 'meta',
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'seoTitle', title: 'Page title (SEO)', type: 'string', group: 'meta'}),
    defineField({
      name: 'seoDescription',
      title: 'Meta description (SEO)',
      type: 'text',
      rows: 2,
      group: 'meta',
    }),
    defineField({
      name: 'canonical',
      title: 'Canonical URL',
      type: 'url',
      description: 'e.g. https://saganpassport.com/guides/hiring-guide',
      group: 'meta',
    }),

    // ---- Accent palette (drives CTA + focus colours, faithful per guide) ----
    defineField({
      name: 'accent',
      title: 'Accent colours',
      type: 'object',
      group: 'content',
      options: {collapsible: true, collapsed: true},
      fields: [
        defineField({name: 'cta', title: 'CTA background', type: 'string', description: 'Hex, e.g. #B71C1C'}),
        defineField({name: 'ctaHover', title: 'CTA hover', type: 'string'}),
        defineField({name: 'ctaActive', title: 'CTA active', type: 'string'}),
        defineField({name: 'focus', title: 'Input focus border', type: 'string'}),
        defineField({
          name: 'bright',
          title: 'Bright accent',
          type: 'string',
          description: 'Used on the designed cover (tag, title emphasis, stat numbers).',
        }),
      ],
    }),

    // ---- Content (right column) ----
    defineField({name: 'intro', title: 'Intro line', type: 'string', group: 'content'}),
    defineField({name: 'headline', type: 'string', group: 'content'}),
    defineField({name: 'valueProp', title: 'Value prop', type: 'text', rows: 3, group: 'content'}),
    defineField({
      name: 'bullets',
      type: 'array',
      group: 'content',
      of: [defineArrayMember({type: 'string'})],
    }),
    defineField({
      name: 'bulletStyle',
      title: 'Bullet style',
      type: 'string',
      group: 'content',
      options: {list: ['squares', 'disc'], layout: 'radio'},
      initialValue: 'disc',
      description: 'hiring-guide uses red squares; the others use plain discs.',
    }),

    // ---- Cover (left column) ----
    defineField({
      name: 'coverVariant',
      title: 'Cover layout',
      type: 'string',
      group: 'cover',
      options: {
        list: [
          {title: 'Designed cover (CSS book)', value: 'designed'},
          {title: 'Single image', value: 'image'},
          {title: 'Layered photo + product card', value: 'layered'},
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required(),
    }),

    // image variant
    defineField({
      name: 'coverImage',
      title: 'Cover image',
      type: 'image',
      options: {hotspot: true},
      group: 'cover',
      hidden: ({parent}) => parent?.coverVariant !== 'image',
    }),
    defineField({
      name: 'coverImageAlt',
      title: 'Cover image alt',
      type: 'string',
      group: 'cover',
      hidden: ({parent}) => parent?.coverVariant !== 'image',
    }),

    // designed variant
    defineField({
      name: 'designed',
      title: 'Designed cover',
      type: 'object',
      group: 'cover',
      hidden: ({parent}) => parent?.coverVariant !== 'designed',
      fields: [
        defineField({name: 'tag', title: 'Tag (e.g. Resource Guide · 2026)', type: 'string'}),
        defineField({name: 'titleLead', title: 'Title (lead)', type: 'string'}),
        defineField({name: 'titleAccent', title: 'Title (accent / emphasised)', type: 'string'}),
        defineField({name: 'subtitle', type: 'text', rows: 2}),
        defineField({
          name: 'stats',
          type: 'array',
          of: [defineArrayMember({type: 'guideStat'})],
        }),
        defineField({name: 'brand', type: 'string'}),
        defineField({name: 'badge', type: 'string'}),
      ],
    }),

    // layered variant
    defineField({
      name: 'layered',
      title: 'Layered cover',
      type: 'object',
      group: 'cover',
      hidden: ({parent}) => parent?.coverVariant !== 'layered',
      fields: [
        defineField({name: 'photo', title: 'Personality photo', type: 'image', options: {hotspot: true}}),
        defineField({name: 'logo', type: 'string'}),
        defineField({name: 'title', type: 'string'}),
        defineField({name: 'subtitle', type: 'string'}),
        defineField({
          name: 'learn',
          title: 'Inside list',
          type: 'array',
          of: [defineArrayMember({type: 'string'})],
        }),
        defineField({name: 'badge', type: 'string'}),
        defineField({name: 'brand', type: 'string'}),
      ],
    }),

    // ---- Form ----
    defineField({name: 'formLabel', title: 'Form label', type: 'string', group: 'form'}),
    defineField({name: 'formLabelNote', title: 'Form label note (italic)', type: 'string', group: 'form'}),
    defineField({name: 'buttonText', title: 'Submit button text', type: 'string', group: 'form'}),
    defineField({name: 'successMessage', title: 'Success message', type: 'string', group: 'form'}),
    defineField({
      name: 'guideSlug',
      title: 'Lead-magnet slug',
      type: 'string',
      description: 'Passed to /api/send-guide + hubspot-capture (e.g. hiring, compensation, delegation).',
      group: 'form',
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'portalId', title: 'HubSpot portal ID', type: 'string', group: 'form'}),
    defineField({name: 'formGuid', title: 'HubSpot form GUID', type: 'string', group: 'form'}),

    // ---- Delivery email ----
    defineField({
      name: 'pdfFile',
      title: 'PDF',
      type: 'file',
      description: 'The file emailed to the lead. Fetched server-side by /api/send-guide.',
      group: 'email',
    }),
    defineField({name: 'emailSubject', title: 'Email subject', type: 'string', group: 'email'}),
    defineField({name: 'emailTitle', title: 'Email title (bold in body)', type: 'string', group: 'email'}),
    defineField({name: 'emailIntro', title: 'Email intro line', type: 'text', rows: 2, group: 'email'}),
  ],
  preview: {
    select: {title: 'title', subtitle: 'slug.current'},
  },
})
