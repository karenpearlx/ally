import type { Metadata } from 'next';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import GradientBg from '@/components/GradientBg';
import CreatorApplyForm from '@/components/creator/CreatorApplyForm';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Apply to teach on Verse',
  description:
    'Apply to become a Creator on Verse. Host your own VA courses, keep 90% of sales, and teach what you already do for clients.',
};

export const dynamic = 'force-dynamic';

export default async function CreatorApplyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const meta = user?.user_metadata as { full_name?: string; name?: string } | undefined;
  const defaultName = (meta?.full_name || meta?.name || '').trim();
  const defaultEmail = user?.email ?? '';

  return (
    <div className="min-h-screen">
      <GradientBg position="right" />
      <Nav />

      <section className="px-5 pt-28 md:px-8 md:pt-40">
        <div className="mx-auto max-w-2xl">
          <p className="eyebrow">Creator</p>
          <h1 className="display-lg mt-4">
            Teach what you already do<span className="dot">.</span>
          </h1>
          <p className="lede mt-5 max-w-xl">
            Bring a skill Filipino VAs actually get hired for. We host the course and take payments; you keep the
            rights and 90% of sales.
          </p>
        </div>
      </section>

      <section className="px-5 pb-24 pt-10 md:px-8 md:pt-12">
        <div className="mx-auto max-w-2xl">
          <CreatorApplyForm defaultName={defaultName} defaultEmail={defaultEmail} />
        </div>
      </section>

      <Footer tagline="Teach the skill. Keep the rights." />
    </div>
  );
}
