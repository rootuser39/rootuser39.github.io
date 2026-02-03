import { Project, Service, TimelineEntry } from '@/types';
import { createServerClient } from '@/lib/supabase/server';

// Seed data for projects
const seedProjects: Project[] = [
  {
    id: '1',
    title: 'Multi-Cloud Network Automation Pipeline',
    problem: 'Manual network configuration changes across AWS, Azure, and on-prem infrastructure led to configuration drift and prolonged incident response times.',
    build: 'Built an event-driven automation pipeline using Terraform, Ansible, and Python. Integrated with ServiceNow for change tracking and Slack for real-time notifications.',
    outcome: 'Reduced configuration deployment time and improved change audit compliance.',
    stack: ['Python', 'Terraform', 'Ansible', 'AWS', 'Azure'],
    tags: ['automation', 'network', 'infrastructure'],
    repo: '#',
    demo: '#',
  },
  {
    id: '2',
    title: 'AI Infrastructure Observability Stack',
    problem: 'GPU clusters for ML workloads lacked visibility into resource utilization, thermal performance, and network bottlenecks.',
    build: 'Deployed Prometheus, Grafana, and custom DCGM exporters. Built correlation dashboards linking GPU utilization, network throughput, and storage I/O.',
    outcome: 'Enabled proactive identification of bottlenecks and improved workload scheduling efficiency.',
    stack: ['Prometheus', 'Grafana', 'Python', 'NVIDIA DCGM', 'eBPF'],
    tags: ['observability', 'ai', 'monitoring'],
  },
  {
    id: '3',
    title: 'Zero-Trust Network Segmentation',
    problem: 'Legacy flat network architecture posed security risks and made it difficult to contain lateral movement during incidents.',
    build: 'Designed and implemented microsegmentation using Cisco ACI and Palo Alto firewalls. Created policy-as-code framework for network access control.',
    outcome: 'Enhanced security posture and improved incident containment capabilities.',
    stack: ['Cisco ACI', 'Palo Alto', 'Python', 'Terraform'],
    tags: ['security', 'network', 'zero-trust'],
  },
  {
    id: '4',
    title: 'Automated Incident Response Platform',
    problem: 'Manual incident triage and response led to inconsistent handling and delayed remediation.',
    build: 'Built incident response automation using Python and integrated with PagerDuty, Slack, and SIEM. Implemented automated runbooks for common scenarios.',
    outcome: 'Standardized incident response procedures and reduced time to initial response.',
    stack: ['Python', 'PagerDuty', 'Splunk', 'Slack API'],
    tags: ['automation', 'security', 'incident-response'],
  },
  {
    id: '5',
    title: 'Infrastructure-as-Code Pipeline',
    problem: 'Manual infrastructure provisioning was error-prone and difficult to audit.',
    build: 'Implemented full IaC pipeline using Terraform Cloud, GitHub Actions, and policy validation with OPA. Created reusable modules for common patterns.',
    outcome: 'Improved infrastructure consistency and reduced provisioning time.',
    stack: ['Terraform', 'GitHub Actions', 'OPA', 'AWS'],
    tags: ['infrastructure', 'automation', 'iac'],
  },
  {
    id: '6',
    title: 'Network Performance Analysis Tool',
    problem: 'Troubleshooting network performance issues required manual packet analysis and correlation across multiple sources.',
    build: 'Developed custom Python tool for automated packet capture analysis, flow correlation, and anomaly detection using statistical methods.',
    outcome: 'Accelerated network troubleshooting and improved root cause identification.',
    stack: ['Python', 'Wireshark', 'eBPF', 'Pandas'],
    tags: ['network', 'troubleshooting', 'automation'],
  },
];

// Seed data for services
const seedServices: Service[] = [
  {
    id: '1',
    title: 'Infrastructure Reliability & Observability',
    whatYouGet: [
      'Full-stack monitoring implementation (metrics, logs, traces)',
      'Custom dashboards and alerting for your critical paths',
      'SLO definition, error budget tracking, and incident response playbooks',
    ],
    deliverable: 'Production-ready observability stack with documentation and training',
    tooling: ['Prometheus', 'Grafana', 'Datadog', 'New Relic', 'OpenTelemetry'],
  },
  {
    id: '2',
    title: 'Network Design, Troubleshooting & Automation',
    whatYouGet: [
      'Network architecture design and optimization for hybrid/multi-cloud',
      'Performance troubleshooting and capacity planning',
      'Automation pipelines for configuration management and validation',
    ],
    deliverable: 'Network design documentation, automation scripts, and troubleshooting runbooks',
    tooling: ['Cisco', 'Juniper', 'Palo Alto', 'Terraform', 'Ansible', 'Python'],
  },
  {
    id: '3',
    title: 'Security Validation & Detection Engineering',
    whatYouGet: [
      'Security architecture review and threat modeling',
      'Detection rule development and tuning for SIEM/EDR',
      'Incident response automation and playbook development',
    ],
    deliverable: 'Security assessment report, detection rules, and automated response workflows',
    tooling: ['Splunk', 'Sentinel', 'Chronicle', 'Palo Alto', 'CrowdStrike'],
  },
  {
    id: '4',
    title: 'AI-Ready Infrastructure Readiness',
    whatYouGet: [
      'GPU cluster design and optimization for ML workloads',
      'Storage and network performance tuning for data pipelines',
      'Observability for GPU utilization, thermal management, and bottleneck detection',
    ],
    deliverable: 'Infrastructure design, performance tuning guide, and monitoring dashboards',
    tooling: ['NVIDIA GPUs', 'RDMA', 'High-speed storage', 'Kubernetes', 'Ray'],
  },
];

// Seed data for timeline
const seedTimelineEntries: TimelineEntry[] = [
  {
    id: '1',
    year: 2026,
    month: 'Jan',
    title: 'NVIDIA AI Infrastructure Certification',
    type: 'certification',
    description: 'Completed NVIDIA AI Infrastructure and Operations certification focusing on GPU cluster management and optimization.',
  },
  {
    id: '2',
    year: 2025,
    month: 'Dec',
    title: 'Independent Infrastructure Consultant',
    company: 'NDA Projects',
    type: 'work',
    description: 'Providing infrastructure, network automation, and observability consulting for enterprise clients under NDA.',
  },
  {
    id: '3',
    year: 2025,
    month: 'Oct',
    title: 'CCNP Enterprise & ENAUTO',
    type: 'certification',
    description: 'Achieved CCNP Enterprise and ENAUTO certifications, focusing on advanced routing, switching, and network automation.',
  },
  {
    id: '4',
    year: 2024,
    month: 'Jun',
    title: 'Security Network Engineer',
    company: 'Wipro Limited',
    type: 'work',
    description: 'Led network security initiatives including firewall management, network segmentation, and incident response for enterprise clients.',
  },
  {
    id: '5',
    year: 2023,
    month: 'Aug',
    title: 'Network Automation Project',
    type: 'project',
    description: 'Developed automated network configuration management system using Python and Ansible, reducing deployment time significantly.',
  },
  {
    id: '6',
    year: 2022,
    month: 'May',
    title: 'CCNA Certification',
    type: 'certification',
    description: 'Obtained CCNA certification, establishing foundation in networking fundamentals and Cisco technologies.',
  },
  {
    id: '7',
    year: 2021,
    month: 'Aug',
    title: 'Started Network Engineering Career',
    company: 'Wipro Limited',
    type: 'work',
    description: 'Began career as Network Engineer, working on enterprise network infrastructure and support.',
  },
];

export async function getProjects(): Promise<Project[]> {
  const supabase = createServerClient();
  
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('id', { ascending: true });
      
      if (!error && data) {
        return data as Project[];
      }
    } catch (e) {
      console.error('Supabase error:', e);
    }
  }
  
  // Fallback to seed data
  return seedProjects;
}

export async function getServices(): Promise<Service[]> {
  const supabase = createServerClient();
  
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('id', { ascending: true });
      
      if (!error && data) {
        return data as Service[];
      }
    } catch (e) {
      console.error('Supabase error:', e);
    }
  }
  
  // Fallback to seed data
  return seedServices;
}

export async function getTimelineEntries(): Promise<TimelineEntry[]> {
  const supabase = createServerClient();
  
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('timeline')
        .select('*')
        .order('year', { ascending: false })
        .order('month', { ascending: false });
      
      if (!error && data) {
        return data as TimelineEntry[];
      }
    } catch (e) {
      console.error('Supabase error:', e);
    }
  }
  
  // Fallback to seed data
  return seedTimelineEntries;
}
