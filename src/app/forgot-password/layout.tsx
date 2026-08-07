import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Forgot password",
  description: "Reset your Verse password.",
  path: "/forgot-password",
  index: false,
});

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
