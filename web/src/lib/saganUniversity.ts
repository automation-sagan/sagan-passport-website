import { sanityClient } from 'sanity:client';
import type { SanityImageSource } from '@sanity/image-url';

export interface SuButton {
  label?: string;
  href?: string;
  external?: boolean;
  variant?: 'fill' | 'outline' | 'white';
}

export interface SuCourse {
  title?: string;
  image?: SanityImageSource;
}

export interface SuFeature {
  title?: string;
  description?: string;
  icon?: SanityImageSource;
}

export interface SuProgram {
  title?: string;
  tag?: string;
  body?: string;
  icon?: SanityImageSource;
}

export interface SuSlide {
  image?: SanityImageSource;
  quote?: string;
  name?: string;
  title?: string;
}

export interface SaganUniversityData {
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: SanityImageSource;
  hero?: {
    heading?: string;
    subheading?: string;
    body?: string;
    buttons?: SuButton[];
  };
  coursesLabel?: string;
  courses?: SuCourse[];
  why?: {
    heading?: string;
    body?: string;
    features?: SuFeature[];
  };
  programs?: SuProgram[];
  approach?: {
    eyebrow?: string;
    heading?: string;
    checks?: string[];
    checkIcon?: SanityImageSource;
    cardImage?: SanityImageSource;
    cardHeading?: string;
    cardBody?: string;
  };
  testimonials?: SuSlide[];
  caseStudy?: {
    heading?: string;
    body?: string;
    youtubeId?: string;
    poster?: SanityImageSource;
  };
}

const SAGAN_UNIVERSITY_QUERY = `*[_type == "saganUniversity"][0]{
  seoTitle,
  seoDescription,
  ogImage,
  hero{ heading, subheading, body, buttons[]{ label, href, external, variant } },
  coursesLabel,
  courses[]{ title, image },
  why{ heading, body, features[]{ title, description, icon } },
  programs[]{ title, tag, body, icon },
  approach{ eyebrow, heading, checks, checkIcon, cardImage, cardHeading, cardBody },
  testimonials[]{ image, quote, name, title },
  caseStudy{ heading, body, youtubeId, poster }
}`;

/** Fetch the Sagan University singleton from Sanity (queried at build time). */
export async function getSaganUniversity(): Promise<SaganUniversityData> {
  return (await sanityClient.fetch<SaganUniversityData>(SAGAN_UNIVERSITY_QUERY)) ?? {};
}
