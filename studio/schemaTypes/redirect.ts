import {defineField, defineType} from 'sanity'

/**
 * A URL redirect, editable by the SEO team (multi-entry — like Framer's
 * redirects panel). The web build fetches all published redirect docs in
 * astro.config.mjs and compiles them into Netlify's redirect engine, so a
 * redirect goes live on the first deploy after publishing (the Sanity→Netlify
 * webhook triggers that automatically).
 */
export const redirect = defineType({
  name: 'redirect',
  title: 'Redirect',
  type: 'document',
  fields: [
    defineField({
      name: 'from',
      title: 'From path',
      type: 'string',
      description: 'The old path on this site, starting with / (e.g. /blog/old-post-slug).',
      validation: (rule) =>
        rule
          .required()
          .custom((value) => {
            if (!value) return true
            if (!value.startsWith('/')) return 'Must start with / (a path on this site)'
            if (/\s/.test(value)) return 'Must not contain spaces'
            if (value !== '/' && value.endsWith('/')) return 'No trailing slash (this site uses none)'
            return true
          }),
    }),
    defineField({
      name: 'to',
      title: 'To',
      type: 'string',
      description:
        'Where it should go: a path on this site (/blog/new-post-slug) or a full URL (https://…).',
      validation: (rule) =>
        rule
          .required()
          .custom((value, context) => {
            if (!value) return true
            if (!value.startsWith('/') && !/^https?:\/\//.test(value))
              return 'Must start with / or be a full http(s) URL'
            if (/\s/.test(value)) return 'Must not contain spaces'
            const from = (context.document as {from?: string} | undefined)?.from
            if (from && value === from) return 'Cannot redirect a path to itself'
            return true
          }),
    }),
    defineField({
      name: 'permanent',
      title: 'Permanent (301)',
      type: 'boolean',
      initialValue: true,
      description:
        'On: 301 permanent (search engines transfer ranking — right for moved/renamed pages). Off: 302 temporary.',
    }),
  ],
  preview: {
    select: {from: 'from', to: 'to', permanent: 'permanent'},
    prepare({from, to, permanent}) {
      return {title: `${from ?? '?'} → ${to ?? '?'}`, subtitle: permanent === false ? '302 temporary' : '301 permanent'}
    },
  },
})
