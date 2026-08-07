import Reveal from "./Reveal";

export default function SectionHead({
  eyebrow,
  title,
  dot = true,
  sub,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  dot?: boolean;
  sub?: string;
  align?: "center" | "left";
}) {
  const centered = align === "center";
  return (
    <div className={centered ? "text-center" : "text-left"}>
      <Reveal>
        <p className="eyebrow">{eyebrow}</p>
      </Reveal>
      <Reveal delay={80}>
        <h2 className={`display-lg mt-4 ${centered ? "mx-auto max-w-3xl" : "max-w-2xl"}`}>
          {title}
          {dot && <span className="dot">.</span>}
        </h2>
      </Reveal>
      {sub && (
        <Reveal delay={140}>
          <p className={`lede mt-5 ${centered ? "mx-auto max-w-xl" : "max-w-xl"}`}>{sub}</p>
        </Reveal>
      )}
    </div>
  );
}
