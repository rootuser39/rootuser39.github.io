export function Skills() {
  const skillGroups = [
    {
      category: 'Infrastructure & Cloud',
      skills: ['AWS', 'Azure', 'Terraform', 'Kubernetes', 'Docker', 'Ansible'],
    },
    {
      category: 'Networking',
      skills: ['Cisco (Routing/Switching)', 'BGP', 'OSPF', 'VLANs', 'VPNs', 'SD-WAN'],
    },
    {
      category: 'Security',
      skills: ['Palo Alto', 'Network Segmentation', 'Zero Trust', 'SIEM', 'IDS/IPS'],
    },
    {
      category: 'Observability',
      skills: ['Prometheus', 'Grafana', 'ELK Stack', 'Datadog', 'OpenTelemetry'],
    },
    {
      category: 'Automation & Scripting',
      skills: ['Python', 'Bash', 'PowerShell', 'Git', 'CI/CD'],
    },
    {
      category: 'AI Infrastructure',
      skills: ['NVIDIA GPUs', 'CUDA', 'Ray', 'High-Speed Networking', 'Storage Optimization'],
    },
  ];

  return (
    <section id="skills" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-highlight mb-8">
          Skills
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skillGroups.map((group, index) => (
            <div key={index} className="glass p-6 rounded-lg space-y-4">
              <h3 className="text-lg font-semibold text-highlight">
                {group.category}
              </h3>
              <div className="flex flex-wrap gap-2">
                {group.skills.map((skill) => (
                  <span
                    key={skill}
                    className="text-sm px-3 py-1 glass-surface2 rounded text-text"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
