import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Analytics fixture",
  description: "Internal fixture page.",
  path: "/uxfixture-analytics",
  index: false,
});

export default function UxFixtureLayout({ children }: { children: React.ReactNode }) {
  return children;
}
