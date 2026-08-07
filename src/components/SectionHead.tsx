import Reveal from "./Reveal";
import RevealWords from "./RevealWords";

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
      <RevealWords
        text={title}
        as="h2"
        dot={dot}
        delay={80}
        className={`display-lg mt-4 ${centered ? "mx-auto max-w-3xl" : "max-w-2xl"}`}
      />
      {sub && (
        <Reveal delay={140}>
          <p className={`lede mt-5 ${centered ? "mx-auto max-w-xl" : "max-w-xl"}`}>{sub}</p>
        </Reveal>
      )}
    </div>
  );
}
