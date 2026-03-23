// Agent type definitions — single source of truth for the entire agent system.
//
// INTEGRATION SEAM NOTE:
// When connecting a real LLM, this AgentResponse shape should be the response
// schema your API route returns. The LLM provider fills `message`; the local
// middleware fills `intent`, `entities`, `suggestedPrompts`, etc.

// ── Intent ──────────────────────────────────────────────────────────────────

export type Intent =
  | 'greeting'
  | 'bio'
  | 'experience'
  | 'certifications'
  | 'skills'
  | 'projects'
  | 'recruiter_summary'
  | 'contact'
  | 'availability'
  | 'navigation'
  | 'recommendation'
  | 'comparison'
  | 'explanation'
  | 'fallback';

// ── Role + Domain ────────────────────────────────────────────────────────────

/** Detected mindset of the visitor asking the question. */
export type RoleType =
  | 'recruiter'
  | 'hiring_manager'
  | 'engineer'
  | 'founder'
  | 'unknown';

/** Knowledge-base domain tags used for project and cert filtering. */
export type DomainTag =
  | 'networking'
  | 'automation'
  | 'observability'
  | 'security'
  | 'ai-infrastructure'
  | 'infrastructure';

// ── Entities ─────────────────────────────────────────────────────────────────

/** Structured entities extracted from a user query. */
export interface EntityMap {
  /** Knowledge-base project titles that were matched in the query. */
  projectNames: string[];
  /** Skill strings matched from the knowledge-base skills list. */
  skillNames: string[];
  /** Certification names matched from the knowledge-base certs list. */
  certNames: string[];
  /** Inferred visitor role / mindset. */
  roleType: RoleType;
  /** Domain areas detected in the query. */
  domains: DomainTag[];
  /** Original, unmodified query string. */
  rawQuery: string;
}

// ── Messages ─────────────────────────────────────────────────────────────────

/** A single turn in the conversation (user or assistant). */
export interface AgentMessage {
  id: string;
  role: 'user' | 'assistant';
  /** Primary text content rendered in the bubble. */
  content: string;
  timestamp: Date;
  /**
   * Full structured response — only present on assistant messages.
   * Used by the UI to render highlighted projects and navigation CTAs.
   */
  response?: AgentResponse;
}

// ── Response ─────────────────────────────────────────────────────────────────

/**
 * The structured response returned by processQuery().
 *
 * INTEGRATION SEAM:
 * When connecting a real LLM, your API route at src/app/api/agent/route.ts
 * should return this shape. The LLM fills `message`; a thin server-side
 * middleware resolves `intent`, `entities`, `suggestedPrompts`, and the
 * optional UI hints based on the LLM's output.
 */
export interface AgentResponse {
  /** Markdown-lite formatted text for the chat bubble. */
  message: string;
  /** Detected intent — used for analytics and follow-up generation. */
  intent: Intent;
  /** Extracted entities from the query. */
  entities: EntityMap;
  /** 2–4 contextual follow-up prompts to surface as chips. */
  suggestedPrompts: string[];
  /**
   * Optional navigation hint (e.g. '/recruiter', '/#certifications').
   * The UI renders a subtle "Jump to →" CTA when this is set.
   */
  navigationTarget?: string;
  /**
   * Optional array of project IDs (from knowledge base) to highlight
   * as compact inline project cards below the response message.
   */
  highlightedProjects?: string[];
}
