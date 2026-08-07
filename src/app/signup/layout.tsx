import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Create account",
  description: "Create a free Verse account to track applications and save your profile.",
  path: "/signup",
  index: false,
});

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
