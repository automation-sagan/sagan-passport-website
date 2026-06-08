import { sanityClient } from 'sanity:client';

export interface NotFoundData {
  seoTitle?: string;
  heading?: string;
  body?: string;
  button?: {
    label?: string;
    href?: string;
    external?: boolean;
    variant?: 'fill' | 'outline' | 'white';
  };
}

const NOT_FOUND_QUERY = `*[_type == "notFound"][0]{
  seoTitle,
  heading,
  body,
  button{ label, href, external, variant }
}`;

/** Fetch the 404 singleton from Sanity (queried at build time). */
export async function getNotFound(): Promise<NotFoundData> {
  return (await sanityClient.fetch<NotFoundData>(NOT_FOUND_QUERY)) ?? {};
}
