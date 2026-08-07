"use client";

import Link from "next/link";
import { useMemo } from "react";
import { daysSince, needsFollowUp, type App } from "@/lib/followups";
import { usePreferences } from "@/lib/usePreferences";

/**
 * The nudge list.
 *
 * The threshold is a per-account preference that only exists on the client, so
 * the rows arrive from the server and the *filtering* happens here. Before
 * hydration `hydrated` is false and we render the placeholder rather than a
 * list computed from the default 5 days — a count that changes under someone's
 * eyes is worse than a beat of nothing.
 */
export default function FollowUps({ apps }: { apps: App[] }) {
  const { followUpDays, hydrated } = usePreferences();

  const overdue = useMemo(
    () =>
      apps
        .filter((a) => needsFollowUp(a, followUpDays))
        .sort((a, b) => a.appliedAt.localeCompare(b.appliedAt))
        .slice(0, 4),
    [apps, followUpDays],
  );

  return (
    <div className="card flex h-full flex-col p-6 md:p-7">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-display text-lg font-extrabold tracking-tight">Needs a nudge</h2>
        {hydrated && overdue.length > 0 && (
          <Link
            href="/tracker?filter=followup"
            className="tap text-sm underline underline-offset-2"
            style={{ color: "var(--color-accent)" }}
          >
            See all
          </Link>
        )}
      </div>

      {!hydrated ? (
        <p className="mt-4 text-[0.9375rem]" style={{ color: "var(--color-muted)" }}>
          Checking your list…
        </p>
      ) : overdue.length === 0 ? (
        <p className="mt-4 text-[0.9375rem] leading-relaxed" style={{ color: "var(--color-muted)" }}>
          {apps.length
            ? `Nothing has gone quiet for ${followUpDays} days. Enjoy it while it lasts.`
            : "Nothing to chase yet. Applications you save show up here when they go quiet."}
        </p>
      ) : (
        <ul className="mt-4 space-y-2.5">
          {overdue.map((a) => {
            const age = daysSince(a.appliedAt);
            return (
              <li
                key={a.id}
                className="flex items-center justify-between gap-x-3 rounded-xl px-3.5 py-3"
                style={{ background: "#fdf0e8" }}
              >
                <span className="min-w-0">
                  <span
                    className="wrap-anywhere block text-[0.9375rem] font-semibold leading-snug"
                    style={{ color: "#8a4318" }}
                  >
                    {a.role}
                  </span>
                  <span className="wrap-anywhere block text-[0.8125rem]" style={{ color: "#a46136" }}>
                    {a.company} · quiet {age} days
                  </span>
                </span>
                <Link
                  href={`/cover-letter?role=${encodeURIComponent(a.role)}&company=${encodeURIComponent(a.company)}`}
                  className="tap flex-none text-[0.8125rem] font-semibold underline underline-offset-2"
                  style={{ color: "#8a4318" }}
                >
                  Write it
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      {/* mt-auto on a wrapper, not the button: an inline marginTop would beat
          the utility class and drop the button mid-card. */}
      <div className="mt-auto pt-6">
        <Link href="/tracker" className="btn btn-ghost !py-2.5 !text-sm">
          Open tracker
        </Link>
      </div>
    </div>
  );
}
