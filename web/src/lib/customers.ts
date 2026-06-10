import { sanityClient } from 'sanity:client';
import type { SanityImageSource } from '@sanity/image-url';

export interface CustomerServiceCard {
  title?: string;
  body?: string;
}

export interface CustomerTalentPerson {
  role?: string;
  from?: string;
  rate?: string;
  photo?: SanityImageSource;
}

export interface CustomerRoleEntry {
  title?: string;
  country?: string;
  rate?: string;
}

export interface CustomerSlide {
  image?: SanityImageSource;
  quote?: string;
  name?: string;
  title?: string;
}

export interface CustomerData {
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: SanityImageSource;
  eyebrow?: string;
  hero?: {
    title?: string;
    body?: string;
    image?: SanityImageSource;
  };
  logosHeading?: string;
  logos?: SanityImageSource[];
  serviceCards?: CustomerServiceCard[];
  talent?: {
    heading?: string;
    subheading?: string;
    people?: CustomerTalentPerson[];
    ticker1?: string[];
    ticker2?: string[];
  };
  caseStudy?: {
    title?: string;
    body?: string;
    image?: SanityImageSource;
    youtubeId?: string;
  };
  roles?: {
    heading?: string;
    body?: string;
    entries?: CustomerRoleEntry[];
  };
  testimonials?: CustomerSlide[];
}

const CUSTOMER_FIELDS = `
  seoTitle,
  seoDescription,
  ogImage,
  eyebrow,
  hero{ title, body, image },
  logosHeading,
  logos,
  serviceCards[]{ title, body },
  talent{ heading, subheading, people[]{ role, from, rate, photo }, ticker1, ticker2 },
  caseStudy{ title, body, image, youtubeId },
  roles{ heading, body, entries[]{ title, country, rate } },
  testimonials[]{ image, quote, name, title }
`;

/** All customer-vertical slugs (for getStaticPaths). */
export async function getAllCustomerSlugs(): Promise<string[]> {
  const rows = await sanityClient.fetch<{ slug: string }[]>(
    `*[_type == "customer" && defined(slug.current)]{ "slug": slug.current }`,
  );
  return (rows ?? []).map((r) => r.slug);
}

/** Fetch one customer vertical by its slug (queried at build time). */
export async function getCustomerBySlug(slug: string): Promise<CustomerData | null> {
  return (
    (await sanityClient.fetch<CustomerData | null>(
      `*[_type == "customer" && slug.current == $slug][0]{${CUSTOMER_FIELDS}}`,
      { slug },
    )) ?? null
  );
}
