// Knowledge-base query helpers.
// This module is intentionally independent of src/lib/agent/ — it only
// depends on the raw knowledge data and never imports agent types.

import {
  projects,
  certifications,
  skills,
} from '@/lib/knowledge';
import type { KnowledgeProject, KnowledgeCertification } from '@/lib/knowledge';

// ── Domain label helpers ─────────────────────────────────────────────────────

const DOMAIN_LABELS: Record<string, string> = {
  networking: 'Networking',
  automation: 'Automation',
  observability: 'Observability',
  security: 'Security',
  'ai-infrastructure': 'AI Infrastructure',
  infrastructure: 'Infrastructure',
};

function domainLabel(domain: string): string {
  return DOMAIN_LABELS[domain] ?? domain.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}

// ── Scoring helpers ───────────────────────────────────────────────────────────

/** Returns the number of significant words (length > 3) shared between two strings. */
function wordOverlap(a: string, b: string): number {
  const aWords = a.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
  const bWords = new Set(b.toLowerCase().split(/\s+/).filter((w) => w.length > 3));
  return aWords.filter((w) => bWords.has(w)).length;
}

// ── Project selectors ────────────────────────────────────────────────────────

/**
 * Find a project by fuzzy name match.
 * Tries exact match first, then substring, then word-overlap scoring.
 */
export function findProjectByName(name: string): KnowledgeProject | undefined {
  if (!name) return undefined;
  const q = name.toLowerCase().trim();

  // Exact title match
  const exact = projects.find((p) => p.title.toLowerCase() === q);
  if (exact) return exact;

  // Substring match (query contains the title or vice versa)
  const substring = projects.find(
    (p) => p.title.toLowerCase().includes(q) || q.includes(p.title.toLowerCase()),
  );
  if (substring) return substring;

  // Word-overlap scoring — best match with at least 2 shared words
  let best: KnowledgeProject | undefined;
  // Initial threshold of 1 means we require score > 1, i.e. at least 2 overlapping words
  let bestScore = 1;
  for (const p of projects) {
    const score = wordOverlap(p.title, name);
    if (score > bestScore) {
      bestScore = score;
      best = p;
    }
  }
  return best;
}

/** Return all projects whose tags array includes the given tag (case-insensitive). */
export function findProjectsByTag(tag: string): KnowledgeProject[] {
  const q = tag.toLowerCase();
  return projects.filter((p) => p.tags.some((t) => t.toLowerCase() === q));
}

/** Return all projects whose tools list contains the given tool name (partial match). */
export function findProjectsByStack(tool: string): KnowledgeProject[] {
  const q = tool.toLowerCase();
  return projects.filter((p) => p.tools.some((t) => t.toLowerCase().includes(q)));
}

/** Return all projects whose category array includes the given category (case-insensitive). */
export function findProjectsByCategory(category: string): KnowledgeProject[] {
  const q = category.toLowerCase();
  return projects.filter((p) => p.category.some((c) => c.toLowerCase() === q));
}

/**
 * Full-text project search across title, tools, tags, and categories.
 */
export function searchProjects(query: string): KnowledgeProject[] {
  const q = query.toLowerCase();
  return projects.filter(
    (p) =>
      p.title.toLowerCase().includes(q) ||
      p.tools.some((t) => t.toLowerCase().includes(q)) ||
      p.tags.some((t) => t.includes(q)) ||
      p.category.some((c) => c.includes(q)),
  );
}

// ── Comparison helpers ────────────────────────────────────────────────────────

/**
 * Generate a structured side-by-side comparison of two projects by title.
 * Returns an empty string if either project is not found.
 */
export function compareProjects(titleA: string, titleB: string): string {
  const a = findProjectByName(titleA);
  const b = findProjectByName(titleB);
  if (!a || !b) return '';

  return [
    `**${a.title}** vs **${b.title}**`,
    '',
    '**Problem solved:**',
    `• ${a.title}: ${a.problem}`,
    `• ${b.title}: ${b.problem}`,
    '',
    '**Technology stack:**',
    `• ${a.title}: ${a.tools.join(', ')}`,
    `• ${b.title}: ${b.tools.join(', ')}`,
    '',
    '**Outcome:**',
    `• ${a.title}: ${a.outcome}`,
    `• ${b.title}: ${b.outcome}`,
  ].join('\n');
}

/**
 * Generate a structured comparison of two domain categories.
 */
export function compareDomains(d1: string, d2: string): string {
  const p1 = findProjectsByCategory(d1);
  const p2 = findProjectsByCategory(d2);

  const lines: string[] = [
    `**${domainLabel(d1)}** vs **${domainLabel(d2)}**`,
    '',
    `**${domainLabel(d1)} work (${p1.length} project${p1.length !== 1 ? 's' : ''}):**`,
    ...p1.map((p) => `• **${p.title}** — ${p.recruiterSummary}`),
    '',
    `**${domainLabel(d2)} work (${p2.length} project${p2.length !== 1 ? 's' : ''}):**`,
    ...p2.map((p) => `• **${p.title}** — ${p.recruiterSummary}`),
  ];

  // Add key differences insight if both domains have projects
  if (p1.length > 0 && p2.length > 0) {
    const allTools1 = Array.from(new Set(p1.flatMap((p) => p.tools)));
    const allTools2 = Array.from(new Set(p2.flatMap((p) => p.tools)));
    lines.push('', `**Primary tools — ${domainLabel(d1)}:** ${allTools1.slice(0, 5).join(', ')}`);
    lines.push(`**Primary tools — ${domainLabel(d2)}:** ${allTools2.slice(0, 5).join(', ')}`);
  }

  return lines.join('\n');
}

// ── Certification selectors ──────────────────────────────────────────────────

/**
 * Find certifications whose name, issuer, or relevance text contains the keyword.
 */
export function findCertsByRelevance(keyword: string): KnowledgeCertification[] {
  const q = keyword.toLowerCase();
  return certifications.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.relevance.toLowerCase().includes(q) ||
      c.issuer.toLowerCase().includes(q),
  );
}

/**
 * Return certifications relevant to a specific domain.
 * Uses a curated keyword map — add entries here as new certs are added.
 */
export function findCertsForDomain(domain: string): KnowledgeCertification[] {
  const domainKeywords: Record<string, string[]> = {
    networking: ['cisco', 'ccnp', 'ccna'],
    automation: ['enauto', 'ccnp enauto', 'cisco'],
    observability: ['nvidia', 'dcgm'],
    security: ['cisco', 'ccnp'],
    'ai-infrastructure': ['nvidia'],
    infrastructure: ['cisco', 'ccnp', 'ccna'],
  };
  const keywords = domainKeywords[domain.toLowerCase()] ?? [];
  return certifications.filter((c) =>
    keywords.some(
      (k) => c.name.toLowerCase().includes(k) || c.issuer.toLowerCase().includes(k),
    ),
  );
}

// ── Skill selectors ───────────────────────────────────────────────────────────

/**
 * Return all individual skill strings that match the query (case-insensitive partial match).
 */
export function findSkillsByKeyword(keyword: string): string[] {
  const q = keyword.toLowerCase();
  return skills.flatMap((s) => s.skills).filter((skill) => skill.toLowerCase().includes(q));
}

/**
 * Return skill categories that relate to the given domain.
 */
export function findSkillCategoriesForDomain(domain: string): typeof skills {
  const domainToCategoryKeywords: Record<string, string[]> = {
    networking: ['networking'],
    automation: ['automation', 'scripting'],
    observability: ['observability'],
    security: ['security'],
    'ai-infrastructure': ['ai infrastructure', 'ai'],
    infrastructure: ['infrastructure', 'cloud'],
  };
  const keywords = domainToCategoryKeywords[domain.toLowerCase()] ?? [];
  return skills.filter((s) =>
    keywords.some((k) => s.category.toLowerCase().includes(k)),
  );
}
