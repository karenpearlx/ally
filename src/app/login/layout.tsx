import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Sign in",
  description: "Sign in to Verse to track applications, save jobs, and unlock Pro tools.",
  path: "/login",
  index: false,
});

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
