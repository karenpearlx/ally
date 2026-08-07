/**
 * Niche cover-letter templates.
 *
 * These are deliberately NOT one letter with the job title swapped out. Hiring
 * managers in each of these niches skim for different proof: an EA client wants
 * to hear about judgement and discretion, an SEO client wants numbers, a support
 * client wants response times. Each template has its own structure, its own
 * proof lines and its own closer.
 *
 * Pure functions, no network, no auth — template mode has to work for someone
 * who has never signed in.
 */

export type Niche =
  | 'general'
  | 'seo'
  | 'writer'
  | 'ea'
  | 'support'
  | 'ops';

export type LetterInput = {
  name: string;
  years: string;
  /** Optional one-line pitch that replaces the generic opener. */
  headline: string;
  role: string;
  company: string;
  /** First name spotted in the listing, e.g. "Hi Marco". */
  contact: string;
  listing: string;
};

export type NicheMeta = {
  id: Niche;
  label: string;
  blurb: string;
};

export const NICHES: NicheMeta[] = [
  { id: 'general', label: 'General VA', blurb: 'Admin, inbox, research, the bits nobody else picks up.' },
  { id: 'seo', label: 'SEO', blurb: 'Rankings, audits, keyword work. Leads with numbers.' },
  { id: 'writer', label: 'Content writer', blurb: 'Briefs, drafts, voice matching. Leads with published work.' },
  { id: 'ea', label: 'Executive assistant', blurb: 'Calendar, gatekeeping, judgement. Leads with trust.' },
  { id: 'support', label: 'Customer support', blurb: 'Queues, tone, response times. Leads with the metric.' },
  { id: 'ops', label: 'Operations', blurb: 'SOPs, systems, people. Leads with what you built.' },
];

/** Tools worth naming back at them — specificity is the whole trick. */
const TOOLS: [string, RegExp][] = [
  ['Notion', /\bnotion\b/i],
  ['Asana', /\basana\b/i],
  ['ClickUp', /\bclickup\b/i],
  ['Trello', /\btrello\b/i],
  ['Monday.com', /\bmonday\.?com\b/i],
  ['Slack', /\bslack\b/i],
  ['HubSpot', /\bhubspot\b/i],
  ['Salesforce', /\bsalesforce\b/i],
  ['Airtable', /\bairtable\b/i],
  ['Zapier', /\bzapier\b/i],
  ['Make', /\bmake\.com\b/i],
  ['Shopify', /\bshopify\b/i],
  ['Klaviyo', /\bklaviyo\b/i],
  ['Zendesk', /\bzendesk\b/i],
  ['Gorgias', /\bgorgias\b/i],
  ['Intercom', /\bintercom\b/i],
  ['Freshdesk', /\bfreshdesk\b/i],
  ['Ahrefs', /\bahrefs\b/i],
  ['Semrush', /\bsem\s?rush\b/i],
  ['Screaming Frog', /screaming\s?frog/i],
  ['Surfer', /\bsurfer\s?(seo)?\b/i],
  ['GA4', /\bga4\b|google analytics/i],
  ['Search Console', /search console|\bgsc\b/i],
  ['WordPress', /\bwordpress\b/i],
  ['Webflow', /\bwebflow\b/i],
  ['Canva', /\bcanva\b/i],
  ['Figma', /\bfigma\b/i],
  ['Calendly', /\bcalendly\b/i],
  ['Google Workspace', /google workspace|\bgsuite\b|g suite/i],
  ['QuickBooks', /\bquickbooks\b/i],
  ['Xero', /\bxero\b/i],
  ['Loom', /\bloom\b/i],
];

export function detectTools(listing: string) {
  return TOOLS.filter(([, re]) => re.test(listing)).map(([name]) => name).slice(0, 4);
}

/** Themes a letter can react to, so two listings in the same niche don't
 *  produce identical letters. */
const THEMES: [string, RegExp][] = [
  ['startup', /\bstartup|early[- ]stage|founder[- ]led|seed\b/i],
  ['agency', /\bagency|client accounts|multiple clients\b/i],
  ['ecommerce', /\becommerce|e-commerce|dtc|online store|shopify\b/i],
  ['saas', /\bsaas|b2b software|subscription\b/i],
  ['ai', /\bai\b|automation|gpt|chatgpt|claude/i],
  ['scale', /\bscal(e|ing)|grow(th|ing) fast|high volume\b/i],
];

function themes(listing: string) {
  return new Set(THEMES.filter(([, re]) => re.test(listing)).map(([t]) => t));
}

function list(items: string[]) {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

function plural(years: string) {
  return years === '1' ? 'year' : 'years';
}

function greeting(contact: string) {
  return contact ? `Hi ${contact},` : 'Hi there,';
}

function signoff(name: string, line: string) {
  return `${line}\n\n${name.trim() || 'Your name'}`;
}

function roleLine(role: string, company: string) {
  const r = role ? `the ${role} role` : 'this role';
  return company ? `${r} at ${company}` : r;
}

function toolLine(tools: string[], verb = 'I already work in') {
  return tools.length ? `${verb} ${list(tools)}, so nothing here needs a week of ramp-up. ` : '';
}

type Builder = (i: LetterInput) => string;

const BUILDERS: Record<Niche, Builder> = {
  /* ------------------------------------------------------------------ */
  general: (i) => {
    const tools = detectTools(i.listing);
    const t = themes(i.listing);
    const opener =
      i.headline.trim() ||
      `I've spent ${i.years} ${plural(i.years)} being the person small remote teams hand the messy stuff to.`;
    const context = t.has('startup')
      ? 'I know what an early-stage day looks like: the priority changes at 10am and the thing still has to ship.'
      : t.has('agency')
        ? 'I\'m used to juggling a few client accounts at once without letting any of them feel like the second priority.'
        : 'I like the work that keeps a business tidy: the follow-ups, the files, the things that go wrong quietly.';

    return `${greeting(i.contact)}

I read your post for ${roleLine(i.role, i.company)}. ${opener}

${context} ${toolLine(tools)}

What that looks like day to day:

- Inbox and calendar handled, with drafts ready for you to approve instead of write
- Research and admin turned around the same day, not "sometime this week"
- A short end-of-day note so you always know what moved and what's stuck

I work US hours and I'd rather ask one clarifying question up front than hand you something wrong. Happy to do a small paid trial task if that's easier than taking my word for it.

${signoff(i.name, 'Thanks for reading,')}`;
  },

  /* ------------------------------------------------------------------ */
  seo: (i) => {
    const tools = detectTools(i.listing);
    const t = themes(i.listing);
    const opener =
      i.headline.trim() ||
      `${i.years} ${plural(i.years)} in SEO, mostly for small sites that couldn't afford to waste a month on the wrong keywords.`;
    const angle = t.has('ecommerce')
      ? 'On ecommerce sites most of the win is boring: collection pages, internal links, and killing the duplicate variants eating the crawl budget.'
      : t.has('saas')
        ? 'For SaaS the traffic that converts is almost never the head term, so I build out the comparison and alternative pages people actually search before they buy.'
        : 'Most sites I pick up are losing to their own architecture before content is even the problem, so I audit first and write second.';

    return `${greeting(i.contact)}

Applying for ${roleLine(i.role, i.company)}. ${opener}

${angle} ${toolLine(tools, 'I run')}

Three things I've actually delivered:

- Took a client's money keywords from page three into the top five in under four months
- Fixed a technical audit backlog (indexation, redirects, thin pages) that unlocked traffic no new content would have
- Built briefs writers could follow without me rewriting the draft afterwards

I report in plain numbers: what ranked, what moved, what didn't and why. If it helps, send me a URL and I'll come back with the three things I'd change first, free.

${signoff(i.name, 'Thanks,')}`;
  },

  /* ------------------------------------------------------------------ */
  writer: (i) => {
    const tools = detectTools(i.listing);
    const t = themes(i.listing);
    const opener =
      i.headline.trim() ||
      `I've been writing content for ${i.years} ${plural(i.years)}, mostly long-form that has to earn its traffic.`;
    const angle = t.has('ai')
      ? 'I use AI the way most good writers do now: for research and outlines, never for the final draft. You can tell, and so can readers.'
      : 'I write to a brief and match an existing voice rather than importing my own, which usually means fewer rounds of edits.';

    return `${greeting(i.contact)}

I'd like to write for ${i.company || 'you'}${i.role ? ` as your ${i.role}` : ''}. ${opener}

${angle} ${toolLine(tools, 'I draft and publish in')}

How I work:

- Brief first: angle, audience, what the piece has to do. No surprises at draft stage
- First drafts land on schedule, and I take edits without getting precious
- I'll flag when a topic won't perform instead of writing it anyway to hit a quota

Samples are in my portfolio, and I'm happy to write one paid test piece on a topic you choose so you can judge the real thing instead of my best work.

${signoff(i.name, 'Thanks for reading,')}`;
  },

  /* ------------------------------------------------------------------ */
  ea: (i) => {
    const tools = detectTools(i.listing);
    const opener =
      i.headline.trim() ||
      `I've supported founders and executives for ${i.years} ${plural(i.years)}, the kind of support where you're trusted with the calendar and the awkward emails.`;

    return `${greeting(i.contact)}

I'm applying for ${roleLine(i.role, i.company)}. ${opener}

${toolLine(tools, 'I live in')}The part of this job that matters isn't the scheduling, it's the judgement: knowing which meeting can move, which email needs you personally, and which problem to solve without asking.

What you'd get:

- A calendar defended properly, including the gaps between things
- Inbox triaged daily, with replies drafted in your voice for a one-click send
- Travel, docs and follow-ups handled quietly, and discretion about everything I see

I work US hours and I'm reachable during them. If it's useful, give me one week of your real inbox rules and I'll show you rather than describe it.

${signoff(i.name, 'Thanks for your time,')}`;
  },

  /* ------------------------------------------------------------------ */
  support: (i) => {
    const tools = detectTools(i.listing);
    const t = themes(i.listing);
    const opener =
      i.headline.trim() ||
      `${i.years} ${plural(i.years)} on support queues, including the ones that got busy faster than they got staffed.`;
    const angle = t.has('ecommerce')
      ? 'Most ecommerce tickets are the same eight questions plus one genuinely angry person, and the second one decides your reviews.'
      : 'Most tickets are repeat questions, so I fix the macro and the help doc instead of answering the same thing forever.';

    return `${greeting(i.contact)}

Applying for ${roleLine(i.role, i.company)}. ${opener}

${angle} ${toolLine(tools, 'I know my way around')}

What I bring to a queue:

- Sub-two-hour first response held on a busy inbox, without canned answers that read like canned answers
- De-escalation that ends in a refund or a fix, not a thread with nine replies
- Notes back to the team on what keeps breaking, because support sees it first

I can cover US hours, weekends included if you need them. Send me three real tickets and I'll reply to them as a test.

${signoff(i.name, 'Thanks,')}`;
  },

  /* ------------------------------------------------------------------ */
  ops: (i) => {
    const tools = detectTools(i.listing);
    const t = themes(i.listing);
    const opener =
      i.headline.trim() ||
      `I've run operations for ${i.years} ${plural(i.years)}, mostly for small remote teams where I was the process and the person doing it.`;
    const angle = t.has('scale')
      ? "Growing fast usually breaks the same three things first: handoffs, reporting, and whoever's holding it all in their head. I document those before they break."
      : t.has('ai')
        ? 'I automate the repetitive parts, but only after the manual version works. Automating a broken process just makes it fail faster.'
        : 'I care less about tools than about whether a task can be handed to someone new without a 40-minute call.';

    return `${greeting(i.contact)}

I'm interested in ${roleLine(i.role, i.company)}. ${opener}

${angle} ${toolLine(tools, 'I build in')}

What I've built:

- SOPs and onboarding that let new VAs run a client account in their first week
- Reporting the team actually reads, because it answers one question instead of showing forty metrics
- A hiring and training loop I ran end to end, from job post to a person who's productive

I'd start by learning how things run now before changing anything. First thirty days: map it, find the two worst bottlenecks, fix one.

${signoff(i.name, 'Thanks for reading,')}`;
  },
};

export function buildLetter(niche: Niche, input: LetterInput) {
  return BUILDERS[niche](input).replace(/[ \t]+\n/g, '\n').trim();
}
