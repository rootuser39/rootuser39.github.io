'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAgent } from '@/lib/agent/context';
import { projects } from '@/lib/knowledge';

interface Command {
  id: string;
  label: string;
  description?: string;
  group: string;
  icon: React.ReactNode;
  action: () => void;
  keywords?: string[];
}

const NavIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
  </svg>
);

const ActionIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const ProjectIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
  </svg>
);

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { openAgent } = useAgent();

  const close = useCallback(() => {
    setIsOpen(false);
    setQuery('');
    setActiveIndex(0);
  }, []);

  // Open on Cmd+K / Ctrl+K
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') close();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [close]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setActiveIndex(0);
    }
  }, [isOpen]);

  function navigate(href: string) {
    close();
    // Small delay so modal closes before navigation
    setTimeout(() => router.push(href), 80);
  }

  function scrollTo(id: string) {
    close();
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        router.push(`/#${id}`);
      }
    }, 80);
  }

  const allCommands: Command[] = [
    // Navigation
    {
      id: 'nav-home', label: 'Home', group: 'Navigate',
      icon: <NavIcon />, action: () => navigate('/'),
      keywords: ['home', 'top', 'start'],
    },
    {
      id: 'nav-about', label: 'About', description: 'About Rishabh', group: 'Navigate',
      icon: <NavIcon />, action: () => scrollTo('about'),
      keywords: ['about', 'bio', 'who'],
    },
    {
      id: 'nav-experience', label: 'Experience', description: 'Work history', group: 'Navigate',
      icon: <NavIcon />, action: () => scrollTo('experience'),
      keywords: ['experience', 'work', 'career', 'job'],
    },
    {
      id: 'nav-projects', label: 'Projects', description: 'All featured projects', group: 'Navigate',
      icon: <NavIcon />, action: () => navigate('/projects'),
      keywords: ['projects', 'portfolio', 'builds'],
    },
    {
      id: 'nav-certifications', label: 'Certifications', description: 'CCNP, NVIDIA & more', group: 'Navigate',
      icon: <NavIcon />, action: () => scrollTo('certifications'),
      keywords: ['certs', 'certifications', 'ccnp', 'nvidia'],
    },
    {
      id: 'nav-skills', label: 'Skills', description: 'Technical skill categories', group: 'Navigate',
      icon: <NavIcon />, action: () => scrollTo('skills'),
      keywords: ['skills', 'tech', 'stack', 'tools'],
    },
    {
      id: 'nav-contact', label: 'Contact', description: 'Get in touch', group: 'Navigate',
      icon: <NavIcon />, action: () => scrollTo('contact'),
      keywords: ['contact', 'email', 'reach'],
    },
    {
      id: 'nav-recruiter', label: 'Recruiter Mode', description: '30-second summary view', group: 'Navigate',
      icon: <NavIcon />, action: () => navigate('/recruiter'),
      keywords: ['recruiter', 'hiring', 'summary'],
    },
    {
      id: 'nav-services', label: 'Services', group: 'Navigate',
      icon: <NavIcon />, action: () => navigate('/services'),
      keywords: ['services', 'consulting', 'hire'],
    },
    {
      id: 'nav-timeline', label: 'Timeline', description: 'Career timeline', group: 'Navigate',
      icon: <NavIcon />, action: () => navigate('/timeline'),
      keywords: ['timeline', 'history', 'career'],
    },
    // Actions
    {
      id: 'action-agent', label: 'Open Portfolio Agent', description: 'Chat with the portfolio agent', group: 'Actions',
      icon: <ActionIcon />, action: () => { close(); openAgent(); },
      keywords: ['agent', 'chat', 'portfolio agent', 'assistant', 'ask'],
    },
    {
      id: 'action-resume', label: 'Download Resume', description: 'Open resume PDF', group: 'Actions',
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      ),
      action: () => { close(); window.open('/resume.pdf', '_blank'); },
      keywords: ['resume', 'cv', 'download', 'pdf'],
    },
    {
      id: 'action-github', label: 'GitHub Profile', group: 'Actions',
      icon: <ActionIcon />, action: () => { close(); window.open('https://github.com/rootuser39', '_blank'); },
      keywords: ['github', 'code', 'repos'],
    },
    {
      id: 'action-linkedin', label: 'LinkedIn Profile', group: 'Actions',
      icon: <ActionIcon />, action: () => { close(); window.open('https://linkedin.com/in/rishabh-durugkar', '_blank'); },
      keywords: ['linkedin', 'connect', 'network'],
    },
    {
      id: 'action-recruiter-summary', label: 'Open Recruiter Summary', description: 'Ask portfolio agent for recruiter brief', group: 'Actions',
      icon: <ActionIcon />, action: () => { close(); openAgent('Summarize for a recruiter'); },
      keywords: ['recruiter', 'summary', 'brief', 'hiring'],
    },
    // Projects
    ...projects.map((p) => ({
      id: `proj-${p.id}`,
      label: p.title,
      description: p.category.join(' · '),
      group: 'Projects',
      icon: <ProjectIcon />,
      action: () => { close(); openAgent(`Tell me about ${p.title}`); },
      keywords: [...p.tags, ...p.category, p.title.toLowerCase()],
    })),
  ];

  const filtered = query.trim()
    ? allCommands.filter((cmd) => {
        const q = query.toLowerCase();
        return (
          cmd.label.toLowerCase().includes(q) ||
          cmd.description?.toLowerCase().includes(q) ||
          cmd.keywords?.some((k) => k.includes(q))
        );
      })
    : allCommands;

  // Group
  const groups = Array.from(new Set(filtered.map((c) => c.group)));
  const flatList = filtered;

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % flatList.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + flatList.length) % flatList.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      flatList[activeIndex]?.action();
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="palette-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
            onClick={close}
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            key="palette-panel"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="fixed top-24 left-1/2 z-[61] w-full max-w-xl -translate-x-1/2 glass rounded-xl overflow-hidden shadow-2xl border border-white/10"
            role="dialog"
            aria-label="Command palette"
            aria-modal="true"
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
              <svg className="w-4 h-4 text-muted shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => { setQuery(e.target.value); setActiveIndex(0); }}
                onKeyDown={handleKeyDown}
                placeholder="Search commands, projects, sections…"
                className="flex-1 bg-transparent text-sm text-text placeholder:text-muted/50 outline-none"
                aria-label="Command search"
              />
              <kbd className="hidden sm:flex items-center gap-1 text-[10px] text-muted border border-white/10 rounded px-1.5 py-0.5 font-mono">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div className="overflow-y-auto max-h-80 py-2">
              {filtered.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-muted">No commands found</div>
              ) : (
                groups.map((group) => {
                  const groupItems = filtered.filter((c) => c.group === group);
                  return (
                    <div key={group}>
                      <div className="px-4 py-1.5 text-[10px] font-semibold text-muted/60 uppercase tracking-widest">
                        {group}
                      </div>
                      {groupItems.map((cmd) => {
                        const idx = flatList.indexOf(cmd);
                        const isActive = idx === activeIndex;
                        return (
                          <button
                            key={cmd.id}
                            onClick={cmd.action}
                            onMouseEnter={() => setActiveIndex(idx)}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors duration-100 ${
                              isActive ? 'bg-white/5' : 'hover:bg-white/5'
                            }`}
                          >
                            <span className={`shrink-0 ${isActive ? 'text-highlight' : 'text-muted'}`}>
                              {cmd.icon}
                            </span>
                            <span className="flex-1 min-w-0">
                              <span className={`text-sm block truncate ${isActive ? 'text-highlight' : 'text-text'}`}>
                                {cmd.label}
                              </span>
                              {cmd.description && (
                                <span className="text-[11px] text-muted truncate block">{cmd.description}</span>
                              )}
                            </span>
                            {isActive && (
                              <kbd className="text-[10px] text-muted border border-white/10 rounded px-1.5 py-0.5 font-mono shrink-0">
                                ↵
                              </kbd>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-2 border-t border-white/10 text-[10px] text-muted/50 font-mono">
              <span>↑↓ navigate</span>
              <span>↵ select</span>
              <span>esc close</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
