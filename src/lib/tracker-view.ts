/**
 * List or board — a per-device preference, not an account one. Which shape you
 * like to read your applications in belongs to the screen you're holding, so it
 * stays in localStorage rather than syncing.
 *
 * Exposed as an external store so the page can read it with
 * `useSyncExternalStore`: the server always answers "list", the browser answers
 * with what's saved, and nothing has to setState inside an effect to catch up.
 */

export type View = 'list' | 'board';

const KEY = 'ally-tracker-view';
const EVENT = 'ally:tracker-view';

export function readView(): View {
  try {
    return localStorage.getItem(KEY) === 'board' ? 'board' : 'list';
  } catch {
    return 'list';
  }
}

/** What the server renders, and the first client render before hydration. */
export function serverView(): View {
  return 'list';
}

export function writeView(view: View) {
  try {
    localStorage.setItem(KEY, view);
  } catch {
    /* private mode: the toggle still works for this session */
  }
  window.dispatchEvent(new Event(EVENT));
}

export function subscribeView(onChange: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key === null || e.key === KEY) onChange();
  };
  window.addEventListener(EVENT, onChange);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener('storage', onStorage);
  };
}
