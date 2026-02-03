export function About() {
  return (
    <section id="about" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-highlight mb-8">
          About
        </h2>
        <div className="glass p-8 rounded-lg space-y-4 text-text">
          <p>
            I design, build, and operate infrastructure systems that handle real production load. 
            My work focuses on reliability engineering, network automation, and security validation 
            for hybrid cloud and AI-ready environments.
          </p>
          <p>
            I believe in treating infrastructure as code, observability as a first-class concern, 
            and automation as a reliability multiplier. Every system I build includes monitoring, 
            alerting, and runbooks from day one.
          </p>
          <p>
            Currently exploring AI infrastructure challenges—GPU cluster optimization, 
            high-speed networking for distributed training, and observability tooling 
            for machine learning workloads.
          </p>
        </div>
      </div>
    </section>
  );
}
