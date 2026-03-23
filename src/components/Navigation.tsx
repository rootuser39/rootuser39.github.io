'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAgent } from '@/lib/agent/context';

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === '/';
  const { openAgent } = useAgent();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: isHome ? '#about' : '/#about', label: 'About' },
    { href: isHome ? '#experience' : '/#experience', label: 'Experience' },
    { href: isHome ? '#projects' : '/#projects', label: 'Projects' },
    { href: isHome ? '#certifications' : '/#certifications', label: 'Certs' },
    { href: isHome ? '#skills' : '/#skills', label: 'Skills' },
    { href: isHome ? '#contact' : '/#contact', label: 'Contact' },
    { href: '/services', label: 'Services' },
    { href: '/timeline', label: 'Timeline' },
    { href: '/recruiter', label: 'Recruiter' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass py-3' : 'bg-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="text-lg font-semibold text-highlight hover:text-white transition-colors"
          >
            RD
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm transition-colors ${
                  link.href === '/recruiter'
                    ? 'text-emerald-400/70 hover:text-emerald-400'
                    : 'text-muted hover:text-highlight'
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* ⌘K button */}
            <button
              onClick={() => {
                // Dispatch keyboard event to open palette
                window.dispatchEvent(
                  new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true })
                );
              }}
              className="flex items-center gap-1.5 text-xs text-muted/50 hover:text-muted transition-colors border border-white/10 rounded px-2 py-1 font-mono"
              title="Open command palette"
              aria-label="Open command palette (⌘K)"
            >
              <span>⌘K</span>
            </button>

            {/* Agent button */}
            <button
              onClick={() => openAgent()}
              className="flex items-center gap-1.5 text-xs text-emerald-400/70 hover:text-emerald-400 transition-colors border border-emerald-500/20 hover:border-emerald-500/40 rounded px-2.5 py-1"
              aria-label="Open portfolio agent"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Agent
            </button>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 text-muted hover:text-highlight transition-colors"
            aria-label="Toggle menu"
            aria-expanded={isOpen}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden mt-4 glass-surface2 rounded-lg p-4">
            <div className="flex flex-col space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm transition-colors py-2 ${
                    link.href === '/recruiter'
                      ? 'text-emerald-400/70 hover:text-emerald-400'
                      : 'text-muted hover:text-highlight'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <button
                onClick={() => { setIsOpen(false); openAgent(); }}
                className="text-left text-sm text-emerald-400/70 hover:text-emerald-400 transition-colors py-2 flex items-center gap-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Open Agent
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
