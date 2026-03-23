'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAgent } from '@/lib/agent/context';

// ── Rotating status signals ──────────────────────────────────────────────────

const SIGNALS = [
  'AI Infrastructure Focus',
  'Network Automation Active',
  'Observability Stack Ready',
  'Zero-Trust Expertise Online',
  'CCNP Certified · NVIDIA Certified',
  'Recruiter Mode Available',
];

function RotatingSignal() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % SIGNALS.length);
        setVisible(true);
      }, 300);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2 min-h-[1.25rem]">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
      <span
        className="text-xs font-mono text-emerald-400/90 transition-opacity duration-300"
        style={{ opacity: visible ? 1 : 0 }}
      >
        {SIGNALS[index]}
      </span>
    </div>
  );
}

// ── Live UTC clock ───────────────────────────────────────────────────────────

function LiveClock() {
  const [time, setTime] = useState('');

  useEffect(() => {
    function update() {
      const now = new Date();
      const h = String(now.getUTCHours()).padStart(2, '0');
      const m = String(now.getUTCMinutes()).padStart(2, '0');
      const s = String(now.getUTCSeconds()).padStart(2, '0');
      setTime(`${h}:${m}:${s} UTC`);
    }
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return <span className="font-mono text-[10px] text-muted/50 tabular-nums">{time}</span>;
}

// ── Stat row ─────────────────────────────────────────────────────────────────

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
      <span className="text-[10px] font-mono text-muted/60 uppercase tracking-widest">{label}</span>
      <span className="text-xs font-mono text-muted">{value}</span>
    </div>
  );
}

// ── Main Hero ─────────────────────────────────────────────────────────────────

export function Hero() {
  const { openAgent } = useAgent();

  return (
    <section
      className="relative min-h-screen flex items-center pt-20 pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden"
      aria-label="Introduction"
    >
      {/* Subtle dot-grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            'radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
        aria-hidden="true"
      />

      <div className="relative max-w-7xl mx-auto w-full">
        {/* System header bar */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center justify-between mb-10 text-[10px] font-mono text-muted/50"
        >
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/70" />
            <span className="uppercase tracking-widest">SYS ONLINE</span>
          </div>
          <LiveClock />
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-10 lg:gap-14 items-start">
          {/* ── Left column ── */}
          <div className="lg:col-span-3 space-y-7">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
            >
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-highlight leading-tight">
                <span className="block">Rishabh</span>
                <span className="block">Durugkar</span>
              </h1>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.12 }}
              className="space-y-3"
            >
              <h2 className="text-xl sm:text-2xl text-muted font-light tracking-wide">
                Infrastructure · Networking · Security
              </h2>
              <p className="text-base text-text/80 max-w-xl leading-relaxed">
                Reliability, automation, and observability for AI-ready environments.
              </p>
            </motion.div>

            {/* Rotating signal */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <RotatingSignal />
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.28 }}
              className="flex flex-wrap gap-3 pt-2"
            >
              <a
                href="#projects"
                className="glass px-5 py-2.5 rounded-lg text-sm text-highlight hover:bg-surface2 transition-all duration-300 font-medium"
              >
                Explore Projects
              </a>
              <button
                onClick={() => openAgent()}
                className="glass px-5 py-2.5 rounded-lg text-sm text-emerald-400 border border-emerald-500/30 hover:border-emerald-500/60 hover:bg-emerald-500/5 transition-all duration-300 font-medium flex items-center gap-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Open Agent
              </button>
              <Link
                href="/recruiter"
                className="glass px-5 py-2.5 rounded-lg text-sm text-muted hover:text-highlight hover:bg-surface2 transition-all duration-300"
              >
                Recruiter Summary
              </Link>
              <a
                href="/resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="glass px-5 py-2.5 rounded-lg text-sm text-muted hover:text-highlight hover:bg-surface2 transition-all duration-300"
              >
                ↓ Resume
              </a>
            </motion.div>

            {/* ⌘K hint */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-[10px] font-mono text-muted/40"
            >
              Press{' '}
              <kbd className="px-1 py-0.5 rounded border border-white/10 text-muted/50">⌘K</kbd>
              {' '}or{' '}
              <kbd className="px-1 py-0.5 rounded border border-white/10 text-muted/50">Ctrl+K</kbd>
              {' '}to open the command palette
            </motion.p>
          </div>

          {/* ── Right column — System Status Panel ── */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.18 }}
          >
            <div className="glass rounded-xl overflow-hidden border border-white/10">
              {/* Panel header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-mono font-semibold text-muted/70 uppercase tracking-widest">
                    System Status
                  </span>
                </div>
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-white/10" />
                  <span className="w-2 h-2 rounded-full bg-white/10" />
                  <span className="w-2 h-2 rounded-full bg-emerald-500/60" />
                </div>
              </div>

              {/* Rotating signal */}
              <div className="px-4 py-3 border-b border-white/5">
                <RotatingSignal />
              </div>

              {/* Stats */}
              <div className="px-4 py-3 space-y-0">
                <StatRow label="Experience" value="4+ years" />
                <StatRow label="Certifications" value="5 active" />
                <StatRow label="Projects" value="6 deployed" />
                <StatRow label="Cloud" value="AWS · Azure" />
                <StatRow label="Primary Lang" value="Python" />
              </div>

              {/* Ops brief */}
              <div className="px-4 py-3 border-t border-white/10 space-y-3">
                <div>
                  <span className="text-[10px] font-mono text-muted/50 uppercase tracking-widest">Focus</span>
                  <p className="text-text/80 mt-1 text-[11px]">AI-ready infrastructure + network automation</p>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-muted/50 uppercase tracking-widest">Background</span>
                  <p className="text-text/80 mt-1 text-[11px]">Wipro (Security Network Eng) + NDA consulting</p>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-muted/50 uppercase tracking-widest">Status</span>
                  <p className="text-emerald-400/80 mt-1 text-[11px]">Open to full-time opportunities</p>
                </div>
              </div>

              {/* Quick actions */}
              <div className="px-4 py-3 border-t border-white/10 flex gap-2">
                <button
                  onClick={() => openAgent('Summarize for a recruiter')}
                  className="flex-1 text-[10px] font-mono text-muted hover:text-highlight py-1.5 px-2 glass-surface2 rounded transition-colors duration-200"
                >
                  Recruiter Brief
                </button>
                <button
                  onClick={() => openAgent('Show me networking projects')}
                  className="flex-1 text-[10px] font-mono text-muted hover:text-highlight py-1.5 px-2 glass-surface2 rounded transition-colors duration-200"
                >
                  View Projects
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
