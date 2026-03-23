'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface AgentContextValue {
  isOpen: boolean;
  isMinimized: boolean;
  openAgent: (initialPrompt?: string) => void;
  closeAgent: () => void;
  toggleAgent: () => void;
  minimizeAgent: () => void;
  pendingPrompt: string | null;
  clearPendingPrompt: () => void;
}

const AgentContext = createContext<AgentContextValue | null>(null);

export function AgentProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);

  const openAgent = useCallback((initialPrompt?: string) => {
    if (initialPrompt) setPendingPrompt(initialPrompt);
    setIsOpen(true);
    setIsMinimized(false);
  }, []);

  const closeAgent = useCallback(() => {
    setIsOpen(false);
    setIsMinimized(false);
  }, []);

  const toggleAgent = useCallback(() => {
    setIsOpen((prev) => {
      if (!prev) setIsMinimized(false);
      return !prev;
    });
  }, []);

  const minimizeAgent = useCallback(() => {
    setIsMinimized(true);
  }, []);

  const clearPendingPrompt = useCallback(() => {
    setPendingPrompt(null);
  }, []);

  return (
    <AgentContext.Provider
      value={{ isOpen, isMinimized, openAgent, closeAgent, toggleAgent, minimizeAgent, pendingPrompt, clearPendingPrompt }}
    >
      {children}
    </AgentContext.Provider>
  );
}

export function useAgent() {
  const ctx = useContext(AgentContext);
  if (!ctx) throw new Error('useAgent must be used inside AgentProvider');
  return ctx;
}
