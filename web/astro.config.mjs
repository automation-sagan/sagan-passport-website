// @ts-check
import { defineConfig } from 'astro/config';

import sanity from '@sanity/astro';

// https://astro.build/config
export default defineConfig({
  integrations: [sanity({
  projectId: '3ofs1zkm',
  dataset: 'production',
  apiVersion: '2026-03-01',
  useCdn: false,
})]
});