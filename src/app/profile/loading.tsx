import Nav from '@/components/Nav';
import GradientBg from '@/components/GradientBg';

export default function ProfileLoading() {
  return (
    <div className="min-h-screen">
      <GradientBg position="left" />
      <Nav />
      <section className="px-5 pt-28 md:px-8 md:pt-40">
        <div className="mx-auto max-w-3xl">
          {/* Header skeleton */}
          <div className="h-6 w-24 rounded-lg animate-pulse" style={{ background: 'var(--color-paper-2)' }} />
          <div className="mt-4 h-10 w-64 rounded-lg animate-pulse" style={{ background: 'var(--color-paper-2)' }} />
          <div className="mt-3 h-5 w-80 rounded-lg animate-pulse" style={{ background: 'var(--color-paper-2)' }} />
          
          {/* Form skeleton */}
          <div className="card mt-10 p-6 md:p-8" style={{ opacity: 0.6 }}>
            <div className="space-y-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i}>
                  <div className="h-4 w-24 rounded-full mb-2" style={{ background: 'var(--color-paper-2)' }} />
                  <div className="h-12 w-full rounded-xl" style={{ background: 'var(--color-paper-2)' }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
