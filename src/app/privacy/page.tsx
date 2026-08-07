import type { Metadata } from "next";
import LegalDoc, { type LegalSection } from "@/components/LegalDoc";
import { CONTACT_EMAIL } from "@/lib/contact";

const CONTACT = CONTACT_EMAIL;
const UPDATED = "8 August 2026";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "What Verse collects, why, and what we never do with it. Plain language first, details after.",
};

const SECTIONS: LegalSection[] = [
  {
    id: "what-we-collect",
    title: "What we collect",
    paragraphs: [
      "Only what the tools need to work. There is no hidden profile being built about you in the background.",
    ],
    bullets: [
      "Account: your email address, and your name and profile photo if you sign in with Google.",
      "Profile: whatever you type into your resume or profile — skills, work history, education, links.",
      "Applications: the jobs you save or mark as applied, plus your notes and follow-up dates.",
      "Documents: resumes and cover letters you generate, and the job text you pasted to make them.",
      "Settings: your default templates, follow-up interval, and saved cover-letter rules.",
    ],
  },
  {
    id: "analytics",
    title: "Usage analytics",
    paragraphs: [
      "We count page views, clicks, searches, and filters so we can tell which parts of Verse are worth keeping. Each visit gets a random session id and a one-way hashed visitor id. Your raw IP address is never stored.",
      "There are no advertising pixels, no third-party trackers, and nothing following you to other sites.",
    ],
  },
  {
    id: "cookies",
    title: "Cookies",
    paragraphs: [
      "Verse sets a session cookie so you stay signed in, and stores a little data in your browser so drafts survive a refresh. That is the whole list. No ad cookies, no cross-site tracking.",
      "Blocking cookies will sign you out and break saving, but you can still browse the job board.",
    ],
  },
  {
    id: "ai",
    title: "When you use the AI writer",
    paragraphs: [
      "The cover letter builder has a template mode that runs entirely on our side, and an AI mode that does not. If you choose AI mode, the job listing text, your saved rules, and the profile details you included are sent to the AI provider you picked — OpenAI or Anthropic — to generate the letter.",
      "Their handling is governed by their own terms. A fair rule of thumb: do not paste anything into any AI tool that you would not send to a stranger.",
    ],
  },
  {
    id: "sharing",
    title: "Who else sees it",
    paragraphs: [
      "We do not sell your data, rent it, or hand it to recruiters. Nobody pays us for access to you.",
      "We do use a handful of service providers to run the thing, and your data passes through them:",
    ],
    bullets: [
      "Supabase — database, authentication, and file storage.",
      "Our hosting provider — serving the site itself.",
      "OpenAI or Anthropic — only when you use AI mode, and only the text described above.",
      "Anyone we are legally required to disclose to under Philippine law.",
    ],
  },
  {
    id: "job-listings",
    title: "Job listings and applying",
    paragraphs: [
      "Listings are collected from public job boards, currently OnlineJobs.ph, RemoteOK, and We Work Remotely. Verse does not submit applications for you. When you tap through to apply, you leave Verse and whatever you send is covered by that site's privacy policy and the employer's, not ours.",
      "Your tracker entries stay private to your account. Employers cannot browse Verse users.",
    ],
  },
  {
    id: "retention",
    title: "How long we keep it",
    paragraphs: [
      "Your account data stays until you delete it. Delete a resume, letter, or application and it is removed from our database, not archived somewhere out of view.",
      "Delete your account and everything attached to it goes with it. Analytics records are anonymous and are kept in aggregate.",
    ],
  },
  {
    id: "your-rights",
    title: "Your rights",
    paragraphs: [
      "Under the Philippine Data Privacy Act of 2012 (RA 10173) you can ask to see the data we hold about you, correct it, have it erased, object to how it is processed, or get a copy to take elsewhere.",
      `Email ${CONTACT} and we will sort it out within a reasonable time. If you are not satisfied, you can complain to the National Privacy Commission.`,
    ],
  },
  {
    id: "security",
    title: "Security",
    paragraphs: [
      "Traffic is encrypted in transit, passwords are hashed by our auth provider, and database row-level security means your rows are readable only by your account.",
      "No service can promise perfect security, and we are not going to pretend otherwise. If we ever discover a breach affecting your data, we will tell you and notify the National Privacy Commission as required.",
    ],
  },
  {
    id: "children",
    title: "Age",
    paragraphs: [
      "Verse is built for adults looking for work. It is not intended for anyone under 18, and we do not knowingly collect data from minors. If we learn we have, we delete it.",
    ],
  },
  {
    id: "changes",
    title: "Changes to this policy",
    paragraphs: [
      "If this policy changes in a way that matters, the date at the top changes and we will say so in the app. Continuing to use Verse after that means the new version applies.",
    ],
  },
];

export default function Privacy() {
  return (
    <LegalDoc
      eyebrow="Privacy policy"
      title="What we know about you"
      titleTail=", and why"
      updated={UPDATED}
      summary={[
        "Verse is free. You are not the product and there is nothing to sell, because we never sell your data.",
        "We collect what the tools need: your email, your profile, the jobs you track, the documents you make.",
        "Analytics are anonymous. Your raw IP address is never stored and there are no ad trackers.",
        "AI mode sends your job text to OpenAI or Anthropic. Template mode sends it nowhere.",
        "Ask us to delete your data and we delete it.",
      ]}
      sections={SECTIONS}
      contactEmail={CONTACT}
    />
  );
}
