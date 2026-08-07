"use client";

import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";

/**
 * "Start track 01" used to be a hard link to /signup, so signed-in people got
 * asked to sign up again. Now the destination follows the session:
 *  - signed in            → straight into the lessons
 *  - signed out           → signup, carrying ?next so they land on the lessons after
 *  - session not read yet → the lessons; that page is public, so an early click
 *                           can never dead-end, and there's no signup flash.
 */
export default function StartTrack({
  href = "/learn/start",
  className = "btn btn-primary",
  children = "Start track 01",
}: {
  href?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const { status } = useAuth();
  const target = status === "out" ? `/signup?next=${encodeURIComponent(href)}` : href;

  return (
    <Link href={target} className={className} data-auth={status}>
      {children}
    </Link>
  );
}
