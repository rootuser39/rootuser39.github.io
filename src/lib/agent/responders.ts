// Response builders — one function per intent, role-aware.
//
// Each function receives an EntityMap and returns a fully-formed AgentResponse.
// The central `dispatch()` function routes from intent → responder.

import {
  bio,
  projects,
  experience,
  certifications,
  skills,
  quickFacts,
  recruiterHighlights,
} from '@/lib/knowledge';
import {
  findProjectByName,
  findProjectsByCategory,
  compareProjects,
  compareDomains,
  findCertsForDomain,
  findCertsByRelevance,
  findSkillCategoriesForDomain,
  DOMAIN_LABELS,
} from '@/lib/knowledge/selectors';
import { recommendProjectsForRole, buildFollowUpPrompts } from './recommender';
import type { AgentResponse, EntityMap, Intent, DomainTag } from './types';

// ── Response builder helper ───────────────────────────────────────────────────

/**
 * Constructs an AgentResponse, merging defaults with any overrides.
 * If `suggestedPrompts` override is not provided, falls back to the
 * context-aware `buildFollowUpPrompts` utility.
 */
function buildResponse(
  message: string,
  intent: Intent,
  entities: EntityMap,
  overrides?: Partial<Pick<AgentResponse, 'navigationTarget' | 'highlightedProjects' | 'suggestedPrompts'>>,
): AgentResponse {
  return {
    message,
    intent,
    entities,
    suggestedPrompts: overrides?.suggestedPrompts ?? buildFollowUpPrompts(intent, entities),
    navigationTarget: overrides?.navigationTarget,
    highlightedProjects: overrides?.highlightedProjects,
  };
}

/** De-duplicate projects by ID while preserving order. */
function uniqueProjects(list: typeof projects) {
  const seen = new Set<string>();
  return list.filter((p) => {
    if (seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  });
}

// ── Individual responders ─────────────────────────────────────────────────────

function respondGreeting(entities: EntityMap): AgentResponse {
  return buildResponse(
    `Hello! I'm Rishabh's portfolio agent.\n\nI can help you explore his infrastructure engineering work, projects, certifications, and career. I adapt my answers based on your background — just ask naturally.\n\nTry asking about specific projects, his certifications, or request a recruiter-focused summary.`,
    'greeting',
    entities,
  );
}

function respondBio(entities: EntityMap): AgentResponse {
  const isRecruiter = entities.roleType === 'recruiter' || entities.roleType === 'hiring_manager';

  if (isRecruiter) {
    return buildResponse(
      `**${bio.name}** — ${bio.tagline}\n\n${bio.recruiterSummary}\n\n**Status:** ${bio.currentStatus}`,
      'bio',
      entities,
      { navigationTarget: '/recruiter' },
    );
  }

  return buildResponse(
    `**${bio.name}** — ${bio.tagline}\n\n${bio.summary}\n\n**Current:** ${bio.currentStatus}\n\n**Focus areas:** ${bio.focus.join(' · ')}`,
    'bio',
    entities,
  );
}

function respondProjects(entities: EntityMap): AgentResponse {
  const { domains, projectNames, roleType } = entities;

  // Specific named project
  if (projectNames.length >= 2) {
    // Two projects mentioned → comparison
    return respondComparison(entities);
  }
  if (projectNames.length === 1) {
    return respondSpecificProject(projectNames[0], entities);
  }

  // Domain-filtered projects
  if (domains.length > 0) {
    return respondProjectsByDomain(domains[0], entities);
  }

  // Role-aware project overview
  const isEngineer = roleType === 'engineer';
  const list =
    roleType !== 'unknown' ? recommendProjectsForRole(roleType) : uniqueProjects(projects);

  const lines = isEngineer
    ? [
        `**Projects highlighted for engineers (${list.length}):**`,
        '',
        ...list.map((p) => `**${p.title}**\n${p.architecture}`),
      ]
    : [
        `**${list.length} featured projects** spanning infrastructure, networking, security, and AI:`,
        '',
        ...list.map((p) => `• **${p.title}**\n  ${p.recruiterSummary}`),
      ];

  return buildResponse(lines.join('\n'), 'projects', entities, {
    navigationTarget: '/projects',
    highlightedProjects: list.map((p) => p.id),
    suggestedPrompts: [
      'Show networking projects',
      'Show AI infrastructure projects',
      'Show security projects',
      'Compare networking and security work',
    ],
  });
}

function respondSpecificProject(name: string, entities: EntityMap): AgentResponse {
  const project = findProjectByName(name);

  if (!project) {
    return buildResponse(
      `I couldn't find a project matching "${name}". Try asking about networking, security, AI infrastructure, or automation projects.`,
      'projects',
      entities,
    );
  }

  const isEngineer = entities.roleType === 'engineer';
  const message = isEngineer
    ? [
        `**${project.title}**`,
        '',
        `**Problem:** ${project.problem}`,
        '',
        `**Architecture:** ${project.architecture}`,
        '',
        `**Technical Deep Dive:** ${project.technicalDeep}`,
        '',
        `**Tools:** ${project.tools.join(', ')}`,
        '',
        `**Outcome:** ${project.outcome}`,
      ].join('\n')
    : [
        `**${project.title}**`,
        '',
        `**Summary:** ${project.recruiterSummary}`,
        '',
        `**Tools:** ${project.tools.join(', ')}`,
        '',
        `**Outcome:** ${project.outcome}`,
      ].join('\n');

  return buildResponse(message, 'projects', { ...entities, projectNames: [project.title] }, {
    highlightedProjects: [project.id],
    navigationTarget: '/projects',
    suggestedPrompts: [
      `Show the architecture of ${project.title}`,
      `Technical deep dive on ${project.title}`,
      'Compare with another project',
      'Summarize for a recruiter',
    ],
  });
}

function respondProjectsByDomain(domain: DomainTag, entities: EntityMap): AgentResponse {
  const list = findProjectsByCategory(domain);
  const label = DOMAIN_LABELS[domain] ?? domain;

  if (list.length === 0) {
    return buildResponse(`No projects found for the ${label} domain.`, 'projects', entities);
  }

  const isEngineer = entities.roleType === 'engineer';
  const certs = findCertsForDomain(domain);
  const certLine =
    certs.length > 0 ? `\n\n**Supporting certifications:** ${certs.map((c) => c.name).join(', ')}` : '';

  const lines = isEngineer
    ? [
        `**${label} Projects (${list.length}):**`,
        '',
        ...list.map((p) => `**${p.title}**\n${p.architecture}`),
        certLine,
      ]
    : [
        `**${label} Projects (${list.length}):**`,
        '',
        ...list.map((p) => `**${p.title}**\n${p.recruiterSummary}`),
        certLine,
      ];

  return buildResponse(lines.join('\n'), 'projects', entities, {
    navigationTarget: '/projects',
    highlightedProjects: list.map((p) => p.id),
  });
}

function respondExperience(entities: EntityMap): AgentResponse {
  const isRecruiter = entities.roleType === 'recruiter' || entities.roleType === 'hiring_manager';

  // Recruiter-focused: recruiterNote only
  if (isRecruiter) {
    const lines = [
      '**Work History:**',
      '',
      ...experience.map((e) => `**${e.role}** @ ${e.company} (${e.duration})\n${e.recruiterNote}`),
      '',
      `**${quickFacts.yearsExperience} years** of infrastructure and security engineering.`,
    ];
    return buildResponse(lines.join('\n'), 'experience', entities, {
      navigationTarget: '/#experience',
    });
  }

  // Engineer/default: full highlights
  const lines = [
    '**Work Experience:**',
    '',
    ...experience.map(
      (e) =>
        `**${e.role}** @ ${e.company} (${e.duration})\n${e.highlights.map((h) => `• ${h}`).join('\n')}`,
    ),
    '',
    `**${quickFacts.yearsExperience} years** of infrastructure and security engineering.`,
  ];

  return buildResponse(lines.join('\n'), 'experience', entities, {
    navigationTarget: '/#experience',
  });
}

function respondCertifications(entities: EntityMap): AgentResponse {
  const { domains, certNames } = entities;

  // Specific certification asked for
  if (certNames.length > 0) {
    const cert = certifications.find((c) =>
      certNames.some((n) => c.name.toLowerCase().includes(n.toLowerCase())),
    );
    if (cert) {
      const message = `**${cert.name}** (${cert.issuer}, ${cert.year})\n\n${cert.relevance}`;
      return buildResponse(message, 'certifications', entities, {
        navigationTarget: '/#certifications',
        suggestedPrompts: [
          `What projects use skills from ${cert.name}?`,
          'Show all certifications',
          'What does CCNP ENAUTO cover?',
          'Show skills',
        ],
      });
    }
  }

  // Domain-filtered certifications
  if (domains.length > 0) {
    const list = findCertsForDomain(domains[0]);
    const label = DOMAIN_LABELS[domains[0] as DomainTag] ?? domains[0];
    if (list.length > 0) {
      const message = [
        `**Certifications relevant to ${label}:**`,
        '',
        ...list.map((c) => `**${c.name}** (${c.issuer}, ${c.year})\n${c.relevance}`),
      ].join('\n');
      return buildResponse(message, 'certifications', entities, {
        navigationTarget: '/#certifications',
      });
    }
  }

  // Full cert list
  const message = [
    `**Certifications (${certifications.length}):**`,
    '',
    ...certifications.map((c) => `**${c.name}** (${c.issuer}, ${c.year})\n${c.relevance}`),
  ].join('\n');

  return buildResponse(message, 'certifications', entities, {
    navigationTarget: '/#certifications',
    suggestedPrompts: [
      'What does CCNP ENAUTO cover?',
      'What does the NVIDIA cert cover?',
      'Show networking projects',
      'Show skills',
    ],
  });
}

function respondSkills(entities: EntityMap): AgentResponse {
  const { domains } = entities;

  if (domains.length > 0) {
    const label = DOMAIN_LABELS[domains[0] as DomainTag] ?? domains[0];
    const relevant = findSkillCategoriesForDomain(domains[0]);
    if (relevant.length > 0) {
      const message = [
        `**Skills — ${label}:**`,
        '',
        ...relevant.map((s) => `**${s.category}:** ${s.skills.join(', ')}`),
      ].join('\n');
      return buildResponse(message, 'skills', entities, { navigationTarget: '/#skills' });
    }
  }

  // All skills
  const message = [
    '**Technical Skills by Category:**',
    '',
    ...skills.map((s) => `**${s.category}:** ${s.skills.join(', ')}`),
  ].join('\n');

  return buildResponse(message, 'skills', entities, { navigationTarget: '/#skills' });
}

function respondRecruiterSummary(entities: EntityMap): AgentResponse {
  const message = [
    '**Recruiter Summary:**',
    '',
    bio.recruiterSummary,
    '',
    '**Key highlights:**',
    ...recruiterHighlights.map((h) => `• ${h}`),
    '',
    '**Quick stats:**',
    `• ${quickFacts.yearsExperience} years experience  •  ${quickFacts.certificationCount} certifications  •  ${quickFacts.projectCount} featured projects`,
    `• Primary language: ${quickFacts.primaryLanguage}  •  Cloud: ${quickFacts.cloudExperience}`,
    `• Status: ${quickFacts.availability}`,
  ].join('\n');

  return buildResponse(message, 'recruiter_summary', entities, {
    navigationTarget: '/recruiter',
    highlightedProjects: ['1', '2', '3'],
    suggestedPrompts: ['Show featured projects', 'View certifications', 'What roles is he targeting?', 'How to contact him?'],
  });
}

function respondContact(entities: EntityMap): AgentResponse {
  const message = [
    '**Get in Touch:**',
    '',
    '• **GitHub:** github.com/rootuser39',
    '• **LinkedIn:** linkedin.com/in/rishabh-durugkar',
    '• **Email:** Available on resume',
    '• **Resume:** Available for download',
    '',
    `**Status:** ${quickFacts.availability}`,
  ].join('\n');

  return buildResponse(message, 'contact', entities, { navigationTarget: '/#contact' });
}

function respondAvailability(entities: EntityMap): AgentResponse {
  const message = [
    `**Current Status:** ${bio.currentStatus}`,
    '',
    '**Open to:**',
    '• Infrastructure Engineer',
    '• Network Engineer (automation-focused)',
    '• DevOps / SRE',
    '• AI Infrastructure Engineer',
    '• Platform Engineer',
    '',
    '**Preference:** Remote-friendly, technically deep, infrastructure-focused teams.',
  ].join('\n');

  return buildResponse(message, 'availability', entities, { navigationTarget: '/#contact' });
}

function respondRecommendation(entities: EntityMap): AgentResponse {
  const { roleType, domains } = entities;

  const ROLE_LABELS: Record<string, string> = {
    recruiter: 'Recruiters',
    hiring_manager: 'Hiring Managers',
    engineer: 'Infrastructure Engineers',
    founder: 'Founders / CTOs',
    unknown: 'you',
  };

  let list = recommendProjectsForRole(roleType);

  // Blend in domain-specific projects if a domain was specified
  if (domains.length > 0) {
    const domainProjects = findProjectsByCategory(domains[0]);
    list = uniqueProjects([...domainProjects, ...list]);
  }

  const label = ROLE_LABELS[roleType] ?? 'you';
  const isEngineer = roleType === 'engineer';

  const intro = isEngineer
    ? `Based on an engineering focus, here are the most architecturally interesting projects:`
    : `Based on a ${label.toLowerCase()} perspective, here are the most relevant projects:`;

  const lines = isEngineer
    ? [intro, '', ...list.map((p) => `**${p.title}**\n${p.architecture}`)]
    : [intro, '', ...list.map((p) => `• **${p.title}** — ${p.recruiterSummary}`)];

  return buildResponse(lines.join('\n'), 'recommendation', entities, {
    navigationTarget: '/projects',
    highlightedProjects: list.map((p) => p.id),
  });
}

function respondComparison(entities: EntityMap): AgentResponse {
  const { domains, projectNames } = entities;

  // Compare two specific named projects
  if (projectNames.length >= 2) {
    const text = compareProjects(projectNames[0], projectNames[1]);
    if (text) {
      return buildResponse(text, 'comparison', entities, {
        highlightedProjects: [
          findProjectByName(projectNames[0])?.id,
          findProjectByName(projectNames[1])?.id,
        ].filter(Boolean) as string[],
        suggestedPrompts: [
          `Deep dive on ${projectNames[0]}`,
          `Deep dive on ${projectNames[1]}`,
          'Summarize for a recruiter',
          'View projects page',
        ],
      });
    }
  }

  // Compare two domains
  if (domains.length >= 2) {
    const text = compareDomains(domains[0], domains[1]);
    const p1 = findProjectsByCategory(domains[0]);
    const p2 = findProjectsByCategory(domains[1]);
    return buildResponse(text, 'comparison', entities, {
      highlightedProjects: uniqueProjects([...p1, ...p2])
        .slice(0, 4)
        .map((p) => p.id),
    });
  }

  // Single domain — compare with nearest related domain
  if (domains.length === 1) {
    const DOMAIN_PAIRS: Partial<Record<DomainTag, DomainTag>> = {
      networking: 'security',
      security: 'networking',
      automation: 'infrastructure',
      infrastructure: 'automation',
      observability: 'ai-infrastructure',
      'ai-infrastructure': 'observability',
    };
    const other = DOMAIN_PAIRS[domains[0]] ?? 'networking';
    const text = compareDomains(domains[0], other);
    return buildResponse(text, 'comparison', entities);
  }

  // Default: networking vs AI infrastructure (most striking contrast)
  const text = compareDomains('networking', 'ai-infrastructure');
  return buildResponse(text, 'comparison', entities, {
    suggestedPrompts: [
      'Show networking projects',
      'Show AI infrastructure projects',
      'Compare automation and infrastructure work',
      'Summarize for a recruiter',
    ],
  });
}

function respondExplanation(entities: EntityMap): AgentResponse {
  const { certNames, domains, rawQuery } = entities;
  const q = rawQuery.toLowerCase();

  // ── Why AI infrastructure? ──
  if (/\bwhy\b.*(ai|infra|gpu|ml|machine learn)/i.test(rawQuery)) {
    return buildResponse(
      [
        '**Why AI Infrastructure?**',
        '',
        'AI workloads demand infrastructure that most ops teams haven\'t built before — GPU clusters with NVLink fabrics, ultra-low-latency storage, and observability that goes far beyond CPU and memory metrics.',
        '',
        'Rishabh\'s path through networking → security → automation led naturally to AI infrastructure — the most demanding operational challenge in modern cloud. His NVIDIA AI Infrastructure certification and hands-on GPU observability work reflect an intentional focus, not a pivot.',
        '',
        'The goal: make AI environments as reliable and observable as production web infrastructure.',
      ].join('\n'),
      'explanation',
      entities,
      {
        navigationTarget: '/projects',
        suggestedPrompts: ['Show AI infrastructure projects', 'What does the NVIDIA cert cover?', 'Who is Rishabh?', 'View certifications'],
      },
    );
  }

  // ── Specific certification explained ──
  if (certNames.length > 0) {
    const cert = certifications.find((c) =>
      certNames.some((n) => c.name.toLowerCase().includes(n.toLowerCase())),
    );
    if (cert) {
      return buildResponse(
        `**${cert.name}**\n\nIssued by **${cert.issuer}** in ${cert.year}.\n\n${cert.relevance}`,
        'explanation',
        entities,
        { navigationTarget: '/#certifications' },
      );
    }
  }

  // ── Technology explanations ──
  if (/enauto|network autom/i.test(rawQuery)) {
    return buildResponse(
      [
        '**CCNP ENAUTO** is Cisco\'s advanced network automation certification.',
        '',
        'It covers:',
        '• Python for network automation and scripting',
        '• REST APIs and NETCONF/YANG model-driven programmability',
        '• Ansible for network device configuration',
        '• Cisco DNA Center / Catalyst Center APIs',
        '• Model-driven telemetry with gRPC',
        '',
        'Rishabh holds this certification (2025), directly underpinning his multi-cloud automation pipeline work.',
      ].join('\n'),
      'explanation',
      entities,
      { navigationTarget: '/#certifications' },
    );
  }

  if (/zero.?trust|microsegment/i.test(rawQuery)) {
    return buildResponse(
      [
        '**Zero-Trust Architecture** is a security model where no user or system is trusted by default — inside or outside the network perimeter.',
        '',
        'Key principles:',
        '• Verify every access request explicitly',
        '• Enforce least-privilege access',
        '• Microsegmentation to contain lateral movement',
        '• Continuous monitoring and validation',
        '',
        'Rishabh implemented this using **Cisco ACI + Palo Alto NGFWs**, with policy-as-code managed in Terraform and automated quarantine via Splunk integration.',
      ].join('\n'),
      'explanation',
      entities,
      {
        highlightedProjects: ['3'],
        navigationTarget: '/projects',
      },
    );
  }

  if (/\bdcgm\b|gpu observ|nvidia.*monitor/i.test(rawQuery)) {
    return buildResponse(
      [
        '**NVIDIA DCGM** (Data Center GPU Manager) is a suite of tools for managing and monitoring NVIDIA GPUs in cluster environments.',
        '',
        'It provides:',
        '• GPU utilization, memory, and thermal metrics',
        '• NVLink bandwidth and fabric health monitoring',
        '• Power draw and throttling event tracking',
        '• Native Prometheus exporter for observability pipelines',
        '',
        'Rishabh used DCGM exporters to build GPU observability for ML workloads, correlating GPU, network, and storage metrics in unified Grafana dashboards.',
      ].join('\n'),
      'explanation',
      entities,
      {
        highlightedProjects: ['2'],
        navigationTarget: '/projects',
      },
    );
  }

  if (/\bebpf\b/i.test(rawQuery)) {
    return buildResponse(
      [
        '**eBPF** (extended Berkeley Packet Filter) allows running sandboxed programs in the Linux kernel without modifying kernel source or loading kernel modules.',
        '',
        'In infrastructure and observability:',
        '• Low-overhead network packet capture and analysis',
        '• Application performance monitoring without intrusive agents',
        '• Custom telemetry collection at the kernel level',
        '',
        'Rishabh uses eBPF for NIC-level telemetry in GPU observability stacks and in the Network Performance Analysis Tool.',
      ].join('\n'),
      'explanation',
      entities,
      { highlightedProjects: ['2', '6'] },
    );
  }

  if (/\biac\b|infrastructure.as.code|terraform/i.test(rawQuery)) {
    return buildResponse(
      [
        '**Infrastructure-as-Code (IaC)** means managing and provisioning infrastructure through machine-readable configuration files rather than manual processes.',
        '',
        'Key benefits:',
        '• Version-controlled, fully auditable changes',
        '• Reproducible environments across stages',
        '• Policy enforcement enforced in CI/CD pipelines',
        '',
        'Rishabh uses **Terraform** as the primary IaC tool, with OPA Rego policies for compliance guardrails and GitHub Actions for end-to-end CI/CD.',
      ].join('\n'),
      'explanation',
      entities,
      {
        highlightedProjects: ['1', '5'],
        navigationTarget: '/projects',
      },
    );
  }

  if (/\bsoar\b|incident response/i.test(rawQuery)) {
    return buildResponse(
      [
        '**SOAR** (Security Orchestration, Automation, and Response) platforms automate repetitive security operations tasks.',
        '',
        'Core capabilities:',
        '• Automated triage and alert enrichment',
        '• Runbook-driven remediation for known patterns',
        '• Case management and cross-team coordination',
        '',
        'Rishabh built a Python-based SOAR platform that integrated PagerDuty, Splunk, and Slack — reducing tier-1 incident response to automated workflows.',
      ].join('\n'),
      'explanation',
      entities,
      { highlightedProjects: ['4'] },
    );
  }

  // Domain-based explanation fallback
  if (domains.length > 0) {
    const domain = domains[0];
    const label = DOMAIN_LABELS[domain as DomainTag] ?? domain;
    const projectList = findProjectsByCategory(domain);
    const certs = findCertsForDomain(domain);
    const lines = [
      `**${label}** is one of Rishabh's core focus areas.`,
      '',
      `Related projects:`,
      ...projectList.map((p) => `• **${p.title}** — ${p.recruiterSummary}`),
    ];
    if (certs.length > 0) {
      lines.push('', `**Relevant certifications:** ${certs.map((c) => c.name).join(', ')}`);
    }
    return buildResponse(lines.join('\n'), 'explanation', entities, {
      highlightedProjects: projectList.map((p) => p.id),
    });
  }

  // Generic explanation prompt guide
  return buildResponse(
    [
      'I can explain specific technologies, certifications, or concepts in Rishabh\'s work. Try asking about:',
      '',
      '• "What is zero-trust architecture?"',
      '• "What does CCNP ENAUTO cover?"',
      '• "What is NVIDIA DCGM?"',
      '• "What is eBPF?"',
      '• "Why AI infrastructure?"',
      '• "What is Infrastructure-as-Code?"',
    ].join('\n'),
    'explanation',
    entities,
  );
}

function respondNavigation(entities: EntityMap): AgentResponse {
  const q = entities.rawQuery.toLowerCase();

  const NAV_MAP: Array<[RegExp, string, string]> = [
    [/project/i, '/projects', 'Projects page'],
    [/certif/i, '/#certifications', 'Certifications section'],
    [/skill/i, '/#skills', 'Skills section'],
    [/contact|reach/i, '/#contact', 'Contact section'],
    [/experience|work/i, '/#experience', 'Experience section'],
    [/about/i, '/#about', 'About section'],
    [/recruiter|hiring/i, '/recruiter', 'Recruiter Mode'],
    [/timeline/i, '/timeline', 'Timeline page'],
    [/service/i, '/services', 'Services page'],
    [/home|back/i, '/', 'Home'],
  ];

  for (const [re, target, label] of NAV_MAP) {
    if (re.test(q)) {
      return buildResponse(
        `Navigating to the **${label}**.`,
        'navigation',
        entities,
        { navigationTarget: target },
      );
    }
  }

  return buildResponse(
    [
      'Available sections:',
      '',
      '• **Projects** — /projects',
      '• **Certifications** — /#certifications',
      '• **Skills** — /#skills',
      '• **Experience** — /#experience',
      '• **Contact** — /#contact',
      '• **Recruiter Mode** — /recruiter',
      '• **Timeline** — /timeline',
    ].join('\n'),
    'navigation',
    entities,
  );
}

function respondFallback(entities: EntityMap): AgentResponse {
  return buildResponse(
    [
      'I can help you explore Rishabh\'s infrastructure and networking work. Try asking:',
      '',
      '• "Who is Rishabh?"',
      '• "Show networking projects"',
      '• "Why AI infrastructure?"',
      '• "Summarize for a recruiter"',
      '• "Compare networking and security work"',
      '• "What certifications does he have?"',
    ].join('\n'),
    'fallback',
    entities,
  );
}

// ── Dispatcher ────────────────────────────────────────────────────────────────

/**
 * Route an intent + entities to the appropriate responder.
 * This is the single entry point from processQuery().
 */
export function dispatch(intent: Intent, entities: EntityMap): AgentResponse {
  switch (intent) {
    case 'greeting':
      return respondGreeting(entities);
    case 'bio':
      return respondBio(entities);
    case 'projects':
      return respondProjects(entities);
    case 'experience':
      return respondExperience(entities);
    case 'certifications':
      return respondCertifications(entities);
    case 'skills':
      return respondSkills(entities);
    case 'recruiter_summary':
      return respondRecruiterSummary(entities);
    case 'contact':
      return respondContact(entities);
    case 'availability':
      return respondAvailability(entities);
    case 'recommendation':
      return respondRecommendation(entities);
    case 'comparison':
      return respondComparison(entities);
    case 'explanation':
      return respondExplanation(entities);
    case 'navigation':
      return respondNavigation(entities);
    default:
      return respondFallback(entities);
  }
}
