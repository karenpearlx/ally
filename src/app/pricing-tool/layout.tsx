import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "VA rate calculator",
  description:
    "Estimate a defendable hourly range for Filipino VA skills from collected listing data. Market estimates, not a live quote.",
  path: "/pricing-tool",
});

export default function PricingToolLayout({ children }: { children: React.ReactNode }) {
  return children;
}
