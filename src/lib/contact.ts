/**
 * Public support inbox for Verse (vrsfd.com).
 *
 * Override with NEXT_PUBLIC_CONTACT_EMAIL when you need a different mailbox
 * (e.g. staging). The default is the live address users should write to.
 */
export const PLACEHOLDER_CONTACT = 'hello@ally.ph';

export const CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || 'support@vrsfd.com';

/** True only if someone intentionally reverts to the old non-existent address. */
export const CONTACT_IS_PLACEHOLDER = CONTACT_EMAIL === PLACEHOLDER_CONTACT;
