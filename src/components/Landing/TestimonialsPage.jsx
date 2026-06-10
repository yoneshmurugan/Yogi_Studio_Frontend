import { useEffect } from 'react';
import TestimonialsSection from './TestimonialsSection';
import ContactFooter from './ContactFooter';

export default function TestimonialsPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="pt-24 bg-zinc-950 min-h-screen flex flex-col">
      <div className="flex-1">
        <TestimonialsSection />
      </div>
      <ContactFooter />
    </div>
  );
}
