import { ReactNode } from 'react';

interface SectionProps {
  children: ReactNode;
}

export const Section = ({ children }: SectionProps) => {
  return (
    <section className="rounded-lg border border-border/60 bg-white p-8 shadow-lg transition-colors duration-200 dark:border-zinc-700 dark:bg-zinc-800 night:border-[#2d4a48] night:bg-[#111f2c]/95 night:shadow-black/35">
      {children}
    </section>
  );
};
