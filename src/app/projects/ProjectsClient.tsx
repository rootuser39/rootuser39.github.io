'use client';

import { useState, useMemo, useEffect } from 'react';
import { type Project } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { QueryProvider } from '@/lib/query/QueryProvider';
import { projects as knowledgeProjects } from '@/lib/knowledge';

// Build a lookup for enhanced knowledge-base data
const knowledgeMap = Object.fromEntries(knowledgeProjects.map((p) => [p.title, p]));

function ProjectCard({
  project,
  reducedMotion,
}: {
  project: Project;
  reducedMotion: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const extra = knowledgeMap[project.title];

  const MotionDiv = reducedMotion ? 'div' : motion.div;
  const hoverProps = reducedMotion
    ? {}
    : { whileHover: { y: -3 }, transition: { duration: 0.2 } };

  return (
    <MotionDiv
      className="glass rounded-xl overflow-hidden flex flex-col"
      {...hoverProps}
    >
      {/* Card header — always visible */}
      <div className="p-6 space-y-4 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-semibold text-highlight leading-tight">{project.title}</h3>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="shrink-0 w-6 h-6 flex items-center justify-center text-muted hover:text-highlight transition-colors rounded"
            aria-label={expanded ? 'Collapse project' : 'Expand project'}
            aria-expanded={expanded}
          >
            <motion.svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </motion.svg>
          </button>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {project.tags.map((tag) => (
            <span key={tag} className="text-[10px] px-2 py-0.5 glass-surface2 rounded text-muted">
              {tag}
            </span>
          ))}
        </div>

        <div className="space-y-3 flex-1">
          <div>
            <h4 className="text-[10px] font-semibold text-muted/60 uppercase tracking-widest mb-1">Problem</h4>
            <p className="text-xs text-text/80 leading-relaxed">{project.problem}</p>
          </div>

          <div>
            <h4 className="text-[10px] font-semibold text-muted/60 uppercase tracking-widest mb-1">Outcome</h4>
            <p className="text-xs text-text/80 leading-relaxed">{project.outcome}</p>
          </div>
        </div>

        {/* Stack */}
        <div>
          <h4 className="text-[10px] font-semibold text-muted/60 uppercase tracking-widest mb-2">Stack</h4>
          <div className="flex flex-wrap gap-1.5">
            {project.stack.map((tech) => (
              <span key={tech} className="text-[10px] px-2 py-0.5 glass-surface2 rounded text-muted">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Expandable case study */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="expanded"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/10 px-6 py-5 space-y-4 bg-white/[0.02]">
              {/* Recruiter summary */}
              {extra?.recruiterSummary && (
                <div>
                  <h4 className="text-[10px] font-mono font-semibold text-emerald-400/70 uppercase tracking-widest mb-1.5">
                    Recruiter Summary
                  </h4>
                  <p className="text-xs text-text/80 leading-relaxed">{extra.recruiterSummary}</p>
                </div>
              )}

              {/* Architecture */}
              {extra?.architecture && (
                <div>
                  <h4 className="text-[10px] font-mono font-semibold text-muted/60 uppercase tracking-widest mb-1.5">
                    Architecture
                  </h4>
                  <p className="text-xs text-text/70 leading-relaxed font-mono">{extra.architecture}</p>
                </div>
              )}

              {/* Technical deep dive */}
              {extra?.technicalDeep && (
                <div>
                  <h4 className="text-[10px] font-mono font-semibold text-muted/60 uppercase tracking-widest mb-1.5">
                    Technical Deep Dive
                  </h4>
                  <p className="text-xs text-text/70 leading-relaxed">{extra.technicalDeep}</p>
                </div>
              )}

              {/* Build (from original project data) */}
              <div>
                <h4 className="text-[10px] font-mono font-semibold text-muted/60 uppercase tracking-widest mb-1.5">
                  Build
                </h4>
                <p className="text-xs text-text/70 leading-relaxed">{project.build}</p>
              </div>

              {/* Links */}
              {(project.repo || project.demo) && (
                <div className="flex gap-4 pt-1">
                  {project.repo && project.repo !== '#' && (
                    <a
                      href={project.repo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-muted hover:text-highlight transition-colors"
                    >
                      Repository →
                    </a>
                  )}
                  {project.demo && project.demo !== '#' && (
                    <a
                      href={project.demo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-muted hover:text-highlight transition-colors"
                    >
                      Demo →
                    </a>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </MotionDiv>
  );
}

function ProjectsContent({ initialProjects }: { initialProjects: Project[] }) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
  }, []);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    initialProjects.forEach((project) => {
      project.tags.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [initialProjects]);

  const filteredProjects = useMemo(() => {
    if (selectedTags.length === 0) return initialProjects;
    return initialProjects.filter((project) =>
      selectedTags.some((tag) => project.tags.includes(tag))
    );
  }, [initialProjects, selectedTags]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const clearFilters = () => setSelectedTags([]);

  return (
    <>
      {/* Filter Section */}
      <div className="mb-8 glass p-5 rounded-xl border border-white/10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-muted/60 uppercase tracking-widest">Filter</span>
          </div>
          {selectedTags.length > 0 && (
            <button
              onClick={clearFilters}
              className="text-xs text-muted hover:text-highlight transition-colors"
            >
              Clear All
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`px-3 py-1 rounded text-xs transition-all ${
                selectedTags.includes(tag)
                  ? 'bg-highlight text-bg font-medium'
                  : 'glass-surface2 text-muted hover:text-highlight'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted/50 mt-3 font-mono">
          {filteredProjects.length} of {initialProjects.length} projects
        </p>
      </div>

      {/* Projects Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProjects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            reducedMotion={reducedMotion}
          />
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-16">
          <p className="text-muted text-sm">No projects match the selected filters.</p>
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
