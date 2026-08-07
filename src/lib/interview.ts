/**
 * Interview prep question bank.
 *
 * Three shapes of question:
 *  - behavioral → the "tell me about a time" family, identical for every niche
 *  - technical  → the remote-work floor: internet, tools, security, hours
 *  - role       → keyed to a `Niche`, so the picker here matches the cover
 *                 letter builder and the course catalogue with no mapping table
 *
 * Everything on this page works with no account and no API key. The model is
 * only used for the optional written feedback, so the bank has to carry its own
 * weight: every question ships with why it gets asked and what a strong answer
 * actually contains.
 */

import { NICHES, type Niche } from './cover-letter-templates';

export type InterviewType = 'behavioral' | 'technical' | 'role';

export type InterviewTypeMeta = {
  id: InterviewType;
  label: string;
  blurb: string;
};

export const INTERVIEW_TYPES: InterviewTypeMeta[] = [
  {
    id: 'behavioral',
    label: 'Behavioural',
    blurb: 'Past-behaviour questions. Stories, not opinions.',
  },
  {
    id: 'technical',
    label: 'Remote basics',
    blurb: 'Internet, hours, tools, security. The screening round.',
  },
  {
    id: 'role',
    label: 'Role-specific',
    blurb: 'The questions only someone in your niche gets asked.',
  },
];

export type Question = {
  id: string;
  type: InterviewType;
  q: string;
  /** What the interviewer is actually testing. */
  why: string;
  /** Three things a strong answer contains. */
  looksFor: string[];
};

/* ------------------------------------------------------------------ */
/* Behavioural — asked in almost every VA interview                    */
/* ------------------------------------------------------------------ */

const BEHAVIORAL: Question[] = [
  {
    id: 'b-about',
    type: 'behavioral',
    q: 'Tell me about yourself.',
    why: 'They want a 60-second trailer for the role in front of them, not your life story. Most candidates lose the interview here by starting at birth.',
    looksFor: [
      'Present, past, plan: what you do now, the experience behind it, why this role next',
      'Under 90 seconds, no family background, no birthplace',
      'One concrete number or client type so it stops sounding generic',
    ],
  },
  {
    id: 'b-remote',
    type: 'behavioral',
    q: 'Why do you want to work remotely?',
    why: 'They are screening for someone who wants the work, not just the setup. "Flexible hours" answers make them nervous about reliability.',
    looksFor: [
      'A reason about the work itself, not only the commute or the schedule',
      'Evidence you have already done it, with the habits to prove it',
      'No hint that this is a fallback until something local turns up',
    ],
  },
  {
    id: 'b-multi',
    type: 'behavioral',
    q: 'How do you handle multiple clients at once?',
    why: 'They are asking whether they will have to chase you, and whether their work quietly becomes the one that slips.',
    looksFor: [
      'A named system: the tool, the daily review, how a task gets captured',
      'How you decide what goes first when two people both say urgent',
      'What you do when the honest answer is that something will be late',
    ],
  },
  {
    id: 'b-mistake',
    type: 'behavioral',
    q: 'Tell me about a mistake you made with a client.',
    why: 'The mistake is not the test. Whether you noticed it yourself, told them early, and changed something afterwards is the test.',
    looksFor: [
      'A real mistake with real consequences, not a humblebrag about perfectionism',
      'You raised it before they found it',
      'The specific change that stopped it happening twice',
    ],
  },
  {
    id: 'b-feedback',
    type: 'behavioral',
    q: 'Tell me about a time you got hard feedback. What did you do with it?',
    why: 'Remote work runs on written feedback with no tone attached. They need to know criticism lands as information, not as an attack.',
    looksFor: [
      'The actual words of the feedback, not a summary of how it felt',
      'What you changed in the next week, concretely',
      'No defending yourself mid-story',
    ],
  },
  {
    id: 'b-unclear',
    type: 'behavioral',
    q: 'Your client gives you a task with almost no instructions. What do you do?',
    why: 'The wrong answers are "guess and hope" and "wait until they explain". They want the middle path.',
    looksFor: [
      'You batch your questions instead of pinging six times',
      'You propose an approach and ask them to confirm, rather than asking open questions',
      'You show a small piece early instead of finishing the whole thing wrong',
    ],
  },
  {
    id: 'b-deadline',
    type: 'behavioral',
    q: 'Two clients need something by the same deadline. Walk me through it.',
    why: 'They are testing whether you communicate before the deadline or apologise after it.',
    looksFor: [
      'You tell someone early, before it becomes their emergency',
      'A stated basis for the call: contracted hours, business impact, who asked first',
      'A concrete alternative offered, not just a no',
    ],
  },
  {
    id: 'b-difficult',
    type: 'behavioral',
    q: 'Tell me about a difficult client and how you handled it.',
    why: 'Half of this is a character check. Anyone who trashes a previous client will trash them next.',
    looksFor: [
      'The situation described neutrally, without villainising anyone',
      'What you tried, in order, before escalating',
      'A specific boundary or process you set up as a result',
    ],
  },
  {
    id: 'b-alone',
    type: 'behavioral',
    q: 'How do you stay motivated with nobody watching you?',
    why: 'They have been burned by someone who went quiet in week three. They want your structure, not your enthusiasm.',
    looksFor: [
      'Actual routine: start time, shutdown, how the day gets planned',
      'How your client can see progress without asking for it',
      'What you do on a low-energy day, honestly',
    ],
  },
  {
    id: 'b-initiative',
    type: 'behavioral',
    q: 'Tell me about something you improved that nobody asked you to improve.',
    why: 'This is the question that separates a task-taker from someone worth a raise. Most people have an answer and forget to tell it.',
    looksFor: [
      'The problem you spotted before anyone reported it',
      'What you built or changed, in one sentence',
      'The saved time or money, even if it is a rough number',
    ],
  },
  {
    id: 'b-strength',
    type: 'behavioral',
    q: 'What is your biggest weakness?',
    why: 'They are not looking for a confession. They are checking self-awareness and whether you have already built a workaround.',
    looksFor: [
      'A real weakness that is not central to this job',
      'The system you use to manage it, described plainly',
      'No "I care too much" or "I work too hard"',
    ],
  },
  {
    id: 'b-why-us',
    type: 'behavioral',
    q: 'Why do you want to work with us specifically?',
    why: 'They can tell in five seconds whether you read the job post or applied to forty in an afternoon.',
    looksFor: [
      'One specific detail about their business, product, or customers',
      'The link between that detail and what you actually do well',
      'Nothing that would be true of any client on earth',
    ],
  },
  {
    id: 'b-rate',
    type: 'behavioral',
    q: 'What are your rate expectations?',
    why: 'Flinching here costs more money than any other 20 seconds of the process.',
    looksFor: [
      'A number said plainly, with no apology after it',
      'A range whose bottom you would genuinely accept',
      'A one-line reason tied to scope or results, then silence',
    ],
  },
  {
    id: 'b-questions',
    type: 'behavioral',
    q: 'Do you have any questions for us?',
    why: 'Saying no reads as no interest. This is also your only chance to screen them before you take the job.',
    looksFor: [
      'A question about how success is measured in the first 90 days',
      'A question about how they communicate and review work',
      'Nothing you could have answered by reading the job post',
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Technical — the remote-work screening round                         */
/* ------------------------------------------------------------------ */

const TECHNICAL: Question[] = [
  {
    id: 't-setup',
    type: 'technical',
    q: 'Describe your internet and backup setup.',
    why: 'For a Philippine-based hire this is often the single question that decides the shortlist. Vagueness gets read as no backup.',
    looksFor: [
      'Named provider and actual speeds, download and upload',
      'A real second option: mobile data, a second ISP, a nearby co-working spot',
      'What happens in a brownout, including how long the power holds',
    ],
  },
  {
    id: 't-timezone',
    type: 'technical',
    q: 'Can you work our hours? How do you handle the time difference?',
    why: 'They want a commitment they can plan around, not "I am flexible".',
    looksFor: [
      'The exact hours you will be online, in their timezone',
      'Proof you have already done that shift, not just willingness',
      'Your response-time promise for anything outside those hours',
    ],
  },
  {
    id: 't-tools',
    type: 'technical',
    q: 'Which tools do you use every day, and how deep do you go?',
    why: 'Everyone lists ten tools. They are listening for the difference between opening an app and running it.',
    looksFor: [
      'Three or four tools you actually know well, not a wall of logos',
      'One thing you can do in each that a beginner cannot',
      'Honesty about the ones you have only touched',
    ],
  },
  {
    id: 't-learn',
    type: 'technical',
    q: 'We use a tool you have never seen. How fast can you pick it up?',
    why: 'The stack always changes. They want your learning method, with evidence it has worked before.',
    looksFor: [
      'A named tool you learned recently and how long it took',
      'Your method: docs, a sandbox account, a test task, help centre',
      'What you do at the point where you would rather ask than guess',
    ],
  },
  {
    id: 't-security',
    type: 'technical',
    q: 'How do you handle client passwords and confidential files?',
    why: 'You are being handed access to their money and their customers. A sloppy answer ends the interview.',
    looksFor: [
      'A password manager named, with sharing done through it',
      '2FA on, and no credentials in chat, email, or a spreadsheet',
      'Who else can physically use your computer, and what you do about it',
    ],
  },
  {
    id: 't-hours',
    type: 'technical',
    q: 'How do you track and report your hours?',
    why: 'Billing disputes kill contracts. They want to see this is already solved.',
    looksFor: [
      'A named tracker, or a clear approach if you charge a flat monthly rate',
      'What granularity your log shows, so the invoice is readable',
      'How you handle work that ran over the estimate',
    ],
  },
  {
    id: 't-report',
    type: 'technical',
    q: 'What does your daily or weekly update to a client look like?',
    why: 'Remote clients pay for visibility as much as output. A vague answer here suggests they will be chasing you.',
    looksFor: [
      'The format and the cadence, stated exactly',
      'Done, in progress, blocked, and what you need from them',
      'That it goes out whether or not they asked for it',
    ],
  },
  {
    id: 't-ai',
    type: 'technical',
    q: 'Do you use AI tools in your work?',
    why: 'In 2026 "no" sounds slow and "for everything" sounds risky. They want a judgement answer.',
    looksFor: [
      'Where you use it and where you deliberately do not',
      'How you check the output before it reaches a client',
      'Awareness that client data does not go into random tools',
    ],
  },
  {
    id: 't-workspace',
    type: 'technical',
    q: 'Tell me about your equipment and workspace.',
    why: 'Interviews and client calls happen on camera. They are picturing the background behind you already.',
    looksFor: [
      'Machine specs, headset, second screen if you have one',
      'A quiet room, or exactly what you do about noise',
      'Backup power and how long it lasts',
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Role-specific — one small set per niche                             */
/* ------------------------------------------------------------------ */

const roleQ = (niche: Niche, n: number, q: string, why: string, looksFor: string[]): Question => ({
  id: `r-${niche}-${n}`,
  type: 'role',
  q,
  why,
  looksFor,
});

const ROLE: Record<Niche, Question[]> = {
  general: [
    roleQ('general', 1, 'How would you clear an inbox with 400 unread emails?', 'They want a system, not stamina.', [
      'A triage pass first: labels or folders before any replying',
      'What you answer yourself versus what you flag for them',
      'The rules you set so it never rebuilds to 400',
    ]),
    roleQ('general', 2, 'How do you decide what needs the client and what does not?', 'The whole value of a VA is fewer decisions landing on their desk.', [
      'A stated line: money, external commitments, anything irreversible',
      'How you propose instead of asking open questions',
      'How that line moves once trust is built',
    ]),
    roleQ('general', 3, 'Walk me through how you would research something for us.', 'Research tasks are where padding shows up fastest.', [
      'How you scope it before starting so you do not overwork it',
      'What the deliverable looks like: a sheet, a summary, a recommendation',
      'How you cite sources so they can check your work',
    ]),
  ],
  ea: [
    roleQ('ea', 1, 'Two meetings collide on my calendar. What do you do?', 'Calendar judgement is the job. They want to know you will not just ask them.', [
      'How you rank by who is external, who is senior, what is reschedulable',
      'You move one and tell them, rather than asking which to move',
      'The buffer and travel time you protect around it',
    ]),
    roleQ('ea', 2, 'How do you gatekeep without upsetting people?', 'Executives need a filter with manners.', [
      'A holding reply that keeps the door open',
      'What always gets through, agreed in advance',
      'How you keep the tone theirs, not yours',
    ]),
    roleQ('ea', 3, 'You are drafting emails as me. How do you get my voice right?', 'Writing as someone else is the trust cliff of the role.', [
      'You read a batch of their sent mail before writing anything',
      'A review period before you send anything unsupervised',
      'Where you deliberately keep it shorter than they would',
    ]),
    roleQ('ea', 4, 'What would you do in your first week here?', 'They want to see you can start without being managed.', [
      'Access, tools, and recurring meetings mapped first',
      'A pass through the calendar and inbox to find the patterns',
      'One small visible improvement by Friday',
    ]),
  ],
  support: [
    roleQ('support', 1, 'A customer is angry and technically wrong. Write the reply.', 'Tone under pressure is the entire skill.', [
      'Acknowledge the frustration before correcting anything',
      'The correction stated as information, never as a win',
      'A next step that gives them something to do',
    ]),
    roleQ('support', 2, 'What response and resolution times have you held?', 'Support hires get measured. Anyone without numbers looks new.', [
      'First response and full resolution stated separately',
      'Ticket volume per day so the numbers have scale',
      'What you did when a queue got away from you',
    ]),
    roleQ('support', 3, 'When do you escalate instead of solving it yourself?', 'They fear both extremes: escalating everything and nothing.', [
      'A clear trigger list: refunds over an amount, bugs, legal, threats',
      'What you hand over so the next person does not restart',
      'What you tell the customer while it is in flight',
    ]),
    roleQ('support', 4, 'How do you keep macros from sounding robotic?', 'Canned replies are why support feels bad.', [
      'One personalised line before the template body',
      'How often you audit and rewrite the macro set',
      'Which situations never get a macro',
    ]),
  ],
  data: [
    roleQ('data', 1, 'How do you keep accuracy up on a 5,000-row job?', 'Speed claims are cheap. Verification is the answer.', [
      'Validation at entry: dropdowns, formats, required fields',
      'A spot-check or double-entry pass with a stated sample size',
      'Your actual error rate, if you know it',
    ]),
    roleQ('data', 2, 'You find duplicates and conflicting records. Now what?', 'They are testing whether you make silent judgement calls on their data.', [
      'You quantify the problem before touching anything',
      'A rule proposed and confirmed, not applied quietly',
      'A backup or change log so it can be undone',
    ]),
    roleQ('data', 3, 'What repetitive data work have you automated?', 'This is where a data VA becomes worth double.', [
      'A named formula, script, or tool, and what it replaced',
      'Hours saved per week',
      'How you knew the automated output was right',
    ]),
  ],
  realestate: [
    roleQ('realestate', 1, 'Walk me through how you handle a new lead.', 'Speed to lead decides the commission.', [
      'Your response-time target in minutes, not hours',
      'What goes into the CRM and when',
      'The follow-up cadence and where you stop',
    ]),
    roleQ('realestate', 2, 'How do you keep a listing accurate across every platform?', 'Wrong data on a listing is a compliance problem, not a typo.', [
      'A single source of truth and how it syncs out',
      'Your check before anything goes live',
      'How price and status changes propagate',
    ]),
    roleQ('realestate', 3, 'A transaction is missing a document three days before closing. What do you do?', 'They want to see chasing that stays polite and relentless.', [
      'A checklist that would have flagged it earlier',
      'Who you contact, in what order, on what channel',
      'What you escalate to the agent and when',
    ]),
  ],
  seo: [
    roleQ('seo', 1, 'Traffic dropped 30% last month. How do you diagnose it?', 'This separates people who ran SEO from people who read about it.', [
      'Check for an algorithm update, a tracking break, and a technical change before panicking',
      'Segment by page, query, and device rather than staring at the total',
      'Ruling out seasonality with a year-on-year comparison',
    ]),
    roleQ('seo', 2, 'How do you pick keywords for a brand new site?', 'They want to hear intent and difficulty, not just volume.', [
      'Difficulty weighed against the site\u2019s actual authority',
      'Intent grouped so pages do not compete with each other',
      'A first target that can realistically rank this quarter',
    ]),
    roleQ('seo', 3, 'What is the last technical fix you shipped, and what did it move?', 'Audits are easy to produce and easy to ignore. Shipped fixes are the proof.', [
      'The specific issue, named precisely',
      'What you changed and who implemented it',
      'The measured result, with a timeframe',
    ]),
    roleQ('seo', 4, 'How are you handling AI search and citations?', 'Anyone still quoting only blue-link rankings in 2026 sounds behind.', [
      'How you track whether the brand gets cited in AI answers',
      'What you change on-page for it',
      'Honesty about what is still uncertain',
    ]),
  ],
  writer: [
    roleQ('writer', 1, 'How do you match a brand voice you have never written in?', 'Voice matching is the difference between a writer and a content mill.', [
      'You build a short voice guide from their existing work first',
      'Specific markers you copy: sentence length, contractions, jargon level',
      'A sample sent early for correction before you write ten pieces',
    ]),
    roleQ('writer', 2, 'A client says the draft is not what they wanted. How do you respond?', 'They are watching your ego.', [
      'You ask for one example of what right looks like',
      'A rewrite, not a defence of the first version',
      'What you change in the brief so it stops recurring',
    ]),
    roleQ('writer', 3, 'How do you use AI in your writing?', 'The honest answer is expected. The unexamined one is disqualifying.', [
      'Where it helps: outlines, research, angles',
      'What you always write yourself',
      'How you strip the tells before it goes out',
    ]),
    roleQ('writer', 4, 'How do you research a topic you know nothing about?', 'Most VA writing work is in industries you have never touched.', [
      'Primary sources and practitioners, not the top ten blog posts',
      'A question list sent to the client or an internal expert',
      'How you flag anything you could not verify',
    ]),
  ],
  social: [
    roleQ('social', 1, 'Which metric do you actually optimise for, and why?', 'Follower-count answers get filtered out immediately.', [
      'Saves, shares, or replies over vanity numbers, with a reason',
      'The link from that metric to the client\u2019s revenue',
      'What you would stop measuring',
    ]),
    roleQ('social', 2, 'A post gets a wave of negative comments. What do you do?', 'Crisis judgement, live, in public.', [
      'What you reply to, hide, or leave alone, and the rule behind it',
      'When you wake the client up',
      'Whether the post stays up, and why',
    ]),
    roleQ('social', 3, 'How do you build a month of content without running dry?', 'They want a repeatable engine, not a burst of inspiration.', [
      'Pillars or buckets, with a rough ratio',
      'Where the raw material comes from every week',
      'Your batching and scheduling rhythm',
    ]),
    roleQ('social', 4, 'Show me a post that flopped. Why did it flop?', 'Anyone who only has wins has not been analysing.', [
      'The hook or format diagnosed specifically',
      'What the data said versus what you assumed',
      'The change you made next',
    ]),
  ],
  email: [
    roleQ('email', 1, 'Open rates fell off a cliff. Where do you look first?', 'Deliverability knowledge is the moat in this niche.', [
      'Authentication, sender reputation, and list hygiene before creative',
      'Whether the drop lines up with a provider change or a big send',
      'Segmenting out the inactive portion of the list',
    ]),
    roleQ('email', 2, 'Which flows would you build first for a new ecommerce client?', 'They want priority order and revenue reasoning.', [
      'Welcome, abandoned checkout, post-purchase, in a defended order',
      'Expected share of email revenue from flows versus campaigns',
      'What you would test first inside them',
    ]),
    roleQ('email', 3, 'How do you decide what to A/B test?', 'Subject-line-only testers plateau fast.', [
      'Testing the thing with the biggest lever, not the easiest one',
      'Sample size and how long you let it run',
      'What you do with a result that is not significant',
    ]),
  ],
  sales: [
    roleQ('sales', 1, 'How do you build a prospect list from nothing?', 'Scraping anything with an email address is the wrong answer.', [
      'An ICP defined before any list building starts',
      'Named sources and how you verify the emails',
      'Your bounce rate, and what you do to keep it low',
    ]),
    roleQ('sales', 2, 'Write me the first line of a cold email to our ICP.', 'Personalisation at scale is the entire skill.', [
      'A specific observation about them, not a compliment',
      'Under 20 words, no "I hope this finds you well"',
      'A reason it could only have been sent to that person',
    ]),
    roleQ('sales', 3, 'How many touches before you drop a prospect?', 'They want a sequence, not persistence as a personality trait.', [
      'A stated number and channel mix',
      'How the message changes across the sequence',
      'A clean break-up message at the end',
    ]),
  ],
  design: [
    roleQ('design', 1, 'Walk me through one piece in your portfolio.', 'The brief and the constraints matter more than the pixels.', [
      'The problem and the constraint you were designing against',
      'The choice you made and the option you rejected',
      'What happened when it went live',
    ]),
    roleQ('design', 2, 'A client keeps asking for revisions. How do you handle it?', 'Scope control is the survival skill in design work.', [
      'How many rounds are agreed up front',
      'How you turn vague feedback into a specific change',
      'When and how you raise that it is now extra work',
    ]),
    roleQ('design', 3, 'How fast can you turn around a set of ad creatives?', 'Volume with consistency is what ecommerce clients buy.', [
      'A real number, with the variables that change it',
      'Templates or components that make speed possible',
      'What you refuse to rush',
    ]),
  ],
  video: [
    roleQ('video', 1, 'What makes a hook work in the first three seconds?', 'Retention is the only currency here.', [
      'A specific technique, not "make it interesting"',
      'Reference to retention data you have actually seen',
      'How the hook changes by platform',
    ]),
    roleQ('video', 2, 'What is your turnaround for a 60-second short?', 'They are pricing their content calendar against your speed.', [
      'Hours stated, including captions and revisions',
      'Your project and asset organisation',
      'How many you can hold per week without quality dropping',
    ]),
    roleQ('video', 3, 'How do you handle raw footage that is genuinely bad?', 'Editors who only make good footage look good are limited.', [
      'What you can rescue in post, honestly',
      'When you tell the client to reshoot',
      'A shot-list or guidance you give to stop it recurring',
    ]),
  ],
  ops: [
    roleQ('ops', 1, 'Walk me through an SOP you wrote and what changed after it.', 'Ops is judged on what still works when you are not there.', [
      'The process before, in numbers or failures',
      'How the SOP gets used and kept current',
      'The measured change: time, errors, or handover speed',
    ]),
    roleQ('ops', 2, 'How do you onboard and train a new VA?', 'Managing people remotely is the part most candidates fake.', [
      'A first-week plan with checkpoints',
      'How competence gets verified, not assumed',
      'What you do in week two if it is not working',
    ]),
    roleQ('ops', 3, 'Something is broken in the process but nobody has complained. How do you find it?', 'Proactive ops versus reactive ops.', [
      'What you look at: cycle times, rework, the same question asked twice',
      'How you size the problem before pitching a fix',
      'How you get buy-in to change it',
    ]),
    roleQ('ops', 4, 'How do you decide what to automate?', 'Automating the wrong thing is expensive.', [
      'Frequency times time saved, against build cost',
      'What you deliberately leave manual',
      'What happens when the automation breaks',
    ]),
  ],
  pm: [
    roleQ('pm', 1, 'A project is going to miss its date. When and how do you say so?', 'Everything about PM reduces to this question.', [
      'Early, at the point the slip becomes likely, not certain',
      'Options presented with their trade-offs',
      'A revised date you are willing to be held to',
    ]),
    roleQ('pm', 2, 'How do you chase people without becoming annoying?', 'Chasing is most of the job and most of the friction.', [
      'The cadence and channel agreed with people up front',
      'How you make the ask small and specific',
      'When you go to their manager, and how you frame it',
    ]),
    roleQ('pm', 3, 'A stakeholder keeps adding to the scope. What do you do?', 'They want a no that keeps the relationship.', [
      'The change written down and sized in time or money',
      'A trade offered: this in, that out',
      'Who decides, and how fast',
    ]),
  ],
  bookkeeping: [
    roleQ('bookkeeping', 1, 'Walk me through your month-end close.', 'A vague close means they will not trust you with the books.', [
      'The sequence and the working days it takes',
      'What gets reconciled and against what',
      'The review step before anything is reported',
    ]),
    roleQ('bookkeeping', 2, 'You find a transaction you cannot categorise. What happens?', 'Guessing here compounds into a bad year-end.', [
      'A suspense or holding account rather than a guess',
      'How you batch queries so the client answers ten at once',
      'How you record the decision so it is consistent next time',
    ]),
    roleQ('bookkeeping', 3, 'How do you handle a discrepancy you think the client caused?', 'Delicacy plus accuracy.', [
      'Evidence assembled before the conversation',
      'Neutral framing that does not accuse',
      'The control you propose so it stops',
    ]),
  ],
  web: [
    roleQ('web', 1, 'The site is slow. How do you find out why?', 'They want a method, not a plugin recommendation.', [
      'Measurement first: a named tool and the metric you look at',
      'Images, scripts, server response, ranked by likely impact',
      'What you would fix first and why',
    ]),
    roleQ('web', 2, 'How do you deploy a change without breaking the live site?', 'Cowboy deploys are the reason clients stop trusting developers.', [
      'A staging environment and a backup before anything ships',
      'What you check immediately after deploying',
      'Your rollback plan',
    ]),
    roleQ('web', 3, 'A client asks for a feature you have never built. How do you answer?', 'Honesty plus capability, in one answer.', [
      'What you already know that transfers',
      'A time-boxed spike before you quote',
      'A range with the uncertainty stated, not a confident wrong number',
    ]),
  ],
  ecommerce: [
    roleQ('ecommerce', 1, 'How would you handle a spike of orders on a sale day?', 'Peak days are when a store VA earns their fee.', [
      'What you prepare before the day, not during it',
      'Priority order: fulfilment issues, payment failures, then everything else',
      'When you pull in help',
    ]),
    roleQ('ecommerce', 2, 'What makes a product listing convert?', 'They want commercial judgement, not a checklist copied from a blog.', [
      'The first image and the first line, specifically',
      'Objections handled in the description',
      'What you would test first on an underperforming listing',
    ]),
    roleQ('ecommerce', 3, 'How do you handle returns and refunds?', 'Policy consistency protects margin and reviews.', [
      'What you approve without asking, and the ceiling on that',
      'How you keep the customer from leaving a bad review anyway',
      'The pattern you watch for in return reasons',
    ]),
  ],
};

/* ------------------------------------------------------------------ */
/* Selection                                                           */
/* ------------------------------------------------------------------ */

export const ROLES = NICHES;

export function questionsFor(niche: Niche, type: InterviewType): Question[] {
  if (type === 'behavioral') return BEHAVIORAL;
  if (type === 'technical') return TECHNICAL;
  return ROLE[niche] ?? [];
}

export function questionCount(niche: Niche, type: InterviewType) {
  return questionsFor(niche, type).length;
}

export const TOTAL_QUESTIONS =
  BEHAVIORAL.length + TECHNICAL.length + Object.values(ROLE).reduce((n, set) => n + set.length, 0);

/* ------------------------------------------------------------------ */
/* Local answer metrics — no key, no network, instant                  */
/* ------------------------------------------------------------------ */

/** Spoken-answer pace used to turn a word count into a rough duration. */
const WORDS_PER_MINUTE = 130;

const FILLERS = [
  'um', 'uh', 'erm', 'ah', 'like', 'basically', 'actually', 'literally',
  'honestly', 'kinda', 'sorta', 'stuff', 'things', 'whatever', 'ano', 'kasi',
];

const HEDGES = [
  'i think', 'i guess', 'maybe', 'sort of', 'kind of', 'i feel like',
  'probably', 'a little bit', 'just', 'hopefully', 'i would say',
];

export type AnswerMetrics = {
  words: number;
  seconds: number;
  fillers: { word: string; count: number }[];
  hedges: { phrase: string; count: number }[];
  hasNumber: boolean;
  /** 'short' | 'good' | 'long' against a 60-90 second target. */
  length: 'short' | 'good' | 'long';
};

export function answerMetrics(text: string): AnswerMetrics {
  const clean = text.trim();
  const words = clean ? clean.split(/\s+/).length : 0;
  const seconds = Math.round((words / WORDS_PER_MINUTE) * 60);
  const lower = ` ${clean.toLowerCase().replace(/[^a-z0-9\s']/g, ' ').replace(/\s+/g, ' ')} `;

  const fillers = FILLERS
    .map((word) => ({ word, count: (lower.match(new RegExp(`\\s${word}\\s`, 'g')) ?? []).length }))
    .filter((f) => f.count > 0)
    .sort((a, b) => b.count - a.count);

  const hedges = HEDGES
    .map((phrase) => ({ phrase, count: (lower.match(new RegExp(`\\s${phrase}\\s`, 'g')) ?? []).length }))
    .filter((h) => h.count > 0)
    .sort((a, b) => b.count - a.count);

  return {
    words,
    seconds,
    fillers,
    hedges,
    hasNumber: /\d/.test(clean),
    length: words < 70 ? 'short' : words > 260 ? 'long' : 'good',
  };
}

/* ------------------------------------------------------------------ */
/* Feedback payload shape, shared by the route and the page            */
/* ------------------------------------------------------------------ */

export type Feedback = {
  score: number;
  verdict: string;
  strengths: string[];
  fixes: { issue: string; fix: string }[];
  rewrite: string;
};
