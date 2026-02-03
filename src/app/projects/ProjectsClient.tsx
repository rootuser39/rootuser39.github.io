'use client';

import { useState, useMemo, useEffect } from 'react';
import { type Project } from '@/types';
import { motion } from 'framer-motion';
import { QueryProvider } from '@/lib/query/QueryProvider';

function ProjectsContent({ initialProjects }: { initialProjects: Project[] }) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
  }, []);

  // Get all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    initialProjects.forEach(project => {
      project.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [initialProjects]);

  // Filter projects based on selected tags
  const filteredProjects = useMemo(() => {
    if (selectedTags.length === 0) return initialProjects;
    return initialProjects.filter(project =>
      selectedTags.some(tag => project.tags.includes(tag))
    );
  }, [initialProjects, selectedTags]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearFilters = () => setSelectedTags([]);

  const MotionDiv = reducedMotion ? 'div' : motion.div;
  const motionProps = reducedMotion
    ? {}
    : {
        whileHover: { y: -4 },
        transition: { duration: 0.2 },
      };

  return (
    <>
      {/* Filter Section */}
      <div className="mb-8 glass p-6 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-highlight">Filter by Tags</h2>
          {selectedTags.length > 0 && (
            <button
              onClick={clearFilters}
              className="text-sm text-muted hover:text-highlight transition-colors"
            >
              Clear All
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`px-3 py-1 rounded text-sm transition-all ${
                selectedTags.includes(tag)
                  ? 'bg-highlight text-bg font-medium'
                  : 'glass-surface2 text-muted hover:text-highlight'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
        <p className="text-sm text-muted mt-4">
          Showing {filteredProjects.length} of {initialProjects.length} projects
        </p>
      </div>

      {/* Projects Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <MotionDiv
            key={project.id}
            className="glass p-6 rounded-lg space-y-4 h-full flex flex-col"
            {...motionProps}
          >
            <h3 className="text-lg font-semibold text-highlight">
              {project.title}
            </h3>
            
            <div className="space-y-3 flex-1">
              <div>
                <h4 className="text-xs font-semibold text-muted uppercase mb-1">
                  Problem
                </h4>
                <p className="text-sm text-text">{project.problem}</p>
              </div>
              
              <div>
                <h4 className="text-xs font-semibold text-muted uppercase mb-1">
                  Build
                </h4>
                <p className="text-sm text-text">{project.build}</p>
              </div>
              
              <div>
                <h4 className="text-xs font-semibold text-muted uppercase mb-1">
                  Outcome
                </h4>
                <p className="text-sm text-text">{project.outcome}</p>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-muted uppercase mb-2">
                Stack
              </h4>
              <div className="flex flex-wrap gap-2">
                {project.stack.map((tech) => (
                  <span
                    key={tech}
                    className="text-xs px-2 py-1 glass-surface2 rounded text-muted"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {(project.repo || project.demo) && (
              <div className="flex gap-3 pt-2">
                {project.repo && (
                  <a
                    href={project.repo}
                    className="text-xs text-muted hover:text-highlight transition-colors"
                  >
                    Repository →
                  </a>
                )}
                {project.demo && (
                  <a
                    href={project.demo}
                    className="text-xs text-muted hover:text-highlight transition-colors"
                  >
                    Demo →
                  </a>
                )}
              </div>
            )}
          </MotionDiv>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted">No projects match the selected filters.</p>
        </div>
      )}
    </>
  );
}

export function ProjectsClient({ initialProjects }: { initialProjects: Project[] }) {
  return (
    <QueryProvider>
      <ProjectsContent initialProjects={initialProjects} />
    </QueryProvider>
  );
}
