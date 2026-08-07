import Nav from "@/components/Nav";
import GradientBg from "@/components/GradientBg";

function CardSkeleton() {
  return (
    <div className="card h-full animate-pulse overflow-hidden">
      <div className="h-24" style={{ background: "var(--color-line)" }} />
      <div className="p-6">
        <div className="h-6 w-3/4 rounded" style={{ background: "var(--color-line)" }} />
        <div className="mt-3 h-4 w-full rounded" style={{ background: "var(--color-line)" }} />
        <div className="mt-2 h-4 w-2/3 rounded" style={{ background: "var(--color-line)" }} />
        <div className="mt-6 flex items-center justify-between border-t pt-4" style={{ borderColor: "var(--color-line)" }}>
          <div className="h-4 w-16 rounded" style={{ background: "var(--color-line)" }} />
          <div className="h-4 w-20 rounded" style={{ background: "var(--color-line)" }} />
        </div>
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <div className="min-h-screen">
      <GradientBg position="right" />
      <Nav />

      <section className="px-5 pt-28 md:px-8 md:pt-40">
        <div className="mx-auto max-w-5xl">
          <div className="h-4 w-24 rounded" style={{ background: "var(--color-line)" }} />
          <div className="mt-4 h-10 w-3/4 max-w-xl rounded" style={{ background: "var(--color-line)" }} />
          <div className="mt-5 h-6 w-1/2 max-w-md rounded" style={{ background: "var(--color-line)" }} />
        </div>
      </section>

      <section className="px-5 pt-14 md:px-8 md:pt-20">
        <div className="mx-auto max-w-5xl">
          <div className="h-8 w-48 rounded" style={{ background: "var(--color-line)" }} />
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 pt-20 md:px-8 md:pt-28">
        <div className="mx-auto max-w-5xl">
          <div className="h-8 w-56 rounded" style={{ background: "var(--color-line)" }} />
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
