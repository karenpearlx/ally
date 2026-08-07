/**
 * The VA profile — who you are, what you do, what you charge.
 *
 * Same discipline as cover-letter-rules.ts: every value here is typed by the
 * user and rendered back into the page (and, later, into letters and resumes),
 * so parsing never throws, never trusts a shape, and normalises on both write
 * and read. A corrupt row degrades to an empty profile rather than a crash.
 *
 * Bounds live in three places on purpose — here, the API route, and a database
 * check constraint — because only the last one survives a hand-rolled request.
 */

import { cleanBlock, cleanLine, cleanUrl, type RuleLink } from '@/lib/cover-letter-rules';
import { NICHES, isNicheId, type Niche } from '@/lib/cover-letter-templates';

/* ------------------------------------------------------------------ */
/* shape                                                               */
/* ------------------------------------------------------------------ */

export const EXPERIENCE_LEVELS = [
  { id: 'beginner', label: 'Beginner', note: 'Learning the work, no paid client yet or under a year.' },
  { id: 'intermediate', label: 'Intermediate', note: 'One to three years. You can run your own tasks.' },
  { id: 'experienced', label: 'Experienced', note: 'Three to six years. Clients hand you whole areas.' },
  { id: 'expert', label: 'Expert', note: 'Six years plus, or you lead other VAs.' },
] as const;

export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number]['id'];

export const AVAILABILITY = [
  { id: 'available', label: 'Available', note: 'Taking new clients now.', tone: 'good' },
  { id: 'busy', label: 'Busy', note: 'Full, but open to the right offer.', tone: 'warn' },
  { id: 'not-looking', label: 'Not looking', note: 'Not accepting work right now.', tone: 'off' },
] as const;

export type Availability = (typeof AVAILABILITY)[number]['id'];

export type Profile = {
  fullName: string;
  /** One line under the name, e.g. "SEO VA for home-service brands". */
  headline: string;
  /** Contact email for clients. Separate from the login email on purpose. */
  contactEmail: string;
  bio: string;
  niches: Niche[];
  experience: ExperienceLevel;
  /** USD. null means "not saying yet", which is different from zero. */
  hourlyRate: number | null;
  monthlyRate: number | null;
  links: RuleLink[];
  location: string;
  timezone: string;
  languages: string[];
  availability: Availability;
  avatarUrl: string | null;
};

export const EMPTY_PROFILE: Profile = {
  fullName: '',
  headline: '',
  contactEmail: '',
  bio: '',
  niches: [],
  experience: 'intermediate',
  hourlyRate: null,
  monthlyRate: null,
  links: [],
  location: '',
  timezone: '',
  languages: [],
  availability: 'available',
  avatarUrl: null,
};

export const PROFILE_LIMITS = {
  maxName: 80,
  maxHeadline: 120,
  maxEmail: 160,
  maxBio: 700,
  maxNiches: 6,
  maxRateHourly: 500,
  maxRateMonthly: 100_000,
  maxLinks: 6,
  maxLabel: 40,
  maxLocation: 80,
  maxTimezone: 64,
  maxLanguages: 8,
  maxLanguage: 32,
  maxAvatarUrl: 2048,
  /** 2 MB. Anything larger is a phone photo nobody resized. */
  maxAvatarBytes: 2 * 1024 * 1024,
} as const;

/** Suggestions only. Free text wins — this is just to save typing. */
export const LANGUAGE_IDEAS = [
  'English',
  'Filipino',
  'Cebuano',
  'Hiligaynon',
  'Ilocano',
  'Waray',
  'Bicolano',
  'Spanish',
  'Japanese',
  'Korean',
  'Mandarin',
];

export const AVATAR_BUCKET = 'avatars';

/* ------------------------------------------------------------------ */
/* type guards                                                         */
/* ------------------------------------------------------------------ */

export function isExperienceLevel(value: unknown): value is ExperienceLevel {
  return typeof value === 'string' && EXPERIENCE_LEVELS.some((l) => l.id === value);
}

export function isAvailability(value: unknown): value is Availability {
  return typeof value === 'string' && AVAILABILITY.some((a) => a.id === value);
}

export function experienceMeta(id: ExperienceLevel) {
  return EXPERIENCE_LEVELS.find((l) => l.id === id) ?? EXPERIENCE_LEVELS[1];
}

export function availabilityMeta(id: Availability) {
  return AVAILABILITY.find((a) => a.id === id) ?? AVAILABILITY[0];
}

export function nicheLabel(id: Niche) {
  return NICHES.find((n) => n.id === id)?.label ?? id;
}

/* ------------------------------------------------------------------ */
/* parsing                                                             */
/* ------------------------------------------------------------------ */

function parseNiches(value: unknown): Niche[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<Niche>();
  for (const entry of value) {
    if (isNicheId(entry) && !seen.has(entry)) seen.add(entry);
    if (seen.size >= PROFILE_LIMITS.maxNiches) break;
  }
  // Keep the picker's own order, so the chips never shuffle between saves.
  return NICHES.filter((n) => seen.has(n.id)).map((n) => n.id);
}

function parseLanguages(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const out: string[] = [];
  for (const entry of value) {
    if (typeof entry !== 'string') continue;
    const clean = cleanLine(entry, PROFILE_LIMITS.maxLanguage);
    if (!clean) continue;
    if (out.some((l) => l.toLowerCase() === clean.toLowerCase())) continue;
    out.push(clean);
    if (out.length >= PROFILE_LIMITS.maxLanguages) break;
  }
  return out;
}

function parseLinks(value: unknown): RuleLink[] {
  if (!Array.isArray(value)) return [];
  const out: RuleLink[] = [];
  for (const entry of value) {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) continue;
    const raw = entry as Record<string, unknown>;
    const url = cleanUrl(typeof raw.url === 'string' ? raw.url : '');
    if (!url) continue;
    out.push({
      label: cleanLine(typeof raw.label === 'string' ? raw.label : '', PROFILE_LIMITS.maxLabel) || 'Link',
      url,
    });
    if (out.length >= PROFILE_LIMITS.maxLinks) break;
  }
  return out;
}

/** A rate is a positive number under the cap, or nothing at all. */
export function parseRate(value: unknown, max: number): number | null {
  if (value == null || value === '') return null;
  const n = typeof value === 'number' ? value : Number(String(value).replace(/[,\s]/g, ''));
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.min(max, Math.round(n * 100) / 100);
}

/** An email we are willing to print on a profile. Not RFC-complete on purpose. */
export function cleanEmail(value: unknown): string {
  const raw = cleanLine(typeof value === 'string' ? value : '', PROFILE_LIMITS.maxEmail).toLowerCase();
  if (!raw) return '';
  return /^[^\s@]+@[^\s@.]+\.[^\s@]+$/.test(raw) ? raw : '';
}

/** Only our own storage or a plain https image is allowed to render. */
export function cleanAvatarUrl(value: unknown): string | null {
  if (typeof value !== 'string' || value.length > PROFILE_LIMITS.maxAvatarUrl) return null;
  const url = cleanUrl(value);
  return url && url.startsWith('https://') ? url : null;
}

/** Row shape as it comes back from Supabase / the profile API. */
export type ProfileRow = {
  full_name?: unknown;
  headline?: unknown;
  contact_email?: unknown;
  bio?: unknown;
  niches?: unknown;
  experience_level?: unknown;
  hourly_rate?: unknown;
  monthly_rate?: unknown;
  portfolio_links?: unknown;
  location?: unknown;
  timezone?: unknown;
  languages?: unknown;
  availability?: unknown;
  avatar_url?: unknown;
};

export function fromRow(row: ProfileRow | null | undefined): Profile {
  return {
    fullName: cleanLine(row?.full_name, PROFILE_LIMITS.maxName),
    headline: cleanLine(row?.headline, PROFILE_LIMITS.maxHeadline),
    contactEmail: cleanEmail(row?.contact_email),
    bio: cleanBlock(row?.bio, PROFILE_LIMITS.maxBio),
    niches: parseNiches(row?.niches),
    experience: isExperienceLevel(row?.experience_level) ? row.experience_level : EMPTY_PROFILE.experience,
    hourlyRate: parseRate(row?.hourly_rate, PROFILE_LIMITS.maxRateHourly),
    monthlyRate: parseRate(row?.monthly_rate, PROFILE_LIMITS.maxRateMonthly),
    links: parseLinks(row?.portfolio_links),
    location: cleanLine(row?.location, PROFILE_LIMITS.maxLocation),
    timezone: cleanLine(row?.timezone, PROFILE_LIMITS.maxTimezone),
    languages: parseLanguages(row?.languages),
    availability: isAvailability(row?.availability) ? row.availability : EMPTY_PROFILE.availability,
    avatarUrl: cleanAvatarUrl(row?.avatar_url),
  };
}

export function toRow(profile: Profile) {
  return {
    full_name: profile.fullName,
    headline: profile.headline,
    contact_email: profile.contactEmail,
    bio: profile.bio,
    niches: profile.niches,
    experience_level: profile.experience,
    hourly_rate: profile.hourlyRate,
    monthly_rate: profile.monthlyRate,
    portfolio_links: profile.links,
    location: profile.location,
    timezone: profile.timezone,
    languages: profile.languages,
    availability: profile.availability,
    avatar_url: profile.avatarUrl,
  };
}

export const PROFILE_COLUMNS =
  'full_name,headline,contact_email,bio,niches,experience_level,hourly_rate,monthly_rate,portfolio_links,location,timezone,languages,availability,avatar_url';

export function sameProfile(a: Profile, b: Profile) {
  return JSON.stringify(toRow(a)) === JSON.stringify(toRow(b));
}

/**
 * How much of the profile is filled in, 0-100.
 *
 * Deliberately blunt: eight things a client actually looks for, each worth the
 * same. It exists to nudge, not to score anybody.
 */
export function completeness(p: Profile): number {
  const checks = [
    Boolean(p.fullName),
    Boolean(p.headline),
    Boolean(p.bio && p.bio.length >= 80),
    p.niches.length > 0,
    p.hourlyRate != null || p.monthlyRate != null,
    p.links.length > 0,
    Boolean(p.location),
    p.languages.length > 0,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

/** Longhand for the summary card: "$12/hr · $1,800/mo". */
export function rateLine(p: Profile): string {
  const bits: string[] = [];
  if (p.hourlyRate != null) bits.push(`$${p.hourlyRate.toLocaleString('en-US')}/hr`);
  if (p.monthlyRate != null) bits.push(`$${p.monthlyRate.toLocaleString('en-US')}/mo`);
  return bits.join(' · ');
}
