// @ts-check
import { defineConfig } from 'astro/config';

import sanity from '@sanity/astro';

// https://astro.build/config
export default defineConfig({
  // Serve clean URLs with NO trailing slash (/how-it-works, not /how-it-works/).
  // build.format: 'file' emits each page as a flat <page>.html file (instead of
  // <page>/index.html). Netlify's "Pretty URLs" then serves how-it-works.html at
  // /how-it-works and strips the .html — no folder, so no trailing-slash redirect.
  // trailingSlash: 'never' keeps Astro's own generated links slash-less to match.
  build: { format: 'file' },
  trailingSlash: 'never',

  // Prefetch internal links so navigation feels instant. The site stays a
  // multi-page app (each click is still a real navigation), but Astro fetches
  // the target page in the background on hover, so the click resolves with no
  // perceptible reload. `prefetchAll` opts every <a> in automatically.
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },
  integrations: [sanity({
  projectId: '3ofs1zkm',
  dataset: 'production',
  apiVersion: '2026-03-01',
  useCdn: false,
})]
});