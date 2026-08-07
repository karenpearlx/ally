import { Suspense } from "react";
import { pageMetadata } from "@/lib/seo";
import JobsBoard from "./JobsBoard";

export const metadata = pageMetadata({
  title: "VA job board",
  description:
    "Remote VA jobs from OnlineJobs.ph, RemoteOK, and We Work Remotely in one feed. Filter by source, search by skill, and open the original listing to apply.",
  path: "/jobs",
});

export default function JobsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-sm" style={{ color: "var(--color-muted)" }}>
          Loading the job board…
        </div>
      }
    >
      <JobsBoard />
    </Suspense>
  );
}
