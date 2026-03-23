import Link from 'next/link';
import { bio, projects, certifications, experience, recruiterHighlights } from '@/lib/knowledge';

export const metadata = {
  title: 'Recruiter Summary | Rishabh Durugkar',
  description: '30-second recruiter summary for Rishabh Durugkar — infrastructure, networking, and security engineer.',
};

const featuredProjectIds = ['1', '2', '3'];

function StatBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-surface2 rounded-lg px-4 py-3 text-center">
      <div className="text-2xl font-bold text-highlight">{value}</div>
      <div className="text-xs text-muted mt-1">{label}</div>
    </div>
  );
}

export default function RecruiterPage() {
  const featured = projects.filter((p) => featuredProjectIds.includes(p.id));

  return (
    <main className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-10">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-mono text-muted/50 uppercase tracking-widest">
              Recruiter Mode · Quick Scan Optimized
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-highlight">{bio.name}</h1>
          <p className="text-lg text-muted mt-2 font-light">{bio.tagline}</p>
        </div>

        {/* 30-second summary */}
        <div className="glass rounded-xl p-6 border border-white/10">
          <h2 className="text-xs font-mono text-muted/60 uppercase tracking-widest mb-3">30-Second Summary</h2>
          <p className="text-text/90 leading-relaxed">{bio.recruiterSummary}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatBadge label="Years Experience" value="4+" />
          <StatBadge label="Certifications" value={String(certifications.length)} />
          <StatBadge label="Featured Projects" value={String(projects.length)} />
          <StatBadge label="Availability" value="Open" />
        </div>

        {/* Key strengths */}
        <div className="glass rounded-xl p-6 border border-white/10">
          <h2 className="text-xs font-mono text-muted/60 uppercase tracking-widest mb-4">Key Strengths</h2>
          <ul className="space-y-2">
            {recruiterHighlights.map((h) => (
              <li key={h} className="flex items-start gap-2 text-sm text-text/80">
                <span className="text-emerald-400 mt-1 shrink-0">›</span>
                {h}
              </li>
            ))}
          </ul>
        </div>

        {/* Recent experience */}
        <div className="glass rounded-xl p-6 border border-white/10">
          <h2 className="text-xs font-mono text-muted/60 uppercase tracking-widest mb-4">Experience</h2>
          <div className="space-y-4">
            {experience.map((e) => (
              <div key={e.role} className="border-l border-white/10 pl-4">
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="text-sm font-semibold text-highlight">{e.role}</span>
                  <span className="text-xs text-muted">@ {e.company}</span>
                  <span className="text-xs text-muted/50 font-mono">{e.duration}</span>
                </div>
                <p className="text-xs text-muted mt-1">{e.recruiterNote}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Selected projects */}
        <div>
          <h2 className="text-xs font-mono text-muted/60 uppercase tracking-widest mb-4">Selected Projects</h2>
          <div className="space-y-3">
            {featured.map((p) => (
              <div key={p.id} className="glass rounded-xl p-5 border border-white/10">
                <div className="flex flex-wrap items-baseline gap-2 mb-2">
                  <h3 className="text-sm font-semibold text-highlight">{p.title}</h3>
                  <div className="flex gap-1 flex-wrap">
                    {p.category.map((c) => (
                      <span key={c} className="text-[10px] px-2 py-0.5 glass-surface2 rounded text-muted">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-text/80 leading-relaxed">{p.recruiterSummary}</p>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {p.tools.slice(0, 5).map((t) => (
                    <span key={t} className="text-[10px] px-2 py-0.5 glass-surface2 rounded text-muted">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <Link
            href="/projects"
            className="inline-block mt-4 text-xs text-muted hover:text-highlight transition-colors"
          >
            View all {projects.length} projects →
          </Link>
        </div>

        {/* Certifications */}
        <div className="glass rounded-xl p-6 border border-white/10">
          <h2 className="text-xs font-mono text-muted/60 uppercase tracking-widest mb-4">Certifications</h2>
          <div className="space-y-2">
            {certifications.map((c) => (
              <div key={c.name} className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-sm text-text">{c.name}</span>
                  <span className="text-xs text-muted ml-2">({c.issuer})</span>
                </div>
                <span className="text-xs font-mono text-muted/60 shrink-0">{c.year}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Contact CTA */}
        <div className="glass rounded-xl p-6 border border-emerald-500/20 text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono text-emerald-400/80 uppercase tracking-widest">
              Open to Opportunities
            </span>
          </div>
          <h3 className="text-xl font-semibold text-highlight">Ready to connect?</h3>
          <p className="text-sm text-muted">
            Infrastructure, networking, DevOps, or AI infrastructure roles.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a
              href="https://linkedin.com/in/rishabh-durugkar"
              target="_blank"
              rel="noopener noreferrer"
              className="glass px-5 py-2.5 rounded-lg text-sm text-highlight hover:bg-surface2 transition-all duration-300 font-medium"
            >
              LinkedIn →
            </a>
            <a
              href="https://github.com/rootuser39"
              target="_blank"
              rel="noopener noreferrer"
              className="glass px-5 py-2.5 rounded-lg text-sm text-muted hover:text-highlight hover:bg-surface2 transition-all duration-300"
            >
              GitHub
            </a>
            <a
              href="/resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="glass px-5 py-2.5 rounded-lg text-sm text-muted hover:text-highlight hover:bg-surface2 transition-all duration-300"
            >
              ↓ Resume
            </a>
          </div>
        </div>

        {/* Back link */}
        <div className="text-center">
          <Link href="/" className="text-xs text-muted/50 hover:text-muted transition-colors font-mono">
            ← Back to full portfolio
          </Link>
        </div>
      </div>
    </main>
  );
}
