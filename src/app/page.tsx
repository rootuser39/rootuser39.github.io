import { getProjects } from '@/lib/data';
import { Hero } from '@/components/home/Hero';
import { About } from '@/components/home/About';
import { Experience } from '@/components/home/Experience';
import { Projects } from '@/components/home/Projects';
import { Education } from '@/components/home/Education';
import { Certifications } from '@/components/home/Certifications';
import { Skills } from '@/components/home/Skills';
import { Contact } from '@/components/home/Contact';

export default async function Home() {
  const projects = await getProjects();
  
  return (
    <>
      <Hero />
      <About />
      <Experience />
      <Projects projects={projects.slice(0, 6)} />
      <Education />
      <Certifications />
      <Skills />
      <Contact />
    </>
  );
}
