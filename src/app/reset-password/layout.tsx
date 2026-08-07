import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Choose a new password",
  description: "Set a new password for your Verse account.",
  path: "/reset-password",
  index: false,
});

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
