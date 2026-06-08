import { sanityClient } from 'sanity:client';
import type { SanityImageSource } from '@sanity/image-url';

export interface HiwProcessStep {
  step?: string;
  title?: string;
  body?: string;
  badgeColor?: string;
  icon?: SanityImageSource;
  image?: SanityImageSource;
}

export interface HiwRatingCard {
  logo?: SanityImageSource;
  logoAlt?: string;
  rating?: string;
  buttonLabel?: string;
  buttonHref?: string;
}

export interface HiwFaqItem {
  question?: string;
  answer?: string;
}

export interface HowItWorksData {
  seoTitle?: string;
  hero?: {
    heading?: string;
    body?: string;
  };
  process?: {
    heading?: string;
    subcopy?: string;
    steps?: HiwProcessStep[];
  };
  proof?: {
    eyebrow?: string;
    heading?: string;
    avatar?: SanityImageSource;
    quote?: string;
    name?: string;
    org?: string;
    ratingCards?: HiwRatingCard[];
  };
  faq?: {
    heading?: string;
    items?: HiwFaqItem[];
  };
}

const HOW_IT_WORKS_QUERY = `*[_type == "howItWorks"][0]{
  seoTitle,
  hero{ heading, body },
  process{
    heading,
    subcopy,
    steps[]{ step, title, body, badgeColor, icon, image }
  },
  proof{
    eyebrow,
    heading,
    avatar,
    quote,
    name,
    org,
    ratingCards[]{ logo, logoAlt, rating, buttonLabel, buttonHref }
  },
  faq{
    heading,
    items[]{ question, answer }
  }
}`;

/** Fetch the How It Works singleton from Sanity (queried at build time). */
export async function getHowItWorks(): Promise<HowItWorksData> {
  return (await sanityClient.fetch<HowItWorksData>(HOW_IT_WORKS_QUERY)) ?? {};
}
