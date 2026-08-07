/**
 * Device-level analytics opt-out.
 *
 * Two signals on purpose: localStorage for any client-side tracker, and a
 * plain cookie so a server-side collector can drop the event before it is ever
 * written. Both are per-device, which is the honest framing: this excludes
 * *this browser*, not a person, and no IP address is involved either way.
 */

export const OPT_OUT_KEY = 'ally:analytics:optout';
export const OPT_OUT_COOKIE = 'ally_no_analytics';

export function readOptOut(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    if (window.localStorage.getItem(OPT_OUT_KEY) === '1') return true;
  } catch {
    /* private mode, fall through to the cookie */
  }
  return document.cookie.split('; ').some((part) => part === `${OPT_OUT_COOKIE}=1`);
}

const CHANGED = 'ally:analytics:optout-changed';

/** Lets components read the flag with useSyncExternalStore instead of an effect. */
export function subscribeOptOut(onChange: () => void) {
  window.addEventListener(CHANGED, onChange);
  window.addEventListener('storage', onChange);
  return () => {
    window.removeEventListener(CHANGED, onChange);
    window.removeEventListener('storage', onChange);
  };
}

export function writeOptOut(enabled: boolean) {
  if (typeof window === 'undefined') return;
  try {
    if (enabled) window.localStorage.setItem(OPT_OUT_KEY, '1');
    else window.localStorage.removeItem(OPT_OUT_KEY);
  } catch {
    /* ignore */
  }
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = enabled
    ? `${OPT_OUT_COOKIE}=1; path=/; max-age=31536000; SameSite=Lax${secure}`
    : `${OPT_OUT_COOKIE}=; path=/; max-age=0; SameSite=Lax${secure}`;
  window.dispatchEvent(new Event(CHANGED));
}
