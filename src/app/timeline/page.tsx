import { getTimelineEntries } from '@/lib/data';
import { TimelineClient } from './TimelineClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Timeline | Rishabh Durugkar',
  description: 'Professional timeline with work experience, education, certifications, and projects',
};

export default async function TimelinePage() {
  const entries = await getTimelineEntries();
  
  return <TimelineClient initialEntries={entries} />;
}
