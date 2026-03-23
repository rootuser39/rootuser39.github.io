'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Channel {
  id: string;
  label: string;
  handle: string;
  href: string;
  icon: React.ReactNode;
  type: 'external' | 'mail' | 'download';
}

const channels: Channel[] = [
  {
    id: 'github',
    label: 'GitHub',
    handle: 'rootuser39',
    href: 'https://github.com/rootuser39',
    type: 'external',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    handle: 'rishabh-durugkar',
    href: 'https://linkedin.com/in/rishabh-durugkar',
    type: 'external',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    id: 'email',
    label: 'Email',
    handle: 'On resume',
    href: '/resume.pdf',
    type: 'download',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: 'resume',
    label: 'Resume',
    handle: 'PDF download',
    href: '/resume.pdf',
    type: 'download',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
  },
];

function ChannelCard({
  channel,
  selected,
  onSelect,
}: {
  channel: Channel;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left glass-surface2 rounded-lg p-4 border transition-all duration-200 ${
        selected
          ? 'border-emerald-500/40 bg-emerald-500/5'
          : 'border-transparent hover:border-white/10'
      }`}
    >
      <div className="flex items-start gap-3">
        <span className={`mt-0.5 transition-colors ${selected ? 'text-emerald-400' : 'text-muted'}`}>
          {channel.icon}
        </span>
        <div>
          <div className={`text-sm font-medium transition-colors ${selected ? 'text-highlight' : 'text-text'}`}>
            {channel.label}
          </div>
          <div className="text-xs text-muted font-mono mt-0.5">{channel.handle}</div>
        </div>
        {selected && (
          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 animate-pulse" />
        )}
      </div>
    </button>
  );
}

export function Contact() {
  const [selected, setSelected] = useState<string | null>(null);
  const [transmitted, setTransmitted] = useState(false);

  const selectedChannel = channels.find((c) => c.id === selected);

  function handleInitiate() {
    if (!selectedChannel) return;
    setTransmitted(true);
    setTimeout(() => {
      setTransmitted(false);
      setSelected(null);
      if (selectedChannel.type === 'external') {
        window.open(selectedChannel.href, '_blank', 'noopener,noreferrer');
      } else {
        window.open(selectedChannel.href, '_blank');
      }
    }, 800);
  }

  return (
    <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-mono text-muted/50 uppercase tracking-widest">Mission Control</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-highlight mb-2">Contact</h2>
        <p className="text-muted text-sm mb-8">Select a channel and initiate contact.</p>

        <div className="glass rounded-xl overflow-hidden border border-white/10">
          {/* Terminal header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
            <span className="text-[10px] font-mono text-muted/50 uppercase tracking-widest">
              Comms · Select Channel
            </span>
            <div className="flex gap-1">
              <span className="w-2 h-2 rounded-full bg-white/10" />
              <span className="w-2 h-2 rounded-full bg-white/10" />
              <span className="w-2 h-2 rounded-full bg-emerald-500/60" />
            </div>
          </div>

          <div className="p-5 space-y-5">
            {/* Channel grid */}
            <div className="grid sm:grid-cols-2 gap-3">
              {channels.map((ch) => (
                <ChannelCard
                  key={ch.id}
                  channel={ch}
                  selected={selected === ch.id}
                  onSelect={() => setSelected(selected === ch.id ? null : ch.id)}
                />
              ))}
            </div>

            {/* Initiate panel */}
            <AnimatePresence>
              {selected && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="glass-surface2 rounded-lg p-4 flex items-center justify-between gap-4 border border-white/5">
                    <div className="flex items-center gap-2 text-xs font-mono text-muted">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>
                        Channel selected:{' '}
                        <span className="text-highlight">{selectedChannel?.label}</span>
                      </span>
                    </div>
                    <button
                      onClick={handleInitiate}
                      disabled={transmitted}
                      className="shrink-0 px-4 py-2 rounded-lg text-xs font-mono font-medium border transition-all duration-200 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 disabled:opacity-50"
                    >
                      {transmitted ? 'Initiating…' : 'Initiate →'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Direct links fallback */}
            <p className="text-[10px] font-mono text-muted/40 text-center">
              Or reach out directly via LinkedIn or GitHub
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
