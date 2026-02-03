export interface Project {
  id: string;
  title: string;
  problem: string;
  build: string;
  outcome: string;
  stack: string[];
  tags: string[];
  repo?: string;
  demo?: string;
}

export interface Service {
  id: string;
  title: string;
  whatYouGet: string[];
  deliverable: string;
  tooling: string[];
}

export interface TimelineEntry {
  id: string;
  year: number;
  month: string;
  title: string;
  company?: string;
  description: string;
  type: 'work' | 'education' | 'certification' | 'project';
  expanded?: boolean;
}
