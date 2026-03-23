'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAgent } from '@/lib/agent/context';
import { processQuery, suggestedPrompts } from '@/lib/agent';
import { projects } from '@/lib/knowledge';
import type { AgentMessage, AgentResponse } from '@/lib/agent';

// ── Markdown-lite renderer ───────────────────────────────────────────────────
// Handles **bold**, bullet lines (• or -), and blank-line spacing.

function renderContent(text: string) {
  const lines = text.split('\n');
  return lines.map((line, i) => {
    const isBullet = /^[•\-]\s/.test(line);
    const parts = line.split(/(\*\*[^*]+\*\*)/g);

    const renderParts = (rawParts: string[], stripLeadingBullet = false) =>
      rawParts.map((part, j) => {
        const content = stripLeadingBullet && j === 0 ? part.replace(/^[•\-]\s/, '') : part;
        if (content.startsWith('**') && content.endsWith('**')) {
          return (
            <strong key={j} className="text-highlight font-semibold">
              {content.slice(2, -2)}
            </strong>
          );
        }
        return content.replace(/^[•\-]\s/, '');
      });

    if (isBullet) {
      return (
        <div key={i} className="flex gap-1.5 items-start">
          <span className="text-muted mt-0.5 shrink-0 select-none">›</span>
          <span>{renderParts(parts, true)}</span>
        </div>
      );
    }

    if (line === '') return <div key={i} className="h-1.5" />;
    return <div key={i}>{renderParts(parts)}</div>;
  });
}

// ── Navigation CTA ───────────────────────────────────────────────────────────

function NavigationCTA({
  target,
  onNavigate,
}: {
  target: string;
  onNavigate: (t: string) => void;
}) {
  const labels: Record<string, string> = {
    '/recruiter': 'Open Recruiter Mode',
    '/projects': 'View Projects',
    '/': 'Go Home',
    '/timeline': 'View Timeline',
    '/services': 'View Services',
  };

  const cleanLabel = () => {
    if (labels[target]) return labels[target];
    if (target.startsWith('/#')) {
      const section = target.slice(2);
      return `Jump to ${section.charAt(0).toUpperCase() + section.slice(1)}`;
    }
    return `Go to ${target}`;
  };

  return (
    <button
      onClick={() => onNavigate(target)}
      className="mt-2 flex items-center gap-1.5 text-[10px] text-emerald-400 hover:text-emerald-300 transition-colors group"
    >
      <span className="group-hover:translate-x-0.5 transition-transform">→</span>
      <span className="underline underline-offset-2 decoration-emerald-400/40 group-hover:decoration-emerald-300">
        {cleanLabel()}
      </span>
    </button>
  );
}

// ── Highlighted projects strip ───────────────────────────────────────────────

function HighlightedProjects({
  projectIds,
  onSend,
}: {
  projectIds: string[];
  onSend: (text: string) => void;
}) {
  const matched = projectIds
    .map((id) => projects.find((p) => p.id === id))
    .filter(Boolean) as typeof projects;

  if (matched.length === 0) return null;

  return (
    <div className="mt-2 space-y-1.5">
      {matched.map((p) => (
        <div
          key={p.id}
          className="rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-2"
        >
          <div className="text-[10px] font-semibold text-highlight leading-tight">{p.title}</div>
          <div className="flex flex-wrap gap-1 mt-1">
            {p.category.slice(0, 3).map((cat) => (
              <span
                key={cat}
                className="text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/5 text-muted border border-white/10"
              >
                {cat}
              </span>
            ))}
          </div>
          <button
            onClick={() => onSend(`Tell me more about ${p.title}`)}
            className="mt-1.5 text-[9px] text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            Tell me more →
          </button>
        </div>
      ))}
    </div>
  );
}

// ── Message bubble ───────────────────────────────────────────────────────────

function MessageBubble({
  message,
  onNavigate,
  onSend,
}: {
  message: AgentMessage;
  onNavigate: (target: string) => void;
  onSend: (text: string) => void;
}) {
  const isUser = message.role === 'user';
  const resp: AgentResponse | undefined = message.response;

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      {!isUser && (
        <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mr-2 mt-0.5 shrink-0">
          <span className="text-[8px] text-emerald-400 font-bold">A</span>
        </div>
      )}
      <div
        className={`max-w-[85%] rounded-lg px-3 py-2 text-xs leading-relaxed space-y-0.5 ${
          isUser
            ? 'bg-highlight/10 border border-highlight/20 text-highlight'
            : 'glass-surface2 text-text'
        }`}
      >
        {isUser ? (
          <span>{message.content}</span>
        ) : (
          <>
            {renderContent(message.content)}

            {/* Inline project cards for highlighted projects */}
            {resp?.highlightedProjects && resp.highlightedProjects.length > 0 && (
              <HighlightedProjects projectIds={resp.highlightedProjects} onSend={onSend} />
            )}

            {/* Navigation CTA */}
            {resp?.navigationTarget && (
              <NavigationCTA target={resp.navigationTarget} onNavigate={onNavigate} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── Typing indicator ─────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex justify-start mb-3">
      <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mr-2 mt-0.5 shrink-0">
        <span className="text-[8px] text-emerald-400 font-bold">A</span>
      </div>
      <div className="glass-surface2 rounded-lg px-3 py-2">
        <div className="flex gap-1 items-center">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1 h-1 rounded-full bg-muted animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main agent panel ──────────────────────────────────────────────────────────

export function AIAgent() {
  const router = useRouter();
  const {
    isOpen,
    isMinimized,
    openAgent,
    closeAgent,
    minimizeAgent,
    pendingPrompt,
    clearPendingPrompt,
  } = useAgent();

  const [messages, setMessages] = useState<AgentMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        "Hello! I'm Rishabh's portfolio agent. I can answer questions about his experience, projects, certifications, and skills — and adapt my answers for recruiters or engineers.\n\nWhat would you like to explore?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeSuggestions, setActiveSuggestions] = useState<string[]>(
    suggestedPrompts.slice(0, 4),
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const handleSend = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMsg: AgentMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    setActiveSuggestions([]);

    // Simulate realistic async response delay (300–700 ms)
    const delay = 300 + Math.random() * 400;
    await new Promise((r) => setTimeout(r, delay));

    // ── INTEGRATION SEAM ─────────────────────────────────────────────────────
    // To connect a real LLM, replace this call with:
    //   const response = await fetchAgentAPI(trimmed, messages);
    // ─────────────────────────────────────────────────────────────────────────
    const response = processQuery(trimmed);

    const assistantMsg: AgentMessage = {
      id: `a-${Date.now()}`,
      role: 'assistant',
      content: response.message,
      timestamp: new Date(),
      response, // stored for NavigationCTA + HighlightedProjects rendering
    };

    setIsTyping(false);
    setMessages((prev) => [...prev, assistantMsg]);
    setActiveSuggestions(response.suggestedPrompts ?? []);
  }, []);

  const handleNavigate = useCallback(
    (target: string) => {
      router.push(target);
    },
    [router],
  );

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, isMinimized]);

  // Handle a pending prompt injected from outside (Hero CTAs, Command Palette)
  useEffect(() => {
    if (pendingPrompt && isOpen) {
      clearPendingPrompt();
      handleSend(pendingPrompt);
    }
  }, [pendingPrompt, isOpen, clearPendingPrompt, handleSend]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  }

  return (
    <>
      {/* Toggle button — always visible */}
      <motion.button
        onClick={() => (isOpen ? closeAgent() : openAgent())}
        className="fixed bottom-20 right-4 z-50 w-11 h-11 rounded-full glass border border-emerald-500/30 flex items-center justify-center group hover:border-emerald-500/60 transition-all duration-300"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={isOpen ? 'Close portfolio agent' : 'Open portfolio agent'}
        title="Portfolio Agent"
      >
        {isOpen ? (
          <svg
            className="w-4 h-4 text-muted group-hover:text-highlight transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <span className="relative flex items-center justify-center">
            <span className="absolute w-2 h-2 rounded-full bg-emerald-400 animate-ping opacity-60" />
            <svg
              className="w-4.5 h-4.5 text-emerald-400 relative"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </span>
        )}
      </motion.button>

      {/* Agent panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="agent-panel"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={
              isMinimized
                ? { opacity: 1, y: 0, scale: 1, height: 52 }
                : { opacity: 1, y: 0, scale: 1, height: 'auto' }
            }
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed bottom-36 right-4 z-50 w-80 sm:w-96 glass rounded-xl overflow-hidden border border-white/10 shadow-2xl"
            style={{ maxHeight: isMinimized ? 52 : 540 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-mono font-semibold text-highlight tracking-wider">
                  PORTFOLIO AGENT
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={minimizeAgent}
                  className="w-6 h-6 flex items-center justify-center text-muted hover:text-highlight transition-colors rounded"
                  aria-label="Minimize"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                <button
                  onClick={closeAgent}
                  className="w-6 h-6 flex items-center justify-center text-muted hover:text-highlight transition-colors rounded"
                  aria-label="Close"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="overflow-y-auto px-4 py-3" style={{ maxHeight: 320 }}>
                  {messages.map((msg) => (
                    <MessageBubble
                      key={msg.id}
                      message={msg}
                      onNavigate={handleNavigate}
                      onSend={handleSend}
                    />
                  ))}
                  {isTyping && <TypingIndicator />}
                  <div ref={messagesEndRef} />
                </div>

                {/* Suggested prompts */}
                {activeSuggestions.length > 0 && (
                  <div className="px-4 pb-2 flex flex-wrap gap-1.5 border-t border-white/5 pt-2">
                    {activeSuggestions.map((prompt) => (
                      <button
                        key={prompt}
                        onClick={() => handleSend(prompt)}
                        className="text-[10px] px-2 py-1 glass-surface2 rounded text-muted hover:text-highlight hover:border-white/20 transition-all duration-150 border border-transparent"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                )}

                {/* Input */}
                <div className="px-3 pb-3 pt-2 border-t border-white/10">
                  <div className="flex gap-2 items-center glass-surface2 rounded-lg px-3 py-2">
                    <input
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask me anything…"
                      className="flex-1 bg-transparent text-xs text-text placeholder:text-muted/50 outline-none min-w-0"
                      aria-label="Message input"
                    />
                    <button
                      onClick={() => handleSend(input)}
                      disabled={!input.trim() || isTyping}
                      className="text-muted hover:text-highlight disabled:opacity-30 transition-colors shrink-0"
                      aria-label="Send"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
