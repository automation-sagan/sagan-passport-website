// @ts-check
import { defineConfig } from 'astro/config';

import sanity from '@sanity/astro';

// https://astro.build/config
export default defineConfig({
  // Emit internal links without a trailing slash (/how-it-works, not
  // /how-it-works/). Note: build.format stays 'directory', so pages are still
  // written as <page>/index.html — Netlify's default "Pretty URLs" can still
  // 301 a direct hit on /how-it-works to /how-it-works/. To drop the trailing
  // slash at the served-URL level too, switch build.format to 'file'.
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