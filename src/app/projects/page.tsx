import { getProjects } from '@/lib/data';
import { ProjectsClient } from './ProjectsClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Projects | Rishabh Durugkar',
  description: 'Infrastructure, networking, and security engineering projects',
};

export default async function ProjectsPage() {
  const projects = await getProjects();
  
  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-bold text-highlight mb-4">
          Projects
        </h1>
        <p className="text-muted mb-12 max-w-2xl">
          Selected infrastructure, networking, and security projects showcasing 
          automation, observability, and reliability engineering.
        </p>
        
        <ProjectsClient initialProjects={projects} />
      </div>
    </div>
  );
}
