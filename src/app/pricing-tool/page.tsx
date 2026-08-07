'use client';

import { useState } from 'react';
import Link from 'next/link';
import Nav from '@/components/Nav';
import GradientBg from '@/components/GradientBg';
import Footer from '@/components/Footer';

const SKILLS = [
  'General VA',
  'Executive Assistant',
  'Social Media Manager',
  'Content Writer',
  'SEO Specialist',
  'Graphic Designer',
  'Video Editor',
  'Bookkeeper',
  'Customer Support',
  'Data Entry',
  'Project Manager',
  'Email Marketing',
  'Web Developer',
  'Sales/Lead Generation',
  'Real Estate VA',
  'E-commerce VA',
];

const EXPERIENCE_LEVELS = [
  { value: 'entry', top: 'ENTRY', mid: '0–1', multiplier: 0.7 },
  { value: 'junior', top: 'JUNIOR', mid: '1–2', multiplier: 0.85 },
  { value: 'mid', top: 'MID', mid: '2–4', multiplier: 1.0 },
  { value: 'senior', top: 'SENIOR', mid: '4–6', multiplier: 1.2 },
  { value: 'expert', top: 'EXPERT', mid: '6+', multiplier: 1.4 },
];

const BASE_RATES: Record<string, { min: number; max: number }> = {
  'General VA': { min: 4, max: 8 },
  'Executive Assistant': { min: 6, max: 12 },
  'Social Media Manager': { min: 5, max: 10 },
  'Content Writer': { min: 5, max: 12 },
  'SEO Specialist': { min: 7, max: 15 },
  'Graphic Designer': { min: 5, max: 12 },
  'Video Editor': { min: 6, max: 15 },
  Bookkeeper: { min: 6, max: 12 },
  'Customer Support': { min: 4, max: 8 },
  'Data Entry': { min: 3, max: 6 },
  'Project Manager': { min: 8, max: 18 },
  'Email Marketing': { min: 6, max: 12 },
  'Web Developer': { min: 8, max: 20 },
  'Sales/Lead Generation': { min: 5, max: 12 },
  'Real Estate VA': { min: 5, max: 10 },
  'E-commerce VA': { min: 5, max: 10 },
};

const PHP_PER_USD = 58;
const SCALE_MIN = 3;
const SCALE_MAX = 28;

type Result = {
  hourlyMin: number;
  hourlyMax: number;
  monthlyMin: number;
  monthlyMax: number;
  perSkill: { skill: string; min: number; max: number }[];
};

export default function PricingTool() {
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [experience, setExperience] = useState('');
  const [result, setResult] = useState<Result | null>(null);

  const toggleSkill = (skill: string) =>
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );

  const calculateRate = () => {
    if (selectedSkills.length === 0 || !experience) return;
    const level = EXPERIENCE_LEVELS.find((e) => e.value === experience);
    if (!level) return;

    const perSkill = selectedSkills.map((skill) => {
      const r = BASE_RATES[skill] ?? { min: 4, max: 8 };
      return {
        skill,
        min: Math.round(r.min * level.multiplier * 10) / 10,
        max: Math.round(r.max * level.multiplier * 10) / 10,
      };
    });

    const avgMin = perSkill.reduce((a, s) => a + s.min, 0) / perSkill.length;
    const avgMax = perSkill.reduce((a, s) => a + s.max, 0) / perSkill.length;

    setResult({
      hourlyMin: Math.round(avgMin * 10) / 10,
      hourlyMax: Math.round(avgMax * 10) / 10,
      monthlyMin: Math.round(avgMin * 160),
      monthlyMax: Math.round(avgMax * 160),
      perSkill: perSkill.sort((a, b) => b.max - a.max),
    });

    requestAnimationFrame(() =>
      document.getElementById('result')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    );
  };

  const ready = selectedSkills.length > 0 && Boolean(experience);
  const pct = (v: number) =>
    Math.max(0, Math.min(100, ((v - SCALE_MIN) / (SCALE_MAX - SCALE_MIN)) * 100));

  return (
    <div className="min-h-screen">
      <GradientBg position="left" />
      <Nav />

      <section className="px-5 pt-28 md:px-8 md:pt-40">
        <div className="mx-auto max-w-3xl">
          <p className="eyebrow">Rate check</p>
          <h1 className="display-lg mt-4">
            Stop guessing what to charge<span className="dot">.</span>
          </h1>
          <p className="lede mt-5 max-w-xl">
            Pick what you do and how long you&rsquo;ve done it. You&rsquo;ll get a range you can
            actually defend in an interview.
          </p>
        </div>
      </section>

      <section className="px-5 pt-12 md:px-8 md:pt-16">
        <div className="mx-auto max-w-3xl space-y-5">
          {/* step 1 */}
          <div className="card p-6 md:p-8">
            <div className="flex items-baseline gap-3">
              <span
                className="font-display text-sm font-extrabold"
                style={{ color: 'var(--color-accent)' }}
              >
                01
              </span>
              <h2 className="font-display text-xl font-extrabold tracking-tight">
                What do you do?
              </h2>
            </div>
            <p className="mt-1.5 text-sm" style={{ color: 'var(--color-muted)' }}>
              Pick every service you can confidently deliver today.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {SKILLS.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  className="chip"
                  data-on={selectedSkills.includes(skill)}
                  aria-pressed={selectedSkills.includes(skill)}
                  onClick={() => toggleSkill(skill)}
                >
                  {skill}
                </button>
              ))}
            </div>

            {selectedSkills.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedSkills([])}
                className="mt-5 text-sm underline underline-offset-4"
                style={{ color: 'var(--color-muted)' }}
              >
                Clear {selectedSkills.length} selected
              </button>
            )}
          </div>

          {/* step 2 */}
          <div className="card p-6 md:p-8">
            <div className="flex items-baseline gap-3">
              <span
                className="font-display text-sm font-extrabold"
                style={{ color: 'var(--color-accent)' }}
              >
                02
              </span>
              <h2 className="font-display text-xl font-extrabold tracking-tight">
                How long have you done it?
              </h2>
            </div>
            <p className="mt-1.5 text-sm" style={{ color: 'var(--color-muted)' }}>
              Count real client work, not training.
            </p>

            <div className="no-bar mt-6 flex gap-2 overflow-x-auto pb-1">
              {EXPERIENCE_LEVELS.map((level) => {
                const on = experience === level.value;
                return (
                  <button
                    key={level.value}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setExperience(level.value)}
                    className="flex-1 rounded-2xl px-3 py-3.5 text-center transition-colors"
                    style={{
                      minWidth: 88,
                      background: on ? 'var(--color-ink)' : '#fff',
                      border: `1px solid ${on ? 'var(--color-ink)' : 'var(--color-line-2)'}`,
                      color: on ? '#fff' : 'var(--color-ink)',
                    }}
                  >
                    <span
                      className="block text-[0.5625rem] font-semibold tracking-[0.12em]"
                      style={{ color: on ? 'rgba(255,255,255,.65)' : 'var(--color-faint)' }}
                    >
                      {level.top}
                    </span>
                    <span className="font-display block text-lg font-extrabold leading-tight">
                      {level.mid}
                    </span>
                    <span
                      className="block text-[0.6875rem]"
                      style={{ color: on ? 'rgba(255,255,255,.65)' : 'var(--color-muted)' }}
                    >
                      yrs
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={calculateRate}
            disabled={!ready}
            className="btn btn-primary w-full !py-4 !text-base"
          >
            {ready ? 'Show my rate' : 'Pick a skill and your experience'}
          </button>

          {/* result */}
          {result && (
            <div id="result" className="card-float p-6 md:p-9">
              <p className="eyebrow">Your range</p>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div
                  className="rounded-2xl p-5"
                  style={{ background: 'var(--color-accent-soft)' }}
                >
                  <p className="text-sm" style={{ color: 'var(--color-accent-deep)' }}>
                    Hourly
                  </p>
                  <p
                    className="font-display mt-1 text-3xl font-extrabold tracking-tight md:text-4xl"
                    style={{ color: 'var(--color-accent-deep)' }}
                  >
                    ${result.hourlyMin}–{result.hourlyMax}
                  </p>
                </div>
                <div className="rounded-2xl p-5" style={{ background: 'var(--color-paper-2)' }}>
                  <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
                    Monthly, full-time
                  </p>
                  <p className="font-display mt-1 text-3xl font-extrabold tracking-tight md:text-4xl">
                    ${result.monthlyMin.toLocaleString()}–{result.monthlyMax.toLocaleString()}
                  </p>
                  <p className="mt-1 text-sm" style={{ color: 'var(--color-muted)' }}>
                    ≈ ₱{(result.monthlyMin * PHP_PER_USD).toLocaleString()}–
                    {(result.monthlyMax * PHP_PER_USD).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* scale */}
              <div className="mt-8">
                <div
                  className="relative h-2.5 rounded-full"
                  style={{ background: 'var(--color-paper-2)' }}
                >
                  <div
                    className="absolute inset-y-0 rounded-full"
                    style={{
                      left: `${pct(result.hourlyMin)}%`,
                      right: `${100 - pct(result.hourlyMax)}%`,
                      background: 'var(--color-accent)',
                    }}
                  />
                </div>
                <div
                  className="mt-2 flex justify-between text-xs"
                  style={{ color: 'var(--color-faint)' }}
                >
                  <span>${SCALE_MIN}/hr</span>
                  <span>${SCALE_MAX}/hr</span>
                </div>
              </div>

              {/* per skill */}
              <p className="eyebrow mt-9" style={{ color: 'var(--color-faint)' }}>
                By skill
              </p>
              <div className="mt-3 space-y-2.5">
                {result.perSkill.map((s) => (
                  <div
                    key={s.skill}
                    className="rounded-xl px-4 py-3"
                    style={{ border: '1px solid var(--color-line)' }}
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-[0.9375rem] font-medium">{s.skill}</span>
                      <span className="font-display text-[0.9375rem] font-bold">
                        ${s.min}–{s.max}/hr
                      </span>
                    </div>
                    <div
                      className="relative mt-2.5 h-1.5 rounded-full"
                      style={{ background: 'var(--color-paper-2)' }}
                    >
                      <div
                        className="absolute inset-y-0 rounded-full"
                        style={{
                          left: `${pct(s.min)}%`,
                          right: `${100 - pct(s.max)}%`,
                          background: 'var(--color-accent)',
                          opacity: 0.85,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div
                className="mt-8 rounded-2xl p-5"
                style={{ background: 'var(--color-paper-2)' }}
              >
                <p className="text-[0.9375rem] leading-relaxed" style={{ color: 'var(--color-ink-2)' }}>
                  <strong>Quote the top of the range first.</strong> Clients expect to negotiate
                  down, and opening at your floor means you land under it. Monthly figures assume
                  160 hours.
                </p>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/jobs" className="btn btn-primary">
                  Find jobs in this range
                </Link>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    setResult(null);
                    setSelectedSkills([]);
                    setExperience('');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  Start over
                </button>
              </div>
            </div>
          )}

          <p className="pt-2 text-center text-sm" style={{ color: 'var(--color-faint)' }}>
            Ranges are built from aggregated listings. Your actual rate depends on the client,
            scope, and how well you sell it.
          </p>
        </div>
      </section>

      <Footer tagline="Know your worth before you quote" />
    </div>
  );
}
