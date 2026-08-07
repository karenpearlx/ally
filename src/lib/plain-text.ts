/**
 * Turn scraped HTML job posts into plain text for the cover-letter textarea
 * and the model. Listings often arrive as `<ul><li>…` or `<br>` soup; leaving
 * tags in the box makes the builder look broken and wastes tokens.
 */

const NAMED: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  hellip: '…',
  mdash: '—',
  ndash: '–',
  rsquo: '\u2019',
  lsquo: '\u2018',
  rdquo: '\u201D',
  ldquo: '\u201C',
};

function decodeEntities(text: string) {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (full, body: string) => {
    const key = body.toLowerCase();
    if (key[0] === '#') {
      const code = key[1] === 'x' ? Number.parseInt(key.slice(2), 16) : Number.parseInt(key.slice(1), 10);
      if (Number.isFinite(code) && code > 0) {
        try {
          return String.fromCodePoint(code);
        } catch {
          return full;
        }
      }
      return full;
    }
    return NAMED[key] ?? full;
  });
}

/** Collapse consecutive duplicate paragraphs (scrapers sometimes repeat a block). */
function collapseDuplicateParagraphs(text: string) {
  const parts = text
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);
  const out: string[] = [];
  for (const part of parts) {
    if (out[out.length - 1] !== part) out.push(part);
  }
  return collapseTiledRepeat(out.join('\n\n'));
}

/**
 * If the whole string is the same chunk pasted 2+ times (common scraper bug),
 * keep one copy. Works on paragraph blocks and on single-spaced line lists.
 */
function collapseTiledRepeat(text: string) {
  const trimmed = text.trim();
  if (trimmed.length < 80) return trimmed;

  const byParagraph = collapseTiles(
    trimmed
      .split(/\n{2,}/)
      .map((part) => part.trim())
      .filter(Boolean),
    '\n\n',
  );
  if (byParagraph !== null) return byParagraph;

  const byLine = collapseTiles(
    trimmed
      .split('\n')
      .map((part) => part.trim())
      .filter(Boolean),
    '\n',
  );
  if (byLine !== null) return byLine;

  return trimmed;
}

function collapseTiles(parts: string[], joinWith: string): string | null {
  if (parts.length < 4) return null;
  for (let times = Math.min(8, Math.floor(parts.length / 2)); times >= 2; times--) {
    if (parts.length % times !== 0) continue;
    const unitLen = parts.length / times;
    const unit = parts.slice(0, unitLen);
    let tiled = true;
    for (let t = 1; t < times && tiled; t++) {
      for (let i = 0; i < unitLen; i++) {
        if (parts[t * unitLen + i] !== unit[i]) {
          tiled = false;
          break;
        }
      }
    }
    if (tiled) return unit.join(joinWith);
  }
  return null;
}

/**
 * HTML → readable plain text. Safe on already-plain strings (no tags → mostly
 * whitespace tidy). Does not execute markup; tags are discarded.
 */
export function htmlToPlainText(input: string): string {
  if (!input) return '';

  let text = input
    .replace(/<\s*(script|style|noscript)\b[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<\s*br\s*\/?>/gi, '\n')
    // Closing tags end a block. Opening tags for containers start one — but not
    // <li>, or every bullet becomes its own double-spaced paragraph.
    .replace(/<\s*\/\s*(p|div|tr|li|h[1-6]|section|article|header|footer|blockquote|ul|ol)\s*>/gi, '\n')
    .replace(/<\s*(p|div|tr|h[1-6]|table|section|article|blockquote)\b[^>]*>/gi, '\n')
    .replace(/<\s*hr\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '');

  text = decodeEntities(text)
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return collapseDuplicateParagraphs(text);
}
