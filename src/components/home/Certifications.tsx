export function Certifications() {
  const certifications = [
    {
      name: 'NVIDIA AI Infrastructure and Operations',
      issuer: 'NVIDIA',
      date: 'Jan 2026',
      description: 'GPU cluster management, optimization, and AI workload infrastructure',
    },
    {
      name: 'CCNP Enterprise',
      issuer: 'Cisco',
      date: 'Oct 2025',
      description: 'Advanced routing, switching, and troubleshooting',
    },
    {
      name: 'CCNP Enterprise: Core Networking (ENCOR)',
      issuer: 'Cisco',
      date: 'Oct 2025',
      description: 'Enterprise network architecture and core technologies',
    },
    {
      name: 'Automating Cisco Enterprise Solutions (ENAUTO)',
      issuer: 'Cisco',
      date: 'Oct 2025',
      description: 'Network automation, programmability, and orchestration',
    },
    {
      name: 'CCNA',
      issuer: 'Cisco',
      date: 'May 2022',
      description: 'Network fundamentals and Cisco technologies',
    },
  ];

  return (
    <section id="certifications" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-highlight mb-8">
          Certifications
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {certifications.map((cert, index) => (
            <div key={index} className="glass p-6 rounded-lg space-y-2">
              <h3 className="text-lg font-semibold text-highlight">
                {cert.name}
              </h3>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted">{cert.issuer}</span>
                <span className="text-muted">{cert.date}</span>
              </div>
              <p className="text-sm text-text pt-2">{cert.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
