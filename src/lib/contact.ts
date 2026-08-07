/**
 * The address on the legal pages.
 *
 * TODO(karen): this is still a placeholder — hello@ally.ph does not exist, so a
 * privacy or data-deletion request sent there goes nowhere. Set
 * NEXT_PUBLIC_CONTACT_EMAIL in .env.local to a mailbox you actually read (your
 * own address, or hello@ whatever domain you buy) before Verse is public.
 */
export const PLACEHOLDER_CONTACT = 'hello@ally.ph';

export const CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || PLACEHOLDER_CONTACT;

/** True while nobody can actually be reached at the published address. */
export const CONTACT_IS_PLACEHOLDER = CONTACT_EMAIL === PLACEHOLDER_CONTACT;
