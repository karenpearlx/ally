'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
type Result<T> = { url: string; data: T | null; error: string | null };

type State<T> = {
  data: T | null;
  error: string | null;
  loading: boolean;
  /** True while refetching data that is already on screen. */
  refreshing: boolean;
  reload: () => void;
};

/**
 * Thin fetcher for /api/admin/*.
 *
 * The result is stored together with the url it belongs to, so "still loading"
 * is derived rather than tracked with a separate flag being flipped inside an
 * effect. Server error strings are surfaced verbatim; a 401 or 403 means the
 * session died, so the whole page goes back to the login screen.
 */
export function useAdminResource<T>(url: string, pollMs?: number): State<T> {
  const [result, setResult] = useState<Result<T>>({ url: '', data: null, error: null });
  const [refreshing, setRefreshing] = useState(false);
  const alive = useRef(true);

  const run = useCallback(async () => {
    try {
      const response = await fetch(url, { cache: 'no-store', credentials: 'same-origin' });
      if (response.status === 401 || response.status === 403) {
        window.location.href = '/admin/login';
        return;
      }
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.error ?? `Request failed with ${response.status}.`);
      if (!alive.current) return;
      setResult({ url, data: payload as T, error: null });
    } catch (cause) {
      if (!alive.current) return;
      const message = cause instanceof Error ? cause.message : 'Something went wrong.';
      setResult((previous) => ({
        url,
        data: previous.url === url ? previous.data : null,
        error: message,
      }));
    }
  }, [url]);

  useEffect(() => {
    alive.current = true;
    // Deferred a tick: the fetch is a side effect on an external system, and
    // nothing should call setState inside the effect's own render pass.
    void Promise.resolve().then(run);
    return () => {
      alive.current = false;
    };
  }, [run]);

  useEffect(() => {
    if (!pollMs) return;
    const id = setInterval(() => void run(), pollMs);
    return () => clearInterval(id);
  }, [pollMs, run]);

  const reload = useCallback(() => {
    setRefreshing(true);
    void run().finally(() => {
      if (alive.current) setRefreshing(false);
    });
  }, [run]);

  const settled = result.url === url;
  return {
    data: settled ? result.data : null,
    error: settled ? result.error : null,
    loading: !settled,
    refreshing,
    reload,
  };
}
