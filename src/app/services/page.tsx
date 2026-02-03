import { getServices } from '@/lib/data';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Services | Rishabh Durugkar',
  description: 'Infrastructure reliability, network automation, security validation, and AI infrastructure consulting services',
};

export default async function ServicesPage() {
  const services = await getServices();
  
  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-bold text-highlight mb-4">
          Services
        </h1>
        <p className="text-muted mb-12 max-w-2xl">
          Specialized consulting in infrastructure reliability, network automation, 
          security validation, and AI-ready infrastructure.
        </p>
        
        <div className="grid md:grid-cols-2 gap-8">
          {services.map((service) => (
            <div key={service.id} className="glass p-8 rounded-lg space-y-6">
              <h2 className="text-2xl font-semibold text-highlight">
                {service.title}
              </h2>
              
              <div>
                <h3 className="text-sm font-semibold text-muted uppercase mb-3">
                  What You Get
                </h3>
                <ul className="space-y-2">
                  {service.whatYouGet.map((item, idx) => (
                    <li key={idx} className="text-sm text-text flex items-start">
                      <span className="text-highlight mr-2">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold text-muted uppercase mb-2">
                  Typical Deliverable
                </h3>
                <p className="text-sm text-text">{service.deliverable}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold text-muted uppercase mb-2">
                  Tooling
                </h3>
                <div className="flex flex-wrap gap-2">
                  {service.tooling.map((tool) => (
                    <span
                      key={tool}
                      className="text-xs px-2 py-1 glass-surface2 rounded text-muted"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
              
              <a
                href="mailto:your.email@example.com"
                className="inline-block glass-surface2 px-6 py-3 rounded-lg text-highlight hover:bg-surface transition-all duration-300 text-sm font-medium"
              >
                Discuss This Service →
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
