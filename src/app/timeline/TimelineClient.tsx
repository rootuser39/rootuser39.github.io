'use client';

import { useState, useMemo, useEffect } from 'react';
import { type TimelineEntry } from '@/types';

export function TimelineClient({ initialEntries }: { initialEntries: TimelineEntry[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [focusMode, setFocusMode] = useState(false);
  const [systemLog, setSystemLog] = useState<string[]>([
    '[SYSTEM] Timeline console initialized',
  ]);

  useEffect(() => {
    if (focusMode) {
      document.body.style.setProperty('--bg', '#030405');
    } else {
      document.body.style.removeProperty('--bg');
    }
  }, [focusMode]);

  const addLogEntry = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setSystemLog(prev => [...prev.slice(-9), `[${timestamp}] ${message}`]);
  };

  const filteredEntries = useMemo(() => {
    if (!searchQuery) return initialEntries;
    const query = searchQuery.toLowerCase();
    return initialEntries.filter(
      entry =>
        entry.title.toLowerCase().includes(query) ||
        entry.description.toLowerCase().includes(query) ||
        entry.company?.toLowerCase().includes(query)
    );
  }, [initialEntries, searchQuery]);

  const groupedEntries = useMemo(() => {
    const groups: Record<number, TimelineEntry[]> = {};
    filteredEntries.forEach(entry => {
      if (!groups[entry.year]) {
        groups[entry.year] = [];
      }
      groups[entry.year].push(entry);
    });
    return groups;
  }, [filteredEntries]);

  const years = Object.keys(groupedEntries)
    .map(Number)
    .sort((a, b) => b - a);

  const toggleEntry = (id: string) => {
    setExpandedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
        addLogEntry(`Collapsed: ${initialEntries.find(e => e.id === id)?.title}`);
      } else {
        newSet.add(id);
        addLogEntry(`Expanded: ${initialEntries.find(e => e.id === id)?.title}`);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    setExpandedIds(new Set(filteredEntries.map(e => e.id)));
    addLogEntry('Expanded all entries');
  };

  const collapseAll = () => {
    setExpandedIds(new Set());
    addLogEntry('Collapsed all entries');
  };

  const jumpToYear = (year: number) => {
    const element = document.getElementById(`year-${year}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      addLogEntry(`Jumped to year ${year}`);
    }
  };

  const toggleFocusMode = () => {
    setFocusMode(prev => {
      const newValue = !prev;
      addLogEntry(newValue ? 'Focus mode enabled' : 'Focus mode disabled');
      return newValue;
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'work':
        return 'text-blue-400';
      case 'education':
        return 'text-green-400';
      case 'certification':
        return 'text-yellow-400';
      case 'project':
        return 'text-purple-400';
      default:
        return 'text-muted';
    }
  };

  return (
    <div className={`min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 transition-all duration-300 ${focusMode ? 'opacity-95' : ''}`}>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-bold text-highlight mb-12">
          Timeline Console
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Panel - Controls */}
          <div className="lg:col-span-1 space-y-6">
            {/* Search */}
            <div className="glass p-4 rounded-lg">
              <label className="text-sm font-semibold text-muted uppercase mb-2 block">
                Filter Search
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value) {
                    addLogEntry(`Searching: ${e.target.value}`);
                  }
                }}
                placeholder="Search timeline..."
                className="w-full bg-surface border border-border rounded px-3 py-2 text-text text-sm focus:outline-none focus:border-highlight transition-colors"
              />
            </div>

            {/* Jump to Year */}
            <div className="glass p-4 rounded-lg">
              <h3 className="text-sm font-semibold text-muted uppercase mb-3">
                Jump to Year
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {years.map(year => (
                  <button
                    key={year}
                    onClick={() => jumpToYear(year)}
                    className="glass-surface2 px-3 py-2 rounded text-sm text-muted hover:text-highlight hover:bg-surface transition-all"
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>

            {/* Controls */}
            <div className="glass p-4 rounded-lg space-y-3">
              <h3 className="text-sm font-semibold text-muted uppercase mb-3">
                Controls
              </h3>
              <button
                onClick={expandAll}
                className="w-full glass-surface2 px-4 py-2 rounded text-sm text-muted hover:text-highlight hover:bg-surface transition-all"
              >
                Expand All
              </button>
              <button
                onClick={collapseAll}
                className="w-full glass-surface2 px-4 py-2 rounded text-sm text-muted hover:text-highlight hover:bg-surface transition-all"
              >
                Collapse All
              </button>
              <button
                onClick={toggleFocusMode}
                className={`w-full px-4 py-2 rounded text-sm transition-all ${
                  focusMode
                    ? 'bg-highlight text-bg font-medium'
                    : 'glass-surface2 text-muted hover:text-highlight hover:bg-surface'
                }`}
              >
                Focus Mode {focusMode ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* System Log */}
            <div className="glass p-4 rounded-lg">
              <h3 className="text-sm font-semibold text-muted uppercase mb-3">
                System Log
              </h3>
              <div className="space-y-1 text-xs font-mono">
                {systemLog.map((log, idx) => (
                  <div key={idx} className="text-muted">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel - Timeline */}
          <div className="lg:col-span-2 space-y-8">
            {years.map(year => (
              <div key={year} id={`year-${year}`}>
                <h2 className="text-2xl font-bold text-highlight mb-4 sticky top-20 bg-bg/80 backdrop-blur-sm py-2 z-10">
                  {year}
                </h2>
                <div className="space-y-4">
                  {groupedEntries[year].map(entry => (
                    <div key={entry.id} className="glass rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleEntry(entry.id)}
                        className="w-full p-4 text-left hover:bg-surface2 transition-all"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <span className={`text-xs font-mono uppercase ${getTypeColor(entry.type)}`}>
                                {entry.type}
                              </span>
                              <span className="text-xs text-muted">{entry.month}</span>
                            </div>
                            <h3 className="text-lg font-semibold text-highlight">
                              {entry.title}
                            </h3>
                            {entry.company && (
                              <p className="text-sm text-muted mt-1">{entry.company}</p>
                            )}
                          </div>
                          <svg
                            className={`w-5 h-5 text-muted transition-transform ${
                              expandedIds.has(entry.id) ? 'rotate-180' : ''
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>
                      </button>
                      
                      {expandedIds.has(entry.id) && (
                        <div className="px-4 pb-4 pt-2 border-t border-border">
                          <p className="text-sm text-text">{entry.description}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {filteredEntries.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted">No timeline entries match your search.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
