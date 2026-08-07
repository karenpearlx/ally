// Registry of the deep course tracks — bodies load per slug so one course page
// does not pull every multi-hundred-KB module into the first JS chunk.
import type { DeepCourse } from '../deep-course-types';

export const DEEP_COURSE_FLAGS: Record<string, { premium: boolean; previewCount: number }> = {
  'applications-that-get-replies': { premium: true, previewCount: 3 },
  'becoming-an-ops-lead': { premium: true, previewCount: 3 },
  'complete-va-starter': { premium: false, previewCount: 3 },
  'ecommerce-va': { premium: false, previewCount: 3 },
  'executive-assistant': { premium: false, previewCount: 3 },
  'pricing-and-negotiation': { premium: true, previewCount: 3 },
  'real-estate-va': { premium: false, previewCount: 3 },
  'seo-specialist': { premium: false, previewCount: 3 },
  'social-media-manager': { premium: false, previewCount: 3 },
};

const LOADERS: Record<string, () => Promise<{ default: DeepCourse }>> = {
  'applications-that-get-replies': () => import('./applications-that-get-replies'),
  'becoming-an-ops-lead': () => import('./becoming-an-ops-lead'),
  'complete-va-starter': () => import('./complete-va-starter'),
  'ecommerce-va': () => import('./ecommerce-va'),
  'executive-assistant': () => import('./executive-assistant'),
  'pricing-and-negotiation': () => import('./pricing-and-negotiation'),
  'real-estate-va': () => import('./real-estate-va'),
  'seo-specialist': () => import('./seo-specialist'),
  'social-media-manager': () => import('./social-media-manager'),
};

export const DEEP_COURSE_SLUGS = Object.keys(LOADERS);

export function deepCourseFlags(slug: string) {
  return DEEP_COURSE_FLAGS[slug];
}

export function premiumDeepCourseCount() {
  return Object.values(DEEP_COURSE_FLAGS).filter((f) => f.premium).length;
}

export async function getDeepCourse(slug: string): Promise<DeepCourse | undefined> {
  const load = LOADERS[slug];
  if (!load) return undefined;
  const mod = await load();
  return mod.default;
}
