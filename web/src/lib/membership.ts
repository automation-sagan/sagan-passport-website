import { sanityClient } from 'sanity:client';
import type { SanityImageSource } from '@sanity/image-url';

export interface MembershipItem {
  iconKey?: string;
  title?: string;
  description?: string;
}

export interface MembershipTab {
  label?: string;
  image?: SanityImageSource;
  items?: MembershipItem[];
}

export interface MembershipData {
  eyebrow?: string;
  heading?: string;
  subcopy?: string;
  tabs?: MembershipTab[];
}

const MEMBERSHIP_QUERY = `*[_type == "membership"][0]{
  eyebrow,
  heading,
  subcopy,
  tabs[]{
    label,
    image,
    items[]{ iconKey, title, description }
  }
}`;

/** Fetch the shared Membership singleton from Sanity (queried at build time). */
export async function getMembership(): Promise<MembershipData> {
  return (await sanityClient.fetch<MembershipData>(MEMBERSHIP_QUERY)) ?? {};
}
