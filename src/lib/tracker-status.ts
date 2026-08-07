/**
 * One palette for every place a status is drawn — the list pills, the board
 * lanes, the detail sheet. Kept out of the page component so the board and the
 * list can never drift into two different-looking vocabularies.
 *
 * `fg` on `bg` clears WCAG AA everywhere. The inline values this replaced did
 * not: Saved was 3.7:1 and Ghosted 3.1:1 on their own tints.
 *
 * Interviewing is amber rather than teal on purpose. Teal is the brand accent
 * and already means "primary action" everywhere else in Verse, so letting one
 * status borrow it made Interviewing read as a button.
 */

import type { Status } from './followups';

export type StatusStyle = {
  /** Pill / lane tint. */
  bg: string;
  /** Text on that tint. */
  fg: string;
  /** Saturated edge: the column rail and the drop ring. Decoration only — it
   *  always sits next to a real text label. */
  rule: string;
  /** What the column is actually for, shown under its heading. */
  blurb: string;
};

export const STATUS_STYLE: Record<Status, StatusStyle> = {
  Saved: { bg: '#f1efec', fg: '#6b6862', rule: '#a9a49c', blurb: 'Not sent yet' },
  Applied: { bg: '#eef2ff', fg: '#3b49a8', rule: '#5865d8', blurb: 'Waiting to hear' },
  Interviewing: { bg: '#fbf0dc', fg: '#855610', rule: '#d69a2a', blurb: 'They replied' },
  Offer: { bg: '#e9f6ec', fg: '#2b7040', rule: '#4d9c66', blurb: 'Decision time' },
  Rejected: { bg: '#fbecef', fg: '#a3384f', rule: '#cf5f78', blurb: 'Closed out' },
  Ghosted: { bg: '#f2f0ee', fg: '#6f6b65', rule: '#b3aea6', blurb: 'Gone quiet' },
};

/** Flag colours for an application that has gone quiet. Warm orange, and
 *  deliberately not reused by any status so the two never get confused. */
export const NUDGE = { bg: '#fdf0e8', fg: '#8a4318', strong: '#b5581f' };
