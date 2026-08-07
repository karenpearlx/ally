import Link from "next/link";
import { Suspense } from "react";
import AuthShell from "@/components/AuthShell";
import AuthForm from "@/components/AuthForm";

export default function Login() {
  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Sign in to Versified"
      sub="Pick up where you left off."
      aside={{
        heading: "What's waiting for you",
        points: [
          "Saved jobs and the applications you've already sent",
          "Follow-up reminders for anything older than five days",
          "Your cover letters and resumes, ready to reuse",
          "Rate checks saved against your profile",
        ],
      }}
      footer={
        <>
          New here?{" "}
          <Link href="/signup" className="tap font-medium underline underline-offset-4" style={{ color: "var(--color-accent)" }}>
            Create a free account
          </Link>
        </>
      }
    >
      <Suspense fallback={<div className="mt-8" style={{ minHeight: 380 }} />}>
        <AuthForm mode="login" />
      </Suspense>
    </AuthShell>
  );
}
