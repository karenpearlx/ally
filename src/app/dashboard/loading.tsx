import Nav from '@/components/Nav';
import GradientBg from '@/components/GradientBg';

export default function DashboardLoading() {
  return (
    <div className="min-h-screen">
      <GradientBg />
      <Nav />
      <section className="px-5 pt-28 md:px-8 md:pt-40">
        <div className="mx-auto max-w-5xl">
          {/* Skeleton for greeting */}
          <div className="h-8 w-48 rounded-lg animate-pulse" style={{ background: 'var(--color-paper-2)' }} />
          <div className="mt-3 h-5 w-72 rounded-lg animate-pulse" style={{ background: 'var(--color-paper-2)' }} />
          
          {/* Skeleton for stats */}
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card p-5" style={{ opacity: 0.6 }}>
                <div className="h-4 w-20 rounded-full" style={{ background: 'var(--color-paper-2)' }} />
                <div className="mt-3 h-8 w-12 rounded-lg" style={{ background: 'var(--color-paper-2)' }} />
              </div>
            ))}
          </div>
          
          {/* Skeleton for sections */}
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <div className="card p-6" style={{ opacity: 0.5 }}>
              <div className="h-5 w-32 rounded-full" style={{ background: 'var(--color-paper-2)' }} />
              <div className="mt-4 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-12 w-full rounded-xl" style={{ background: 'var(--color-paper-2)' }} />
                ))}
              </div>
            </div>
            <div className="card p-6" style={{ opacity: 0.5 }}>
              <div className="h-5 w-32 rounded-full" style={{ background: 'var(--color-paper-2)' }} />
              <div className="mt-4 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-12 w-full rounded-xl" style={{ background: 'var(--color-paper-2)' }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
