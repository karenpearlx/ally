/**
 * One IntersectionObserver for every scroll reveal on the page.
 *
 * Reveal used to construct its own observer per instance. The homepage now has
 * ~20 reveals, and each observer is a separate callback the browser has to run
 * against the same scroll updates. A single shared observer with a WeakMap of
 * callbacks does the same job for one registration cost.
 */

type Cb = () => void;

let observer: IntersectionObserver | null = null;
const callbacks = new WeakMap<Element, Cb>();

function get(): IntersectionObserver | null {
  if (typeof IntersectionObserver === "undefined") return null;
  if (observer) return observer;

  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const cb = callbacks.get(entry.target);
        // Fire once, then stop watching. Reveals never need to un-reveal.
        callbacks.delete(entry.target);
        observer?.unobserve(entry.target);
        cb?.();
      }
    },
    { rootMargin: "0px 0px -12% 0px", threshold: 0.05 }
  );
  return observer;
}

/** Watch `el`, call `cb` once when it scrolls into view. Returns an unsubscribe. */
export function onReveal(el: Element, cb: Cb): () => void {
  const io = get();
  // No IntersectionObserver (old browser, some test runners): show immediately
  // rather than leaving the page permanently blank.
  if (!io) {
    cb();
    return () => {};
  }
  callbacks.set(el, cb);
  io.observe(el);
  return () => {
    callbacks.delete(el);
    io.unobserve(el);
  };
}

/** True when the visitor asked the OS to reduce motion. */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
