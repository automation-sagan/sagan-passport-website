import { createImageUrlBuilder, type SanityImageSource } from '@sanity/image-url';
import { sanityClient } from 'sanity:client';

// Reuses the projectId/dataset from the @sanity/astro integration config.
const builder = createImageUrlBuilder(sanityClient);

/** Build a CDN URL builder for a Sanity image source. */
export const urlFor = (source: SanityImageSource) => builder.image(source);

/** Resolve a Sanity image source to a plain CDN URL string (empty if unset). */
export const imgUrl = (source: SanityImageSource | null | undefined): string =>
  source ? builder.image(source).url() : '';
