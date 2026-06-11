import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import {PreviewPane} from './components/PreviewPane'

export default defineConfig({
  name: 'default',
  title: 'Sagan Passport',

  projectId: '3ofs1zkm',
  dataset: 'production',

  plugins: [
    structureTool({
      // Blog posts get a second "Preview" tab rendering the draft on the site
      // (see components/PreviewPane.tsx).
      defaultDocumentNode: (S, {schemaType}) =>
        schemaType === 'blog'
          ? S.document().views([
              S.view.form(),
              S.view.component(PreviewPane).title('Preview'),
            ])
          : undefined,
      // "Homepage" and "Navigation" are singletons — surface each as one fixed
      // document, not a create-your-own list.
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            S.listItem()
              .title('Homepage')
              .id('homepage')
              .child(S.document().schemaType('homepage').documentId('homepage')),
            S.listItem()
              .title('Pricing')
              .id('pricing')
              .child(S.document().schemaType('pricing').documentId('pricing')),
            S.listItem()
              .title('How It Works')
              .id('howItWorks')
              .child(S.document().schemaType('howItWorks').documentId('howItWorks')),
            S.listItem()
              .title('Membership')
              .id('membership')
              .child(S.document().schemaType('membership').documentId('membership')),
            S.listItem()
              .title('Sagan University')
              .id('saganUniversity')
              .child(S.document().schemaType('saganUniversity').documentId('saganUniversity')),
            S.listItem()
              .title('404 Page')
              .id('notFound')
              .child(S.document().schemaType('notFound').documentId('notFound')),
            S.listItem()
              .title('Customers')
              .id('customer')
              .child(S.documentTypeList('customer').title('Customers')),
            S.listItem()
              .title('Resources')
              .id('resource')
              .child(S.documentTypeList('resource').title('Resources')),
            S.listItem()
              .title('Resources page (SEO)')
              .id('resourcesIndex')
              .child(S.document().schemaType('resourcesIndex').documentId('resourcesIndex')),
            S.listItem()
              .title('Blog')
              .id('blog')
              .child(S.documentTypeList('blog').title('Blog')),
            S.listItem()
              .title('Blog page (SEO)')
              .id('blogIndex')
              .child(S.document().schemaType('blogIndex').documentId('blogIndex')),
            S.listItem()
              .title('Guides')
              .id('guide')
              .child(S.documentTypeList('guide').title('Guides')),
            S.listItem()
              .title('Comparisons (vs)')
              .id('comparison')
              .child(S.documentTypeList('comparison').title('Comparisons (vs)')),
            S.listItem()
              .title('AI Agent demos')
              .id('agentDemo')
              .child(S.documentTypeList('agentDemo').title('AI Agent demos')),
            S.listItem()
              .title('Landing pages')
              .id('landingPage')
              .child(S.documentTypeList('landingPage').title('Landing pages')),
            S.listItem()
              .title('Navigation')
              .id('navigation')
              .child(S.document().schemaType('navigation').documentId('navigation')),
            S.listItem()
              .title('Footer')
              .id('footer')
              .child(S.document().schemaType('footer').documentId('footer')),
            S.listItem()
              .title('Redirects')
              .id('redirect')
              .child(S.documentTypeList('redirect').title('Redirects')),
            S.listItem()
              .title('Site settings')
              .id('siteSettings')
              .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
            ...S.documentTypeListItems().filter(
              (li) =>
                ![
                  'siteSettings',
                  'resourcesIndex',
                  'blogIndex',
                  'homepage',
                  'pricing',
                  'howItWorks',
                  'membership',
                  'saganUniversity',
                  'notFound',
                  'customer',
                  'resource',
                  'blog',
                  'guide',
                  'comparison',
                  'agentDemo',
                  'landingPage',
                  'navigation',
                  'footer',
                  'redirect',
                ].includes(li.getId()!),
            ),
          ]),
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },

  document: {
    // Singleton guards: no "create new" in the global menu, and no
    // create/delete/duplicate actions on the singleton documents themselves.
    newDocumentOptions: (prev, {creationContext}) =>
      creationContext.type === 'global'
        ? prev.filter(
            (t) =>
              ![
                'siteSettings',
                'resourcesIndex',
                'blogIndex',
                'homepage',
                'pricing',
                'howItWorks',
                'membership',
                'saganUniversity',
                'notFound',
                'navigation',
                'footer',
              ].includes(t.templateId),
          )
        : prev,
    actions: (input, context) =>
      [
        'siteSettings',
        'resourcesIndex',
        'blogIndex',
        'homepage',
        'pricing',
        'howItWorks',
        'membership',
        'saganUniversity',
        'notFound',
        'navigation',
        'footer',
      ].includes(context.schemaType)
        ? input.filter(({action}) =>
            ['publish', 'discardChanges', 'restore'].includes(action!),
          )
        : input,
  },
})
