import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Cover letter builder",
  description:
    "Write a tailored cover letter for remote VA roles in minutes. Template or AI mode, with your profile and saved rules.",
  path: "/cover-letter",
});

export default function CoverLetterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
