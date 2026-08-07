import Nav from "@/components/Nav";

function LessonSkeleton() {
  return (
    <div className="flex items-center gap-4 py-4 animate-pulse">
      <div className="h-6 w-6 flex-none rounded-full" style={{ background: "var(--color-line)" }} />
      <div className="h-5 flex-1 rounded" style={{ background: "var(--color-line)" }} />
    </div>
  );
}

export default function Loading() {
  return (
    <div className="min-h-screen">
      <Nav />

      <section className="px-5 pt-28 md:px-8 md:pt-36">
        <div className="mx-auto max-w-3xl">
          <div className="h-4 w-24 rounded animate-pulse" style={{ background: "var(--color-line)" }} />

          <div className="mt-8">
            <div className="h-4 w-20 rounded animate-pulse" style={{ background: "var(--color-line)" }} />
            <div className="mt-4 h-10 w-3/4 rounded animate-pulse" style={{ background: "var(--color-line)" }} />
            <div className="mt-4 h-5 w-full max-w-lg rounded animate-pulse" style={{ background: "var(--color-line)" }} />
            <div className="mt-2 h-5 w-2/3 rounded animate-pulse" style={{ background: "var(--color-line)" }} />
          </div>

          <div className="mt-10 flex items-center gap-4">
            <div className="h-4 w-16 rounded animate-pulse" style={{ background: "var(--color-line)" }} />
            <div className="h-4 w-20 rounded animate-pulse" style={{ background: "var(--color-line)" }} />
          </div>

          <div className="mt-12 border-t pt-8" style={{ borderColor: "var(--color-line)" }}>
            <div className="h-6 w-32 rounded animate-pulse" style={{ background: "var(--color-line)" }} />
            <div className="mt-6 divide-y" style={{ borderColor: "var(--color-line)" }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <LessonSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
