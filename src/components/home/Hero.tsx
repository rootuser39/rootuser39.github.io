export function Hero() {
  return (
    <section className="min-h-screen flex items-center pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto w-full">
        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12 items-start">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-3 space-y-6">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-highlight">
              Rishabh Durugkar
            </h1>
            
            <h2 className="text-2xl sm:text-3xl text-muted font-light">
              Infrastructure / Networking / Security
            </h2>
            
            <p className="text-lg text-text max-w-2xl">
              Reliability, automation, and observability for AI-ready environments.
            </p>
            
            <div className="flex flex-wrap gap-4 pt-4">
              <a
                href="#projects"
                className="glass px-6 py-3 rounded-lg text-highlight hover:bg-surface2 transition-all duration-300 font-medium"
              >
                View Projects
              </a>
              <a
                href="/resume.pdf"
                className="glass px-6 py-3 rounded-lg text-muted hover:text-highlight hover:bg-surface2 transition-all duration-300"
              >
                Download Resume
              </a>
            </div>
          </div>

          {/* Right Column - Ops Brief Card */}
          <div className="lg:col-span-2">
            <div className="glass p-6 rounded-lg space-y-4">
              <h3 className="text-xl font-semibold text-highlight">Ops Brief</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-muted font-medium">Focus:</span>
                  <p className="text-text mt-1">
                    AI-ready infrastructure + network automation
                  </p>
                </div>
                <div>
                  <span className="text-muted font-medium">Background:</span>
                  <p className="text-text mt-1">
                    Wipro (Security Network Engineer) + NDA consulting
                  </p>
                </div>
                <div>
                  <span className="text-muted font-medium">Current:</span>
                  <p className="text-text mt-1">
                    CCNP Enterprise/ENAUTO • NVIDIA AI Infrastructure
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
