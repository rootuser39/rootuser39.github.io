// AI Agent logic — local mock intelligence using structured knowledge base
//
// INTEGRATION SEAM ──────────────────────────────────────────────────────────
// To connect a real LLM, replace the body of `processQuery()` with:
//
//   const res = await fetch('/api/agent', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ query, history }),
//   });
//   return res.json();
//
// And create src/app/api/agent/route.ts that calls your LLM provider
// (OpenAI, Anthropic, Groq, etc.) with the knowledge base as system context.
// ───────────────────────────────────────────────────────────────────────────

import {
  bio,
  projects,
  experience,
  certifications,
  skills,
  quickFacts,
  recruiterHighlights,
} from '@/lib/knowledge';

export interface AgentMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface AgentResponse {
  content: string;
  suggestions?: string[];
}

// ── Intent detection ────────────────────────────────────────────────────────

function matchIntent(query: string): string {
  const q = query.toLowerCase();

  if (q.match(/\b(hello|hi|hey|start|help|what can you|what do you)\b/)) return 'greeting';
  if (q.match(/who (is|are)|about (rishabh|you)|tell me about|introduce|background/)) return 'bio';
  if (q.match(/\bproject(s)?\b|\bbuilt?\b|\bwork(ed)? on\b|\bportfolio\b/)) return 'projects';
  if (q.match(/\bnetwork(ing)?\b|\bcisco\b|\bbgp\b|\bospf\b|\brouting\b|\bswitching\b|\bvlan\b/)) return 'networking_projects';
  if (q.match(/\bsecurity\b|\bzero.?trust\b|\bfirewall\b|\bpalo alto\b|\bsiem\b|\bincident\b|\bsoc\b/)) return 'security_projects';
  if (q.match(/\bobserv\b|\bmonitor\b|\bgrafana\b|\bprometheus\b|\bdashboard\b|\bmetric\b|\btelemetry\b/)) return 'observability_projects';
  if (q.match(/\b(ai|gpu|nvidia|ml|machine learn|infra.*ai|ai.*infra)\b/)) return 'ai_projects';
  if (q.match(/\bautomat(e|ion|ed)\b|\bpipeline\b|\bterraform\b|\bansible\b|\biac\b/)) return 'automation_projects';
  if (q.match(/\bcertif\b|\bcert(s)?\b|\bccnp\b|\bccna\b|\bnvidia.*cert\b|\bqualif\b|\bcredential\b/)) return 'certifications';
  if (q.match(/\bskill(s)?\b|\btech(nolog|nical)?\b|\bstack\b|\blanguage\b|\btool(s)?\b|\bknow\b/)) return 'skills';
  if (q.match(/\bexperi(ence|enced)\b|\bwork(ed)?\b|\bjob\b|\brole\b|\bcompany\b|\bwipro\b|\bcareer\b/)) return 'experience';
  if (q.match(/\brecruit\b|\bhire\b|\bhiring\b|\bmanager\b|\brole type\b|\bcandidate\b/)) return 'recruiter';
  if (q.match(/\bcontact\b|\bemail\b|\blinkedin\b|\bgithub\b|\breach\b/)) return 'contact';
  if (q.match(/\bwhy (ai|infra)\b|\breason\b|\bmotiv\b|\bpassion\b|\bgoal\b/)) return 'why_ai';
  if (q.match(/\bavailab\b|\bopen to\b|\blooking for\b|\bstatus\b|\bcurrently\b|\bjob search\b/)) return 'availability';
  if (q.match(/\bsummari(ze|se)\b|\bbrief\b|\boverview\b|\btldr\b|\bquick\b/)) return 'recruiter';

  return 'general';
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function projectsByCategory(category: string) {
  return projects.filter((p) => p.category.includes(category));
}

function formatProjects(list: typeof projects): string {
  if (list.length === 0) return 'No projects found for that category.';
  return list.map((p) => `**${p.title}**\n${p.recruiterSummary}`).join('\n\n');
}

// ── Response map ─────────────────────────────────────────────────────────────

export function processQuery(query: string): AgentResponse {
  const intent = matchIntent(query);

  switch (intent) {
    case 'greeting':
      return {
        content: `Hello! I'm Rishabh's portfolio agent. I can help you navigate his experience, projects, certifications, and skills.\n\nWhat would you like to explore?`,
        suggestions: ['Who is Rishabh?', 'Show me networking projects', 'Summarize for a recruiter', 'View certifications'],
      };

    case 'bio':
      return {
        content: `**${bio.name}** — ${bio.tagline}\n\n${bio.summary}\n\n**Current:** ${bio.currentStatus}\n\n**Focus areas:** ${bio.focus.join(' · ')}`,
        suggestions: ['Show me his projects', 'What certifications does he have?', 'Summarize for a recruiter', 'Why AI infrastructure?'],
      };

    case 'projects':
      return {
        content: `Rishabh has built **${projects.length} featured projects** spanning infrastructure, networking, security, and AI:\n\n${projects.map((p) => `• **${p.title}**\n  ${p.recruiterSummary}`).join('\n\n')}`,
        suggestions: ['Show networking projects', 'Show AI infrastructure projects', 'Show automation projects', 'Show security projects'],
      };

    case 'networking_projects': {
      const list = projectsByCategory('networking');
      return {
        content: `**Networking Projects (${list.length}):**\n\n${formatProjects(list)}\n\n**Relevant certs:** CCNP Enterprise, CCNP ENAUTO, CCNA`,
        suggestions: ['Tell me more about Multi-Cloud Network Automation', 'Show security projects', 'What networking tools does he use?'],
      };
    }

    case 'security_projects': {
      const list = projectsByCategory('security');
      return {
        content: `**Security Projects (${list.length}):**\n\n${formatProjects(list)}\n\n**Tools:** Palo Alto, Cisco ACI, Splunk, Python SOAR`,
        suggestions: ['Tell me about Zero-Trust Segmentation', 'Show networking projects', 'What security tools does he know?'],
      };
    }

    case 'observability_projects': {
      const list = projectsByCategory('observability');
      return {
        content: `**Observability Projects (${list.length}):**\n\n${formatProjects(list)}\n\n**Stack:** Prometheus · Grafana · Datadog · OpenTelemetry · eBPF · NVIDIA DCGM`,
        suggestions: ['Tell me about the AI Observability Stack', 'What monitoring tools does he use?', 'Show AI infrastructure projects'],
      };
    }

    case 'ai_projects': {
      const list = projectsByCategory('ai-infrastructure');
      return {
        content: `**AI Infrastructure Projects (${list.length}):**\n\n${formatProjects(list)}\n\n**Cert:** NVIDIA AI Infrastructure and Operations (2026)\n**Specialization:** GPU clusters, DCGM exporters, NVLink monitoring, ML pipeline infrastructure`,
        suggestions: ['Why AI infrastructure?', 'What does the NVIDIA cert cover?', 'Show observability projects'],
      };
    }

    case 'automation_projects': {
      const list = projectsByCategory('automation');
      return {
        content: `**Automation Projects (${list.length}):**\n\n${formatProjects(list)}\n\n**Tools:** Python · Terraform · Ansible · GitHub Actions · NETCONF/YANG · OPA`,
        suggestions: ['Tell me about the IaC Pipeline', 'What automation tools does he use?', 'Show infrastructure projects'],
      };
    }

    case 'certifications':
      return {
        content: `**Certifications (${certifications.length}):**\n\n${certifications.map((c) => `**${c.name}** (${c.issuer}, ${c.year})\n${c.relevance}`).join('\n\n')}`,
        suggestions: ['What does CCNP ENAUTO cover?', 'What does the NVIDIA cert cover?', 'Show skills'],
      };

    case 'skills': {
      const formatted = skills.map((s) => `**${s.category}:** ${s.skills.join(', ')}`).join('\n\n');
      return {
        content: `**Technical Skills by Category:**\n\n${formatted}`,
        suggestions: ['Show projects using Python', 'What cloud platforms does he use?', 'Show certifications'],
      };
    }

    case 'experience':
      return {
        content: `**Work Experience:**\n\n${experience
          .map(
            (e) =>
              `**${e.role}** @ ${e.company} (${e.duration})\n${e.highlights.map((h) => `• ${h}`).join('\n')}`
          )
          .join('\n\n')}\n\n**${quickFacts.yearsExperience} years** of infrastructure and security engineering experience.`,
        suggestions: ['What did he do at Wipro?', 'What consulting work is he doing now?', 'Summarize for a recruiter'],
      };

    case 'recruiter':
      return {
        content: `**Recruiter Summary:**\n\n${bio.recruiterSummary}\n\n**Key highlights:**\n${recruiterHighlights.map((h) => `• ${h}`).join('\n')}\n\n**Quick stats:**\n• ${quickFacts.yearsExperience} years experience  •  ${quickFacts.certificationCount} certifications  •  ${quickFacts.projectCount} featured projects\n• Primary: ${quickFacts.primaryLanguage}  •  Cloud: ${quickFacts.cloudExperience}\n• Status: ${quickFacts.availability}`,
        suggestions: ['Show featured projects', 'What roles is he targeting?', 'How to contact him?'],
      };

    case 'contact':
      return {
        content: `**Get in Touch:**\n\n• **GitHub:** github.com/rootuser39\n• **LinkedIn:** linkedin.com/in/rishabh-durugkar\n• **Email:** Available on resume\n• **Resume:** Available for download\n\n**Status:** ${quickFacts.availability}`,
        suggestions: ['Download resume', 'Summarize for a recruiter', 'View featured projects'],
      };

    case 'why_ai':
      return {
        content: `**Why AI Infrastructure?**\n\nAI workloads demand infrastructure that most ops teams haven't built before — GPU clusters with NVLink fabrics, ultra-low-latency storage, and observability that goes far beyond CPU and memory metrics.\n\nRishabh's path through networking → security → automation led naturally to AI infrastructure — the most demanding operational challenge in modern cloud. His NVIDIA AI Infrastructure certification and hands-on GPU observability work reflect an intentional focus, not a pivot.\n\nThe goal: make AI environments as reliable and observable as production web infrastructure.`,
        suggestions: ['Show AI infrastructure projects', 'What does the NVIDIA cert cover?', 'Who is Rishabh?'],
      };

    case 'availability':
      return {
        content: `**Current Status:** ${bio.currentStatus}\n\n**Open to:**\n• Infrastructure Engineer\n• Network Engineer (automation-focused)\n• DevOps / SRE\n• AI Infrastructure Engineer\n• Platform Engineer\n\n**Preference:** Remote-friendly, technically deep, infrastructure-focused teams.`,
        suggestions: ['How to contact him?', 'Summarize for a recruiter', 'View projects'],
      };

    default:
      return {
        content: `I can help you explore Rishabh's infrastructure and networking work. Try asking:\n\n• "Who is Rishabh?"\n• "Show me networking projects"\n• "Why AI infrastructure?"\n• "Summarize for a recruiter"\n• "What certifications does he have?"`,
        suggestions: ['Who is Rishabh?', 'Show me projects', 'View certifications', 'How to contact him?'],
      };
  }
}

export const suggestedPrompts = [
  'Who is Rishabh?',
  'Show me networking projects',
  'Why AI infrastructure?',
  'Summarize for a recruiter',
  'Show certifications',
  'What tools does he use?',
  'Current availability?',
  'How to contact him?',
];
