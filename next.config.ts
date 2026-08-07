import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['flatly-sensually-staid-redstart.kitten.space'],
  async redirects() {
    // These niche tracks were replaced by the longer written versions.
    return [
      { source: '/courses/seo-for-vas', destination: '/courses/seo-specialist', permanent: true },
      { source: '/courses/social-media-management', destination: '/courses/social-media-manager', permanent: true },
      { source: '/courses/ecommerce-operations', destination: '/courses/ecommerce-va', permanent: true },
      { source: '/courses/operations-lead', destination: '/courses/becoming-an-ops-lead', permanent: true },
    ];
  },
};

export default nextConfig;
