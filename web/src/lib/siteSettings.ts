import { sanityClient } from 'sanity:client';
import type { SanityImageSource } from '@sanity/image-url';

export interface SiteSettingsData {
  siteName?: string;
  siteUrl?: string;
  ogImage?: SanityImageSource;
  logo?: SanityImageSource;
}

const SITE_SETTINGS_QUERY = `*[_type == "siteSettings"][0]{
  siteName,
  siteUrl,
  ogImage,
  logo
}`;

// Layout.astro asks for these on every page, so fetch once per build and
// share the promise instead of hitting Sanity for each page.
let cached: Promise<SiteSettingsData> | undefined;

/** Fetch the sitewide SEO settings singleton from Sanity (queried at build time). */
export function getSiteSettings(): Promise<SiteSettingsData> {
  cached ??= sanityClient
    .fetch<SiteSettingsData | null>(SITE_SETTINGS_QUERY)
    .then((data) => data ?? {});
  return cached;
}
