// Entity extraction — pulls structured facts out of a raw user query.
//
// The extracted EntityMap is passed to every responder so they can shape
// answers based on what the user specifically asked about.

import { projects, certifications, skills } from '@/lib/knowledge';
import type { EntityMap, RoleType, DomainTag } from './types';

// ── Project name extraction ───────────────────────────────────────────────────

/**
 * Returns the titles of knowledge-base projects whose significant words
 * (length > 3) appear in the query. Uses a simple word-overlap heuristic.
 */
function extractProjectNames(q: string): string[] {
  const qWords = new Set(q.split(/\s+/).filter((w) => w.length > 3));
  return projects
    .filter((p) => {
      const pWords = p.title.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
      const overlap = pWords.filter((w) => qWords.has(w)).length;
      // Require at least 2 overlapping words to avoid false positives
      return overlap >= 2;
    })
    .map((p) => p.title);
}

// ── Skill name extraction ─────────────────────────────────────────────────────

/**
 * Returns individual skill strings from the knowledge base that appear
 * verbatim (case-insensitive) in the query.
 */
function extractSkillNames(q: string): string[] {
  const allSkills = skills.flatMap((s) => s.skills);
  return allSkills.filter((skill) => q.includes(skill.toLowerCase()));
}

// ── Certification name extraction ─────────────────────────────────────────────

/**
 * Returns knowledge-base certification names mentioned in the query.
 * Uses both full name and common abbreviation matching.
 */
function extractCertNames(q: string): string[] {
  return certifications
    .filter((c) => {
      const name = c.name.toLowerCase();
      return (
        q.includes(name) ||
        (name.includes('ccnp enterprise') && q.includes('ccnp enterprise')) ||
        (name.includes('ccnp encor') && q.includes('encor')) ||
        (name.includes('ccnp enauto') && (q.includes('enauto') || q.includes('network auto'))) ||
        (name.includes('ccna') && q.includes('ccna')) ||
        (name.includes('nvidia') && (q.includes('nvidia') || q.includes('dcgm') || q.includes('gpu cert')))
      );
    })
    .map((c) => c.name);
}

// ── Role type detection ───────────────────────────────────────────────────────

/**
 * Infers the visitor's mindset from the phrasing of their query.
 * Explicit role declarations win; implicit signals (technical vocabulary,
 * summary requests) are used as fallback inference.
 */
function detectRoleType(query: string): RoleType {
  // Explicit role declarations
  if (/\b(i.?m a recruiter|as a recruiter|i.?m recruiting|i recruit|talent acquisition)\b/i.test(query)) {
    return 'recruiter';
  }
  if (/\b(hiring manager|i manage a team|i.?m a manager|we.?re (hiring|looking))\b/i.test(query)) {
    return 'hiring_manager';
  }
  if (/\b(i.?m (a|an) (engineer|developer|architect|sre|devops|ops))\b/i.test(query)) {
    return 'engineer';
  }
  if (/\b(founder|startup|cto|i.?m building|my company)\b/i.test(query)) {
    return 'founder';
  }

  // Implicit signals — technical vocabulary → engineer mindset
  if (/\b(architecture|implementation|how does|technical|deep dive|stack|codebase|internals)\b/i.test(query)) {
    return 'engineer';
  }

  // Implicit signals — summary/hiring vocabulary → recruiter mindset
  if (/\b(summary|brief|highlight|tldr|tl.dr|for a recruiter|hire|hiring|candidate)\b/i.test(query)) {
    return 'recruiter';
  }

  return 'unknown';
}

// ── Domain tag extraction ─────────────────────────────────────────────────────

/**
 * Returns all domain tags detected in the query (can be multiple).
 */
function extractDomains(query: string): DomainTag[] {
  const domains: DomainTag[] = [];

  if (/\bnetwork(ing)?\b|\bcisco\b|\bbgp\b|\bospf\b|\brouting\b|\bswitching\b|\bvlan\b|\bsd.?wan\b/i.test(query)) {
    domains.push('networking');
  }
  if (/\bautomat(e|ion|ed|ing)?\b|\bpipeline\b|\bterraform\b|\bansible\b|\biac\b|\binfrastructure.as.code\b/i.test(query)) {
    domains.push('automation');
  }
  if (/\bobserv(ability)?\b|\bmonitor(ing)?\b|\bgrafana\b|\bprometheus\b|\btelemetry\b|\bmetrics?\b|\bdashboard\b/i.test(query)) {
    domains.push('observability');
  }
  if (/\bsecurity\b|\bzero.?trust\b|\bfirewall\b|\bsiem\b|\bincident\b|\bsoc\b|\bpalo alto\b|\bmicroseg/i.test(query)) {
    domains.push('security');
  }
  if (/\b(ai|gpu|nvidia|ml|machine learn|llm|deep learn|inference|training infra)\b/i.test(query)) {
    domains.push('ai-infrastructure');
  }
  // 'infrastructure' is broad — only add if no more specific domain matched, or if explicitly mentioned
  if (
    /\binfrastructure\b|\bcloud\b|\bkubernetes\b|\bk8s\b|\bdocker\b|\bcontainer\b/i.test(query) &&
    !domains.some((d) => ['networking', 'automation', 'ai-infrastructure'].includes(d))
  ) {
    domains.push('infrastructure');
  }

  return domains;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Extract all structured entities from a user query.
 */
export function extractEntities(query: string): EntityMap {
  const q = query.toLowerCase();
  return {
    projectNames: extractProjectNames(q),
    skillNames: extractSkillNames(q),
    certNames: extractCertNames(query), // pass original for case-sensitive cert patterns
    roleType: detectRoleType(query),
    domains: extractDomains(query),
    rawQuery: query,
  };
}
