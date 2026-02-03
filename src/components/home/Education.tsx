export function Education() {
  const education = [
    {
      degree: 'Bachelor of Engineering in Computer Science',
      institution: 'University Name',
      period: '2017 - 2021',
      highlights: [
        'Focus on Computer Networks and Distributed Systems',
        'Relevant coursework in Network Security and Cloud Computing',
      ],
    },
  ];

  return (
    <section id="education" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-highlight mb-8">
          Education
        </h2>
        <div className="space-y-6">
          {education.map((edu, index) => (
            <div key={index} className="glass p-6 rounded-lg">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3">
                <div>
                  <h3 className="text-xl font-semibold text-highlight">
                    {edu.degree}
                  </h3>
                  <p className="text-muted">{edu.institution}</p>
                </div>
                <span className="text-sm text-muted mt-2 sm:mt-0">
                  {edu.period}
                </span>
              </div>
              <ul className="space-y-2">
                {edu.highlights.map((highlight, idx) => (
                  <li key={idx} className="text-text text-sm flex items-start">
                    <span className="text-muted mr-2">•</span>
                    <span>{highlight}</span>
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
