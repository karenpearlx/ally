"use client";

import { useId } from "react";
import {
  LINK_LABEL_IDEAS,
  RULE_LIMITS,
  cleanUrl,
  type CoverLetterRules,
  type RuleLink,
} from "@/lib/cover-letter-rules";

/**
 * The repeatable half of /settings.
 *
 * Rows are keyed by index on purpose: these lists are short, edited in place
 * and never reordered, and carrying a synthetic id through the saved row would
 * mean persisting state the letter never uses.
 */

function Trash() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M2.8 4.2h10.4M6.4 4.2V2.9h3.2v1.3M4.1 4.2l.6 8.4a1 1 0 0 0 1 .9h4.6a1 1 0 0 0 1-.9l.6-8.4"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AddButton({
  onClick,
  disabled,
  children,
  hint,
}: {
  onClick: () => void;
  disabled: boolean;
  children: React.ReactNode;
  hint: string;
}) {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-3">
      <button type="button" className="btn btn-ghost !py-2.5 !text-[0.8125rem]" onClick={onClick} disabled={disabled}>
        <span aria-hidden>+</span> {children}
      </button>
      <span className="text-[0.8125rem]" style={{ color: "var(--color-faint)" }}>
        {hint}
      </span>
    </div>
  );
}

export default function CoverLetterRulesFields({
  value,
  onChange,
}: {
  value: CoverLetterRules;
  onChange: (next: CoverLetterRules) => void;
}) {
  const id = useId();
  const listId = `${id}-labels`;

  const patch = (part: Partial<CoverLetterRules>) => onChange({ ...value, ...part });

  const setLink = (index: number, part: Partial<RuleLink>) =>
    patch({ links: value.links.map((l, i) => (i === index ? { ...l, ...part } : l)) });

  const addLink = () => patch({ links: [...value.links, { label: "", url: "" }] });
  const removeLink = (index: number) => patch({ links: value.links.filter((_, i) => i !== index) });

  const setSnippet = (index: number, text: string) =>
    patch({ snippets: value.snippets.map((s, i) => (i === index ? text : s)) });
  const addSnippet = () => patch({ snippets: [...value.snippets, ""] });
  const removeSnippet = (index: number) => patch({ snippets: value.snippets.filter((_, i) => i !== index) });

  return (
    <div className="grid gap-8">
      {/* ---------- links ---------- */}
      <div>
        <h3 className="text-[0.9375rem] font-semibold">Links to always include</h3>
        <p className="mt-1 text-[0.8125rem] leading-relaxed" style={{ color: "var(--color-muted)" }}>
          Listed on their own lines just above your sign-off. Portfolio, resume, a Loom intro &mdash;
          whatever you paste into every application anyway.
        </p>

        <datalist id={listId}>
          {LINK_LABEL_IDEAS.map((label) => (
            <option key={label} value={label} />
          ))}
        </datalist>

        {value.links.length > 0 && (
          <ul className="mt-4 grid gap-3">
            {value.links.map((link, i) => {
              const badUrl = link.url.trim().length > 0 && cleanUrl(link.url) === null;
              const errorId = `${id}-link-${i}-error`;
              return (
                <li key={i} className="panel p-3.5">
                  <div className="flex flex-wrap items-start gap-2 sm:flex-nowrap">
                    <div className="w-full sm:w-40 sm:shrink-0">
                      <label htmlFor={`${id}-link-${i}-label`} className="sr-only">
                        Link {i + 1} label
                      </label>
                      <input
                        id={`${id}-link-${i}-label`}
                        className="field"
                        list={listId}
                        placeholder="Portfolio"
                        maxLength={RULE_LIMITS.maxLabel}
                        value={link.label}
                        onChange={(e) => setLink(i, { label: e.target.value })}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <label htmlFor={`${id}-link-${i}-url`} className="sr-only">
                        Link {i + 1} URL
                      </label>
                      <input
                        id={`${id}-link-${i}-url`}
                        className="field"
                        // Deliberately not type="url": the browser's own
                        // validation blocks the submit for a bare domain, so
                        // "karenong.com" would fail silently behind a native
                        // tooltip. Our validator accepts it and adds https://.
                        type="text"
                        inputMode="url"
                        spellCheck={false}
                        placeholder="https://yoursite.com"
                        maxLength={RULE_LIMITS.maxUrl}
                        value={link.url}
                        aria-invalid={badUrl || undefined}
                        aria-describedby={badUrl ? errorId : undefined}
                        onChange={(e) => setLink(i, { url: e.target.value })}
                        style={badUrl ? { borderColor: "#b5581f" } : undefined}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeLink(i)}
                      aria-label={`Remove link ${i + 1}${link.label ? `, ${link.label}` : ""}`}
                      className="btn btn-ghost !min-h-[44px] !min-w-[44px] !justify-center !px-3 !py-2.5"
                    >
                      <Trash />
                    </button>
                  </div>
                  {badUrl && (
                    <p id={errorId} className="mt-2 text-[0.8125rem]" style={{ color: "#b5581f" }}>
                      That needs to be a full http or https address.
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        <AddButton
          onClick={addLink}
          disabled={value.links.length >= RULE_LIMITS.maxLinks}
          hint={`${value.links.length} of ${RULE_LIMITS.maxLinks} used`}
        >
          Add a link
        </AddButton>
      </div>

      {/* ---------- sign-off ---------- */}
      <div>
        <h3 className="text-[0.9375rem] font-semibold">Sign-off</h3>
        <p className="mt-1 text-[0.8125rem] leading-relaxed" style={{ color: "var(--color-muted)" }}>
          Replaces the closing line. Your name still comes from the builder, so write only the
          goodbye.
        </p>
        <div className="mt-3 max-w-xs">
          <label htmlFor={`${id}-signoff`} className="sr-only">
            Default sign-off
          </label>
          <input
            id={`${id}-signoff`}
            className="field"
            placeholder="Talk soon,"
            maxLength={RULE_LIMITS.maxSignOff}
            value={value.signOff}
            onChange={(e) => patch({ signOff: e.target.value })}
          />
        </div>
      </div>

      {/* ---------- snippets ---------- */}
      <div>
        <h3 className="text-[0.9375rem] font-semibold">Lines to always include</h3>
        <p className="mt-1 text-[0.8125rem] leading-relaxed" style={{ color: "var(--color-muted)" }}>
          The proof you repeat in every application. Added as their own paragraphs in template mode;
          in AI mode the model works them into the prose.
        </p>

        {value.snippets.length > 0 && (
          <ul className="mt-4 grid gap-3">
            {value.snippets.map((snippet, i) => (
              <li key={i} className="panel flex items-start gap-2 p-3.5">
                <div className="min-w-0 flex-1">
                  <label htmlFor={`${id}-snippet-${i}`} className="sr-only">
                    Snippet {i + 1}
                  </label>
                  <textarea
                    id={`${id}-snippet-${i}`}
                    className="field"
                    rows={2}
                    maxLength={RULE_LIMITS.maxSnippet}
                    placeholder="I've managed remote teams across US and PH hours for five years."
                    value={snippet}
                    onChange={(e) => setSnippet(i, e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeSnippet(i)}
                  aria-label={`Remove snippet ${i + 1}`}
                  className="btn btn-ghost !min-h-[44px] !min-w-[44px] !justify-center !px-3 !py-2.5"
                >
                  <Trash />
                </button>
              </li>
            ))}
          </ul>
        )}

        <AddButton
          onClick={addSnippet}
          disabled={value.snippets.length >= RULE_LIMITS.maxSnippets}
          hint={`${value.snippets.length} of ${RULE_LIMITS.maxSnippets} used`}
        >
          Add a line
        </AddButton>
      </div>

      {/* ---------- instructions ---------- */}
      <div>
        <h3 className="text-[0.9375rem] font-semibold">Anything else</h3>
        <p className="mt-1 text-[0.8125rem] leading-relaxed" style={{ color: "var(--color-muted)" }}>
          Read as a style note in AI mode. Template mode can&rsquo;t rewrite prose, so it adds this
          word-for-word as the last paragraph &mdash; keep it to something you&rsquo;d be happy to
          see printed as written.
        </p>
        <div className="mt-3">
          <label htmlFor={`${id}-instructions`} className="sr-only">
            Additional instructions
          </label>
          <textarea
            id={`${id}-instructions`}
            className="field"
            rows={3}
            maxLength={RULE_LIMITS.maxInstructions}
            placeholder="Happy to start with a paid trial task if that's easier."
            value={value.instructions}
            onChange={(e) => patch({ instructions: e.target.value })}
            aria-describedby={`${id}-instructions-count`}
          />
          <p
            id={`${id}-instructions-count`}
            className="mt-1.5 text-right text-[0.75rem] tabular-nums"
            style={{ color: "var(--color-faint)" }}
          >
            {value.instructions.length} / {RULE_LIMITS.maxInstructions}
          </p>
        </div>
      </div>
    </div>
  );
}
