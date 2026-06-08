import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: '3ofs1zkm',
    dataset: 'production'
  },
  studioHost: 'saganpassport',
  deployment: {
    appId: 'ebs4dkyxfsvvb8m2u8li2rhe',
    /**
     * Enable auto-updates for studios.
     * Learn more at https://www.sanity.io/docs/studio/latest-version-of-sanity#k47faf43faf56
     */
    autoUpdates: true,
  }
})
