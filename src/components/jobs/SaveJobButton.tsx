'use client';

/**
 * Bookmark toggle for a job card.
 *
 * Outlined means "not in your tracker", filled teal means it is. It sits above
 * the card's stretched link (z-index, not a nested button) so the click lands
 * here instead of opening the listing.
 */

type Props = {
  saved: boolean;
  busy?: boolean;
  title: string;
  onToggle: () => void;
};

export default function SaveJobButton({ saved, busy = false, title, onToggle }: Props) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      disabled={busy}
      aria-pressed={saved}
      aria-busy={busy}
      aria-label={saved ? `Remove ${title} from your tracker` : `Save ${title} to your tracker`}
      title={saved ? 'Saved — tap to remove' : 'Save to tracker'}
      className="save-pin relative z-[1] grid h-9 w-9 flex-none place-items-center rounded-full transition-colors"
      data-on={saved}
      style={{
        background: saved ? 'var(--color-accent-soft)' : 'transparent',
        color: saved ? 'var(--color-accent-deep)' : 'var(--color-faint)',
        opacity: busy ? 0.55 : 1,
        cursor: busy ? 'progress' : 'pointer',
      }}
    >
      <svg
        width="17"
        height="17"
        viewBox="0 0 18 18"
        fill={saved ? 'currentColor' : 'none'}
        aria-hidden
        key={saved ? 'on' : 'off'}
        style={saved ? { animation: 'ally-pin-pop .28s cubic-bezier(.34,1.56,.64,1)' } : undefined}
      >
        <path
          d="M4.5 2.75h9a.75.75 0 0 1 .75.75v11.31a.4.4 0 0 1-.63.33L9 12.1l-4.62 3.04a.4.4 0 0 1-.63-.33V3.5a.75.75 0 0 1 .75-.75Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
      <span className="sr-only">{saved ? 'Saved' : 'Not saved'}</span>
    </button>
  );
}
