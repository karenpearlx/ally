// Generated. Registry of the deep course tracks.
import type { DeepCourse } from '../deep-course-types';
import ApplicationsThatGetReplies from './applications-that-get-replies';
import BecomingAnOpsLead from './becoming-an-ops-lead';
import CompleteVaStarter from './complete-va-starter';
import EcommerceVa from './ecommerce-va';
import ExecutiveAssistant from './executive-assistant';
import PricingAndNegotiation from './pricing-and-negotiation';
import RealEstateVa from './real-estate-va';
import SeoSpecialist from './seo-specialist';
import SocialMediaManager from './social-media-manager';

export const DEEP_COURSES: DeepCourse[] = [
  ApplicationsThatGetReplies,
  BecomingAnOpsLead,
  CompleteVaStarter,
  EcommerceVa,
  ExecutiveAssistant,
  PricingAndNegotiation,
  RealEstateVa,
  SeoSpecialist,
  SocialMediaManager,
];

export const DEEP_COURSE_MAP: Record<string, DeepCourse> = Object.fromEntries(
  DEEP_COURSES.map((c) => [c.slug, c]),
);

export function getDeepCourse(slug: string): DeepCourse | undefined {
  return DEEP_COURSE_MAP[slug];
}
