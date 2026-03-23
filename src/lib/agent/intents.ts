// Intent detection using a scored, weighted-pattern system.
//
// Each intent has an array of (regex, weight) pairs. The query is tested
// against every rule; scores accumulate. The intent with the highest total
// score wins. Ties break toward more specific intents via ordering.
//
// Why this beats simple first-match regex:
//   "compare networking and security projects"
//   → comparison scores 5 (compare) + 2 (and) = 7
//   → projects scores 2 (projects) = 2
//   → comparison wins correctly

import type { Intent } from './types';

interface WeightedPattern {
  re: RegExp;
  weight: number;
}

interface IntentRule {
  intent: Intent;
  patterns: WeightedPattern[];
}

// ── Rules ─────────────────────────────────────────────────────────────────────
// Rules are listed from most-specific to least-specific.
// Higher weights = stronger signal for that intent.

const RULES: IntentRule[] = [
  // ── Greeting ──
  {
    intent: 'greeting',
    patterns: [
      { re: /\b(hello|hi|hey|howdy|sup)\b/i, weight: 4 },
      { re: /\b(start|help|what can you|what do you do)\b/i, weight: 3 },
      { re: /^(yo|hiya|greetings)$/i, weight: 4 },
    ],
  },

  // ── Comparison ── (must be before projects to win "compare projects")
  {
    intent: 'comparison',
    patterns: [
      { re: /\bcompar(e|ing|ison)\b/i, weight: 5 },
      { re: /\bversus\b|\bvs\.?\b/i, weight: 5 },
      { re: /\bdifference between\b|\bdiffer(ent|s)?\b/i, weight: 4 },
      { re: /\b(how does .+ (differ|compare))\b/i, weight: 4 },
      { re: /\b(both|either|which is better)\b/i, weight: 2 },
    ],
  },

  // ── Recommendation ── (must be before projects)
  {
    intent: 'recommendation',
    patterns: [
      { re: /\b(recommend|suggest|advise)\b/i, weight: 5 },
      { re: /\bwhat should i (look at|see|read|focus on|start with)\b/i, weight: 5 },
      { re: /\bbest (project|work|experience|cert)\b/i, weight: 4 },
      { re: /\bfor (a|an) (recruiter|engineer|founder|hiring|infrastructure|network)\b/i, weight: 4 },
      { re: /\bif i.?m a\b/i, weight: 4 },
      { re: /\bwhat.?s (most|the) relevant\b/i, weight: 4 },
      { re: /\bwhere should i (start|begin)\b/i, weight: 4 },
    ],
  },

  // ── Navigation ──
  {
    intent: 'navigation',
    patterns: [
      { re: /\b(take me to|go to|navigate to|jump to|open)\b/i, weight: 5 },
      { re: /\bshow me (the )?(page|section|tab)\b/i, weight: 4 },
      { re: /\bgo (back|home)\b/i, weight: 3 },
    ],
  },

  // ── Explanation ──
  {
    intent: 'explanation',
    patterns: [
      { re: /\bwhat is\b|\bwhat are\b/i, weight: 4 },
      { re: /\bexplain\b|\bhow does\b|\bhow do\b/i, weight: 4 },
      { re: /\bwhat does .+ (mean|stand for|cover|do)\b/i, weight: 4 },
      { re: /\btell me (more |about )?(what|how|why)\b/i, weight: 3 },
      { re: /\bwhy (ai|infra|network|automat|observ|zero.?trust)\b/i, weight: 4 },
      { re: /\b(dcgm|ebpf|zero.?trust|iac|netconf|yang|soar|nvlink|infiniband)\b/i, weight: 3 },
    ],
  },

  // ── Recruiter summary ──
  {
    intent: 'recruiter_summary',
    patterns: [
      { re: /\brecruiter (summary|brief|view|mode)\b/i, weight: 6 },
      { re: /\bsummari(ze|se) for (a )?recruiter\b/i, weight: 6 },
      { re: /\b(30.second|quick|concise|brief|tldr|tl.dr) summary\b/i, weight: 4 },
      { re: /\brecruiter.?friendly\b/i, weight: 5 },
      { re: /\bhiring (summary|brief|overview)\b/i, weight: 5 },
    ],
  },

  // ── Contact ──
  {
    intent: 'contact',
    patterns: [
      { re: /\b(contact|reach|get in touch)\b/i, weight: 4 },
      { re: /\bemail\b|\blinkedin\b|\bgithub\b/i, weight: 3 },
      { re: /\bhow (do i|can i|to) (contact|reach|connect)\b/i, weight: 5 },
    ],
  },

  // ── Availability ──
  {
    intent: 'availability',
    patterns: [
      { re: /\bavailab(le|ility)\b/i, weight: 5 },
      { re: /\bopen to\b|\blooking for (a |new )?(job|role|opportunity|work)\b/i, weight: 5 },
      { re: /\bjob search\b|\bjob hunt\b/i, weight: 5 },
      { re: /\bcurrently (working|available|hiring)\b/i, weight: 4 },
      { re: /\bwhat roles.*(target|look|seek)\b/i, weight: 4 },
      { re: /\bopen.to.full.time\b/i, weight: 5 },
    ],
  },

  // ── Bio ──
  {
    intent: 'bio',
    patterns: [
      { re: /\bwho is (rishabh|he|you)\b/i, weight: 5 },
      { re: /\babout (rishabh|him|you)\b/i, weight: 4 },
      { re: /\bintroduce\b|\bintroduction\b/i, weight: 3 },
      { re: /\btell me about (rishabh|him|yourself)\b/i, weight: 4 },
      { re: /\b(background|overview|profile) (of |about )?(rishabh|him|the candidate)\b/i, weight: 4 },
    ],
  },

  // ── Experience ──
  {
    intent: 'experience',
    patterns: [
      { re: /\b(work|job|role|career) (history|experience|background)\b/i, weight: 5 },
      { re: /\bwhere (has he|did he) work(ed)?\b/i, weight: 5 },
      { re: /\bwipro\b/i, weight: 5 },
      { re: /\bprevious (employer|role|company|job)\b/i, weight: 4 },
      { re: /\b(years? of )?experience\b/i, weight: 2 },
      { re: /\bwork history\b/i, weight: 4 },
    ],
  },

  // ── Certifications ──
  {
    intent: 'certifications',
    patterns: [
      { re: /\bcertif(ication|ied|icate)s?\b/i, weight: 4 },
      { re: /\bccnp\b|\bccna\b/i, weight: 4 },
      { re: /\bnvidia (cert|certification)\b/i, weight: 4 },
      { re: /\b(qual(ification|s)?|credential|badge)\b/i, weight: 3 },
      { re: /\bcert(s)?\b/i, weight: 3 },
    ],
  },

  // ── Skills ──
  {
    intent: 'skills',
    patterns: [
      { re: /\b(technical )?skill(s|set)?\b/i, weight: 4 },
      { re: /\btech(nology|nologies|nical)? (stack|tools?)\b/i, weight: 4 },
      { re: /\bwhat (can he|does he know|tools)\b/i, weight: 3 },
      { re: /\bprogramming language\b/i, weight: 3 },
      { re: /\b(tools?|languages?|frameworks?|platform) (he uses|he knows|used)\b/i, weight: 4 },
    ],
  },

  // ── Projects (broadest — last among content intents) ──
  {
    intent: 'projects',
    patterns: [
      { re: /\bproject(s)?\b/i, weight: 3 },
      { re: /\b(show|see|view|list) (the |his |all )?(projects?|work|portfolio|builds?)\b/i, weight: 4 },
      { re: /\bwhat (has he|did he) build\b/i, weight: 4 },
      { re: /\bportfolio\b/i, weight: 3 },
      { re: /\b(built|built|developed|created|implemented) (a |the )?\b/i, weight: 2 },
    ],
  },
];

// ── Detector ──────────────────────────────────────────────────────────────────

/**
 * Minimum accumulated score required for an intent to beat 'fallback'.
 * A threshold of 2 means a single weight-1 pattern can never win alone —
 * at least one weight-2 hit (or two weight-1 hits) is required, preventing
 * accidental routing on tangential keyword matches.
 */
const MIN_CONFIDENCE = 2;

/**
 * Returns the best-matching intent for a query using weighted pattern scoring.
 * Falls back to 'fallback' when no rule accumulates a score >= MIN_CONFIDENCE.
 */
export function detectIntent(query: string): Intent {
  let bestIntent: Intent = 'fallback';
  // Start one below the threshold so only scores >= MIN_CONFIDENCE can win.
  let bestScore = MIN_CONFIDENCE - 1;

  for (const rule of RULES) {
    const score = rule.patterns.reduce(
      (acc, p) => acc + (p.re.test(query) ? p.weight : 0),
      0,
    );
    if (score > bestScore) {
      bestScore = score;
      bestIntent = rule.intent;
    }
  }

  return bestIntent;
}
