import type { Metadata } from "next";

export const SITE_URL = "https://vrsfd.com";
export const SITE_NAME = "Verse";
export const DEFAULT_TITLE = "Verse — Every VA opportunity. One place.";
export const DEFAULT_DESCRIPTION =
  "Learn the work, price it properly, and find real remote jobs. Built for Filipino virtual assistants.";
export const OG_IMAGE = "/og-image.png";

type PageSeo = {
  title: string;
  description: string;
  path: string;
  index?: boolean;
  image?: string;
};

/** Consistent title, description, canonical, and social cards for a route. */
export function pageMetadata({
  title,
  description,
  path,
  index = true,
  image = OG_IMAGE,
}: PageSeo): Metadata {
  const url = path === "/" ? SITE_URL : `${SITE_URL}${path}`;
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} · ${SITE_NAME}`;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: SITE_NAME,
      type: "website",
      images: [{ url: image, width: 1200, height: 630, alt: SITE_NAME }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [image],
    },
    robots: index
      ? { index: true, follow: true }
      : { index: false, follow: false },
  };
}
