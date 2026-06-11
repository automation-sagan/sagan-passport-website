import { sanityClient } from 'sanity:client';
import type { SanityImageSource } from '@sanity/image-url';

export interface SanityButton {
  label: string;
  href: string;
  external?: boolean;
  variant?: 'fill' | 'outline' | 'white';
}

export interface HomepageData {
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: SanityImageSource;
  hero?: {
    headline?: string;
    body?: string;
    buttons?: SanityButton[];
  };
  talent?: { name: string; role?: string; rate?: string; image?: SanityImageSource }[];
  logosTagline?: string;
  logos?: SanityImageSource[];
  infoRows?: { heading: string; body?: string }[];
  bigCard?: {
    heading?: string;
    body?: string;
    button?: SanityButton;
    image?: SanityImageSource;
  };
  features?: { title: string; description?: string; icon?: SanityImageSource }[];
  slides?: { image?: SanityImageSource; quote: string; name: string; title?: string }[];
  testimonials?: {
    name: string;
    subtitle?: string;
    quote: string;
    avatar?: SanityImageSource;
    logo?: SanityImageSource;
  }[];
  cta?: { heading?: string; body?: string };
}

const HOMEPAGE_QUERY = `*[_type == "homepage"][0]{
  seoTitle,
  seoDescription,
  ogImage,
  hero{ headline, body, buttons[]{ label, href, external, variant } },
  talent[]{ name, role, rate, image },
  logosTagline,
  logos[],
  infoRows[]{ heading, body },
  bigCard{ heading, body, button{ label, href, external, variant }, image },
  features[]{ title, description, icon },
  slides[]{ image, quote, name, title },
  testimonials[]{ name, subtitle, quote, avatar, logo },
  cta{ heading, body }
}`;

/** Fetch the homepage singleton from Sanity (queried at build time). */
export async function getHomepage(): Promise<HomepageData> {
  return (await sanityClient.fetch<HomepageData>(HOMEPAGE_QUERY)) ?? {};
}
