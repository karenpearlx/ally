import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Learn",
  description:
    "Free and Pro courses for Filipino virtual assistants — from starter tracks to specialist skills.",
  path: "/learn",
});

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return children;
}
