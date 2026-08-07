import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Resume builder",
  description:
    "Build a clean remote-ready resume for Filipino virtual assistants. Export when you are ready to apply.",
  path: "/resume",
});

export default function ResumeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
