// AI Agent — entry point and public API.
//
// ── INTEGRATION SEAM ─────────────────────────────────────────────────────────
// To connect a real LLM, replace the body of processQuery() with:
//
//   const res = await fetch('/api/agent', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ query, history }),
//   });
//   return res.json() as AgentResponse;
//
// Then create src/app/api/agent/route.ts that:
//   1. Calls your LLM provider (OpenAI, Anthropic, Groq, etc.)
//   2. Uses the knowledge base (src/lib/knowledge/index.ts) as system context
//   3. Returns an AgentResponse — same shape as the local mock
//
// The UI (AIAgent.tsx) and all callers are already typed to AgentResponse,
// so the switch is fully backward compatible.
// ─────────────────────────────────────────────────────────────────────────────

import { detectIntent } from './intents';
import { extractEntities } from './entities';
import { dispatch } from './responders';

// Re-export all public types so callers only need to import from '@/lib/agent'
export type { Intent, RoleType, DomainTag, EntityMap, AgentMessage, AgentResponse } from './types';

/**
 * Process a user query and return a structured AgentResponse.
 *
 * Steps:
 *  1. Detect intent using weighted pattern scoring
 *  2. Extract structured entities (projects, skills, certs, role, domains)
 *  3. Dispatch to the role-aware responder for that intent
 *
 * @param query   Raw user input string
 * @param history Optional conversation history (reserved for LLM integration)
 */
export function processQuery(
  query: string,
  _history?: import('./types').AgentMessage[],
): import('./types').AgentResponse {
  const intent = detectIntent(query);
  const entities = extractEntities(query);
  return dispatch(intent, entities);
}

/**
 * Default suggested prompts shown when the agent panel first opens.
 * Covers the most common visitor entry points.
 */
export const suggestedPrompts = [
  'Who is Rishabh?',
  'Show me networking projects',
  'Why AI infrastructure?',
  'Summarize for a recruiter',
  'Show certifications',
  'Compare networking and security work',
  'Current availability?',
  'How to contact him?',
];
