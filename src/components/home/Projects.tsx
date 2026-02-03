'use client';

import { type Project } from '@/types';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export function Projects({ projects }: { projects: Project[] }) {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
  }, []);

  const MotionDiv = reducedMotion ? 'div' : motion.div;
  const motionProps = reducedMotion
    ? {}
    : {
        whileHover: { y: -4 },
        transition: { duration: 0.2 },
      };

  return (
    <section id="projects" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-highlight">
            Projects
          </h2>
          <Link
            href="/projects"
            className="text-sm text-muted hover:text-highlight transition-colors"
          >
            View All →
          </Link>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
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
      </div>
    </section>
  );
}
