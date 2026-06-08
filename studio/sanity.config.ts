import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'

export default defineConfig({
  name: 'default',
  title: 'Sagan Passport',

  projectId: '3ofs1zkm',
  dataset: 'production',

  plugins: [
    structureTool({
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
              .title('Navigation')
              .id('navigation')
              .child(S.document().schemaType('navigation').documentId('navigation')),
            ...S.documentTypeListItems().filter(
              (li) => !['homepage', 'navigation'].includes(li.getId()!),
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
        ? prev.filter((t) => !['homepage', 'navigation'].includes(t.templateId))
        : prev,
    actions: (input, context) =>
      ['homepage', 'navigation'].includes(context.schemaType)
        ? input.filter(({action}) =>
            ['publish', 'discardChanges', 'restore'].includes(action!),
          )
        : input,
  },
})
