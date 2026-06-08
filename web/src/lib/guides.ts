import { sanityClient } from 'sanity:client';
import type { SanityImageSource } from '@sanity/image-url';

export interface GuideStat {
  num?: string;
  label?: string;
}

export interface GuideAccent {
  cta?: string;
  ctaHover?: string;
  ctaActive?: string;
  focus?: string;
  bright?: string;
}

export interface GuideData {
  slug: string;
  seoTitle?: string;
  seoDescription?: string;
  canonical?: string;
  accent?: GuideAccent;
  intro?: string;
  headline?: string;
  valueProp?: string;
  bullets?: string[];
  bulletStyle?: 'squares' | 'disc';
  coverVariant?: 'designed' | 'image' | 'layered';
  coverImage?: SanityImageSource;
  coverImageAlt?: string;
  designed?: {
    tag?: string;
    titleLead?: string;
    titleAccent?: string;
    subtitle?: string;
    stats?: GuideStat[];
    brand?: string;
    badge?: string;
  };
  layered?: {
    photo?: SanityImageSource;
    logo?: string;
    title?: string;
    subtitle?: string;
    learn?: string[];
    badge?: string;
    brand?: string;
  };
  formLabel?: string;
  formLabelNote?: string;
  buttonText?: string;
  successMessage?: string;
  guideSlug?: string;
  portalId?: string;
  formGuid?: string;
}

const GUIDE_FIELDS = `
  "slug": slug.current,
  seoTitle,
  seoDescription,
  canonical,
  accent,
  intro,
  headline,
  valueProp,
  bullets,
  bulletStyle,
  coverVariant,
  coverImage,
  coverImageAlt,
  designed{ tag, titleLead, titleAccent, subtitle, stats[]{ num, label }, brand, badge },
  layered{ photo, logo, title, subtitle, learn, badge, brand },
  formLabel,
  formLabelNote,
  buttonText,
  successMessage,
  guideSlug,
  portalId,
  formGuid
`;

/** All guide slugs (for getStaticPaths). */
export async function getAllGuideSlugs(): Promise<string[]> {
  const rows = await sanityClient.fetch<{ slug: string }[]>(
    `*[_type == "guide" && defined(slug.current)]{ "slug": slug.current }`,
  );
  return (rows ?? []).map((r) => r.slug);
}

/** Fetch one guide by slug (queried at build time). */
export async function getGuideBySlug(slug: string): Promise<GuideData | null> {
  return (
    (await sanityClient.fetch<GuideData | null>(
      `*[_type == "guide" && slug.current == $slug][0]{${GUIDE_FIELDS}}`,
      { slug },
    )) ?? null
  );
}

/** Server-side lookup used by /api/send-guide: resolve a guide by its
 *  lead-magnet slug (hiring/compensation/delegation) to the PDF asset URL +
 *  email copy. Runs in the function at request time, so the PDF URL is never
 *  exposed to the browser. */
export interface GuideEmailRecord {
  pdfUrl?: string;
  pdfFilename?: string;
  emailSubject?: string;
  emailTitle?: string;
  emailIntro?: string;
}

export async function getGuideEmailRecord(guideSlug: string): Promise<GuideEmailRecord | null> {
  return (
    (await sanityClient.fetch<GuideEmailRecord | null>(
      `*[_type == "guide" && guideSlug == $guideSlug][0]{
        "pdfUrl": pdfFile.asset->url,
        "pdfFilename": pdfFile.asset->originalFilename,
        emailSubject,
        emailTitle,
        emailIntro
      }`,
      { guideSlug },
    )) ?? null
  );
}
