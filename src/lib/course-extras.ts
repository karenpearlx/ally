/**
 * Everything a course has that is not prose.
 *
 * Kept out of courses.ts so the lesson text stays readable. `courses.ts`
 * imports EXTRAS and folds it into each Course at module load, so consumers
 * only ever see one merged object.
 *
 * `checklists` is index-aligned to the course's lessons array. scripts/check-extras.mjs
 * fails the build if that alignment ever slips.
 */

export type QuizQuestion = {
  question: string;
  options: string[];
  /** Index into options. */
  correct: number;
  /** Shown after answering, right or wrong. */
  why: string;
};

export type TemplateRef = {
  name: string;
  /** Path under /public. */
  path: string;
  note: string;
};

export type PracticeProject = {
  title: string;
  brief: string;
  steps: string[];
  sampleData?: string;
  /** Template that pairs with the project, if any. */
  template?: TemplateRef;
};

export type ClientLooksFor = {
  /** Anonymised job title as posted. */
  title: string;
  /** Where it came from, roughly. */
  source: string;
  /** Quoted-ish lines from the post. */
  post: string[];
  /** What the post is really asking for. */
  reads: string[];
};

export type Walkthrough = {
  tool: string;
  goal: string;
  steps: string[];
  /** Where a screenshot goes when we have one. */
  screenshot?: string;
};

export type CourseExtras = {
  /** One array of items per lesson, same order as `lessons`. */
  checklists: string[][];
  quiz: QuizQuestion[];
  templates?: TemplateRef[];
  practiceProject: PracticeProject;
  clientLooksFor?: ClientLooksFor[];
  walkthroughs?: Walkthrough[];
};

/* ------------------------------------------------------------------ */
/* Shared template refs                                                */
/* ------------------------------------------------------------------ */

export const T_COVER: TemplateRef = {
  name: "Cover letter templates",
  path: "/templates/ally-cover-letter-templates.docx",
  note: "Six openers, including one for “no client experience yet”.",
};

export const T_RATE: TemplateRef = {
  name: "Rate calculator",
  path: "/templates/ally-rate-calculator.xlsx",
  note: "Type your take-home; it gives you an hourly floor plus 2026 market ranges.",
};

export const T_CONTRACT: TemplateRef = {
  name: "VA service agreement",
  path: "/templates/ally-va-service-agreement.docx",
  note: "One page, ten clauses. Fill the brackets and send it yourself.",
};

export const T_INVOICE: TemplateRef = {
  name: "Invoice + payment log",
  path: "/templates/ally-invoice-template.xlsx",
  note: "Invoice sheet plus a log that totals what is still unpaid.",
};

export const T_REPORT: TemplateRef = {
  name: "Monthly client report",
  path: "/templates/ally-client-report-template.xlsx",
  note: "Five numbers, one paragraph, three next steps. Includes practice data.",
};

export const T_SOP: TemplateRef = {
  name: "SOP template",
  path: "/templates/ally-sop-template.docx",
  note: "Write a process a stranger could run without you.",
};

/* ------------------------------------------------------------------ */
/* Per-course extras, keyed by slug                                    */
/* ------------------------------------------------------------------ */

export const EXTRAS: Record<string, CourseExtras> = {
  "complete-va-starter": {
    checklists: [
      [
        "Open twenty live job posts and copy every recurring task into one list.",
        "Mark each task: can do today, could learn in a month, would not enjoy.",
        "Write one sentence naming the kind of VA you are going to be.",
      ],
      [
        "Pick one niche and write the promise version of it in under twelve words.",
        "Find three things you already do that count as evidence for that niche.",
        "Search the board for that niche and note the pay range you actually see.",
      ],
      [
        "Run a speed test on your main line and screenshot it.",
        "Name your backup connection, and test it by working an hour on it.",
        "Price a UPS and a headset with a boom mic; buy the cheaper gap first.",
      ],
      [
        "Photograph your call setup as the camera sees it, then fix the worst thing.",
        "Write your outage plan in five lines: power, internet, how fast you return, where you message from.",
        "Save that plan somewhere you can paste it into a first-day message.",
      ],
      [
        "Decide the shift you can actually sustain for six months and write it down.",
        "Pick the four overlap hours you would offer a US client.",
        "Block one full day off in your calendar and name it something you would not cancel.",
      ],
      [
        "Fill the service agreement template with your real name, rate, and notice period.",
        "Set an invoice date and put it in your calendar as a repeating event.",
        "Compare Wise and Payoneer on total landed cost for one sample payment.",
      ],
      [
        "Check whether the 8% option or graduated rates is cheaper on your expected income.",
        "List the documents you need for BIR registration as a self-employed professional.",
        "Book one hour with an accountant, or write down the date you will.",
      ],
      [
        "Draft the access list you will ask for on day one.",
        "Choose the one recurring task you will fully own by week two.",
        "Write the five-line month-one summary now, with blanks, so you cannot forget to send it.",
      ],
    ],
    quiz: [
      {
        question: "You have a month before you want to be earning. Which niche should you pick?",
        options: [
          "The one with the highest average rate on the salary guides",
          "One you can show proof of within a month",
          "General admin, because there are more listings",
          "Whichever the newest course is about",
        ],
        correct: 1,
        why: "Rate ceilings do not matter if you cannot get hired into them. Proof in week two beats theory in month six, and you can climb later.",
      },
      {
        question: "What is the realistic minimum internet setup for full-time remote work?",
        options: [
          "Any connection that loads video",
          "One fiber line at 25 Mbps or better",
          "A fiber line plus a backup on a different provider",
          "Fiber plus two backups plus a generator",
        ],
        correct: 2,
        why: "One line is one outage away from a missed call. The backup has to be a different provider, or the same area fault takes both down.",
      },
      {
        question: "A client will not put the payment date in writing. What does that tell you?",
        options: [
          "Nothing, most small clients are informal",
          "That they are testing whether you trust them",
          "Something useful about how the first invoice will go",
          "That you should ask for double the rate",
        ],
        correct: 2,
        why: "Refusing to name a number and a date is information, not an oversight. Take the job if you want, but take a deposit with it.",
      },
      {
        question: "Why register with BIR if all your clients are overseas?",
        options: [
          "Foreign income is taxed at a higher rate otherwise",
          "Because a COR and real income documents unlock loans, rent, and bank accounts",
          "Clients ask for it before signing",
          "It is optional and mostly pointless",
        ],
        correct: 1,
        why: "The practical argument beats the fear one. Undeclared income is invisible income, and invisible income cannot buy a car or rent a place without a payslip.",
      },
      {
        question: "Week four with a new client. What is the highest-value thing you can send?",
        options: [
          "A request for a raise",
          "A five-line summary of what changed since you arrived",
          "A list of everything still broken",
          "Nothing, let the work speak",
        ],
        correct: 1,
        why: "Clients do not track your contribution as carefully as you do. Hand them the receipts in five lines, monthly, forever.",
      },
    ],
    templates: [T_CONTRACT, T_INVOICE, T_SOP],
    practiceProject: {
      title: "Set yourself up as a business in one afternoon",
      brief:
        "Not a hypothetical. By the end you should have a contract with your name on it, an invoice you could send tomorrow, and one written process. This is the paperwork that makes you look like a company instead of a person who is hoping.",
      steps: [
        "Fill the service agreement completely for an imaginary client at your target rate. No brackets left.",
        "Fill the invoice for one month of that work, including one line of extra hours.",
        "Write one SOP for a process you already run — even a personal one, like your weekly job-search routine.",
        "Write your outage plan and paste it at the end of the SOP file.",
        "Read the contract back and find the clause you would be uncomfortable enforcing. That is the one to practise saying out loud.",
      ],
      template: T_CONTRACT,
    },
    clientLooksFor: [
      {
        title: "Virtual Assistant — Full Time, US Hours",
        source: "OnlineJobs.ph, typical general listing",
        post: [
          "Must be available 9am–6pm EST, non-negotiable.",
          "Backup internet required. Please state your provider and speed.",
          "Tasks: inbox, calendar, research, light bookkeeping, whatever else comes up.",
        ],
        reads: [
          "“Whatever else comes up” means the scope is undefined; get it defined in the interview or price for it.",
          "They have been burned by outages before. Leading with your speed test and backup plan answers the fear they did not say out loud.",
          "Non-negotiable hours means the shift is the job. Decide before you apply whether you can hold it for six months.",
        ],
      },
      {
        title: "Executive Support / Ops Generalist for Founder",
        source: "RemoteOK, small startup",
        post: [
          "You will be the first hire supporting a founder who is drowning.",
          "We move fast and documentation is thin.",
          "Comfortable with ambiguity, proactive, no hand-holding.",
        ],
        reads: [
          "Thin documentation is your opening: the person who writes the first SOPs becomes hard to replace.",
          "“No hand-holding” means nobody will onboard you. Bring your own week-one plan and ask for access, not instructions.",
          "First hire means the role will change. Negotiate a review at ninety days, not a fixed job description.",
        ],
      },
    ],
  },

  "applications-that-get-replies": {
    checklists: [
      [
        "Time yourself reading your own last application. If it takes over eight seconds to find the point, rewrite it.",
        "Delete every sentence that would be true if you sent it to a different client.",
        "Count your words. Over 150 is a rewrite.",
      ],
      [
        "Write one letter using the four-line structure and leave it overnight.",
        "Check that line one names something specific from the post.",
        "Check that the last line asks a question they can answer in one word.",
      ],
      [
        "Pick one thing you can build this week that looks like the work you want paid for.",
        "Publish it somewhere with a link — Drive, Notion, a doc, anywhere clickable.",
        "Write two sentences about what you would do differently, and keep them in the letter.",
      ],
      [
        "Re-read the last three posts you applied to and mark the red flags you ignored.",
        "Write your own list of deal-breakers and keep it next to the board.",
        "Practise the sentence you will use to ask about pay when the post hides it.",
      ],
      [
        "Write your answers to the five recurring questions, out loud, timed at under ninety seconds each.",
        "Prepare one number you can quote from memory.",
        "Prepare two questions for them that a browsing candidate could not have asked.",
      ],
      [
        "Set a follow-up reminder five days out for every application you send.",
        "Draft the follow-up before you need it, with a placeholder for what you did since applying.",
        "Cap it at two follow-ups, then move on without resentment.",
      ],
    ],
    quiz: [
      {
        question: "What is the first line of your letter actually for?",
        options: [
          "Introducing yourself politely",
          "Proving you read the post",
          "Listing your years of experience",
          "Thanking them for the opportunity",
        ],
        correct: 1,
        why: "They are scanning for a reason to stop reading. Specificity is the only thing that stops the scan.",
      },
      {
        question: "You have no paid clients in the niche. What goes in the proof slot?",
        options: [
          "A longer explanation of your transferable skills",
          "A certificate from a course",
          "Something you built on purpose, linked",
          "A promise to work at half rate",
        ],
        correct: 2,
        why: "Made-on-purpose work is indistinguishable from client work in a link. Certificates prove attendance, not ability.",
      },
      {
        question: "A post says “rockstar, must be available anytime, salary DOE, unpaid trial week”. What is the strongest single red flag?",
        options: [
          "The word rockstar",
          "Salary DOE",
          "The unpaid trial week",
          "Availability anytime",
        ],
        correct: 2,
        why: "The others are annoying. An unpaid week is a business asking you to fund it, and it predicts how the invoices will go.",
      },
      {
        question: "How many follow-ups before you let it go?",
        options: ["One", "Two", "Until they reply", "Weekly for a month"],
        correct: 1,
        why: "Two says persistent. Three says desperate, and the third one has never converted anything worth having.",
      },
    ],
    templates: [T_COVER],
    practiceProject: {
      title: "Three letters, three real posts, one hour",
      brief:
        "Applications get better by volume with feedback, not by staring. Pick three live posts you would actually take and write to all three today, using a different template for each so you can feel which one fits you.",
      steps: [
        "Open the job board and pick three posts you would say yes to if offered tomorrow.",
        "Write letter one from the general opener, letter two from the no-experience template, letter three from the vague-post template.",
        "Cut each to under 150 words and read them aloud. Anything you would not say out loud, delete.",
        "Send all three. Log them in the tracker with today's date.",
        "Set a follow-up for day five and write the follow-up now.",
      ],
      template: T_COVER,
    },
    clientLooksFor: [
      {
        title: "Content Marketing Assistant (Remote, PH)",
        source: "OnlineJobs.ph",
        post: [
          "Include the word “peppermint” in your subject line so we know you read this.",
          "Send two writing samples, links only, no attachments.",
          "Tell us about a piece you wrote that failed.",
        ],
        reads: [
          "The codeword is a filter, not a joke. Missing it deletes you before anyone reads a word.",
          "Links only means they will not open a PDF. Have a public portfolio before you apply anywhere.",
          "Asking about a failure is a self-awareness test. A polished non-answer scores worse than a real miss.",
        ],
      },
      {
        title: "Executive Assistant to CEO",
        source: "RemoteOK",
        post: [
          "We receive 400+ applications. Please do not send a generic letter.",
          "Tell us in three sentences why this role and not another.",
          "Interview process: 20-minute call, then a paid two-hour task.",
        ],
        reads: [
          "Volume means the shortlist is made in seconds. One concrete detail about their company beats a paragraph about you.",
          "A paid task in the post is a good sign; it means they respect your time enough to pay for the sample.",
          "Three sentences is a real limit. Sending five is a demonstration that you do not follow instructions.",
        ],
      },
    ],
  },

  "pricing-and-negotiation": {
    checklists: [
      [
        "Collect ten real listings in your niche and write down every number you can see.",
        "Work out your own hourly floor in the rate calculator.",
        "Write the gap between your floor and the market midpoint. That gap is your negotiation room.",
      ],
      [
        "Say your rate out loud ten times until it stops sounding like a question.",
        "Write the sentence you will use after saying it: nothing. Practise the silence.",
        "Decide your walk-away number and write it somewhere you will see it mid-call.",
      ],
      [
        "Pick the pricing model that fits your next role and write one line defending it.",
        "Convert your hourly floor into a monthly retainer at realistic hours.",
        "Write what is explicitly not included at that price.",
      ],
      [
        "Start the raise tracker sheet and backfill three things you already did.",
        "Pick the date you will ask, and put it in the calendar.",
        "Draft the ask in four lines: what changed, evidence, new number, effective date.",
      ],
      [
        "List the tasks you currently do that were never in the agreement.",
        "Write the sentence you will use the next time one appears.",
        "Send one scope note this week for something already creeping.",
      ],
      [
        "Set your invoice dates as repeating calendar events.",
        "Add a late-payment clause to your agreement and read it once.",
        "Fill the payment log with every unpaid invoice you have right now.",
      ],
    ],
    quiz: [
      {
        question: "You want ₱90,000 take-home a month. Roughly what must you bill?",
        options: [
          "₱90,000 — that is the point",
          "Take-home plus tax, plus costs, spread over your real billable hours",
          "Take-home plus 10%",
          "Whatever the client's budget is",
        ],
        correct: 1,
        why: "Tax, tools, power, internet and unbillable admin all come out of the top. That is what the rate calculator does for you.",
      },
      {
        question: "Realistic billable hours in a 40-hour week?",
        options: ["40", "35", "About 30", "20"],
        correct: 2,
        why: "Applying, invoicing, admin, calls that overrun and fixing your own mistakes are all unpaid. Pricing against 40 quietly cuts your rate by a quarter.",
      },
      {
        question: "The client says your number is too high. Best first move?",
        options: [
          "Drop 20% immediately to save the deal",
          "Ask what budget they had in mind, then decide",
          "Hold the number and say nothing else, ever",
          "Offer to start unpaid and prove yourself",
        ],
        correct: 1,
        why: "Their number tells you whether this is a negotiation or a mismatch. Cutting first teaches them your price is fiction.",
      },
      {
        question: "How does scope creep usually start?",
        options: [
          "A client demanding extra work in writing",
          "A small favour you say yes to without naming it",
          "A contract renegotiation",
          "A new manager arriving",
        ],
        correct: 1,
        why: "It never arrives labelled. It arrives as a five-minute favour that becomes a standing expectation two weeks later.",
      },
    ],
    templates: [T_RATE, T_INVOICE, T_CONTRACT],
    practiceProject: {
      title: "Price yourself properly, then defend it",
      brief:
        "Most VAs pick a number by looking at what other people charge and shaving 10% off. Do the arithmetic instead, then rehearse holding it, because the number is worthless if it collapses the first time someone pushes.",
      steps: [
        "Fill the rate calculator with your real take-home target, tax rate, costs, and honest billable hours.",
        "Compare your floor to the market reference tab for your niche. If your floor is above the range, something in your inputs is wrong or your niche is too crowded.",
        "Write your quote sentence: rate, what it includes, what it does not.",
        "Record yourself saying it. Listen for the upward inflection at the end and kill it.",
        "Write three responses in advance: to “too expensive”, to “can you start lower and we will review”, and to silence.",
      ],
      template: T_RATE,
    },
    clientLooksFor: [
      {
        title: "Operations Manager — PHP 110,000 to 160,000/mo",
        source: "OnlineJobs.ph, agency",
        post: [
          "Please state your expected monthly rate in your application.",
          "We pay above market for people who do not need managing.",
          "Reviews at 3 and 6 months with rate adjustments built in.",
        ],
        reads: [
          "A posted range means the number is already decided. Quoting under it does not help you; it just prices you below the band they budgeted.",
          "“Do not need managing” is the real requirement. Evidence of you running something unsupervised beats a longer skills list.",
          "Built-in reviews are the best kind of raise. Ask what specifically triggers the adjustment and write the answer down.",
        ],
      },
      {
        title: "Part-Time VA, 20 hrs/week, $6/hr",
        source: "OnlineJobs.ph",
        post: [
          "Long-term potential for the right person.",
          "Rate can increase after probation.",
          "Must be flexible with hours.",
        ],
        reads: [
          "“Rate can increase after probation” with no number attached is a wish. Ask for the number and the date in writing before you accept.",
          "Flexible hours plus part-time pay usually means full-time availability at part-time cost.",
          "$6/hr for 20 hours is under most PH floors once tax and costs come out. Run it through the calculator before you feel bad about declining.",
        ],
      },
    ],
  },

  "general-va": {
    checklists: [
      [
        "Build four labels or folders: needs me, waiting on someone, read later, done.",
        "Unsubscribe from ten newsletters in the client inbox today.",
        "Write the rule for what you answer yourself versus what you escalate, and get it approved.",
      ],
      [
        "Add a default meeting length of 25 or 50 minutes to the calendar settings.",
        "Find one recurring meeting with no agenda and ask what decision it exists to make.",
        "Block two hours of focus time a day and defend them for a week.",
      ],
      [
        "Set up one folder and one naming convention for receipts.",
        "Ask for the expense categories the bookkeeper actually uses.",
        "Build a travel card: flights, hotel, transfers, confirmation numbers, timezone, on one page.",
      ],
      [
        "Write this week's update in five lines: shipped, blocked, needs you, next, one number.",
        "Send it on the same day and time every week.",
        "Delete every adjective from it before sending.",
      ],
      [
        "Pick the task you have explained twice and write it into the SOP template.",
        "Have someone else run it from your document without asking you anything.",
        "Fix every step where they had to ask.",
      ],
    ],
    quiz: [
      {
        question: "What makes inbox triage survive at 300 emails a day?",
        options: [
          "Reading every email in order",
          "A small fixed set of buckets and an agreed escalation rule",
          "Filters that auto-archive anything unimportant",
          "Answering everything within an hour",
        ],
        correct: 1,
        why: "The bottleneck is decisions, not reading speed. Four buckets and a written rule for what you answer yourself removes most of the decisions.",
      },
      {
        question: "A recurring meeting has no agenda and no decision. What is the useful move?",
        options: [
          "Attend and take notes anyway",
          "Cancel it without telling anyone",
          "Ask what decision it exists to make, and propose async if there is none",
          "Shorten it to fifteen minutes",
        ],
        correct: 2,
        why: "Cancelling unilaterally burns trust. Asking the question either produces an agenda or kills the meeting, and both are wins.",
      },
      {
        question: "What belongs in a weekly update your client will actually read?",
        options: [
          "Everything you did, in order",
          "Shipped, blocked, needs a decision, next, one number",
          "Hours worked and tasks remaining",
          "A short paragraph of narrative",
        ],
        correct: 1,
        why: "Five lines with one thing that needs them. If nothing needs them, they stop reading it by week four.",
      },
      {
        question: "Why do SOPs make you harder to replace, not easier?",
        options: [
          "They do not; documenting yourself is risky",
          "Because the person who defines how work is done owns the standard, and gets given the next process",
          "Because clients cannot read them",
          "Because they take a long time to write",
        ],
        correct: 1,
        why: "Replaceable people do tasks. The person who turns tasks into systems is the one who gets handed scope, and scope is what pays.",
      },
    ],
    templates: [T_SOP, T_REPORT],
    walkthroughs: [
      {
        tool: "Gmail",
        goal: "Turn a chaotic client inbox into four buckets in about twenty minutes",
        steps: [
          "Settings → See all settings → Labels → Create new label. Make four: 1 Needs me, 2 Waiting, 3 Read later, 4 Done.",
          "Numbering them keeps the order stable in the sidebar; Gmail sorts labels alphabetically.",
          "Settings → Filters and Blocked Addresses → Create a new filter. Anything from newsletters, invoices, or notifications goes straight to 3 Read later, skipping the inbox.",
          "Settings → Advanced → enable Multiple Inboxes, then add a section for label:1-Needs-me. The client now sees their real queue at the top.",
          "Settings → General → Send and Archive on, Undo Send at 30 seconds.",
          "Agree the escalation rule in writing: what you reply to as them, what you draft for approval, what you forward untouched.",
        ],
        screenshot: "Gmail settings, Labels tab",
      },
      {
        tool: "Google Calendar",
        goal: "Defend a founder's week without saying no yourself",
        steps: [
          "Settings → Event settings → Speedy meetings on, default duration 25 minutes.",
          "Settings → Working hours → set real hours, and set the timezone to the principal's, not yours.",
          "Create two recurring Focus blocks per day as busy events, titled with what they are for.",
          "Turn on Appointment Schedules for external requests so strangers book into a window you chose.",
          "Add a second timezone display in Settings → General → World clock, so you stop doing arithmetic in your head.",
        ],
        screenshot: "Calendar event settings",
      },
    ],
    practiceProject: {
      title: "Run a fake founder's week",
      brief:
        "You are the new generalist for a founder who has 312 unread emails, six meetings a day and no documentation. Nobody will tell you what matters. Build the system you would hand them at the end of week one.",
      steps: [
        "Set up the four-bucket label system in a spare Gmail account and file twenty of your own emails into it.",
        "Write the escalation rule as three bullet points you could send for approval.",
        "Take one meeting-heavy day from your own calendar and rebuild it with speedy meetings and two focus blocks.",
        "Write one SOP for the inbox routine using the template.",
        "Write the week-one update in five lines, including one number.",
      ],
      sampleData:
        "Pretend inbox mix: 40% newsletters, 25% client threads needing a decision, 20% invoices and receipts, 10% recruiters, 5% genuinely urgent. Six meetings a day, four with no agenda.",
      template: T_SOP,
    },
    clientLooksFor: [
      {
        title: "General VA / Right Hand for Founder",
        source: "OnlineJobs.ph",
        post: [
          "Inbox and calendar first, then whatever else needs doing.",
          "You will need to make decisions without asking me.",
          "Previous VA left because they waited to be told what to do.",
        ],
        reads: [
          "The last line is the whole brief. Bring a written escalation rule to the interview and you have answered their fear.",
          "“Whatever else” means document as you go, or you will be re-learning the same process every month.",
          "Decisions without asking needs a safety net. Propose a weekly fifteen-minute review of the judgement calls you made.",
        ],
      },
      {
        title: "Administrative Assistant, 40 hrs, US Hours",
        source: "RemoteOK",
        post: [
          "Manage scheduling across three timezones.",
          "Own expense reports and receipt collection.",
          "Weekly summary to leadership every Friday.",
        ],
        reads: [
          "Three timezones means they have been double-booked before; mention how you handle it, not that you can.",
          "Receipts are nobody's favourite job, which makes it the fastest place to be visibly better than the last person.",
          "A named weekly deliverable is a gift. It is your standing evidence for the raise conversation later.",
        ],
      },
    ],
  },

  "executive-assistant": {
    checklists: [
      [
        "Write down your principal's three recurring decisions and how they usually go.",
        "Note their reply speed, their preferred channel, and the format they never read.",
        "Ask one direct question: what do you want me to stop bringing to you?",
      ],
      [
        "Draft two versions of a no: the warm one and the final one.",
        "Agree the criteria for what gets an automatic no without asking.",
        "Send one no this week without escalating it.",
      ],
      [
        "Build a running agenda doc that both of you can add to during the week.",
        "Put decisions needed at the top and information at the bottom.",
        "End every one-to-one by reading back the decisions made.",
      ],
      [
        "List the systems where you can see something you should not repeat.",
        "Check whether an NDA exists and read the confidentiality clause in your own contract.",
        "Set up a private channel or folder for anything sensitive, not the shared drive.",
      ],
      [
        "Collect the last board pack or deck and note the sections that repeat every time.",
        "Turn those into a template so next month is assembly, not authorship.",
        "Write the one-page briefing note version and see if anyone asks for the full pack.",
      ],
    ],
    quiz: [
      {
        question: "What is the fastest way to learn a principal?",
        options: [
          "Read every email they ever sent",
          "Watch their recurring decisions and note how they usually go",
          "Ask them to fill out a preferences document",
          "Copy the previous assistant's system",
        ],
        correct: 1,
        why: "Stated preferences are aspirational. Their actual pattern of decisions is the real spec, and it shows up within two weeks.",
      },
      {
        question: "You are saying no on your principal's behalf. What matters most?",
        options: [
          "Softening it as much as possible",
          "Being clearly authorised, and being fast",
          "Explaining the full reason",
          "Copying them on everything",
        ],
        correct: 1,
        why: "A slow, hedged no wastes both sides. Authority plus speed is the whole service; the reason is usually optional and sometimes damaging.",
      },
      {
        question: "What should sit at the top of a weekly one-to-one agenda?",
        options: [
          "Status updates",
          "Decisions you need from them",
          "Calendar for the coming week",
          "Anything urgent from yesterday",
        ],
        correct: 1,
        why: "Their scarcest resource is judgement, not attention. Get the decisions while they are fresh; status can be read after.",
      },
      {
        question: "You see something in the inbox that suggests a layoff is coming. What do you do?",
        options: [
          "Warn the people affected quietly",
          "Nothing, and do not discuss it with anyone",
          "Ask the principal to confirm before you hear more",
          "Take notes in case you need them later",
        ],
        correct: 1,
        why: "Discretion is the product. One leak ends the role and the reference, and the people you warned will not be able to protect you.",
      },
    ],
    templates: [T_SOP, T_REPORT],
    walkthroughs: [
      {
        tool: "Notion",
        goal: "Build a principal brief that survives your holiday",
        steps: [
          "Create a top-level page: [Principal] Operating Manual. Restrict sharing to the two of you.",
          "Add four toggle sections: Preferences, Standing decisions, People, Never do this.",
          "Preferences: reply speed expectations, best channel by urgency, meeting formats they hate, food and travel details.",
          "Standing decisions: the recurring asks and the default answer, so you can act without checking.",
          "People: name, relationship, how fast they get a reply, and any history you must not step on.",
          "Add a database called Decisions Log with Date, Ask, What I decided, Confirmed by them. Review it in the weekly.",
          "Duplicate the page as a template before you take leave, strip the sensitive rows, and hand it to your cover.",
        ],
        screenshot: "Notion page with four toggles",
      },
    ],
    practiceProject: {
      title: "Write an operating manual for someone you already know",
      brief:
        "Pick a boss, a client, or a family member who makes a lot of requests. Write the manual you would hand to whoever replaces you. This is the artefact that gets EA candidates hired, and almost nobody brings one to an interview.",
      steps: [
        "List their three most repeated requests and the answer that is nearly always right.",
        "Write the two-sentence version of how they like to be communicated with.",
        "Write five standing decisions you could make on their behalf without asking.",
        "Write the “never do this” list — the three things that would genuinely upset them.",
        "Redact anything identifying and keep it as a portfolio piece.",
      ],
    },
    clientLooksFor: [
      {
        title: "Executive Assistant to CEO (US Startup)",
        source: "RemoteOK",
        post: [
          "You will have access to everything: board material, comp, personal finances.",
          "Must be able to say no to senior people on my behalf.",
          "Discretion is the number one requirement.",
        ],
        reads: [
          "Access at that level means they are hiring for judgement and nerve. Examples of you handling confidential material beat any tool list.",
          "Saying no to senior people is a spine test. Have one story ready where you held a line and the relationship survived.",
          "They will check references harder than usual. Line yours up before you apply.",
        ],
      },
      {
        title: "Executive Business Partner, Fractional",
        source: "OnlineJobs.ph",
        post: [
          "Prepare board packs and investor updates from raw notes.",
          "Own the weekly leadership meeting: agenda, notes, follow-through.",
          "Comfort with financial documents required.",
        ],
        reads: [
          "“From raw notes” means writing, not formatting. Bring a sample where you turned mess into one clean page.",
          "Owning follow-through means chasing executives. That is a personality requirement disguised as a task.",
          "Financial comfort is testable. Learn to read a P&L before the interview, not during it.",
        ],
      },
    ],
  },

  "customer-support": {
    checklists: [
      [
        "Learn the three keyboard shortcuts for assign, snooze, and close in your helpdesk.",
        "Set up a saved view for tickets older than 24 hours.",
        "Find out who owns escalation and how to reach them out of hours.",
      ],
      [
        "Rewrite the three most-used macros so they sound like a person.",
        "Add one variable that forces personalisation before sending.",
        "Delete any macro that has not been used in ninety days.",
      ],
      [
        "Write your three-reply de-escalation script and keep it visible.",
        "Practise the first sentence: acknowledge the cost to them, not the inconvenience.",
        "Agree in advance what you are allowed to offer without approval.",
      ],
      [
        "Find your current first response time and CSAT, and write both down.",
        "Look at one week of low CSAT scores and read the actual tickets.",
        "Pick the one metric you will not game and tell your manager which it is.",
      ],
      [
        "Tag a week of tickets by root cause, not by product area.",
        "Write help centre articles for the top three causes.",
        "Link the article in the macro, then check next month whether the tickets dropped.",
      ],
    ],
    quiz: [
      {
        question: "What is the point of tagging tickets by root cause instead of product area?",
        options: [
          "It makes reporting prettier",
          "It shows what to fix so the ticket stops happening",
          "It is required by Zendesk",
          "It speeds up first response time",
        ],
        correct: 1,
        why: "Product-area tags tell you where tickets land. Root-cause tags tell you what to build or document so they never arrive.",
      },
      {
        question: "First line of a reply to a furious customer?",
        options: [
          "An apology for the inconvenience",
          "The policy that explains the situation",
          "A specific acknowledgement of what it cost them",
          "A promise to escalate",
        ],
        correct: 2,
        why: "“Sorry for the inconvenience” signals a script. Naming the actual cost — the missed launch, the wasted afternoon — is what makes someone stop shouting.",
      },
      {
        question: "Your first response time is excellent but CSAT is falling. Most likely cause?",
        options: [
          "Customers are unusually difficult this quarter",
          "Fast replies that do not resolve anything",
          "The survey is broken",
          "Not enough macros",
        ],
        correct: 1,
        why: "FRT is the easiest metric to game and the least connected to whether the problem got solved. Resolution time and reopen rate are the honest pair.",
      },
      {
        question: "When should a macro be deleted?",
        options: [
          "Never, they are free",
          "When it has not been used in about ninety days",
          "When the wording is old",
          "Only when the product changes",
        ],
        correct: 1,
        why: "Dead macros make the live ones harder to find, and old wording gets sent by accident. A quarterly cull is ten minutes.",
      },
    ],
    templates: [T_SOP, T_REPORT],
    walkthroughs: [
      {
        tool: "Zendesk",
        goal: "Set up a queue you can actually work from on day one",
        steps: [
          "Admin Center → Objects and rules → Views → Add view. Build “My open, oldest first” with Assignee is (current user) and Status is Open, sorted by Requested ascending.",
          "Add a second view: “Untouched over 24h” with Hours since created greater than 24 and Comments is 1. This is where the churn hides.",
          "Admin Center → Macros → add a macro with dynamic content, and put a {{ticket.requester.first_name}} plus a blank line at the top so you have to type before sending.",
          "Admin Center → Triggers → notify assignee when a ticket is reopened. Reopens are the real quality metric.",
          "Admin Center → Objects and rules → Tags → agree a fixed root-cause tag list with the team. Free-text tagging becomes useless in a month.",
          "Reporting → Explore → check First reply time, Full resolution time, Reopen rate, CSAT together. Never report one alone.",
        ],
        screenshot: "Zendesk Views editor",
      },
    ],
    practiceProject: {
      title: "Fix a support queue that is drowning",
      brief:
        "A small SaaS has 340 open tickets, a 9-hour first response time and 71% CSAT. Their macros were written in 2021. You get one week. Write the plan and the three replies.",
      steps: [
        "Sort the sample ticket mix below into root causes and name the top three.",
        "Write one help centre article for the biggest cause, under 300 words.",
        "Rewrite one 2021-era macro so it sounds like a person and still saves time.",
        "Write a three-reply de-escalation sequence for the billing complaint.",
        "Write the one-page report to the founder: what is broken, what you did, what you need from them.",
      ],
      sampleData:
        "340 open tickets: 96 password and login, 71 billing charged twice after plan change, 54 where is my order, 43 feature request, 38 integration broken since an update, 22 refund demands, 16 angry about response time. CSAT comments repeat two phrases: “took days” and “nobody actually read my message”.",
      template: T_REPORT,
    },
    clientLooksFor: [
      {
        title: "Customer Support Specialist (Ecommerce, Night Shift)",
        source: "OnlineJobs.ph",
        post: [
          "Handle 60–80 tickets a day across email and chat.",
          "Shopify and Gorgias experience preferred.",
          "We measure CSAT and one-touch resolution.",
        ],
        reads: [
          "One-touch resolution is the tell: they want fewer replies per ticket, not faster replies. Say how you get to a full answer first time.",
          "Volume numbers in a post mean the queue is already behind. Ask what the backlog is before you accept.",
          "Named tools are usually a filter, not a hard requirement. A weekend in a Gorgias trial closes that gap honestly.",
        ],
      },
      {
        title: "Customer Success / Support Lead",
        source: "RemoteOK",
        post: [
          "Own the help centre and reduce ticket volume quarter on quarter.",
          "Work with product on recurring complaints.",
          "Report weekly on themes, not just numbers.",
        ],
        reads: [
          "Reducing volume is a documentation and product job. This role pays more than a queue job; show tagging and root-cause work.",
          "“Themes, not just numbers” means they want narrative. Practise summarising a week of tickets in three sentences.",
          "Working with product means you need to be believed. Bring evidence habits, not opinions.",
        ],
      },
    ],
  },

  "data-and-research": {
    checklists: [
      [
        "Rebuild one report you currently do by hand using XLOOKUP or INDEX/MATCH.",
        "Learn QUERY or FILTER well enough to write one from memory.",
        "Wrap every lookup in IFERROR so a blank does not look like a bug.",
      ],
      [
        "Take a messy export and clean it with TRIM, PROPER, and Split text to columns.",
        "Remove duplicates on the field that actually defines uniqueness, not the whole row.",
        "Record how long the clean took, then try to halve it next time.",
      ],
      [
        "Read the terms of service for the site you want to scrape.",
        "Check whether an official export or API exists before writing anything.",
        "Rate-limit yourself and never touch personal data you cannot justify holding.",
      ],
      [
        "Run a lead list through a verification tool and record the bounce estimate.",
        "Spot-check twenty rows by hand against the source.",
        "Delete role addresses and catch-alls unless the client explicitly wants them.",
      ],
      [
        "Ask the client what decision the dashboard is for before building it.",
        "Put the answer to that question in the top-left cell.",
        "Send it once with a two-line summary, and see if they open it again next week.",
      ],
    ],
    quiz: [
      {
        question: "Which is the safest habit when writing lookups?",
        options: [
          "Use VLOOKUP for speed",
          "Wrap lookups in IFERROR and use exact match",
          "Hide the error cells with white text",
          "Convert everything to values afterwards",
        ],
        correct: 1,
        why: "Silent #N/A cells get copied into decks. Exact match plus IFERROR makes the missing data visible as a blank you chose.",
      },
      {
        question: "Before scraping a site, what do you check first?",
        options: [
          "Whether the client will find out",
          "Whether an official export or API exists, and the terms of service",
          "How fast your connection is",
          "Whether the data is public",
        ],
        correct: 1,
        why: "Half of scraping jobs disappear once you find the export button. The other half need a terms check before you write a line of code.",
      },
      {
        question: "A 5,000-row lead list. What is the first quality step?",
        options: [
          "Send a test campaign to it",
          "Deduplicate on the field that defines uniqueness, then verify and spot-check by hand",
          "Sort alphabetically",
          "Split it into batches",
        ],
        correct: 1,
        why: "Verification tools miss things a human catches in twenty rows. Dedupe, verify, spot-check, in that order, before anything gets sent.",
      },
      {
        question: "What makes a dashboard get opened a second time?",
        options: [
          "More charts",
          "Automatic refresh",
          "It answers one decision the client actually has",
          "Brand colours",
        ],
        correct: 2,
        why: "Dashboards die because they are a display of effort rather than an answer. Put the answer in the top-left cell and everything else is supporting evidence.",
      },
    ],
    templates: [T_REPORT, T_SOP],
    walkthroughs: [
      {
        tool: "Google Sheets",
        goal: "Clean a 5,000-row export without touching a cell by hand",
        steps: [
          "Duplicate the raw tab first and name it RAW — never clean in place, you will need to prove what changed.",
          "Data → Data cleanup → Trim whitespace, then Remove duplicates on the key column only.",
          "Split names: =SPLIT(A2, \" \") or better, =INDEX(SPLIT(TRIM(A2), \" \"), 1) for the first token.",
          "Normalise case with =PROPER() for names and =LOWER() for emails; mixed-case emails break joins later.",
          "Flag bad emails: =IF(REGEXMATCH(B2, \"^[^@]+@[^@]+\\.[a-z]{2,}$\"), \"ok\", \"check\").",
          "Join to another sheet with =IFERROR(XLOOKUP(B2, other!B:B, other!D:D), \"\") so misses read as blank, not #N/A.",
          "Last: Data → Create a filter, filter the check column, and eyeball twenty rows yourself.",
        ],
        screenshot: "Sheets data cleanup menu",
      },
      {
        tool: "Looker Studio",
        goal: "Turn the clean sheet into a dashboard someone opens twice",
        steps: [
          "Create → Data source → Google Sheets → pick the CLEAN tab, not RAW.",
          "Set the date field as a real date type in the sheet first, or every time filter will silently fail.",
          "Add one scorecard for the metric that pays the bills. Put it top-left, largest.",
          "Add a date range control and set the default to Last 28 days, not Auto.",
          "Add a table underneath with at most five columns. Anything more and nobody scans it.",
          "Share as View only with link access, and email a two-line summary with the link. The summary is what gets read.",
        ],
        screenshot: "Looker Studio scorecard setup",
      },
    ],
    practiceProject: {
      title: "Clean a broken export and answer one question with it",
      brief:
        "A client sends you a CRM export and asks a vague question. The real work is deciding what the question means, then proving the answer with data you can defend.",
      steps: [
        "Recreate the sample rows below in a sheet, including the mess.",
        "Clean it: trim, normalise case, split names, dedupe on email, flag invalid addresses.",
        "Answer the question: which source produced customers who stayed longest?",
        "Build one scorecard and one five-column table. Nothing else.",
        "Write two sentences of interpretation, including one thing the data cannot tell you.",
      ],
      sampleData:
        "Columns: full name, email, source, signup date, last active, plan, monthly value. The mess to reproduce: trailing spaces on names, MIXED case emails, three duplicate emails with different capitalisation, two rows where source is blank, dates in both 2026-01-05 and 05/01/2026 formats, one monthly value stored as “$49/mo” text.",
      template: T_REPORT,
    },
    clientLooksFor: [
      {
        title: "Data Entry & Research VA",
        source: "OnlineJobs.ph",
        post: [
          "Build lead lists of 500+ verified contacts per week.",
          "Must know how to verify emails before delivery.",
          "Accuracy is more important than speed.",
        ],
        reads: [
          "“Verified before delivery” means they have been burned by bounces. Name your verification tool and your spot-check habit.",
          "Volume plus accuracy means they want process, not heroics. Describe your workflow in five steps.",
          "This is the category most easily automated. Learn one automation and you leave the price war.",
        ],
      },
      {
        title: "Research Analyst (Part-time, Remote)",
        source: "RemoteOK",
        post: [
          "Summarise findings for a non-technical audience.",
          "Cite every source; we check.",
          "Comfortable saying “the data does not support that”.",
        ],
        reads: [
          "Citation checking is rare enough to say out loud. Bring a sample with real links.",
          "The last line is the whole test. Include one honest limitation in any sample you submit.",
          "Non-technical summaries pay more than the analysis. Practise the two-sentence version.",
        ],
      },
    ],
  },

  "real-estate-va": {
    checklists: [
      [
        "Draw the transaction timeline from offer to close with every deadline on it.",
        "Learn what earnest money, contingency, and clear to close mean in the state you support.",
        "Ask your agent which deadline they have missed before. That is the one to guard.",
      ],
      [
        "Pull three comparable properties and write a one-paragraph CMA summary.",
        "Learn the MLS status codes your market uses and what each one triggers.",
        "Check listing photos and remarks against the fair housing rules before publishing.",
      ],
      [
        "Build one smart list in Follow Up Boss and one action plan behind it.",
        "Set the lead response target and see how the current one compares.",
        "Clean the tags so two tags do not mean the same thing.",
      ],
      [
        "Write a twelve-second opener that names why you are calling.",
        "Record yourself and cut every filler word from the first sentence.",
        "Log the outcome of every call the same day, even the bad ones.",
      ],
      [
        "Build a compliance checklist per transaction type and put dates on it.",
        "Set reminders two days before every deadline, not on the day.",
        "Check where signed documents are stored and whether the broker can find them.",
      ],
    ],
    quiz: [
      {
        question: "Which deadline is most likely to cost the client money if missed?",
        options: [
          "Listing photo upload",
          "Contingency and inspection deadlines",
          "Open house scheduling",
          "MLS remarks update",
        ],
        correct: 1,
        why: "Contingency dates are contractual. Miss one and the buyer can lose earnest money or the right to walk, which is a real financial loss with your name near it.",
      },
      {
        question: "What matters most about lead response in Follow Up Boss?",
        options: [
          "That every lead gets a long, personal message",
          "Speed — minutes, not hours",
          "That leads are tagged correctly",
          "That the agent replies personally",
        ],
        correct: 1,
        why: "Internet lead conversion collapses with time. A fast rough reply beats a polished one an hour later, which is exactly what action plans are for.",
      },
      {
        question: "Writing listing remarks, what must you avoid?",
        options: [
          "Mentioning the school district or “perfect for families”",
          "Listing square footage",
          "Naming the neighbourhood",
          "Describing recent renovations",
        ],
        correct: 0,
        why: "Fair housing rules bite on anything describing the buyer rather than the property. Familial status language is the most common accidental violation.",
      },
      {
        question: "An ISA cold-call opener should do what in the first twelve seconds?",
        options: [
          "Build rapport with small talk",
          "Say who you are and exactly why you are calling",
          "Ask qualifying questions immediately",
          "Read the script verbatim",
        ],
        correct: 1,
        why: "People decide whether to hang up before you finish the second sentence. Small talk from a stranger reads as a pitch; a clear reason buys you the next thirty seconds.",
      },
    ],
    templates: [T_SOP, T_REPORT],
    walkthroughs: [
      {
        tool: "Follow Up Boss",
        goal: "Set up lead routing and follow-up that runs without the agent",
        steps: [
          "Admin → Lead Flow → confirm every source posts into FUB; anything arriving only by email will be missed.",
          "Admin → Smart Lists → build “New leads, no contact, under 24h” and pin it. This is your morning queue.",
          "Admin → Action Plans → create a new-lead plan: text at 2 minutes, call at 5, email at 1 hour, then day 2, 4, 7, 14.",
          "Attach the plan to the lead source under Lead Flow so it fires automatically.",
          "Agree a tag list with the agent and delete the duplicates. Buyer, Seller, Nurture, Appointment Set, Dead is usually enough.",
          "Reporting → check speed to first contact weekly and put the number in your update.",
        ],
        screenshot: "FUB Action Plan builder",
      },
      {
        tool: "MLS / CMA",
        goal: "Produce a comparative market analysis an agent can hand to a seller",
        steps: [
          "Search sold listings within 0.5–1 mile, closed in the last 3–6 months, similar bed and bath count.",
          "Filter to the same property type and a square footage band of roughly plus or minus 15%.",
          "Throw out obvious outliers: estate sales, heavy renovation flips, off-market oddities. Note why you removed each one.",
          "Adjust for the differences that matter locally — garage, lot size, finished basement, pool. Write the adjustment, do not hide it.",
          "Produce a range, not a number, and a one-paragraph summary of what the range depends on.",
          "Check every photo and remark for fair housing language before it goes anywhere near a client.",
        ],
        screenshot: "MLS comparable search filters",
      },
    ],
    practiceProject: {
      title: "Run one transaction on paper",
      brief:
        "Take a fictional deal from accepted offer to clear to close. Build the tracker, the deadlines, and the two emails nobody wants to write. Agents hire the VA who has already thought about the bad week.",
      steps: [
        "Build a transaction tracker sheet with every milestone and its deadline date.",
        "Write the day-one email to the buyer explaining what happens next, in plain language.",
        "Write the email that tells the agent an inspection deadline is at risk, with options attached.",
        "Build the CMA summary paragraph for the sample comps below.",
        "Write the SOP for the whole process so the next transaction is assembly.",
      ],
      sampleData:
        "Offer accepted 3 March, $412,000. Earnest money due in 3 days. Inspection contingency 10 days. Appraisal ordered day 7, came back at $398,000. Loan commitment day 21. Close 14 April. Comps: 412 Oak, sold $405k, 3/2, 1,480 sqft, 42 days ago; 118 Pine, sold $421k, 3/2, 1,610 sqft, renovated kitchen, 28 days ago; 903 Cedar, sold $389k, 3/1, 1,390 sqft, 75 days ago.",
      template: T_SOP,
    },
    clientLooksFor: [
      {
        title: "Real Estate VA — Follow Up Boss, Full Time",
        source: "OnlineJobs.ph",
        post: [
          "Respond to internet leads within 5 minutes during shift.",
          "Manage transaction coordination and broker compliance files.",
          "Experience with FUB or kvCORE required.",
        ],
        reads: [
          "Five minutes is the entire job description. Say how you keep that up across a shift, including what happens when you are on a call.",
          "Compliance files means their broker has flagged something before. A checklist habit is the reassuring answer.",
          "CRM experience is the pay multiplier in this niche; a free trial and two weeks of practice is worth thousands a year.",
        ],
      },
      {
        title: "Inside Sales Agent (ISA), Commission + Base",
        source: "RemoteOK",
        post: [
          "100+ outbound dials per day.",
          "Set 8–10 qualified appointments per week.",
          "Base plus commission per closed transaction.",
        ],
        reads: [
          "Ask what the average ISA actually earned in commission last quarter, not the on-target figure.",
          "Appointment targets tell you the lead quality. Ten a week from cold lists is a different job than ten from inbound.",
          "Dial counts are measurable and gameable; make sure the metric you are judged on is appointments, not dials.",
        ],
      },
    ],
  },

  "seo-for-vas": {
    checklists: [
      [
        "Search three of your client's key terms and screenshot what the AI answer says.",
        "Note which sources it cites and whether your client is one of them.",
        "Write one sentence on where the traffic for those terms is actually going now.",
      ],
      [
        "Pull the client's Search Console queries and sort by impressions with low clicks.",
        "Group twenty queries into five intent clusters by hand.",
        "Pick the cluster with the clearest buying intent and write it at the top of the plan.",
      ],
      [
        "Fix the title tag and H1 on the three pages with the most impressions.",
        "Add internal links from your strongest page to the page you want to rank.",
        "Check the page actually answers the query in the first 100 words.",
      ],
      [
        "Complete every field on the Google Business Profile, including the boring ones.",
        "Add products or services with real descriptions, not one line.",
        "Set a weekly reminder to post and to answer reviews.",
      ],
      [
        "Build the report around one business metric, not rankings alone.",
        "Include one thing that did not work this month.",
        "End with three next actions and what you need from the client.",
      ],
    ],
    quiz: [
      {
        question: "AI answers are eating clicks on informational queries. What follows for a client's content plan?",
        options: [
          "Publish more informational posts to win the citations",
          "Shift weight toward commercial and comparison intent, and toward being citable",
          "Stop doing SEO",
          "Focus entirely on social",
        ],
        correct: 1,
        why: "Pages that answer “what is X” now get summarised. Pages that help someone choose still get clicked, and clear structured pages get cited by the answer engines.",
      },
      {
        question: "No Ahrefs budget. Where does keyword research start?",
        options: [
          "Guessing from experience",
          "Search Console queries with impressions and few clicks",
          "Google Keyword Planner volumes only",
          "Competitor blog titles",
        ],
        correct: 1,
        why: "Search Console is free and it is your client's own demand data. Impressions with no clicks is a list of pages Google already thinks are nearly relevant.",
      },
      {
        question: "Which on-page fix moves the needle fastest?",
        options: [
          "Adding more keywords to the footer",
          "Title tag, H1, and answering the query in the first 100 words",
          "Rewriting the whole page",
          "Adding schema to every page",
        ],
        correct: 1,
        why: "Relevance signals plus a fast answer covers most of what a near-miss page is missing. Full rewrites are slower and usually unnecessary.",
      },
      {
        question: "A sceptical client asks what they got for the money. What opens the report?",
        options: [
          "Average position across all keywords",
          "The business metric — leads, calls, bookings, revenue",
          "Total impressions",
          "Number of pages published",
        ],
        correct: 1,
        why: "Rankings are a means. If you lead with position, you have to defend the connection to money later; lead with money and rankings become supporting evidence.",
      },
    ],
    templates: [T_REPORT, T_SOP],
    walkthroughs: [
      {
        tool: "Google Search Console",
        goal: "Set it up and pull your first real keyword list in fifteen minutes",
        steps: [
          "Add a Domain property, not a URL prefix, so subdomains and http/https all roll up. It needs one DNS TXT record.",
          "Wait 48 hours for data, then Performance → Search results → set date range to Last 3 months.",
          "Add the Query dimension, sort by Impressions, and filter Position between 8 and 25. That band is the near-miss list.",
          "Export to Sheets. Group queries into intent clusters by hand — informational, comparison, buying, brand.",
          "Pages tab: find pages with many impressions and low CTR. Those need title and meta work, not new content.",
          "Set up a weekly email export so you have a baseline before you change anything.",
        ],
        screenshot: "GSC Performance report with position filter",
      },
      {
        tool: "Ahrefs / free alternatives",
        goal: "Do a competitor gap check with or without a paid tool",
        steps: [
          "Paid route: Ahrefs → Site Explorer → competitor domain → Organic keywords → filter KD under 20 and position 1–10.",
          "Then Content Gap: put your client's domain in the bottom field and two competitors above it.",
          "Free route: use Search Console for your own demand, Google autocomplete and People Also Ask for the shape of the topic, and Bing Webmaster Tools for free keyword volumes.",
          "Either way, check the top three ranking pages by hand. Note format, length, and what question they answer first.",
          "Write the brief as: query, intent, the answer in one sentence, and the three things competitors all include.",
          "Never hand a client a raw keyword export. The brief is the deliverable.",
        ],
        screenshot: "Ahrefs Content Gap tool",
      },
    ],
    practiceProject: {
      title: "Audit a real site in ninety minutes",
      brief:
        "Pick any small business site — a local dentist, a bakery, your cousin's shop. Do the audit you would sell for $300 and write the report. This is the single most effective portfolio piece in this niche, because it is real.",
      steps: [
        "Run the homepage and two key pages through PageSpeed Insights and note the three worst issues.",
        "Check title tags, H1s, and whether each page answers its query in the first 100 words.",
        "Search three terms the business should rank for and record where they appear and who beats them.",
        "Check the Google Business Profile against the completeness checklist.",
        "Write the report: five findings, ranked by what would make the most money, each with an effort estimate.",
        "Send it to the business. Free. Worst case you have a portfolio piece; it is not the worst case often.",
      ],
      template: T_REPORT,
    },
    clientLooksFor: [
      {
        title: "SEO Specialist / Content Manager",
        source: "OnlineJobs.ph, $1,200–2,000/mo",
        post: [
          "Own technical audits, on-page, and monthly reporting.",
          "Must be able to explain SEO to a non-technical owner.",
          "Tell us about a page you improved and what happened.",
        ],
        reads: [
          "The last line filters out everyone who has only done tasks. One before-and-after story with numbers wins this role.",
          "Explaining to a non-technical owner is the actual job; the audit is the easy half.",
          "Monthly reporting named in the post means the report is the deliverable they will judge you on.",
        ],
      },
      {
        title: "SEO / GEO Content Strategist",
        source: "RemoteOK",
        post: [
          "We care about AI citations as much as rankings.",
          "Structured data experience preferred.",
          "You will work directly with writers.",
        ],
        reads: [
          "Citation-focused briefs mean clear structure, direct answers, and schema. Say the words and show an example.",
          "Working with writers means you write briefs, not posts. Bring a brief as your sample.",
          "This is where the rate is going in 2026. Learning schema properly is a weekend that pays for years.",
        ],
      },
    ],
  },

  "writing-for-clients": {
    checklists: [
      [
        "Write back one sentence confirming what you think the brief is asking for.",
        "Ask what happens to this piece after it publishes — what is it for?",
        "Find out who approves it and what they usually change.",
      ],
      [
        "Find two primary sources, not two other blog posts.",
        "Talk to one person who has done the thing you are writing about, even briefly.",
        "Collect three specifics — numbers, names, dates — you can use in the draft.",
      ],
      [
        "Cut your finished draft by a third before anyone else sees it.",
        "Delete every sentence that only restates the previous one.",
        "Read it aloud and fix the places you run out of breath.",
      ],
      [
        "Use AI for structure or reactions, never for the final sentences.",
        "Check every fact the model produced against a source you can link.",
        "Reintroduce your own specifics wherever the draft went generic.",
      ],
      [
        "Pick three pieces you can write on spec for the exact clients you want.",
        "Publish them somewhere with a link, even a plain doc.",
        "Write one line under each explaining the decision behind it.",
      ],
    ],
    quiz: [
      {
        question: "The brief says “thought leadership piece about AI”. First move?",
        options: [
          "Start outlining immediately",
          "Write one sentence back confirming what you think they mean and what it is for",
          "Ask for more budget",
          "Research for two days",
        ],
        correct: 1,
        why: "Vague briefs produce rewrites, and rewrites are unpaid. A one-sentence confirmation costs a minute and saves a draft.",
      },
      {
        question: "What stops writing sounding generic?",
        options: [
          "A stronger vocabulary",
          "Specifics — numbers, names, dates, one real person's experience",
          "Shorter paragraphs",
          "Adding a personal anecdote at the top",
        ],
        correct: 1,
        why: "Generic is a research failure, not a style failure. Two primary sources beat any amount of rewriting.",
      },
      {
        question: "Where does AI genuinely help a paid writer?",
        options: [
          "Producing the final draft quickly",
          "Structure, counter-arguments, and finding the boring gaps",
          "Fact-checking",
          "Writing the opening line",
        ],
        correct: 1,
        why: "It is good at shape and bad at truth or voice. Use it where being wrong is cheap and reversible.",
      },
      {
        question: "You have no published clips. What is the portfolio?",
        options: [
          "A list of topics you can write about",
          "Three spec pieces written for the exact clients you want, published anywhere linkable",
          "Your university essays",
          "A rate card",
        ],
        correct: 1,
        why: "Nobody checks whether a piece was commissioned. They check whether it is good and whether it looks like their world.",
      },
    ],
    templates: [T_SOP],
    walkthroughs: [
      {
        tool: "Google Docs",
        goal: "Set up a draft file that makes clients easy to work with",
        steps: [
          "Top of the doc: a brief box with target reader, the one question this answers, word count, deadline, and who approves.",
          "Write in Suggesting mode when editing someone else's copy, so your changes are reviewable, never silent.",
          "Use Insert → Building blocks → Review tracker for approval status; it beats chasing in Slack.",
          "Leave your sources as comments on the sentence they support, not in a list at the bottom.",
          "Version naming: v1 draft, v2 after your own cut, v3 after client notes. Never “final final”.",
          "File → Version history → Name current version at each handoff so you can prove what you sent.",
        ],
        screenshot: "Docs suggesting mode",
      },
    ],
    practiceProject: {
      title: "Write one piece three ways",
      brief:
        "Same topic, three different clients, three different readers. This is the exercise that turns a writer into someone who can be briefed, and it makes three portfolio pieces in an afternoon.",
      steps: [
        "Pick a topic you know: say, why small businesses lose customers after the first purchase.",
        "Write version one for a B2B SaaS blog, 800 words, for a marketing manager who wants tactics.",
        "Write version two as a 200-word LinkedIn post for a founder who wants an argument.",
        "Write version three as an email to customers of a small shop, 120 words, warm and useful.",
        "Cut each by a third. Then read all three aloud and mark where the voice slipped.",
      ],
    },
    clientLooksFor: [
      {
        title: "Content Writer — B2B SaaS",
        source: "RemoteOK, $0.15–0.25/word",
        post: [
          "Send two samples in our space, not general lifestyle content.",
          "We will ask how you research; “I read other blogs” is a no.",
          "AI-assisted is fine. AI-generated is not, and we can tell.",
        ],
        reads: [
          "Samples in their space matter more than better samples elsewhere. Write one on spec if you have none.",
          "The research question is the screening question. Have a repeatable answer: sources, interviews, specifics.",
          "Being honest about how you use AI is now a positive signal, not a risk.",
        ],
      },
      {
        title: "Blog & Newsletter Writer, Ongoing",
        source: "OnlineJobs.ph",
        post: [
          "4 posts and 4 newsletters a month, ongoing.",
          "Must handle feedback without taking it personally.",
          "Deadlines are fixed; we publish on a schedule.",
        ],
        reads: [
          "Ongoing volume is the good kind of work: predictable money, and you learn the voice properly.",
          "The feedback line means the last writer argued. Say something about how you take notes.",
          "Fixed schedules reward the writer who delivers early once. Do it in month one.",
        ],
      },
    ],
  },

  "social-media-management": {
    checklists: [
      [
        "Batch a month in four blocks: research, write, design, schedule. Do not mix them.",
        "Build a content bank of at least ten reusable formats.",
        "Schedule everything in one sitting and keep two slots free for reactive posts.",
      ],
      [
        "Write five hooks for one post and pick the one you would stop scrolling for.",
        "Rewrite the same post for two different platforms rather than cross-posting.",
        "Check the first line renders before the “more” cut on mobile.",
      ],
      [
        "Agree which comments you answer, which you escalate, and which you hide.",
        "Reply to every comment in the first hour after posting for one week and note the difference.",
        "Save three responses for the criticism that comes up repeatedly.",
      ],
      [
        "Write a one-page creator brief: deliverable, hook, do-not-say list, deadline, usage rights.",
        "Ask for raw footage in the contract, not after the shoot.",
        "Track which creator content outperforms brand content and tell the client.",
      ],
      [
        "Report saves, shares and follows alongside reach, not reach alone.",
        "When a month dips, say so in the first line and give the reason.",
        "Show one experiment you ran and what it taught you.",
      ],
    ],
    quiz: [
      {
        question: "Why batch a month of content in one day?",
        options: [
          "It looks more professional",
          "Context switching is the cost, not the writing",
          "Platforms reward bulk scheduling",
          "It lets you take the rest of the month off",
        ],
        correct: 1,
        why: "Research, writing and design use different parts of your brain. Doing all three per post, thirty times, costs far more than doing each once.",
      },
      {
        question: "Best use of the first line of a caption?",
        options: [
          "A greeting",
          "Hashtags",
          "The hook — the reason to keep reading, visible before the cut",
          "A summary of the post",
        ],
        correct: 2,
        why: "On mobile only the first line survives the “more” truncation. It is the whole decision point.",
      },
      {
        question: "Which metric best predicts whether content is working?",
        options: [
          "Reach",
          "Likes",
          "Saves and shares",
          "Follower count",
        ],
        correct: 2,
        why: "Reach is what the platform gave you. Saves and shares are what people chose to do, and they are what the algorithm rewards next time.",
      },
      {
        question: "Reach drops 40% this month. What goes in the report?",
        options: [
          "A different metric that went up",
          "The drop in the first line, with the reason and what you are doing about it",
          "An average across three months to smooth it",
          "Nothing until it recovers",
        ],
        correct: 1,
        why: "Clients find out anyway. Being the person who names the bad number first is how you stay trusted through a bad quarter.",
      },
    ],
    templates: [T_REPORT, T_SOP],
    walkthroughs: [
      {
        tool: "Canva",
        goal: "Build a brand kit and a month of templates that anyone can reuse",
        steps: [
          "Brand Hub → Brand Kits → upload logo variants, add the exact hex codes, and set the two fonts.",
          "Create one design at 1080x1350 (feed) and one at 1080x1920 (story). Those two cover most of a month.",
          "Design → Resize → duplicate into the other sizes rather than starting over.",
          "Lock the logo and background layers so a teammate cannot nudge them.",
          "Share → Template link, not Edit link, so the client's team makes copies instead of editing your master.",
          "Name files with date + platform + hook, so the reporting sheet can join to them later.",
        ],
        screenshot: "Canva Brand Hub",
      },
      {
        tool: "Meta Business Suite / Buffer",
        goal: "Schedule a month without losing the reactive slots",
        steps: [
          "Planner → Create post → schedule everything evergreen first, in one sitting.",
          "Leave two slots a week visibly empty and label them Reactive in your content sheet.",
          "Set posting times from your own Insights → best times, not from generic advice.",
          "Turn on the queue view and screenshot it for the client: seeing a full month is worth more to them than any report.",
          "Check first comment placement for links, since links in captions are penalised on most platforms.",
          "Every Friday: review last week's saves and shares, and swap next week's weakest scheduled post.",
        ],
        screenshot: "Planner month view",
      },
    ],
    practiceProject: {
      title: "Build a real month for a real small business",
      brief:
        "Pick a local business with a bad social presence. Build the month you would sell them, including the sheet, the designs, and the reporting frame. Then send it. This niche hires from portfolios almost exclusively.",
      steps: [
        "Audit their last thirty posts: formats used, what got saved, what got ignored.",
        "Define five recurring formats you would run weekly.",
        "Write twelve captions with hooks, and design three posts in Canva using their real colours.",
        "Build the content calendar sheet with dates, platforms, hooks, and assets.",
        "Write the reporting frame: which four numbers you would report and why those four.",
      ],
      sampleData:
        "If you cannot pick a business, use this: a coffee shop with 2,100 followers, posting three times a week, mostly latte photos, average 40 likes, 1 save, no captions over one line, no stories.",
      template: T_REPORT,
    },
    clientLooksFor: [
      {
        title: "Social Media Manager (Ecommerce Brand)",
        source: "OnlineJobs.ph",
        post: [
          "Own strategy, not just scheduling.",
          "Show us an account you grew and the numbers.",
          "Short-form video editing is a plus.",
        ],
        reads: [
          "“Not just scheduling” is the pay difference. Lead with a decision you made, not a tool you used.",
          "Numbers, even small ones, from an account you actually ran beat a beautiful portfolio with no data.",
          "Video editing bolted onto SMM raises the rate more than any other add-on in this niche.",
        ],
      },
      {
        title: "Community Manager, Discord + Instagram",
        source: "RemoteOK",
        post: [
          "Respond to comments and DMs within a few hours.",
          "De-escalate conflict in public threads.",
          "Report weekly on sentiment, not just volume.",
        ],
        reads: [
          "Sentiment reporting is rare and easy to demonstrate: bring a sample of three themes from any public community.",
          "Public de-escalation is a nerve test. Have one example ready.",
          "Response time targets mean shift coverage. Clarify weekends before you accept.",
        ],
      },
    ],
  },

  "email-marketing": {
    checklists: [
      [
        "Check SPF, DKIM and DMARC are all passing before sending anything.",
        "Suppress anyone who has not opened in six months and see what happens to deliverability.",
        "Send a test to Gmail, Outlook and a phone, and look at all three.",
      ],
      [
        "Audit which of the three core flows exist and which are missing.",
        "Write the first email of the missing flow today.",
        "Check every flow for a broken link or an out-of-date discount code.",
      ],
      [
        "Build three segments you can explain in one sentence each.",
        "Delete any segment nobody has sent to in ninety days.",
        "Check that your segments do not overlap into double-sends.",
      ],
      [
        "Write one campaign whose subject line makes a claim rather than announcing a sale.",
        "Cut the email to one idea and one link.",
        "Preview the first 40 characters as they appear in a mobile inbox.",
      ],
      [
        "Find out which attribution model your client's reports use before quoting revenue.",
        "Separate flow revenue from campaign revenue in every report.",
        "Say plainly which numbers you would have earned anyway.",
      ],
    ],
    quiz: [
      {
        question: "Open rates dropped after a domain change. First thing to check?",
        options: [
          "Subject lines",
          "SPF, DKIM and DMARC authentication",
          "Send time",
          "List size",
        ],
        correct: 1,
        why: "Authentication is the plumbing. If the records did not follow the domain, everything else you tune is decoration.",
      },
      {
        question: "Which flow usually earns most per recipient?",
        options: [
          "Weekly newsletter",
          "Abandoned cart",
          "Win-back",
          "Birthday email",
        ],
        correct: 1,
        why: "Cart abandonment catches people at peak intent. Welcome flows come second; newsletters are volume, not intent.",
      },
      {
        question: "Why suppress six-month non-openers?",
        options: [
          "It makes the list smaller and cheaper",
          "Engagement signals drive inbox placement for everyone else",
          "It improves the open rate on paper",
          "Platforms require it",
        ],
        correct: 1,
        why: "Mailbox providers judge you on how engaged recipients behave. Dead weight quietly sends the engaged half to promotions or spam.",
      },
      {
        question: "The client's dashboard says email drove $40k. What do you say?",
        options: [
          "Quote the $40k",
          "Ask which attribution model and window, then split flows from campaigns",
          "Halve it to be safe",
          "Only report opens and clicks",
        ],
        correct: 1,
        why: "Last-click over a 30-day window will hand email credit for purchases it merely finished. Naming the model before you claim the number is what keeps you credible.",
      },
    ],
    templates: [T_REPORT, T_SOP],
    walkthroughs: [
      {
        tool: "Klaviyo",
        goal: "Audit an account and fix the three flows that matter, in order",
        steps: [
          "Account → Settings → Domains → confirm a dedicated sending domain with CNAMEs verified. If it says shared, that is your first job.",
          "Analytics → Deliverability → check the open rate by mailbox provider. A Gmail-only collapse is an authentication or reputation problem, not a content one.",
          "Flows → check Welcome, Abandoned Checkout, Browse Abandonment, Win-back exist and are Live, not Draft. Draft flows are the single most common finding.",
          "Open Abandoned Checkout: confirm the trigger filter excludes people who placed an order, or you are emailing customers about carts they completed.",
          "Lists & Segments → build “Engaged 90 days” (opened or clicked in 90 days) and send campaigns there while reputation recovers.",
          "Create a suppression segment for 180-day non-openers and exclude it from every campaign.",
          "Campaigns → always set the UTM parameters at account level so the client's analytics agrees with Klaviyo's numbers.",
        ],
        screenshot: "Klaviyo flow trigger filters",
      },
    ],
    practiceProject: {
      title: "Build a welcome flow that would survive an audit",
      brief:
        "One fictional brand, one flow, written properly. Five emails, real copy, correct triggers and exclusions, plus the argument for why each email exists. Bring this to an interview and you skip the “do you know Klaviyo” conversation.",
      steps: [
        "Pick a product you understand and write the customer in two sentences.",
        "Map five emails across fourteen days with the job each one does — not five sales pitches.",
        "Write every subject line and preview text; check the first 40 characters on mobile.",
        "Write the exclusion logic: who should never receive this, and at what point they exit.",
        "Write the measurement plan: which number tells you email three is not working.",
      ],
      sampleData:
        "Fictional brand: a Philippine skincare line, average order ₱1,400, 30% repeat rate, list of 12,000 with 4,100 engaged in 90 days, no win-back flow, abandoned cart flow is live but has no order-placed exclusion.",
      template: T_REPORT,
    },
    clientLooksFor: [
      {
        title: "Email Marketing Specialist (Klaviyo)",
        source: "RemoteOK, $1,800–3,000/mo",
        post: [
          "Own flows, campaigns, and list health.",
          "Report revenue per recipient, not open rates.",
          "Experience with segmentation strategy required.",
        ],
        reads: [
          "Revenue per recipient in the post means they are commercially literate. Do not lead with open rates in your reply.",
          "List health named separately means deliverability has bitten them. Mention authentication in your first message.",
          "Segmentation strategy is the difference between an operator and a sender. Bring an example of a segment you built and why.",
        ],
      },
      {
        title: "Lifecycle Marketing VA",
        source: "OnlineJobs.ph",
        post: [
          "Build flows in Klaviyo or Mailchimp for multiple ecommerce clients.",
          "Write the copy as well as build the automation.",
          "Show us a flow you built and the results.",
        ],
        reads: [
          "Copy plus build is two skills in one seat, and it is why this niche pays above general VA rates.",
          "Multiple clients means process. Have a repeatable audit checklist to show.",
          "They ask for results, so bring numbers even from a small or personal project.",
        ],
      },
    ],
  },

  "sales-development": {
    checklists: [
      [
        "Write your ICP in one sentence with a firmographic filter you can actually query.",
        "List the three triggers that mean someone is in the market now.",
        "Cut the list until you would be happy calling every name on it.",
      ],
      [
        "Build one saved search in Sales Navigator using the ICP filters.",
        "Enrich fifty contacts and check the data quality by hand on ten of them.",
        "Record your bounce rate before you send anything at volume.",
      ],
      [
        "Write a cold email under 90 words with one ask.",
        "Delete the paragraph about your company.",
        "Make the first line about them, provably.",
      ],
      [
        "Write your two-line answer to “we already have someone”.",
        "Write your two-line answer to “send me some information”.",
        "Practise both until they are boring to say.",
      ],
      [
        "Set the rule for when a lead moves stage, and write it down.",
        "Clear every deal with no next step from the pipeline today.",
        "Build one report you would show without editing.",
      ],
    ],
    quiz: [
      {
        question: "What makes an ICP useful rather than decorative?",
        options: [
          "It describes the ideal buyer's personality",
          "It uses filters you can actually query, plus buying triggers",
          "It is approved by the founder",
          "It is broad enough to keep the list large",
        ],
        correct: 1,
        why: "If you cannot turn the ICP into a Sales Navigator search, it is a mood board. Triggers are what turn a list into a queue.",
      },
      {
        question: "Which part of a cold email should you delete first?",
        options: [
          "The subject line",
          "The paragraph explaining your company",
          "The call to action",
          "The signature",
        ],
        correct: 1,
        why: "Nobody read your company boilerplate at any point in history. The space is worth more spent proving you know something about them.",
      },
      {
        question: "Prospect says “we already have someone for that”. Best reply?",
        options: [
          "Ask what they like least about the current setup, in one line",
          "Send a comparison chart",
          "Ask to be kept in mind for the future",
          "Explain why you are better",
        ],
        correct: 0,
        why: "It is a reflex, not a decision. One specific question turns a brush-off into information, and sometimes into a meeting.",
      },
      {
        question: "What should trigger moving a deal to the next pipeline stage?",
        options: [
          "A good conversation",
          "A written rule, usually a confirmed next step with a date",
          "The rep's confidence level",
          "Time passing",
        ],
        correct: 1,
        why: "Optimism-driven pipelines forecast badly and make everyone look bad in the same week. A dated next step is objective.",
      },
    ],
    templates: [T_SOP, T_REPORT],
    walkthroughs: [
      {
        tool: "Apollo",
        goal: "Turn an ICP into a clean, sendable list",
        steps: [
          "Search → People → set employee count, industry, and location to your ICP first; job title last.",
          "Add the buying-trigger filters: recently funded, hiring for a relevant role, or technology installed.",
          "Save it as a Persona so the search is reproducible next month.",
          "Verify before export: filter to Verified email status only, and accept the smaller list.",
          "Export to CSV, then spot-check ten contacts on LinkedIn by hand. Enrichment is confidently wrong maybe 10% of the time.",
          "Warm the sending domain for two weeks before volume, and cap daily sends per mailbox at around 30–50.",
          "Sequences → keep it to three touches. A seven-step sequence to a cold list is how domains get burned.",
        ],
        screenshot: "Apollo people search filters",
      },
      {
        tool: "Clay",
        goal: "Enrich a list with something worth writing about",
        steps: [
          "Import the Apollo CSV as a table, one row per contact.",
          "Add an enrichment column for company website, then a scrape column for the homepage headline.",
          "Add a column for recent news or funding; that is your first line.",
          "Use a formula or AI column to write one personalised sentence per row — the observation, not the pitch.",
          "Review twenty rows by hand. If the sentence would embarrass you, the whole column is wrong.",
          "Export to your sending tool with the personalisation as a merge field, and never send a merge field you have not eyeballed.",
        ],
        screenshot: "Clay enrichment table",
      },
    ],
    practiceProject: {
      title: "Build a 50-name list and write the sequence",
      brief:
        "Pick a real product you would be happy to sell — even Verse itself. Build a genuinely tight list of fifty, then write the three touches. Hiring managers in this niche will ask to see exactly this.",
      steps: [
        "Write the ICP in one sentence with three queryable filters and two triggers.",
        "Build the list to fifty names, verified, spot-checked by hand on ten.",
        "Write touch one: under 90 words, one ask, first line provably about them.",
        "Write touch two (day 4) and touch three (day 9). Different angle each time, never “just bumping this”.",
        "Write what you would count as success and what number would make you stop.",
      ],
    },
    clientLooksFor: [
      {
        title: "SDR / Lead Generation Specialist",
        source: "OnlineJobs.ph, base + commission",
        post: [
          "Build lists, run outbound, book meetings for the founder.",
          "Apollo and LinkedIn Sales Navigator experience.",
          "You own the number: 12 qualified meetings a month.",
        ],
        reads: [
          "Owning a number means the role is measurable from week one. Ask what qualified means, in writing, before you accept.",
          "Founder-led sales means short feedback loops and probably no playbook. That is an opportunity if you like building.",
          "Ask what the last person hit. If nobody has ever hit twelve, the target is a wish.",
        ],
      },
      {
        title: "Outbound Operations (Clay / Instantly)",
        source: "RemoteOK",
        post: [
          "Manage domains, warmup, and deliverability across several mailboxes.",
          "Build enrichment workflows, not just send emails.",
          "Report reply rate and positive reply rate separately.",
        ],
        reads: [
          "Deliverability ownership is the technical end of this niche and it pays noticeably more than list-building.",
          "Separating positive replies means they measure honestly. Do the same in your own examples.",
          "Enrichment workflow skills transfer directly to ops roles later. This is a good rung on the ladder.",
        ],
      },
    ],
  },

  "graphic-design": {
    checklists: [
      [
        "Take one bad layout and fix it using only alignment, spacing, and hierarchy.",
        "Reduce to two typefaces maximum and set a real type scale.",
        "Double your whitespace, then check whether it looks worse. It usually does not.",
      ],
      [
        "Build a one-page brand kit: colours with hex codes, fonts, logo rules, do-not list.",
        "Set it up in Canva or Figma so nobody has to guess.",
        "Send it to the client and get it approved in writing.",
      ],
      [
        "Take one winning ad and produce five variations changing one element each.",
        "Name files so the reporting can tell which variation is which.",
        "Note which element changed the result, not just which ad won.",
      ],
      [
        "Name every layer and use components for anything repeated.",
        "Set up auto layout on one screen until it resizes cleanly.",
        "Export at the sizes a developer asked for, not the sizes you like.",
      ],
      [
        "Ask for feedback in terms of the goal, not taste.",
        "Turn “make it pop” into a question about hierarchy or contrast.",
        "Cap revisions in the agreement, and say the number out loud early.",
      ],
    ],
    quiz: [
      {
        question: "A layout looks amateur but nothing is obviously wrong. First thing to fix?",
        options: [
          "The colour palette",
          "Alignment, spacing, and hierarchy",
          "The typeface choice",
          "Add a border",
        ],
        correct: 1,
        why: "Most amateur-looking work is inconsistent spacing and no clear hierarchy. Colour and type get blamed for it far more often than they deserve.",
      },
      {
        question: "Why produce five ad variations changing one element each?",
        options: [
          "Clients like options",
          "So the result tells you which element caused the change",
          "It fills the delivery quota",
          "Platforms need volume",
        ],
        correct: 1,
        why: "Changing five things and winning teaches you nothing. Isolated variables turn creative work into knowledge you can charge for.",
      },
      {
        question: "The client says “make it pop”. What do you ask?",
        options: [
          "Which colour they prefer",
          "What should the eye hit first, and what is it competing with",
          "Whether they want it bigger",
          "For examples they like",
        ],
        correct: 1,
        why: "“Pop” is almost always a hierarchy complaint. Translate it into a question about attention order and the fix becomes obvious to both of you.",
      },
      {
        question: "Handing files to a developer, what matters most?",
        options: [
          "High-resolution exports",
          "Named layers, components, and auto layout that shows intent",
          "A PDF of every screen",
          "Source files in every format",
        ],
        correct: 1,
        why: "Developers rebuild behaviour, not pictures. Structure communicates what should stretch, repeat, and wrap; a flat export hides all of it.",
      },
    ],
    templates: [T_SOP],
    walkthroughs: [
      {
        tool: "Figma",
        goal: "Set up a file a developer will not complain about",
        steps: [
          "Create a Styles page first: colour styles with semantic names (surface, ink, accent), and text styles for every size you will use.",
          "Build the button once as a component with variants for state and size, then never draw a button again.",
          "Auto layout on every frame: set padding, gap, and resizing rules. Test by dragging the frame wider.",
          "Name layers as you go. “Rectangle 47” is how handoff goes wrong.",
          "Use Dev Mode for handoff, and add a note on any interaction the static frames do not explain.",
          "Export settings live on the component, not the instance, so sizes stay consistent.",
        ],
        screenshot: "Figma component variants panel",
      },
      {
        tool: "Canva",
        goal: "Produce a week of ad variations quickly without losing the master",
        steps: [
          "Build the master in a single design, then Duplicate page per variation — never overwrite the winner.",
          "Change exactly one element per page: headline, image, CTA, colour, or layout. Note which in the page title.",
          "Use Brand Kit colours so nothing drifts, and lock the logo layer.",
          "Bulk create from a sheet if you have more than ten variations of the same layout.",
          "Export as separate PNGs named brand_date_element_v1 so the ad report can join on the filename.",
          "Keep a results tab: filename, element changed, spend, result. That sheet is what gets your rate up.",
        ],
        screenshot: "Canva bulk create",
      },
    ],
    practiceProject: {
      title: "Rebrand one real small business, one page",
      brief:
        "Not a full identity. One page that shows judgement: their existing look, your version, and the reasoning. Reasoning is what separates a designer from someone with Canva.",
      steps: [
        "Screenshot their current homepage or main social post.",
        "Write three specific problems with it, in terms of hierarchy and legibility, not taste.",
        "Rebuild one asset properly using a two-typeface system and a real type scale.",
        "Build the one-page brand kit that would keep it consistent.",
        "Write one paragraph on what you deliberately did not change and why.",
      ],
    },
    clientLooksFor: [
      {
        title: "Graphic Designer for Ecommerce Ads",
        source: "OnlineJobs.ph",
        post: [
          "20–30 ad creatives per month, fast turnaround.",
          "Work from a brief and existing brand guidelines.",
          "We test everything; be comfortable being wrong.",
        ],
        reads: [
          "Volume work rewards systems. Show that you work from components and templates, not from scratch.",
          "“Be comfortable being wrong” means they will kill your favourite design with data. Say you like that; mean it.",
          "Working within guidelines is a discipline test. Do not submit a portfolio of your own aesthetic only.",
        ],
      },
      {
        title: "Brand & Social Designer (Part-time)",
        source: "RemoteOK",
        post: [
          "Own the visual system across social, email, and site.",
          "Must be able to explain design decisions to non-designers.",
          "Figma required, Canva templates for the team.",
        ],
        reads: [
          "Owning a system across channels is a step up from making assets, and it is where the rate jump lives.",
          "Explaining decisions is half the job in small teams. Practise the one-sentence version of every choice.",
          "Building Canva templates for a non-design team is a genuinely valuable skill and almost nobody advertises it.",
        ],
      },
    ],
  },

  "video-editing": {
    checklists: [
      [
        "Re-cut one of your edits so the first two seconds carry the hook.",
        "Remove every frame before the first meaningful movement or word.",
        "Watch it muted and check it still makes sense.",
      ],
      [
        "Burn captions on every short-form edit, styled to the brand.",
        "Add three sound cues and check the mix on phone speakers.",
        "Cut two seconds out of the middle without losing meaning.",
      ],
      [
        "Set up a project template with your bins, presets, and caption style.",
        "Batch one stage at a time across all clips: cut, then caption, then colour, then export.",
        "Time one batch and record it so you can quote per-clip honestly.",
      ],
      [
        "Take one long video and mark ten self-contained moments.",
        "Cut three of them and note which needed extra context.",
        "Build a naming convention that tells you the source and the moment.",
      ],
      [
        "Agree the revision limit in writing before the first edit.",
        "Deliver in one folder with a clear version number and a preview link.",
        "Ask for feedback with timecodes, and refuse the phrase “make it better”.",
      ],
    ],
    quiz: [
      {
        question: "What does the first two seconds of a short need to do?",
        options: [
          "Introduce the creator",
          "Show motion or say the thing that makes staying worth it",
          "Set up context",
          "Show the brand logo",
        ],
        correct: 1,
        why: "The scroll decision happens before your intro finishes. Anything that could be cut without loss should be cut, starting from frame one.",
      },
      {
        question: "Why burn captions rather than rely on auto-captions?",
        options: [
          "Auto-captions are always wrong",
          "Burned captions keep styling and survive re-uploads across platforms",
          "It is faster",
          "It improves audio quality",
        ],
        correct: 1,
        why: "Most viewing is muted, and platform captions get stripped or repositioned when clients repost. Burned means what you approved is what plays.",
      },
      {
        question: "Best way to edit a week of clips?",
        options: [
          "One clip fully finished at a time",
          "By stage across all clips: cut, then caption, then colour, then export",
          "Whichever is due soonest",
          "Randomly, to stay fresh",
        ],
        correct: 1,
        why: "Stage batching removes tool and mode switching, which is most of the time cost. It also makes your output consistent across the set.",
      },
      {
        question: "How do you stop endless revisions?",
        options: [
          "Charge more",
          "A written revision limit plus feedback with timecodes",
          "Deliver faster",
          "Ask for approval at every step",
        ],
        correct: 1,
        why: "Vague feedback is what makes revisions endless, not the number of rounds. Timecodes force specificity and the limit gives you a place to stop.",
      },
    ],
    templates: [T_SOP],
    walkthroughs: [
      {
        tool: "CapCut",
        goal: "Build a short-form template you can reuse forty times",
        steps: [
          "Start a 1080x1920 project and save it as your base; never start from a blank one again.",
          "Import, then use Auto captions and immediately fix the brand and product names it will get wrong.",
          "Set caption style once — font, size, stroke, position above the UI safe zone — then Apply to all.",
          "Add your standard sound bed at around minus 18 dB under speech and a whoosh on each hard cut.",
          "Trim the head aggressively: delete everything before the first word or movement.",
          "Export at 1080p 30fps H.264, then watch it once on a phone before delivering. Always.",
        ],
        screenshot: "CapCut caption styling",
      },
      {
        tool: "Premiere Pro",
        goal: "Set up a batch-editing project that survives client changes",
        steps: [
          "Create bins: 01 Footage, 02 Audio, 03 Graphics, 04 Exports, 05 Sequences. Do it before importing.",
          "Build one master sequence with your title and caption styles saved as Motion Graphics templates.",
          "Use Text → Transcribe sequence for captions, then style once and save as a track style.",
          "Nest repeated intros so a change updates every clip at once.",
          "Name sequences client_date_hook_v1, and export via Media Encoder queue overnight.",
          "Keep a Project Manager copy per delivery so old versions stay reconstructable when the client changes their mind in week three.",
        ],
        screenshot: "Premiere bin structure",
      },
    ],
    practiceProject: {
      title: "Turn one long video into five shorts",
      brief:
        "Find any podcast episode or webinar on YouTube with a permissive owner or your own footage. Pull five shorts from it. This is exactly the deliverable most short-form clients buy, so the practice piece is also the sales piece.",
      steps: [
        "Watch at 1.5x and mark ten timestamps where something self-contained happens.",
        "Cut five of them to under 45 seconds each, hook in the first two seconds.",
        "Caption all five in one batch with a single consistent style.",
        "Write the hook text and caption for each as they would be posted.",
        "Put all five in one folder with a naming convention and a single preview link.",
      ],
    },
    clientLooksFor: [
      {
        title: "Short-Form Video Editor (Agency)",
        source: "RemoteOK",
        post: [
          "20 shorts per week from long-form source.",
          "48-hour turnaround, two revision rounds max.",
          "Send three examples with retention data if you have it.",
        ],
        reads: [
          "They already limit revisions, which means they have been burned; matching that discipline in your reply is reassuring.",
          "Retention data is rare from applicants. Even one screenshot puts you in the top few.",
          "Twenty a week is a systems job. Talk about templates and batching, not artistry.",
        ],
      },
      {
        title: "Video Editor for Course Creator",
        source: "OnlineJobs.ph",
        post: [
          "Edit lessons, then repurpose into social clips.",
          "Add captions, b-roll, and simple motion graphics.",
          "Must handle raw files over Google Drive reliably.",
        ],
        reads: [
          "Repurposing is the higher-value half. Price the shorts separately from the lesson edits.",
          "Reliable file handling sounds trivial and is the most common reason editors get fired.",
          "Course work is steady and predictable, which is worth a slightly lower rate if you need stability.",
        ],
      },
    ],
  },

  "operations-lead": {
    checklists: [
      [
        "Map one process end to end with every handoff and wait time marked.",
        "Ask the person who runs it what annoys them most about it.",
        "Do not change anything for a week. Watch it first.",
      ],
      [
        "List every automation running and who gets alerted when one fails.",
        "Add an error notification to the automation you would miss most.",
        "Write what happens manually if it goes down for a day.",
      ],
      [
        "Write the job description for the next person you would hire.",
        "Build a two-week onboarding plan with a task they own by day five.",
        "Set up a weekly fifteen-minute one-to-one and never cancel it.",
      ],
      [
        "Pick the five numbers the business actually runs on.",
        "Build one dashboard, and delete the metrics nobody has ever asked about.",
        "Fix the weekly meeting time and the agenda shape.",
      ],
      [
        "Write down what you own now that you did not own six months ago.",
        "Quantify one thing: hours saved, cost avoided, revenue enabled.",
        "Ask for the title and the number in the same conversation, with a date.",
      ],
    ],
    quiz: [
      {
        question: "You inherit a broken process. What comes first?",
        options: [
          "Redesign it properly",
          "Map it as it is and watch it run for a week",
          "Automate the worst step",
          "Hire someone to run it",
        ],
        correct: 1,
        why: "Most process problems live in the handoffs and waits, which are invisible until you watch. Redesigning from the description gets you a beautiful version of the wrong process.",
      },
      {
        question: "What makes an automation dangerous?",
        options: [
          "Complexity",
          "Failing silently with nobody alerted",
          "Running too often",
          "Being built in a no-code tool",
        ],
        correct: 1,
        why: "A loud failure gets fixed in an hour. A silent one is discovered by a customer, three weeks of bad data later.",
      },
      {
        question: "First two weeks with a new VA on your team. What matters most?",
        options: [
          "Full documentation of everything",
          "Them owning one real task by around day five",
          "Shadowing you for two weeks",
          "A detailed skills assessment",
        ],
        correct: 1,
        why: "Ownership creates learning and confidence faster than observation. Two weeks of shadowing produces someone who still cannot start.",
      },
      {
        question: "You want a promotion to ops lead. What do you bring?",
        options: [
          "A list of everything you do",
          "One quantified outcome plus the scope you already carry, and a specific ask",
          "A competing offer",
          "A request to discuss your career",
        ],
        correct: 1,
        why: "Nobody grants scope you have not already demonstrated. Show that you are doing the job, attach a number, then name the title and the figure.",
      },
    ],
    templates: [T_SOP, T_REPORT],
    walkthroughs: [
      {
        tool: "Make / Zapier",
        goal: "Build an automation that tells you when it breaks",
        steps: [
          "Sketch the flow on paper first: trigger, steps, what data moves, what could be missing.",
          "Build it with a test record, not live data. In Make use Run once and inspect every bundle.",
          "Add error handling on the step most likely to fail — usually the one hitting an external API.",
          "Route errors to a Slack channel or an email that a human reads daily. An error log nobody opens is not error handling.",
          "Add a filter so the scenario cannot process the same record twice; duplicate rows are the classic silent failure.",
          "Document it in the SOP template: what it does, what breaks it, and the manual fallback if it is down for a day.",
          "Review the run history monthly. Scenarios that have not fired in ninety days should be turned off deliberately.",
        ],
        screenshot: "Make scenario error handler",
      },
      {
        tool: "Notion / Airtable",
        goal: "Build the weekly operating rhythm",
        steps: [
          "One database for work in progress with an Owner, a Status, and a Next step date. Three fields is enough to start.",
          "Views: My work, Blocked, No next step. The third view is the one that finds rot.",
          "One dashboard page with the five numbers the business runs on, and nothing else.",
          "A weekly meeting doc created from a template: decisions needed, blockers, numbers, follow-ups from last week.",
          "Automate the reminder, not the thinking. The doc gets created for you; you still have to read it.",
          "Kill any metric nobody has referenced in two months. Dashboards die of clutter, not neglect.",
        ],
        screenshot: "Airtable views",
      },
    ],
    practiceProject: {
      title: "Fix one broken process, properly",
      brief:
        "Take a real process from your current work — reporting, onboarding, publishing, invoicing. Map it, measure it, redesign it, document it, and write the before-and-after. This is the single best artefact for moving from VA to ops lead pay.",
      steps: [
        "Map the current process with every step, owner, handoff, and wait time.",
        "Time it honestly across three runs.",
        "Identify the two steps that consume most of the time and ask whether they need to exist at all.",
        "Redesign, automate one step, and write the SOP.",
        "Measure three more runs and write the before-and-after in five lines with one number.",
      ],
      template: T_SOP,
    },
    clientLooksFor: [
      {
        title: "Operations Manager / Chief of Staff",
        source: "OnlineJobs.ph, PHP 110k–160k/mo",
        post: [
          "Build the systems that let the founder stop being the bottleneck.",
          "Manage a small remote team.",
          "You will be measured on things shipping without the founder involved.",
        ],
        reads: [
          "The measurement line is unusual and honest. Answer it directly with an example of something that ran without you.",
          "Managing a small team means people work, not just process work. Have a story about a difficult performance conversation.",
          "This band exists in PH and it is reachable from a VA background in about two years of deliberate scope-taking.",
        ],
      },
      {
        title: "AI Operations Lead",
        source: "RemoteOK",
        post: [
          "Automate internal workflows with Make, Zapier, and LLM tooling.",
          "Document everything you build.",
          "Comfortable owning failure modes and monitoring.",
        ],
        reads: [
          "“Failure modes and monitoring” is the sentence that separates a builder from a tinkerer. Talk about alerts and fallbacks.",
          "Documentation named explicitly means the last person left a mess. Bring an SOP sample.",
          "LLM tooling in an ops seat is the fastest-growing rate band in this market right now.",
        ],
      },
    ],
  },

  "project-management": {
    checklists: [
      [
        "Break the next project into tasks no longer than two days each.",
        "Add the buffer explicitly instead of padding each estimate quietly.",
        "Get the deadline agreed by the person who has to do the work, not just the client.",
      ],
      [
        "Replace one status meeting with a written update this week.",
        "Set the standup to three questions and hold it to ten minutes.",
        "Note who talks least and ask them directly.",
      ],
      [
        "Write your chase message template: friendly, specific, with a date.",
        "Chase in public channels for visibility and in DMs for the third attempt.",
        "Never chase without saying what is blocked by it.",
      ],
      [
        "Start a risk log with three real risks and an owner for each.",
        "Write the escalation email before you need it.",
        "Agree with your client what counts as an escalation, in advance.",
      ],
      [
        "Book the post-mortem before the project ends.",
        "Ask what we would do differently, not who caused it.",
        "Turn one lesson into a change to the template, or it did not happen.",
      ],
    ],
    quiz: [
      {
        question: "How long should a task be in a project plan?",
        options: [
          "Whatever it takes",
          "Under about two days",
          "One week blocks",
          "One task per phase",
        ],
        correct: 1,
        why: "Tasks longer than two days hide their progress. You find out they are late at the deadline, which is exactly too late to act.",
      },
      {
        question: "Where should buffer live in a schedule?",
        options: [
          "Hidden inside each estimate",
          "Explicitly, as its own line, at the end",
          "Nowhere; pad the deadline",
          "In everyone's individual tasks",
        ],
        correct: 1,
        why: "Hidden buffer gets consumed silently and then you have none. Explicit buffer is defensible, visible, and negotiable.",
      },
      {
        question: "Third chase and someone is still not responding. Best move?",
        options: [
          "Escalate to their manager immediately",
          "Say what is now blocked, name the decision date, and copy the person who cares about that date",
          "Do the work yourself",
          "Wait another few days",
        ],
        correct: 1,
        why: "Escalation is about consequence and clarity, not authority. Naming the blocked thing usually moves it without a fight.",
      },
      {
        question: "What makes a post-mortem worth holding?",
        options: [
          "Everyone gets to say how they felt",
          "One lesson turns into a change in the template or process",
          "Producing a written record",
          "Identifying who caused the delay",
        ],
        correct: 1,
        why: "A retro that changes nothing is theatre. One concrete change to how the next project starts is the entire return.",
      },
    ],
    templates: [T_SOP, T_REPORT],
    walkthroughs: [
      {
        tool: "ClickUp / Asana",
        goal: "Set up an agency project that will not rot",
        steps: [
          "Build one Space per client, one List per project. Resist per-department structures; nobody works that way.",
          "Custom fields: Owner, Due date, Blocked by, Effort. Four is enough. Every extra field is a field someone will leave blank.",
          "Create a project template with the phases you always run, then instantiate it rather than building fresh.",
          "Views: Board by status for the team, Calendar for the client, and a filtered list for “due this week with no owner”.",
          "Set the rule that a task with no owner and no date is not a task, and clear those weekly.",
          "Automate the status nudge, never the status judgement. The tool reminds; you interpret.",
          "Share a client-facing view with limited permissions instead of exporting screenshots every Friday.",
        ],
        screenshot: "ClickUp custom fields",
      },
    ],
    practiceProject: {
      title: "Plan and run a two-week project on paper",
      brief:
        "Take a website redesign for a small business, fully scoped. Plan it, then simulate the week where everything goes wrong, because handling that week is what agencies actually hire a PM for.",
      steps: [
        "Break the project into tasks under two days each with owners and dependencies.",
        "Add explicit buffer and mark the critical path.",
        "Now apply the disruptions below and re-plan.",
        "Write the escalation email to the client explaining the new date, with options.",
        "Write the post-mortem, including the one template change you would make.",
      ],
      sampleData:
        "Disruptions: the designer is sick for three days in week one; the client's approval takes five days instead of one; the copywriter delivers 40% more content than scoped; the developer discovers the old site has no backups. Original deadline is fourteen days from kickoff.",
      template: T_SOP,
    },
    clientLooksFor: [
      {
        title: "Project Manager, Full-Service Marketing Agency",
        source: "OnlineJobs.ph, PHP 110k–160k/mo",
        post: [
          "Manage 8–12 concurrent client projects.",
          "Chase internal teams and keep clients informed.",
          "Include the phrase “Candor as a Compass” in your subject line.",
        ],
        reads: [
          "The subject-line codeword is a filter for people who read to the end. Miss it and nothing else matters.",
          "Chasing internal teams is the actual job. Give an example of moving someone senior who was ignoring you.",
          "Concurrent projects means your system matters more than your effort. Describe the system in three lines.",
        ],
      },
      {
        title: "Technical Project Coordinator",
        source: "RemoteOK",
        post: [
          "Run standups, maintain the risk log, own the release calendar.",
          "Translate between engineers and non-technical stakeholders.",
          "No micromanaging; the team is senior.",
        ],
        reads: [
          "Risk log ownership named in a post is unusual and tells you they have been surprised before. Bring one.",
          "Translating is a writing skill. A clear one-page status sample is a strong attachment.",
          "Senior teams want a PM who removes obstacles, not one who asks for percentages complete.",
        ],
      },
    ],
  },

  "bookkeeping-basics": {
    checklists: [
      [
        "Write out the five account types and one example of each from a real business.",
        "Take three transactions and write the debit and credit for each by hand.",
        "Check that your example balance sheet actually balances.",
      ],
      [
        "Reconcile one month of a real or sample bank feed to the last cent.",
        "Investigate, do not guess, on anything unmatched.",
        "Note every recurring transaction that could be a bank rule.",
      ],
      [
        "Build an AP run schedule and stick to one payment day a week.",
        "Age the receivables and identify anything over 30 days.",
        "Draft the polite chase email for a 45-day invoice.",
      ],
      [
        "Write your month-end close checklist in order, with an owner and a day.",
        "Close one month against it and time how long it takes.",
        "Note the step that always causes the delay.",
      ],
      [
        "Learn what your accountant means by accrual, prepayment, and journal.",
        "Ask which reports they want and in what format at year end.",
        "Send one clean question instead of five vague ones.",
      ],
    ],
    quiz: [
      {
        question: "A client pays for a year of software up front in January. What is it in month one?",
        options: [
          "A full expense in January",
          "A prepayment (asset) released monthly",
          "A liability",
          "Equity",
        ],
        correct: 1,
        why: "Matching principle: the cost belongs to the months that get the benefit. Expensing it all in January makes January look terrible and the rest of the year look great.",
      },
      {
        question: "A bank line will not match anything in the ledger. What do you do?",
        options: [
          "Code it to miscellaneous and move on",
          "Investigate and ask, leaving it unreconciled until you know",
          "Delete it",
          "Match it to the closest amount",
        ],
        correct: 1,
        why: "A guessed match is worse than an open item, because it looks resolved. Unreconciled and flagged is honest and fixable.",
      },
      {
        question: "Why run accounts payable on a fixed day each week?",
        options: [
          "Suppliers prefer it",
          "It stops ad hoc payments and makes cash predictable",
          "Software requires it",
          "It reduces bank fees",
        ],
        correct: 1,
        why: "Random payments destroy cash visibility and create duplicate-payment risk. One payment day a week is the single easiest control to add.",
      },
      {
        question: "Most useful thing in a month-end close checklist?",
        options: [
          "Every possible step listed",
          "Steps in dependency order with an owner and a day",
          "A reminder to reconcile",
          "The accountant's contact details",
        ],
        correct: 1,
        why: "Close is a sequencing problem. Order plus ownership is what turns a five-day close into a two-day one.",
      },
    ],
    templates: [T_INVOICE, T_SOP],
    walkthroughs: [
      {
        tool: "Xero",
        goal: "Set up a small business file and reconcile a month cleanly",
        steps: [
          "Accounting → Chart of accounts: start from the default and delete what the business will never use. A 40-account chart nobody understands is worse than a 20-account one they do.",
          "Add tracking categories only if the owner will actually use the split — usually location or service line.",
          "Business → Bank accounts → connect the feed, then set the conversion date so you are not importing five years of history.",
          "Bank rules for anything recurring and unambiguous: subscriptions, bank fees, payroll. Never a rule for anything variable.",
          "Reconcile oldest first. Anything unmatched goes to a query list, not to a suspense account you will forget.",
          "Reports → Account Transactions on the largest expense account, and eyeball it. Odd numbers show up faster to the eye than to a rule.",
          "Lock the period once reconciled: Advanced → Financial settings → Lock dates. This is how you stop history changing under you.",
        ],
        screenshot: "Xero chart of accounts",
      },
      {
        tool: "QuickBooks Online",
        goal: "The same job in the other tool clients will ask for",
        steps: [
          "Settings → Chart of accounts → import a trimmed CSV rather than editing 90 defaults by hand.",
          "Settings → Account and settings → Advanced → turn on Close the books with a password once a period is done.",
          "Banking → Rules for recurring items; QBO's auto-categorisation guesses confidently and wrongly, so review before accepting.",
          "Use Projects or Classes if the client bills by job; decide once, because retrofitting is painful.",
          "Reports → Reconciliation Discrepancy after every close. If it is not zero, something was edited post-reconciliation.",
          "Set up recurring invoices for retainer clients and a reminder schedule at 7, 14, and 30 days overdue.",
        ],
        screenshot: "QBO banking rules",
      },
    ],
    practiceProject: {
      title: "Close a fictional month",
      brief:
        "Twenty transactions, one bank statement, one deliberately awkward month. Do the whole close and produce the two reports an owner actually reads. Bookkeeping clients hire on evidence of accuracy, and this is evidence.",
      steps: [
        "Enter the transactions below into a sheet, or into a Xero or QBO trial file.",
        "Reconcile against the statement total and list every discrepancy you find.",
        "Handle the prepayment and the duplicate correctly, and write one line explaining each.",
        "Produce a simple P&L and a cash summary for the month.",
        "Write the three questions you would send the owner. Exactly three, clearly worded.",
      ],
      sampleData:
        "Month: March. Opening bank ₱182,400. Income: 3 client payments ₱45,000, ₱62,000, ₱38,500. Expenses: rent ₱18,000, internet ₱1,647, software paid annually ₱24,000 on 3 March, contractor ₱22,000, contractor ₱22,000 again on the same day (duplicate, one was refunded on 9 March), supplies ₱4,320, bank fees ₱450, owner withdrawal ₱30,000, unexplained debit ₱7,900 on 21 March. Closing bank per statement ₱219,583.",
      template: T_SOP,
    },
    clientLooksFor: [
      {
        title: "Bookkeeper (Xero) for US Agency",
        source: "OnlineJobs.ph",
        post: [
          "Monthly close by the 5th working day.",
          "Manage AP runs and chase receivables.",
          "Xero certification preferred.",
        ],
        reads: [
          "A named close deadline means the current close is late. Talk about your checklist and sequencing, not your speed.",
          "Chasing receivables is a communication job, not an accounting one. Show a chase email you would send.",
          "The certification is free and takes a weekend. In this niche it visibly moves the rate.",
        ],
      },
      {
        title: "Bookkeeping & Admin VA (QBO)",
        source: "RemoteOK",
        post: [
          "Categorise transactions, reconcile, and prepare monthly reports.",
          "Flag anything unusual rather than guessing.",
          "Will work directly with our CPA at year end.",
        ],
        reads: [
          "“Flag rather than guess” is the whole personality requirement of this job. Say it back to them in your own words.",
          "Working with a CPA means your file has to be legible to a stranger. Mention lock dates and clean documentation.",
          "Year-end involvement is where you learn fastest. Take this even at a slightly lower rate if you are new.",
        ],
      },
    ],
  },

  "web-and-no-code": {
    checklists: [
      [
        "Ask who will edit the site after you leave, and pick for them.",
        "Write down the three things the site must do, then check the platform does all three natively.",
        "Price the ongoing cost, not just the build.",
      ],
      [
        "Run the live site through PageSpeed Insights on mobile and record the three worst items.",
        "Compress and convert the largest images before touching anything clever.",
        "Re-test and record the difference so you can show it.",
      ],
      [
        "Submit every form on the site yourself and confirm where the message lands.",
        "Add a notification for failed submissions, not just successful ones.",
        "Test the integration once with a real address after launch, not before.",
      ],
      [
        "Set up automatic backups and prove you can restore one.",
        "Write the handover doc: logins, hosting, domain, plugins, renewal dates.",
        "Propose the maintenance retainer before the build invoice is sent.",
      ],
      [
        "Rebuild one small section by hand in HTML and CSS, no builder.",
        "Learn flexbox properly, then grid. Ignore everything else for now.",
        "Read the generated code your builder produces and find one thing you would change.",
      ],
    ],
    quiz: [
      {
        question: "How should you choose a platform for a client site?",
        options: [
          "The one you are fastest in",
          "The one the person maintaining it afterwards can actually use",
          "The cheapest hosting",
          "Whatever is newest",
        ],
        correct: 1,
        why: "You are building someone else's tool. A site the owner cannot edit becomes a permanent support ticket or a dead site within a year.",
      },
      {
        question: "Biggest single page-speed win on most small sites?",
        options: [
          "Minifying CSS",
          "Images: compressed, correctly sized, modern format",
          "A different host",
          "Removing animations",
        ],
        correct: 1,
        why: "Uncompressed hero images routinely account for most of the payload. Do the boring one before anything clever.",
      },
      {
        question: "What is the most commonly missed test at launch?",
        options: [
          "Mobile layout",
          "Submitting every form and confirming where it lands",
          "Favicon",
          "SSL certificate",
        ],
        correct: 1,
        why: "Forms fail silently, and nobody notices until a client asks why nobody has enquired in three weeks. Test with a real address, after launch.",
      },
      {
        question: "When do you propose the maintenance retainer?",
        options: [
          "After the first problem",
          "Before the final build invoice",
          "At the annual renewal",
          "Never; wait for them to ask",
        ],
        correct: 1,
        why: "Right after launch is the moment they value the site most. Ask later and it reads as a reaction to something breaking.",
      },
    ],
    templates: [T_SOP, T_CONTRACT],
    walkthroughs: [
      {
        tool: "Webflow",
        goal: "Build a client site that is fast and handoverable",
        steps: [
          "Set up the style guide page first: define classes for text sizes, buttons, and section padding. Never style an element without a class.",
          "Use the CMS for anything the client will add to. Static pages for anything they will not.",
          "Images: upload at 2x the display size maximum, and let Webflow serve responsive variants. Do not upload the 4MB original.",
          "Set up 301 redirects in Project Settings before switching the domain, mapping every old URL.",
          "Turn on Editor access for the client with only the CMS collections they need, not the Designer.",
          "Before launch: run Audit in the Designer, fix missing alt text and empty links, then Publish to the staging domain and test forms.",
          "Handover doc must include the Webflow plan cost, the domain registrar, renewal dates, and who owns the account.",
        ],
        screenshot: "Webflow style guide page",
      },
      {
        tool: "WordPress",
        goal: "Take over an inherited site without breaking it",
        steps: [
          "Take a full backup before touching anything — UpdraftPlus or the host's own snapshot — and restore it once to prove it works.",
          "Audit plugins: deactivate anything not updated in a year, one at a time, checking the site after each.",
          "Set up a staging site through the host. Never update plugins on production for a client who sells anything.",
          "Install a caching plugin and an image optimiser before considering a new theme.",
          "Check user accounts and remove the three ex-freelancers who still have admin.",
          "Set automatic backups to somewhere that is not the same server, and put the restore steps in the handover doc.",
        ],
        screenshot: "WordPress plugin audit",
      },
    ],
    practiceProject: {
      title: "Rebuild a bad small-business page and prove the difference",
      brief:
        "Find a slow, dated page for a real business. Rebuild one page of it properly, measure both, and write the one-page case study. Web clients buy evidence; a before-and-after with numbers is the whole pitch.",
      steps: [
        "Record the original PageSpeed mobile score and the three worst diagnostics.",
        "Rebuild the page in your platform of choice, keeping the same content.",
        "Compress and convert every image, and set explicit width and height attributes.",
        "Re-test and record the new score.",
        "Write the case study: the problem, what you changed, the numbers, and what you would do next with a bigger budget.",
      ],
    },
    clientLooksFor: [
      {
        title: "Webflow Developer (Contract)",
        source: "RemoteOK",
        post: [
          "Build from Figma designs, pixel accurate.",
          "CMS setup so our marketing team can publish without us.",
          "Site must score 90+ on mobile PageSpeed.",
        ],
        reads: [
          "A named performance score is a testable requirement. Bring a live URL and its score.",
          "“Without us” means CMS structure and Editor permissions matter more than visual flair.",
          "Pixel accurate from Figma means they will check. Learn to read Dev Mode measurements properly.",
        ],
      },
      {
        title: "No-Code Builder / Automation (Base44, Airtable)",
        source: "OnlineJobs.ph",
        post: [
          "Build internal tools, not marketing sites.",
          "Integrate with our existing stack and document it.",
          "Must be comfortable when the tool cannot do what we want.",
        ],
        reads: [
          "Internal tools pay better than marketing sites and the work is steadier.",
          "The last line is asking whether you can say “that needs code” instead of building something fragile. Say yes plainly.",
          "Documentation requirements keep appearing in this niche because handovers here are usually terrible.",
        ],
      },
    ],
  },

  "ecommerce-operations": {
    checklists: [
      [
        "Rewrite one product page around the question a buyer asks before purchase.",
        "Check every variant has the right image, price, and stock status.",
        "Fix the title and meta so the listing reads well in search and in a share preview.",
      ],
      [
        "Set a reorder point for the top ten products and write it in the sheet.",
        "Ask the supplier for their real lead time, not their stated one.",
        "Write the stockout drill: what you change on the site, and what you tell customers.",
      ],
      [
        "Read the refund policy and make sure it matches what support actually does.",
        "Learn what evidence your payment processor wants for a chargeback.",
        "Build the template response for the three most common order problems.",
      ],
      [
        "List every installed app and what it costs per month.",
        "Uninstall two you cannot justify and check the theme still works.",
        "Duplicate the theme before editing it, every single time.",
      ],
      [
        "Look at conversion rate by device and by traffic source, not just overall.",
        "Find the product with high traffic and low conversion and diagnose why.",
        "Write the one fix you would make next week and what you expect it to do.",
      ],
    ],
    quiz: [
      {
        question: "Traffic is up, orders are down, support tickets tripled. Where do you look first?",
        options: [
          "Ad creative",
          "Fulfilment, stock, and delivery — an operations failure",
          "The homepage",
          "Email frequency",
        ],
        correct: 1,
        why: "Tickets tripling alongside falling conversion is the signature of something breaking after the click. Marketing did not cause it and cannot fix it.",
      },
      {
        question: "Before editing a Shopify theme, what do you always do?",
        options: [
          "Take a screenshot",
          "Duplicate the theme and edit the copy",
          "Put the store in maintenance mode",
          "Notify the client",
        ],
        correct: 1,
        why: "Live theme edits are unrecoverable in the moment and stores lose money by the minute. Duplicating costs ten seconds.",
      },
      {
        question: "What is a reorder point?",
        options: [
          "The date you order more stock",
          "The stock level at which you must order, based on lead time and sales rate",
          "The minimum order the supplier accepts",
          "The point where a product becomes unprofitable",
        ],
        correct: 1,
        why: "It is a level, not a date. Lead time times daily sales, plus a safety buffer, is the whole calculation and it prevents most stockouts.",
      },
      {
        question: "A chargeback comes in. What decides whether you win it?",
        options: [
          "How politely you respond",
          "The evidence you can produce: delivery proof, communications, and policy shown at checkout",
          "Whether the customer is lying",
          "Order value",
        ],
        correct: 1,
        why: "Chargebacks are a documentation contest, judged by someone who never speaks to either party. Know what your processor wants before you need it.",
      },
    ],
    templates: [T_REPORT, T_SOP],
    walkthroughs: [
      {
        tool: "Shopify admin",
        goal: "The daily and weekly operating routine for a store",
        steps: [
          "Daily: Orders → filter unfulfilled over 24 hours. That queue is the one that generates tickets.",
          "Daily: Products → filter by inventory less than reorder point, saved as a view.",
          "Weekly: Analytics → Reports → Sessions by device and Conversion by device. A mobile-only drop is a theme or speed problem.",
          "Weekly: Reports → Products with sessions but no orders. That is your fix list.",
          "Before any theme change: Online Store → Themes → Duplicate → rename with today's date → edit the copy → preview → publish.",
          "Apps: check the monthly bill against the app list quarterly. Stores accumulate £200 a month of forgotten apps.",
          "Set up a Draft order to test the whole checkout, including a discount code, after every theme publish.",
        ],
        screenshot: "Shopify unfulfilled orders view",
      },
    ],
    practiceProject: {
      title: "Diagnose a store that is quietly bleeding",
      brief:
        "Twelve weeks of data, one obvious pattern, one non-obvious cause. Read it like an operator, not a marketer, then write the report the owner needs. The sample data is in the report template's second tab.",
      steps: [
        "Chart sessions, orders, revenue, and tickets by week from the sample data.",
        "Identify the weeks where the relationship between them breaks.",
        "Write three plausible causes, then say which one the ticket volume supports.",
        "Write what you would check in the admin to confirm it, in order.",
        "Fill in the report template: five numbers, one paragraph, three next steps, one thing you need from the owner.",
      ],
      sampleData:
        "Use the Sample data tab in the monthly client report template. Twelve weeks of sessions, orders, revenue, ad spend, and support tickets for a small store. Weeks 8–10 are where it goes wrong.",
      template: T_REPORT,
    },
    clientLooksFor: [
      {
        title: "Ecommerce Operations VA (Shopify)",
        source: "OnlineJobs.ph, PHP 45k–100k/mo",
        post: [
          "Own fulfilment, supplier comms, product uploads, and customer issues.",
          "Peak season is Q4; we need someone who does not disappear.",
          "Basic theme edits and app management.",
        ],
        reads: [
          "Q4 reliability is their real fear. Address availability and backup plans directly.",
          "The scope spans four jobs, which means the rate should reflect it. Ask what the previous person covered.",
          "“Basic theme edits” is where stores get broken. Mention that you duplicate before editing and you will stand out.",
        ],
      },
      {
        title: "Ecommerce Growth & Ops Manager",
        source: "RemoteOK",
        post: [
          "Own inventory planning and margin, not just tasks.",
          "Work with the ads agency on what to push.",
          "Report weekly on contribution margin.",
        ],
        reads: [
          "Margin ownership is the top of this niche. Learn to calculate contribution margin before applying.",
          "Working with an ads agency means you decide what gets promoted based on stock and margin. That is a real seat at the table.",
          "Weekly margin reporting means they will notice a number you got wrong. Slow down and be right.",
        ],
      },
    ],
  },
};
