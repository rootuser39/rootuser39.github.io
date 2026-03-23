// Recommendation engine — maps roles and domains to curated knowledge subsets,
// and builds contextual follow-up prompts for each response.

import { projects, certifications } from '@/lib/knowledge';
import type { KnowledgeProject, KnowledgeCertification } from '@/lib/knowledge';
import { findProjectsByCategory, findCertsForDomain } from '@/lib/knowledge/selectors';
import type { Intent, RoleType, DomainTag, EntityMap } from './types';

// ── Project recommendations ───────────────────────────────────────────────────

/** Flagship project IDs — the three most impressive across all audiences. */
const FLAGSHIP_IDS = ['1', '2', '3'];

/** Project IDs best suited for engineers (architecturally rich). */
const ENGINEER_IDS = ['1', '2', '4', '6'];

/** Project IDs best suited for founders / CTOs (broad impact). */
const FOUNDER_IDS = ['1', '3', '5'];

function projectsById(ids: string[]): KnowledgeProject[] {
  return ids.map((id) => projects.find((p) => p.id === id)).filter(Boolean) as KnowledgeProject[];
}

/**
 * Return the most relevant projects for a given visitor role.
 */
export function recommendProjectsForRole(role: RoleType): KnowledgeProject[] {
  switch (role) {
    case 'recruiter':
    case 'hiring_manager':
      return projectsById(FLAGSHIP_IDS);
    case 'engineer':
      return projectsById(ENGINEER_IDS);
    case 'founder':
      return projectsById(FOUNDER_IDS);
    default:
      return projectsById(FLAGSHIP_IDS);
  }
}

/**
 * Return projects relevant to a specific domain.
 */
export function recommendProjectsForDomain(domain: DomainTag): KnowledgeProject[] {
  return findProjectsByCategory(domain);
}

// ── Certification recommendations ────────────────────────────────────────────

/**
 * Return the most relevant certifications for a given visitor role.
 */
export function recommendCertsForRole(role: RoleType): KnowledgeCertification[] {
  switch (role) {
    case 'recruiter':
    case 'hiring_manager':
      return certifications; // show all — recruiters want the full picture
    case 'engineer':
      // Engineers care most about automation and AI certs
      return certifications.filter(
        (c) => c.name.includes('ENAUTO') || c.name.includes('NVIDIA') || c.name.includes('ENCOR'),
      );
    case 'founder':
      // Founders care about breadth — show top 3
      return certifications.slice(0, 3);
    default:
      return certifications.slice(0, 3);
  }
}

// ── Section recommendations ───────────────────────────────────────────────────

/** Return the most relevant page/section paths for a given intent. */
export function recommendSectionsForIntent(intent: Intent): string[] {
  const map: Partial<Record<Intent, string[]>> = {
    bio: ['/#about'],
    experience: ['/#experience'],
    certifications: ['/#certifications'],
    skills: ['/#skills'],
    projects: ['/projects'],
    recruiter_summary: ['/recruiter'],
    contact: ['/#contact'],
    availability: ['/#contact'],
    recommendation: ['/projects'],
    comparison: ['/projects'],
    explanation: ['/#certifications'],
  };
  return map[intent] ?? [];
}

// ── Follow-up prompt builder ──────────────────────────────────────────────────

/** Generic fallback prompts used when no specific context is available. */
const FALLBACK_PROMPTS = [
  'Who is Rishabh?',
  'Show me projects',
  'View certifications',
  'How to contact him?',
];

const ROLE_PROMPTS: Record<RoleType, string[]> = {
  recruiter: ['Show featured projects', 'View certifications', 'What roles is he targeting?', 'How to contact him?'],
  hiring_manager: ['Show featured projects', 'View certifications', 'Current availability?', 'How to contact him?'],
  engineer: ['Show architecture details', 'What tech stack does he use?', 'Deep dive on a project', 'Show certifications'],
  founder: ['Show featured projects', 'What services does he offer?', 'Current availability?', 'How to contact him?'],
  unknown: FALLBACK_PROMPTS,
};

const INTENT_PROMPTS: Partial<Record<Intent, string[]>> = {
  greeting: ['Who is Rishabh?', 'Show me projects', 'Summarize for a recruiter', 'What certifications?'],
  bio: ['Show me his projects', 'Why AI infrastructure?', 'Summarize for a recruiter', 'View certifications'],
  experience: ['What did he do at Wipro?', 'Show consulting work', 'Summarize for a recruiter', 'View projects'],
  projects: ['Show networking projects', 'Show AI infrastructure projects', 'Compare networking and security work', 'Summarize for a recruiter'],
  certifications: ['What does CCNP ENAUTO cover?', 'What does the NVIDIA cert cover?', 'Show related projects', 'Show skills'],
  skills: ['Show projects using Python', 'Show infrastructure projects', 'View certifications', 'Summarize for a recruiter'],
  recruiter_summary: ['Show featured projects', 'View certifications', 'What roles is he targeting?', 'How to contact him?'],
  contact: ['View recruiter summary', 'Download resume', 'View projects', 'Show certifications'],
  availability: ['How to contact him?', 'Recruiter summary', 'View projects', 'Show certifications'],
  recommendation: ['Best projects for networking roles', 'Best certs for AI infrastructure', 'How to contact him?', 'Show featured projects'],
  comparison: ['Show individual project details', 'Summarize for a recruiter', 'View projects page', 'Show certifications'],
  explanation: ['Show related projects', 'What certifications cover this?', 'Why AI infrastructure?', 'Show skills'],
  navigation: ['Show me projects', 'View certifications', 'Who is Rishabh?', 'Recruiter summary'],
  fallback: FALLBACK_PROMPTS,
};

/**
 * Build 2–4 contextual follow-up prompts based on the intent and extracted entities.
 *
 * Priority order:
 * 1. Specific project-based prompts (when a project was identified)
 * 2. Domain-specific prompts (when a domain was detected)
 * 3. Role-specific prompts (when a role was inferred)
 * 4. Intent-based prompts
 * 5. Generic fallback
 */
export function buildFollowUpPrompts(intent: Intent, entities: EntityMap): string[] {
  const { roleType, domains, projectNames } = entities;

  // 1. Project-specific follow-ups
  if (projectNames.length > 0) {
    const name = projectNames[0];
    return [
      `Show the architecture of ${name}`,
      `Give me the recruiter summary for ${name}`,
      `What tools were used in ${name}?`,
      'Compare with another project',
    ];
  }

  // 2. Domain-specific follow-ups
  if (domains.length > 0) {
    const domain = domains[0];
    const domainLabel = domain.replace('-', ' ');
    const certs = findCertsForDomain(domain);
    const base = [
      `Show all ${domainLabel} projects`,
      `Technical deep dive on ${domainLabel}`,
    ];
    if (certs.length > 0) base.push(`What certifications support ${domainLabel}?`);
    base.push('Summarize for a recruiter');
    return base.slice(0, 4);
  }

  // 3. Role-specific follow-ups
  if (roleType !== 'unknown') {
    return ROLE_PROMPTS[roleType];
  }

  // 4. Intent-based follow-ups
  return INTENT_PROMPTS[intent] ?? FALLBACK_PROMPTS;
}
