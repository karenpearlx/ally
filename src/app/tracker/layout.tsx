import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Application tracker",
  description:
    "Track every VA application in one board, with follow-up reminders so nothing goes cold.",
  path: "/tracker",
});

export default function TrackerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
