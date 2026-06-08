import {defineArrayMember, defineField, defineType} from 'sanity'

/** A competitor-comparison ("X vs Sagan") landing page. Multi-entry, one
 * document per competitor, rendered by web's /vs/[slug].
 *
 * These pages are bespoke per competitor (each has its own layout + persuasive
 * copy living in its Astro component). This document holds the *key editable
 * fields*: identity, hero, the calculator numbers, the comparison table, and
 * testimonials. The long-form prose stays in the page component. */
export const comparison = defineType({
  name: 'comparison',
  title: 'Comparison (vs)',
  type: 'document',
  groups: [
    {name: 'meta', title: 'Meta'},
    {name: 'hero', title: 'Hero'},
    {name: 'calc', title: 'Calculator'},
    {name: 'table', title: 'Comparison table'},
    {name: 'testimonials', title: 'Testimonials'},
  ],
  fields: [
    // ---- Meta ----
    defineField({
      name: 'title',
      title: 'Internal title',
      type: 'string',
      description: 'e.g. Athena vs Sagan.',
      group: 'meta',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: {source: 'title'},
      description: 'URL path under /vs/ — e.g. athena-vs-sagan. Must match a page component.',
      group: 'meta',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'competitor',
      title: 'Competitor name',
      type: 'string',
      description: 'e.g. Athena.',
      group: 'meta',
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'seoTitle', title: 'Page title (SEO)', type: 'string', group: 'meta'}),
    defineField({name: 'seoDescription', title: 'Meta description (SEO)', type: 'text', rows: 2, group: 'meta'}),
    defineField({name: 'canonical', title: 'Canonical URL', type: 'url', group: 'meta'}),
    defineField({
      name: 'calendlyUrl',
      title: 'Calendly base URL',
      type: 'url',
      description: 'The booking link the CTAs point at (utm_term is added per-button in code).',
      group: 'meta',
    }),

    // ---- Hero ----
    defineField({name: 'heroHeadlineLead', title: 'Hero headline (lead)', type: 'string', group: 'hero'}),
    defineField({name: 'heroHeadlineEm', title: 'Hero headline (emphasised)', type: 'string', group: 'hero'}),
    defineField({name: 'heroBody', title: 'Hero body', type: 'text', rows: 3, group: 'hero'}),
    defineField({name: 'heroSub', title: 'Hero sub-note', type: 'string', group: 'hero'}),

    // ---- Calculator ----
    defineField({
      name: 'calc',
      title: 'Calculator inputs',
      type: 'object',
      group: 'calc',
      fields: [
        defineField({name: 'talentMonthly', title: 'Talent pay / mo ($)', type: 'number'}),
        defineField({name: 'middlemanMonthly', title: 'Competitor middleman fee / mo ($)', type: 'number'}),
        defineField({name: 'membershipMonthly', title: 'Sagan membership / mo ($)', type: 'number'}),
        defineField({
          name: 'finderFeePct',
          title: "Sagan finder's fee (% of annual salary)",
          type: 'number',
          description: 'e.g. 18 for 18%.',
        }),
      ],
    }),

    // ---- Comparison table ----
    defineField({
      name: 'comparisonRows',
      title: 'Comparison rows',
      type: 'array',
      group: 'table',
      of: [defineArrayMember({type: 'comparisonRow'})],
    }),

    // ---- Testimonials ----
    defineField({
      name: 'testimonials',
      type: 'array',
      group: 'testimonials',
      of: [defineArrayMember({type: 'comparisonTestimonial'})],
    }),
  ],
  preview: {
    select: {title: 'title', subtitle: 'slug.current'},
  },
})
