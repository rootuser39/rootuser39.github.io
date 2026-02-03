export function Experience() {
  const experiences = [
    {
      title: 'Independent Infrastructure Consultant',
      company: 'NDA Projects',
      period: 'Dec 2025 - Present',
      responsibilities: [
        'Infrastructure architecture design and optimization for enterprise clients',
        'Network automation and configuration management implementation',
        'Observability stack deployment and custom dashboard development',
        'Security validation and incident response automation',
      ],
    },
    {
      title: 'Security Network Engineer',
      company: 'Wipro Limited',
      period: 'Jun 2024 - Nov 2025',
      responsibilities: [
        'Managed enterprise network security infrastructure including firewalls and segmentation',
        'Led incident response efforts for network security events',
        'Implemented network automation pipelines for configuration management',
        'Developed monitoring and alerting solutions for network infrastructure',
      ],
    },
  ];

  return (
    <section id="experience" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-highlight mb-8">
          Experience
        </h2>
        <div className="space-y-8">
          {experiences.map((exp, index) => (
            <div key={index} className="glass p-6 rounded-lg">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-highlight">
                    {exp.title}
                  </h3>
                  <p className="text-muted">{exp.company}</p>
                </div>
                <span className="text-sm text-muted mt-2 sm:mt-0">
                  {exp.period}
                </span>
              </div>
              <ul className="space-y-2">
                {exp.responsibilities.map((resp, idx) => (
                  <li key={idx} className="text-text text-sm flex items-start">
                    <span className="text-muted mr-2">•</span>
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
