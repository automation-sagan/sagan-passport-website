// @ts-check
import { defineConfig } from 'astro/config';

import sanity from '@sanity/astro';
import netlify from '@astrojs/netlify';

/* Redirects are content: the SEO team manages `redirect` documents in the
 * Studio (from/to/permanent). Fetched here at config-load time and handed to
 * Astro's native `redirects`, which the Netlify adapter compiles into the
 * platform redirect engine. Publishing a redirect triggers the Sanity→Netlify
 * build webhook, so it goes live on that build with no developer involved. */
async function fetchSanityRedirects() {
  const query = encodeURIComponent(
    '*[_type == "redirect" && defined(from) && defined(to)]{from, to, permanent}',
  );
  const url = `https://3ofs1zkm.api.sanity.io/v2026-03-01/data/query/production?query=${query}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const { result } = await res.json();
    /** @type {Record<string, {status: 301 | 302, destination: string}>} */
    const redirects = {};
    for (const r of result ?? []) {
      if (!r.from?.startsWith('/') || r.from === r.to) continue;
      redirects[r.from] = {
        status: r.permanent === false ? 302 : 301,
        destination: r.to,
      };
    }
    if (Object.keys(redirects).length) {
      console.log(`[redirects] ${Object.keys(redirects).length} redirect(s) loaded from Sanity`);
    }
    return redirects;
  } catch (err) {
    console.warn(`[redirects] could not fetch from Sanity (${err.message}) — building without CMS redirects`);
    return {};
  }
}

const sanityRedirects = await fetchSanityRedirects();

// https://astro.build/config
export default defineConfig({
  // Static by default. The Netlify adapter is here only so the handful of
  // on-demand routes (the /api/* serverless endpoints + live demos) that set
  // `export const prerender = false` can run as Netlify Functions. Adding the
  // adapter does NOT make pages dynamic — every page stays prerendered at build
  // time unless it explicitly opts out.
  adapter: netlify(),

  // CMS-managed redirects (see fetchSanityRedirects above).
  redirects: sanityRedirects,

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
