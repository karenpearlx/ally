type Experience = { title?: string; company?: string; description?: string; highlights?: string[] };
export type CoverLetterProfile = {
  full_name?: string | null;
  bio?: string | null;
  skills?: string[] | null;
  experience_years?: number | null;
  experience?: Experience[] | null;
};

const STOP_WORDS = new Set('a an and are as at be by for from has have in is it its of on or our that the their this to we will with you your'.split(' '));

function words(value: string) {
  return value.toLowerCase().match(/[a-z][a-z0-9+.#-]{2,}/g)?.filter((word) => !STOP_WORDS.has(word)) ?? [];
}

function sentence(value: string) {
  const clean = value.trim().replace(/\s+/g, ' ');
  if (!clean) return '';
  return /[.!?]$/.test(clean) ? clean : `${clean}.`;
}

function relevantSkills(profile: CoverLetterProfile, listing: string) {
  const listingWords = new Set(words(listing));
  return (profile.skills ?? [])
    .filter((skill) => words(skill).some((word) => listingWords.has(word)))
    .slice(0, 4);
}

function relevantExperience(profile: CoverLetterProfile, listing: string) {
  const listingWords = new Set(words(listing));
  return (profile.experience ?? [])
    .map((item) => ({
      item,
      score: words([item.title, item.description, ...(item.highlights ?? [])].filter(Boolean).join(' '))
        .reduce((total, word) => total + (listingWords.has(word) ? 1 : 0), 0),
    }))
    .sort((a, b) => b.score - a.score)[0]?.item;
}

function roleFromListing(listing: string, supplied?: string | null) {
  if (supplied?.trim()) return supplied.trim();
  const firstLine = listing.split(/\n/).map((line) => line.trim()).find(Boolean);
  return firstLine && firstLine.length <= 120 ? firstLine.replace(/^(job title|role)\s*:\s*/i, '') : 'this role';
}

export function generateCoverLetter({
  listing,
  profile,
  jobTitle,
  company,
}: {
  listing: string;
  profile: CoverLetterProfile;
  jobTitle?: string | null;
  company?: string | null;
}) {
  const role = roleFromListing(listing, jobTitle);
  const skills = relevantSkills(profile, listing);
  const experience = relevantExperience(profile, listing);
  const greeting = company?.trim() ? `Hi ${company.trim()} team,` : 'Hi hiring team,';

  let fit = '';
  if (skills.length) {
    fit = `The role lines up well with my background in ${skills.join(', ')}.`;
  } else if (profile.bio) {
    fit = sentence(profile.bio);
  } else if (profile.experience_years) {
    fit = `I bring ${profile.experience_years} years of relevant experience and a practical, organized approach to the work.`;
  } else {
    fit = 'The work described here lines up with the kind of organized, dependable support I provide.';
  }

  let proof = '';
  if (experience) {
    const context = [experience.title, experience.company ? `at ${experience.company}` : null].filter(Boolean).join(' ');
    const highlight = experience.highlights?.find(Boolean) ?? experience.description;
    const normalizedHighlight = sentence(highlight ?? '').replace(/^I\s+/i, '').replace(/^./, (letter) => letter.toLowerCase());
    proof = highlight
      ? `In my ${context || 'recent work'}, I ${normalizedHighlight}`
      : `My experience as ${context || 'a remote professional'} taught me to take ownership, communicate clearly, and keep work moving without constant supervision.`;
  } else {
    proof = 'I am comfortable taking ownership, communicating clearly, and keeping work moving without constant supervision.';
  }

  return [
    greeting,
    '',
    `I'm applying for ${role}. ${fit}`,
    '',
    proof,
    '',
    "I'd be glad to discuss what you need and how I can help.",
    '',
    'Best,',
    profile.full_name?.trim() || 'Your name',
  ].join('\n');
}
