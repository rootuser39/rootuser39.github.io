// Structured knowledge base — single source of truth for the AI agent
// Integration seam: this data feeds the local mock agent and will power the real LLM context window

export interface KnowledgeBio {
  name: string;
  tagline: string;
  summary: string;
  recruiterSummary: string;
  location: string;
  focus: string[];
  currentStatus: string;
}

export interface KnowledgeProject {
  id: string;
  title: string;
  problem: string;
  architecture: string;
  tools: string[];
  outcome: string;
  recruiterSummary: string;
  technicalDeep: string;
  category: string[];
  tags: string[];
}

export interface KnowledgeExperience {
  role: string;
  company: string;
  duration: string;
  type: string;
  highlights: string[];
  recruiterNote: string;
}

export interface KnowledgeCertification {
  name: string;
  issuer: string;
  year: number;
  relevance: string;
}

export interface KnowledgeSkillCategory {
  category: string;
  skills: string[];
}

export const bio: KnowledgeBio = {
  name: 'Rishabh Durugkar',
  tagline: 'Infrastructure · Networking · Security',
  summary:
    'Infrastructure engineer focused on reliability, automation, and observability for AI-ready environments. 4+ years building and securing enterprise networks, with deep expertise in network automation, zero-trust security, and cloud infrastructure.',
  recruiterSummary:
    "Rishabh is an infrastructure and security engineer with 4+ years of enterprise experience. He holds CCNP Enterprise, CCNP ENAUTO, and NVIDIA AI Infrastructure certifications. He has built multi-cloud automation pipelines, GPU observability stacks, and zero-trust network architectures. Currently available for infrastructure, network engineering, or DevOps/SRE roles.",
  location: 'Remote / Global',
  focus: [
    'AI Infrastructure',
    'Network Automation',
    'Zero-Trust Security',
    'Observability Engineering',
    'Infrastructure-as-Code',
  ],
  currentStatus: 'Independent Infrastructure Consultant — Open to full-time',
};

export const projects: KnowledgeProject[] = [
  {
    id: '1',
    title: 'Multi-Cloud Network Automation Pipeline',
    problem:
      'Manual network configuration changes across AWS, Azure, and on-prem caused configuration drift and slow incident response.',
    architecture:
      'Event-driven pipeline: ServiceNow → Python orchestrator → Terraform (cloud) / Ansible (on-prem). Git-backed config store. Slack real-time notifications. OPA policy validation before apply.',
    tools: ['Python', 'Terraform', 'Ansible', 'AWS', 'Azure', 'ServiceNow', 'Slack API', 'OPA'],
    outcome:
      'Reduced config deployment time from hours to minutes. Achieved 100% change audit compliance. Eliminated configuration drift across cloud and on-prem.',
    recruiterSummary:
      'Built an end-to-end network automation pipeline managing configs across AWS, Azure, and on-prem. Reduced deployment time from hours to minutes and achieved full audit compliance.',
    technicalDeep:
      'ServiceNow change tickets triggered a Python orchestrator that called Terraform for cloud resources and Ansible for on-prem gear. OPA Rego policies validated configs before apply. State stored in S3 with DynamoDB locking. Slack webhooks sent per-step status updates.',
    category: ['automation', 'networking', 'infrastructure'],
    tags: ['automation', 'network', 'infrastructure'],
  },
  {
    id: '2',
    title: 'AI Infrastructure Observability Stack',
    problem:
      'GPU clusters for ML workloads lacked visibility into resource utilization, thermal performance, and network bottlenecks.',
    architecture:
      'NVIDIA DCGM exporters on GPU nodes → Prometheus → Grafana dashboards. Custom eBPF probes for NIC-level telemetry. Correlation layer linking GPU, network, and storage metrics.',
    tools: ['Prometheus', 'Grafana', 'Python', 'NVIDIA DCGM', 'eBPF', 'Kubernetes'],
    outcome:
      'Enabled proactive bottleneck identification. Improved workload scheduling efficiency. Reduced GPU idle time by correlating network and compute metrics in unified dashboards.',
    recruiterSummary:
      'Designed and deployed a full observability stack for GPU-based ML infrastructure. Built custom dashboards correlating GPU utilization, network throughput, and storage I/O.',
    technicalDeep:
      'DCGM exporters pushed GPU metrics (temperature, SM utilization, NVLink bandwidth) to Prometheus. Custom eBPF programs captured NIC-level telemetry. Grafana dashboards used multi-datasource correlation. Alerts fired on thermal thresholds and NVLink saturation events.',
    category: ['observability', 'ai-infrastructure'],
    tags: ['observability', 'ai', 'monitoring'],
  },
  {
    id: '3',
    title: 'Zero-Trust Network Segmentation',
    problem:
      'Legacy flat network architecture exposed the enterprise to lateral movement risk and made incident containment difficult.',
    architecture:
      'Cisco ACI microsegmentation + Palo Alto NGFWs. Policy-as-code framework in Python and Terraform. SIEM integration for real-time policy violation alerting and automated quarantine.',
    tools: ['Cisco ACI', 'Palo Alto', 'Python', 'Terraform', 'Splunk'],
    outcome:
      'Eliminated lateral movement paths between segments. Reduced attack surface significantly. Automated policy compliance reporting with zero manual steps.',
    recruiterSummary:
      'Led zero-trust architecture implementation across the enterprise network using Cisco ACI and Palo Alto. Created policy-driven microsegmentation with automated compliance checks.',
    technicalDeep:
      'Designed Endpoint Group (EPG) policy model in Cisco ACI. Palo Alto Security Policy Optimizer reviewed existing rules and recommended micro-segmentation policies. Terraform managed ACI and Palo Alto policy lifecycle. Splunk alerts on inter-segment anomalies triggered automated quarantine via API.',
    category: ['security', 'networking'],
    tags: ['security', 'network', 'zero-trust'],
  },
  {
    id: '4',
    title: 'Automated Incident Response Platform',
    problem:
      'Manual incident triage led to inconsistent handling, missed SLAs, and delayed remediation across the security team.',
    architecture:
      'PagerDuty alert intake → Python SOAR engine → SIEM queries for IOC enrichment → automated runbooks → Slack coordination bot. NLP severity classifier trained on historical incidents.',
    tools: ['Python', 'PagerDuty', 'Splunk', 'Slack API', 'REST APIs'],
    outcome:
      'Standardized incident response across the team. Automated tier-1 triage for common patterns. Reduced time to initial response and improved consistency.',
    recruiterSummary:
      'Built an automated incident response platform that standardized triage, automated common remediation steps, and reduced response time through intelligent routing and SOAR automation.',
    technicalDeep:
      'Python-based SOAR platform with modular runbook plugins. Splunk integration for IOC enrichment and timeline reconstruction. NLP-based severity classifier trained on historical ticket text. Slack bot for team coordination with per-incident state machine tracking.',
    category: ['security', 'automation'],
    tags: ['automation', 'security', 'incident-response'],
  },
  {
    id: '5',
    title: 'Infrastructure-as-Code Pipeline',
    problem:
      'Manual infrastructure provisioning was error-prone, slow to audit, and inconsistent across teams.',
    architecture:
      'GitHub Actions CI/CD → Terraform Cloud workspaces → OPA policy validation gate → multi-cloud provisioning. Reusable module library for VPC, EKS, RDS. Automated drift detection.',
    tools: ['Terraform', 'GitHub Actions', 'OPA', 'AWS', 'Terraform Cloud'],
    outcome:
      'Full IaC adoption across the infrastructure team. Reduced provisioning from days to hours. 100% policy compliance enforced in CI on every deployment.',
    recruiterSummary:
      'Implemented a complete IaC pipeline with policy guardrails, CI/CD automation, and a reusable module library. Enabled team-wide adoption of Infrastructure-as-Code practices.',
    technicalDeep:
      'Terraform modules for VPC, EKS, RDS patterns. OPA Rego policies enforced in CI (mandatory tagging, encryption at rest, least-privilege IAM). Terraform Cloud workspaces per environment. Automated drift detection via scheduled plan runs with Slack alerts on deviation.',
    category: ['infrastructure', 'automation'],
    tags: ['infrastructure', 'automation', 'iac'],
  },
  {
    id: '6',
    title: 'Network Performance Analysis Tool',
    problem:
      'Troubleshooting network performance issues required slow manual packet analysis and correlation across multiple tools.',
    architecture:
      'Python CLI: packet capture intake → automated Scapy parsing → Pandas flow correlation → statistical anomaly detection. Wireshark integration for deep inspection. Baseline profiling.',
    tools: ['Python', 'Wireshark', 'eBPF', 'Pandas', 'Scapy'],
    outcome:
      'Accelerated network troubleshooting by automating common analysis steps. Automated root cause identification for known patterns. Reduced mean time to resolution for network incidents.',
    recruiterSummary:
      'Developed a custom network performance analysis tool that automated packet capture processing and anomaly detection, significantly reducing manual troubleshooting time.',
    technicalDeep:
      'Scapy for packet capture and protocol parsing. Pandas for statistical analysis and baselining across flow metrics. eBPF kernel probes for low-overhead network event capture. Anomaly detection using z-score and IQR methods to flag deviating flows against historical baselines.',
    category: ['networking', 'automation'],
    tags: ['network', 'troubleshooting', 'automation'],
  },
];

export const experience: KnowledgeExperience[] = [
  {
    role: 'Independent Infrastructure Consultant',
    company: 'NDA Projects',
    duration: 'Dec 2025 – Present',
    type: 'consulting',
    highlights: [
      'Infrastructure design and automation for enterprise clients',
      'Network architecture reviews and performance optimization',
      'Observability stack implementation and tuning',
      'IaC migration consulting and policy enforcement',
    ],
    recruiterNote:
      'Currently consulting under NDA with enterprise clients on infrastructure, automation, and observability engagements.',
  },
  {
    role: 'Security Network Engineer',
    company: 'Wipro Limited',
    duration: 'Jun 2024 – Nov 2025',
    type: 'full-time',
    highlights: [
      'Led network security initiatives for enterprise clients',
      'Managed Cisco and Palo Alto firewall policies at scale',
      'Implemented network segmentation and zero-trust architecture',
      'Built automated incident response workflows',
      'Reduced manual security operations significantly through automation',
    ],
    recruiterNote:
      '1.5 years at Wipro as Security Network Engineer, leading client-facing security and network automation projects.',
  },
];

export const certifications: KnowledgeCertification[] = [
  {
    name: 'NVIDIA AI Infrastructure and Operations',
    issuer: 'NVIDIA',
    year: 2026,
    relevance:
      'GPU cluster management, AI workload infrastructure, NVIDIA InfiniBand networking, NVLink fabric operations, DCGM monitoring',
  },
  {
    name: 'CCNP Enterprise',
    issuer: 'Cisco',
    year: 2025,
    relevance: 'Advanced enterprise routing and switching, BGP, OSPF, EIGRP, SD-WAN, enterprise architecture',
  },
  {
    name: 'CCNP ENCOR',
    issuer: 'Cisco',
    year: 2025,
    relevance:
      'Core enterprise networking — routing, switching, wireless, security integration, and network automation',
  },
  {
    name: 'CCNP ENAUTO',
    issuer: 'Cisco',
    year: 2025,
    relevance:
      'Network automation with Python, REST APIs, Ansible, YANG/NETCONF, gRPC, and Cisco DNA Center/Catalyst Center',
  },
  {
    name: 'CCNA',
    issuer: 'Cisco',
    year: 2022,
    relevance: 'Networking fundamentals: IP addressing, routing, switching, VLANs, security basics, automation basics',
  },
];

export const skills: KnowledgeSkillCategory[] = [
  {
    category: 'Infrastructure & Cloud',
    skills: ['AWS', 'Azure', 'Kubernetes', 'Docker', 'Terraform', 'Infrastructure-as-Code', 'GitHub Actions'],
  },
  {
    category: 'Networking',
    skills: ['Cisco IOS/NX-OS', 'BGP', 'OSPF', 'SD-WAN', 'Cisco ACI', 'VXLAN', 'MPLS', 'NETCONF/YANG'],
  },
  {
    category: 'Security',
    skills: [
      'Palo Alto NGFW',
      'Zero-Trust Architecture',
      'Microsegmentation',
      'SIEM Engineering',
      'Incident Response',
      'Threat Modeling',
    ],
  },
  {
    category: 'Observability',
    skills: ['Prometheus', 'Grafana', 'Datadog', 'Splunk', 'OpenTelemetry', 'eBPF', 'NVIDIA DCGM'],
  },
  {
    category: 'Automation & Scripting',
    skills: ['Python', 'Ansible', 'Terraform', 'GitHub Actions', 'REST APIs', 'Scapy', 'OPA/Rego'],
  },
  {
    category: 'AI Infrastructure',
    skills: [
      'NVIDIA DCGM',
      'GPU Cluster Management',
      'InfiniBand',
      'NVLink',
      'ML Pipeline Infrastructure',
      'Ray',
      'Kubernetes for AI',
    ],
  },
];

export const quickFacts = {
  yearsExperience: '4+',
  primaryLanguage: 'Python',
  cloudExperience: 'AWS + Azure',
  certificationCount: certifications.length,
  projectCount: projects.length,
  availability: 'Open to full-time opportunities',
};

export const recruiterHighlights = [
  '4+ years of enterprise infrastructure and security engineering',
  'CCNP Enterprise, CCNP ENAUTO, NVIDIA AI Infrastructure certified',
  'Built multi-cloud automation pipelines processing hundreds of changes/day',
  'Deep expertise in zero-trust architecture and network microsegmentation',
  'Hands-on GPU cluster observability for ML infrastructure',
  'Strong Python automation background across networking and security',
];
